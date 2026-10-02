import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import GuildDetailDialog from '@/components/GuildDetailDialog';
import GuildEmblem from '@/components/GuildEmblem';
import { Check, ChevronRight, Coins, Edit2, Gift, Plus, Trash2, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import {
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
  pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  fulfilled: 'bg-green-500/20 text-green-700 dark:text-green-400',
  rejected: 'bg-red-500/20 text-red-700 dark:text-red-400',
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [handling, setHandling] = useState<{ row: RedemptionRow; status: 'fulfilled' | 'rejected' } | null>(null);
  const [handleNotes, setHandleNotes] = useState('');
  const [editingReward, setEditingReward] = useState<{ id?: string; values: RewardInput } | null>(null);
  const [disbanding, setDisbanding] = useState<Pick<GuildStanding, 'guild_id' | 'name' | 'member_count'> | null>(null);
  const [viewingGuildId, setViewingGuildId] = useState<string | null>(null);
  const [adjust, setAdjust] = useState({ email: '', amount: '', note: '' });

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

  const submitHandle = async () => {
    if (!handling) return;
    if (handling.status === 'rejected' && !handleNotes.trim()) {
      toast.error('Add a reason so the user knows why it was declined.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await handleRedemption(handling.row.id, handling.status, handleNotes);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(handling.status === 'fulfilled' ? 'Marked as fulfilled' : `Declined and refunded ${handling.row.cost} coins`);
    setHandling(null);
    setHandleNotes('');
    void load(true);
  };

  const submitReward = async () => {
    if (!editingReward) return;
    const { values } = editingReward;
    if (values.title.trim().length < 2) {
      toast.error('Give the reward a title.');
      return;
    }
    if (!Number.isInteger(values.cost) || values.cost <= 0) {
      toast.error('Cost must be a whole number above 0.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await saveReward(values, editingReward.id);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingReward.id ? 'Reward updated' : 'Reward added');
    setEditingReward(null);
    void load(true);
  };

  const toggleReward = async (reward: GuildReward) => {
    const { error } = await saveReward(
      { title: reward.title, description: reward.description ?? '', cost: reward.cost, audience: reward.audience, stock: reward.stock, is_active: !reward.is_active },
      reward.id
    );
    if (error) toast.error(error.message);
    else void load(true);
  };

  const submitDisband = async () => {
    if (!disbanding) return;
    setIsSubmitting(true);
    const { error } = await deleteGuild(disbanding);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${disbanding.name} was disbanded`);
    if (viewingGuildId === disbanding.guild_id) setViewingGuildId(null);
    setDisbanding(null);
    void load(true);
  };

  const submitAdjust = async () => {
    const amount = Number(adjust.amount);
    if (!Number.isInteger(amount) || amount === 0) {
      toast.error('Amount must be a whole number, positive or negative.');
      return;
    }
    if (!adjust.note.trim()) {
      toast.error('Add a reason for the adjustment.');
      return;
    }
    setIsSubmitting(true);
    const result = await adjustPointsByEmail(adjust.email, amount, adjust.note);
    setIsSubmitting(false);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success(`${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} points ${amount > 0 ? 'to' : 'from'} ${result.displayName}`);
    setAdjust({ email: '', amount: '', note: '' });
  };

  const tabs: { id: Tab; label: string; icon: typeof Gift; badge?: number }[] = [
    { id: 'guilds', label: 'Guilds', icon: Trophy },
    { id: 'redemptions', label: 'Redemptions', icon: Gift, badge: statusFilter === 'pending' ? pendingCount : undefined },
    { id: 'rewards', label: 'Reward Catalog', icon: Coins },
    { id: 'points', label: 'Adjust Points', icon: Plus },
  ];

  const inputClass =
    'w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guilds &amp; Rewards</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Guild Leaders and travelers earn points for real work and trips. Coins buy rewards that admins fulfill by hand.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-smooth ${
                  tab === item.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.badge ? <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{item.badge}</span> : null}
              </button>
            );
          })}
        </div>

        {/* Redemptions */}
        {tab === 'redemptions' && (
          <div className="space-y-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RedemptionStatus | '')} className={`${inputClass} max-w-xs bg-card`}>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Declined</option>
              <option value="">All</option>
            </select>
            <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Reward</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Requested by</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Cost</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Requested</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">Loading...</td>
                      </tr>
                    ) : redemptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">No redemptions here.</td>
                      </tr>
                    ) : (
                      redemptions.map((row) => (
                        <tr key={row.id} className="border-b border-border last:border-0">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{row.reward?.title ?? 'Reward'}</td>
                          <td className="px-6 py-4 text-sm">
                            <p className="font-medium text-foreground">{row.user?.display_name ?? 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">
                              {row.user?.email ?? ''} · {roleLabel(row.user?.role)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{row.cost} coins</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[row.status]}`}>
                              {row.status === 'rejected' ? 'declined' : row.status}
                            </span>
                            {row.admin_notes && <p className="mt-1 text-xs text-muted-foreground">{row.admin_notes}</p>}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(row.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            {row.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setHandling({ row, status: 'fulfilled' })}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold hover:bg-green-500/30"
                                >
                                  <Check className="w-3.5 h-3.5" /> Fulfill
                                </button>
                                <button
                                  onClick={() => setHandling({ row, status: 'rejected' })}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-500/30"
                                >
                                  <X className="w-3.5 h-3.5" /> Decline
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
            </div>
          </div>
        )}

        {/* Reward catalog */}
        {tab === 'rewards' && (
          <div className="space-y-4">
            <button
              onClick={() => setEditingReward({ values: { ...EMPTY_REWARD } })}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth"
            >
              <Plus className="w-5 h-5" /> Add Reward
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <div key={reward.id} className={`bg-card rounded-2xl p-6 shadow-elevation-2 border border-border ${reward.is_active ? '' : 'opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-foreground">{reward.title}</h3>
                    <span className="flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      <Coins className="w-4 h-4" /> {reward.cost}
                    </span>
                  </div>
                  {reward.description && <p className="mt-2 text-sm text-muted-foreground">{reward.description}</p>}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {AUDIENCE_LABEL[reward.audience]} · {reward.stock === null ? 'Unlimited' : `${reward.stock} left`} ·{' '}
                    {reward.is_active ? 'Active' : 'Hidden'}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() =>
                        setEditingReward({
                          id: reward.id,
                          values: {
                            title: reward.title,
                            description: reward.description ?? '',
                            cost: reward.cost,
                            audience: reward.audience,
                            stock: reward.stock,
                            is_active: reward.is_active,
                          },
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-secondary"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => void toggleReward(reward)}
                      className="px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-secondary"
                    >
                      {reward.is_active ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guilds */}
        {tab === 'guilds' && (
          <div className="space-y-4">
            <select value={period} onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)} className={`${inputClass} max-w-xs bg-card`}>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>
            <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
              {standings.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">No guilds yet. Guild Leaders found them in the mobile app.</p>
              ) : (
                standings.map((row, index) => (
                  <div
                    key={row.guild_id}
                    onClick={() => setViewingGuildId(row.guild_id)}
                    className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border last:border-0 cursor-pointer hover:bg-secondary/50 transition-smooth"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`w-6 text-center font-bold ${index < 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}>{index + 1}</span>
                      <GuildEmblem emblem={row.emblem} color={row.color} size={40} />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{row.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Led by {row.leader_name} · Level {guildLevel(row.lifetime_points)} · {row.member_count} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-foreground">{row.points.toLocaleString()} pts</span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setDisbanding(row);
                        }}
                        title="Disband guild"
                        className="p-2 rounded-lg text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Adjust points */}
        {tab === 'points' && (
          <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border max-w-xl space-y-4">
            <p className="text-sm text-muted-foreground">
              Use this to correct mistakes or award special effort. Negative amounts remove points. Every adjustment is written to the Audit Log.
            </p>
            <input type="email" placeholder="User email" value={adjust.email} onChange={(e) => setAdjust({ ...adjust, email: e.target.value })} className={inputClass} />
            <input type="number" placeholder="Amount (e.g. 50 or -20)" value={adjust.amount} onChange={(e) => setAdjust({ ...adjust, amount: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Reason (shown in their points history)" value={adjust.note} onChange={(e) => setAdjust({ ...adjust, note: e.target.value })} className={inputClass} />
            <button
              onClick={() => void submitAdjust()}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50"
            >
              Apply Adjustment
            </button>
          </div>
        )}
      </div>

      {/* Fulfill / decline dialog */}
      {handling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">
                {handling.status === 'fulfilled' ? 'Mark as fulfilled' : 'Decline request'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{handling.row.reward?.title}</span> for{' '}
                <span className="font-medium text-foreground">{handling.row.user?.display_name}</span>.{' '}
                {handling.status === 'fulfilled'
                  ? 'Only confirm once you have actually delivered it.'
                  : `Their ${handling.row.cost} coins will be refunded.`}
              </p>
              <textarea
                value={handleNotes}
                onChange={(e) => setHandleNotes(e.target.value)}
                placeholder={handling.status === 'fulfilled' ? 'Optional note to the user' : 'Reason (sent to the user)'}
                rows={3}
                className={inputClass}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setHandling(null);
                    setHandleNotes('');
                  }}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitHandle()}
                  disabled={isSubmitting}
                  className={`flex-1 text-white py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors ${
                    handling.status === 'fulfilled' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'
                  }`}
                >
                  {handling.status === 'fulfilled' ? 'Fulfilled' : 'Decline & Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reward editor */}
      {editingReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                  onClick={() => setEditingReward(null)}
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

      {/* Disband confirmation */}
      {disbanding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Disband {disbanding.name}?</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                All {disbanding.member_count} members are removed from the guild. Everyone keeps their personal points and coins. This can't be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDisbanding(null)}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitDisband()}
                  disabled={isSubmitting}
                  className="flex-1 bg-destructive text-white py-2.5 rounded-lg disabled:opacity-50 font-semibold transition-colors hover:bg-destructive/90"
                >
                  Disband
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
