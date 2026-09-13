import { useCallback, useEffect, useMemo, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import { Camera, Search, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getReportEvidenceUrl, listReports, updateReportStatus, type ReportRow, type ReportStatus } from '@/lib/reports';

/**
 * Staff User Reports - Review Community-Reported Users
 *
 * Staff can:
 * - Review user-submitted reports
 * - Move a report into investigation
 * - Resolve or dismiss a report with notes
 */
export default function StaffDisputes() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resolvingReport, setResolvingReport] = useState<{ report: ReportRow; status: ReportStatus } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceReportId, setEvidenceReportId] = useState<string | null>(null);
  const [evidenceUrls, setEvidenceUrls] = useState<string[] | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    const [open, reviewing] = await Promise.all([listReports('open'), listReports('reviewing')]);
    const combined = [...open.data, ...reviewing.data].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setReports(combined);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          (report.reported_user?.display_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (report.reporter?.display_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [reports, searchTerm]
  );

  const handleInvestigate = async (report: ReportRow) => {
    setIsSubmitting(true);
    const { error } = await updateReportStatus(report.id, 'reviewing', report.resolution_notes ?? undefined);
    setIsSubmitting(false);
    if (!error) await loadQueue();
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
      await loadQueue();
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Reports</h1>
          <p className="text-sm text-muted-foreground mt-2">Review community-reported users and take moderation action</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by reporter or reported user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* User Reports Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reporter</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reported User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No open reports
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{report.reporter?.display_name ?? 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{report.reported_user?.display_name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={report.details}>
                        <span className="capitalize font-medium text-foreground">{report.report_type}</span> — {report.details}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(report.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            report.status === 'reviewing' ? 'bg-primary/20 text-primary' : 'bg-yellow-200/30 text-yellow-600 dark:text-yellow-400'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        {report.evidence_paths.length > 0 && (
                          <button
                            onClick={() => handleViewEvidence(report)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors inline-flex items-center gap-1"
                            title={`View ${report.evidence_paths.length} evidence photo(s)`}
                          >
                            <Camera className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">{report.evidence_paths.length}</span>
                          </button>
                        )}
                        {report.status === 'open' && (
                          <button
                            onClick={() => handleInvestigate(report)}
                            disabled={isSubmitting}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs hover:bg-primary/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Investigate
                          </button>
                        )}
                        <button
                          onClick={() => setResolvingReport({ report, status: 'resolved' })}
                          className="p-2 hover:bg-green-500/10 rounded-lg text-green-600 transition-colors"
                          title="Resolve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setResolvingReport({ report, status: 'dismissed' })}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                          title="Dismiss"
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

      {resolvingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground capitalize flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {resolvingReport.status} Report
              </h3>
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
    </StaffLayout>
  );
}
