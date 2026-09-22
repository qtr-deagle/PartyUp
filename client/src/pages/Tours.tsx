import React, { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Calendar, Users, Plus, Search, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import {
  formatCurrency,
  joinPublicTrip,
  listBrowseTours,
  listFavoriteTours,
  listMyTrips,
  toggleTripFavorite,
  type MyTrip,
  type TourCard as TourCardData,
} from '@/lib/tours';

/**
 * Tours Browsing Page
 *
 * Users can:
 * - Browse organized group tours (real data from Supabase)
 * - Join tours
 * - Favorite tours for later
 * - See tours they've already joined or created
 */
export default function Tours() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'browse' | 'joined' | 'interested'>('browse');
  const [searchTerm, setSearchTerm] = useState('');

  const [browseTours, setBrowseTours] = useState<TourCardData[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [browseError, setBrowseError] = useState<string | null>(null);

  const [myTours, setMyTours] = useState<MyTrip[]>([]);
  const [myToursLoading, setMyToursLoading] = useState(true);

  const [favoriteTours, setFavoriteTours] = useState<TourCardData[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  const [busyTourId, setBusyTourId] = useState<string | null>(null);

  const loadBrowseTours = useCallback(async () => {
    setBrowseLoading(true);
    setBrowseError(null);
    const { data, error } = await listBrowseTours(searchTerm);
    if (error) {
      setBrowseError(error.message);
    } else {
      setBrowseTours(data);
    }
    setBrowseLoading(false);
  }, [searchTerm]);

  const loadMyTours = useCallback(async () => {
    setMyToursLoading(true);
    const { data, error } = await listMyTrips('tour');
    if (error) {
      toast.error(error.message);
    } else {
      setMyTours(data);
    }
    setMyToursLoading(false);
  }, []);

  const loadFavoriteTours = useCallback(async () => {
    setFavoritesLoading(true);
    const { data, error } = await listFavoriteTours('tour');
    if (error) {
      toast.error(error.message);
    } else {
      setFavoriteTours(data);
    }
    setFavoritesLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'browse') {
      void loadBrowseTours();
    } else if (activeTab === 'joined') {
      void loadMyTours();
    } else {
      void loadFavoriteTours();
    }
  }, [activeTab, loadBrowseTours, loadMyTours, loadFavoriteTours]);

  const handleToggleFavorite = async (tourId: string) => {
    setBrowseTours((current) => current.map((t) => (t.id === tourId ? { ...t, is_favorited: !t.is_favorited } : t)));
    const { error } = await toggleTripFavorite(tourId);
    if (error) {
      toast.error(error.message);
      void loadBrowseTours();
      return;
    }
    if (activeTab === 'interested') {
      void loadFavoriteTours();
    }
  };

  const handleJoinTour = async (tourId: string) => {
    setBusyTourId(tourId);
    const { error } = await joinPublicTrip(tourId);
    setBusyTourId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Successfully joined tour!');
    void loadBrowseTours();
    setLocation(`/trips/${tourId}`);
  };

  const filteredTours = browseTours;

  const renderTourCard = (tour: TourCardData, options: { primaryLabel: string; onPrimary: () => void; busy?: boolean } = {
    primaryLabel: 'Join Tour',
    onPrimary: () => handleJoinTour(tour.id),
  }) => (
    <div key={tour.id} className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden hover:border-primary transition-all">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-32 h-32 bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">
          ✈️
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{tour.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{tour.destination}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">by {tour.organizer_display_name}</p>
              </div>
              <button
                onClick={() => void handleToggleFavorite(tour.id)}
                className={`p-2 rounded-lg transition-colors ${
                  tour.is_favorited ? 'bg-red-100 text-red-600' : 'bg-secondary text-muted-foreground hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${tour.is_favorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {tour.rider_count}
                  {tour.seats_total ? `/${tour.seats_total}` : ''} joined
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {tour.start_at ? new Date(tour.start_at).toLocaleDateString() : 'Date TBD'}
                  {tour.duration_days ? ` · ${tour.duration_days}d` : ''}
                </span>
              </div>
            </div>

            {tour.interest_tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {tour.interest_tags.map((interest) => (
                  <span key={interest} className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(tour.price_per_person)}</p>
            </div>
            <button
              onClick={options.onPrimary}
              disabled={options.busy}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50 flex items-center gap-2"
            >
              {options.busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {options.primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-30 px-4 md:px-6 py-1.5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm font-bold text-foreground whitespace-nowrap">Tours</h1>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void loadBrowseTours();
              }}
              className="w-full pl-7 pr-2 py-1 text-xs bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-smooth"
            />
          </div>

          <button
            onClick={() => setLocation('/tours/create')}
            className="flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded-md font-medium text-xs hover:shadow-lg transition-smooth whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3 h-3" />
            Create
          </button>
        </div>

        <div className="flex gap-0 border-b border-border">
          {[
            { id: 'browse', label: 'Browse Tours' },
            { id: 'joined', label: 'My Tours' },
            { id: 'interested', label: 'Interested' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="space-y-6">
          {activeTab === 'browse' && (
            <>
              {browseError ? <p className="text-sm text-destructive">{browseError}</p> : null}
              {browseLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredTours.length > 0 ? (
                filteredTours.map((tour) =>
                  renderTourCard(tour, { primaryLabel: 'Join Tour', onPrimary: () => void handleJoinTour(tour.id), busy: busyTourId === tour.id })
                )
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No tours found. Be the first to create one!</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'joined' && (
            <>
              {myToursLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : myTours.length > 0 ? (
                <div className="space-y-6">
                  {myTours.map((tour) => (
                    <div key={tour.id} className="p-6 bg-card border-2 border-green-500/30 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-semibold text-green-600 capitalize">
                              {tour.my_role === 'coordinator' ? 'Organizing' : 'Joined'} · {tour.status}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-foreground">{tour.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tour.start_at ? new Date(tour.start_at).toLocaleDateString() : 'Date TBD'} · {tour.destination}
                          </p>
                        </div>
                        <button
                          onClick={() => setLocation(`/trips/${tour.id}`)}
                          className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-smooth"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">You haven't joined any tours yet</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'interested' && (
            <>
              {favoritesLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : favoriteTours.length > 0 ? (
                <div className="space-y-6">
                  {favoriteTours.map((tour) =>
                    renderTourCard(tour, { primaryLabel: 'View Details', onPrimary: () => setLocation(`/trips/${tour.id}`) })
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No interested tours yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
