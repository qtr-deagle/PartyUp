import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import { Search, DollarSign, AlertCircle, CheckCircle, Clock, Filter, Camera, AlertTriangle, XCircle, Eye } from 'lucide-react';
import { getReportEvidenceUrl, listReports, updateReportStatus, type ReportRow, type ReportStatus } from '@/lib/reports';
import { listPaymentHistory, type PaymentHistoryRow } from '@/lib/payments';

/**
 * Admin Payment Management
 *
 * Admin can:
 * - Review payment-related reports (reports table, report_type='payment') and
 *   investigate / resolve / dismiss them, same action set as AdminReports.tsx
 * - View real payment/transaction history (payment_history table)
 */
export default function AdminPaymentManagement() {
  const [activeTab, setActiveTab] = useState<'issues' | 'history'>('issues');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGateway, setFilterGateway] = useState('');

  const [issues, setIssues] = useState<ReportRow[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [resolvingReport, setResolvingReport] = useState<{ report: ReportRow; status: ReportStatus } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceReportId, setEvidenceReportId] = useState<string | null>(null);
  const [evidenceUrls, setEvidenceUrls] = useState<string[] | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<PaymentHistoryRow[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const loadIssues = useCallback(async () => {
    setIsLoadingIssues(true);
    const { data } = await listReports(undefined, 'payment');
    setIssues(data);
    setIsLoadingIssues(false);
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    const { data } = await listPaymentHistory();
    setTransactions(data);
    setIsLoadingHistory(false);
  }, []);

  useEffect(() => {
    void loadIssues();
    void loadHistory();
  }, [loadIssues, loadHistory]);

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          (issue.reporter?.display_name ?? '').toLowerCase().includes(searchLower) ||
          issue.details.toLowerCase().includes(searchLower);
        const matchesFilter = !filterStatus || issue.status === filterStatus;
        return matchesSearch && matchesFilter;
      }),
    [issues, searchTerm, filterStatus]
  );

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          (transaction.user?.display_name ?? '').toLowerCase().includes(searchLower) ||
          transaction.id.toLowerCase().includes(searchLower) ||
          (transaction.reference ?? '').toLowerCase().includes(searchLower);
        const matchesGateway = !filterGateway || transaction.gateway === filterGateway;
        return matchesSearch && matchesGateway;
      }),
    [transactions, searchTerm, filterGateway]
  );

  const handleQuickStatus = async (report: ReportRow, status: ReportStatus) => {
    setIsSubmitting(true);
    const { error } = await updateReportStatus(report.id, status, report.resolution_notes ?? undefined);
    setIsSubmitting(false);
    if (!error) await loadIssues();
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
      await loadIssues();
    }
  };

  const paidTransactions = transactions.filter((t) => t.status === 'paid');
  const totalVolume = paidTransactions.reduce((sum, t) => sum + t.amount, 0);

  const issueStats = [
    {
      label: 'Total Issues',
      value: String(issues.length),
      icon: AlertCircle,
      color: 'bg-orange-500/10',
      textColor: 'text-orange-500',
    },
    {
      label: 'Open',
      value: String(issues.filter((i) => i.status === 'open').length),
      icon: Clock,
      color: 'bg-red-500/10',
      textColor: 'text-red-500',
    },
    {
      label: 'Reviewing',
      value: String(issues.filter((i) => i.status === 'reviewing').length),
      icon: AlertCircle,
      color: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      label: 'Resolved',
      value: String(issues.filter((i) => i.status === 'resolved').length),
      icon: CheckCircle,
      color: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
  ];

  const transactionStats = [
    {
      label: 'Total Volume (Paid)',
      value: `₱${totalVolume.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      label: 'Paid',
      value: String(paidTransactions.length),
      icon: CheckCircle,
      color: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      label: 'Pending',
      value: String(transactions.filter((t) => t.status === 'pending').length),
      icon: Clock,
      color: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
    },
    {
      label: 'Refunded',
      value: String(transactions.filter((t) => t.status === 'refunded').length),
      icon: AlertCircle,
      color: 'bg-destructive/10',
      textColor: 'text-destructive',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'reviewing':
        return 'bg-blue-500/20 text-blue-700';
      case 'resolved':
        return 'bg-green-500/20 text-green-700';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-700';
      case 'paid':
        return 'bg-green-500/20 text-green-700';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'refunded':
        return 'bg-blue-500/20 text-blue-700';
      case 'demo':
        return 'bg-gray-500/20 text-gray-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage payment disputes and track transaction analytics</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => {
              setActiveTab('issues');
              setSearchTerm('');
              setFilterStatus('');
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'issues'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Issues
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setSearchTerm('');
              setFilterGateway('');
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Payment History
          </button>
        </div>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {issueStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className={`${stat.textColor} w-6 h-6`} />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by user or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                />
              </div>
              <div className="flex gap-2">
                <Filter className="w-5 h-5 text-muted-foreground mt-3" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>

            {/* Payment Issues Table */}
            <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reporter</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Details</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Trip</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reported</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingIssues ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          No payment issues reported
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((issue) => (
                        <tr key={issue.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-foreground">{issue.reporter?.display_name ?? 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <span className="text-sm text-muted-foreground truncate block" title={issue.details}>
                              {issue.details}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{issue.trip?.title ?? '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{new Date(issue.created_at).toLocaleDateString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(issue.status)}`}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {issue.evidence_paths.length > 0 && (
                                <button
                                  onClick={() => handleViewEvidence(issue)}
                                  className="p-2 hover:bg-secondary rounded-lg transition-smooth inline-flex items-center gap-1"
                                  title={`View ${issue.evidence_paths.length} evidence photo(s)`}
                                >
                                  <Camera className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-xs font-medium text-muted-foreground">{issue.evidence_paths.length}</span>
                                </button>
                              )}
                              {issue.status === 'open' && (
                                <button
                                  onClick={() => handleQuickStatus(issue, 'reviewing')}
                                  disabled={isSubmitting}
                                  className="p-2 hover:bg-secondary rounded-lg transition-smooth disabled:opacity-50"
                                  title="Start investigating"
                                >
                                  <Eye className="w-4 h-4 text-primary" />
                                </button>
                              )}
                              {(issue.status === 'open' || issue.status === 'reviewing') && (
                                <>
                                  <button
                                    onClick={() => setResolvingReport({ report: issue, status: 'resolved' })}
                                    className="p-2 hover:bg-secondary rounded-lg transition-smooth"
                                    title="Resolve"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </button>
                                  <button
                                    onClick={() => setResolvingReport({ report: issue, status: 'dismissed' })}
                                    className="p-2 hover:bg-secondary rounded-lg transition-smooth"
                                    title="Dismiss"
                                  >
                                    <XCircle className="w-4 h-4 text-destructive" />
                                  </button>
                                </>
                              )}
                              {issue.status === 'reviewing' && (
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
          </>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <>
            {/* Transaction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {transactionStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className={`${stat.textColor} w-6 h-6`} />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by user, transaction ID, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                />
              </div>
              <div className="flex gap-2">
                <Filter className="w-5 h-5 text-muted-foreground mt-3" />
                <select
                  value={filterGateway}
                  onChange={(e) => setFilterGateway(e.target.value)}
                  className="px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                >
                  <option value="">All Gateways</option>
                  <option value="manual">Manual (self-reported)</option>
                  <option value="paymongo">PayMongo</option>
                </select>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Transaction ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">User</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Trip</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Gateway</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reference</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingHistory ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-foreground" title={transaction.id}>
                              {transaction.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-foreground">{transaction.user?.display_name ?? 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{transaction.trip?.title ?? '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-foreground">
                              ₱{transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-foreground capitalize">{transaction.gateway}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-muted-foreground">{transaction.reference ?? '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{new Date(transaction.created_at).toLocaleString()}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
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
