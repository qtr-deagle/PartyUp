import React, { useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, Users, TrendingUp, Filter, Calendar } from 'lucide-react';

/**
 * Staff Pairing History (View Only)
 * 
 * Staff can:
 * - View all user pairings and travel buddy matches
 * - Monitor pairing success rates
 * - See completion statistics
 * - Track pairing patterns
 */
export default function StaffPairingHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const pairingHistory = [
    {
      id: 1,
      user1: 'Sarah Johnson',
      user2: 'Mike Chen',
      tripType: 'Carpool',
      destination: 'Boracay',
      startDate: '2026-03-15',
      status: 'completed',
      rating: 4.8,
      compatibility: 92,
    },
    {
      id: 2,
      user1: 'Lisa Rodriguez',
      user2: 'John Smith',
      tripType: 'Tour',
      destination: 'Manila City Tour',
      startDate: '2026-02-20',
      status: 'completed',
      rating: 5.0,
      compatibility: 98,
    },
    {
      id: 3,
      user1: 'Emma Davis',
      user2: 'Tom Brown',
      tripType: 'Carpool',
      destination: 'Tagaytay',
      startDate: '2026-03-10',
      status: 'completed',
      rating: 3.5,
      compatibility: 76,
    },
    {
      id: 4,
      user1: 'Alex Wilson',
      user2: 'Grace Lee',
      tripType: 'Tour',
      destination: 'Historical Sites',
      startDate: '2026-03-20',
      status: 'active',
      rating: null,
      compatibility: 89,
    },
  ];

  const filteredPairings = pairingHistory.filter(pairing => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      pairing.user1.toLowerCase().includes(searchLower) ||
      pairing.user2.toLowerCase().includes(searchLower) ||
      pairing.destination.toLowerCase().includes(searchLower);

    const matchesFilter = !filterStatus || pairing.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      label: 'Total Pairings',
      value: '1,847',
      icon: Users,
      color: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      label: 'Avg Compatibility',
      value: '88.2%',
      icon: TrendingUp,
      color: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      label: 'Success Rate',
      value: '92.5%',
      icon: TrendingUp,
      color: 'bg-emerald-500/10',
      textColor: 'text-emerald-500'
    },
    {
      label: 'Avg Rating',
      value: '4.6/5.0',
      icon: TrendingUp,
      color: 'bg-accent/10',
      textColor: 'text-accent'
    },
  ];

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pairing History</h1>
          <p className="text-sm text-muted-foreground mt-2">Monitor user pairings and travel buddy matches (Staff View)</p>
        </div>

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
              placeholder="Search by users or destination..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Pairing History Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Users</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Trip</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Compatibility</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPairings.map((pairing) => (
                  <tr key={pairing.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{pairing.user1}</div>
                      <div className="text-xs text-muted-foreground">& {pairing.user2}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{pairing.tripType}</div>
                      <div className="text-xs text-muted-foreground">{pairing.destination}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-4 h-4" />
                        {pairing.startDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${pairing.compatibility}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">{pairing.compatibility}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pairing.rating ? (
                        <span className="text-sm font-medium text-foreground">{pairing.rating.toFixed(1)}/5.0 ⭐</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pairing.status === 'completed'
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                            : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {pairing.status.charAt(0).toUpperCase() + pairing.status.slice(1)}
                      </span>
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
            <strong>Note:</strong> This is a view-only interface for staff monitoring. Staff can track pairing patterns,
            compatibility scores, and success rates. For detailed analysis or interventions, contact the admin panel.
          </p>
        </div>
      </div>
    </StaffLayout>
  );
}
