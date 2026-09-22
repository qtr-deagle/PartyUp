import React, { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Calendar, Users, MessageCircle, Map as MapIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { formatCurrency, listMyTrips, type MyTrip, type TripType } from '@/lib/tours';

type ParticipatedTrip = MyTrip & { trip_type: TripType };
type StatusTab = 'active' | 'upcoming' | 'completed';

function statusTab(status: MyTrip['status']): StatusTab {
  if (status === 'ongoing') return 'active';
  if (status === 'completed' || status === 'cancelled') return 'completed';
  return 'upcoming';
}

export default function MyParticipatedTours() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<StatusTab>('active');
  const [trips, setTrips] = useState<ParticipatedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [carpoolResult, tourResult] = await Promise.all([listMyTrips('carpool'), listMyTrips('tour')]);
    if (carpoolResult.error) toast.error(carpoolResult.error.message);
    if (tourResult.error) toast.error(tourResult.error.message);

    const merged: ParticipatedTrip[] = [
      ...carpoolResult.data.map((t) => ({ ...t, trip_type: 'carpool' as const })),
      ...tourResult.data.map((t) => ({ ...t, trip_type: 'tour' as const })),
    ].filter((t) => t.my_role === 'member');

    setTrips(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredTrips = trips.filter((trip) => statusTab(trip.status) === activeTab);

  const getStatusBadge = (status: MyTrip['status']) => {
    switch (status) {
      case 'ongoing':
        return { bg: 'bg-green-500/10', text: 'text-green-600', label: '🟢 In Progress' };
      case 'completed':
        return { bg: 'bg-gray-500/10', text: 'text-gray-600', label: '✅ Completed' };
      case 'cancelled':
        return { bg: 'bg-red-500/10', text: 'text-red-600', label: '⛔ Cancelled' };
      default:
        return { bg: 'bg-blue-500/10', text: 'text-blue-600', label: '🟡 Upcoming' };
    }
  };

  const getTypeBadge = (type: TripType) =>
    type === 'carpool'
      ? { bg: 'bg-blue-500/10', text: 'text-blue-600', label: '🚗 Carpool' }
      : { bg: 'bg-purple-500/10', text: 'text-purple-600', label: '✈️ Tour' };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-30 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">My Participated Tours</h1>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-secondary rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-xl font-bold text-foreground">{trips.length}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Upcoming</p>
            <p className="text-xl font-bold text-blue-600">{trips.filter((t) => statusTab(t.status) === 'upcoming').length}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Active</p>
            <p className="text-xl font-bold text-green-600">{trips.filter((t) => statusTab(t.status) === 'active').length}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-xl font-bold text-primary">{trips.filter((t) => t.status === 'completed').length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(['active', 'upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-smooth ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="space-y-4">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No {activeTab} trips</p>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const statusBadge = getStatusBadge(trip.status);
              const typeBadge = getTypeBadge(trip.trip_type);

              return (
                <div key={trip.id} className="bg-card border border-border rounded-2xl p-4 md:p-6 hover:shadow-md transition-smooth">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Left - Info */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {trip.trip_type === 'carpool' ? '🚗' : '✈️'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground">{trip.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>{statusBadge.label}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeBadge.bg} ${typeBadge.text}`}>{typeBadge.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-foreground">
                            {trip.origin} → {trip.destination}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-foreground">{trip.start_at ? new Date(trip.start_at).toLocaleDateString() : 'Date TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-foreground">
                            {trip.rider_count}
                            {trip.seats_total ? `/${trip.seats_total}` : ''} participants
                          </span>
                        </div>
                      </div>

                      {trip.interest_tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {trip.interest_tags.map((interest, idx) => (
                            <span key={idx} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* Middle - Organizer */}
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">{trip.trip_type === 'tour' ? 'Organizer' : 'Driver'}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {trip.organizer_display_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-foreground">{trip.organizer_display_name}</p>
                            {trip.organizer_verified ? <p className="text-xs text-green-600">✓ Verified</p> : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right - Price & Actions */}
                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Your Share</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(trip.price_per_person)}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setLocation(`/chat`)}
                          className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary flex items-center justify-center gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Chat</span>
                        </button>
                        <button
                          onClick={() => setLocation(`/trips/${trip.id}`)}
                          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md flex items-center justify-center gap-1"
                        >
                          <MapIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
