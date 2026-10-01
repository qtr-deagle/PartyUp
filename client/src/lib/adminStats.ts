import { supabase } from '@/lib/supabase';

export interface DashboardCounts {
  totalUsers: number;
  activeTrips: number;
  completedTrips: number;
  totalTrips: number;
  pendingVerifications: number;
}

async function countRows(table: string, apply?: (query: any) => any) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (apply) query = apply(query);
  const { count, error } = await query;
  return { count: count ?? 0, error };
}

export async function getDashboardCounts(): Promise<{ data: DashboardCounts; error: Error | null }> {
  const [users, activeTrips, completedTrips, totalTrips, pendingVerifications] = await Promise.all([
    countRows('profiles'),
    countRows('trips', (q) => q.in('status', ['open', 'ongoing'])),
    countRows('trips', (q) => q.eq('status', 'completed')),
    countRows('trips'),
    countRows('id_verifications', (q) => q.eq('status', 'pending')),
  ]);
  const firstError = [users, activeTrips, completedTrips, totalTrips, pendingVerifications].find((r) => r.error)?.error ?? null;
  return {
    data: {
      totalUsers: users.count,
      activeTrips: activeTrips.count,
      completedTrips: completedTrips.count,
      totalTrips: totalTrips.count,
      pendingVerifications: pendingVerifications.count,
    },
    error: firstError,
  };
}

export interface StaffResolutionCount {
  staffId: string;
  displayName: string;
  resolvedToday: number;
}

export async function getStaffResolutionCounts(): Promise<{ data: StaffResolutionCount[]; error: Error | null }> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('reports')
    .select('reviewed_by')
    .in('status', ['resolved', 'dismissed'])
    .gte('reviewed_at', startOfToday.toISOString())
    .not('reviewed_by', 'is', null);

  if (error) return { data: [], error };

  const resolvedCounts = new Map<string, number>();
  for (const row of data ?? []) {
    const staffId = row.reviewed_by as string;
    resolvedCounts.set(staffId, (resolvedCounts.get(staffId) ?? 0) + 1);
  }
  if (resolvedCounts.size === 0) return { data: [], error: null };

  const { data: staffProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', Array.from(resolvedCounts.keys()));
  if (profilesError) return { data: [], error: profilesError };

  const nameById = new Map((staffProfiles ?? []).map((p) => [p.id as string, p.display_name as string]));
  const results = Array.from(resolvedCounts.entries())
    .map(([staffId, resolvedToday]) => ({ staffId, displayName: nameById.get(staffId) ?? 'Unknown', resolvedToday }))
    .sort((a, b) => b.resolvedToday - a.resolvedToday);
  return { data: results, error: null };
}

export interface AnalyticsMetrics {
  totalTrips: number;
  newUsersThisWeek: number;
  completionRatePct: number;
  avgResolutionHours: number | null;
}

export async function getAnalyticsMetrics(): Promise<{ data: AnalyticsMetrics; error: Error | null }> {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [totalTrips, completedTrips, newUsers, resolvedReports] = await Promise.all([
    countRows('trips'),
    countRows('trips', (q) => q.eq('status', 'completed')),
    countRows('profiles', (q) => q.gte('created_at', startOfWeek.toISOString())),
    supabase.from('reports').select('created_at, reviewed_at').in('status', ['resolved', 'dismissed']).not('reviewed_at', 'is', null),
  ]);

  const firstError = [totalTrips, completedTrips, newUsers].find((r) => r.error)?.error ?? resolvedReports.error ?? null;

  const durationsHours = (resolvedReports.data ?? [])
    .map((row) => (new Date(row.reviewed_at as string).getTime() - new Date(row.created_at as string).getTime()) / 3_600_000)
    .filter((hours) => Number.isFinite(hours) && hours >= 0);
  const avgResolutionHours = durationsHours.length > 0 ? durationsHours.reduce((a, b) => a + b, 0) / durationsHours.length : null;

  return {
    data: {
      totalTrips: totalTrips.count,
      newUsersThisWeek: newUsers.count,
      completionRatePct: totalTrips.count > 0 ? (completedTrips.count / totalTrips.count) * 100 : 0,
      avgResolutionHours,
    },
    error: firstError,
  };
}

export interface WeekBucket {
  weekLabel: string;
  trips: number;
  disputes: number;
}

export async function getWeeklyTripsAndDisputes(weeks = 8): Promise<{ data: WeekBucket[]; error: Error | null }> {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const [trips, reports] = await Promise.all([
    supabase.from('trips').select('created_at').gte('created_at', since.toISOString()),
    supabase.from('reports').select('created_at').gte('created_at', since.toISOString()),
  ]);
  const error = trips.error ?? reports.error ?? null;

  // Bucket i covers the 7 days ending (weeks - 1 - i) weeks before today; label it by its date range.
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => {
    const end = new Date();
    end.setDate(end.getDate() - (weeks - 1 - i) * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const endLabel = start.getMonth() === end.getMonth() ? String(end.getDate()) : fmt(end);
    return { weekLabel: `${fmt(start)}–${endLabel}`, trips: 0, disputes: 0 };
  });
  const bucketIndex = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (24 * 3_600_000));
    const index = weeks - 1 - Math.floor(days / 7);
    return index >= 0 && index < weeks ? index : null;
  };
  for (const row of trips.data ?? []) {
    const idx = bucketIndex(row.created_at as string);
    if (idx !== null) buckets[idx].trips += 1;
  }
  for (const row of reports.data ?? []) {
    const idx = bucketIndex(row.created_at as string);
    if (idx !== null) buckets[idx].disputes += 1;
  }
  return { data: buckets, error };
}

export interface DestinationCount {
  destination: string;
  count: number;
  pct: number;
}

export async function getTopDestinations(limit = 5): Promise<{ data: DestinationCount[]; error: Error | null }> {
  const { data, error } = await supabase.from('trips').select('destination').not('destination', 'is', null);
  if (error) return { data: [], error };

  // Destinations are free text, so "Makati", "makati " and "MAKATI" are the same
  // place. Group on a case/whitespace-insensitive key and show a title-cased label.
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const key = (row.destination as string).trim().replace(/\s+/g, ' ').toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = data?.length ?? 0;
  const titleCase = (s: string) => s.replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
  const sorted = Array.from(counts.entries())
    .map(([key, count]) => ({ destination: titleCase(key), count, pct: total > 0 ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return { data: sorted, error: null };
}
