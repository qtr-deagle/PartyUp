import { useCallback, useEffect, useMemo, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { AlertTriangle, Search, ShieldAlert, Siren, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import {
  listActiveTripsWithSafetyStatus,
  getTripMonitoringDetail,
  resolveSosAlert,
  type TripMonitoringRow,
  type TripMonitoringDetail,
} from '@/lib/tripMonitoring';
import { useTripMonitoringRealtime } from '@/hooks/useTripMonitoringRealtime';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ongoing: 'bg-green-100 text-green-700',
    open: 'bg-blue-100 text-blue-700',
    full: 'bg-amber-100 text-amber-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-gray-100 text-gray-500',
    draft: 'bg-gray-100 text-gray-500',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

export default function TripMonitoringBoard() {
  const { theme } = useTheme();
  const mapStyle = theme === 'dark' ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/navigation-day-v1';

  const [searchTerm, setSearchTerm] = useState('');
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [trips, setTrips] = useState<TripMonitoringRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TripMonitoringDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [popupUserId, setPopupUserId] = useState<string | null>(null);

  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const { livePositions, selectedTripSafetySessions, activeSosAlerts } = useTripMonitoringRealtime(selectedTripId);

  const tripIdsWithActiveSos = useMemo(() => new Set(activeSosAlerts.map((alert) => alert.trip_id).filter((id): id is string => !!id)), [activeSosAlerts]);

  const loadTrips = useCallback(async (search: string, withCompleted: boolean) => {
    setIsLoading(true);
    const { data, error } = await listActiveTripsWithSafetyStatus(search, withCompleted);
    if (error) {
      setLoadError(error.message);
      toast.error('Failed to load trips');
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

  useEffect(() => {
    if (!selectedTripId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setIsDetailLoading(true);
    setPopupUserId(null);
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

  async function handleResolve() {
    if (!resolvingAlertId) return;
    setIsResolving(true);
    const { error } = await resolveSosAlert(resolvingAlertId, resolutionNotes);
    setIsResolving(false);
    if (error) {
      toast.error('Failed to resolve SOS alert');
      return;
    }
    toast.success('SOS alert marked resolved');
    setResolvingAlertId(null);
    setResolutionNotes('');
  }

  const memberDisplayName = (userId: string) => detail?.members.find((m) => m.user_id === userId)?.profiles?.display_name ?? 'Unknown user';

  const bannerAlerts = activeSosAlerts.filter((alert) => alert.trip_id);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trip Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-2">Monitor active trips, live locations, and safety alerts</p>
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
                  onClick={() => alert.trip_id && setSelectedTripId(alert.trip_id)}
                  className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-medium transition-colors"
                >
                  {trip ? `${trip.origin} → ${trip.destination}` : 'Trip not in current view'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by destination or organizer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>
        <label className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={includeCompleted} onChange={(e) => setIncludeCompleted(e.target.checked)} />
          Include completed/cancelled
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
            ) : loadError ? (
              <p className="text-sm text-destructive text-center py-8">Failed to load trips: {loadError}</p>
            ) : sortedTrips.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No trips match this view</p>
            ) : (
              <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
                {sortedTrips.map((trip) => {
                  const hasActiveSos = tripIdsWithActiveSos.has(trip.id) || trip.active_sos_count > 0;
                  return (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`w-full text-left p-4 transition-colors ${
                        selectedTripId === trip.id ? 'bg-primary/10' : 'hover:bg-secondary/50'
                      } ${hasActiveSos ? 'border-l-4 border-destructive' : ''}`}
                    >
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
                      <p className="text-xs text-muted-foreground mt-1">{trip.organizer_display_name}</p>
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <StatusPill status={trip.status} />
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
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {!selectedTrip ? (
            <div className="bg-card rounded-2xl p-12 shadow-elevation-2 border border-border flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a trip to view live details</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  {selectedTrip.origin} → {selectedTrip.destination}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTrip.organizer_display_name} · {selectedTrip.trip_type} · <StatusPill status={selectedTrip.status} />
                </p>
              </div>

              {isDetailLoading ? (
                <div className="bg-card rounded-2xl p-8 shadow-elevation-2 border border-border">
                  <p className="text-sm text-muted-foreground text-center">Loading trip detail...</p>
                </div>
              ) : detail ? (
                <>
                  {detail.sosAlerts.filter((alert) => alert.status === 'active').length > 0 && (
                    <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-5 space-y-3">
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
                                {new Date(alert.created_at).toLocaleString()}
                              </p>
                              {alert.latitude !== null && alert.longitude !== null && (
                                <p className="text-xs text-muted-foreground">
                                  Location: {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setResolvingAlertId(alert.id)}
                              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-smooth"
                            >
                              Resolve
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {selectedTripSafetySessions.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-center gap-2 text-sm text-blue-700">
                      <ShieldAlert className="w-4 h-4" />
                      {selectedTripSafetySessions.length} member{selectedTripSafetySessions.length > 1 ? 's' : ''} currently in Warning Mode
                    </div>
                  )}

                  <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden h-[420px]">
                    {!mapboxToken ? (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Map unavailable: VITE_MAPBOX_TOKEN is not set</div>
                    ) : (
                      <Map
                        key={selectedTripId}
                        initialViewState={{
                          longitude: selectedTrip.destination_lng ?? 121.0244,
                          latitude: selectedTrip.destination_lat ?? 14.5547,
                          zoom: 11,
                        }}
                        style={{ width: '100%', height: '100%' }}
                        mapStyle={mapStyle}
                        mapboxAccessToken={mapboxToken}
                        attributionControl={false}
                      >
                        {selectedTrip.destination_lat !== null && selectedTrip.destination_lng !== null && (
                          <Marker longitude={selectedTrip.destination_lng} latitude={selectedTrip.destination_lat} anchor="center">
                            <div title="Destination">
                              <MapPin className="w-6 h-6 text-primary" fill="currentColor" />
                            </div>
                          </Marker>
                        )}

                        {detail.members
                          .filter((m) => m.status === 'accepted')
                          .map((member) => {
                            const live = livePositions[member.user_id];
                            const fallback = detail.locations.find((loc) => loc.user_id === member.user_id && loc.is_visible);
                            const position = live ?? (fallback ? { latitude: fallback.latitude, longitude: fallback.longitude } : null);
                            if (!position) return null;
                            const isSos = detail.sosAlerts.some((a) => a.user_id === member.user_id && a.status === 'active');
                            return (
                              <Marker
                                key={member.user_id}
                                longitude={position.longitude}
                                latitude={position.latitude}
                                anchor="center"
                                onClick={() => setPopupUserId(member.user_id)}
                              >
                                <button className="focus:outline-none">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      isSos
                                        ? 'bg-destructive border-destructive animate-pulse'
                                        : member.member_role === 'driver'
                                          ? 'bg-blue-500 border-blue-600'
                                          : 'bg-primary/60 border-primary'
                                    }`}
                                  />
                                </button>
                              </Marker>
                            );
                          })}

                        {popupUserId &&
                          (() => {
                            const member = detail.members.find((m) => m.user_id === popupUserId);
                            const live = livePositions[popupUserId];
                            const fallback = detail.locations.find((loc) => loc.user_id === popupUserId);
                            const position = live ?? fallback;
                            if (!member || !position) return null;
                            return (
                              <Popup longitude={position.longitude} latitude={position.latitude} anchor="bottom" onClose={() => setPopupUserId(null)}>
                                <div className="p-1 text-sm">
                                  <p className="font-medium">{member.profiles?.display_name ?? 'Unknown user'}</p>
                                  <p className="text-xs text-gray-600 capitalize">{member.member_role}</p>
                                </div>
                              </Popup>
                            );
                          })()}
                      </Map>
                    )}
                  </div>

                  <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                    <h4 className="font-bold text-foreground mb-3">Members ({detail.members.length})</h4>
                    <div className="space-y-2">
                      {detail.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                          <div>
                            <span className="font-medium text-foreground">{member.profiles?.display_name ?? 'Unknown user'}</span>
                            <span className="text-muted-foreground capitalize"> · {member.member_role}</span>
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{member.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

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
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {resolvingAlertId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-elevation-3 border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Resolve SOS Alert</h3>
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
                    setResolvingAlertId(null);
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
