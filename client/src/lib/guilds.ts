import { supabase } from '@/lib/supabase';
import { logAuditAction } from '@/lib/auditLog';

// Guilds, points/coins and rewards. Schema + RPCs live in partyup-mobile's
// migration 202610010001_guild_leaders_and_guilds.sql. Points are only ever
// written by DB triggers/RPCs; this module reads them, and lets admins run the
// reward catalog, handle redemptions and make manual point adjustments.

export type GuildEmblem = 'shield' | 'flame' | 'mountain' | 'compass' | 'star' | 'wave' | 'leaf' | 'crown';
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

// Mirrors partyup-mobile/lib/guilds.ts.
export function guildLevel(lifetimePoints: number) {
  return Math.floor(lifetimePoints / 500) + 1;
}
