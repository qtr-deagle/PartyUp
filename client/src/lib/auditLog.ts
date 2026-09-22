import { supabase } from '@/lib/supabase';

// Backs the Admin Audit Log page. The audit_logs table (see
// supabase/migrations/202608080001_partyup_initial_schema.sql in
// partyup-mobile) already has staff/admin-gated select+insert RLS, but
// nothing wrote to it before this -- logAuditAction() is called from the
// existing real staff/admin write actions (report status updates, vehicle
// and ID verification review, SOS resolution) right after they succeed.

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor: { display_name: string } | null;
}

const SELECT_COLUMNS = '*, actor:profiles!audit_logs_actor_id_fkey(display_name)';

export async function listAuditLogs(limit = 200) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: (data ?? []) as unknown as AuditLogRow[], error };
}

// Fire-and-forget by design: a hiccup writing the audit trail should never
// block or fail the staff/admin action that triggered it, so callers don't
// await this or handle its result.
export function logAuditAction(action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>) {
  void (async () => {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('audit_logs').insert({
      actor_id: userData.user?.id ?? null,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata: metadata ?? {},
    });
    if (error) console.error('[auditLog] failed to record action:', error.message);
  })();
}
