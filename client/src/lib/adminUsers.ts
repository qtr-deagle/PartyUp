import { supabase } from '@/lib/supabase';
import { logAuditAction } from '@/lib/auditLog';

export type UserVerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected' | 'resubmitted';
export type UserRole = 'traveler' | 'guild_leader' | 'admin';
export type UserStatusFilter = 'verified' | 'pending' | 'unverified' | 'suspended';

export interface UserRow {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
  city: string | null;
  is_active: boolean;
  verification_status: UserVerificationStatus | null;
  created_at: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatusFilter;
}

const SELECT_COLUMNS = 'id, display_name, email, avatar_url, role, city, is_active, verification_status, created_at';

export type UserSortColumn = 'display_name' | 'email' | 'role' | 'verification_status' | 'created_at';
export type UserSort = { column: UserSortColumn; ascending: boolean };

// One page of users (`from`/`to` are zero-based, inclusive) plus the total
// matching row count, so the table can page on the server. Sorting happens in
// the query too (newest first unless `sort` says otherwise), so page 2
// continues page 1's order.
export async function listUsers(
  search?: string,
  filters: UserFilters = {},
  range?: { from: number; to: number },
  sort: UserSort = { column: 'created_at', ascending: false }
) {
  let query = supabase
    .from('profiles')
    .select(SELECT_COLUMNS, { count: 'exact' })
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
    .order('id', { ascending: true });
  const trimmed = search?.trim();
  if (trimmed) {
    query = query.or(`display_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`);
  }
  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status === 'verified') query = query.eq('verification_status', 'approved');
  if (filters.status === 'pending') query = query.in('verification_status', ['pending', 'resubmitted']);
  if (filters.status === 'unverified') query = query.in('verification_status', ['unverified', 'rejected']);
  if (filters.status === 'suspended') query = query.eq('is_active', false);
  if (range) query = query.range(range.from, range.to);
  const { data, error, count } = await query;
  return { data: (data ?? []) as unknown as UserRow[], count: count ?? 0, error };
}

export interface UserStats {
  total: number;
  verified: number;
  pending: number;
  guildLeaders: number;
  suspended: number;
}

export async function getUserStats(): Promise<UserStats> {
  const count = () => supabase.from('profiles').select('id', { count: 'exact', head: true });
  const [total, verified, pending, guildLeaders, suspended] = await Promise.all([
    count(),
    count().eq('verification_status', 'approved'),
    count().in('verification_status', ['pending', 'resubmitted']),
    count().eq('role', 'guild_leader'),
    count().eq('is_active', false),
  ]);
  return {
    total: total.count ?? 0,
    verified: verified.count ?? 0,
    pending: pending.count ?? 0,
    guildLeaders: guildLeaders.count ?? 0,
    suspended: suspended.count ?? 0,
  };
}

export async function setUserVerificationStatus(userId: string, status: 'approved' | 'rejected') {
  const { error } = await supabase.from('profiles').update({ verification_status: status }).eq('id', userId);
  if (!error) logAuditAction(`Set user verification to ${status}`, 'profile', userId, { verification_status: status });
  return { error };
}

// Suspended (inactive) profiles are hidden from search/nearby/friend RPCs and
// the mobile app locks them out on the "account suspended" screen.
export async function setUserActive(userId: string, active: boolean) {
  const { error } = await supabase.from('profiles').update({ is_active: active }).eq('id', userId);
  if (!error) logAuditAction(active ? 'Reactivated user' : 'Suspended user', 'profile', userId, { is_active: active });
  return { error };
}

export interface UserReportSummary {
  id: string;
  report_type: string;
  status: string;
  details: string;
  created_at: string;
}

export interface UserDetail {
  bio: string | null;
  phone: string | null;
  tripsCreated: number;
  tripsJoined: number;
  reportsAgainst: number;
  recentReports: UserReportSummary[];
  guildName: string | null;
}

export async function getUserDetail(userId: string): Promise<{ data: UserDetail | null; error: Error | null }> {
  const [profile, created, joined, reports, guild] = await Promise.all([
    supabase.from('profiles').select('bio, phone').eq('id', userId).maybeSingle(),
    supabase.from('trips').select('id', { count: 'exact', head: true }).eq('creator_id', userId),
    supabase.from('trip_members').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'accepted'),
    supabase
      .from('reports')
      .select('id, report_type, status, details, created_at', { count: 'exact' })
      .eq('reported_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('guild_members').select('guilds(name)').eq('user_id', userId).maybeSingle(),
  ]);

  const error = profile.error ?? created.error ?? joined.error ?? reports.error ?? guild.error;
  if (error) return { data: null, error: new Error(error.message) };

  const guildRow = guild.data as unknown as { guilds: { name: string } | null } | null;
  return {
    data: {
      bio: profile.data?.bio ?? null,
      phone: profile.data?.phone ?? null,
      tripsCreated: created.count ?? 0,
      tripsJoined: joined.count ?? 0,
      reportsAgainst: reports.count ?? 0,
      recentReports: (reports.data ?? []) as UserReportSummary[],
      guildName: guildRow?.guilds?.name ?? null,
    },
    error: null,
  };
}
