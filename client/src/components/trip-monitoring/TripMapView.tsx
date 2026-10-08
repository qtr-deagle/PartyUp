import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, useMap, type MapRef } from 'react-map-gl';
import {
  Copy,
  Crosshair,
  Flag,
  Route,
  ZoomIn,
  ExternalLink,
  Layers,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  Scan,
  ShieldAlert,
  Siren,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TripMonitoringDetail, TripMonitoringRow } from '@/lib/tripMonitoring';
import type { LivePosition } from '@/hooks/useTripMonitoringRealtime';
import { formatDateTime } from '@/lib/datetime';

// The trip map, used twice: inline in the Trip Monitoring detail panel, and
// in the full-screen monitor (TripMapFullscreen) with labels, map controls
// and a side panel of members and quick actions.

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

// A member's phone counts as "live" if it reported a position this recently.
export const LIVE_WITHIN_MS = 5 * 60_000;

type Point = { latitude: number; longitude: number };

export type TripMapData = {
  trip: TripMonitoringRow;
  detail: TripMonitoringDetail;
  livePositions: Record<string, LivePosition>;
  /** Where the active SOS member is, if there is one. */
  sosFocus: Point | null;
};

/** Live stream first, then the last stored location the member shares. */
export function memberPosition({ detail, livePositions }: Pick<TripMapData, 'detail' | 'livePositions'>, userId: string): Point | null {
  const live = livePositions[userId];
  if (live) return { latitude: live.latitude, longitude: live.longitude };
  const row = detail.locations.find((loc) => loc.user_id === userId && loc.is_visible);
  return row ? { latitude: Number(row.latitude), longitude: Number(row.longitude) } : null;
}

function activeSosUserIds(detail: TripMonitoringDetail) {
  return new Set(detail.sosAlerts.filter((alert) => alert.status === 'active').map((alert) => alert.user_id));
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

/** Every point worth showing: members, the SOS spot and the destination. */
function allPoints(data: TripMapData): Point[] {
  const points: Point[] = [];
  for (const member of data.detail.members) {
    if (member.status !== 'accepted') continue;
    const position = memberPosition(data, member.user_id);
    if (position) points.push(position);
  }
  if (data.sosFocus) points.push(data.sosFocus);
  if (data.trip.destination_lat !== null && data.trip.destination_lng !== null) {
    points.push({ latitude: data.trip.destination_lat, longitude: data.trip.destination_lng });
  }
  return points;
}

export function fitToPoints(map: MapRef | null, points: Point[], padding = 80) {
  if (!map || points.length === 0) return;
  if (points.length === 1) {
    map.flyTo({ center: [points[0].longitude, points[0].latitude], zoom: 15, duration: 800 });
    return;
  }
  const lngs = points.map((p) => p.longitude);
  const lats = points.map((p) => p.latitude);
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding, maxZoom: 15, duration: 800 }
  );
}

