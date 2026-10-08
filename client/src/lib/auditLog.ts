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
  // From audit_logs_view (partyup-mobile migrations 202610070004, 202610090004):
  // the admin's name (kept even after their account is deleted; 'Deleted admin'
  // for older entries) and severity as 3/2/1. The view is the one place the
  // severity rules live.
  actor_name: string;
  severity_rank: 1 | 2 | 3;
}

// Reads go through the view so the admin's name and severity can be sorted
// and filtered in the query. Inserts still go to the audit_logs table.
const VIEW = 'audit_logs_view';

export type AuditSeverity = 'high' | 'medium' | 'low';

const SEVERITY_RANK: Record<AuditSeverity, 1 | 2 | 3> = { high: 3, medium: 2, low: 1 };

export function severityFromRank(rank: number): AuditSeverity {
  return rank >= 3 ? 'high' : rank === 2 ? 'medium' : 'low';
}

// Characters that would break a PostgREST or() expression.
const cleanSearch = (term: string) => term.replace(/[,()*%"\\]/g, ' ').trim();

// Columns the Audit Log can be ordered by in the query.
export type AuditSortColumn = 'actor_name' | 'action' | 'entity_type' | 'severity_rank' | 'created_at';

export interface AuditLogQuery {
  search?: string;
  severity?: AuditSeverity;
  sort?: { column: AuditSortColumn; ascending: boolean };
  from: number;
  to: number;
}

// One page of audit logs (newest first unless `sort` says otherwise) plus
// the total matching count.
// Search matches the action text, the entity type, or the admin's name.
export async function listAuditLogs({ search, severity, sort, from, to }: AuditLogQuery) {
  let query = supabase
    .from(VIEW)
    .select('*', { count: 'exact' })
    .order(sort?.column ?? 'created_at', { ascending: sort?.ascending ?? false, nullsFirst: false })
    .order('id', { ascending: true });

  const term = cleanSearch(search ?? '');
  if (term) query = query.or(`action.ilike.%${term}%,entity_type.ilike.%${term}%,actor_name.ilike.%${term}%`);
  if (severity) query = query.eq('severity_rank', SEVERITY_RANK[severity]);

  const { data, error, count } = await query.range(from, to);
  if (error) console.error('listAuditLogs failed:', error.message);
  return { data: (data ?? []) as unknown as AuditLogRow[], count: count ?? 0, error };
}

export interface AuditLogStats {
  totalToday: number;
  percentChange: number | null;
  highSeverityToday: number;
  mostActive: { name: string; count: number } | null;
}

// Summary cards, computed over every row (not just the page on screen).
export async function getAuditLogStats(): Promise<AuditLogStats> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const count = () => supabase.from(VIEW).select('id', { count: 'exact', head: true });
  const [today, yesterday, highToday, week] = await Promise.all([
    count().gte('created_at', startOfToday.toISOString()),
    count().gte('created_at', startOfYesterday.toISOString()).lt('created_at', startOfToday.toISOString()),
    count().gte('created_at', startOfToday.toISOString()).eq('severity_rank', SEVERITY_RANK.high),
    supabase.from(VIEW).select('actor_id, actor_name').gte('created_at', startOfWeek.toISOString()).limit(5000),
  ]);

  const totalToday = today.count ?? 0;
  const totalYesterday = yesterday.count ?? 0;
  const percentChange = totalYesterday > 0 ? Math.round(((totalToday - totalYesterday) / totalYesterday) * 100) : null;

  const countsByActor = new Map<string, { name: string; count: number }>();
  for (const row of (week.data ?? []) as unknown as Pick<AuditLogRow, 'actor_id' | 'actor_name'>[]) {
    const key = row.actor_id ?? 'unknown';
    const entry = countsByActor.get(key) ?? { name: row.actor_name, count: 0 };
    entry.count += 1;
    countsByActor.set(key, entry);
  }
  let mostActive: AuditLogStats['mostActive'] = null;
  countsByActor.forEach((entry) => {
    if (!mostActive || entry.count > mostActive.count) mostActive = entry;
  });

  return { totalToday, percentChange, highSeverityToday: highToday.count ?? 0, mostActive };
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
