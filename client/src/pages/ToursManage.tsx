import React, { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { ArrowLeft, Edit2, Trash2, Users, Calendar, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { cancelTrip, formatCurrency, listMyTrips, type MyTrip } from '@/lib/tours';

const HISTORY_STATUSES = new Set(['completed', 'cancelled']);

/**
 * Manage Tours Page
 *
 * Tour organizers can:
 * - View their created tours (real data from Supabase)
 * - Cancel a tour
 * - Jump into a tour's participant list
 */
export default function ToursManage() {
  const [, setLocation] = useLocation();
  const [myTours, setMyTours] = useState<MyTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listMyTrips('tour');
    if (error) {
      toast.error(error.message);
    } else {
      setMyTours(data.filter((t) => t.my_role === 'coordinator'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleEditTour = () => {
    toast.info('Editing tour details is coming soon');
  };

  const handleCancelTour = async (tourId: string) => {
    if (!window.confirm('Cancel this tour? All participants will be notified.')) {
      return;
    }
    setBusyId(tourId);
    const { error } = await cancelTrip(tourId);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Tour cancelled');
    void load();
  };

  const handleViewParticipants = (tourId: string) => {
    setLocation(`/trips/${tourId}`);
  };

  const activeTours = myTours.filter((t) => !HISTORY_STATUSES.has(t.status));
  const completedTours = myTours.filter((t) => t.status === 'completed');

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
      <div className="sticky top-0 bg-card border-b border-border z-30 px-4 md:px-6 py-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <button onClick={() => setLocation('/tours')} className="p-1 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h1 className="text-base font-bold text-foreground">My Tours</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <div className="bg-secondary p-1.5 rounded text-center">
            <p className="text-muted-foreground">Active</p>
            <p className="font-bold text-foreground text-sm">{activeTours.length}</p>
          </div>
          <div className="bg-secondary p-1.5 rounded text-center">
            <p className="text-muted-foreground">People</p>
            <p className="font-bold text-foreground text-sm">{myTours.reduce((sum, t) => sum + t.rider_count, 0)}</p>
          </div>
          <div className="bg-secondary p-1.5 rounded text-center">
            <p className="text-muted-foreground">Total Tours</p>
            <p className="font-bold text-foreground text-sm">{myTours.length}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8">
        <div className="space-y-6">
          {/* Active Tours */}
          {activeTours.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Active Tours</h2>
              <div className="space-y-4">
                {activeTours.map((tour) => (
                  <div key={tour.id} className="bg-card rounded-2xl p-6 border border-border hover:border-primary transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-xs font-semibold text-green-600 capitalize">{tour.status}</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{tour.title}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(tour.price_per_person)}/person</p>
                      </div>
                    </div>

                    {/* Tour Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          <p className="text-sm font-medium text-foreground">{tour.destination}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date & Duration</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          <p className="text-sm font-medium text-foreground">
                            {tour.start_at ? new Date(tour.start_at).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Participants</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3" />
                          <p className="text-sm font-medium text-foreground">
                            {tour.rider_count}
                            {tour.seats_total ? `/${tour.seats_total}` : ''}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pending Requests</p>
                        <p className="text-sm font-medium text-foreground mt-1">{tour.pending_join_requests_count}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleViewParticipants(tour.id)}
                        className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-smooth font-medium"
                      >
                        View Participants
                      </button>
                      <button onClick={handleEditTour} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <Edit2 className="w-5 h-5 text-primary" />
                      </button>
                      <button
                        onClick={() => void handleCancelTour(tour.id)}
                        disabled={busyId === tour.id}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Completed Tours */}
          {completedTours.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Completed Tours</h2>
              <div className="space-y-4">
                {completedTours.map((tour) => (
                  <div key={tour.id} className="bg-card rounded-2xl p-6 border border-border opacity-75">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          <span className="text-xs font-semibold text-gray-600">Completed</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{tour.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tour.start_at ? new Date(tour.start_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myTours.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">You haven't created any tours yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
