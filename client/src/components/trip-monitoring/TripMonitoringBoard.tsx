import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import {
  Activity,
  AlertTriangle,
  Bus,
  CalendarDays,
  Car,
  Compass,
  History,
  ListOrdered,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  Search,
  ShieldAlert,
  Siren,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation, useSearch } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import {
  listActiveTripsWithSafetyStatus,
  getTripMonitoringDetail,
  type TripMonitoringRow,
  type TripMonitoringDetail,
} from '@/lib/tripMonitoring';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';
import { SearchField, Segmented } from '@/components/admin/AdminUI';
import ResolveSosDialog, { useSosResolving } from '@/components/sos/ResolveSosDialog';
import { formatDateShort, formatDateTime } from '@/lib/datetime';
import { useTripMonitoringRealtime } from '@/hooks/useTripMonitoringRealtime';
import { LIVE_WITHIN_MS, MapLegend, TripMap, TripMapFullscreen } from '@/components/trip-monitoring/TripMapView';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
}

// An ongoing trip past its scheduled end. The database closes these
// automatically OVERDUE_GRACE_HOURS later (auto_complete_overdue_trips,
// partyup-mobile migration 202610070005); keep the two in sync. Without an
// end_at, a trip is assumed to last one day (the job's minimum).
const OVERDUE_GRACE_HOURS = 12;

function scheduledEnd(trip: { start_at: string | null; end_at: string | null }) {
  if (trip.end_at) return new Date(trip.end_at).getTime();
  if (trip.start_at) return new Date(trip.start_at).getTime() + 86_400_000;
  return null;
}

function isOverdue(trip: { status: string; start_at: string | null; end_at: string | null }, now: number) {
  const end = scheduledEnd(trip);
  return trip.status === 'ongoing' && end !== null && end < now;
}

function StatusPill({ status, overdue = false }: { status: string; overdue?: boolean }) {
  if (overdue) {
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300"
        title={`Past its scheduled end but not completed by the organizer. Closes automatically ${OVERDUE_GRACE_HOURS}h after the end time.`}
      >
        Overdue
      </span>
    );
  }
  const styles: Record<string, string> = {
    ongoing: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    full: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'}`}>{status}</span>;
}


type StatusFilter = 'all' | 'ongoing' | 'open' | 'full';

function formatAgo(iso: string, now: number) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return formatDateShort(iso);
}

function formatDateRange(start: string | null, end: string | null) {
  const from = formatDate(start);
  const to = formatDate(end);
  if (from && to) return from === to ? from : `${from} – ${to}`;
  return from ?? to ?? 'No dates set';
}

