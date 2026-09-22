import { supabase } from '@/lib/supabase';
import type { TripStatus, TripType } from '@/lib/tours';

// Admin/staff-wide trip visibility is intentionally separate from
// list_my_trips/list_browse_trips (both user-scoped) -- see
// supabase/migrations/20260918000000_list_all_trips_admin.sql for the
// SECURITY DEFINER RPC this calls. Run that migration in Supabase before
// this will return data.

export interface AdminTripRow {
  id: string;
  title: string;
  trip_type: TripType;
  origin: string;
  destination: string;
  start_at: string | null;
  status: TripStatus;
  seats_total: number | null;
  seats_available: number | null;
  organizer_id: string;
  organizer_display_name: string;
}

export async function listAllTrips(search?: string) {
  const { data, error } = await supabase.rpc('list_all_trips_admin', { p_search: search?.trim() || null });
  return { data: (data ?? []) as AdminTripRow[], error };
}

export async function countOpenReportsByTrip(tripIds: string[]) {
  if (tripIds.length === 0) return { data: new Set<string>(), error: null };
  const { data, error } = await supabase.from('reports').select('trip_id').eq('status', 'open').in('trip_id', tripIds);
  if (error) return { data: new Set<string>(), error };
  const tripIdsWithOpenReports = new Set((data ?? []).map((row) => row.trip_id as string).filter(Boolean));
  return { data: tripIdsWithOpenReports, error: null };
}
