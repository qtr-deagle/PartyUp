import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { CreditCard, Download, Search, Filter, TrendingDown, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface Transaction {
    id: number;
    tripId: number;
    tripName: string;
    tripType: 'carpool' | 'tour';
    amount: number;
    currency: string;
    paymentMethod: 'stripe' | 'bank_transfer' | 'wallet' | 'gcash' | 'maya';
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    date: string;
    description: string;
    bookingId?: number;
    refundAmount?: number;
    refundDate?: string;
}

/**
 * PartyUp Transaction History Page
 * 
 * Design: Minimalist Luxury
 * - Display user's payment transaction history
 * - Filter by status, payment method, date range
 * - Search by trip name
 * - Download transaction records
 * - View transaction details with status tracking
 */
export default function TransactionHistory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'stripe' | 'bank_transfer' | 'wallet' | 'gcash' | 'maya'>('all');
    const [dateRangeFilter, setDateRangeFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Mock data - Replace with actual API call
    const [transactions] = useState<Transaction[]>([
        {
            id: 1,
            tripId: 101,
            tripName: 'Makati → Laguna Carpool',
            tripType: 'carpool',
            amount: 360,
            currency: 'PHP',
            paymentMethod: 'gcash',
            status: 'completed',
            date: '2026-02-18',
            description: 'Fuel cost for carpool ride - 45km shared with 3 passengers',
            bookingId: 1001,
        },
        {
            id: 2,
            tripId: 102,
            tripName: 'Manila City Tour',
            tripType: 'tour',
            amount: 1800,
            currency: 'PHP',
            paymentMethod: 'maya',
            status: 'completed',
            date: '2026-02-15',
            description: '5-day city tour package including hotel and meals',
            bookingId: 1002,
        },
        {
            id: 3,
            tripId: 103,
            tripName: 'Boracay Beach Trip',
            tripType: 'tour',
            amount: 2500,
            currency: 'PHP',
            paymentMethod: 'stripe',
            status: 'refunded',
            date: '2026-02-10',
            description: 'Cancelled tour booking - full refund processed',
            refundAmount: 2500,
            refundDate: '2026-02-12',
            bookingId: 1003,
        },
        {
            id: 4,
            tripId: 104,
            tripName: 'Tagaytay Day Tour',
            tripType: 'carpool',
            amount: 450,
            currency: 'PHP',
            paymentMethod: 'wallet',
            status: 'pending',
            date: '2026-02-20',
            description: 'Pending payment - Due by 2026-02-25',
            bookingId: 1004,
        },
        {
            id: 5,
            tripId: 105,
            tripName: 'Batangas Volcano Tour',
            tripType: 'tour',
            amount: 1500,
            currency: 'PHP',
            paymentMethod: 'gcash',
            status: 'failed',
            date: '2026-02-08',
            description: 'Payment declined - Network timeout',
            bookingId: 1005,
        },
        {
            id: 6,
            tripId: 106,
            tripName: 'Laguna → Manila Carpool',
            tripType: 'carpool',
            amount: 320,
            currency: 'PHP',
            paymentMethod: 'maya',
            status: 'completed',
            date: '2026-02-05',
            description: 'Fuel cost for morning commute carpool',
            bookingId: 1006,
        },
    ]);

    // Calculate statistics
    const stats = {
        totalSpent: transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0),
        totalTransactions: transactions.length,
        completedTransactions: transactions.filter(t => t.status === 'completed').length,
        pendingAmount: transactions
            .filter(t => t.status === 'pending')
            .reduce((sum, t) => sum + t.amount, 0),
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        // Search filter
        if (searchTerm && !transaction.tripName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Status filter
        if (statusFilter !== 'all' && transaction.status !== statusFilter) {
            return false;
        }

        // Payment method filter
        if (paymentMethodFilter !== 'all' && transaction.paymentMethod !== paymentMethodFilter) {
            return false;
        }

        // Date range filter
        if (dateRangeFilter !== 'all') {
            const transactionDate = new Date(transaction.date);
            const today = new Date();
            const daysAgo = dateRangeFilter === '7days' ? 7 : dateRangeFilter === '30days' ? 30 : 90;
            const filterDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);

            if (transactionDate < filterDate) {
                return false;
            }
        }

        return true;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            completed: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle, label: 'Completed' },
            pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
            failed: { bg: 'bg-red-50', text: 'text-red-700', icon: AlertCircle, label: 'Failed' },
            refunded: { bg: 'bg-blue-50', text: 'text-blue-700', icon: RefreshCw, label: 'Refunded' },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.text} font-medium`}>
                <Icon size={16} />
                <span>{config.label}</span>
            </div>
        );
    };

    const getPaymentMethodLabel = (method: string) => {
        const methodLabels: Record<string, string> = {
            'stripe': '💳 Credit Card',
            'bank_transfer': '🏦 Bank Transfer',
            'wallet': '👛 Wallet',
            'gcash': '📱 GCash',
            'maya': '📱 Maya',
        };
        return methodLabels[method] || method;
    };

    const handleExportCSV = () => {
        const csv = [
            ['Trip Name', 'Type', 'Amount', 'Payment Method', 'Status', 'Date'],
            ...filteredTransactions.map(t => [
                t.tripName,
                t.tripType,
                `${t.amount} ${t.currency}`,
                getPaymentMethodLabel(t.paymentMethod),
                t.status,
                t.date,
            ]),
        ]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <CreditCard className="text-primary" size={32} />
                                    Transaction History
                                </h1>
                                <p className="text-slate-600 mt-2">Track all your payments and trip transactions</p>
                            </div>
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Download size={20} />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Spent */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Spent</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">
                                        ₱{stats.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <TrendingDown className="text-green-600" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Total Transactions */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Transactions</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTransactions}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <CreditCard className="text-blue-600" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Completed Transactions */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Completed</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.completedTransactions}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg">
                                    <CheckCircle className="text-emerald-600" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Pending Amount */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Pending Amount</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">
                                        ₱{stats.pendingAmount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <Clock className="text-amber-600" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Filter size={20} />
                                Filters
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Search Trip</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by trip name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="completed">Completed</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>

                                {/* Payment Method Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                                    <select
                                        value={paymentMethodFilter}
                                        onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="all">All Methods</option>
                                        <option value="gcash">GCash</option>
                                        <option value="maya">Maya</option>
                                        <option value="stripe">Credit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="wallet">Wallet</option>
                                    </select>
                                </div>

                                {/* Date Range Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                                    <select
                                        value={dateRangeFilter}
                                        onChange={(e) => setDateRangeFilter(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="7days">Last 7 Days</option>
                                        <option value="30days">Last 30 Days</option>
                                        <option value="90days">Last 90 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {filteredTransactions.length > 0 ? (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Trip</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Payment Method</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((transaction, index) => (
                                                <tr
                                                    key={transaction.id}
                                                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                                        }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{transaction.tripName}</p>
                                                            <p className="text-sm text-slate-500">Booking #{transaction.bookingId}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${transaction.tripType === 'carpool'
                                                                ? 'bg-blue-50 text-blue-700'
                                                                : 'bg-purple-50 text-purple-700'
                                                            }`}>
                                                            {transaction.tripType === 'carpool' ? '🚗 Carpool' : '✈️ Tour'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-slate-900">
                                                            ₱{transaction.amount.toLocaleString()}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-700">{getPaymentMethodLabel(transaction.paymentMethod)}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(transaction.status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-600">{new Date(transaction.date).toLocaleDateString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => setSelectedTransaction(transaction)}
                                                            className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4 p-4">
                                    {filteredTransactions.map((transaction) => (
                                        <div key={transaction.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-900">{transaction.tripName}</p>
                                                    <p className="text-xs text-slate-500">Booking #{transaction.bookingId}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${transaction.tripType === 'carpool'
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-purple-50 text-purple-700'
                                                    }`}>
                                                    {transaction.tripType === 'carpool' ? '🚗 Carpool' : '✈️ Tour'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-slate-600">Amount</p>
                                                    <p className="font-semibold text-slate-900">₱{transaction.amount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-600">Date</p>
                                                    <p className="font-semibold text-slate-900">{new Date(transaction.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                                <div className="text-sm">
                                                    <p className="text-slate-600 text-xs">Status</p>
                                                    {getStatusBadge(transaction.status)}
                                                </div>
                                                <button
                                                    onClick={() => setSelectedTransaction(transaction)}
                                                    className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <CreditCard className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-600 font-medium">No transactions found</p>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search term</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction Details Modal */}
                {selectedTransaction && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Transaction Details</h2>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-slate-500 hover:text-slate-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-600">Trip</p>
                                    <p className="font-semibold text-slate-900">{selectedTransaction.tripName}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-600">Description</p>
                                    <p className="text-slate-700">{selectedTransaction.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-600">Amount</p>
                                        <p className="font-semibold text-slate-900">
                                            ₱{selectedTransaction.amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Payment Method</p>
                                        <p className="text-slate-700">{getPaymentMethodLabel(selectedTransaction.paymentMethod)}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-600">Status</p>
                                    {getStatusBadge(selectedTransaction.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-600">Date</p>
                                        <p className="text-slate-700">{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Booking ID</p>
                                        <p className="text-slate-700">#{selectedTransaction.bookingId}</p>
                                    </div>
                                </div>

                                {selectedTransaction.refundAmount && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-slate-600">Refund Amount</p>
                                        <p className="font-semibold text-blue-700">
                                            ₱{selectedTransaction.refundAmount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-2">
                                            Refunded on {new Date(selectedTransaction.refundDate!).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="w-full mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
