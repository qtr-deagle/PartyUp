import { supabase } from '@/lib/supabase';
import type { SosAlertRow } from '@/lib/tripMonitoring';

// Backs the staff/admin SOS Center. sos_alerts, current_locations and
// location_history are all readable by staff through their
// is_staff_or_admin() RLS branches; resolving goes through the existing
// resolve_sos_alert RPC (re-exported below, it also writes the audit log).
export { resolveSosAlert } from '@/lib/tripMonitoring';

export interface SosAlertDetail extends SosAlertRow {
  accuracy_m: number | null;
  profile: { display_name: string; avatar_url: string | null; phone: string | null; city: string | null } | null;
  trip: { id: string; origin: string; destination: string } | null;
}

export interface TrailPoint {
  latitude: number;
  longitude: number;
  at: string;
}

const SOS_SELECT =
  '*, profile:profiles!sos_alerts_user_id_fkey(display_name, avatar_url, phone, city), trip:trips!sos_alerts_trip_id_fkey(id, origin, destination)';

function normalize(row: SosAlertDetail): SosAlertDetail {
  return {
    ...row,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    accuracy_m: row.accuracy_m === null ? null : Number(row.accuracy_m),
  };
}

export async function listSosAlerts(status: 'active' | 'resolved', limit = 100) {
  const { data, error } = await supabase
    .from('sos_alerts')
    .select(SOS_SELECT)
    .eq('status', status)
    .order(status === 'active' ? 'created_at' : 'resolved_at', { ascending: false })
    .limit(limit);
  return { data: ((data ?? []) as unknown as SosAlertDetail[]).map(normalize), error };
}

export async function getSosAlert(alertId: string) {
  const { data, error } = await supabase.from('sos_alerts').select(SOS_SELECT).eq('id', alertId).maybeSingle();
  return { data: data ? normalize(data as unknown as SosAlertDetail) : null, error };
}

export interface CurrentPosition {
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  updatedAt: string;
}

export async function getCurrentPositions(userIds: string[]) {
  if (userIds.length === 0) return { data: {} as Record<string, CurrentPosition>, error: null };
  const { data, error } = await supabase
    .from('current_locations')
    .select('user_id, latitude, longitude, accuracy_m, updated_at')
    .in('user_id', userIds);
  const positions: Record<string, CurrentPosition> = {};
  for (const row of data ?? []) {
    positions[row.user_id] = {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      accuracyM: row.accuracy_m === null ? null : Number(row.accuracy_m),
      updatedAt: row.updated_at,
    };
  }
  return { data: positions, error };
}

// The path walked since the SOS was pressed (background tracking writes a
// location_history row per fix), capped so a long alert stays cheap to draw.
export async function getSosTrail(userId: string, sinceIso: string, untilIso?: string | null) {
  let query = supabase
    .from('location_history')
    .select('latitude, longitude, captured_at')
    .eq('user_id', userId)
    .gte('captured_at', sinceIso)
    .order('captured_at', { ascending: true })
    .limit(2000);
  if (untilIso) query = query.lte('captured_at', untilIso);
  const { data, error } = await query;
  return {
    data: (data ?? []).map((row) => ({ latitude: Number(row.latitude), longitude: Number(row.longitude), at: row.captured_at })) as TrailPoint[],
    error,
  };
}
