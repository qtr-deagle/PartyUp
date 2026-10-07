import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { listReports, updateReportStatus, type ReportRow } from '@/lib/reports';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';

/**
 * Staff Moderation - Reports Queue
 *
 * Staff can:
 * - Review pending user reports
 * - Take action on violations
 */
export default function StaffModeration() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actioningReportId, setActioningReportId] = useState<string | null>(null);

  // `silent` refreshes (realtime / tab focus) skip the loading state and the
  // error toast.
  const loadReports = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const { data, error } = await listReports('open');
    if (error) {
      setLoadError(error.message);
      if (!silent) toast.error('Failed to load reports');
    } else {
      setLoadError(null);
      setReports(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  useTableRealtime('reports', () => void loadReports(true));

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          (report.reported_user?.display_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.details.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [reports, searchTerm]
  );

  // Click a column title: ascending, descending, then off (newest first).
  const reportSort = useSortable(
    filteredReports,
    {
      user: (r) => r.reported_user?.display_name,
      reason: (r) => `${r.report_type} ${r.details}`,
      time: (r) => r.created_at,
    },
    { key: 'time', direction: 'desc' }
  );

  const handleAction = async (report: ReportRow, status: 'resolved' | 'dismissed') => {
    setActioningReportId(report.id);
    const { error } = await updateReportStatus(report.id, status);
    setActioningReportId(null);
    if (error) {
      toast.error('Failed to update report');
    } else {
      await loadReports();
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports Queue</h1>
          <p className="text-sm text-muted-foreground mt-2">Review and take action on user reports</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Reports Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
            <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 750 }}>
              <colgroup>
                <col style={{ width: 200 }} />
                <col />
                <col style={{ width: 210 }} />
                <col style={{ width: 140 }} />
              </colgroup>
              <thead className="border-b border-border bg-secondary">
                <tr>
                  <SortableTh label="User" sortKey="user" sort={reportSort.sort} onSort={reportSort.toggle} />
                  <SortableTh label="Reason" sortKey="reason" sort={reportSort.sort} onSort={reportSort.toggle} />
                  <SortableTh label="Time" sortKey="time" sort={reportSort.sort} onSort={reportSort.toggle} />
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-destructive">
                      Failed to load reports: {loadError}
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No open reports
                    </td>
                  </tr>
                ) : (
                  reportSort.sorted.map((report) => (
                    <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground truncate">{report.reported_user?.display_name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground truncate" title={report.details}>
                        <span className="capitalize font-medium text-foreground">{report.report_type}</span> — {report.details}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(report.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => handleAction(report, 'resolved')}
                          disabled={actioningReportId === report.id}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAction(report, 'dismissed')}
                          disabled={actioningReportId === report.id}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
