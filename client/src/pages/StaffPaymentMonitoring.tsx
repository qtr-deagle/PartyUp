import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, DollarSign, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { listReports, type ReportRow } from '@/lib/reports';
import { listPaymentHistory, type PaymentHistoryRow } from '@/lib/payments';

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
          transaction.id.toLowerCase().includes(searchLower);
        const matchesGateway = !filterGateway || transaction.gateway === filterGateway;
        return matchesSearch && matchesGateway;
      }),
    [transactions, searchTerm, filterGateway]
  );

  const paidTransactions = transactions.filter((t) => t.status === 'paid');
  const totalVolume = paidTransactions.reduce((sum, t) => sum + t.amount, 0);

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
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'reviewing':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
      case 'paid':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'refunded':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'demo':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-2">View payment issues and disputes (Staff View)</p>
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reporter</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Details</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Trip</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reported</th>
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
                      filteredIssues.map((issue) => (
                        <tr key={issue.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-foreground">{issue.reporter?.display_name ?? 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <span className="text-sm text-foreground line-clamp-2" title={issue.details}>
                              {issue.details}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{issue.trip?.title ?? '—'}</span>
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
                <strong>Note:</strong> This is a view-only interface for staff. For payment dispute resolution and management,
                please contact the admin panel. Staff can monitor trends and escalate issues to administrators.
              </p>
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Transaction ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">User</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Trip</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Gateway</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingHistory ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
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
                <strong>Note:</strong> This transaction history is view-only for staff monitoring. Staff can identify payment method issues,
                track transaction volume, and flag problematic patterns for admin escalation.
              </p>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