export function TripMap({
  data,
  mapStyle,
  mapRef,
  labels = false,
  highlightUserId = null,
  focus = null,
  onMemberClick,
}: {
  data: TripMapData;
  mapStyle: string;
  mapRef?: React.Ref<MapRef>;
  /** Show names next to the pins (full-screen view). */
  labels?: boolean;
  highlightUserId?: string | null;
  /** Opens a member's info card (target = user id) or the destination's (target = 'destination'); `n` changes on every request so a repeat click reopens it. */
  focus?: { target: string; n: number } | null;
  onMemberClick?: (userId: string) => void;
}) {
  const { trip, detail, sosFocus } = data;
  const [selection, setSelection] = useState<Selection>(null);
  const sosUsers = activeSosUserIds(detail);

  useEffect(() => {
    if (focus) setSelection(focus.target === 'destination' ? { kind: 'destination' } : { kind: 'member', userId: focus.target });
  }, [focus?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mapboxToken) {
    return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Map unavailable: VITE_MAPBOX_TOKEN is not set</div>;
  }

  const selectedMember = selection?.kind === 'member' ? detail.members.find((m) => m.user_id === selection.userId) ?? null : null;
  const selectedPosition = selectedMember ? memberPosition(data, selectedMember.user_id) : null;
  const hasDestination = trip.destination_lat !== null && trip.destination_lng !== null;

  return (
    <Map
      key={`${trip.id}:${sosFocus ? 'sos' : 'trip'}`}
      ref={mapRef}
      initialViewState={
        sosFocus
          ? { longitude: sosFocus.longitude, latitude: sosFocus.latitude, zoom: 15 }
          : { longitude: trip.destination_lng ?? 121.0244, latitude: trip.destination_lat ?? 14.5547, zoom: 11 }
      }
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      mapboxAccessToken={mapboxToken}
      attributionControl={false}
      onClick={(event) => {
        // Clicks on a pin or the card itself bubble up here too; only empty map closes the card.
        const target = event.originalEvent.target as HTMLElement | null;
        if (target?.closest('[data-map-card], .mapboxgl-marker')) return;
        setSelection(null);
      }}
    >
      {trip.destination_lat !== null && trip.destination_lng !== null && (
        <Marker
          longitude={trip.destination_lng}
          latitude={trip.destination_lat}
          anchor="bottom"
          onClick={(event) => {
            event.originalEvent.stopPropagation();
            setSelection({ kind: 'destination' });
          }}
        >
          <div
            title={`Destination: ${trip.destination}`}
            className={`flex cursor-pointer flex-col items-center transition-transform hover:scale-110 ${selection?.kind === 'destination' ? 'scale-110' : ''}`}
          >
            {labels && (
              <span className="mb-0.5 max-w-[10rem] truncate rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow">
                {trip.destination}
              </span>
            )}
            <MapPin className="w-7 h-7 text-primary drop-shadow" fill="currentColor" />
          </div>
        </Marker>
      )}

      {sosFocus && (
        <Marker longitude={sosFocus.longitude} latitude={sosFocus.latitude} anchor="center">
          <div title="SOS — live position" className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 rounded-full bg-destructive/40 animate-ping" />
            <span className="relative flex w-7 h-7 items-center justify-center rounded-full border-2 border-white bg-destructive text-white shadow-lg">
              <Siren className="w-3.5 h-3.5" />
            </span>
          </div>
        </Marker>
      )}

      {detail.members
        .filter((m) => m.status === 'accepted')
        .filter((m) => !(sosFocus && sosUsers.has(m.user_id)))
        .map((member) => {
          const position = memberPosition(data, member.user_id);
          if (!position) return null;
          const name = member.profiles?.display_name ?? 'Unknown user';
          const isSos = sosUsers.has(member.user_id);
          const isDriver = member.member_role === 'driver';
          const highlighted = highlightUserId === member.user_id;
          return (
            <Marker
              key={member.user_id}
              longitude={position.longitude}
              latitude={position.latitude}
              anchor="center"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                setSelection({ kind: 'member', userId: member.user_id });
                onMemberClick?.(member.user_id);
              }}
            >
              <button className="group relative flex items-center focus:outline-none">
                {(highlighted || (selection?.kind === 'member' && selection.userId === member.user_id)) && <span className="absolute left-0 w-8 h-8 -ml-1 rounded-full bg-primary/30 animate-ping" />}
                <span
                  className={`relative flex items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white shadow-lg ${
                    labels ? 'w-6 h-6' : 'w-4 h-4'
                  } ${isSos ? 'bg-destructive animate-pulse' : isDriver ? 'bg-blue-600' : 'bg-primary'} ${highlighted ? 'ring-2 ring-primary' : ''}`}
                >
                  {labels ? initials(name) : null}
                </span>
                {labels && (
                  <span className="ml-1 max-w-[8rem] truncate rounded-md bg-card/95 px-1.5 py-0.5 text-[11px] font-medium text-foreground shadow border border-border">
                    {name.split(' ')[0]}
                  </span>
                )}
              </button>
            </Marker>
          );
        })}

      {selectedMember && selectedPosition && (
        <Marker longitude={selectedPosition.longitude} latitude={selectedPosition.latitude} anchor="bottom" offset={[0, labels ? -18 : -14]} style={{ zIndex: 10 }}>
          <MemberCard data={data} member={selectedMember} position={selectedPosition} isSos={sosUsers.has(selectedMember.user_id)} onClose={() => setSelection(null)} />
        </Marker>
      )}

      {selection?.kind === 'destination' && hasDestination && (
        <Marker longitude={trip.destination_lng!} latitude={trip.destination_lat!} anchor="bottom" offset={[0, labels ? -52 : -32]} style={{ zIndex: 10 }}>
          <DestinationCard data={data} onClose={() => setSelection(null)} />
        </Marker>
      )}
    </Map>
  );
}

