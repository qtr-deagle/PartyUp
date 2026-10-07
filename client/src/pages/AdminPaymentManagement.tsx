import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import { Search, DollarSign, AlertCircle, CheckCircle, Clock, Filter, Camera, AlertTriangle, XCircle, Eye, Percent } from 'lucide-react';
import { getReportEvidenceUrl, listReports, updateReportStatus, type ReportRow, type ReportStatus } from '@/lib/reports';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';
import { formatPeso, listPaymentHistory, partyUpFee, PLATFORM_FEE_RATE, type PaymentHistoryRow } from '@/lib/payments';
import { runUndoable } from '@/lib/undoable';
import { formatDate, formatDateTime } from '@/lib/datetime';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';

/**
 * Admin Payment Management
 *
 * Admin can:
 * - Review payment-related reports (reports table, report_type='payment') and
 *   investigate / resolve / dismiss them, same action set as the Support page's Reports tab
 * - View real payment/transaction history (payment_history table)
 */
export default function AdminPaymentManagement() {
  const [activeTab, setActiveTab] = useState<'issues' | 'history'>('issues');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGateway, setFilterGateway] = useState('');

  const [rawIssues, setIssues] = useState<ReportRow[]>([]);
  const [statusPatch, setStatusPatch] = useState<Record<string, ReportStatus>>({});
  const issues = useMemo(
    () => rawIssues.map((issue) => (statusPatch[issue.id] ? { ...issue, status: statusPatch[issue.id] } : issue)),
    [rawIssues, statusPatch]
  );
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [resolvingReport, setResolvingReport] = useState<{ report: ReportRow; status: ReportStatus } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceReportId, setEvidenceReportId] = useState<string | null>(null);
  const [evidenceUrls, setEvidenceUrls] = useState<string[] | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<PaymentHistoryRow[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // `silent` refreshes (realtime / tab focus) skip the loading state.
  const loadIssues = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingIssues(true);
    const { data } = await listReports(undefined, 'payment');
    setIssues(data);
    setIsLoadingIssues(false);
  }, []);

  const loadHistory = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingHistory(true);
    const { data } = await listPaymentHistory();
    setTransactions(data);
    setIsLoadingHistory(false);
  }, []);

  useEffect(() => {
    void loadIssues();
    void loadHistory();
  }, [loadIssues, loadHistory]);

  useTableRealtime('reports', () => void loadIssues(true));
  useTableRealtime('payment_history', () => void loadHistory(true));

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

  // Click a column title: ascending, descending, then off (newest first).
  const issueSort = useSortable(
    filteredIssues,
    {
      reporter: (i) => i.reporter?.display_name,
      details: (i) => i.details,
      trip: (i) => i.trip?.title,
      reported: (i) => i.created_at,
      status: (i) => i.status,
    },
    { key: 'reported', direction: 'desc' }
  );
  const issuesPage = useClientPagination(issueSort.sorted, [searchTerm, filterStatus, issueSort.sort]);
  // Click a column title: ascending, descending, then off (newest first).
  const transactionSort = useSortable(
    filteredTransactions,
    {
      id: (t) => t.id,
      user: (t) => t.user?.display_name,
      trip: (t) => t.trip?.title,
      amount: (t) => Number(t.amount),
      fee: (t) => partyUpFee(t),
      gateway: (t) => t.gateway,
      reference: (t) => t.reference,
      status: (t) => t.status,
      date: (t) => t.created_at,
    },
    { key: 'date', direction: 'desc' }
  );
  const transactionsPage = useClientPagination(transactionSort.sorted, [searchTerm, filterGateway, transactionSort.sort]);

  // Status changes message the reporter, so they're held for the Undo window.
  const changeStatus = (report: ReportRow, status: ReportStatus, notes?: string) => {
    const name = report.reporter?.display_name ?? 'this traveler';
    const label = status === 'reviewing' ? 'Marking as investigating' : status === 'resolved' ? 'Resolving' : 'Dismissing';
    runUndoable({
      key: `report:${report.id}`,
      message: `${label} ${name}'s payment issue…`,
      onHide: () => setStatusPatch((prev) => ({ ...prev, [report.id]: status })),
      onRestore: () => setStatusPatch(({ [report.id]: _, ...rest }) => rest),
      commit: () => updateReportStatus(report.id, status, notes ?? report.resolution_notes ?? undefined),
      onCommitted: () => void loadIssues().then(() => setStatusPatch(({ [report.id]: _, ...rest }) => rest)),
      success:
        status === 'reviewing'
          ? 'Marked as investigating. The reporter was told.'
          : status === 'resolved'
            ? 'Payment issue resolved. The reporter got a reply.'
            : 'Payment issue dismissed. The reporter got a reply.',
      error: 'Failed to update payment issue',
    });
  };

  const handleQuickStatus = (report: ReportRow, status: ReportStatus) => changeStatus(report, status);

  const handleViewEvidence = async (report: ReportRow) => {
    setEvidenceReportId(report.id);
    setEvidenceUrls(null);
    const urls = await Promise.all(report.evidence_paths.map((path) => getReportEvidenceUrl(path)));
    setEvidenceUrls(urls.filter((url): url is string => Boolean(url)));
  };

  const handleResolutionSubmit = () => {
    if (!resolvingReport) return;
    changeStatus(resolvingReport.report, resolvingReport.status, notes);
    setResolvingReport(null);
    setNotes('');
  };

  const paidTransactions = transactions.filter((t) => t.status === 'paid');
  const totalVolume = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = paidTransactions.reduce((sum, t) => sum + partyUpFee(t), 0);
  const feePercent = `${Math.round(PLATFORM_FEE_RATE * 100)}%`;

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
      label: `PartyUp Fees (${feePercent})`,
      value: formatPeso(totalFees),
      icon: Percent,
      color: 'bg-primary/10',
      textColor: 'text-primary',
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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300';
      case 'demo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
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
            <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
                <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1070 }}>
                  <colgroup>
                    <col style={{ width: 180 }} />
                    <col />
                    <col style={{ width: 200 }} />
                    <col style={{ width: 150 }} />
                    <col style={{ width: 130 }} />
                    <col style={{ width: 210 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <SortableTh label="Reporter" sortKey="reporter" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh label="Details" sortKey="details" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh label="Trip" sortKey="trip" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh label="Reported" sortKey="reported" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh label="Status" sortKey="status" sort={issueSort.sort} onSort={issueSort.toggle} />
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
                      issuesPage.pageItems.map((issue) => (
                        <tr key={issue.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                          <td className="px-6 py-4">
                            <span className="block truncate text-sm font-medium text-foreground" title={issue.reporter?.display_name ?? undefined}>{issue.reporter?.display_name ?? 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground truncate block" title={issue.details}>
                              {issue.details}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block truncate text-sm text-muted-foreground" title={issue.trip?.title ?? undefined}>{issue.trip?.title ?? '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{formatDate(issue.created_at)}</span>
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
              <TablePagination pagination={issuesPage} itemLabel="issues" />
            </div>
          </>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <>
            {/* Transaction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
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
            <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                {/* Fixed column widths: with auto layout, sorting or paging brought
                    different text into view and every column shifted. */}
                <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1490 }}>
                  <colgroup>
                    <col style={{ width: 130 }} />
                    <col style={{ width: 180 }} />
                    {/* Trip: no width, takes the rest */}
                    <col />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 200 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 190 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 210 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <SortableTh label="Transaction ID" sortKey="id" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="User" sortKey="user" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Trip" sortKey="trip" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Amount" sortKey="amount" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label={`PartyUp Fee (${feePercent})`} sortKey="fee" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Gateway" sortKey="gateway" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Reference" sortKey="reference" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Status" sortKey="status" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Date" sortKey="date" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingHistory ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactionsPage.pageItems.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-foreground" title={transaction.id}>
                              {transaction.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block truncate text-sm text-foreground" title={transaction.user?.display_name ?? undefined}>{transaction.user?.display_name ?? 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block truncate text-sm text-muted-foreground" title={transaction.trip?.title ?? undefined}>{transaction.trip?.title ?? '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-foreground">
                              ₱{transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-primary">{formatPeso(partyUpFee(transaction))}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-foreground capitalize">{transaction.gateway}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block truncate text-sm font-mono text-muted-foreground" title={transaction.reference ?? undefined}>{transaction.reference ?? '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{formatDateTime(transaction.created_at)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <TablePagination pagination={transactionsPage} itemLabel="transactions" />
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
