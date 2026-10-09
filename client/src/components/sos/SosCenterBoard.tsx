import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from 'react';
import Map, { Layer, Marker, Source, type MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import {
  CheckCircle2,
  Clock,
  Copy,
  Crosshair,
  ExternalLink,
  History,
  Layers,
  MapPin,
  Maximize2,
  Minus,
  Phone,
  PhoneCall,
  Plane,
  Plus,
  Route,
  ShieldCheck,
  Siren,
  Timer,
  Users,
  WifiOff,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useLocation, useSearch } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import { getSosTrail, listSosAlerts, type SosAlertDetail, type TrailPoint } from '@/lib/sos';
import { useActiveSosAlerts, useLivePositions } from '@/hooks/useSosRealtime';
import ResolveSosDialog, { useSosResolving } from '@/components/sos/ResolveSosDialog';
import { formatDateTime } from '@/lib/datetime';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
}

// No GPS update for this long: the phone may be off, out of signal, or the app killed.
const STALE_AFTER_MS = 60_000;

function formatAgo(iso: string, now: number) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}

function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function alertDuration(alert: SosAlertDetail) {
  if (!alert.resolved_at) return null;
  return new Date(alert.resolved_at).getTime() - new Date(alert.created_at).getTime();
}

function Avatar({ profile, live }: { profile: SosAlertDetail['profile']; live: boolean }) {
  const name = profile?.display_name ?? '?';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <div className="relative shrink-0">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt={name} className="w-10 h-10 rounded-full object-cover border border-border" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold text-foreground">{initials || '?'}</div>
      )}
      {live && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-destructive border-2 border-card animate-pulse" />}
    </div>
  );
}

function StatCard({ icon, iconClass, label, value, hint }: { icon: ReactNode; iconClass: string; label: string; value: string; hint?: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-elevation-1 border border-border flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${iconClass}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground truncate">{hint}</p>}
      </div>
    </div>
  );
}

