import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { SafetySessionRow, SosAlertRow } from '@/lib/tripMonitoring';

// Modeled on partyup-mobile's app/(tabs)/map.tsx channel-lifecycle pattern:
// one channel per thing being watched, torn down and re-created as the
// watched id changes, all channels removed on unmount.

export interface LivePosition {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export function useTripMonitoringRealtime(selectedTripId: string | null) {
  const [livePositions, setLivePositions] = useState<Record<string, LivePosition>>({});
  const [selectedTripSafetySessions, setSelectedTripSafetySessions] = useState<SafetySessionRow[]>([]);
  const [activeSosAlerts, setActiveSosAlerts] = useState<SosAlertRow[]>([]);
  const locationChannelRef = useRef<RealtimeChannel | null>(null);
  const safetySessionChannelRef = useRef<RealtimeChannel | null>(null);

  // Live member locations -- bounded to whichever trip is currently open in
  // the detail panel, not every ongoing trip in the list, so channel count
  // doesn't grow with how many trips are active at once.
  useEffect(() => {
    setLivePositions({});
    if (locationChannelRef.current) {
      supabase.removeChannel(locationChannelRef.current);
      locationChannelRef.current = null;
    }
    if (!selectedTripId) return;

    const channel = supabase
      .channel(`trip-monitoring-locations:${selectedTripId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'current_locations', filter: `trip_id=eq.${selectedTripId}` },
        (payload) => {
          const next = payload.new as { user_id: string; latitude: number; longitude: number; updated_at: string };
          setLivePositions((current) => ({
            ...current,
            [next.user_id]: { latitude: next.latitude, longitude: next.longitude, updatedAt: next.updated_at },
          }));
        }
      )
      .subscribe();
    locationChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (locationChannelRef.current === channel) locationChannelRef.current = null;
    };
  }, [selectedTripId]);

  // Live "started Warning Mode" indicator, same bounded-to-selected-trip scope.
  useEffect(() => {
    setSelectedTripSafetySessions([]);
    if (safetySessionChannelRef.current) {
      supabase.removeChannel(safetySessionChannelRef.current);
      safetySessionChannelRef.current = null;
    }
    if (!selectedTripId) return;

    supabase
      .from('safety_sessions')
      .select('id, user_id, status, started_at, expires_at, resolved_at')
      .eq('trip_id', selectedTripId)
      .eq('status', 'monitoring')
      .then(({ data }) => {
        if (data) setSelectedTripSafetySessions(data as SafetySessionRow[]);
      });

    const channel = supabase
      .channel(`trip-monitoring-safety-sessions:${selectedTripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'safety_sessions', filter: `trip_id=eq.${selectedTripId}` },
        (payload) => {
          const row = payload.new as SafetySessionRow;
          setSelectedTripSafetySessions((current) => {
            const withoutRow = current.filter((session) => session.id !== row.id);
            return row.status === 'monitoring' ? [row, ...withoutRow] : withoutRow;
          });
        }
      )
      .subscribe();
    safetySessionChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (safetySessionChannelRef.current === channel) safetySessionChannelRef.current = null;
    };
  }, [selectedTripId]);

  // SOS alerts: repo-wide, unfiltered -- RLS already scopes delivered rows to
  // staff/admin, and SOS volume is low compared to location updates, so this
  // doesn't carry the same per-trip channel cost concern. Seeded once with
  // whatever's already active, then kept live via INSERT/UPDATE.
  useEffect(() => {
    let cancelled = false;

    supabase
      .from('sos_alerts')
      .select('*')
      .eq('status', 'active')
      .then(({ data }) => {
        if (!cancelled && data) setActiveSosAlerts(data as SosAlertRow[]);
      });

    const channel = supabase
      .channel('trip-monitoring-sos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, (payload) => {
        setActiveSosAlerts((current) => [payload.new as SosAlertRow, ...current]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sos_alerts' }, (payload) => {
        const updated = payload.new as SosAlertRow;
        setActiveSosAlerts((current) =>
          updated.status === 'active'
            ? current.map((alert) => (alert.id === updated.id ? updated : alert))
            : current.filter((alert) => alert.id !== updated.id)
        );
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { livePositions, selectedTripSafetySessions, activeSosAlerts };
}
