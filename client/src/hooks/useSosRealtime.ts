import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentPositions, getSosAlert, listSosAlerts, type CurrentPosition, type SosAlertDetail } from '@/lib/sos';
import type { SosAlertRow } from '@/lib/tripMonitoring';

// Each hook instance gets its own channel name: the layouts' global alert and
// the SOS Center page are mounted at the same time.
function channelName(prefix: string) {
  return `${prefix}:${Math.random().toString(36).slice(2)}`;
}

// Every active SOS, repo-wide (RLS limits delivery to staff/admin). Seeded
// once, then kept live: an INSERT refetches the row with its profile/trip
// joins, a resolve drops it.
export function useActiveSosAlerts() {
  const [alerts, setAlerts] = useState<SosAlertDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    listSosAlerts('active').then(({ data }) => {
      if (cancelled) return;
      setAlerts(data);
      setIsLoading(false);
    });

    const upsert = (row: SosAlertDetail) =>
      setAlerts((current) => [row, ...current.filter((alert) => alert.id !== row.id)].sort((a, b) => b.created_at.localeCompare(a.created_at)));

    const channel = supabase
      .channel(channelName('sos-alerts'))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, (payload) => {
        const id = (payload.new as SosAlertRow).id;
        getSosAlert(id).then(({ data }) => {
          if (!cancelled && data && data.status === 'active') upsert(data);
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sos_alerts' }, (payload) => {
        const updated = payload.new as SosAlertRow & { accuracy_m: number | null };
        setAlerts((current) =>
          updated.status === 'active'
            ? current.map((alert) => (alert.id === updated.id ? { ...alert, ...updated } : alert))
            : current.filter((alert) => alert.id !== updated.id)
        );
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { alerts, isLoading };
}

// Live current_locations for a set of users (the ones with an active SOS).
// Re-subscribes whenever the set changes.
export function useLivePositions(userIds: string[]) {
  const [positions, setPositions] = useState<Record<string, CurrentPosition>>({});
  const key = useMemo(() => Array.from(new Set(userIds)).sort().join(','), [userIds]);

  useEffect(() => {
    if (!key) {
      setPositions({});
      return;
    }
    const ids = key.split(',');
    let cancelled = false;

    getCurrentPositions(ids).then(({ data }) => {
      if (!cancelled) setPositions(data);
    });

    const apply = (row: { user_id: string; latitude: number; longitude: number; accuracy_m: number | null; updated_at: string }) => {
      setPositions((current) => ({
        ...current,
        [row.user_id]: {
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          accuracyM: row.accuracy_m === null ? null : Number(row.accuracy_m),
          updatedAt: row.updated_at,
        },
      }));
    };

    const filter = `user_id=in.(${ids.join(',')})`;
    const channel = supabase
      .channel(channelName('sos-positions'))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'current_locations', filter }, (payload) => apply(payload.new as never))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'current_locations', filter }, (payload) => apply(payload.new as never))
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [key]);

  return positions;
}
