import { supabase } from '@/lib/supabase';
import { logAuditAction } from '@/lib/auditLog';

// Backs the Admin Staff Management page. Staff/admin accounts are just
// profiles with role='guild_leader'|'admin' -- there's no separate staff table.
// "Add Staff" can only promote an EXISTING PartyUp account (looked up by
// email) to staff/admin: creating a brand-new auth user requires the
// Supabase Admin API (service role), which isn't available from the
// browser. "Remove staff" doesn't delete the account -- it revokes the
// role back to 'traveler', since a hard delete would cascade across their
// trips/messages/etc. and there's no undo.

export type StaffRole = 'guild_leader' | 'admin';

export interface StaffRow {
  id: string;
  display_name: string;
  email: string | null;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  resolved_count: number;
  // Guild Leaders only: the guild they lead, if founded yet.
  guild_id: string | null;
  guild_name: string | null;
  member_count: number;
}

// Guild Leaders and admins are managed on separate pages, so callers pick one role.
export async function listStaff(roles: StaffRole[] = ['guild_leader', 'admin'], search?: string) {
  let query = supabase
    .from('profiles')
    .select('id, display_name, email, role, is_active, created_at')
    .in('role', roles)
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

  const guilds = new Map<string, { id: string; name: string; members: number }>();
  if (ids.length > 0) {
    const { data: led } = await supabase.from('guilds').select('id, name, leader_id').in('leader_id', ids);
    const guildIds = (led ?? []).map((row: { id: string }) => row.id);
    const { data: members } = guildIds.length
      ? await supabase.from('guild_members').select('guild_id').in('guild_id', guildIds)
      : { data: [] as { guild_id: string }[] };
    (led ?? []).forEach((row: { id: string; name: string; leader_id: string }) => {
      guilds.set(row.leader_id, {
        id: row.id,
        name: row.name,
        members: (members ?? []).filter((member: { guild_id: string }) => member.guild_id === row.id).length,
      });
    });
  }

  return {
    data: staff.map((row) => ({
      ...row,
      resolved_count: resolvedCounts.get(row.id) ?? 0,
      guild_id: guilds.get(row.id)?.id ?? null,
      guild_name: guilds.get(row.id)?.name ?? null,
      member_count: guilds.get(row.id)?.members ?? 0,
    })) as StaffRow[],
    error: null,
  };
}

async function findProfileByEmail(email: string) {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return { profile: null, error: new Error('Enter an email address.') };
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .ilike('email', trimmedEmail)
    .maybeSingle();
  if (error) return { profile: null, error };
  if (!data) {
    return { profile: null, error: new Error('No PartyUp account found with that email. They need to sign up first.') };
  }
  return { profile: data as { id: string; display_name: string; role: string }, error: null };
}

export interface LeaderGuildMember {
  guild_id: string;
  guild_name: string;
  user_id: string;
  display_name: string;
  lifetime_points: number;
}

// Members who could take over a leader's guild (most points first).
export async function listLeaderGuildMembers(leaderId: string) {
  const { data, error } = await supabase.rpc('get_leader_guild_members', { p_leader_id: leaderId });
  return {
    data: ((data ?? []) as LeaderGuildMember[]).map((row) => ({ ...row, lifetime_points: Number(row.lifetime_points ?? 0) })),
    error,
  };
}

// Revoke a Guild Leader. If they lead a guild, it goes to `successorId` or is
// disbanded; the database refuses to leave a guild without a leader.
export async function revokeGuildLeader(userId: string, options: { successorId?: string | null; disband?: boolean } = {}) {
  const { error } = await supabase.rpc('revoke_guild_leader', {
    p_user_id: userId,
    p_successor_id: options.successorId ?? null,
    p_disband: options.disband ?? false,
  });
  return { error };
}

// Admins are added deliberately: the caller confirms the email twice. The
// database also removes them from any guild (admins don't play).
export async function grantAdmin(email: string) {
  const { profile, error } = await findProfileByEmail(email);
  if (error || !profile) return { error, name: null };
  if (profile.role === 'admin') return { error: new Error(`${profile.display_name} is already an admin.`), name: null };
  const { error: rpcError } = await supabase.rpc('set_admin_role', { p_user_id: profile.id, p_admin: true });
  return { error: rpcError, name: profile.display_name };
}

// Refused for yourself and for the last admin.
export async function removeAdmin(userId: string) {
  const { error } = await supabase.rpc('set_admin_role', { p_user_id: userId, p_admin: false });
  return { error };
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
  if (existing.role === 'guild_leader' || existing.role === 'admin') {
    return { error: new Error(`${existing.display_name} is already ${existing.role === 'guild_leader' ? 'a Guild Leader' : 'an admin'}.`) };
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
      logAuditAction(updates.role === 'traveler' ? 'Revoked Guild Leader access' : `Changed role to ${updates.role}`, 'staff_profile', userId);
    }
    if (updates.isActive !== undefined) {
      logAuditAction(updates.isActive ? 'Reactivated Guild Leader account' : 'Deactivated Guild Leader account', 'staff_profile', userId);
    }
  }
  return { error };
}
