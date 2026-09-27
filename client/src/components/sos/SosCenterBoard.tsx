import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, Source, type MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { Crosshair, MapPin, Phone, Plane, ShieldCheck, Siren, Users, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useLocation, useSearch } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import { getSosTrail, listSosAlerts, resolveSosAlert, type SosAlertDetail, type TrailPoint } from '@/lib/sos';
import { useActiveSosAlerts, useLivePositions } from '@/hooks/useSosRealtime';

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

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function SosCenterBoard() {
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

  const [resolving, setResolving] = useState<SosAlertDetail | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (requestedAlertId) {
      setSelectedId(requestedAlertId);
      setTab('active');
    }
  }, [requestedAlertId]);

  useEffect(() => {
    if (tab !== 'resolved') return;
    setIsResolvedLoading(true);
    listSosAlerts('resolved').then(({ data, error }) => {
      if (error) toast.error('Failed to load resolved alerts');
      setResolvedAlerts(data);
      setIsResolvedLoading(false);
    });
  }, [tab]);

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
    if (!follow || !current || !mapRef.current) return;
    mapRef.current.easeTo({ center: [current.longitude, current.latitude], duration: 800 });
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

  async function handleResolve() {
    if (!resolving) return;
    setIsResolving(true);
    const { error } = await resolveSosAlert(resolving.id, resolutionNotes);
    setIsResolving(false);
    if (error) {
      toast.error('Failed to resolve SOS alert');
      return;
    }
    toast.success('SOS alert marked resolved');
    setResolving(null);
    setResolutionNotes('');
  }

  const lastUpdate = livePosition?.updatedAt ?? null;
  const isStale = isLive && (!lastUpdate || now - new Date(lastUpdate).getTime() > STALE_AFTER_MS);

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Siren className="w-8 h-8 text-destructive" /> SOS Center
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Live GPS of travelers who pressed SOS. Positions update every few seconds until the alert ends.</p>
        </div>
        <div className="flex rounded-lg border border-border bg-card p-1">
          {(['active', 'resolved'] as const).map((value) => (
            <button
              key={value}
              onClick={() => {
                setTab(value);
                setSelectedId(null);
              }}
              className={`px-4 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
                tab === value ? (value === 'active' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground') : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {value}
              {value === 'active' && activeAlerts.length > 0 ? ` (${activeAlerts.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
            {(tab === 'active' ? isActiveLoading : isResolvedLoading) ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
            ) : list.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-green-500" />
                <p className="text-sm text-muted-foreground">{tab === 'active' ? 'No active SOS alerts' : 'No resolved alerts yet'}</p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
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
                          {alert.resolution_notes ? ` · ${alert.resolution_notes}` : ''}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-card rounded-2xl p-12 shadow-elevation-2 border border-border flex items-center justify-center h-full min-h-[300px]">
              <p className="text-muted-foreground">Select an alert to see the traveler&apos;s location</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`rounded-2xl p-5 border-2 space-y-3 ${isLive ? 'bg-destructive/10 border-destructive' : 'bg-card border-border shadow-elevation-2'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      {isLive && <Siren className="w-5 h-5 text-destructive animate-pulse" />}
                      {selected.profile?.display_name ?? 'Unknown user'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selected.trigger_reason === 'manual' ? 'Pressed SOS' : 'Auto-escalated from Warning Mode'} · {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  {isLive && (
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
                {!isLive && selected.resolution_notes && <p className="text-sm text-foreground">Resolution: {selected.resolution_notes}</p>}
              </div>

              <div className="relative bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden h-[480px]">
                {!mapboxToken ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Map unavailable: VITE_MAPBOX_TOKEN is not set</div>
                ) : !current ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No GPS location received for this alert yet</div>
                ) : (
                  <>
                    <Map
                      key={selected.id}
                      ref={mapRef}
                      initialViewState={{ longitude: current.longitude, latitude: current.latitude, zoom: 16 }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle={mapStyle}
                      mapboxAccessToken={mapboxToken}
                      attributionControl={false}
                      onDragStart={() => setFollow(false)}
                    >
                      {trailGeoJson.geometry.coordinates.length > 1 && (
                        <Source id="sos-trail" type="geojson" data={trailGeoJson}>
                          <Layer id="sos-trail-line" type="line" paint={{ 'line-color': '#ef4444', 'line-width': 4, 'line-opacity': 0.75 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
                        </Source>
                      )}

                      {origin && (
                        <Marker longitude={origin.longitude} latitude={origin.latitude} anchor="center">
                          <div title="Where SOS was pressed" className="w-4 h-4 rounded-full border-[3px] border-destructive bg-background" />
                        </Marker>
                      )}

                      <Marker longitude={current.longitude} latitude={current.latitude} anchor="center">
                        <div title={isLive ? 'Live position' : 'Last known position'} className="relative flex items-center justify-center">
                          {isLive && !isStale && <span className="absolute w-10 h-10 rounded-full bg-destructive/40 animate-ping" />}
                          <span className={`relative w-5 h-5 rounded-full border-2 border-white shadow-lg ${isStale || !isLive ? 'bg-amber-500' : 'bg-destructive'}`} />
                        </div>
                      </Marker>
                    </Map>
                    <button
                      onClick={() => setFollow((value) => !value)}
                      className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-elevation-2 border transition-colors ${
                        follow ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'
                      }`}
                    >
                      <Crosshair className="w-4 h-4" /> {follow ? 'Following' : 'Follow'}
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

      {resolving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Resolve SOS from {resolving.profile?.display_name ?? 'this traveler'}</h3>
              <p className="text-sm text-muted-foreground mt-1">This stops live location sharing on their phone.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Resolution notes (optional)</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  placeholder="What happened / how this was handled..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setResolving(null);
                    setResolutionNotes('');
                  }}
                  className="flex-1 border border-border text-foreground py-2.5 rounded-lg hover:bg-secondary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold transition-colors"
                >
                  {isResolving ? 'Resolving...' : 'Mark Resolved'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
