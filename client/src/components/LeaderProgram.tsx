import { useCallback, useEffect, useState } from 'react';
import { Check, Crown, Inbox, Star, X } from 'lucide-react';
import { Avatar, EmptyState, Pill, TableMessage, TD, TH, TR } from '@/components/admin/AdminUI';
import { toast } from 'sonner';
import {
  decideLeaderApplication,
  listLeaderApplications,
  listLeaderScorecards,
  rankName,
  type LeaderApplicationRow,
  type LeaderScorecard,
} from '@/lib/leaderApplications';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';
import { runUndoable, usePendingUndoKeys } from '@/lib/undoable';
import { timeAgo as formatAgo } from '@/lib/datetime';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';

const timeAgo = (iso: string | null) => formatAgo(iso, 'never');

/**
 * Leader Applications queue. Travelers who meet the leader requirements
 * (completed and hosted trips, rating, verified ID) apply in the mobile app; approving makes them a Guild Leader and
 * founds their proposed guild. Decisions happen in an in-place dialog.
 */
export function LeaderApplications({ onDecided, onCount }: { onDecided: () => void; onCount?: (count: number) => void }) {
  const [rows, setRows] = useState<LeaderApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<{ row: LeaderApplicationRow; approve: boolean } | null>(null);
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await listLeaderApplications('pending');
    if (error) toast.error(error.message);
    setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // New applications arrive live; a decision also flips the applicant's role on profiles.
  useTableRealtime(['guild_leader_applications', 'profiles'], () => void load());

  const open = (row: LeaderApplicationRow, approve: boolean) => {
    setNotes('');
    setDeciding({ row, approve });
  };

  const submit = () => {
    if (!deciding) return;
    const { row, approve } = deciding;
    const note = notes;
    setDeciding(null);
    runUndoable({
      key: `leader-app:${row.id}`,
      message: approve ? `Approving ${row.display_name}…` : `Declining ${row.display_name}…`,
      commit: () => decideLeaderApplication(row.id, approve, note),
      onCommitted: () => {
        void load();
        onDecided();
      },
      success: approve
        ? `${row.display_name} is now a Guild Leader of ${row.guild_name}`
        : `Declined ${row.display_name}'s application`,
      error: approve ? 'Could not approve application' : 'Could not decline application',
    });
  };

  const pendingKeys = usePendingUndoKeys();
  const shownRows = rows.filter((row) => !pendingKeys.has(`leader-app:${row.id}`));
  const appsPage = useClientPagination(shownRows);
  const shownCount = shownRows.length;
  useEffect(() => {
    if (!loading) onCount?.(shownCount);
  }, [loading, shownCount, onCount]);

  return (
    <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> Leader applications
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Applicants already meet the bar: 10+ completed trips, 2+ hosted trips, a 4+ rating from at least 3 buddies, and a verified ID.
          </p>
        </div>
        {!loading && <Pill tone={shownRows.length ? 'orange' : 'gray'}>{shownRows.length} waiting</Pill>}
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : shownRows.length === 0 ? (
        <EmptyState icon={Inbox} title="No applications waiting" text="New applications from the app show up here live." />
      ) : (
        <div className="space-y-3 p-5">
          {appsPage.pageItems.map((row) => (
            <div key={row.id} className="rounded-xl border border-border p-4 flex flex-col gap-4 md:flex-row md:items-start hover:border-primary/40 transition-smooth">
              <Avatar name={row.display_name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{row.display_name}</p>
                  <Pill tone="yellow">
                    {rankName(row.lifetime_points)} · {row.lifetime_points} pts
                  </Pill>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {row.rating_count === 0 ? 'No ratings yet' : `${row.avg_rating?.toFixed(1)} (${row.rating_count})`}
                  </span>
                  <span className="text-xs text-muted-foreground">· applied {timeAgo(row.created_at)}</span>
                </div>
                <p className="text-sm text-foreground mt-1.5">
                  Wants to found <span className="font-semibold">{row.guild_name}</span>
                  {row.current_guild ? <span className="text-muted-foreground"> (currently in {row.current_guild})</span> : null}
                </p>
                <blockquote className="mt-2 rounded-lg border-l-2 border-primary/50 bg-secondary/50 px-3 py-2 text-sm text-muted-foreground whitespace-pre-line">
                  {row.pitch}
                </blockquote>
              </div>
              <div className="flex gap-2 md:flex-col md:w-32">
                <button
                  onClick={() => open(row, true)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-smooth"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => open(row, false)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10 transition-smooth"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
              </div>
            </div>
          ))}
          <TablePagination pagination={appsPage} itemLabel="applications" className="px-0 pb-0" />
        </div>
      )}

      {deciding && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {deciding.approve ? 'Approve' : 'Decline'} {deciding.row.display_name}
              </h3>
              <button onClick={() => setDeciding(null)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {deciding.approve
                  ? `They become a Guild Leader, leave their current guild (their points stay with it), and "${deciding.row.guild_name}" is founded for them with approval-required joining.`
                  : 'They get a notification with your note and can apply again later.'}
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={deciding.approve ? 'Welcome note (optional)' : 'Reason (shared with the applicant)'}
                rows={3}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setDeciding(null)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  
                  className={`flex-1 py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors ${
                    deciding.approve ? 'bg-primary text-primary-foreground hover:shadow-lg' : 'bg-destructive text-white hover:bg-destructive/90'
                  }`}
                >
                  {deciding.approve ? 'Approve & found guild' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * How each Guild Leader's guild is doing: growth, activity, and how fast
 * they answer join requests. (Verification reviews are an admin job.)
 */
export function LeaderScorecards({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<LeaderScorecard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void listLeaderScorecards().then(({ data, error }) => {
      if (cancelled) return;
      if (error) toast.error(error.message);
      setRows(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Click a column title: ascending, descending, then off (most guild points first).
  const scoreSort = useSortable(
    rows,
    {
      leader: (r) => r.display_name,
      guild: (r) => r.guild_name,
      newMembers: (r) => Number(r.new_members_30d),
      trips: (r) => Number(r.member_trips_30d),
      points: (r) => Number(r.guild_points_30d),
      requests: (r) => Number(r.pending_requests),
      lastActive: (r) => r.last_active,
    },
    { key: 'points', direction: 'desc' }
  );

  return (
    <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-bold text-foreground">Leader scorecards</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Last 30 days of guild activity. Leaders inactive for 30+ days are flagged.
        </p>
      </div>
      <div className="overflow-x-auto">
        {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
        <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1230 }}>
          <colgroup>
            <col />
            <col />
            <col style={{ width: 160 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 190 }} />
            <col style={{ width: 190 }} />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <SortableTh label="Leader" sortKey="leader" className={TH} sort={scoreSort.sort} onSort={scoreSort.toggle} />
              <SortableTh label="Guild" sortKey="guild" className={TH} sort={scoreSort.sort} onSort={scoreSort.toggle} />
              <SortableTh label="New members" sortKey="newMembers" className={TH} sort={scoreSort.sort} onSort={scoreSort.toggle} />
              <SortableTh label="Member trips" sortKey="trips" className={TH} sort={scoreSort.sort} onSort={scoreSort.toggle} />
              <SortableTh label="Guild pts" sortKey="points" className={TH} sort={scoreSort.sort} onSort={scoreSort.toggle} />
              <SortableTh label="Join requests" sortKey="requests" className={TH} sort={scoreSort.sort} onSort={scoreSort.toggle} />
              <SortableTh label="Last active" sortKey="lastActive" className={TH} sort={scoreSort.sort} onSort={scoreSort.toggle} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <TableMessage colSpan={7} icon={Crown} title="Loading" loading />
            ) : rows.length === 0 ? (
              <TableMessage colSpan={7} icon={Crown} title="No Guild Leaders yet" />
            ) : (
              scoreSort.sorted.map((row) => {
                const inactive = !row.last_active || Date.now() - new Date(row.last_active).getTime() > 30 * 86_400_000;
                return (
                  <tr key={row.user_id} className={TR}>
                    <td className={TD}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={row.display_name} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{row.display_name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {rankName(row.lifetime_points)} · {row.lifetime_points} pts
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground truncate">
                      {row.guild_name ? `${row.guild_name} (${row.member_count})` : <span className="text-muted-foreground">No guild yet</span>}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{row.new_members_30d}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{row.member_trips_30d}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{row.guild_points_30d}</td>
                    <td className="px-5 py-3.5 text-sm">
                      <Pill tone={row.pending_requests > 0 ? 'orange' : 'gray'}>{row.pending_requests} waiting</Pill>
                      <span className="block text-xs text-muted-foreground">
                        {row.avg_response_hours === null ? 'no answers yet' : `answers in ~${row.avg_response_hours}h`}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-sm ${inactive ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                      {timeAgo(row.last_active)}
                      {inactive && (
                        <Pill tone="orange" className="ml-2">
                          inactive
                        </Pill>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
