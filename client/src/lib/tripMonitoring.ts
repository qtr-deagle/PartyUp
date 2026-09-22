import { supabase } from '@/lib/supabase';
import type { TripStatus, TripType, MemberRole, MemberStatus } from '@/lib/tours';

// Backs the staff/admin Trip Monitoring dashboard -- see
// supabase/migrations/20260919000000_add_trip_monitoring.sql for the
// SECURITY DEFINER RPC this calls (staff/admin gated server-side, matching
// review_id_verification's role-check convention).

export interface TripMonitoringRow {
  id: string;
  title: string;
  trip_type: TripType;
  origin: string;
  destination: string;
  destination_lat: number | null;
  destination_lng: number | null;
  start_at: string | null;
  end_at: string | null;
  status: TripStatus;
  seats_total: number | null;
  seats_available: number | null;
  organizer_id: string;
  organizer_display_name: string;
  members_accepted_count: number;
  open_report_count: number;
  active_safety_session_count: number;
  active_sos_count: number;
  latest_sos_at: string | null;
}

export async function listActiveTripsWithSafetyStatus(search?: string, includeCompleted = false) {
  const { data, error } = await supabase.rpc('list_active_trips_with_safety_status', {
    p_search: search?.trim() || null,
    p_include_completed: includeCompleted,
  });
  return { data: (data ?? []) as TripMonitoringRow[], error };
}

export interface TripMemberRow {
  id: string;
  user_id: string;
  member_role: MemberRole;
  status: MemberStatus;
  joined_at: string | null;
  profiles: { display_name: string; avatar_url: string | null; phone: string | null } | null;
}

export interface TripItineraryDayRow {
  id: string;
  day_number: number;
  description: string | null;
}

export interface SafetySessionRow {
  id: string;
  user_id: string;
  status: 'monitoring' | 'cancelled' | 'escalated';
  started_at: string;
  expires_at: string;
  resolved_at: string | null;
}

export interface SosAlertRow {
  id: string;
  user_id: string;
  trip_id: string | null;
  safety_session_id: string | null;
  trigger_reason: 'manual' | 'auto_escalation';
  latitude: number | null;
  longitude: number | null;
  status: 'active' | 'resolved';
  recipient_count: number;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface TripLocationRow {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
  is_visible: boolean;
  updated_at: string;
}

export interface TripReportRow {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  report_type: string;
  status: string;
  details: string;
  created_at: string;
}

export interface TripMonitoringDetail {
  members: TripMemberRow[];
  itinerary: TripItineraryDayRow[];
  locations: TripLocationRow[];
  safetySessions: SafetySessionRow[];
  sosAlerts: SosAlertRow[];
  reports: TripReportRow[];
}

export async function getTripMonitoringDetail(tripId: string): Promise<{ data: TripMonitoringDetail | null; error: Error | null }> {
  const [members, itinerary, locations, safetySessions, sosAlerts, reports] = await Promise.all([
    supabase
      .from('trip_members')
      .select('id, user_id, member_role, status, joined_at, profiles!trip_members_user_id_fkey(display_name, avatar_url, phone)')
      .eq('trip_id', tripId),
    supabase.from('trip_itinerary_days').select('id, day_number, description').eq('trip_id', tripId).order('day_number', { ascending: true }),
    supabase.from('current_locations').select('user_id, latitude, longitude, accuracy_m, is_visible, updated_at').eq('trip_id', tripId),
    supabase.from('safety_sessions').select('id, user_id, status, started_at, expires_at, resolved_at').eq('trip_id', tripId).order('started_at', { ascending: false }),
    supabase.from('sos_alerts').select('*').eq('trip_id', tripId).order('created_at', { ascending: false }),
    supabase.from('reports').select('id, reporter_id, reported_user_id, report_type, status, details, created_at').eq('trip_id', tripId).order('created_at', { ascending: false }),
  ]);

  const firstError = members.error || itinerary.error || locations.error || safetySessions.error || sosAlerts.error || reports.error;
  if (firstError) return { data: null, error: firstError };

  return {
    data: {
      members: (members.data ?? []) as unknown as TripMemberRow[],
      itinerary: (itinerary.data ?? []) as TripItineraryDayRow[],
      locations: (locations.data ?? []) as TripLocationRow[],
      safetySessions: (safetySessions.data ?? []) as SafetySessionRow[],
      sosAlerts: (sosAlerts.data ?? []) as SosAlertRow[],
      reports: (reports.data ?? []) as TripReportRow[],
    },
    error: null,
  };
}

export async function resolveSosAlert(alertId: string, notes?: string) {
  const { data, error } = await supabase.rpc('resolve_sos_alert', {
    p_alert_id: alertId,
    p_notes: notes?.trim() || null,
  });
  return { data: data as SosAlertRow | null, error };
}
