import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, AlertCircle, CheckCircle, Clock, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Staff Payment Issue Reporting & Management
 * 
 * Staff can:
 * - View payment-related issues reported by users
 * - Document and track payment problems
 * - Forward issues to admin with notes
 * - Track resolution status
 */
export default function AdminPaymentIssues() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const issues = [
    {
      id: 1,
      reporter: 'Sarah Chen',
      subject: 'Duplicate charge on carpool booking',
      description: 'I was charged twice for the same carpool ride on Feb 15. Transaction IDs: TXN001 and TXN002.',
      amount: 1500,
      status: 'pending',
      date: '2 hours ago',
      severity: 'high',
      relatedTransactionId: 'TXN001',
    },
    {
      id: 2,
      reporter: 'Mike Johnson',
      subject: 'Refund not received',
      description: 'Cancelled my tour booking 2 weeks ago but haven\'t received the refund yet. Transaction ID: TXN045',
      amount: 3500,
      status: 'investigating',
      date: '5 hours ago',
      severity: 'high',
      relatedTransactionId: 'TXN045',
    },
    {
      id: 3,
      reporter: 'Emma Davis',
      subject: 'Incorrect payment deduction',
      description: 'Carpool cost-split was calculated incorrectly. I was charged ₱2500 instead of ₱2000.',
      amount: 500,
      status: 'pending',
      date: '1 day ago',
      severity: 'medium',
      relatedTransactionId: 'TXN034',
    },
    {
      id: 4,
      reporter: 'David Lee',
      subject: 'Payment gateway timeout',
      description: 'Payment was declined with timeout error. Unsure if transaction went through. Transaction ID: TXN089',
      amount: 2800,
      status: 'resolved',
      date: '2 days ago',
      severity: 'high',
      relatedTransactionId: 'TXN089',
    },
    {
      id: 5,
      reporter: 'Lisa Wong',
      subject: 'Partial payment issue',
      description: 'Only paid ₱2000 for ₱4500 tour. System accepted it without error.',
      amount: 2500,
      status: 'investigating',
      date: '3 days ago',
      severity: 'high',
      relatedTransactionId: 'TXN078',
    },
    {
      id: 6,
      reporter: 'Carlos Santos',
      subject: 'Payment receipt missing',
      description: 'Completed booking but no receipt or confirmation email received.',
      amount: 1200,
      status: 'pending',
      date: '4 days ago',
      severity: 'low',
      relatedTransactionId: 'TXN067',
    },
  ];

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.relatedTransactionId.includes(searchTerm);
    const matchesStatus = !filterStatus || issue.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    investigating: issues.filter(i => i.status === 'investigating').length,
    totalAmount: issues.reduce((sum, i) => sum + i.amount, 0),
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'investigating':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleViewDetails = (issueId: number) => {
    toast.info('View details - coming soon');
  };

  const handleForwardToAdmin = (issueId: number) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 800)),
      {
        success: 'Issue forwarded to admin successfully',
        error: 'Failed to forward issue',
      }
    );
  };

  const handleAddNote = (issueId: number) => {
    toast.info('Add note - coming soon');
  };

  return (
    <AdminLayout>
      <div className="space-y-2">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border z-30 px-4 md:px-6 py-2">
          <h1 className="text-base font-bold text-foreground">Payment Issues</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 px-4 md:px-6">
          <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-border">
            <p className="text-muted-foreground text-xs mb-0.5">Total Issues</p>
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-red-300">
            <p className="text-muted-foreground text-xs mb-0.5">Pending</p>
            <p className="text-lg font-bold text-red-600">{stats.pending}</p>
          </div>
          <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-blue-300">
            <p className="text-muted-foreground text-xs mb-0.5">Investigating</p>
            <p className="text-lg font-bold text-blue-600">{stats.investigating}</p>
          </div>
          <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-border">
            <p className="text-muted-foreground text-xs mb-0.5">Amount</p>
            <p className="text-lg font-bold text-foreground">₱{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-border mx-4 md:mx-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by reporter, subject, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-2.5 py-1 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border hover:border-primary transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-foreground text-lg">{issue.subject}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getSeverityColor(issue.severity)}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reported by <span className="font-medium">{issue.reporter}</span> • {issue.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusIcon(issue.status)}
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-foreground capitalize">
                      {issue.status}
                    </span>
                  </div>
                </div>

                {/* Issue Details */}
                <div className="mb-4 p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-foreground">{issue.description}</p>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-border mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm font-semibold text-foreground mt-1">{issue.relatedTransactionId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount Involved</p>
                    <p className="text-lg font-bold text-foreground mt-1">₱{issue.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-semibold text-foreground mt-1 capitalize">{issue.status}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleViewDetails(issue.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-smooth font-medium text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddNote(issue.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary transition-smooth font-medium text-sm"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => handleForwardToAdmin(issue.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth font-medium text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Forward to Admin
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No payment issues found matching your criteria
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