type Selection = { kind: 'member'; userId: string } | { kind: 'destination' } | null;

/** Straight-line distance in km. */
function distanceKm(a: Point, b: Point) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function formatKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

function lastSeenOf({ detail, livePositions }: TripMapData, userId: string) {
  return livePositions[userId]?.updatedAt ?? detail.locations.find((loc) => loc.user_id === userId && loc.is_visible)?.updated_at ?? null;
}

const ROLE_STYLE: Record<string, { dot: string; band: string }> = {
  driver: { dot: 'bg-blue-600', band: 'from-blue-600/25' },
  coordinator: { dot: 'bg-violet-600', band: 'from-violet-600/25' },
  member: { dot: 'bg-primary', band: 'from-primary/25' },
};

/** Shell for the map info cards: a card with a pointer arrow under it. */
function MapCard({ band, onClose, children }: { band: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div data-map-card className="relative w-72 cursor-default animate-in fade-in slide-in-from-bottom-1 duration-150" onClick={(event) => event.stopPropagation()}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-card text-left shadow-elevation-3">
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${band} to-transparent`} />
        <button
          onClick={onClose}
          title="Close"
          className="absolute right-2 top-2 z-10 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="relative">{children}</div>
      </div>
      <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-border bg-card" />
    </div>
  );
}

function CardAction({ icon: Icon, label, onClick, href }: { icon: typeof Phone; label: string; onClick?: () => void; href?: string }) {
  const className = 'flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary transition-colors';
  return href ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={className}>
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </button>
  );
}

function MemberCard({
  data,
  member,
  position,
  isSos,
  onClose,
}: {
  data: TripMapData;
  member: TripMonitoringDetail['members'][number];
  position: Point;
  isSos: boolean;
  onClose: () => void;
}) {
  const { current: map } = useMap();
  const { trip } = data;
  const name = member.profiles?.display_name ?? 'Unknown user';
  const role = ROLE_STYLE[member.member_role] ?? ROLE_STYLE.member;
  const seen = lastSeenOf(data, member.user_id);
  const now = Date.now();
  const live = seen !== null && now - new Date(seen).getTime() < LIVE_WITHIN_MS;
  const toDestination =
    trip.destination_lat !== null && trip.destination_lng !== null
      ? distanceKm(position, { latitude: trip.destination_lat, longitude: trip.destination_lng })
      : null;

  return (
    <MapCard band={isSos ? 'from-destructive/30' : role.band} onClose={onClose}>
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="relative shrink-0">
          {member.profiles?.avatar_url ? (
            <img src={member.profiles.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-card" />
          ) : (
            <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-card ${isSos ? 'bg-destructive' : role.dot}`}>
              {initials(name)}
            </span>
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${
              isSos ? 'bg-destructive animate-pulse' : live ? 'bg-green-500' : 'bg-muted-foreground'
            }`}
          />
        </div>
        <div className="min-w-0 pr-5">
          <p className="truncate text-sm font-bold text-foreground">{name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-secondary px-2 py-px text-[10px] font-semibold capitalize text-foreground">{member.member_role}</span>
            {isSos && <span className="rounded-full bg-destructive px-2 py-px text-[10px] font-bold text-destructive-foreground">SOS</span>}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-secondary/60 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
          <p className={`text-xs font-semibold ${live ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
            {seen ? `${live ? 'Live' : 'Seen'} ${formatAgo(seen, now)}` : 'Not sharing'}
          </p>
        </div>
        <div className="rounded-lg bg-secondary/60 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">To destination</p>
          <p className="text-xs font-semibold text-foreground">{toDestination === null ? '—' : formatKm(toDestination)}</p>
        </div>
      </div>
      <p className="mx-4 mt-2 font-mono text-[10px] text-muted-foreground">
        {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
      </p>

      <div className="mt-2 flex border-t border-border p-1.5">
        <CardAction icon={ZoomIn} label="Zoom" onClick={() => map?.flyTo({ center: [position.longitude, position.latitude], zoom: 17, duration: 800 })} />
        {member.profiles?.phone && <CardAction icon={Phone} label="Call" href={`tel:${member.profiles.phone}`} />}
        <CardAction icon={ExternalLink} label="Maps" href={`https://www.google.com/maps?q=${position.latitude},${position.longitude}`} />
      </div>
    </MapCard>
  );
}

function DestinationCard({ data, onClose }: { data: TripMapData; onClose: () => void }) {
  const { current: map } = useMap();
  const { trip, detail } = data;
  const destination = { latitude: trip.destination_lat as number, longitude: trip.destination_lng as number };
  const distances = detail.members
    .filter((member) => member.status === 'accepted')
    .map((member) => {
      const position = memberPosition(data, member.user_id);
      return position ? { id: member.user_id, name: member.profiles?.display_name ?? 'Unknown', km: distanceKm(position, destination) } : null;
    })
    .filter((row): row is { id: string; name: string; km: number } => row !== null)
    .sort((a, b) => a.km - b.km);
  const arrived = distances.filter((row) => row.km <= 0.3).length;
  const nearest = distances[0];
  const farthest = Math.max(0.001, ...distances.map((row) => row.km));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${trip.destination}: ${destination.latitude.toFixed(6)}, ${destination.longitude.toFixed(6)}`);
      toast.success('Destination copied');
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  return (
    <MapCard band="from-primary/30" onClose={onClose}>
      <div className="flex items-center gap-3 px-4 pt-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevation-1">
          <Flag className="w-5 h-5" />
        </span>
        <div className="min-w-0 pr-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Destination</p>
          <p className="truncate text-sm font-bold text-foreground">{trip.destination}</p>
          <p className="truncate text-[11px] text-muted-foreground">from {trip.origin}</p>
        </div>
      </div>

      <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-secondary/60 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Arrived</p>
          <p className="text-xs font-semibold text-foreground">
            {arrived} of {distances.length} on map
          </p>
        </div>
        <div className="rounded-lg bg-secondary/60 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Nearest</p>
          <p className="truncate text-xs font-semibold text-foreground">{nearest ? `${nearest.name.split(' ')[0]} · ${formatKm(nearest.km)}` : '—'}</p>
        </div>
      </div>
      {distances.length > 1 && (
        <ul className="mx-4 mt-2 space-y-1">
          {distances.slice(0, 4).map((row) => (
            <li key={row.id} className="flex items-center gap-2 text-[11px]">
              <span className="w-16 truncate text-muted-foreground">{row.name.split(' ')[0]}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                {/* Fuller bar = closer to the destination. */}
                <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(6, 100 - (row.km / farthest) * 94)}%` }} />
              </span>
              <span className="w-12 text-right tabular-nums text-foreground">{formatKm(row.km)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex border-t border-border p-1.5">
        <CardAction icon={ZoomIn} label="Zoom" onClick={() => map?.flyTo({ center: [destination.longitude, destination.latitude], zoom: 16, duration: 800 })} />
        <CardAction icon={Route} label="Directions" href={`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`} />
        <CardAction icon={Copy} label="Copy" onClick={() => void copy()} />
      </div>
    </MapCard>
  );
}

