import { useCallback, useEffect, useState } from 'react';
import { Check, Crown, Star, X } from 'lucide-react';
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

function timeAgo(iso: string | null) {
  if (!iso) return 'never';
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Leader Applications queue. Travelers at Gold+ with a verified ID and a
 * 4+ rating apply in the mobile app; approving makes them a Guild Leader and
 * founds their proposed guild. Decisions happen in an in-place dialog.
 */
export function LeaderApplications({ onDecided }: { onDecided: () => void }) {
  const [rows, setRows] = useState<LeaderApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<{ row: LeaderApplicationRow; approve: boolean } | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const submit = async () => {
    if (!deciding) return;
    setSubmitting(true);
    const { error } = await decideLeaderApplication(deciding.row.id, deciding.approve, notes);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      deciding.approve
        ? `${deciding.row.display_name} is now a Guild Leader of ${deciding.row.guild_name}`
        : `Declined ${deciding.row.display_name}'s application`
    );
    setDeciding(null);
    await load();
    onDecided();
  };

  return (
    <div className="bg-card rounded-2xl shadow-elevation-2 border border-border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-foreground">Leader Applications</h2>
        </div>
        <span className="text-sm text-muted-foreground">{loading ? '' : `${rows.length} waiting`}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Applicants already meet the bar: 10+ completed trips, 2+ hosted trips, a 4+ rating from at least 3 buddies, and a verified ID.
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground mt-4">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">No applications waiting.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-border p-4 flex flex-col gap-3 md:flex-row md:items-start">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{row.display_name}</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    {rankName(row.lifetime_points)} · {row.lifetime_points} pts
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    {row.rating_count === 0 ? 'No ratings yet' : `${row.avg_rating?.toFixed(1)} (${row.rating_count})`}
                  </span>
                  <span className="text-xs text-muted-foreground">· applied {timeAgo(row.created_at)}</span>
                </div>
                <p className="text-sm text-foreground mt-1">
                  Wants to found <span className="font-semibold">{row.guild_name}</span>
                  {row.current_guild ? <span className="text-muted-foreground"> (currently in {row.current_guild})</span> : null}
                </p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">“{row.pitch}”</p>
              </div>
              <div className="flex gap-2 md:flex-col">
                <button
                  onClick={() => open(row, true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg transition-smooth"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => open(row, false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-smooth"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deciding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                  disabled={submitting}
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

  return (
    <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
      <div className="p-6 pb-3">
        <h2 className="text-lg font-bold text-foreground">Leader Scorecards</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Last 30 days of guild activity. Leaders inactive for 30+ days are flagged.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border bg-secondary">
              <th className="px-6 py-3 text-left text-sm font-bold text-foreground">Leader</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-foreground">Guild</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-foreground">New members</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-foreground">Member trips</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-foreground">Guild pts</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-foreground">Join requests</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-foreground">Last active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  No Guild Leaders yet
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const inactive = !row.last_active || Date.now() - new Date(row.last_active).getTime() > 30 * 86_400_000;
                return (
                  <tr key={row.user_id} className="border-b border-border">
                    <td className="px-6 py-3">
                      <p className="font-medium text-foreground">{row.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {rankName(row.lifetime_points)} · {row.lifetime_points} pts
                      </p>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground">
                      {row.guild_name ? `${row.guild_name} (${row.member_count})` : <span className="text-muted-foreground">No guild yet</span>}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-foreground">{row.new_members_30d}</td>
                    <td className="px-6 py-3 text-sm text-foreground">{row.member_trips_30d}</td>
                    <td className="px-6 py-3 text-sm text-foreground">{row.guild_points_30d}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={row.pending_requests > 0 ? 'font-semibold text-amber-600' : 'text-muted-foreground'}>
                        {row.pending_requests} waiting
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {row.avg_response_hours === null ? 'no answers yet' : `answers in ~${row.avg_response_hours}h`}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-sm ${inactive ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                      {timeAgo(row.last_active)}
                      {inactive ? ' · inactive' : ''}
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
