import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import GuildDetailDialog from '@/components/GuildDetailDialog';
import GuildEmblem from '@/components/GuildEmblem';
import { Check, ChevronRight, Coins, Crown, Edit2, EyeOff, Flame, Gift, Mail, Minus, Package, Plus, Search, Sparkles, Trash2, Trophy, Users, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { SearchField, Segmented } from '@/components/review/ReviewWorkspace';
import { toast } from 'sonner';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import SortableTh from '@/components/SortableTh';
import TablePagination from '@/components/TablePagination';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { REASON_PRESETS } from '@/lib/reasonPresets';
import { confirmDiscard } from '@/lib/unsavedChanges';
import { instantUndoable, runUndoable, usePendingUndoKeys } from '@/lib/undoable';
import { formatDateTime } from '@/lib/datetime';
import {
  GUILD_LEVEL_STEP,
  adjustPointsByEmail,
  deleteGuild,
  getGuildLeaderboard,
  guildLevel,
  handleRedemption,
  listAllRewards,
  listRedemptions,
  roleLabel,
  saveReward,
  type GuildReward,
  type GuildStanding,
  type LeaderboardPeriod,
  type RedemptionRow,
  type RedemptionStatus,
  type RewardAudience,
  type RewardInput,
} from '@/lib/guilds';

type Tab = 'redemptions' | 'rewards' | 'guilds' | 'points';

const AUDIENCE_LABEL: Record<RewardAudience, string> = {
  everyone: 'Everyone',
  guild_leader: 'Guild Leaders',
  traveler: 'Travelers',
};

const STATUS_STYLE: Record<RedemptionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  fulfilled: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
};

const EMPTY_REWARD: RewardInput = { title: '', description: '', cost: 100, audience: 'everyone', stock: null, is_active: true };

/**
 * Admin Guilds & Rewards
 *
 * - Redemptions: fulfill (by hand) or decline reward requests; declining refunds the coins
 * - Rewards: manage the catalog (cost, audience, stock, active)
 * - Guilds: rankings, and disband a guild if needed
 * - Points: manual +/- adjustments with a required reason (audited)
 */
