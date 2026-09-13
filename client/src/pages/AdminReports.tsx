import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import { Camera, Search, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getReportEvidenceUrl, listReports, updateReportStatus, type ReportRow, type ReportStatus } from '@/lib/reports';

const STATUS_FILTERS: Array<ReportStatus | 'all'> = ['all', 'open', 'reviewing', 'resolved', 'dismissed'];

const STATUS_STYLES: Record<ReportStatus, string> = {
  open: 'bg-yellow-200/30 text-yellow-600 dark:text-yellow-400',
  reviewing: 'bg-primary/20 text-primary',
  resolved: 'bg-accent/20 text-accent',
  dismissed: 'bg-muted text-muted-foreground',
};

const TYPE_STYLES: Record<ReportRow['report_type'], string> = {
  safety: 'bg-destructive/20 text-destructive',
  behavior: 'bg-orange-500/20 text-orange-600',
  payment: 'bg-yellow-200/30 text-yellow-700',
  feedback: 'bg-primary/20 text-primary',
  other: 'bg-muted text-muted-foreground',
};

export default function AdminReports() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [resolvingReport, setResolvingReport] = useState<{ report: ReportRow; status: ReportStatus } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceReportId, setEvidenceReportId] = useState<string | null>(null);
  const [evidenceUrls, setEvidenceUrls] = useState<string[] | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const loadReports = useCallback(async (status: ReportStatus | 'all') => {
    setIsLoading(true);
    const { data } = await listReports(status === 'all' ? undefined : status);
    setReports(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadReports(statusFilter);
  }, [statusFilter, loadReports]);

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          (report.reporter?.display_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (report.reported_user?.display_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.details.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [reports, searchTerm]
  );

  const handleQuickStatus = async (report: ReportRow, status: ReportStatus) => {
    setIsSubmitting(true);
    const { error } = await updateReportStatus(report.id, status, report.resolution_notes ?? undefined);
    setIsSubmitting(false);
    if (!error) await loadReports(statusFilter);
  };

  const handleViewEvidence = async (report: ReportRow) => {
    setEvidenceReportId(report.id);
    setEvidenceUrls(null);
    const urls = await Promise.all(report.evidence_paths.map((path) => getReportEvidenceUrl(path)));
    setEvidenceUrls(urls.filter((url): url is string => Boolean(url)));
  };

  const handleResolutionSubmit = async () => {
    if (!resolvingReport) return;
    setIsSubmitting(true);
    const { error } = await updateReportStatus(resolvingReport.report.id, resolvingReport.status, notes);
    setIsSubmitting(false);
    if (!error) {
      setResolvingReport(null);
      setNotes('');
      await loadReports(statusFilter);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-smooth ${
                statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports by reporter, reported user, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Reports Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reporter</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reported User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Details</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{report.reporter?.display_name ?? 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{report.reported_user?.display_name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={report.details}>
                        {report.details}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${TYPE_STYLES[report.report_type]}`}>
                          {report.report_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[report.status]}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {report.evidence_paths.length > 0 && (
                            <button
                              onClick={() => handleViewEvidence(report)}
                              className="p-2 hover:bg-secondary rounded-lg transition-smooth inline-flex items-center gap-1"
                              title={`View ${report.evidence_paths.length} evidence photo(s)`}
                            >
                              <Camera className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">{report.evidence_paths.length}</span>
                            </button>
                          )}
                          {report.status === 'open' && (
                            <button
                              onClick={() => handleQuickStatus(report, 'reviewing')}
                              disabled={isSubmitting}
                              className="p-2 hover:bg-secondary rounded-lg transition-smooth disabled:opacity-50"
                              title="Start investigating"
                            >
                              <Eye className="w-4 h-4 text-primary" />
                            </button>
                          )}
                          {(report.status === 'open' || report.status === 'reviewing') && (
                            <>
                              <button
                                onClick={() => setResolvingReport({ report, status: 'resolved' })}
                                className="p-2 hover:bg-secondary rounded-lg transition-smooth"
                                title="Resolve"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => setResolvingReport({ report, status: 'dismissed' })}
                                className="p-2 hover:bg-secondary rounded-lg transition-smooth"
                                title="Dismiss"
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </button>
                            </>
                          )}
                          {report.status === 'reviewing' && (
                            <span title="Under investigation">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {resolvingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground capitalize">{resolvingReport.status} Report</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Resolution Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="What action was taken?"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setResolvingReport(null);
                    setNotes('');
                  }}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolutionSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 text-white py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors ${
                    resolvingReport.status === 'resolved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {resolvingReport.status === 'resolved' ? 'Resolve' : 'Dismiss'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {evidenceReportId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEvidenceReportId(null)}>
          <div className="bg-card rounded-2xl max-w-lg w-full shadow-elevation-3 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Evidence Photos</h3>
            </div>
            <div className="p-6">
              {evidenceUrls === null ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : evidenceUrls.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Photos could not be loaded.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {evidenceUrls.map((url) => (
                    <button key={url} onClick={() => setLightboxSrc(url)} className="aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="Report evidence" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setEvidenceReportId(null)}
                className="w-full border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </AdminLayout>
  );
}
