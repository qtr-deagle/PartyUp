import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ImageLightbox } from '@/components/ImageLightbox';
import { AlertCircle, Camera, CheckCircle, Clock, Eye, Percent, Receipt, Search, Wallet, XCircle } from 'lucide-react';
import { PageHeader, PersonCell, Pill, SearchField, Segmented, StatGrid, StatTile, TableMessage, TD, TH, TR, Toolbar, type PillTone } from '@/components/admin/AdminUI';
import { getReportEvidenceUrl, listReports, updateReportStatus, type ReportRow, type ReportStatus } from '@/lib/reports';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';
import {
  cancelPayment,
  formatPeso,
  listPaymentHistory,
  markPaymentPaid,
  partyUpFee,
  PLATFORM_FEE_RATE,
  type PaymentHistoryRow,
} from '@/lib/payments';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { toast } from 'sonner';
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
 * - View real payment/transaction history (payment_history table, PayMongo only)
 * - Settle a stuck pending payment: mark it paid (after checking the PayMongo
 *   dashboard) or cancel it. Abandoned checkouts also expire after 24 hours.
 */
export default function AdminPaymentManagement() {
  const [activeTab, setActiveTab] = useState<'issues' | 'history'>('issues');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [settling, setSettling] = useState<{ payment: PaymentHistoryRow; outcome: 'paid' | 'cancelled' } | null>(null);

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
        const matchesStatus = !filterPaymentStatus || transaction.status === filterPaymentStatus;
        return matchesSearch && matchesStatus;
      }),
    [transactions, searchTerm, filterPaymentStatus]
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
      reference: (t) => t.gateway_payment_intent_id ?? t.reference,
      status: (t) => t.status,
      date: (t) => t.created_at,
    },
    { key: 'date', direction: 'desc' }
  );
  const transactionsPage = useClientPagination(transactionSort.sorted, [searchTerm, filterPaymentStatus, transactionSort.sort]);

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

  const handleSettle = async (note: string) => {
    if (!settling) return;
    const { payment, outcome } = settling;
    const { error } = outcome === 'paid' ? await markPaymentPaid(payment.id, note) : await cancelPayment(payment.id, note);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(
      outcome === 'paid'
        ? `Marked ${payment.user?.display_name ?? 'the rider'}'s payment as paid`
        : `Cancelled ${payment.user?.display_name ?? 'the rider'}'s payment. They can pay again from the trip.`
    );
    void loadHistory(true);
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

  const STATUS_TONE: Record<string, PillTone> = {
    open: 'yellow',
    reviewing: 'blue',
    resolved: 'green',
    dismissed: 'gray',
    paid: 'green',
    pending: 'yellow',
    cancelled: 'red',
    refunded: 'blue',
    demo: 'gray',
  };
  const openIssues = issues.filter((i) => i.status === 'open').length;
  const pendingPayments = transactions.filter((t) => t.status === 'pending').length;
  const switchTab = (tab: 'issues' | 'history') => {
    setActiveTab(tab);
    setSearchTerm('');
    setFilterStatus('');
    setFilterPaymentStatus('');
  };
  const toggle = (current: string, value: string, set: (v: string) => void) => set(current === value ? '' : value);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Payments" subtitle="Payment disputes and PayMongo transaction history">
          <Segmented
            value={activeTab}
            options={[
              {
                value: 'issues' as const,
                label: (
                  <>
                    <AlertCircle className="w-4 h-4" /> Issues
                    {openIssues > 0 && <span className="min-w-5 rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">{openIssues}</span>}
                  </>
                ),
              },
              {
                value: 'history' as const,
                label: (
                  <>
                    <Receipt className="w-4 h-4" /> Payment history
                    {pendingPayments > 0 && <span className="min-w-5 rounded-full bg-yellow-500 px-1.5 text-xs font-bold text-white">{pendingPayments}</span>}
                  </>
                ),
              },
            ]}
            onChange={switchTab}
          />
        </PageHeader>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <>
            <StatGrid>
              <StatTile icon={AlertCircle} tone="bg-orange-500/15 text-orange-600 dark:text-orange-400" label="Total issues" value={issues.length} onClick={() => setFilterStatus('')} active={filterStatus === ''} />
              <StatTile icon={Clock} tone="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" label="Open" value={openIssues} onClick={() => toggle(filterStatus, 'open', setFilterStatus)} active={filterStatus === 'open'} />
              <StatTile
                icon={Eye}
                tone="bg-blue-500/15 text-blue-600 dark:text-blue-400"
                label="Investigating"
                value={issues.filter((i) => i.status === 'reviewing').length}
                onClick={() => toggle(filterStatus, 'reviewing', setFilterStatus)}
                active={filterStatus === 'reviewing'}
              />
              <StatTile
                icon={CheckCircle}
                tone="bg-green-500/15 text-green-600 dark:text-green-400"
                label="Resolved"
                value={issues.filter((i) => i.status === 'resolved').length}
                onClick={() => toggle(filterStatus, 'resolved', setFilterStatus)}
                active={filterStatus === 'resolved'}
              />
            </StatGrid>

            <Toolbar>
              <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search by user or details..." />
              <Segmented
                value={filterStatus}
                options={[
                  { value: '', label: 'All' },
                  { value: 'open', label: 'Open' },
                  { value: 'reviewing', label: 'Investigating' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'dismissed', label: 'Dismissed' },
                ]}
                onChange={setFilterStatus}
              />
            </Toolbar>

            <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
                <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1100 }}>
                  <colgroup>
                    <col style={{ width: 210 }} />
                    <col />
                    <col style={{ width: 200 }} />
                    <col style={{ width: 140 }} />
                    <col style={{ width: 140 }} />
                    <col style={{ width: 230 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <SortableTh className={TH} label="Reporter" sortKey="reporter" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh className={TH} label="Details" sortKey="details" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh className={TH} label="Trip" sortKey="trip" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh className={TH} label="Reported" sortKey="reported" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh className={TH} label="Status" sortKey="status" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <th className={`${TH} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoadingIssues ? (
                      <TableMessage colSpan={6} icon={AlertCircle} title="Loading" loading />
                    ) : filteredIssues.length === 0 ? (
                      <TableMessage
                        colSpan={6}
                        icon={searchTerm || filterStatus ? Search : CheckCircle}
                        title={searchTerm || filterStatus ? 'No issues match these filters' : 'No payment issues reported'}
                        text={searchTerm || filterStatus ? undefined : 'Nice, nothing to sort out.'}
                      />
                    ) : (
                      issuesPage.pageItems.map((issue) => (
                        <tr key={issue.id} className={TR}>
                          <td className={TD}>
                            <PersonCell name={issue.reporter?.display_name} />
                          </td>
                          <td className={TD}>
                            <span className="text-sm text-foreground truncate block" title={issue.details}>
                              {issue.details}
                            </span>
                          </td>
                          <td className={TD}>
                            <span className="block truncate text-sm text-muted-foreground" title={issue.trip?.title ?? undefined}>
                              {issue.trip?.title ?? '—'}
                            </span>
                          </td>
                          <td className={`${TD} text-sm text-muted-foreground`}>{formatDate(issue.created_at)}</td>
                          <td className={TD}>
                            <Pill tone={STATUS_TONE[issue.status] ?? 'gray'} dot>
                              {issue.status === 'reviewing' ? 'Investigating' : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                            </Pill>
                          </td>
                          <td className={TD}>
                            <div className="flex items-center justify-end gap-1.5">
                              {issue.evidence_paths.length > 0 && (
                                <button
                                  onClick={() => handleViewEvidence(issue)}
                                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition-smooth"
                                  title={`View ${issue.evidence_paths.length} evidence photo(s)`}
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  {issue.evidence_paths.length}
                                </button>
                              )}
                              {issue.status === 'open' && (
                                <button
                                  onClick={() => handleQuickStatus(issue, 'reviewing')}
                                  disabled={isSubmitting}
                                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth disabled:opacity-50"
                                  title="Start investigating"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              {(issue.status === 'open' || issue.status === 'reviewing') && (
                                <>
                                  <button
                                    onClick={() => setResolvingReport({ report: issue, status: 'dismissed' })}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                                    title="Dismiss"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setResolvingReport({ report: issue, status: 'resolved' })}
                                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700 transition-smooth"
                                    title="Resolve"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                                  </button>
                                </>
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatTile icon={Wallet} tone="bg-green-500/15 text-green-600 dark:text-green-400" label="Total volume (paid)" value={formatPeso(totalVolume)} />
              <StatTile icon={Percent} tone="bg-primary/10 text-primary" label={`PartyUp fees (${feePercent})`} value={formatPeso(totalFees)} />
              <StatTile
                icon={CheckCircle}
                tone="bg-green-500/15 text-green-600 dark:text-green-400"
                label="Paid"
                value={paidTransactions.length}
                onClick={() => toggle(filterPaymentStatus, 'paid', setFilterPaymentStatus)}
                active={filterPaymentStatus === 'paid'}
              />
              <StatTile
                icon={Clock}
                tone="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                label="Pending"
                value={pendingPayments}
                hint={pendingPayments ? 'May need settling' : undefined}
                onClick={() => toggle(filterPaymentStatus, 'pending', setFilterPaymentStatus)}
                active={filterPaymentStatus === 'pending'}
              />
              <StatTile
                icon={XCircle}
                tone="bg-red-500/15 text-red-600 dark:text-red-400"
                label="Cancelled"
                value={transactions.filter((t) => t.status === 'cancelled').length}
                onClick={() => toggle(filterPaymentStatus, 'cancelled', setFilterPaymentStatus)}
                active={filterPaymentStatus === 'cancelled'}
              />
            </div>

            <Toolbar>
              <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search user, transaction ID or reference..." />
              <Segmented
                value={filterPaymentStatus}
                options={[
                  { value: '', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'refunded', label: 'Refunded' },
                ]}
                onChange={setFilterPaymentStatus}
              />
            </Toolbar>

            <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                {/* Fixed column widths: with auto layout, sorting or paging brought
                    different text into view and every column shifted. */}
                <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1500 }}>
                  <colgroup>
                    <col style={{ width: 130 }} />
                    <col style={{ width: 200 }} />
                    {/* Trip: no width, takes the rest */}
                    <col />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 170 }} />
                    <col style={{ width: 200 }} />
                    <col style={{ width: 130 }} />
                    <col style={{ width: 190 }} />
                    <col style={{ width: 120 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <SortableTh className={TH} label="Transaction" sortKey="id" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh className={TH} label="User" sortKey="user" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh className={TH} label="Trip" sortKey="trip" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh className={TH} label="Amount" sortKey="amount" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh className={TH} label={`Fee (${feePercent})`} sortKey="fee" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh className={TH} label="PayMongo ID" sortKey="reference" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh className={TH} label="Status" sortKey="status" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh className={TH} label="Date" sortKey="date" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <th className={`${TH} text-right`}>Settle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoadingHistory ? (
                      <TableMessage colSpan={9} icon={Receipt} title="Loading" loading />
                    ) : filteredTransactions.length === 0 ? (
                      <TableMessage
                        colSpan={9}
                        icon={searchTerm || filterPaymentStatus ? Search : Receipt}
                        title={searchTerm || filterPaymentStatus ? 'No transactions match these filters' : 'No transactions yet'}
                      />
                    ) : (
                      transactionsPage.pageItems.map((transaction) => (
                        <tr key={transaction.id} className={`${TR} ${transaction.status === 'pending' ? 'bg-yellow-500/[0.03]' : ''}`}>
                          <td className={TD}>
                            <span className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 font-mono text-xs text-foreground" title={transaction.id}>
                              {transaction.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className={TD}>
                            <PersonCell name={transaction.user?.display_name} />
                          </td>
                          <td className={TD}>
                            <span className="block truncate text-sm text-muted-foreground" title={transaction.trip?.title ?? undefined}>
                              {transaction.trip?.title ?? '—'}
                            </span>
                          </td>
                          <td className={`${TD} text-sm font-bold tabular-nums text-foreground`}>{formatPeso(Number(transaction.amount))}</td>
                          <td className={`${TD} text-sm font-semibold tabular-nums text-primary`}>{formatPeso(partyUpFee(transaction))}</td>
                          <td className={TD}>
                            <span
                              className="block truncate font-mono text-xs text-muted-foreground"
                              title={transaction.gateway_payment_intent_id ?? transaction.reference ?? undefined}
                            >
                              {transaction.gateway_payment_intent_id ?? transaction.reference ?? '—'}
                            </span>
                          </td>
                          <td className={TD}>
                            <Pill tone={STATUS_TONE[transaction.status] ?? 'gray'} dot className="capitalize">
                              {transaction.status}
                            </Pill>
                          </td>
                          <td className={`${TD} text-sm text-muted-foreground`}>{formatDateTime(transaction.created_at)}</td>
                          <td className={TD}>
                            {transaction.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSettling({ payment: transaction, outcome: 'cancelled' })}
                                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                                  title="Cancel payment"
                                  aria-label={`Cancel ${transaction.user?.display_name ?? 'this'} payment`}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setSettling({ payment: transaction, outcome: 'paid' })}
                                  className="p-2 rounded-lg text-green-600 hover:bg-green-500/10 transition-smooth"
                                  title="Mark as paid"
                                  aria-label={`Mark ${transaction.user?.display_name ?? 'this'} payment as paid`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="block text-right text-sm text-muted-foreground">—</span>
                            )}
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEvidenceReportId(null)}>
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

      <ConfirmActionDialog
        open={settling !== null}
        onOpenChange={(open) => !open && setSettling(null)}
        tone={settling?.outcome === 'cancelled' ? 'destructive' : 'default'}
        title={
          settling?.outcome === 'paid'
            ? `Mark ${settling.payment.user?.display_name ?? 'this'} payment as paid?`
            : `Cancel ${settling?.payment.user?.display_name ?? 'this'} payment?`
        }
        description={
          settling?.outcome === 'paid'
            ? `Only do this after confirming in the PayMongo dashboard that ${settling ? formatPeso(Number(settling.payment.amount)) : 'the amount'} was received. The rider and driver will be notified.`
            : 'The rider is told the payment was not completed, and their seat goes back to unpaid so they can pay again. If PayMongo later confirms this checkout, it is still marked paid.'
        }
        confirmLabel={settling?.outcome === 'paid' ? 'Mark as paid' : 'Cancel payment'}
        cancelLabel="Back"
        notes={{
          label: settling?.outcome === 'paid' ? 'How did you confirm it?' : 'Reason',
          required: true,
          placeholder: settling?.outcome === 'paid' ? 'e.g. Seen as paid in the PayMongo dashboard' : 'e.g. Rider abandoned the checkout',
        }}
        onConfirm={handleSettle}
      />

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </AdminLayout>
  );
}
