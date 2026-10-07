import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, DollarSign, AlertCircle, CheckCircle, Clock, Filter, Percent } from 'lucide-react';
import { listReports, type ReportRow } from '@/lib/reports';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';
import { formatPeso, listPaymentHistory, partyUpFee, PLATFORM_FEE_RATE, type PaymentHistoryRow } from '@/lib/payments';
import { useTableRealtime } from '@/hooks/useTableRealtime';

/**
 * Staff Payment Monitoring (View Only)
 *
 * Staff can:
 * - View payment issues reported by users (reports table, report_type='payment')
 * - Monitor payment dispute trends
 * - Track resolution status
 * - See real payment/transaction history (payment_history table)
 */
export default function StaffPaymentMonitoring() {
  const [activeTab, setActiveTab] = useState<'issues' | 'history'>('issues');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGateway, setFilterGateway] = useState('');

  const [issues, setIssues] = useState<ReportRow[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
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

  // Click a column title: ascending, descending, then off (newest first).
  const issueSort = useSortable(
    filteredIssues,
    {
      reporter: (i) => i.reporter?.display_name,
      details: (i) => i.details,
      trip: (i) => i.trip?.title,
      status: (i) => i.status,
      reported: (i) => i.created_at,
    },
    { key: 'reported', direction: 'desc' }
  );

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          (transaction.user?.display_name ?? '').toLowerCase().includes(searchLower) ||
          transaction.id.toLowerCase().includes(searchLower);
        const matchesGateway = !filterGateway || transaction.gateway === filterGateway;
        return matchesSearch && matchesGateway;
      }),
    [transactions, searchTerm, filterGateway]
  );

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

  const paidTransactions = transactions.filter((t) => t.status === 'paid');
  const totalVolume = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = paidTransactions.reduce((sum, t) => sum + partyUpFee(t), 0);
  const feePercent = `${Math.round(PLATFORM_FEE_RATE * 100)}%`;

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

  const stats = [
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
      color: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
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
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-2">View payment issues and disputes (Guild Leader View)</p>
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
              {stats.map((stat, index) => {
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
                  placeholder="Search by user or issue..."
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

            {/* Payment Issues List */}
            <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
                <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 920 }}>
                  <colgroup>
                    <col style={{ width: 180 }} />
                    <col />
                    <col style={{ width: 200 }} />
                    <col style={{ width: 130 }} />
                    <col style={{ width: 210 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <SortableTh label="Reporter" sortKey="reporter" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh label="Details" sortKey="details" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh label="Trip" sortKey="trip" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh label="Status" sortKey="status" sort={issueSort.sort} onSort={issueSort.toggle} />
                      <SortableTh label="Reported" sortKey="reported" sort={issueSort.sort} onSort={issueSort.toggle} />
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingIssues ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          No payment issues reported
                        </td>
                      </tr>
                    ) : (
                      issueSort.sorted.map((issue) => (
                        <tr key={issue.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                          <td className="px-6 py-4">
                            <span className="block truncate text-sm font-medium text-foreground" title={issue.reporter?.display_name ?? undefined}>{issue.reporter?.display_name ?? 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block truncate text-sm text-foreground" title={issue.details}>
                              {issue.details}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block truncate text-sm text-muted-foreground" title={issue.trip?.title ?? undefined}>{issue.trip?.title ?? '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(issue.status)}`}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{new Date(issue.created_at).toLocaleString()}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> This is a view-only interface for Guild Leaders. For payment dispute resolution and management,
                please contact the admin panel. Guild Leaders can monitor trends and escalate issues to administrators.
              </p>
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
                  placeholder="Search by user or transaction ID..."
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
                {/* Fixed column widths: with auto layout, sorting or paging brought
                    different text into view and every column shifted. */}
                <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1270 }}>
                  <colgroup>
                    <col style={{ width: 130 }} />
                    <col style={{ width: 180 }} />
                    {/* Trip: no width, takes the rest */}
                    <col />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 170 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 210 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <SortableTh label="Transaction ID" sortKey="id" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="User" sortKey="user" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Trip" sortKey="trip" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Amount" sortKey="amount" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="PartyUp Fee" sortKey="fee" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Gateway" sortKey="gateway" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Status" sortKey="status" sort={transactionSort.sort} onSort={transactionSort.toggle} />
                      <SortableTh label="Date" sortKey="date" sort={transactionSort.sort} onSort={transactionSort.toggle} />
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
                      transactionSort.sorted.map((transaction) => (
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
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              {transaction.trip?.trip_type === 'carpool' ? `${feePercent} on top` : feePercent}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-foreground capitalize">{transaction.gateway}</span>
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

            {/* Summary */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> This transaction history is view-only for Guild Leader monitoring. Guild Leaders can identify payment method issues,
                track transaction volume, and flag problematic patterns for admin escalation.
              </p>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