// Share of the trip's scheduled window that has passed, or null without dates.
function tripProgress(start: string | null, end: string | null, now: number) {
  if (!start || !end) return null;
  const from = new Date(start).getTime();
  const to = new Date(end).getTime();
  if (to <= from) return null;
  return Math.min(100, Math.max(0, Math.round(((now - from) / (to - from)) * 100)));
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

function Avatar({ name, url, size = 'md' }: { name: string; url: string | null | undefined; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return url ? (
    <img src={url} alt={name} className={`${box} rounded-full object-cover border border-border shrink-0`} />
  ) : (
    <div className={`${box} rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground shrink-0`}>{initialsOf(name)}</div>
  );
}

function StatCard({ icon, iconClass, label, value, hint }: { icon: ReactNode; iconClass: string; label: string; value: string; hint: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-elevation-1 border border-border flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${iconClass}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{hint}</p>
      </div>
    </div>
  );
}

function TripTypeIcon({ type, className }: { type: string; className?: string }) {
  return type === 'carpool' ? <Car className={className} /> : <Bus className={className} />;
}

function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** `padded={false}` when the layout already pads its content (AdminLayout). */
export default function TripMonitoringBoard({ padded = true }: { padded?: boolean }) {
  const { theme } = useTheme();
  const mapStyle = theme === 'dark' ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/navigation-day-v1';

  const [searchTerm, setSearchTerm] = useState('');
  // `?completed=1` (from the dashboard's Total Trips / Completion Rate cards)
  // opens the board with finished trips included.
  const search = useSearch();
  const [includeCompleted, setIncludeCompleted] = useState(() => new URLSearchParams(search).get('completed') === '1');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const now = useNow();
  const [trips, setTrips] = useState<TripMonitoringRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TripMonitoringDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [detailTab, setDetailTab] = useState<'map' | 'members' | 'itinerary' | 'safety'>('map');

  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const isResolving = useSosResolving();

  const memberUserIds = useMemo(
    () => (detail ? detail.members.filter((member) => member.status === 'accepted').map((member) => member.user_id) : []),
    [detail]
  );
  const { livePositions, selectedTripSafetySessions, activeSosAlerts } = useTripMonitoringRealtime(selectedTripId, memberUserIds);

  const tripIdsWithActiveSos = useMemo(() => new Set(activeSosAlerts.map((alert) => alert.trip_id).filter((id): id is string => !!id)), [activeSosAlerts]);

  const loadTrips = useCallback(async (search: string, withCompleted: boolean, silent = false) => {
    if (!silent) setIsLoading(true);
    const { data, error } = await listActiveTripsWithSafetyStatus(search, withCompleted);
    if (error) {
      setLoadError(error.message);
      if (!silent) toast.error('Failed to load trips');
      setIsLoading(false);
      return;
    }
    setLoadError(null);
    setTrips(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => void loadTrips(searchTerm, includeCompleted), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, includeCompleted, loadTrips]);

  // Live: new trips, status changes and member joins/leaves update the list.
  useTableRealtime(['trips', 'trip_members'], () => void loadTrips(searchTerm, includeCompleted, true));

  // Client-side reinforcement on top of the RPC's baked-in sort: trips with a
  // currently-live SOS (per the realtime hook, which reflects resolves
  // immediately) always float to the top, even between list refetches.
  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      const aSos = tripIdsWithActiveSos.has(a.id) ? 1 : 0;
      const bSos = tripIdsWithActiveSos.has(b.id) ? 1 : 0;
      if (aSos !== bSos) return bSos - aSos;
      return 0;
    });
  }, [trips, tripIdsWithActiveSos]);

  const visibleTrips = useMemo(
    () => (statusFilter === 'all' ? sortedTrips : sortedTrips.filter((trip) => trip.status === statusFilter)),
    [sortedTrips, statusFilter]
  );
  const tripsPage = useClientPagination(visibleTrips, [searchTerm, statusFilter, includeCompleted]);

  const stats = useMemo(() => {
    const ongoing = trips.filter((trip) => trip.status === 'ongoing');
    const travelersOnTrips = ongoing.reduce((sum, trip) => sum + trip.members_accepted_count, 0);
    const needsAttention = trips.filter(
      (trip) => tripIdsWithActiveSos.has(trip.id) || trip.active_sos_count > 0 || trip.active_safety_session_count > 0 || trip.open_report_count > 0
    ).length;
    const openReports = trips.reduce((sum, trip) => sum + trip.open_report_count, 0);
    const counts: Record<StatusFilter, number> = {
      all: trips.length,
      ongoing: ongoing.length,
      open: trips.filter((trip) => trip.status === 'open').length,
      full: trips.filter((trip) => trip.status === 'full').length,
    };
    return { ongoing: ongoing.length, travelersOnTrips, needsAttention, openReports, counts };
  }, [trips, tripIdsWithActiveSos]);

  useEffect(() => {
    if (!selectedTripId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setIsDetailLoading(true);
    setMapExpanded(false);
    setDetailTab('map');
    getTripMonitoringDetail(selectedTripId).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error('Failed to load trip detail', error);
        toast.error(`Failed to load trip detail: ${error.message}`);
      } else {
        setDetail(data);
      }
      setIsDetailLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedTripId]);

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? null;

  const memberDisplayName = (userId: string) => detail?.members.find((m) => m.user_id === userId)?.profiles?.display_name ?? 'Unknown user';

  // Last time each member's phone reported a position (live stream first, then the stored row).
  const lastSeenAt = (userId: string) => {
    const live = livePositions[userId];
    if (live) return live.updatedAt;
    return detail?.locations.find((loc) => loc.user_id === userId && loc.is_visible)?.updated_at ?? null;
  };
  const acceptedMembers = detail ? detail.members.filter((member) => member.status === 'accepted') : [];
  const liveMemberCount = acceptedMembers.filter((member) => {
    const seen = lastSeenAt(member.user_id);
    return seen !== null && now - new Date(seen).getTime() < LIVE_WITHIN_MS;
  }).length;
  const progress = selectedTrip ? tripProgress(selectedTrip.start_at, selectedTrip.end_at, now) : null;
  const pastSafetyEvents = detail
    ? [
        ...detail.sosAlerts
          .filter((alert) => alert.status === 'resolved')
          .map((alert) => ({ id: alert.id, at: alert.created_at, userId: alert.user_id, kind: 'SOS resolved' as const, note: alert.resolution_notes })),
        ...detail.safetySessions
          .filter((session) => session.status !== 'monitoring')
          .map((session) => ({
            id: session.id,
            at: session.started_at,
            userId: session.user_id,
            kind: session.status === 'escalated' ? ('Warning Mode escalated' as const) : ('Warning Mode ended' as const),
            note: null,
          })),
      ].sort((a, b) => (a.at < b.at ? 1 : -1))
    : [];

  // Every active SOS, with or without a trip -- each opens its live view in the SOS Center.
  const bannerAlerts = activeSosAlerts;
  const [location, navigate] = useLocation();
  const sosCenterPath = location.startsWith('/admin') ? '/admin/sos' : '/staff/sos';

  // With an active SOS in the selected trip, open the map on that member rather than the destination.
  const sosFocus = (() => {
    if (!detail) return null;
    const alert = detail.sosAlerts.find((a) => a.status === 'active');
    if (!alert) return null;
    const live = livePositions[alert.user_id];
    if (live) return live;
    const row = detail.locations.find((loc) => loc.user_id === alert.user_id);
    if (row) return { latitude: Number(row.latitude), longitude: Number(row.longitude) };
    return alert.latitude !== null && alert.longitude !== null ? { latitude: Number(alert.latitude), longitude: Number(alert.longitude) } : null;
  })();

  return (
    <div className={`flex flex-col gap-5 lg:h-full lg:min-h-0 ${padded ? 'p-8' : ''}`}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trip Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Monitor active trips, live locations, and safety alerts</p>
      </div>

      {bannerAlerts.length > 0 && (
        <div className="sticky top-0 z-20 bg-destructive text-destructive-foreground rounded-xl px-5 py-3 shadow-elevation-3 flex flex-wrap items-center gap-3">
          <Siren className="w-5 h-5 shrink-0 animate-pulse" />
          <span className="font-semibold">
            {bannerAlerts.length} active SOS alert{bannerAlerts.length > 1 ? 's' : ''}
          </span>
          <div className="flex flex-wrap gap-2">
            {bannerAlerts.map((alert) => {
              const trip = trips.find((t) => t.id === alert.trip_id);
              return (
                <button
                  key={alert.id}
                  onClick={() => navigate(`${sosCenterPath}?alert=${alert.id}`)}
                  className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-medium transition-colors"
                >
                  {alert.profile?.display_name ?? 'Unknown user'}
                  {trip ? ` · ${trip.origin} → ${trip.destination}` : ''} · Live location
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-6 h-6 text-green-500" />}
          iconClass="bg-green-500/10"
          label="Ongoing trips"
          value={String(stats.ongoing)}
          hint={`${trips.length} trip${trips.length === 1 ? '' : 's'} in view`}
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-primary" />}
          iconClass="bg-primary/10"
          label="Travelers on the road"
          value={String(stats.travelersOnTrips)}
          hint="Accepted members of ongoing trips"
        />
        <StatCard
          icon={<Siren className={`w-6 h-6 ${activeSosAlerts.length > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />}
          iconClass={activeSosAlerts.length > 0 ? 'bg-destructive/10' : 'bg-secondary'}
          label="Active SOS"
          value={String(activeSosAlerts.length)}
          hint={activeSosAlerts.length > 0 ? 'Open the SOS Center to respond' : 'No one needs help right now'}
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
          iconClass="bg-amber-500/10"
          label="Trips needing attention"
          value={String(stats.needsAttention)}
          hint={`${stats.openReports} open report${stats.openReports === 1 ? '' : 's'} · SOS · Warning Mode`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={statusFilter}
          options={(['all', 'ongoing', 'open', 'full'] as const).map((value) => ({
            value,
            label: (
              <span className="capitalize">
                {value} <span className="opacity-60 tabular-nums">{stats.counts[value]}</span>
              </span>
            ),
          }))}
          onChange={setStatusFilter}
        />
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search destination or organizer..." />
        {/* Live trips only by default; this adds completed + cancelled ones. */}
        <button
          type="button"
          role="switch"
          aria-checked={includeCompleted}
          onClick={() => setIncludeCompleted((on) => !on)}
          title={includeCompleted ? 'Hide completed and cancelled trips' : 'Also show completed and cancelled trips'}
          className={`sm:ml-auto inline-flex h-10 items-center gap-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
            includeCompleted ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-card border-border text-foreground hover:bg-secondary'
          }`}
        >
          <History className="w-4 h-4" />
          Show finished trips
          <span className={`relative h-5 w-9 rounded-full transition-colors ${includeCompleted ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${includeCompleted ? 'translate-x-4' : ''}`}
            />
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:flex-1 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]">
        <div className="lg:col-span-2 lg:min-h-0">
          <div data-paginated className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden flex flex-col lg:h-full max-lg:max-h-[32rem]">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
            ) : loadError ? (
              <p className="text-sm text-destructive text-center py-8">Failed to load trips: {loadError}</p>
            ) : visibleTrips.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <Compass className="w-10 h-10 mx-auto text-muted-foreground opacity-60" />
                <p className="font-semibold text-foreground">No trips match this view</p>
                <p className="text-sm text-muted-foreground">Try another status filter, clear the search, or include completed trips.</p>
              </div>
            ) : (
              <>
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain divide-y divide-border">
                {tripsPage.pageItems.map((trip) => {
                  const hasActiveSos = tripIdsWithActiveSos.has(trip.id) || trip.active_sos_count > 0;
                  const seatsFilled = trip.seats_total ? trip.seats_total - (trip.seats_available ?? 0) : null;
                  return (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`w-full text-left p-4 transition-colors ${
                        selectedTripId === trip.id ? 'bg-primary/10' : 'hover:bg-secondary/50'
                      } ${hasActiveSos ? 'border-l-4 border-destructive' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            hasActiveSos ? 'bg-destructive/10 text-destructive' : trip.status === 'ongoing' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'
                          }`}
                        >
                          <TripTypeIcon type={trip.trip_type} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-foreground text-sm">
                              {trip.origin} → {trip.destination}
                            </p>
                            {hasActiveSos && (
                              <span className="flex items-center gap-1 text-destructive text-xs font-bold shrink-0">
                                <Siren className="w-3.5 h-3.5" /> SOS
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-1.5">
                            <span>{trip.organizer_display_name}</span>
                            <span>·</span>
                            <span className="capitalize">{trip.trip_type}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" /> {formatDateRange(trip.start_at, trip.end_at)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 mt-3 pl-12">
                        <StatusPill status={trip.status} overdue={isOverdue(trip, now)} />
                        {trip.open_report_count > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-700">
                            <AlertTriangle className="w-3.5 h-3.5" /> {trip.open_report_count} report{trip.open_report_count > 1 ? 's' : ''}
                          </span>
                        )}
                        {trip.active_safety_session_count > 0 && (
                          <span className="flex items-center gap-1 text-xs text-blue-700">
                            <ShieldAlert className="w-3.5 h-3.5" /> Warning Mode
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3.5 h-3.5" /> {trip.members_accepted_count}
                        </span>
                      </div>
                      {trip.seats_total && seatsFilled !== null ? (
                        <div className="mt-2 pl-12">
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full ${seatsFilled >= trip.seats_total ? 'bg-amber-500' : 'bg-primary'}`}
                              style={{ width: `${Math.min(100, (seatsFilled / trip.seats_total) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {seatsFilled} of {trip.seats_total} seats taken
                          </p>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <TablePagination pagination={tripsPage} itemLabel="trips" compact className="border-t border-border px-3 py-2" />
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 lg:min-h-0">
          {!selectedTrip ? (
            <div className="bg-card rounded-2xl p-10 shadow-elevation-2 border border-border h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Select a trip to view live details</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  See members on the map, who is sharing their location, the itinerary, and any reports or safety alerts.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-destructive" /> SOS
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-500" /> Warning Mode
                </span>
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Open report
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
              <div className="shrink-0 bg-card rounded-2xl p-5 shadow-elevation-2 border border-border space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                    <TripTypeIcon type={selectedTrip.trip_type} className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {selectedTrip.origin} → {selectedTrip.destination}
                      </h3>
                      <StatusPill status={selectedTrip.status} overdue={isOverdue(selectedTrip, now)} />
                    </div>
                    {selectedTrip.title && <p className="text-sm text-foreground mt-0.5">{selectedTrip.title}</p>}
                    <p className="text-sm text-muted-foreground">
                      Organized by {selectedTrip.organizer_display_name} · <span className="capitalize">{selectedTrip.trip_type}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Starts', value: formatDateTime(selectedTrip.start_at) },
                    { label: 'Ends', value: formatDateTime(selectedTrip.end_at) },
                    {
                      label: 'Seats',
                      value: selectedTrip.seats_total ? `${selectedTrip.seats_total - (selectedTrip.seats_available ?? 0)} / ${selectedTrip.seats_total} taken` : '—',
                    },
                    { label: 'Sharing location', value: detail ? `${liveMemberCount} of ${acceptedMembers.length} members` : '—' },
                  ].map((fact) => (
                    <div key={fact.label} className="bg-secondary rounded-lg p-3 border border-border">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{fact.label}</p>
                      <p className="text-sm font-medium text-foreground mt-1">{fact.value}</p>
                    </div>
                  ))}
                </div>

                {progress !== null && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Trip progress</span>
                      <span>{progress === 0 ? 'Not started' : progress === 100 ? 'Schedule finished' : `${progress}% of schedule`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {isDetailLoading ? (
                <div className="bg-card rounded-2xl p-8 shadow-elevation-2 border border-border lg:flex-1">
                  <p className="text-sm text-muted-foreground text-center">Loading trip detail...</p>
                </div>
              ) : detail ? (
                <>
                  {detail.sosAlerts.filter((alert) => alert.status === 'active').length > 0 && (
                    <div className="shrink-0 bg-destructive/10 border-2 border-destructive rounded-2xl p-4 space-y-3">
                      <h4 className="font-bold text-destructive flex items-center gap-2">
                        <Siren className="w-5 h-5" /> Active SOS
                      </h4>
                      {detail.sosAlerts
                        .filter((alert) => alert.status === 'active')
                        .map((alert) => (
                          <div key={alert.id} className="bg-card rounded-lg p-3 border border-border flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <p className="text-sm font-medium text-foreground">{memberDisplayName(alert.user_id)}</p>
                              <p className="text-xs text-muted-foreground">
                                {alert.trigger_reason === 'manual' ? 'Manually triggered' : 'Auto-escalated from Warning Mode'} ·{' '}
                                {formatDateTime(alert.created_at)}
                              </p>
                              {alert.latitude !== null && alert.longitude !== null && (
                                <p className="text-xs text-muted-foreground">
                                  Location: {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                                </p>
                              )}
                            </div>
                            {isResolving(alert.id) ? (
                              <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-sm font-semibold">
                                Resolving…
                              </span>
                            ) : (
                              <button
                                onClick={() => setResolvingAlertId(alert.id)}
                                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-smooth"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {selectedTripSafetySessions.length > 0 && (
                    <div className="shrink-0 bg-blue-500/10 border border-blue-500/30 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <ShieldAlert className="w-4 h-4" />
                      {selectedTripSafetySessions.length} member{selectedTripSafetySessions.length > 1 ? 's' : ''} currently in Warning Mode
                    </div>
                  )}

                  <Segmented
                    value={detailTab}
                    options={[
                      { value: 'map' as const, label: <><Navigation className="w-4 h-4" /> Live map</> },
                      { value: 'members' as const, label: <><Users className="w-4 h-4" /> Members <span className="opacity-60">{detail.members.length}</span></> },
                      ...(detail.itinerary.length > 0
                        ? [{ value: 'itinerary' as const, label: <><ListOrdered className="w-4 h-4" /> Itinerary</> }]
                        : []),
                      {
                        value: 'safety' as const,
                        label: (
                          <>
                            <ShieldAlert className="w-4 h-4" /> Safety & reports
                            {pastSafetyEvents.length + detail.reports.length > 0 && (
                              <span className="opacity-60">{pastSafetyEvents.length + detail.reports.length}</span>
                            )}
                          </>
                        ),
                      },
                    ]}
                    onChange={setDetailTab}
                  />

                  <div className="lg:flex-1 lg:min-h-0">
                  {detailTab === 'map' && (
                  <div className="relative bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden h-[420px] lg:h-full">
                    <TripMap data={{ trip: selectedTrip, detail, livePositions, sosFocus }} mapStyle={mapStyle} />
                    {mapboxToken && (
                      <>
                        <div className="absolute top-3 left-3 rounded-lg bg-card/90 backdrop-blur border border-border px-3 py-2 text-xs text-foreground flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${liveMemberCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                          {liveMemberCount} of {acceptedMembers.length} sharing live location
                        </div>
                        <button
                          onClick={() => setMapExpanded(true)}
                          title="Open the full-screen monitor"
                          className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-elevation-2 hover:shadow-elevation-3 transition-smooth"
                        >
                          <Maximize2 className="w-4 h-4" /> Expand
                        </button>
                        <MapLegend className="absolute bottom-3 right-3" />
                      </>
                    )}
                  </div>

                  )}

                  {detailTab === 'members' && (
                  <div className="bg-card rounded-2xl px-6 py-3 shadow-elevation-2 border border-border lg:h-full overflow-y-auto overscroll-contain">
                    <div className="divide-y divide-border">
                      {detail.members.map((member) => {
                        const name = member.profiles?.display_name ?? 'Unknown user';
                        const seen = lastSeenAt(member.user_id);
                        const isLiveNow = seen !== null && now - new Date(seen).getTime() < LIVE_WITHIN_MS;
                        const isSos = detail.sosAlerts.some((a) => a.user_id === member.user_id && a.status === 'active');
                        const inWarning = selectedTripSafetySessions.some((session) => session.user_id === member.user_id);
                        return (
                          <div key={member.id} className="flex items-center gap-3 py-3">
                            <div className="relative">
                              <Avatar name={name} url={member.profiles?.avatar_url} />
                              {member.status === 'accepted' && (
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                                    isSos ? 'bg-destructive animate-pulse' : isLiveNow ? 'bg-green-500' : 'bg-muted-foreground'
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground text-sm">{name}</span>
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                                    member.member_role === 'coordinator'
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
                                      : member.member_role === 'driver'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                                        : 'bg-secondary text-muted-foreground'
                                  }`}
                                >
                                  {member.member_role}
                                </span>
                                {isSos && <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-destructive/10 text-destructive">SOS</span>}
                                {inWarning && <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">Warning Mode</span>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {member.status !== 'accepted'
                                  ? <span className="capitalize">{member.status}</span>
                                  : seen
                                    ? `${isLiveNow ? 'Live' : 'Last seen'} ${formatAgo(seen, now)}`
                                    : 'Not sharing location'}
                                {member.joined_at ? ` · joined ${formatDate(member.joined_at)}` : ''}
                              </p>
                            </div>
                            {member.profiles?.phone && (
                              <a
                                href={`tel:${member.profiles.phone}`}
                                title={`Call ${name}`}
                                className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors shrink-0"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  )}

                  {detailTab === 'itinerary' && detail.itinerary.length > 0 && (
                    <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border lg:h-full overflow-y-auto overscroll-contain">
                      <ol className="relative border-l-2 border-border ml-3 space-y-4">
                        {detail.itinerary.map((day) => (
                          <li key={day.id} className="pl-6 relative">
                            <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                              {day.day_number}
                            </span>
                            <p className="text-sm font-semibold text-foreground">Day {day.day_number}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{day.description || 'No plan written for this day.'}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {detailTab === 'safety' && (
                  <div className="space-y-4 lg:h-full overflow-y-auto overscroll-contain">
                  {pastSafetyEvents.length === 0 && detail.reports.length === 0 && (
                    <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
                      <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-foreground">No safety events or reports</p>
                      <p className="text-xs text-muted-foreground mt-1">SOS alerts, Warning Mode and reports on this trip show up here.</p>
                    </div>
                  )}
                  {pastSafetyEvents.length > 0 && (
                    <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                      <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-muted-foreground" /> Safety history
                      </h4>
                      <div className="divide-y divide-border">
                        {pastSafetyEvents.map((event) => (
                          <div key={event.id} className="py-2.5 flex items-start justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="text-foreground">
                                <span className="font-medium">{memberDisplayName(event.userId)}</span>
                                <span className="text-muted-foreground"> · {event.kind}</span>
                              </p>
                              {event.note && <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>}
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(event.at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail.reports.length > 0 && (
                    <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                      <h4 className="font-bold text-foreground mb-3">Reports ({detail.reports.length})</h4>
                      <div className="space-y-2">
                        {detail.reports.map((report) => (
                          <div key={report.id} className="text-sm py-2 border-b border-border last:border-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground capitalize">{report.report_type}</span>
                              <span className="text-xs text-muted-foreground capitalize">{report.status}</span>
                            </div>
                            <p className="text-muted-foreground mt-1">{report.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                  )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {mapExpanded && selectedTrip && detail && (
        <TripMapFullscreen
          data={{ trip: selectedTrip, detail, livePositions, sosFocus }}
          mapStyle={mapStyle}
          now={now}
          lastSeenAt={lastSeenAt}
          warningUserIds={new Set(selectedTripSafetySessions.map((session) => session.user_id))}
          isResolving={isResolving}
          onResolveSos={setResolvingAlertId}
          onOpenSosCenter={() => {
            const alert = detail.sosAlerts.find((a) => a.status === 'active');
            navigate(alert ? `${sosCenterPath}?alert=${alert.id}` : sosCenterPath);
          }}
          onClose={() => setMapExpanded(false)}
        />
      )}

      {(() => {
        const alert = resolvingAlertId ? detail?.sosAlerts.find((a) => a.id === resolvingAlertId) : null;
        return (
          <ResolveSosDialog
            alert={alert ? { id: alert.id, created_at: alert.created_at, name: memberDisplayName(alert.user_id) } : null}
            onClose={() => setResolvingAlertId(null)}
          />
        );
      })()}
    </div>
  );
}
