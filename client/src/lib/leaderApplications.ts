import { supabase } from '@/lib/supabase';

// Backs the Leader Applications queue and Leader Scorecards on the Admin
// Staff page. Travelers with 10+ completed trips, 2+ hosted trips, a 4+
// rating from 3+ buddies and a verified ID apply from the mobile app;
// approving promotes them to Guild Leader and founds their proposed guild
// (see mobile migrations 202610010006 and 202610010011).

export type LeaderApplicationStatus = 'pending' | 'approved' | 'declined';

export interface LeaderApplicationRow {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  lifetime_points: number;
  avg_rating: number | null;
  rating_count: number;
  current_guild: string | null;
  guild_name: string;
  pitch: string;
  status: LeaderApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  handled_at: string | null;
}

export interface LeaderScorecard {
  user_id: string;
  display_name: string;
  guild_id: string | null;
  guild_name: string | null;
  member_count: number;
  new_members_30d: number;
  member_trips_30d: number;
  guild_points_30d: number;
  pending_requests: number;
  avg_response_hours: number | null;
  lifetime_points: number;
  last_active: string | null;
}

// Same thresholds as the app's RANKS (Rookie 0 ... Legend 3000).
const RANKS: [string, number][] = [
  ['Legend', 3000],
  ['Platinum', 1500],
  ['Gold', 750],
  ['Silver', 300],
  ['Bronze', 100],
  ['Rookie', 0],
];

export function rankName(points: number) {
  return RANKS.find(([, min]) => points >= min)?.[0] ?? 'Rookie';
}

const num = (value: unknown) => (value === null || value === undefined ? 0 : Number(value));

export async function listLeaderApplications(status: LeaderApplicationStatus | null = 'pending') {
  const { data, error } = await supabase.rpc('get_leader_applications', { p_status: status });
  const rows = ((data ?? []) as LeaderApplicationRow[]).map((row) => ({
    ...row,
    lifetime_points: num(row.lifetime_points),
    rating_count: num(row.rating_count),
    avg_rating: row.avg_rating === null ? null : Number(row.avg_rating),
  }));
  return { data: rows, error };
}

export async function decideLeaderApplication(id: string, approve: boolean, notes: string) {
  const { error } = await supabase.rpc('handle_leader_application', {
    p_application_id: id,
    p_approve: approve,
    p_notes: notes.trim() || null,
  });
  return { error };
}

export async function listLeaderScorecards() {
  const { data, error } = await supabase.rpc('get_leader_scorecards');
  const rows = ((data ?? []) as LeaderScorecard[]).map((row) => ({
    ...row,
    member_count: num(row.member_count),
    new_members_30d: num(row.new_members_30d),
    member_trips_30d: num(row.member_trips_30d),
    guild_points_30d: num(row.guild_points_30d),
    pending_requests: num(row.pending_requests),
    lifetime_points: num(row.lifetime_points),
    avg_response_hours: row.avg_response_hours === null ? null : Number(row.avg_response_hours),
  }));
  return { data: rows, error };
}
