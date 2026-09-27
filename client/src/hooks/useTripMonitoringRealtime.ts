import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { SafetySessionRow } from '@/lib/tripMonitoring';
import { useActiveSosAlerts, useLivePositions } from '@/hooks/useSosRealtime';

// Modeled on partyup-mobile's app/(tabs)/map.tsx channel-lifecycle pattern:
// one channel per thing being watched, torn down and re-created as the
// watched id changes, all channels removed on unmount.

export interface LivePosition {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export function useTripMonitoringRealtime(selectedTripId: string | null, memberUserIds: string[]) {
  const [selectedTripSafetySessions, setSelectedTripSafetySessions] = useState<SafetySessionRow[]>([]);
  const safetySessionChannelRef = useRef<RealtimeChannel | null>(null);

  // Live member locations -- bounded to the members of whichever trip is open
  // in the detail panel. Keyed by user_id, not current_locations.trip_id,
  // which the phone never sets.
  const livePositions: Record<string, LivePosition> = useLivePositions(memberUserIds);

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

  // SOS alerts: repo-wide, shared with the SOS Center (see useSosRealtime).
  const { alerts: activeSosAlerts } = useActiveSosAlerts();

  return { livePositions, selectedTripSafetySessions, activeSosAlerts };
}
