import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { listReports, updateReportStatus, type ReportRow } from '@/lib/reports';

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

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await listReports('open');
    if (error) {
      setLoadError(error.message);
      toast.error('Failed to load reports');
    } else {
      setLoadError(null);
      setReports(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          (report.reported_user?.display_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.details.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [reports, searchTerm]
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
            <table className="w-full">
              <thead className="border-b border-border bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Time</th>
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
                  filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">{report.reported_user?.display_name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
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
