import { supabase } from '@/lib/supabase';
import { logAuditAction } from '@/lib/auditLog';

// Guilds, points/coins and rewards. Schema + RPCs live in partyup-mobile's
// migration 202610010001_guild_leaders_and_guilds.sql. Points are only ever
// written by DB triggers/RPCs; this module reads them, and lets admins run the
// reward catalog, handle redemptions and make manual point adjustments.

// Mirrors the guilds.emblem check (partyup-mobile migration 202610020009).
export type GuildEmblem =
  | 'shield' | 'flame' | 'mountain' | 'compass' | 'star' | 'wave' | 'leaf' | 'crown'
  | 'car' | 'bike' | 'tent' | 'trees' | 'sun' | 'palm' | 'anchor' | 'plane' | 'camera' | 'utensils' | 'heart' | 'bolt';
export type LeaderboardPeriod = 'week' | 'month' | 'all';
export type RewardAudience = 'everyone' | 'guild_leader' | 'traveler';
export type RedemptionStatus = 'pending' | 'fulfilled' | 'rejected';

export function roleLabel(role: string | null | undefined) {
  if (role === 'guild_leader') return 'Guild Leader';
  if (role === 'admin') return 'Admin';
  if (role === 'traveler') return 'Traveler';
  return role ?? '';
}

export interface GuildStanding {
  guild_id: string;
  name: string;
  tagline: string | null;
  emblem: GuildEmblem;
  color: string;
  leader_id: string;
  leader_name: string;
  member_count: number;
  points: number;
  lifetime_points: number;
}

export interface GuildReward {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  audience: RewardAudience;
  stock: number | null;
  is_active: boolean;
  created_at: string;
}

export interface RedemptionRow {
  id: string;
  reward_id: string;
  user_id: string;
  cost: number;
  status: RedemptionStatus;
  admin_notes: string | null;
  handled_at: string | null;
  created_at: string;
  reward: { title: string } | null;
  user: { display_name: string; email: string | null; role: string } | null;
}

const num = (value: unknown) => Number(value ?? 0);
const toError = (error: { message: string } | null) => (error ? new Error(error.message) : null);

export async function getGuildLeaderboard(period: LeaderboardPeriod) {
  const { data, error } = await supabase.rpc('get_guild_leaderboard', { p_period: period });
  return {
    data: ((data as GuildStanding[] | null) ?? []).map((row) => ({
      ...row,
      member_count: num(row.member_count),
      points: num(row.points),
      lifetime_points: num(row.lifetime_points),
    })),
    error: toError(error),
  };
}

export async function deleteGuild(guild: { guild_id: string; name: string }) {
  const { error } = await supabase.from('guilds').delete().eq('id', guild.guild_id);
  if (!error) logAuditAction('Disbanded guild', 'guild', guild.guild_id, { name: guild.name });
  return { error: toError(error) };
}

// ---- Rewards (admin) ------------------------------------------------------

export async function listAllRewards() {
  const { data, error } = await supabase
    .from('guild_rewards')
    .select('id, title, description, cost, audience, stock, is_active, created_at')
    .order('is_active', { ascending: false })
    .order('cost');
  return { data: (data as GuildReward[] | null) ?? [], error: toError(error) };
}

export type RewardInput = {
  title: string;
  description: string;
  cost: number;
  audience: RewardAudience;
  stock: number | null;
  is_active: boolean;
};

export async function saveReward(input: RewardInput, id?: string) {
  const { data: auth } = await supabase.auth.getUser();
  const row = { ...input, description: input.description.trim() || null, title: input.title.trim() };
  const { data, error } = id
    ? await supabase.from('guild_rewards').update(row).eq('id', id).select('id').single()
    : await supabase.from('guild_rewards').insert({ ...row, created_by: auth.user?.id ?? null }).select('id').single();
  if (!error && data) {
    logAuditAction(id ? 'Updated reward' : 'Created reward', 'guild_reward', data.id, { title: row.title, cost: row.cost });
  }
  return { error: toError(error) };
}

export async function listRedemptions(status?: RedemptionStatus) {
  let query = supabase
    .from('guild_reward_redemptions')
    .select('id, reward_id, user_id, cost, status, admin_notes, handled_at, created_at, reward:guild_rewards(title), user:profiles!guild_reward_redemptions_user_id_fkey(display_name, email, role)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  return { data: (data as unknown as RedemptionRow[] | null) ?? [], error: toError(error) };
}

export async function handleRedemption(id: string, status: 'fulfilled' | 'rejected', notes: string) {
  // The RPC writes its own audit_logs row and notifies the user.
  const { error } = await supabase.rpc('handle_guild_redemption', { p_redemption_id: id, p_status: status, p_notes: notes });
  return { error: toError(error) };
}

export async function adjustPointsByEmail(email: string, amount: number, note: string) {
  const trimmed = email.trim();
  if (!trimmed) return { error: new Error('Enter an email address.') };
  const { data: profile, error: lookupError } = await supabase.from('profiles').select('id, display_name').ilike('email', trimmed).maybeSingle();
  if (lookupError) return { error: toError(lookupError) };
  if (!profile) return { error: new Error('No PartyUp account found with that email.') };
  const { error } = await supabase.rpc('admin_adjust_guild_points', { p_user_id: profile.id, p_amount: amount, p_note: note });
  return { error: toError(error), displayName: profile.display_name as string };
}

// ---- Guild detail (admin) -------------------------------------------------

export interface GuildDetail {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  emblem: GuildEmblem;
  color: string;
  leader_id: string;
  join_policy: string;
  min_rank: string | null;
  areas: string[];
  focus: string[];
  announcement: string | null;
  created_at: string;
}

export interface GuildMemberRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  is_leader: boolean;
  joined_at: string;
  points: number;
  lifetime_points: number;
}

