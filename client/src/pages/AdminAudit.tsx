import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Filter, Clock, User } from 'lucide-react';
import { listAuditLogs, type AuditLogRow } from '@/lib/auditLog';

/**
 * Admin Audit Log - Compliance & Monitoring
 *
 * Reads the real audit_logs table. Entries are written by the actual
 * staff/admin actions that produce them -- see logAuditAction() call sites
 * in lib/reports.ts, lib/vehicles.ts, lib/verification.ts, lib/tripMonitoring.ts.
 */
type Severity = 'high' | 'medium' | 'low';

// audit_logs has no severity column -- this is a display-only heuristic
// derived from the action text, not stored data.
function getSeverity(action: string): Severity {
  const lower = action.toLowerCase();
  if (lower.startsWith('rejected') || lower.includes('sos')) return 'high';
  if (lower.startsWith('resolved') || lower.startsWith('dismissed') || lower.startsWith('started investigating')) return 'medium';
  return 'low';
}

const ENTITY_LABELS: Record<string, string> = {
  report: 'Report',
  vehicle: 'Vehicle',
  id_verification: 'ID Verification',
  sos_alert: 'SOS Alert',
};

function getTargetLabel(log: AuditLogRow) {
  if (!log.entity_type) return '—';
  const label = ENTITY_LABELS[log.entity_type] ?? log.entity_type;
  return log.entity_id ? `${label} #${log.entity_id.slice(0, 8)}` : label;
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | Severity>('all');

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    const { data } = await listAuditLogs();
    setLogs(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          (log.actor?.display_name ?? '').toLowerCase().includes(searchLower) || log.action.toLowerCase().includes(searchLower);
        const matchesFilter = filterSeverity === 'all' || getSeverity(log.action) === filterSeverity;
        return matchesSearch && matchesFilter;
      }),
    [logs, searchTerm, filterSeverity]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    const todayLogs = logs.filter((l) => new Date(l.created_at) >= startOfToday);
    const yesterdayLogs = logs.filter((l) => {
      const d = new Date(l.created_at);
      return d >= startOfYesterday && d < startOfToday;
    });
    const weekLogs = logs.filter((l) => new Date(l.created_at) >= startOfWeek);

    const totalToday = todayLogs.length;
    const totalYesterday = yesterdayLogs.length;
    const percentChange = totalYesterday > 0 ? Math.round(((totalToday - totalYesterday) / totalYesterday) * 100) : null;

    const highSeverityToday = todayLogs.filter((l) => getSeverity(l.action) === 'high').length;

    const countsByActor = new Map<string, { name: string; count: number }>();
    for (const log of weekLogs) {
      const key = log.actor_id ?? 'unknown';
      const name = log.actor?.display_name ?? 'Unknown';
      const entry = countsByActor.get(key) ?? { name, count: 0 };
      entry.count += 1;
      countsByActor.set(key, entry);
    }
    const actorEntries = Array.from(countsByActor.values());
    let mostActive: { name: string; count: number } | null = null;
    for (let i = 0; i < actorEntries.length; i++) {
      const entry = actorEntries[i];
      if (!mostActive || entry.count > mostActive.count) mostActive = entry;
    }

    return { totalToday, percentChange, highSeverityToday, mostActive };
  }, [logs]);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'low':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-2">Track all staff actions and system changes</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by staff or action..."
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
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Staff Member</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Target</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Severity</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No actions recorded yet
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const severity = getSeverity(log.action);
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">{log.actor?.display_name ?? 'System'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{log.action}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{getTargetLabel(log)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>{severity}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
            <p className="text-sm text-muted-foreground mb-2">Most Active Staff (7 days)</p>
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
