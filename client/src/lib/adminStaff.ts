import { supabase } from '@/lib/supabase';
import { logAuditAction } from '@/lib/auditLog';

// Backs the Admin Staff Management page. Staff/admin accounts are just
// profiles with role='staff'|'admin' -- there's no separate staff table.
// "Add Staff" can only promote an EXISTING PartyUp account (looked up by
// email) to staff/admin: creating a brand-new auth user requires the
// Supabase Admin API (service role), which isn't available from the
// browser. "Remove staff" doesn't delete the account -- it revokes the
// role back to 'traveler', since a hard delete would cascade across their
// trips/messages/etc. and there's no undo.

export type StaffRole = 'staff' | 'admin';

export interface StaffRow {
  id: string;
  display_name: string;
  email: string | null;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  resolved_count: number;
}

export async function listStaff(search?: string) {
  let query = supabase
    .from('profiles')
    .select('id, display_name, email, role, is_active, created_at')
    .in('role', ['staff', 'admin'])
    .order('created_at', { ascending: false });

  const trimmed = search?.trim();
  if (trimmed) {
    query = query.or(`display_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`);
  }

  const { data: staff, error } = await query;
  if (error || !staff) return { data: [] as StaffRow[], error };

  const ids = staff.map((row) => row.id);
  const resolvedCounts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: resolvedReports } = await supabase
      .from('reports')
      .select('reviewed_by')
      .eq('status', 'resolved')
      .in('reviewed_by', ids);
    (resolvedReports ?? []).forEach((row: { reviewed_by: string | null }) => {
      if (!row.reviewed_by) return;
      resolvedCounts.set(row.reviewed_by, (resolvedCounts.get(row.reviewed_by) ?? 0) + 1);
    });
  }

  return {
    data: staff.map((row) => ({ ...row, resolved_count: resolvedCounts.get(row.id) ?? 0 })) as StaffRow[],
    error: null,
  };
}

export async function promoteToStaff(email: string, role: StaffRole) {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return { error: new Error('Enter an email address.') };

  const { data: existing, error: lookupError } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .ilike('email', trimmedEmail)
    .maybeSingle();

  if (lookupError) return { error: lookupError };
  if (!existing) {
    return { error: new Error('No PartyUp account found with that email. They need to sign up first, then you can promote them here.') };
  }
  if (existing.role === 'staff' || existing.role === 'admin') {
    return { error: new Error(`${existing.display_name} is already ${existing.role}.`) };
  }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', existing.id);
  if (!error) {
    logAuditAction(`Promoted to ${role}`, 'staff_profile', existing.id, { previous_role: existing.role });
  }
  return { error };
}

export async function updateStaffMember(userId: string, updates: { role?: StaffRole | 'traveler'; isActive?: boolean }) {
  const patch: Record<string, unknown> = {};
  if (updates.role) patch.role = updates.role;
  if (updates.isActive !== undefined) patch.is_active = updates.isActive;

  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (!error) {
    if (updates.role) {
      logAuditAction(updates.role === 'traveler' ? 'Revoked staff access' : `Changed role to ${updates.role}`, 'staff_profile', userId);
    }
    if (updates.isActive !== undefined) {
      logAuditAction(updates.isActive ? 'Reactivated staff account' : 'Deactivated staff account', 'staff_profile', userId);
    }
  }
  return { error };
}
