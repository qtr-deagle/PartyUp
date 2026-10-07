import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Filter, Clock, User } from 'lucide-react';
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
import { formatDateTime } from '@/lib/datetime';
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

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-2">Track all admin actions</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by admin or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as 'all' | Severity)}
              className="pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-foreground"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
            <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 990 }}>
              <colgroup>
                <col style={{ width: 220 }} />
                <col />
                <col />
                <col style={{ width: 140 }} />
                <col style={{ width: 230 }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <SortableTh label="Admin" sortKey="actor_name" sort={logSort.sort} onSort={logSort.toggle} />
                  <SortableTh label="Action" sortKey="action" sort={logSort.sort} onSort={logSort.toggle} />
                  <SortableTh label="Target" sortKey="entity_type" sort={logSort.sort} onSort={logSort.toggle} />
                  <SortableTh label="Severity" sortKey="severity_rank" sort={logSort.sort} onSort={logSort.toggle} />
                  <SortableTh label="Timestamp" sortKey="created_at" sort={logSort.sort} onSort={logSort.toggle} />
                </tr>
              </thead>
              <tbody className={isLoading && logs.length > 0 ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                {isLoading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      {searchTerm || filterSeverity !== 'all' ? 'No actions match these filters' : 'No actions recorded yet'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const severity = severityFromRank(log.severity_rank);
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <p className="truncate text-sm font-medium text-foreground">{log.actor_name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground truncate" title={log.action}>{log.action}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground truncate">{getTargetLabel(log)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>{severity}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(log.created_at)}
                          </div>
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Total Actions (Today)</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalToday}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.percentChange === null
                ? 'No data from yesterday to compare'
                : `${stats.percentChange >= 0 ? '↑' : '↓'} ${Math.abs(stats.percentChange)}% from yesterday`}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <p className="text-sm text-muted-foreground mb-2">High Severity Actions (Today)</p>
            <p className="text-3xl font-bold text-destructive">{stats.highSeverityToday}</p>
            <p className="text-xs text-muted-foreground mt-2">Requiring attention</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Most Active Admin (7 days)</p>
            <p className="text-lg font-bold text-foreground">{stats.mostActive?.name ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.mostActive ? `${stats.mostActive.count} action${stats.mostActive.count === 1 ? '' : 's'} this week` : 'No activity yet'}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