export default function AdminGuilds() {
  const [tab, setTab] = useState<Tab>('guilds');
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<RedemptionStatus | ''>('pending');
  const [rewards, setRewards] = useState<GuildReward[]>([]);
  const [standings, setStandings] = useState<GuildStanding[]>([]);
  const [period, setPeriod] = useState<LeaderboardPeriod>('month');
  const [isLoading, setIsLoading] = useState(true);
  const isSubmitting = false;

  const [handling, setHandling] = useState<{ row: RedemptionRow; status: 'fulfilled' | 'rejected' } | null>(null);
  const [editingReward, setEditingReward] = useState<{ id?: string; values: RewardInput; start?: RewardInput } | null>(null);
  // Cancel asks first when the reward form was changed.
  const closeRewardEditor = () =>
    confirmDiscard(!!editingReward && JSON.stringify(editingReward.values) !== JSON.stringify(editingReward.start), () => setEditingReward(null), {
      message: editingReward?.id ? "Your changes to this reward won't be saved." : "This reward isn't added yet. Discard it?",
    });
  const [disbanding, setDisbanding] = useState<Pick<GuildStanding, 'guild_id' | 'name' | 'member_count'> | null>(null);
  const [viewingGuildId, setViewingGuildId] = useState<string | null>(null);
  const [adjust, setAdjust] = useState({ email: '', amount: '', note: '' });
  const [confirmAdjust, setConfirmAdjust] = useState(false);
  const [adjustMode, setAdjustMode] = useState<'give' | 'remove'>('give');
  const [guildSearch, setGuildSearch] = useState('');
  // The amount field holds the size; the Give/Remove toggle holds the sign.
  const signedAmount = (adjustMode === 'remove' ? -1 : 1) * Number(adjust.amount);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      const [redemptionResult, rewardResult, standingResult] = await Promise.all([
        listRedemptions(statusFilter || undefined),
        listAllRewards(),
        getGuildLeaderboard(period),
      ]);
      const error = redemptionResult.error ?? rewardResult.error ?? standingResult.error;
      if (error && !silent) toast.error(error.message);
      setRedemptions(redemptionResult.data);
      setRewards(rewardResult.data);
      setStandings(standingResult.data);
      setIsLoading(false);
    },
    [statusFilter, period]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useTableRealtime(['guild_reward_redemptions', 'guild_rewards', 'guilds', 'guild_point_events'], () => void load(true));

  const pendingCount = useMemo(() => redemptions.filter((row) => row.status === 'pending').length, [redemptions]);

  const pendingKeys = usePendingUndoKeys();
  const shownRedemptions = redemptions.filter((row) => !pendingKeys.has(`redemption:${row.id}`));
  // Click a column title: ascending, descending, then off (newest first).
  const redemptionSort = useSortable(
    shownRedemptions,
    {
      reward: (r) => r.reward?.title,
      requester: (r) => r.user?.display_name,
      cost: (r) => Number(r.cost),
      status: (r) => r.status,
      requested: (r) => r.created_at,
    },
    { key: 'requested', direction: 'desc' }
  );
  const redemptionsPage = useClientPagination(redemptionSort.sorted, [statusFilter, redemptionSort.sort]);

  const submitHandle = (notes: string) => {
    if (!handling) return;
    const { row, status } = handling;
    setHandling(null);
    runUndoable({
      key: `redemption:${row.id}`,
      message: status === 'fulfilled' ? `Fulfilling "${row.reward?.title ?? 'reward'}"…` : `Declining "${row.reward?.title ?? 'reward'}"…`,
      commit: () => handleRedemption(row.id, status, notes),
      onCommitted: () => void load(true),
      success: status === 'fulfilled' ? 'Marked as fulfilled' : `Declined and refunded ${row.cost} coins`,
      error: 'Could not update the redemption',
    });
  };

  const submitReward = () => {
    if (!editingReward) return;
    const { values, id } = editingReward;
    if (values.title.trim().length < 2) {
      toast.error('Give the reward a title.');
      return;
    }
    if (!Number.isInteger(values.cost) || values.cost <= 0) {
      toast.error('Cost must be a whole number above 0.');
      return;
    }
    setEditingReward(null);
    runUndoable({
      key: `reward-save:${id ?? values.title.trim().toLowerCase()}`,
      message: id ? `Saving "${values.title.trim()}"…` : `Adding "${values.title.trim()}"…`,
      commit: () => saveReward(values, id),
      onCommitted: () => void load(true),
      success: id ? 'Reward updated' : 'Reward added',
      error: id ? 'Could not update reward' : 'Could not add reward',
    });
  };

  const rewardInput = (reward: GuildReward, isActive: boolean): RewardInput => ({
    title: reward.title,
    description: reward.description ?? '',
    cost: reward.cost,
    audience: reward.audience,
    stock: reward.stock,
    is_active: isActive,
  });

  // A silent catalog toggle: save now, Undo flips it back.
  const toggleReward = (reward: GuildReward) =>
    instantUndoable({
      key: `reward-toggle:${reward.id}`,
      run: () => saveReward(rewardInput(reward, !reward.is_active), reward.id),
      revert: () => saveReward(rewardInput(reward, reward.is_active), reward.id),
      success: reward.is_active ? `"${reward.title}" hidden from the catalog` : `"${reward.title}" is visible again`,
      error: 'Could not update reward',
      onDone: () => void load(true),
    });

  // Disbanding can't be undone, so it's confirm-only.
  const submitDisband = async () => {
    if (!disbanding) return;
    const { error } = await deleteGuild(disbanding);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(`${disbanding.name} was disbanded`);
    if (viewingGuildId === disbanding.guild_id) setViewingGuildId(null);
    void load(true);
  };

  const submitAdjust = () => {
    const amount = signedAmount;
    if (!adjust.email.trim()) {
      toast.error("Enter the user's email.");
      return;
    }
    if (!Number.isInteger(amount) || amount === 0) {
      toast.error('Amount must be a whole number above 0.');
      return;
    }
    if (!adjust.note.trim()) {
      toast.error('Add a reason for the adjustment.');
      return;
    }
    setConfirmAdjust(true);
  };

  const applyAdjust = () => {
    const amount = signedAmount;
    const { email, note } = adjust;
    setAdjust({ email: '', amount: '', note: '' });
    const verb = amount > 0 ? `Adding ${amount} points to` : `Removing ${Math.abs(amount)} points from`;
    runUndoable({
      key: `points:${email.trim().toLowerCase()}:${Date.now()}`,
      message: `${verb} ${email.trim()}…`,
      commit: async () => {
        const result = await adjustPointsByEmail(email, amount, note);
        return { error: result.error };
      },
      success: `${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} points ${amount > 0 ? 'to' : 'from'} ${email.trim()}`,
      error: 'Could not adjust points',
    });
  };

  const tabs = [
    { value: 'guilds' as const, label: <><Trophy className="w-4 h-4" /> Guilds</> },
    {
      value: 'redemptions' as const,
      label: (
        <>
          <Gift className="w-4 h-4" /> Redemptions
          {statusFilter === 'pending' && pendingCount > 0 && (
            <span className="min-w-5 rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">{pendingCount}</span>
          )}
        </>
      ),
    },
    { value: 'rewards' as const, label: <><Coins className="w-4 h-4" /> Reward Catalog</> },
    { value: 'points' as const, label: <><Sparkles className="w-4 h-4" /> Adjust Points</> },
  ];

  const inputClass =
    'w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth';

  const term = guildSearch.trim().toLowerCase();
  const filteredStandings = term
    ? standings.filter((row) => row.name.toLowerCase().includes(term) || row.leader_name?.toLowerCase().includes(term))
    : standings;
  const podium = term ? [] : standings.slice(0, 3);
  const rest = term ? filteredStandings : standings.slice(3);
  const topPoints = Math.max(1, ...standings.map((row) => row.points));
  const periodPoints = standings.reduce((sum, row) => sum + row.points, 0);
  const activeRewards = rewards.filter((reward) => reward.is_active).length;
  const knowsPending = statusFilter === 'pending' || statusFilter === '';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guilds &amp; Rewards</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
              Guild Leaders and travelers earn points for real work and trips. Coins buy rewards that admins fulfill by hand.
            </p>
          </div>
          <Segmented value={tab} options={tabs} onChange={setTab} />
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatTile icon={Trophy} tone="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" label="Guilds" value={standings.length} />
          <StatTile
            icon={Flame}
            tone="bg-orange-500/15 text-orange-600 dark:text-orange-400"
            label={`Points ${PERIOD_LABEL[period].toLowerCase()}`}
            value={periodPoints.toLocaleString()}
          />
          <StatTile
            icon={Gift}
            tone="bg-primary/10 text-primary"
            label="Pending redemptions"
            value={knowsPending ? pendingCount : '—'}
            onClick={() => {
              setStatusFilter('pending');
              setTab('redemptions');
            }}
          />
          <StatTile
            icon={Coins}
            tone="bg-green-500/15 text-green-600 dark:text-green-400"
            label="Active rewards"
            value={`${activeRewards}/${rewards.length}`}
            onClick={() => setTab('rewards')}
          />
        </div>

        {/* Guilds */}
        {tab === 'guilds' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                value={period}
                options={(['week', 'month', 'all'] as const).map((value) => ({ value, label: PERIOD_LABEL[value] }))}
                onChange={setPeriod}
              />
              <SearchField value={guildSearch} onChange={setGuildSearch} placeholder="Search guild or leader..." />
            </div>

            {isLoading && standings.length === 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-56 rounded-2xl bg-card border border-border animate-pulse" />
                ))}
              </div>
            ) : standings.length === 0 ? (
              <EmptyState icon={Trophy} title="No guilds yet" text="Guild Leaders found them in the mobile app." />
            ) : (
              <>
                {podium.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-3 md:items-end">
                    {podium.map((row, index) => (
                      <PodiumCard
                        key={row.guild_id}
                        row={row}
                        rank={index + 1}
                        onOpen={() => setViewingGuildId(row.guild_id)}
                        onDisband={() => setDisbanding(row)}
                      />
                    ))}
                  </div>
                )}

                {rest.length > 0 ? (
                  <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden divide-y divide-border">
                    {rest.map((row) => {
                      const rank = standings.indexOf(row) + 1;
                      const level = guildLevel(row.lifetime_points);
                      return (
                        <div
                          key={row.guild_id}
                          onClick={() => setViewingGuildId(row.guild_id)}
                          className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] md:grid-cols-[2.5rem_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-secondary/50 transition-smooth"
                        >
                          <span className={`text-center text-sm font-bold ${rank <= 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}>#{rank}</span>
                          <div className="flex items-center gap-3 min-w-0">
                            <GuildEmblem emblem={row.emblem} color={row.color} size={40} />
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{row.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                <Crown className="inline w-3 h-3 -mt-0.5 mr-1" />
                                {row.leader_name} · <Users className="inline w-3 h-3 -mt-0.5 mr-0.5" /> {row.member_count} · Lv {level}
                              </p>
                            </div>
                          </div>
                          <div className="hidden md:block">
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(row.points / topPoints) * 100}%`, backgroundColor: row.color }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 text-right font-bold tabular-nums text-foreground">
                              {row.points.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">pts</span>
                            </span>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setDisbanding(row);
                              }}
                              title="Disband guild"
                              className="p-2 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-smooth"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  term && <EmptyState icon={Search} title="No guilds match your search" text="Try a different guild or leader name." />
                )}
              </>
            )}
          </div>
        )}

        {/* Redemptions */}
        {tab === 'redemptions' && (
          <div className="space-y-4">
            <Segmented
              value={statusFilter}
              options={[
                { value: 'pending' as const, label: 'Pending' },
                { value: 'fulfilled' as const, label: 'Fulfilled' },
                { value: 'rejected' as const, label: 'Declined' },
                { value: '' as const, label: 'All' },
              ]}
              onChange={setStatusFilter}
            />
            <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                {/* Fixed column widths so sorting or paging doesn't shift the columns. */}
                <table className="w-full table-fixed [&_td]:whitespace-nowrap" style={{ minWidth: 1120 }}>
                  <colgroup>
                    <col />
                    <col style={{ width: 260 }} />
                    <col style={{ width: 130 }} />
                    <col style={{ width: 170 }} />
                    <col style={{ width: 190 }} />
                    <col style={{ width: 210 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <SortableTh className={TH} label="Reward" sortKey="reward" sort={redemptionSort.sort} onSort={redemptionSort.toggle} />
                      <SortableTh className={TH} label="Requested by" sortKey="requester" sort={redemptionSort.sort} onSort={redemptionSort.toggle} />
                      <SortableTh className={TH} label="Cost" sortKey="cost" sort={redemptionSort.sort} onSort={redemptionSort.toggle} />
                      <SortableTh className={TH} label="Status" sortKey="status" sort={redemptionSort.sort} onSort={redemptionSort.toggle} />
                      <SortableTh className={TH} label="Requested" sortKey="requested" sort={redemptionSort.sort} onSort={redemptionSort.toggle} />
                      <th className={`${TH} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">Loading...</td>
                      </tr>
                    ) : shownRedemptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-14 text-center">
                          <Gift className="mx-auto mb-3 w-10 h-10 text-muted-foreground/40" />
                          <p className="text-sm font-medium text-foreground">No redemptions here</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {statusFilter === 'pending' ? "You're all caught up." : 'Try another filter.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      redemptionsPage.pageItems.map((row) => (
                        <tr key={row.id} className="hover:bg-secondary/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Gift className="w-4 h-4" />
                              </span>
                              <span className="truncate text-sm font-semibold text-foreground" title={row.reward?.title ?? undefined}>
                                {row.reward?.title ?? 'Reward'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                                {(row.user?.display_name ?? '?').charAt(0).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{row.user?.display_name ?? 'Unknown'}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {row.user?.email ?? ''} · {roleLabel(row.user?.role)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <CoinPill amount={row.cost} />
                          </td>
                          <td className="px-5 py-3.5 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[row.status]}`}>
                              {row.status === 'rejected' ? 'declined' : row.status}
                            </span>
                            {row.admin_notes && (
                              <p className="mt-1 truncate text-xs text-muted-foreground" title={row.admin_notes}>
                                {row.admin_notes}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDateTime(row.created_at)}</td>
                          <td className="px-5 py-3.5 text-right">
                            {row.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setHandling({ row, status: 'rejected' })}
                                  className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                                >
                                  <X className="w-3.5 h-3.5" /> Decline
                                </button>
                                <button
                                  onClick={() => setHandling({ row, status: 'fulfilled' })}
                                  className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                                >
                                  <Check className="w-3.5 h-3.5" /> Fulfill
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <TablePagination pagination={redemptionsPage} itemLabel="redemptions" />
            </div>
          </div>
        )}

        {/* Reward catalog */}
        {tab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onEdit={() => setEditingReward({ id: reward.id, values: rewardInput(reward, reward.is_active), start: rewardInput(reward, reward.is_active) })}
                onToggle={() => void toggleReward(reward)}
              />
            ))}
            <button
              onClick={() => setEditingReward({ values: { ...EMPTY_REWARD }, start: { ...EMPTY_REWARD } })}
              className="min-h-[13rem] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-smooth"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Plus className="w-6 h-6" />
              </span>
              <span className="text-sm font-semibold">Add reward</span>
            </button>
          </div>
        )}

        {/* Adjust points */}
        {tab === 'points' && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] max-w-5xl">
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Manual adjustment</h2>
                <p className="text-sm text-muted-foreground mt-1">Correct a mistake or reward special effort. Every adjustment is written to the Audit Log.</p>
              </div>
              <Segmented
                value={adjustMode}
                options={[
                  { value: 'give' as const, label: <><Plus className="w-4 h-4" /> Give points</> },
                  { value: 'remove' as const, label: <><Minus className="w-4 h-4" /> Remove points</> },
                ]}
                onChange={setAdjustMode}
              />
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">User email</span>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={adjust.email}
                    onChange={(e) => setAdjust({ ...adjust, email: e.target.value })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </label>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Amount</span>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  value={adjust.amount}
                  onChange={(e) => setAdjust({ ...adjust, amount: e.target.value.replace('-', '') })}
                  className={inputClass}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {[10, 25, 50, 100, 250].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAdjust({ ...adjust, amount: String(value) })}
                      className={`h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${
                        adjust.amount === String(value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {adjustMode === 'give' ? '+' : '−'}
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Reason</span>
                <input
                  type="text"
                  placeholder="Shown in their points history"
                  value={adjust.note}
                  onChange={(e) => setAdjust({ ...adjust, note: e.target.value })}
                  className={inputClass}
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REASON_PRESETS.pointsAdjust.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setAdjust({ ...adjust, note: preset.text })}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      adjust.note === preset.text
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border flex flex-col gap-4 lg:self-start">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
              <div className={`rounded-xl p-5 text-center ${adjustMode === 'give' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <p className={`text-4xl font-bold tabular-nums ${adjustMode === 'give' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {adjustMode === 'give' ? '+' : '−'}
                  {Number(adjust.amount) > 0 ? Number(adjust.amount).toLocaleString() : 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">points</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{adjustMode === 'give' ? 'To' : 'From'}</span>
                  <span className="truncate font-medium text-foreground">{adjust.email.trim() || '—'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="truncate font-medium text-foreground">{adjust.note.trim() || '—'}</span>
                </div>
              </div>
              <button
                onClick={submitAdjust}
                className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-smooth"
              >
                Review &amp; apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fulfill / decline dialog */}
      <ConfirmActionDialog
        open={handling !== null}
        onOpenChange={(open) => !open && setHandling(null)}
        tone={handling?.status === 'rejected' ? 'destructive' : 'default'}
        title={handling?.status === 'fulfilled' ? 'Mark as fulfilled?' : 'Decline request?'}
        description={
          <>
            <span className="font-medium text-foreground">{handling?.row.reward?.title}</span> for{' '}
            <span className="font-medium text-foreground">{handling?.row.user?.display_name}</span>.{' '}
            {handling?.status === 'fulfilled'
              ? 'Only confirm once you have actually delivered it.'
              : `Their ${handling?.row.cost ?? 0} coins will be refunded.`}
          </>
        }
        notes={{
          label: handling?.status === 'fulfilled' ? 'Note to the user' : 'Reason',
          required: handling?.status === 'rejected',
          placeholder: 'Add details (optional)',
          presets: handling?.status === 'fulfilled' ? REASON_PRESETS.redemptionFulfil : REASON_PRESETS.redemptionDecline,
          audience: 'The user',
        }}
        confirmLabel={handling?.status === 'fulfilled' ? 'Mark fulfilled' : 'Decline & refund'}
        onConfirm={(notes) => submitHandle(notes)}
      />

      {/* Reward editor */}
      {editingReward && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">{editingReward.id ? 'Edit Reward' : 'Add Reward'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Title"
                maxLength={60}
                value={editingReward.values.title}
                onChange={(e) => setEditingReward({ ...editingReward, values: { ...editingReward.values, title: e.target.value } })}
                className={inputClass}
              />
              <textarea
                placeholder="Description (what they get, how it's delivered)"
                maxLength={300}
                rows={3}
                value={editingReward.values.description}
                onChange={(e) => setEditingReward({ ...editingReward, values: { ...editingReward.values, description: e.target.value } })}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-muted-foreground">
                  Cost (coins)
                  <input
                    type="number"
                    min={1}
                    value={editingReward.values.cost}
                    onChange={(e) => setEditingReward({ ...editingReward, values: { ...editingReward.values, cost: Number(e.target.value) } })}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Stock (blank = unlimited)
                  <input
                    type="number"
                    min={0}
                    value={editingReward.values.stock ?? ''}
                    onChange={(e) =>
                      setEditingReward({
                        ...editingReward,
                        values: { ...editingReward.values, stock: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) },
                      })
                    }
                    className={`${inputClass} mt-1`}
                  />
                </label>
              </div>
              <select
                value={editingReward.values.audience}
                onChange={(e) => setEditingReward({ ...editingReward, values: { ...editingReward.values, audience: e.target.value as RewardAudience } })}
                className={inputClass}
              >
                <option value="everyone">Everyone</option>
                <option value="guild_leader">Guild Leaders only</option>
                <option value="traveler">Travelers only</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={editingReward.values.is_active}
                  onChange={(e) => setEditingReward({ ...editingReward, values: { ...editingReward.values, is_active: e.target.checked } })}
                />
                Visible in the app
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeRewardEditor}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitReward()}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guild inspector */}
      {viewingGuildId && <GuildDetailDialog guildId={viewingGuildId} onClose={() => setViewingGuildId(null)} onDisband={setDisbanding} />}

      {/* Disband confirmation (no Undo: the guild is deleted) */}
      <ConfirmActionDialog
        open={disbanding !== null}
        onOpenChange={(open) => !open && setDisbanding(null)}
        tone="destructive"
        title={`Disband ${disbanding?.name ?? 'guild'}?`}
        description={`All ${disbanding?.member_count ?? 0} members are removed from the guild and notified. Everyone keeps their personal points and coins. This can't be undone.`}
        typeToConfirm={disbanding?.name}
        confirmLabel="Disband guild"
        onConfirm={submitDisband}
      />

      {/* Adjust points confirmation */}
      <ConfirmActionDialog
        open={confirmAdjust}
        onOpenChange={setConfirmAdjust}
        title={signedAmount > 0 ? `Give ${Math.abs(signedAmount)} points?` : `Remove ${Math.abs(signedAmount)} points?`}
        description={
          <>
            {signedAmount > 0 ? 'Adds' : 'Removes'}{' '}
            <span className="font-medium text-foreground">{Math.abs(signedAmount)} points</span>{' '}
            {signedAmount > 0 ? 'to' : 'from'} <span className="font-medium text-foreground">{adjust.email.trim()}</span>.
            Reason: &ldquo;{adjust.note.trim()}&rdquo;. It shows in their points history and the Audit Log.
          </>
        }
        confirmLabel="Apply adjustment"
        onConfirm={applyAdjust}
      />
    </AdminLayout>
  );
}

const TH = 'px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground';

const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
  week: 'This week',
  month: 'This month',
  all: 'All time',
};

const MEDAL = [
  { badge: 'bg-yellow-400 text-yellow-950', label: 'Champion' },
  { badge: 'bg-slate-300 text-slate-800', label: 'Runner-up' },
  { badge: 'bg-amber-600 text-amber-50', label: 'Third place' },
];

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
  onClick,
}: {
  icon: typeof Gift;
  tone: string;
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0 text-left">
        <p className="text-2xl font-bold leading-tight text-foreground tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </>
  );
  const className = 'flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-elevation-1';
  return onClick ? (
    <button type="button" onClick={onClick} className={`${className} transition-smooth hover:border-primary/40 hover:shadow-elevation-2`}>
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  );
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof Gift; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
      <Icon className="mx-auto mb-3 w-10 h-10 text-muted-foreground/40" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function CoinPill({ amount, large = false }: { amount: number; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-yellow-400/15 font-bold text-yellow-700 dark:text-yellow-400 tabular-nums ${
        large ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Coins className={large ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {amount.toLocaleString()}
    </span>
  );
}

function PodiumCard({ row, rank, onOpen, onDisband }: { row: GuildStanding; rank: number; onOpen: () => void; onDisband: () => void }) {
  const level = guildLevel(row.lifetime_points);
  const xp = row.lifetime_points % GUILD_LEVEL_STEP;
  const medal = MEDAL[rank - 1];
  const first = rank === 1;
  return (
    <div
      onClick={onOpen}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-elevation-2 transition-smooth hover:-translate-y-0.5 hover:shadow-elevation-3 ${
        first ? 'border-yellow-400/50 md:order-2' : rank === 2 ? 'border-border md:order-1' : 'border-border md:order-3'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-28" style={{ background: `linear-gradient(180deg, ${row.color}40, transparent)` }} />
      <button
        onClick={(event) => {
          event.stopPropagation();
          onDisband();
        }}
        title="Disband guild"
        className="absolute right-3 top-3 z-10 rounded-lg p-2 text-muted-foreground opacity-0 transition-smooth group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className={`relative flex flex-col items-center px-5 text-center ${first ? 'pt-6 pb-7' : 'pt-5 pb-5'}`}>
        <span
          className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
            first ? 'bg-yellow-400/15 text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'
          }`}
        >
          {first && <Crown className="w-3.5 h-3.5" />}
          {medal.label}
        </span>
        <div className="relative">
          <GuildEmblem emblem={row.emblem} color={row.color} size={first ? 76 : 62} />
          <span className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-4 ring-card ${medal.badge}`}>
            {rank}
          </span>
        </div>
        <p className="mt-3 max-w-full truncate text-lg font-bold text-foreground">{row.name}</p>
        {row.tagline && <p className="max-w-full truncate text-xs text-muted-foreground">{row.tagline}</p>}
        <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">
          {row.points.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">pts</span>
        </p>
        <div className="mt-4 w-full space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Level {level}</span>
            <span className="tabular-nums">
              {xp}/{GUILD_LEVEL_STEP} XP
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full" style={{ width: `${(xp / GUILD_LEVEL_STEP) * 100}%`, backgroundColor: row.color }} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 truncate">
            <Crown className="w-3.5 h-3.5" /> {row.leader_name}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {row.member_count}
          </span>
        </div>
      </div>
    </div>
  );
}

function RewardCard({ reward, onEdit, onToggle }: { reward: GuildReward; onEdit: () => void; onToggle: () => void }) {
  const stockTone =
    reward.stock === 0
      ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
      : reward.stock !== null && reward.stock <= 5
        ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300'
        : 'bg-secondary text-muted-foreground';
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2 transition-smooth hover:shadow-elevation-3 ${
        reward.is_active ? '' : 'opacity-70'
      }`}
    >
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary">
          <Gift className="w-5 h-5" />
        </span>
        <CoinPill amount={reward.cost} large />
      </div>
      <div className="flex-1 px-5 pt-4">
        <h3 className="font-bold text-foreground">{reward.title}</h3>
        {reward.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{reward.description}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Users className="w-3 h-3" /> {AUDIENCE_LABEL[reward.audience]}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${stockTone}`}>
            <Package className="w-3 h-3" />
            {reward.stock === null ? 'Unlimited' : reward.stock === 0 ? 'Out of stock' : `${reward.stock} left`}
          </span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border bg-secondary/30 px-5 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
          <Switch checked={reward.is_active} onCheckedChange={onToggle} />
          {reward.is_active ? (
            'Visible in app'
          ) : (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <EyeOff className="w-3.5 h-3.5" /> Hidden
            </span>
          )}
        </label>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
    </div>
  );
}
