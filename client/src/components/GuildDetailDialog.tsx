import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GuildEmblem from '@/components/GuildEmblem';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Crown,
  DoorOpen,
  Lock,
  MapPin,
  Medal,
  Megaphone,
  Shield,
  Sparkles,
  Tag,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Segmented } from '@/components/review/ReviewWorkspace';
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

import { formatDate } from '@/lib/datetime';
import SortableTh from '@/components/SortableTh';
import { useSortable } from '@/hooks/useSortable';

// How the guild is doing, from the share of members who earned points this
// month and whether the guild earned any XP in the last 30 days.
function healthOf(overview: GuildOverview) {
  const total = overview.members.length;
  const active = overview.members.filter((member) => member.points > 0).length;
  if (overview.xpLast30Days === 0) {
    return { active, total, label: 'Inactive', note: 'No XP earned in the last 30 days.', style: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' };
  }
  if (total > 0 && active / total >= 0.5) {
    return { active, total, label: 'Thriving', note: 'Most members earned points this month.', style: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' };
  }
  return { active, total, label: 'Quiet', note: 'Earning XP, but fewer than half the members are active this month.', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' };
}

/**
 * Admin guild inspector: health, level & perks, settings, members and recent
 * point activity for one guild. Fixed-height dialog: the hero and stats stay
 * put and each tab scrolls on its own. Opened from the Guilds tab of AdminGuilds and
 * from the guild column on the Guild Leader Management page.
 */
export default function GuildDetailDialog({ guildId, onClose, onDisband }: Props) {
  const [overview, setOverview] = useState<GuildOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'members' | 'activity' | 'perks'>('overview');

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

  // Click a column title: ascending, descending, then off (most points this month first).
  const memberSort = useSortable(
    overview?.members ?? [],
    {
      member: (m) => m.display_name,
      role: (m) => (m.is_leader ? 'leader' : 'member'),
      joined: (m) => m.joined_at,
      month: (m) => m.points,
      lifetime: (m) => m.lifetime_points,
    },
    { key: 'month', direction: 'desc' }
  );

  const nextPerk = derived ? GUILD_PERKS.find((perk) => perk.level > derived.level) ?? null : null;
  const topMonth = Math.max(1, ...(overview?.members ?? []).map((member) => member.points));

  const tabs = overview
    ? [
        { value: 'overview' as const, label: 'Overview' },
        { value: 'members' as const, label: <>Members <Count n={overview.members.length} /></> },
        { value: 'activity' as const, label: <>Activity <Count n={overview.activity.length} /></> },
        { value: 'perks' as const, label: 'Perks' },
      ]
    : [];

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl max-w-5xl w-full h-[min(52rem,90vh)] flex flex-col overflow-hidden shadow-elevation-3 border border-border animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative shrink-0 border-b border-border">
          {overview && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(120% 140% at 0% 0%, ${overview.guild.color}55, transparent 60%)` }}
            />
          )}
          <div className="relative flex items-start justify-between gap-4 px-6 pt-6 pb-5">
            {overview && derived ? (
              <div className="flex items-center gap-5 min-w-0">
                <div className="relative shrink-0">
                  <GuildEmblem emblem={overview.guild.emblem} color={overview.guild.color} size={68} />
                  <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-card px-2 py-0.5 text-[11px] font-bold text-foreground ring-1 ring-border shadow-elevation-1">
                    Lv {derived.level}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-bold text-foreground truncate">{overview.guild.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${derived.health.style}`} title={derived.health.note}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {derived.health.label}
                    </span>
                  </div>
                  {overview.guild.tagline && <p className="text-sm text-muted-foreground truncate mt-0.5">{overview.guild.tagline}</p>}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                    <MetaChip icon={Crown} tone="text-yellow-600 dark:text-yellow-400">{derived.leader?.display_name ?? 'Unknown'}</MetaChip>
                    <MetaChip icon={CalendarDays}>Founded {formatDate(overview.guild.created_at)}</MetaChip>
                    <MetaChip icon={overview.guild.join_policy === 'open' ? DoorOpen : Lock}>
                      {overview.guild.join_policy === 'open' ? 'Open to join' : 'Approval needed'}
                    </MetaChip>
                  </div>
                </div>
              </div>
            ) : (
              <h3 className="text-xl font-bold text-foreground">{error ? 'Guild' : 'Loading guild...'}</h3>
            )}
            <button onClick={onClose} title="Close" className="shrink-0 p-2 rounded-lg text-muted-foreground hover:bg-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {overview && derived && (
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-5">
              <StatCard icon={Shield} label="Level" value={derived.level} sub={`${(GUILD_LEVEL_STEP - derived.intoLevel).toLocaleString()} XP to Lv ${derived.level + 1}`}>
                <Bar value={derived.intoLevel / GUILD_LEVEL_STEP} color={overview.guild.color} />
              </StatCard>
              <StatCard
                icon={Users}
                label="Members"
                value={<>{overview.members.length}<span className="text-sm font-medium text-muted-foreground"> / {derived.cap}</span></>}
                sub={overview.members.length > derived.cap ? 'Over cap until it levels up' : `${derived.cap - overview.members.length} open slots`}
              >
                <Bar value={overview.members.length / derived.cap} color={overview.members.length > derived.cap ? '#ef4444' : '#3b82f6'} />
              </StatCard>
              <StatCard
                icon={Activity}
                label="Active this month"
                value={<>{derived.health.active}<span className="text-sm font-medium text-muted-foreground"> / {derived.health.total}</span></>}
                sub={`${overview.xpLast30Days.toLocaleString()} XP in 30 days`}
              >
                <Bar value={derived.health.total ? derived.health.active / derived.health.total : 0} color="#22c55e" />
              </StatCard>
              <StatCard
                icon={UserPlus}
                label="Join requests"
                value={overview.pendingRequests}
                sub={overview.pendingRequests ? 'Waiting for the leader' : 'None pending'}
                highlight={overview.pendingRequests > 0}
              />
            </div>
          )}

          {overview && (
            <div className="relative px-6 pb-4">
              <Segmented value={tab} options={tabs} onChange={setTab} />
            </div>
          )}
        </div>

        <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain p-6">
          {error && <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          {!overview && !error && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          )}

          {overview && derived && tab === 'overview' && (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div className="space-y-5">
                <Panel title="About">
                  {overview.guild.description ? (
                    <p className="text-sm text-foreground whitespace-pre-line">{overview.guild.description}</p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">The leader hasn't written a description yet.</p>
                  )}
                </Panel>
                {overview.guild.announcement && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      <Megaphone className="w-3.5 h-3.5" /> Pinned announcement
                    </p>
                    <p className="mt-1.5 text-sm text-foreground whitespace-pre-line">{overview.guild.announcement}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <InfoTile icon={DoorOpen} label="Joining">
                    {JOIN_POLICY_LABEL[overview.guild.join_policy] ?? overview.guild.join_policy}
                  </InfoTile>
                  <InfoTile icon={Medal} label="Min. rank">{overview.guild.min_rank ?? 'None'}</InfoTile>
                  <InfoTile icon={MapPin} label="Areas">{overview.guild.areas?.length ? overview.guild.areas.join(', ') : 'Anywhere'}</InfoTile>
                  <InfoTile icon={Target} label="Focus">
                    {overview.guild.focus?.length ? (
                      <span className="flex flex-wrap gap-1">
                        {overview.guild.focus.map((item) => (
                          <span key={item} className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{item}</span>
                        ))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </InfoTile>
                </div>
              </div>

              <div className="space-y-5">
                <Panel title="Perks right now">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-500/5 p-4">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <p className="mt-2 text-2xl font-bold text-foreground">+{guildMissionBonus(derived.level)}%</p>
                      <p className="text-xs text-muted-foreground">mission points</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-yellow-500/15 to-yellow-500/5 p-4">
                      <Tag className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="mt-2 text-2xl font-bold text-foreground">{guildPerkDiscount(derived.level)}%</p>
                      <p className="text-xs text-muted-foreground">off every reward</p>
                    </div>
                  </div>
                  {nextPerk && (
                    <button
                      type="button"
                      onClick={() => setTab('perks')}
                      className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-3 text-left hover:bg-secondary/50 transition-smooth"
                    >
                      <Lock className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="text-muted-foreground">Next at Lv {nextPerk.level}: </span>
                        <span className="font-medium text-foreground">{nextPerk.label}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </Panel>

                <Panel
                  title="Top this month"
                  action={
                    <button type="button" onClick={() => setTab('members')} className="text-xs font-semibold text-primary hover:underline">
                      All members
                    </button>
                  }
                >
                  <ul className="space-y-2.5">
                    {[...overview.members]
                      .sort((a, b) => b.points - a.points)
                      .slice(0, 4)
                      .map((member, index) => (
                        <li key={member.user_id} className="flex items-center gap-3">
                          <span className="w-4 text-xs font-bold text-muted-foreground">{index + 1}</span>
                          <Avatar url={member.avatar_url} name={member.display_name} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{member.display_name}</p>
                            <Bar value={member.points / topMonth} color={overview.guild.color} />
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-foreground">{member.points.toLocaleString()}</span>
                        </li>
                      ))}
                  </ul>
                </Panel>
              </div>
            </div>
          )}

          {overview && tab === 'members' && (
            <div className="rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <SortableTh label="Member" sortKey="member" sort={memberSort.sort} onSort={memberSort.toggle} className={TH} />
                    <SortableTh label="Role" sortKey="role" sort={memberSort.sort} onSort={memberSort.toggle} className={TH} />
                    <SortableTh label="Joined" sortKey="joined" sort={memberSort.sort} onSort={memberSort.toggle} className={TH} />
                    <SortableTh label="This month" sortKey="month" sort={memberSort.sort} onSort={memberSort.toggle} className={TH} align="right" />
                    <SortableTh label="Lifetime" sortKey="lifetime" sort={memberSort.sort} onSort={memberSort.toggle} className={TH} align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {memberSort.sorted.map((member) => (
                    <tr key={member.user_id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar url={member.avatar_url} name={member.display_name} />
                          <span className="font-medium text-foreground">{member.display_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {member.is_leader ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                            <Crown className="w-3 h-3" /> Leader
                          </span>
                        ) : (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">Member</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(member.joined_at)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${member.points > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {member.points.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">{member.lifetime_points.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {overview && tab === 'activity' &&
            (overview.activity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <Zap className="mx-auto mb-2 w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No point activity yet.</p>
              </div>
            ) : (
              <ol className="relative space-y-1 before:absolute before:left-[1.15rem] before:top-2 before:bottom-2 before:w-px before:bg-border">
                {overview.activity.map((event) => {
                  const gain = event.amount > 0;
                  return (
                    <li key={event.id} className="relative flex items-center gap-4 rounded-xl px-1 py-2 hover:bg-secondary/40">
                      <span
                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card ${
                          gain ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {gain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          <span className="font-semibold">{event.user?.display_name ?? 'Former member'}</span>
                          <span className="text-muted-foreground"> · {pointReasonLabel(event.reason)}</span>
                        </p>
                        {event.note && <p className="truncate text-xs text-muted-foreground">{event.note}</p>}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${
                          gain ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-red-500/15 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {gain ? '+' : ''}
                        {event.amount}
                      </span>
                      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
                    </li>
                  );
                })}
              </ol>
            ))}

          {overview && derived && tab === 'perks' && (
            <ol className="grid gap-2 sm:grid-cols-2">
              {GUILD_PERKS.map((perk) => {
                const unlocked = perk.level <= derived.level;
                const isNext = perk === nextPerk;
                const Icon = PERK_ICON[perk.kind] ?? Sparkles;
                return (
                  <li
                    key={`${perk.level}-${perk.kind}`}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      isNext ? 'border-primary/50 bg-primary/5' : unlocked ? 'border-border bg-secondary/40' : 'border-border opacity-50'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        unlocked ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {unlocked ? <Icon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{perk.label}</p>
                      <p className="text-xs text-muted-foreground">Level {perk.level}</p>
                    </div>
                    {unlocked ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                    ) : isNext ? (
                      <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">Next</span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {overview && (
          <div className="relative z-10 shrink-0 flex items-center justify-between gap-3 px-6 py-3.5 border-t border-border bg-card">
            {onDisband ? (
              <button
                onClick={() => onDisband({ guild_id: overview.guild.id, name: overview.guild.name, member_count: overview.members.length })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" /> Disband guild
              </button>
            ) : (
              <span />
            )}
            <button onClick={onClose} className="px-5 py-2 rounded-lg bg-secondary text-sm font-semibold text-foreground hover:bg-secondary/70">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const TH = 'px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground';

const PERK_ICON: Record<string, typeof Users> = {
  members: Users,
  missions: Sparkles,
  discount: Tag,
};

function Count({ n }: { n: number }) {
  return <span className="rounded-full bg-secondary px-1.5 text-[11px] font-semibold text-muted-foreground">{n}</span>;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%`, backgroundColor: color }} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight = false,
  children,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
  sub: string;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border bg-card/80 backdrop-blur p-3.5 ${highlight ? 'border-orange-400/60' : 'border-border'}`}>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <p className="mt-1 text-2xl font-bold leading-tight text-foreground tabular-nums">{value}</p>
      {children}
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function MetaChip({ icon: Icon, tone, children }: { icon: typeof Users; tone?: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-muted-foreground">
      <Icon className={`w-3.5 h-3.5 ${tone ?? ''}`} />
      <span className="text-foreground">{children}</span>
    </span>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}

function InfoTile({ icon: Icon, label, children }: { icon: typeof Users; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <div className="mt-1.5 text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  return url ? (
    <img src={url} alt="" className="w-8 h-8 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="w-8 h-8 shrink-0 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
