import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Calendar, Users, TrendingUp, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { listPairingHistory, type PairingHistoryRow } from '@/lib/pairingHistory';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';
import { formatDate } from '@/lib/datetime';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';

/**
 * Admin Pairing History
 *
 * Admin can:
 * - View all user pairings and travel buddy matches
 * - Track pairing success rates
 * - See completion statistics
 * - Monitor pairing patterns
 */
export default function AdminPairingHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pairingHistory, setPairingHistory] = useState<PairingHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // `silent` refreshes (realtime / tab focus) skip the loading state and the
  // error toast.
  const loadPairings = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const { data, error } = await listPairingHistory();
    if (error) {
      setLoadError(error.message);
      if (!silent) toast.error('Failed to load pairing history');
    } else {
      setLoadError(null);
      setPairingHistory(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadPairings();
  }, [loadPairings]);

  // list_pairing_history reads trips, trip_members and feedback.
  useTableRealtime(['trips', 'trip_members', 'feedback'], () => void loadPairings(true));

  const filteredPairings = pairingHistory.filter(pairing => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      pairing.user1_name.toLowerCase().includes(searchLower) ||
      pairing.user2_name.toLowerCase().includes(searchLower) ||
      pairing.destination.toLowerCase().includes(searchLower);

    const matchesFilter = !filterStatus || pairing.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Click a column title: ascending, descending, then off (latest trip first).
  const pairingSort = useSortable(
    filteredPairings,
    {
      users: (p) => p.user1_name,
      trip: (p) => p.destination,
      date: (p) => p.start_at,
      compatibility: (p) => Number(p.compatibility),
      rating: (p) => (p.rating === null ? null : Number(p.rating)),
      status: (p) => p.status,
    },
    { key: 'date', direction: 'desc' }
  );
  const pairingsPage = useClientPagination(pairingSort.sorted, [searchTerm, filterStatus, pairingSort.sort]);

  const ratedPairings = pairingHistory.filter((p) => p.rating !== null);
  const completedPairings = pairingHistory.filter((p) => p.status === 'completed');
  const avgCompatibility = pairingHistory.length
    ? Math.round(pairingHistory.reduce((sum, p) => sum + p.compatibility, 0) / pairingHistory.length)
    : 0;
  const successRate = pairingHistory.length
    ? Math.round((completedPairings.length / pairingHistory.length) * 1000) / 10
    : 0;
  const avgRating = ratedPairings.length
    ? Math.round((ratedPairings.reduce((sum, p) => sum + (p.rating ?? 0), 0) / ratedPairings.length) * 10) / 10
    : 0;

  const stats = [
    {
      label: 'Total Pairings',
      value: pairingHistory.length.toLocaleString(),
      icon: Users,
      color: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      label: 'Avg Compatibility',
      value: `${avgCompatibility}%`,
      icon: TrendingUp,
      color: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500/10',
      textColor: 'text-emerald-500'
    },
    {
      label: 'Avg Rating',
      value: `${avgRating.toFixed(1)}/5.0`,
      icon: TrendingUp,
      color: 'bg-accent/10',
      textColor: 'text-accent'
    },
  ];

  const mostCompatible = [...pairingHistory].sort((a, b) => b.compatibility - a.compatibility).slice(0, 3);
  const highestRated = [...ratedPairings].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  const destinationCounts = pairingHistory.reduce<Record<string, number>>((acc, p) => {
    acc[p.destination] = (acc[p.destination] ?? 0) + 1;
    return acc;
  }, {});
  const popularDestinations = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pairing History</h1>
          <p className="text-sm text-muted-foreground mt-2">Track user pairings and travel buddy matches</p>
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
        <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          {isLoading ? (
            <p className="text-sm text-muted-foreground p-6">Loading pairing history...</p>
          ) : loadError ? (
            <p className="text-sm text-destructive p-6">Failed to load pairing history: {loadError}</p>
          ) : filteredPairings.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No pairings found.</p>
          ) : (
          <div className="overflow-x-auto">
            {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
            <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1060 }}>
              <colgroup>
                <col />
                <col />
                <col style={{ width: 170 }} />
                <col style={{ width: 200 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 140 }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <SortableTh label="Users" sortKey="users" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh label="Trip" sortKey="trip" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh label="Dates" sortKey="date" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh label="Compatibility" sortKey="compatibility" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh label="Rating" sortKey="rating" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh label="Status" sortKey="status" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                </tr>
              </thead>
              <tbody>
                {pairingsPage.pageItems.map((pairing) => (
                  <tr key={pairing.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                    <td className="px-6 py-4">
                      <div className="truncate text-sm font-medium text-foreground">{pairing.user1_name}</div>
                      <div className="truncate text-xs text-muted-foreground">& {pairing.user2_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground capitalize">{pairing.trip_type}</div>
                      <div className="truncate text-xs text-muted-foreground" title={pairing.destination}>{pairing.destination}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-4 h-4" />
                        {formatDate(pairing.start_at)}
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
                      {pairing.rating !== null ? (
                        <span className="text-sm font-medium text-foreground">{pairing.rating.toFixed(1)}/5.0 ⭐</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pairing.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                        }`}
                      >
                        {pairing.status.charAt(0).toUpperCase() + pairing.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination pagination={pairingsPage} itemLabel="pairings" />
          </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Most Compatible Pairs</h3>
            <div className="space-y-3">
              {mostCompatible.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              {mostCompatible.map((pairing) => (
                <div key={pairing.id} className="flex justify-between items-center">
                  <span className="text-sm text-foreground">{pairing.user1_name} & {pairing.user2_name}</span>
                  <span className="text-sm font-bold text-green-500">{pairing.compatibility}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Highest Rated Trips</h3>
            <div className="space-y-3">
              {highestRated.length === 0 && <p className="text-sm text-muted-foreground">No ratings yet.</p>}
              {highestRated.map((pairing) => (
                <div key={pairing.id} className="flex justify-between items-center">
                  <span className="text-sm text-foreground">{pairing.destination}</span>
                  <span className="text-sm font-bold text-accent">{pairing.rating?.toFixed(1)} ⭐</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Popular Destinations</h3>
            <div className="space-y-3">
              {popularDestinations.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              {popularDestinations.map(([destination, count]) => (
                <div key={destination} className="flex justify-between items-center">
                  <span className="text-sm text-foreground">{destination}</span>
                  <span className="text-sm font-bold text-primary">{count} pair{count === 1 ? '' : 's'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
