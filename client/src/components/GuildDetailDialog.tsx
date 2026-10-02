import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GuildEmblem from '@/components/GuildEmblem';
import { Activity, CheckCircle2, Crown, Lock, Shield, Trash2, UserPlus, Users, X, Zap } from 'lucide-react';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import {
  GUILD_LEVEL_STEP,
  GUILD_PERKS,
  getGuildOverview,
  guildLevel,
  guildMemberCap,
  guildMissionBonus,
  guildPerkDiscount,
  pointReasonLabel,
  type GuildOverview,
} from '@/lib/guilds';

type Props = {
  guildId: string;
  onClose: () => void;
  // Omitted where disbanding goes through another flow (e.g. revoking the leader).
  onDisband?: (guild: { guild_id: string; name: string; member_count: number }) => void;
};

const JOIN_POLICY_LABEL: Record<string, string> = {
  open: 'Open — anyone eligible can join',
  approval: 'Approval — the leader accepts requests',
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// How the guild is doing, from the share of members who earned points this
// month and whether the guild earned any XP in the last 30 days.
function healthOf(overview: GuildOverview) {
  const total = overview.members.length;
  const active = overview.members.filter((member) => member.points > 0).length;
  if (overview.xpLast30Days === 0) {
    return { active, total, label: 'Inactive', note: 'No XP earned in the last 30 days.', style: 'bg-red-500/15 text-red-700 dark:text-red-400' };
  }
  if (total > 0 && active / total >= 0.5) {
    return { active, total, label: 'Thriving', note: 'Most members earned points this month.', style: 'bg-green-500/15 text-green-700 dark:text-green-400' };
  }
  return { active, total, label: 'Quiet', note: 'Earning XP, but fewer than half the members are active this month.', style: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400' };
}

/**
 * Admin guild inspector: health, level & perks, settings, members and recent
 * point activity for one guild. Opened from the Guilds tab of AdminGuilds and
 * from the guild column on the Guild Leader Management page.
 */
export default function GuildDetailDialog({ guildId, onClose, onDisband }: Props) {
  const [overview, setOverview] = useState<GuildOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getGuildOverview(guildId);
    if (result.error) setError(result.error.message);
    else {
      setError(null);
      setOverview(result.data);
    }
  }, [guildId]);

  useEffect(() => {
    void load();
  }, [load]);

  useTableRealtime(['guilds', 'guild_members', 'guild_point_events', 'guild_join_requests'], () => void load());

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const derived = useMemo(() => {
    if (!overview) return null;
    const level = guildLevel(overview.lifetimeXp);
    const intoLevel = overview.lifetimeXp % GUILD_LEVEL_STEP;
    return {
      level,
      intoLevel,
      cap: guildMemberCap(level),
      health: healthOf(overview),
      leader: overview.members.find((member) => member.is_leader) ?? null,
    };
  }, [overview]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-elevation-3 border border-border animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="relative z-10 shrink-0 flex items-start justify-between gap-4 p-6 border-b border-border bg-card">
          {overview ? (
            <div className="flex items-center gap-4 min-w-0">
              <GuildEmblem emblem={overview.guild.emblem} color={overview.guild.color} size={56} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground truncate">{overview.guild.name}</h3>
                  {derived && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${derived.health.style}`}>{derived.health.label}</span>}
                </div>
                {overview.guild.tagline && <p className="text-sm text-muted-foreground truncate">{overview.guild.tagline}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Led by {derived?.leader?.display_name ?? 'Unknown'} · Founded {formatDate(overview.guild.created_at)}
                </p>
              </div>
            </div>
          ) : (
            <h3 className="text-xl font-bold text-foreground">{error ? 'Guild' : 'Loading guild...'}</h3>
          )}
          <button onClick={onClose} title="Close" className="p-2 rounded-lg text-muted-foreground hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-6">
          {error && <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          {!overview && !error && <p className="py-12 text-center text-sm text-muted-foreground">Loading...</p>}

          {overview && derived && (
            <>
              {/* Health */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Shield className="w-3.5 h-3.5" /> Level</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{derived.level}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(derived.intoLevel / GUILD_LEVEL_STEP) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {GUILD_LEVEL_STEP - derived.intoLevel} XP to Lv {derived.level + 1} · {overview.lifetimeXp.toLocaleString()} total
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="w-3.5 h-3.5" /> Members</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {overview.members.length}
                    <span className="text-base font-medium text-muted-foreground"> / {derived.cap}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {overview.members.length > derived.cap ? 'Over cap — no new members until it levels up' : `${derived.cap - overview.members.length} open slots`}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Activity className="w-3.5 h-3.5" /> Active this month</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {derived.health.active}
                    <span className="text-base font-medium text-muted-foreground"> / {derived.health.total}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{overview.xpLast30Days.toLocaleString()} XP in the last 30 days</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><UserPlus className="w-3.5 h-3.5" /> Join requests</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{overview.pendingRequests}</p>
                  <p className="mt-1 text-xs text-muted-foreground">pending</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground -mt-3">{derived.health.note}</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* About */}
                <section className="space-y-3">
                  <h4 className="font-bold text-foreground">About</h4>
                  {overview.guild.description ? (
                    <p className="text-sm text-foreground whitespace-pre-line">{overview.guild.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No description.</p>
                  )}
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Joining</dt>
                    <dd className="text-foreground">{JOIN_POLICY_LABEL[overview.guild.join_policy] ?? overview.guild.join_policy}</dd>
                    <dt className="text-muted-foreground">Min. rank</dt>
                    <dd className="text-foreground">{overview.guild.min_rank ?? 'None'}</dd>
                    <dt className="text-muted-foreground">Areas</dt>
                    <dd className="text-foreground">{overview.guild.areas?.length ? overview.guild.areas.join(', ') : 'Anywhere'}</dd>
                    <dt className="text-muted-foreground">Focus</dt>
                    <dd className="flex flex-wrap gap-1">
                      {overview.guild.focus?.length ? (
                        overview.guild.focus.map((item) => (
                          <span key={item} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground capitalize">{item}</span>
                        ))
                      ) : (
                        <span className="text-foreground">—</span>
                      )}
                    </dd>
                  </dl>
                  {overview.guild.announcement && (
                    <div className="rounded-xl border border-border bg-secondary/40 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">Pinned announcement</p>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-line">{overview.guild.announcement}</p>
                    </div>
                  )}
                </section>

                {/* Perks */}
                <section className="space-y-3">
                  <h4 className="font-bold text-foreground">Level perks</h4>
                  <p className="text-sm text-muted-foreground">
                    Every member currently gets <span className="font-semibold text-foreground">+{guildMissionBonus(derived.level)}% mission points</span> and{' '}
                    <span className="font-semibold text-foreground">{guildPerkDiscount(derived.level)}% off rewards</span>.
                  </p>
                  <ul className="max-h-64 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                    {GUILD_PERKS.map((perk) => {
                      const unlocked = perk.level <= derived.level;
                      return (
                        <li key={`${perk.level}-${perk.kind}`} className={`flex items-center gap-3 px-3 py-2 text-sm ${unlocked ? '' : 'opacity-55'}`}>
                          {unlocked ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <Lock className="w-4 h-4 text-muted-foreground shrink-0" />}
                          <span className="w-12 shrink-0 text-xs font-semibold text-muted-foreground">Lv {perk.level}</span>
                          <span className="text-foreground">{perk.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>

              {/* Members */}
              <section className="space-y-3">
                <h4 className="font-bold text-foreground">Members ({overview.members.length})</h4>
                <div className="rounded-xl border border-border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary text-left">
                        <th className="px-4 py-2.5 font-semibold text-foreground">Member</th>
                        <th className="px-4 py-2.5 font-semibold text-foreground">Role</th>
                        <th className="px-4 py-2.5 font-semibold text-foreground">Joined</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-foreground">This month</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-foreground">Lifetime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.members.map((member) => (
                        <tr key={member.user_id} className="border-b border-border last:border-0">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {member.avatar_url ? (
                                <img src={member.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                              ) : (
                                <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                  {member.display_name.charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span className="font-medium text-foreground">{member.display_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            {member.is_leader ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-600 dark:text-yellow-400"><Crown className="w-3.5 h-3.5" /> Leader</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Member</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{formatDate(member.joined_at)}</td>
                          <td className={`px-4 py-2.5 text-right ${member.points > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{member.points.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right text-foreground">{member.lifetime_points.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Activity */}
              <section className="space-y-3">
                <h4 className="font-bold text-foreground">Recent activity</h4>
                {overview.activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No point activity yet.</p>
                ) : (
                  <ul className="rounded-xl border border-border divide-y divide-border">
                    {overview.activity.map((event) => (
                      <li key={event.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Zap className={`w-4 h-4 shrink-0 ${event.amount > 0 ? 'text-green-600' : 'text-red-500'}`} />
                          <span className="min-w-0 truncate text-foreground">
                            <span className="font-medium">{event.user?.display_name ?? 'Former member'}</span> · {pointReasonLabel(event.reason)}
                            {event.note ? <span className="text-muted-foreground"> — {event.note}</span> : null}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`font-semibold ${event.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {event.amount > 0 ? '+' : ''}
                            {event.amount}
                          </span>
                          <span className="w-24 text-right text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>

        {overview && (
          <div className="relative z-10 shrink-0 flex justify-end gap-3 p-4 border-t border-border bg-card">
            {onDisband && (
            <button
              onClick={() => onDisband({ guild_id: overview.guild.id, name: overview.guild.name, member_count: overview.members.length })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" /> Disband guild
            </button>
            )}
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-secondary">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
