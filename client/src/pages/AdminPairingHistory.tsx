import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Calendar, CheckCircle2, Heart, MapPin, Search, Star, Trophy, Users } from 'lucide-react';
import { Avatar, Card, EmptyState, PageHeader, Pill, SearchField, Segmented, StatGrid, StatTile, TD, TH, TR, Toolbar } from '@/components/admin/AdminUI';
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

  const mostCompatible = [...pairingHistory].sort((a, b) => b.compatibility - a.compatibility).slice(0, 3);
  const highestRated = [...ratedPairings].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  const destinationCounts = pairingHistory.reduce<Record<string, number>>((acc, p) => {
    acc[p.destination] = (acc[p.destination] ?? 0) + 1;
    return acc;
  }, {});
  const popularDestinations = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const topDestinationCount = popularDestinations[0]?.[1] ?? 1;
  const compatTone = (value: number) => (value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-400' : 'bg-orange-500');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Pairing History" subtitle="Who traveled together, how well they matched, and how it went" />

        <StatGrid>
          <StatTile icon={Users} tone="bg-primary/10 text-primary" label="Total pairings" value={pairingHistory.length.toLocaleString()} />
          <StatTile icon={Heart} tone="bg-pink-500/15 text-pink-600 dark:text-pink-400" label="Avg compatibility" value={`${avgCompatibility}%`} />
          <StatTile
            icon={CheckCircle2}
            tone="bg-green-500/15 text-green-600 dark:text-green-400"
            label="Completed together"
            value={`${successRate}%`}
            onClick={() => setFilterStatus(filterStatus === 'completed' ? '' : 'completed')}
            active={filterStatus === 'completed'}
          />
          <StatTile icon={Star} tone="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" label="Avg rating" value={`${avgRating.toFixed(1)}`} hint={`${ratedPairings.length} rated`} />
        </StatGrid>

        {/* Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Most compatible pairs" icon={Heart} bodyClassName="p-4 space-y-3">
            {mostCompatible.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
            {mostCompatible.map((pairing) => (
              <div key={pairing.id} className="flex items-center gap-3">
                <PairAvatars a={pairing.user1_name} b={pairing.user2_name} />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {pairing.user1_name} & {pairing.user2_name}
                </span>
                <Pill tone="green">{pairing.compatibility}%</Pill>
              </div>
            ))}
          </Card>
          <Card title="Highest rated trips" icon={Trophy} bodyClassName="p-4 space-y-3">
            {highestRated.length === 0 && <p className="text-sm text-muted-foreground">No ratings yet.</p>}
            {highestRated.map((pairing) => (
              <div key={pairing.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
                  <Star className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{pairing.destination}</span>
                <span className="text-sm font-bold text-foreground">{pairing.rating?.toFixed(1)}</span>
              </div>
            ))}
          </Card>
          <Card title="Popular destinations" icon={MapPin} bodyClassName="p-4 space-y-3">
            {popularDestinations.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
            {popularDestinations.map(([destination, count]) => (
              <div key={destination}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate text-foreground">{destination}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {count} pair{count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(count / topDestinationCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </Card>
        </div>

        <Toolbar>
          <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search by users or destination..." />
          <Segmented
            value={filterStatus}
            options={[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
            onChange={setFilterStatus}
          />
        </Toolbar>

        {/* Pairing History Table */}
        <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-secondary animate-pulse" />
              ))}
            </div>
          ) : loadError ? (
            <p className="text-sm text-destructive p-6">Failed to load pairing history: {loadError}</p>
          ) : filteredPairings.length === 0 ? (
            <EmptyState icon={searchTerm || filterStatus ? Search : Users} title="No pairings found" text={searchTerm || filterStatus ? 'Try a different search or filter.' : undefined} />
          ) : (
          <div className="overflow-x-auto">
            {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
            <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1060 }}>
              <colgroup>
                <col />
                <col />
                <col style={{ width: 160 }} />
                <col style={{ width: 200 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 140 }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <SortableTh className={TH} label="Travelers" sortKey="users" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh className={TH} label="Trip" sortKey="trip" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh className={TH} label="Date" sortKey="date" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh className={TH} label="Compatibility" sortKey="compatibility" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh className={TH} label="Rating" sortKey="rating" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                  <SortableTh className={TH} label="Status" sortKey="status" sort={pairingSort.sort} onSort={pairingSort.toggle} />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pairingsPage.pageItems.map((pairing) => (
                  <tr key={pairing.id} className={TR}>
                    <td className={TD}>
                      <div className="flex items-center gap-3 min-w-0">
                        <PairAvatars a={pairing.user1_name} b={pairing.user2_name} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">{pairing.user1_name}</div>
                          <div className="truncate text-xs text-muted-foreground">& {pairing.user2_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className={TD}>
                      <Pill tone={pairing.trip_type === 'tour' ? 'violet' : 'blue'} className="capitalize">
                        {pairing.trip_type}
                      </Pill>
                      <div className="mt-1 truncate text-xs text-muted-foreground" title={pairing.destination}>
                        {pairing.destination}
                      </div>
                    </td>
                    <td className={`${TD} text-sm text-foreground`}>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {formatDate(pairing.start_at)}
                      </div>
                    </td>
                    <td className={TD}>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-secondary rounded-full h-2 overflow-hidden">
                          <div className={`${compatTone(pairing.compatibility)} h-2 rounded-full`} style={{ width: `${pairing.compatibility}%` }} />
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-foreground">{pairing.compatibility}%</span>
                      </div>
                    </td>
                    <td className={TD}>
                      {pairing.rating !== null ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {pairing.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">Not rated yet</span>
                      )}
                    </td>
                    <td className={TD}>
                      <Pill tone={pairing.status === 'completed' ? 'green' : 'blue'} dot>
                        {pairing.status.charAt(0).toUpperCase() + pairing.status.slice(1)}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination pagination={pairingsPage} itemLabel="pairings" />
          </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function PairAvatars({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex shrink-0 -space-x-2">
      <span className="rounded-full ring-2 ring-card">
        <Avatar name={a} size="sm" />
      </span>
      <span className="rounded-full ring-2 ring-card">
        <Avatar name={b} size="sm" />
      </span>
    </div>
  );
}