export interface GuildActivityRow {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  note: string | null;
  created_at: string;
  user: { display_name: string } | null;
}

export interface GuildOverview {
  guild: GuildDetail;
  members: GuildMemberRow[];
  activity: GuildActivityRow[];
  lifetimeXp: number;
  xpLast30Days: number;
  pendingRequests: number;
}

// Everything the admin guild dialog shows, in one round trip. Members come
// from the same get_guild_member_board RPC the app uses ('month' = points
// this month next to lifetime points).
export async function getGuildOverview(guildId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [guildResult, announcementResult, memberResult, activityResult, xpResult, recentResult, requestResult] = await Promise.all([
    // `announcement` isn't in the guilds column grant (202610010016); it's
    // only served through get_guild_announcement, which admins can call.
    supabase
      .from('guilds')
      .select('id, name, tagline, description, emblem, color, leader_id, join_policy, min_rank, areas, focus, created_at')
      .eq('id', guildId)
      .maybeSingle(),
    supabase.rpc('get_guild_announcement', { p_guild_id: guildId }),
    supabase.rpc('get_guild_member_board', { p_guild_id: guildId, p_period: 'month' }),
    supabase
      .from('guild_point_events')
      .select('id, user_id, amount, reason, note, created_at, user:profiles!guild_point_events_user_id_fkey(display_name)')
      .eq('guild_id', guildId)
      .order('created_at', { ascending: false })
      .limit(25),
    supabase.rpc('guild_lifetime_xp', { p_guild_id: guildId }),
    supabase
      .from('guild_point_events')
      .select('amount')
      .eq('guild_id', guildId)
      .gt('amount', 0)
      .neq('reason', 'redemption_refund')
      .gte('created_at', since),
    supabase.from('guild_join_requests').select('id', { count: 'exact', head: true }).eq('guild_id', guildId).eq('status', 'pending'),
  ]);

  const error = guildResult.error ?? announcementResult.error ?? memberResult.error ?? activityResult.error ?? xpResult.error ?? recentResult.error ?? requestResult.error;
  if (error || !guildResult.data) {
    return { data: null, error: error ? new Error(error.message) : new Error('This guild no longer exists.') };
  }

  const overview: GuildOverview = {
    guild: {
      ...(guildResult.data as Omit<GuildDetail, 'announcement'>),
      announcement: ((announcementResult.data as { announcement: string | null }[] | null) ?? [])[0]?.announcement ?? null,
    },
    members: ((memberResult.data as GuildMemberRow[] | null) ?? []).map((row) => ({
      ...row,
      points: num(row.points),
      lifetime_points: num(row.lifetime_points),
    })),
    activity: (activityResult.data as unknown as GuildActivityRow[] | null) ?? [],
    lifetimeXp: num(xpResult.data),
    xpLast30Days: ((recentResult.data as { amount: number }[] | null) ?? []).reduce((sum, row) => sum + num(row.amount), 0),
    pendingRequests: requestResult.count ?? 0,
  };
  return { data: overview, error: null };
}

const POINT_REASON_LABEL: Record<string, string> = {
  id_review: 'ID review',
  vehicle_review: 'Vehicle review',
  report_resolved: 'Report resolved',
  report_dismissed: 'Report dismissed',
  sos_resolved: 'SOS resolved',
  trip_completed: 'Trip completed',
  trip_hosted: 'Trip hosted',
  guild_trip_bonus: 'Guild trip bonus',
  guild_joined: 'Joined guild',
  guild_founded: 'Founded guild',
  id_verified: 'ID verified',
  redemption: 'Reward redeemed',
  redemption_refund: 'Redemption refund',
  admin_adjustment: 'Admin adjustment',
  mission_reward: 'Mission reward',
};

export function pointReasonLabel(reason: string) {
  return POINT_REASON_LABEL[reason] ?? reason.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

// Mirrors partyup-mobile/lib/guilds.ts.
export const GUILD_LEVEL_STEP = 500;
export function guildLevel(lifetimePoints: number) {
  return Math.floor(lifetimePoints / GUILD_LEVEL_STEP) + 1;
}

// 10 slots at Lv 1, +2 every 5 levels, up to 20 (leader included).
// Mirrors guild_member_cap() in partyup-mobile 202610020006.
export function guildMemberCap(level: number) {
  return Math.min(20, 10 + 2 * Math.floor((level - 1) / 5));
}

// Mirror guild_perk_discount() / guild_perk_mission_bonus() in 202610020007.
export function guildPerkDiscount(level: number) {
  return level >= 20 ? 10 : level >= 12 ? 6 : level >= 5 ? 3 : 0;
}
export function guildMissionBonus(level: number) {
  return level >= 22 ? 25 : level >= 15 ? 20 : level >= 9 ? 15 : level >= 3 ? 10 : 0;
}

export type GuildPerk = { level: number; kind: 'members' | 'missions' | 'discount'; label: string };

// Every perk milestone up to Lv 30, the same list the app's Guild Perks sheet shows.
export const GUILD_PERKS: GuildPerk[] = (() => {
  const perks: GuildPerk[] = [];
  for (let level = 1; level <= 30; level += 1) {
    if (level === 1 || guildMemberCap(level) > guildMemberCap(level - 1)) {
      perks.push({ level, kind: 'members', label: `${guildMemberCap(level)} member slots` });
    }
    if (guildMissionBonus(level) > guildMissionBonus(level - 1)) {
      perks.push({ level, kind: 'missions', label: `+${guildMissionBonus(level)}% mission points` });
    }
    if (guildPerkDiscount(level) > guildPerkDiscount(level - 1)) {
      perks.push({ level, kind: 'discount', label: `${guildPerkDiscount(level)}% off every reward` });
    }
  }
  return perks;
})();