// Shown when nothing is selected, so the panel guides responders instead of sitting empty.
const RESPONSE_STEPS = [
  { title: 'Open the alert', body: 'Check the live position, signal status, and the path walked since SOS was pressed.' },
  { title: 'Call the traveler', body: 'Use the phone number on the alert. No answer or signal lost? Treat it as urgent.' },
  { title: 'Coordinate with trusted contacts', body: 'They were notified automatically. Ask if they have already reached the traveler.' },
  { title: 'Escalate if needed', body: 'If the traveler is in danger or unreachable, call 911 and share the coordinates.' },
  { title: 'Resolve with notes', body: 'Confirm they are safe, then record what happened. Resolving stops live location sharing on their phone.' },
];

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** `padded={false}` when the layout already pads its content (AdminLayout). */
export default function SosCenterBoard({ padded = true }: { padded?: boolean }) {
  const { theme } = useTheme();
  const mapStyle = theme === 'dark' ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/navigation-day-v1';
  const [location] = useLocation();
  const basePath = location.startsWith('/admin') ? '/admin' : '/staff';
  const search = useSearch();
  const requestedAlertId = new URLSearchParams(search).get('alert');
  const now = useNow();

  const [tab, setTab] = useState<'active' | 'resolved'>('active');
  const { alerts: activeAlerts, isLoading: isActiveLoading } = useActiveSosAlerts();
  const [resolvedAlerts, setResolvedAlerts] = useState<SosAlertDetail[]>([]);
  const [isResolvedLoading, setIsResolvedLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(requestedAlertId);

  const positions = useLivePositions(useMemo(() => activeAlerts.map((alert) => alert.user_id), [activeAlerts]));

  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [follow, setFollow] = useState(true);
  const mapRef = useRef<MapRef | null>(null);
  // Full-screen response view: its own map instance, sharing follow mode.
  const bigMapRef = useRef<MapRef | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [satellite, setSatellite] = useState(false);
  // Response checklist ticks, per alert (this browser tab only).
  const [checked, setChecked] = useState<Record<string, number[]>>({});

  const [resolving, setResolving] = useState<SosAlertDetail | null>(null);
  const isResolving = useSosResolving();

  useEffect(() => {
    if (requestedAlertId) {
      setSelectedId(requestedAlertId);
      setTab('active');
    }
  }, [requestedAlertId]);

  // Loaded up front (not only on the Resolved tab) so the stats and recent list
  // have data; reloaded whenever an active alert ends.
  useEffect(() => {
    let cancelled = false;
    setIsResolvedLoading(true);
    listSosAlerts('resolved').then(({ data, error }) => {
      if (cancelled) return;
      if (error) toast.error('Failed to load resolved alerts');
      setResolvedAlerts(data);
      setIsResolvedLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeAlerts.length]);

  const stats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const resolvedToday = resolvedAlerts.filter((alert) => alert.resolved_at && new Date(alert.resolved_at) >= startOfToday).length;
    const durations = resolvedAlerts.map(alertDuration).filter((ms): ms is number => ms !== null);
    const avgResolveMs = durations.length ? durations.reduce((sum, ms) => sum + ms, 0) / durations.length : null;
    const latest = [...activeAlerts, ...resolvedAlerts].reduce<string | null>(
      (max, alert) => (!max || alert.created_at > max ? alert.created_at : max),
      null
    );
    return { resolvedToday, avgResolveMs, latest, sampleSize: durations.length };
  }, [activeAlerts, resolvedAlerts]);

  const list = tab === 'active' ? activeAlerts : resolvedAlerts;
  const selected = list.find((alert) => alert.id === selectedId) ?? (tab === 'active' ? activeAlerts[0] : null) ?? null;
  const isLive = selected?.status === 'active';
  const livePosition = selected && isLive ? positions[selected.user_id] : undefined;

  // Where to draw the person right now: the live row while active, otherwise the
  // last trail point, otherwise the spot where SOS was pressed.
  const origin = selected && selected.latitude !== null && selected.longitude !== null ? { latitude: selected.latitude, longitude: selected.longitude } : null;
  const current = livePosition ?? trail[trail.length - 1] ?? origin;

  // Load the path walked since SOS was pressed.
  useEffect(() => {
    setTrail([]);
    if (!selected) return;
    let cancelled = false;
    getSosTrail(selected.user_id, selected.created_at, selected.resolved_at).then(({ data }) => {
      if (!cancelled) setTrail(data);
    });
    return () => {
      cancelled = true;
    };
    // Only when the selection changes; live points are appended below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // Extend the trail with each live update.
  useEffect(() => {
    if (!livePosition || !selected) return;
    if (new Date(livePosition.updatedAt).getTime() < new Date(selected.created_at).getTime()) return;
    setTrail((points) => {
      const last = points[points.length - 1];
      if (last && (last.at >= livePosition.updatedAt || (last.latitude === livePosition.latitude && last.longitude === livePosition.longitude))) {
        return points;
      }
      return [...points, { latitude: livePosition.latitude, longitude: livePosition.longitude, at: livePosition.updatedAt }];
    });
  }, [livePosition, selected]);

  // Follow mode: keep the person centered as they move.
  useEffect(() => {
    if (!follow || !current) return;
    for (const map of [mapRef.current, bigMapRef.current]) {
      map?.easeTo({ center: [current.longitude, current.latitude], duration: 800 });
    }
  }, [follow, current?.latitude, current?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  const trailGeoJson = useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: [...(origin ? [[origin.longitude, origin.latitude]] : []), ...trail.map((point) => [point.longitude, point.latitude])],
      },
    }),
    [origin?.latitude, origin?.longitude, trail] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const lastUpdate = livePosition?.updatedAt ?? null;
  const isStale = isLive && (!lastUpdate || now - new Date(lastUpdate).getTime() > STALE_AFTER_MS);

  // Esc closes the full-screen view (an open Resolve dialog handles Esc first).
  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.querySelector('[role="alertdialog"], [role="dialog"]:not([data-sos-fullscreen])')) return;
      setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  // Nothing selected any more (e.g. resolved and gone from the list): close it.
  useEffect(() => {
    if (!selected) setExpanded(false);
  }, [selected]);

  const fitPath = (map: MapRef | null) => {
    if (!map) return;
    const points = trailGeoJson.geometry.coordinates as number[][];
    const all = current ? [...points, [current.longitude, current.latitude]] : points;
    if (all.length < 2) {
      if (current) map.flyTo({ center: [current.longitude, current.latitude], zoom: 16, duration: 800 });
      return;
    }
    setFollow(false);
    const lngs = all.map((point) => point[0]);
    const lats = all.map((point) => point[1]);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 100, maxZoom: 17, duration: 800 }
    );
  };

  const copyCoordinates = async () => {
    if (!current || !selected) return;
    const text = `${selected.profile?.display_name ?? 'Traveler'} (SOS): ${current.latitude.toFixed(6)}, ${current.longitude.toFixed(6)} https://www.google.com/maps?q=${current.latitude},${current.longitude}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Coordinates copied');
    } catch {
      toast.error("Couldn't copy to the clipboard");
    }
  };

  // The map, drawn inline and in the full-screen view.
  const renderMap = (ref: Ref<MapRef>, big: boolean) =>
    selected && current ? (
      <Map
        key={`${selected.id}:${big ? 'big' : 'inline'}`}
        ref={ref}
        initialViewState={{ longitude: current.longitude, latitude: current.latitude, zoom: 16 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={big && satellite ? 'mapbox://styles/mapbox/satellite-streets-v12' : mapStyle}
        mapboxAccessToken={mapboxToken}
        attributionControl={false}
        onDragStart={() => setFollow(false)}
      >
        {trailGeoJson.geometry.coordinates.length > 1 && (
          <Source id="sos-trail" type="geojson" data={trailGeoJson}>
            <Layer id="sos-trail-line" type="line" paint={{ 'line-color': '#ef4444', 'line-width': big ? 5 : 4, 'line-opacity': 0.8 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
          </Source>
        )}

        {origin && (
          <Marker longitude={origin.longitude} latitude={origin.latitude} anchor="center">
            <div title="Where SOS was pressed" className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border-[3px] border-destructive bg-background" />
              {big && <span className="mt-1 rounded-md bg-card/95 border border-border px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow">SOS pressed</span>}
            </div>
          </Marker>
        )}

        <Marker longitude={current.longitude} latitude={current.latitude} anchor="center">
          <div title={isLive ? 'Live position' : 'Last known position'} className="relative flex items-center justify-center">
            {isLive && !isStale && <span className={`absolute rounded-full bg-destructive/40 animate-ping ${big ? 'w-14 h-14' : 'w-10 h-10'}`} />}
            <span
              className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-lg ${big ? 'w-8 h-8' : 'w-5 h-5'} ${
                isStale || !isLive ? 'bg-amber-500' : 'bg-destructive'
              }`}
            >
              {big && <Siren className="w-4 h-4 text-white" />}
            </span>
            {big && (
              <span className="absolute left-full ml-2 whitespace-nowrap rounded-md bg-card/95 border border-border px-2 py-0.5 text-xs font-semibold text-foreground shadow">
                {selected.profile?.display_name ?? 'Traveler'}
              </span>
            )}
          </div>
        </Marker>
      </Map>
    ) : null;

  const statusTone = !isLive ? 'bg-secondary text-muted-foreground' : isStale ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-destructive text-destructive-foreground';
  const statusLabel = !isLive ? 'Resolved' : isStale ? 'Signal lost' : 'Live';
  const checklist = selected ? (checked[selected.id] ?? []) : [];
  const toggleStep = (index: number) =>
    selected &&
    setChecked((prev) => {
      const list = prev[selected.id] ?? [];
      return { ...prev, [selected.id]: list.includes(index) ? list.filter((i) => i !== index) : [...list, index] };
    });

  return (
    <div className={`flex flex-col gap-5 lg:h-full lg:min-h-0 ${padded ? 'p-8' : ''}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Siren className="w-8 h-8 text-destructive" /> SOS Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">Live GPS of travelers who pressed SOS. Positions update every few seconds until the alert ends.</p>
        </div>
        <div className="inline-flex h-10 items-center gap-1 rounded-lg border border-border bg-secondary p-1">
          {(['active', 'resolved'] as const).map((value) => (
            <button
              key={value}
              onClick={() => {
                setTab(value);
                setSelectedId(null);
              }}
              className={`inline-flex h-8 items-center px-3 rounded-md text-sm font-semibold capitalize transition-colors ${
                tab === value
                  ? value === 'active'
                    ? 'bg-destructive text-destructive-foreground shadow-elevation-1'
                    : 'bg-card text-foreground shadow-elevation-1'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {value}
              {value === 'active' && activeAlerts.length > 0 ? ` (${activeAlerts.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<Siren className={`w-6 h-6 ${activeAlerts.length > 0 ? 'text-destructive animate-pulse' : 'text-green-500'}`} />}
          iconClass={activeAlerts.length > 0 ? 'bg-destructive/10' : 'bg-green-500/10'}
          label="Active now"
          value={String(activeAlerts.length)}
          hint={activeAlerts.length > 0 ? 'Needs a responder' : 'All clear'}
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6 text-primary" />}
          iconClass="bg-primary/10"
          label="Resolved today"
          value={String(stats.resolvedToday)}
          hint={`${resolvedAlerts.length} in recent history`}
        />
        <StatCard
          icon={<Timer className="w-6 h-6 text-amber-500" />}
          iconClass="bg-amber-500/10"
          label="Avg. time to resolve"
          value={stats.avgResolveMs === null ? '—' : formatDuration(stats.avgResolveMs)}
          hint={stats.sampleSize ? `Last ${stats.sampleSize} alerts` : 'No resolved alerts yet'}
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-blue-500" />}
          iconClass="bg-blue-500/10"
          label="Last alert"
          value={stats.latest ? formatAgo(stats.latest, now) : '—'}
          hint={stats.latest ? formatDateTime(stats.latest) : 'No alerts on record'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:flex-1 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]">
        <div className="lg:col-span-2 lg:min-h-0">
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden lg:h-full flex flex-col">
            {(tab === 'active' ? isActiveLoading : isResolvedLoading) ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
            ) : list.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-semibold text-foreground">{tab === 'active' ? 'All travelers are safe' : 'No resolved alerts yet'}</p>
                <p className="text-sm text-muted-foreground">
                  {tab === 'active'
                    ? 'No one has pressed SOS. New alerts appear here instantly with a sound and banner.'
                    : 'Alerts you resolve will be listed here with their notes.'}
                </p>
                {tab === 'active' && stats.latest && <p className="text-xs text-muted-foreground">Last alert {formatAgo(stats.latest, now)}</p>}
              </div>
            ) : (
              <div className="divide-y divide-border max-lg:max-h-[70vh] lg:flex-1 lg:min-h-0 overflow-y-auto overscroll-contain">
                {list.map((alert) => {
                  const position = alert.status === 'active' ? positions[alert.user_id] : undefined;
                  const stale = alert.status === 'active' && (!position || now - new Date(position.updatedAt).getTime() > STALE_AFTER_MS);
                  return (
                    <button
                      key={alert.id}
                      onClick={() => setSelectedId(alert.id)}
                      className={`w-full text-left p-4 transition-colors ${selected?.id === alert.id ? 'bg-primary/10' : 'hover:bg-secondary/50'} ${
                        alert.status === 'active' ? 'border-l-4 border-destructive' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar profile={alert.profile} live={alert.status === 'active'} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-foreground text-sm">{alert.profile?.display_name ?? 'Unknown user'}</p>
                            <span className="text-xs text-muted-foreground shrink-0">{formatAgo(alert.created_at, now)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.trigger_reason === 'manual' ? 'Pressed SOS' : 'Auto-escalated from Warning Mode'}
                            {alert.trip ? ` · ${alert.trip.origin} → ${alert.trip.destination}` : ''}
                          </p>
                          {alert.status === 'active' ? (
                            <p className={`text-xs mt-2 flex items-center gap-1.5 ${stale ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                              {stale ? <WifiOff className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                              {position ? `${stale ? 'Signal lost · last seen' : 'Live · updated'} ${formatAgo(position.updatedAt, now)}` : 'No GPS yet'}
                              {position?.accuracyM != null && !stale ? ` · ±${Math.round(position.accuracyM)} m` : ''}
                            </p>
                          ) : (
                            <p className="text-xs mt-2 text-muted-foreground">
                              Resolved {alert.resolved_at ? formatAgo(alert.resolved_at, now) : ''}
                              {alertDuration(alert) !== null ? ` · handled in ${formatDuration(alertDuration(alert)!)}` : ''}
                              {alert.resolution_notes ? ` · ${alert.resolution_notes}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 lg:min-h-0">
          {!selected ? (
            <div className="space-y-4 lg:h-full lg:overflow-y-auto lg:overscroll-contain">
              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <PhoneCall className="w-5 h-5 text-destructive" />
                  <h3 className="text-lg font-bold text-foreground">Response protocol</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  {list.length > 0 ? 'Select an alert to see the traveler’s live location.' : 'What to do when an SOS comes in.'}
                </p>
                <ol className="space-y-4">
                  {RESPONSE_STEPS.map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="w-7 h-7 shrink-0 rounded-full bg-destructive/10 text-destructive text-sm font-bold flex items-center justify-center">{index + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <History className="w-5 h-5 text-muted-foreground" /> Recently resolved
                  </h3>
                  {resolvedAlerts.length > 3 && tab !== 'resolved' && (
                    <button onClick={() => setTab('resolved')} className="text-sm text-primary font-medium hover:underline">
                      View all
                    </button>
                  )}
                </div>
                {isResolvedLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : resolvedAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No alerts have been resolved yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {resolvedAlerts.slice(0, 3).map((alert) => {
                      const duration = alertDuration(alert);
                      return (
                        <button
                          key={alert.id}
                          onClick={() => {
                            setTab('resolved');
                            setSelectedId(alert.id);
                          }}
                          className="w-full flex items-center gap-3 py-3 text-left hover:bg-secondary/40 rounded-lg px-2 -mx-2 transition-colors"
                        >
                          <Avatar profile={alert.profile} live={false} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{alert.profile?.display_name ?? 'Unknown user'}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {alert.trigger_reason === 'manual' ? 'Pressed SOS' : 'Auto-escalated'}
                              {alert.resolution_notes ? ` · ${alert.resolution_notes}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">{alert.resolved_at ? formatAgo(alert.resolved_at, now) : ''}</p>
                            {duration !== null && <p className="text-xs font-medium text-foreground">{formatDuration(duration)}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
              <div
                className={`shrink-0 rounded-2xl p-5 border-2 space-y-3 ${isLive ? 'bg-destructive/10 border-destructive' : 'bg-card border-border shadow-elevation-2'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      {isLive && <Siren className="w-5 h-5 text-destructive animate-pulse" />}
                      {selected.profile?.display_name ?? 'Unknown user'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selected.trigger_reason === 'manual' ? 'Pressed SOS' : 'Auto-escalated from Warning Mode'} · {formatDateTime(selected.created_at)}
                    </p>
                  </div>
                  {isLive && isResolving(selected.id) && (
                    <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-sm font-semibold">
                      Resolving… (Undo in the toast)
                    </span>
                  )}
                  {isLive && !isResolving(selected.id) && (
                    <button
                      onClick={() => setResolving(selected)}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-smooth"
                    >
                      Resolve
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {selected.profile?.phone && (
                    <a href={`tel:${selected.profile.phone}`} className="flex items-center gap-1.5 text-primary font-medium hover:underline">
                      <Phone className="w-4 h-4" /> {selected.profile.phone}
                    </a>
                  )}
                  {selected.profile?.city && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-4 h-4" /> Lives in {selected.profile.city}, Bulacan
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" /> {selected.recipient_count} trusted contact{selected.recipient_count === 1 ? '' : 's'} alerted
                  </span>
                  {selected.trip && (
                    <Link href={`${basePath}/trips`} className="flex items-center gap-1.5 text-primary hover:underline">
                      <Plane className="w-4 h-4" /> {selected.trip.origin} → {selected.trip.destination}
                    </Link>
                  )}
                </div>
                {current && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {isLive ? 'Current' : 'Last known'}: {current.latitude.toFixed(6)}, {current.longitude.toFixed(6)}
                    {isLive && lastUpdate ? ` · ${isStale ? 'signal lost, last seen' : 'updated'} ${formatAgo(lastUpdate, now)}` : ''}
                    {' · '}
                    <a
                      href={`https://www.google.com/maps?q=${current.latitude},${current.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-sans"
                    >
                      Open in Google Maps
                    </a>
                  </p>
                )}
                {!isLive && (
                  <p className="text-sm text-foreground">
                    {selected.resolved_at && `Resolved ${formatDateTime(selected.resolved_at)}`}
                    {alertDuration(selected) !== null && ` · active for ${formatDuration(alertDuration(selected)!)}`}
                    {selected.resolution_notes && <span className="block text-muted-foreground mt-1">Notes: {selected.resolution_notes}</span>}
                  </p>
                )}
              </div>

              <div className="relative bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden h-[480px] lg:h-auto lg:flex-1 lg:min-h-[18rem]">
                {!mapboxToken ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Map unavailable: VITE_MAPBOX_TOKEN is not set</div>
                ) : !current ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No GPS location received for this alert yet</div>
                ) : (
                  <>
                    {renderMap(mapRef, false)}
                    <button
                      onClick={() => setFollow((value) => !value)}
                      className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-elevation-2 border transition-colors ${
                        follow ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'
                      }`}
                    >
                      <Crosshair className="w-4 h-4" /> {follow ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={() => setExpanded(true)}
                      title="Open the full-screen response view"
                      className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-elevation-2 hover:shadow-elevation-3 transition-smooth"
                    >
                      <Maximize2 className="w-4 h-4" /> Expand
                    </button>
                    <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg bg-card/90 border border-border px-3 py-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-destructive border-2 border-white" /> {isLive ? 'Live' : 'Last known'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border-2 border-destructive bg-background" /> SOS pressed
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-1 rounded bg-red-500/75" /> Path
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen response view */}
      {expanded && selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`SOS response: ${selected.profile?.display_name ?? 'traveler'}`}
          data-sos-fullscreen
          className="fixed inset-0 z-50 flex bg-background animate-in fade-in duration-200"
        >
          <div className="relative flex-1 min-w-0">
            {mapboxToken && current ? (
              renderMap(bigMapRef, true)
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                {mapboxToken ? 'No GPS location received for this alert yet' : 'Map unavailable: VITE_MAPBOX_TOKEN is not set'}
              </div>
            )}

            {/* Status bar */}
            <div className="absolute left-4 right-20 top-4 flex flex-wrap items-center gap-3 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-2.5 shadow-elevation-2">
                <Avatar profile={selected.profile} live={isLive} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{selected.profile?.display_name ?? 'Unknown user'}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {selected.trigger_reason === 'manual' ? 'Pressed SOS' : 'Auto-escalated from Warning Mode'} · {formatAgo(selected.created_at, now)}
                  </p>
                </div>
              </div>
              <span className={`pointer-events-auto inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold shadow-elevation-2 ${statusTone}`}>
                {isLive && !isStale && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                {isStale && <WifiOff className="w-3.5 h-3.5" />}
                {statusLabel}
                {isLive && lastUpdate ? ` · ${formatAgo(lastUpdate, now)}` : ''}
              </span>
            </div>

            {/* Map controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur shadow-elevation-2 divide-y divide-border">
                <button className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-secondary" onClick={() => bigMapRef.current?.zoomIn()} title="Zoom in">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-secondary" onClick={() => bigMapRef.current?.zoomOut()} title="Zoom out">
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur shadow-elevation-2 divide-y divide-border">
                <button
                  className={`flex h-9 w-9 items-center justify-center hover:bg-secondary ${follow ? 'bg-primary/15 text-primary' : 'text-foreground'}`}
                  onClick={() => setFollow((value) => !value)}
                  title={follow ? 'Following the traveler (click to stop)' : 'Follow the traveler'}
                >
                  <Crosshair className="w-4 h-4" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-secondary" onClick={() => fitPath(bigMapRef.current)} title="Show the whole path">
                  <Route className="w-4 h-4" />
                </button>
                <button
                  className={`flex h-9 w-9 items-center justify-center hover:bg-secondary ${satellite ? 'bg-primary/15 text-primary' : 'text-foreground'}`}
                  onClick={() => setSatellite((on) => !on)}
                  title={satellite ? 'Back to the street map' : 'Satellite view'}
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg bg-card/90 backdrop-blur border border-border px-3 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-destructive border-2 border-white" /> {isLive ? 'Live' : 'Last known'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-destructive bg-background" /> SOS pressed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-1 rounded bg-red-500/75" /> Path
              </span>
            </div>
          </div>

          {/* Side panel */}
          <aside className="flex w-[22rem] shrink-0 flex-col border-l border-border bg-card max-md:hidden">
            <div className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${isLive ? 'border-destructive/40 bg-destructive/10' : 'border-border'}`}>
              <div className="min-w-0">
                <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${isLive ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Siren className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse' : ''}`} /> {isLive ? 'Active SOS' : 'Resolved SOS'}
                </p>
                <h2 className="truncate text-base font-bold text-foreground">{selected.profile?.display_name ?? 'Unknown user'}</h2>
                <p className="text-xs text-muted-foreground">Started {formatDateTime(selected.created_at)}</p>
              </div>
              <button
                onClick={() => setExpanded(false)}
                title="Close (Esc)"
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-5">
              {/* Primary actions */}
              <div className="grid grid-cols-2 gap-2">
                {selected.profile?.phone ? (
                  <a
                    href={`tel:${selected.profile.phone}`}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-destructive px-3 py-3 text-sm font-bold text-destructive-foreground shadow-elevation-1 hover:opacity-90"
                  >
                    <Phone className="w-4 h-4" /> Call {selected.profile.phone}
                  </a>
                ) : (
                  <p className="col-span-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-center text-xs text-muted-foreground">No phone number on file</p>
                )}
                <SosAction icon={PhoneCall} label="Call 911" href="tel:911" />
                <SosAction
                  icon={ExternalLink}
                  label="Google Maps"
                  href={current ? `https://www.google.com/maps?q=${current.latitude},${current.longitude}` : undefined}
                />
                <SosAction icon={Copy} label="Copy coordinates" onClick={current ? () => void copyCoordinates() : undefined} />
                <SosAction icon={Route} label="Show whole path" onClick={() => fitPath(bigMapRef.current)} />
                {isLive &&
                  (isResolving(selected.id) ? (
                    <span className="col-span-2 flex items-center justify-center rounded-xl bg-amber-500/15 px-3 py-2.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Resolving… (Undo in the toast)
                    </span>
                  ) : (
                    <button
                      onClick={() => setResolving(selected)}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-xl border-2 border-green-600 px-3 py-2.5 text-sm font-bold text-green-700 hover:bg-green-500/10 dark:text-green-400"
                    >
                      <ShieldCheck className="w-4 h-4" /> They&apos;re safe: resolve
                    </button>
                  ))}
              </div>

              {/* Location */}
              <div className="rounded-xl border border-border bg-secondary/40 p-3 text-sm space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{isLive ? 'Current location' : 'Last known location'}</p>
                {current ? (
                  <p className="font-mono text-xs text-foreground">
                    {current.latitude.toFixed(6)}, {current.longitude.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No GPS yet</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {trail.length} point{trail.length === 1 ? '' : 's'} on the path since SOS
                  {livePosition?.accuracyM != null ? ` · ±${Math.round(livePosition.accuracyM)} m` : ''}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 shrink-0" /> {selected.recipient_count} trusted contact{selected.recipient_count === 1 ? '' : 's'} alerted
                </p>
                {selected.profile?.city && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" /> Lives in {selected.profile.city}, Bulacan
                  </p>
                )}
                {selected.trip && (
                  <Link href={`${basePath}/trips`} className="flex items-center gap-2 text-primary hover:underline">
                    <Plane className="w-4 h-4 shrink-0" /> {selected.trip.origin} → {selected.trip.destination}
                  </Link>
                )}
                {!isLive && selected.resolution_notes && (
                  <p className="rounded-lg bg-secondary/60 px-3 py-2 text-xs text-foreground">Notes: {selected.resolution_notes}</p>
                )}
              </div>

              {/* Response checklist */}
              {isLive && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Response checklist</p>
                    <span className="text-[11px] text-muted-foreground">
                      {checklist.length}/{RESPONSE_STEPS.length}
                    </span>
                  </div>
                  <ol className="space-y-1.5">
                    {RESPONSE_STEPS.map((step, index) => {
                      const done = checklist.includes(index);
                      return (
                        <li key={step.title}>
                          <button
                            type="button"
                            onClick={() => toggleStep(index)}
                            className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                              done ? 'border-green-500/40 bg-green-500/5' : 'border-border hover:bg-secondary/50'
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                done ? 'bg-green-600 text-white' : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                            </span>
                            <span className="min-w-0">
                              <span className={`block text-xs font-semibold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{step.title}</span>
                              {!done && <span className="block text-[11px] text-muted-foreground">{step.body}</span>}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* Other active alerts */}
              {activeAlerts.filter((alert) => alert.id !== selected.id).length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-destructive">Other active alerts</p>
                  <div className="space-y-1.5">
                    {activeAlerts
                      .filter((alert) => alert.id !== selected.id)
                      .map((alert) => (
                        <button
                          key={alert.id}
                          onClick={() => {
                            setTab('active');
                            setSelectedId(alert.id);
                            setFollow(true);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg border border-destructive/30 p-2 text-left hover:bg-destructive/5"
                        >
                          <Avatar profile={alert.profile} live />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{alert.profile?.display_name ?? 'Unknown user'}</p>
                            <p className="text-xs text-muted-foreground">{formatAgo(alert.created_at, now)}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border px-5 py-2.5 text-[11px] text-muted-foreground">
              Press <kbd className="rounded border border-border bg-secondary px-1 font-mono">Esc</kbd> to go back
            </div>
          </aside>
        </div>
      )}

      <ResolveSosDialog
        alert={resolving ? { id: resolving.id, created_at: resolving.created_at, name: resolving.profile?.display_name ?? null } : null}
        onClose={() => setResolving(null)}
      />
    </div>
  );
}

function SosAction({ icon: Icon, label, onClick, href }: { icon: typeof Phone; label: string; onClick?: () => void; href?: string }) {
  const className =
    'flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs font-semibold text-foreground transition-smooth hover:border-primary/50 hover:bg-primary/5';
  if (href) {
    const external = href.startsWith('http');
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={className}>
        <Icon className="w-4 h-4 text-primary" /> {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className={`${className} disabled:opacity-40 disabled:cursor-not-allowed`}>
      <Icon className="w-4 h-4 text-primary" /> {label}
    </button>
  );
}
