import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Activity, AlertOctagon, ScrollText, Search, TrendingDown, TrendingUp, UserCog, UserX } from 'lucide-react';
import { PageHeader, PersonCell, Pill, SearchField, Segmented, StatTile, TableMessage, TD, TH, TR, Toolbar, type PillTone } from '@/components/admin/AdminUI';
import {
  getAuditLogStats,
  listAuditLogs,
  severityFromRank,
  type AuditLogQuery,
  type AuditLogRow,
  type AuditLogStats,
  type AuditSeverity,
  type AuditSortColumn,
} from '@/lib/auditLog';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { formatDateTime, timeAgo } from '@/lib/datetime';
import { usePagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';
import SortableTh from '@/components/SortableTh';
import { useSortState } from '@/hooks/useSortable';

/**
 * Admin Audit Log - Compliance & Monitoring
 *
 * Reads the real audit logs (through audit_logs_view). Entries are written by
 * the actual admin actions that produce them -- see logAuditAction() call
 * sites in lib/reports.ts, lib/vehicles.ts, lib/verification.ts,
 * lib/tripMonitoring.ts. A DB trigger (202610020005_audit_log_admin_only)
 * drops inserts from non-admins, so Guild Leader actions never land here.
 *
 * Severity isn't stored: audit_logs_view derives it from the action text
 * (partyup-mobile migration 202610070004), so it can be sorted and filtered
 * in the query. Change the rules there, not here.
 */
type Severity = AuditSeverity;

const ENTITY_LABELS: Record<string, string> = {
  report: 'Report',
  vehicle: 'Vehicle',
  id_verification: 'ID Verification',
  sos_alert: 'SOS Alert',
  driver_license: "Driver's License",
};

function getTargetLabel(log: AuditLogRow) {
  if (!log.entity_type) return '—';
  const label = ENTITY_LABELS[log.entity_type] ?? log.entity_type;
  return log.entity_id ? `${label} #${log.entity_id.slice(0, 8)}` : label;
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stats, setStats] = useState<AuditLogStats>({ totalToday: 0, percentChange: null, highSeverityToday: 0, mostActive: null });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | Severity>('all');

  // Click a column title: ascending, descending, then off (newest first).
  // Sorted in the query, since the table loads one page at a time.
  const logSort = useSortState<AuditSortColumn>();
  const sortArg = logSort.sort ? { column: logSort.sort.key, ascending: logSort.sort.direction === 'asc' } : undefined;
  const pagination = usePagination(totalLogs, [searchTerm, filterSeverity, logSort.sort]);
  const { from, to } = pagination;

  // `silent` refreshes (realtime / tab focus) skip the loading state.
  const loadLogs = useCallback(async (
    search: string,
    severity: 'all' | Severity,
    range: { from: number; to: number },
    sort: AuditLogQuery['sort'],
    silent = false
  ) => {
    if (!silent) setIsLoading(true);
    const [{ data, count, error }, nextStats] = await Promise.all([
      listAuditLogs({ search, severity: severity === 'all' ? undefined : severity, sort, ...range }),
      getAuditLogStats(),
    ]);
    if (!error) {
      setLogs(data);
      setTotalLogs(count);
    }
    setStats(nextStats);
    setIsLoading(false);
  }, []);

  // Debounce typing in the search box; page / filter changes load right away.
  const lastSearch = useRef(searchTerm);
  useEffect(() => {
    const typed = lastSearch.current !== searchTerm;
    lastSearch.current = searchTerm;
    const timeout = setTimeout(() => void loadLogs(searchTerm, filterSeverity, { from, to }, sortArg), typed ? 300 : 0);
    return () => clearTimeout(timeout);
    // sortArg is rebuilt each render; its column/direction are the real deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterSeverity, from, to, sortArg?.column, sortArg?.ascending, loadLogs]);

  useTableRealtime('audit_logs', () => void loadLogs(searchTerm, filterSeverity, { from, to }, sortArg, true));

  const SEVERITY_TONE: Record<Severity, PillTone> = { high: 'red', medium: 'orange', low: 'green' };
  const filtered = searchTerm.trim() !== '' || filterSeverity !== 'all';
  const change = stats.percentChange;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Audit Log" subtitle="Every admin action, newest first. Entries can't be edited or deleted." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile
            icon={Activity}
            tone="bg-primary/10 text-primary"
            label="Actions today"
            value={stats.totalToday}
            hint={
              change === null ? (
                'No data from yesterday to compare'
              ) : (
                <span className={`inline-flex items-center gap-1 ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(change)}% from yesterday
                </span>
              )
            }
          />
          <StatTile
            icon={AlertOctagon}
            tone="bg-red-500/15 text-red-600 dark:text-red-400"
            label="High severity today"
            value={stats.highSeverityToday}
            hint="Click to show only high"
            onClick={() => setFilterSeverity('high')}
            active={filterSeverity === 'high'}
          />
          <StatTile
            icon={UserCog}
            tone="bg-violet-500/15 text-violet-600 dark:text-violet-400"
            label="Most active admin (7 days)"
            value={<span className="text-lg">{stats.mostActive?.name ?? '—'}</span>}
            hint={stats.mostActive ? `${stats.mostActive.count} action${stats.mostActive.count === 1 ? '' : 's'} this week` : 'No activity yet'}
          />
        </div>

        <Toolbar>
          <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search by admin or action..." />
          <Segmented
            value={filterSeverity}
            options={[
              { value: 'all' as const, label: 'All' },
              { value: 'high' as const, label: <><span className="h-2 w-2 rounded-full bg-red-500" /> High</> },
              { value: 'medium' as const, label: <><span className="h-2 w-2 rounded-full bg-orange-500" /> Medium</> },
              { value: 'low' as const, label: <><span className="h-2 w-2 rounded-full bg-green-500" /> Low</> },
            ]}
            onChange={setFilterSeverity}
          />
        </Toolbar>

        {/* Audit Table */}
        <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
            <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 990 }}>
              <colgroup>
                <col style={{ width: 230 }} />
                <col />
                <col style={{ width: 230 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 200 }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <SortableTh className={TH} label="Admin" sortKey="actor_name" sort={logSort.sort} onSort={logSort.toggle} />
                  <SortableTh className={TH} label="Action" sortKey="action" sort={logSort.sort} onSort={logSort.toggle} />
                  <SortableTh className={TH} label="Target" sortKey="entity_type" sort={logSort.sort} onSort={logSort.toggle} />
                  <SortableTh className={TH} label="Severity" sortKey="severity_rank" sort={logSort.sort} onSort={logSort.toggle} />
                  <SortableTh className={TH} label="When" sortKey="created_at" sort={logSort.sort} onSort={logSort.toggle} />
                </tr>
              </thead>
              <tbody className={`divide-y divide-border transition-opacity ${isLoading && logs.length > 0 ? 'opacity-60' : ''}`}>
                {isLoading && logs.length === 0 ? (
                  <TableMessage colSpan={5} icon={ScrollText} title="Loading" loading />
                ) : logs.length === 0 ? (
                  <TableMessage
                    colSpan={5}
                    icon={filtered ? Search : ScrollText}
                    title={filtered ? 'No actions match these filters' : 'No actions recorded yet'}
                  />
                ) : (
                  logs.map((log) => {
                    const severity = severityFromRank(log.severity_rank);
                    return (
                      <tr key={log.id} className={TR}>
                        <td className={TD}>
                          {log.actor_id ? (
                            <PersonCell name={log.actor_name} />
                          ) : (
                            // The admin's account was deleted after this entry was written.
                            <div className="flex items-center gap-3 min-w-0" title="This admin's account has since been deleted">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                                <UserX className="w-4 h-4" />
                              </span>
                              <span className="truncate text-sm italic text-muted-foreground">{log.actor_name}</span>
                            </div>
                          )}
                        </td>
                        <td className={`${TD} text-sm font-medium text-foreground truncate`} title={log.action}>
                          {log.action}
                        </td>
                        <td className={TD}>
                          {log.entity_type ? (
                            <span className="inline-flex max-w-full truncate rounded-md border border-border bg-secondary/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                              {getTargetLabel(log)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className={TD}>
                          <Pill tone={SEVERITY_TONE[severity] ?? 'gray'} dot className="capitalize">
                            {severity}
                          </Pill>
                        </td>
                        <td className={TD} title={formatDateTime(log.created_at)}>
                          <p className="text-sm text-foreground">{timeAgo(log.created_at)}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <TablePagination pagination={pagination} itemLabel="actions" />
        </div>
      </div>
    </AdminLayout>
  );
}
