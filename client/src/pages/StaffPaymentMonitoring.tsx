import React, { useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, DollarSign, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';

/**
 * Staff Payment Monitoring (View Only)
 * 
 * Staff can:
 * - View payment issues reported by users
 * - Monitor payment dispute trends
 * - Track resolution status
 * - See payment statistics
 */
export default function StaffPaymentMonitoring() {
  const [activeTab, setActiveTab] = useState<'issues' | 'history'>('issues');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  const paymentIssues = [
    {
      id: 1,
      reporter: 'Sarah Chen',
      subject: 'Duplicate charge on carpool booking',
      amount: 1500,
      status: 'pending',
      date: '2 hours ago',
      severity: 'high',
    },
    {
      id: 2,
      reporter: 'Mike Johnson',
      subject: 'Refund not received',
      amount: 3500,
      status: 'investigating',
      date: '5 hours ago',
      severity: 'high',
    },
    {
      id: 3,
      reporter: 'Emma Davis',
      subject: 'Incorrect payment deduction',
      amount: 500,
      status: 'pending',
      date: '1 day ago',
      severity: 'medium',
    },
    {
      id: 4,
      reporter: 'James Wilson',
      subject: 'Missing transaction receipt',
      amount: 2200,
      status: 'resolved',
      date: '2 days ago',
      severity: 'low',
    },
  ];

  const paymentTransactions = [
    {
      id: 'TXN-001',
      user: 'John Reyes',
      amount: 360,
      method: 'GCash',
      status: 'completed',
      date: '2 hours ago',
    },
    {
      id: 'TXN-002',
      user: 'Maria Santos',
      amount: 1200,
      method: 'PayMaya',
      status: 'completed',
      date: '3 hours ago',
    },
    {
      id: 'TXN-003',
      user: 'Carlos Mendoza',
      amount: 450,
      method: 'GCash',
      status: 'pending',
      date: '5 hours ago',
    },
    {
      id: 'TXN-004',
      user: 'Ana Cruz',
      amount: 800,
      method: 'GCash',
      status: 'failed',
      date: '6 hours ago',
    },
    {
      id: 'TXN-005',
      user: 'Luis Garcia',
      amount: 2400,
      method: 'PayMaya',
      status: 'completed',
      date: '8 hours ago',
    },
  ];

  const filteredIssues = paymentIssues.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      issue.reporter.toLowerCase().includes(searchLower) ||
      issue.subject.toLowerCase().includes(searchLower);
    
    const matchesFilter = !filterStatus || issue.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const filteredTransactions = paymentTransactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      transaction.user.toLowerCase().includes(searchLower) ||
      transaction.id.toLowerCase().includes(searchLower);
    
    const matchesMethod = !filterMethod || transaction.method === filterMethod;
    
    return matchesSearch && matchesMethod;
  });

  const transactionStats = [
    {
      label: 'Total Volume',
      value: '₱5,210',
      icon: DollarSign,
      color: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      label: 'Success Rate',
      value: '80%',
      icon: CheckCircle,
      color: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      label: 'Avg Transaction',
      value: '₱1,042',
      icon: DollarSign,
      color: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      label: 'Failure Rate',
      value: '20%',
      icon: AlertCircle,
      color: 'bg-destructive/10',
      textColor: 'text-destructive'
    },
  ];

  const stats = [
    {
      label: 'Total Issues',
      value: '24',
      icon: AlertCircle,
      color: 'bg-orange-500/10',
      textColor: 'text-orange-500'
    },
    {
      label: 'Pending',
      value: '8',
      icon: Clock,
      color: 'bg-yellow-500/10',
      textColor: 'text-yellow-500'
    },
    {
      label: 'Resolved',
      value: '16',
      icon: CheckCircle,
      color: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      label: 'Total Amount',
      value: '₱87,500',
      icon: DollarSign,
      color: 'bg-primary/10',
      textColor: 'text-primary'
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/20 text-destructive';
      case 'medium':
        return 'bg-orange-500/20 text-orange-700';
      case 'low':
        return 'bg-blue-500/20 text-blue-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'investigating':
        return 'bg-blue-500/20 text-blue-700';
      case 'resolved':
        return 'bg-green-500/20 text-green-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
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
              setFilterMethod('');
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
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
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
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Issue</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Severity</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) => (
                      <tr key={issue.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-foreground">{issue.reporter}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground">{issue.subject}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-foreground">₱{issue.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">{issue.date}</span>
                        </td>
                      </tr>
                    ))}
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
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                >
                  <option value="">All Methods</option>
                  <option value="GCash">GCash</option>
                  <option value="PayMaya">PayMaya</option>
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
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Method</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-foreground">{transaction.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground">{transaction.user}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-foreground">₱{transaction.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-foreground">{transaction.method}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' ? 'bg-green-500/20 text-green-700' :
                            transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700' :
                            'bg-destructive/20 text-destructive'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">{transaction.date}</span>
                        </td>
                      </tr>
                    ))}
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