export function MapLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-lg bg-card/90 backdrop-blur border border-border px-3 py-2 text-xs text-muted-foreground ${className}`}>
      <span className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-primary" fill="currentColor" /> Destination
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-primary border-2 border-white" /> Member
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white" /> Driver
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-destructive border-2 border-white" /> SOS
      </span>
    </div>
  );
}

function formatAgo(iso: string, now: number) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const satelliteStyle = 'mapbox://styles/mapbox/satellite-streets-v12';

/**
 * Full-screen trip monitor: the map fills the screen, with zoom / fit /
 * satellite controls on it and a side panel of quick actions and members
 * (locate on map, call, open in Google Maps). Esc closes it.
 */
export function TripMapFullscreen({
  data,
  mapStyle,
  now,
  lastSeenAt,
  warningUserIds,
  isResolving,
  onResolveSos,
  onOpenSosCenter,
  onClose,
}: {
  data: TripMapData;
  mapStyle: string;
  now: number;
  lastSeenAt: (userId: string) => string | null;
  warningUserIds: Set<string>;
  isResolving: (alertId: string) => boolean;
  onResolveSos: (alertId: string) => void;
  onOpenSosCenter: () => void;
  onClose: () => void;
}) {
  const { trip, detail, sosFocus } = data;
  const mapRef = useRef<MapRef>(null);
  const [satellite, setSatellite] = useState(false);
  const [highlightUserId, setHighlightUserId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ target: string; n: number } | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Let an open dialog (e.g. Resolve SOS) handle Esc first.
      if (document.querySelector('[role="dialog"]:not([data-trip-fullscreen]), [role="alertdialog"]')) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const accepted = detail.members.filter((member) => member.status === 'accepted');
  const others = detail.members.filter((member) => member.status !== 'accepted');
  const activeSos = detail.sosAlerts.filter((alert) => alert.status === 'active');
  const sosUsers = activeSosUserIds(detail);
  const organizer = detail.members.find((member) => member.user_id === trip.organizer_id);
  const liveCount = accepted.filter((member) => {
    const seen = lastSeenAt(member.user_id);
    return seen !== null && now - new Date(seen).getTime() < LIVE_WITHIN_MS;
  }).length;
  const points = useMemo(() => allPoints(data), [data]);

  const fitAll = () => fitToPoints(mapRef.current, points, 100);
  const locate = (userId: string) => {
    const position = memberPosition(data, userId);
    if (!position) return;
    setHighlightUserId(userId);
    setFocus((prev) => ({ target: userId, n: (prev?.n ?? 0) + 1 }));
    mapRef.current?.flyTo({ center: [position.longitude, position.latitude], zoom: 16, duration: 900 });
  };

  const copyLocations = async () => {
    const lines = [
      `${trip.origin} → ${trip.destination} (${trip.title})`,
      ...accepted.map((member) => {
        const position = memberPosition(data, member.user_id);
        const seen = lastSeenAt(member.user_id);
        return `${member.profiles?.display_name ?? 'Unknown'} (${member.member_role}): ${
          position ? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}` : 'no location'
        }${seen ? `, ${formatAgo(seen, now)}` : ''}`;
      }),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      toast.success('Member locations copied');
    } catch {
      toast.error("Couldn't copy to the clipboard");
    }
  };

  const hasDestination = trip.destination_lat !== null && trip.destination_lng !== null;
  const directionsUrl = hasDestination
    ? `https://www.google.com/maps/dir/?api=1&destination=${trip.destination_lat},${trip.destination_lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(trip.destination)}`;
  const destinationDistances = hasDestination
    ? accepted
        .map((member) => {
          const position = memberPosition(data, member.user_id);
          return position
            ? { name: member.profiles?.display_name ?? 'Unknown', km: distanceKm(position, { latitude: trip.destination_lat!, longitude: trip.destination_lng! }) }
            : null;
        })
        .filter((row): row is { name: string; km: number } => row !== null)
        .sort((a, b) => a.km - b.km)
    : [];
  const arrivedCount = destinationDistances.filter((row) => row.km <= 0.3).length;
  const focusDestination = () => {
    if (!hasDestination) return;
    setHighlightUserId(null);
    mapRef.current?.flyTo({ center: [trip.destination_lng!, trip.destination_lat!], zoom: 15, duration: 900 });
    setFocus((prev) => ({ target: 'destination', n: (prev?.n ?? 0) + 1 }));
  };
  const copyDestination = async () => {
    const text = hasDestination ? `${trip.destination}: ${trip.destination_lat!.toFixed(6)}, ${trip.destination_lng!.toFixed(6)}` : trip.destination;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Destination copied');
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  const iconButton = 'flex h-9 w-9 items-center justify-center text-foreground hover:bg-secondary transition-colors';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Live map: ${trip.origin} to ${trip.destination}`}
      data-trip-fullscreen
      className="fixed inset-0 z-50 flex bg-background animate-in fade-in duration-200"
    >
      {/* Map */}
      <div className="relative flex-1 min-w-0">
        <TripMap data={data} mapStyle={satellite ? satelliteStyle : mapStyle} mapRef={mapRef} labels highlightUserId={highlightUserId} focus={focus} onMemberClick={setHighlightUserId} />

        {/* Title bar */}
        <div className="absolute left-4 right-4 top-4 flex flex-wrap items-start gap-3 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-2.5 shadow-elevation-2">
            <Navigation className="w-4 h-4 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">
                {trip.origin} → {trip.destination}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {trip.title} · {trip.organizer_display_name}
              </p>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-border bg-card/95 backdrop-blur px-3 py-2.5 text-xs font-medium text-foreground shadow-elevation-2">
            <span className={`h-2 w-2 rounded-full ${liveCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
            {liveCount} of {accepted.length} sharing live location
          </div>
          {activeSos.length > 0 && (
            <button
              onClick={() => sosFocus && mapRef.current?.flyTo({ center: [sosFocus.longitude, sosFocus.latitude], zoom: 16, duration: 900 })}
              className="pointer-events-auto flex items-center gap-2 rounded-xl bg-destructive px-3 py-2.5 text-xs font-bold text-destructive-foreground shadow-elevation-2 animate-pulse"
            >
              <Siren className="w-4 h-4" /> Active SOS · show
            </button>
          )}
        </div>

        {/* Map controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur shadow-elevation-2 divide-y divide-border">
            <button className={iconButton} onClick={() => mapRef.current?.zoomIn()} title="Zoom in">
              <Plus className="w-4 h-4" />
            </button>
            <button className={iconButton} onClick={() => mapRef.current?.zoomOut()} title="Zoom out">
              <Minus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur shadow-elevation-2 divide-y divide-border">
            <button className={iconButton} onClick={fitAll} title="Fit everyone on the map">
              <Scan className="w-4 h-4" />
            </button>
            <button
              className={`${iconButton} ${satellite ? 'bg-primary/15 text-primary' : ''}`}
              onClick={() => setSatellite((on) => !on)}
              title={satellite ? 'Back to the street map' : 'Satellite view'}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        <MapLegend className="absolute bottom-4 left-4" />
      </div>

      {/* Side panel */}
      <aside className="flex w-[22rem] shrink-0 flex-col border-l border-border bg-card max-md:hidden">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Monitoring</p>
            <h2 className="truncate text-base font-bold text-foreground">{trip.title || `${trip.origin} → ${trip.destination}`}</h2>
            <p className="text-xs text-muted-foreground">
              Starts {formatDateTime(trip.start_at)}
              {trip.end_at ? ` · ends ${formatDateTime(trip.end_at)}` : ''}
            </p>
          </div>
          <button onClick={onClose} title="Close (Esc)" className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {/* Active SOS */}
          {activeSos.length > 0 && (
            <div className="m-4 mb-0 space-y-2 rounded-xl border-2 border-destructive bg-destructive/10 p-3">
              <p className="flex items-center gap-1.5 text-sm font-bold text-destructive">
                <Siren className="w-4 h-4" /> Active SOS
              </p>
              {activeSos.map((alert) => {
                const member = detail.members.find((m) => m.user_id === alert.user_id);
                return (
                  <div key={alert.id} className="rounded-lg bg-card p-2.5">
                    <p className="text-sm font-semibold text-foreground">{member?.profiles?.display_name ?? 'Unknown user'}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.trigger_reason === 'manual' ? 'Pressed SOS' : 'Auto-escalated'} · {formatAgo(alert.created_at, now)}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {member?.profiles?.phone && (
                        <a
                          href={`tel:${member.profiles.phone}`}
                          className="flex items-center justify-center gap-1 rounded-lg bg-destructive px-2 py-1.5 text-xs font-semibold text-destructive-foreground"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                      {isResolving(alert.id) ? (
                        <span className="flex items-center justify-center rounded-lg bg-amber-500/15 px-2 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Resolving…
                        </span>
                      ) : (
                        <button
                          onClick={() => onResolveSos(alert.id)}
                          className="rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={onOpenSosCenter}
                        className="col-span-2 flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open in SOS Center (live trail)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Destination */}
          <div className="px-4 pt-4">
            <div className="overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent shadow-elevation-1">
              <button
                type="button"
                onClick={focusDestination}
                disabled={!hasDestination}
                title={hasDestination ? 'Show the destination on the map' : 'No destination coordinates'}
                className="group flex w-full items-center gap-3 p-3.5 text-left disabled:cursor-default"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevation-2 transition-transform group-hover:scale-105">
                  <Flag className="w-5 h-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">Destination</span>
                  <span className="block truncate text-sm font-bold text-foreground">{trip.destination}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">from {trip.origin}</span>
                </span>
                {hasDestination && <Crosshair className="w-4 h-4 shrink-0 text-primary opacity-60 transition-opacity group-hover:opacity-100" />}
              </button>
              {hasDestination && (
                <div className="grid grid-cols-2 gap-2 px-3.5 pb-3">
                  <div className="rounded-lg bg-card/70 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Arrived</p>
                    <p className="text-xs font-bold text-foreground">
                      {arrivedCount} of {destinationDistances.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-card/70 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Nearest</p>
                    <p className="truncate text-xs font-bold text-foreground">
                      {destinationDistances[0] ? `${destinationDistances[0].name.split(' ')[0]} · ${formatKm(destinationDistances[0].km)}` : '—'}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex border-t border-primary/20 bg-card/40 p-1">
                <button
                  type="button"
                  onClick={focusDestination}
                  disabled={!hasDestination}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-foreground hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Crosshair className="w-3.5 h-3.5 text-primary" /> Focus
                </button>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-foreground hover:bg-primary/10"
                >
                  <Route className="w-3.5 h-3.5 text-primary" /> Directions
                </a>
                <button
                  type="button"
                  onClick={() => void copyDestination()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-foreground hover:bg-primary/10"
                >
                  <Copy className="w-3.5 h-3.5 text-primary" /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</p>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction
                icon={Phone}
                label="Call organizer"
                href={organizer?.profiles?.phone ? `tel:${organizer.profiles.phone}` : undefined}
                disabledHint="No phone number on file"
              />
              <QuickAction icon={Scan} label="Fit everyone" onClick={fitAll} />
              <QuickAction icon={Copy} label="Copy locations" onClick={() => void copyLocations()} />
              <QuickAction icon={ShieldAlert} label="SOS Center" onClick={onOpenSosCenter} />
            </div>
          </div>

          {/* Members */}
          <div className="px-4 pb-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="w-3.5 h-3.5" /> Members ({accepted.length})
            </p>
            <ul className="space-y-1.5">
              {accepted.map((member) => {
                const name = member.profiles?.display_name ?? 'Unknown user';
                const position = memberPosition(data, member.user_id);
                const seen = lastSeenAt(member.user_id);
                const live = seen !== null && now - new Date(seen).getTime() < LIVE_WITHIN_MS;
                const isSos = sosUsers.has(member.user_id);
                const inWarning = warningUserIds.has(member.user_id);
                return (
                  <li
                    key={member.user_id}
                    role="button"
                    tabIndex={position ? 0 : -1}
                    aria-disabled={!position}
                    title={position ? `Show ${name} on the map` : 'Not sharing a location'}
                    onClick={() => position && locate(member.user_id)}
                    onKeyDown={(event) => {
                      if (position && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        locate(member.user_id);
                      }
                    }}
                    className={`group rounded-xl border p-2.5 transition-all ${
                      position ? 'cursor-pointer hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary' : 'cursor-default opacity-70'
                    } ${
                      highlightUserId === member.user_id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                        : isSos
                          ? 'border-destructive/50 bg-destructive/5'
                          : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative shrink-0">
                        {member.profiles?.avatar_url ? (
                          <img src={member.profiles.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(name)}</span>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                            isSos ? 'bg-destructive animate-pulse' : live ? 'bg-green-500' : 'bg-muted-foreground'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-medium text-foreground">{name}</p>
                          <span className="shrink-0 rounded-full bg-secondary px-1.5 py-px text-[10px] font-semibold capitalize text-muted-foreground">
                            {member.member_role}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {isSos ? <span className="font-bold text-destructive">SOS · </span> : null}
                          {inWarning ? <span className="font-semibold text-blue-600 dark:text-blue-400">Warning Mode · </span> : null}
                          {seen ? `${live ? 'Live' : 'Last seen'} ${formatAgo(seen, now)}` : 'Not sharing location'}
                        </p>
                      </div>
                    </div>
                    {(member.profiles?.phone || position) && (
                    <div className="mt-2 flex items-center gap-1.5 pl-[2.875rem]">
                      {member.profiles?.phone && (
                        <a
                          onClick={(event) => event.stopPropagation()}
                          href={`tel:${member.profiles.phone}`}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-secondary"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                      {position && (
                        <a
                          onClick={(event) => event.stopPropagation()}
                          href={`https://www.google.com/maps?q=${position.latitude},${position.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-secondary"
                        >
                          <ExternalLink className="w-3 h-3" /> Maps
                        </a>
                      )}
                      {position && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          <LocateFixed className="w-3 h-3" /> Click to locate
                        </span>
                      )}
                    </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {others.length > 0 && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Not on the map: {others.map((m) => `${m.profiles?.display_name ?? 'Unknown'} (${m.status})`).join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border px-5 py-2.5 text-[11px] text-muted-foreground">
          Press <kbd className="rounded border border-border bg-secondary px-1 font-mono">Esc</kbd> to go back
        </div>
      </aside>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  href,
  external = false,
  disabledHint,
}: {
  icon: typeof Phone;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  disabledHint?: string;
}) {
  const className =
    'flex min-h-[4.25rem] flex-col items-start justify-between gap-1.5 rounded-xl border border-border bg-secondary/40 p-2.5 text-left text-xs font-semibold text-foreground transition-smooth hover:border-primary/50 hover:bg-primary/5';
  const body = (
    <>
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </>
  );
  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={className}>
        {body}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={!onClick ? disabledHint : undefined}
      className={`${className} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-secondary/40`}
    >
      {body}
    </button>
  );
}
