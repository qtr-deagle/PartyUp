import React, { useMemo, useRef, useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { CheckCircle, MapPin, Star, Settings, Users, ChevronLeft, ChevronRight, Car } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

type TripPurpose = 'vacation' | 'business' | 'backpacking' | 'study';
type BudgetRange = 'budget' | 'mid-range' | 'luxury';
type TravelStyle = 'chill-explorer' | 'instagram-hunter' | 'party-mode' | 'cultural-explorer';
type SortOption = 'date-overlap' | 'compatibility' | 'distance' | 'destination' | 'recent';

type Traveler = {
  id: number;
  name: string;
  age: number;
  bio: string;
  origin: string;
  destination: string;
  dateStart: string;
  dateEnd: string;
  purpose: TripPurpose;
  budget: BudgetRange;
  travelStyle: TravelStyle;
  interests: string[];
  compatibilitySeed: number;
  distanceKm: number;
  verified: boolean;
  rating: number;
  lastActiveHours: number;
  isCarpool: boolean;
  seatsAvailable?: number;
  vehicleType?: string;
  departureLocation?: string;
};

type FilterState = {
  destination: string;
  dateFrom: string;
  dateTo: string;
  purposes: TripPurpose[];
  budgets: BudgetRange[];
  styles: TravelStyle[];
  interests: string[];
  seatsAvailableOnly: boolean;
  minCompatibility: number;
};

const purposeLabels: Record<TripPurpose, string> = {
  vacation: 'Vacation',
  business: 'Business',
  backpacking: 'Backpacking',
  study: 'Study',
};

const budgetLabels: Record<BudgetRange, string> = {
  budget: 'Budget',
  'mid-range': 'Mid-range',
  luxury: 'Luxury',
};

const styleLabels: Record<TravelStyle, string> = {
  'chill-explorer': 'Chill Explorer',
  'instagram-hunter': 'Instagram Hunter',
  'party-mode': 'Party Mode',
  'cultural-explorer': 'Cultural Explorer',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getOverlapDays = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
  const start = Math.max(parseDate(aStart).getTime(), parseDate(bStart).getTime());
  const end = Math.min(parseDate(aEnd).getTime(), parseDate(bEnd).getTime());
  const diff = end - start;
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};

export default function Discovery() {
  const [travelers] = useState<Traveler[]>([
    {
      id: 1,
      name: 'Sarah',
      age: 24,
      bio: 'First time in Paris. Looking for food trip buddy.',
      origin: 'Manila',
      destination: 'Paris',
      dateStart: '2026-03-15',
      dateEnd: '2026-03-22',
      purpose: 'vacation',
      budget: 'mid-range',
      travelStyle: 'instagram-hunter',
      interests: ['Food tours', 'Museums', 'Cafes', 'Photography'],
      compatibilitySeed: 86,
      distanceKm: 2.1,
      verified: true,
      rating: 4.8,
      lastActiveHours: 2,
      isCarpool: false,
    },
    {
      id: 2,
      name: 'Mike',
      age: 27,
      bio: 'Driving to Tagaytay for a weekend escape.',
      origin: 'Quezon City',
      destination: 'Tagaytay',
      dateStart: '2026-03-20',
      dateEnd: '2026-03-22',
      purpose: 'vacation',
      budget: 'budget',
      travelStyle: 'chill-explorer',
      interests: ['Hiking', 'Coffee', 'Road trips'],
      compatibilitySeed: 79,
      distanceKm: 1.4,
      verified: true,
      rating: 4.6,
      lastActiveHours: 4,
      isCarpool: true,
      seatsAvailable: 3,
      vehicleType: 'SUV',
      departureLocation: 'Trinoma North Ave',
    },
    {
      id: 3,
      name: 'Emma',
      age: 23,
      bio: 'Beach lover planning a quick Batangas getaway.',
      origin: 'Makati',
      destination: 'Batangas',
      dateStart: '2026-03-18',
      dateEnd: '2026-03-19',
      purpose: 'vacation',
      budget: 'luxury',
      travelStyle: 'instagram-hunter',
      interests: ['Beach', 'Shopping', 'Resorts', 'Brunch'],
      compatibilitySeed: 92,
      distanceKm: 3.2,
      verified: true,
      rating: 4.9,
      lastActiveHours: 1,
      isCarpool: false,
    },
    {
      id: 4,
      name: 'Alex',
      age: 25,
      bio: 'Planning a Palawan dive trip with flexible dates.',
      origin: 'BGC',
      destination: 'Palawan',
      dateStart: '2026-03-22',
      dateEnd: '2026-03-29',
      purpose: 'vacation',
      budget: 'mid-range',
      travelStyle: 'party-mode',
      interests: ['Diving', 'Island hopping', 'Food'],
      compatibilitySeed: 84,
      distanceKm: 2.7,
      verified: false,
      rating: 4.7,
      lastActiveHours: 6,
      isCarpool: false,
    },
    {
      id: 5,
      name: 'Jae',
      age: 26,
      bio: 'Looking for study-focused buddies in Singapore.',
      origin: 'Cebu',
      destination: 'Singapore',
      dateStart: '2026-04-05',
      dateEnd: '2026-04-20',
      purpose: 'study',
      budget: 'mid-range',
      travelStyle: 'cultural-explorer',
      interests: ['Libraries', 'Food markets', 'Museums'],
      compatibilitySeed: 76,
      distanceKm: 5.8,
      verified: true,
      rating: 4.5,
      lastActiveHours: 10,
      isCarpool: false,
    },
    {
      id: 6,
      name: 'Luis',
      age: 30,
      bio: 'Business trip with open seats for Antipolo.',
      origin: 'Ortigas',
      destination: 'Antipolo',
      dateStart: '2026-03-17',
      dateEnd: '2026-03-17',
      purpose: 'business',
      budget: 'luxury',
      travelStyle: 'chill-explorer',
      interests: ['Coffee', 'City views', 'Workspaces'],
      compatibilitySeed: 80,
      distanceKm: 1.1,
      verified: true,
      rating: 4.8,
      lastActiveHours: 3,
      isCarpool: true,
      seatsAvailable: 2,
      vehicleType: 'Sedan',
      departureLocation: 'Robinsons Galleria',
    },
  ]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('compatibility');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const touchStartX = useRef(0);

  const [filters, setFilters] = useState<FilterState>({
    destination: '',
    dateFrom: '',
    dateTo: '',
    purposes: [],
    budgets: [],
    styles: [],
    interests: [],
    seatsAvailableOnly: false,
    minCompatibility: 60,
  });

  const allInterests = [
    'Food tours',
    'Museums',
    'Cafes',
    'Photography',
    'Hiking',
    'Coffee',
    'Road trips',
    'Beach',
    'Shopping',
    'Resorts',
    'Diving',
    'Island hopping',
    'Libraries',
    'Food markets',
    'City views',
    'Workspaces',
  ];

  const computeCompatibility = (traveler: Traveler) => {
    let score = traveler.compatibilitySeed;
    let boosts = 0;

    if (filters.destination) {
      const destinationMatch = traveler.destination.toLowerCase().includes(filters.destination.toLowerCase());
      boosts += destinationMatch ? 8 : 0;
    }

    if (filters.purposes.length > 0 && filters.purposes.includes(traveler.purpose)) {
      boosts += 6;
    }

    if (filters.budgets.length > 0 && filters.budgets.includes(traveler.budget)) {
      boosts += 6;
    }

    if (filters.styles.length > 0 && filters.styles.includes(traveler.travelStyle)) {
      boosts += 6;
    }

    if (filters.interests.length > 0) {
      const overlap = traveler.interests.filter((interest) => filters.interests.includes(interest)).length;
      boosts += Math.min(overlap * 2, 8);
    }

    if (filters.dateFrom && filters.dateTo) {
      const overlapDays = getOverlapDays(traveler.dateStart, traveler.dateEnd, filters.dateFrom, filters.dateTo);
      boosts += overlapDays > 0 ? Math.min(overlapDays, 6) : 0;
    }

    return clamp(score + boosts, 0, 100);
  };

  const filteredTravelers = useMemo(() => {
    let result = travelers.map((traveler) => ({
      ...traveler,
      compatibilityScore: computeCompatibility(traveler),
    }));

    if (filters.destination) {
      const keyword = filters.destination.toLowerCase();
      result = result.filter(
        (traveler) =>
          traveler.destination.toLowerCase().includes(keyword) ||
          traveler.origin.toLowerCase().includes(keyword)
      );
    }

    if (filters.purposes.length > 0) {
      result = result.filter((traveler) => filters.purposes.includes(traveler.purpose));
    }

    if (filters.budgets.length > 0) {
      result = result.filter((traveler) => filters.budgets.includes(traveler.budget));
    }

    if (filters.styles.length > 0) {
      result = result.filter((traveler) => filters.styles.includes(traveler.travelStyle));
    }

    if (filters.interests.length > 0) {
      result = result.filter((traveler) =>
        traveler.interests.some((interest) => filters.interests.includes(interest))
      );
    }

    if (filters.seatsAvailableOnly) {
      result = result.filter((traveler) => traveler.isCarpool && (traveler.seatsAvailable || 0) > 0);
    }

    result = result.filter((traveler) => traveler.compatibilityScore >= filters.minCompatibility);

    result.sort((a, b) => {
      if (sortBy === 'compatibility') {
        return b.compatibilityScore - a.compatibilityScore;
      }

      if (sortBy === 'distance') {
        return a.distanceKm - b.distanceKm;
      }

      if (sortBy === 'recent') {
        return a.lastActiveHours - b.lastActiveHours;
      }

      if (sortBy === 'destination') {
        const keyword = filters.destination.toLowerCase();
        const aMatch = keyword ? a.destination.toLowerCase().includes(keyword) : false;
        const bMatch = keyword ? b.destination.toLowerCase().includes(keyword) : false;
        if (aMatch === bMatch) {
          return b.compatibilityScore - a.compatibilityScore;
        }
        return aMatch ? -1 : 1;
      }

      if (filters.dateFrom && filters.dateTo) {
        const aOverlap = getOverlapDays(a.dateStart, a.dateEnd, filters.dateFrom, filters.dateTo);
        const bOverlap = getOverlapDays(b.dateStart, b.dateEnd, filters.dateFrom, filters.dateTo);
        if (aOverlap === bOverlap) {
          return b.compatibilityScore - a.compatibilityScore;
        }
        return bOverlap - aOverlap;
      }

      return parseDate(a.dateStart).getTime() - parseDate(b.dateStart).getTime();
    });

    return result;
  }, [travelers, filters, sortBy]);

  useEffect(() => {
    if (currentIndex >= filteredTravelers.length) {
      setCurrentIndex(0);
    }
  }, [filteredTravelers.length, currentIndex]);

  const currentTraveler = filteredTravelers[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (swiping || filteredTravelers.length === 0) return;
    setSwiping(true);
    setSwipeDirection(direction);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (direction === 'left') {
          return (prev + 1) % filteredTravelers.length;
        }
        return (prev - 1 + filteredTravelers.length) % filteredTravelers.length;
      });
      setSwiping(false);
      setSwipeDirection(null);
    }, 250);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    event.stopPropagation(); // Prevent Layout's swipe handler from firing
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.stopPropagation(); // Prevent Layout's swipe handler from firing
    const diff = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      handleSwipe(diff > 0 ? 'left' : 'right');
    }
  };

  const handleViewDetails = (traveler: Traveler) => {
    toast.success(`Viewing details for ${traveler.name}`);
  };

  const handleRequestSeat = (traveler: Traveler) => {
    toast.success(`Seat request sent to ${traveler.name}`);
  };

  const handleConnect = (traveler: Traveler) => {
    toast.success(`Connection request sent to ${traveler.name}`);
  };

  const toggleFilterOption = <T extends string>(key: keyof FilterState, value: T) => {
    setFilters((prev) => {
      const list = prev[key] as T[];
      const updated = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...prev, [key]: updated } as FilterState;
    });
  };

  return (
    <Layout>
      <div className="bg-background min-h-[80vh]">
        <div className="px-4 md:px-8 py-4 flex items-center justify-end gap-2">
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="date-overlap">Date overlap</option>
            <option value="compatibility">Highest compatibility</option>
            <option value="distance">Nearest distance</option>
            <option value="destination">Same destination priority</option>
            <option value="recent">Recently active</option>
          </select>
          <Button onClick={() => setFilterOpen(true)} variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Mobile Swipe View */}
        <div className="md:hidden px-4 h-[78vh] flex flex-col">
          {currentTraveler ? (
            <>
              <div
                className="relative flex-1 flex flex-col"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className={`absolute inset-0 rounded-2xl border border-border bg-card transition-all duration-300 overflow-hidden ${
                    swiping
                      ? swipeDirection === 'left'
                        ? 'opacity-0 -translate-x-full'
                        : 'opacity-0 translate-x-full'
                      : 'opacity-100 translate-x-0'
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <div className="bg-secondary px-5 py-4 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            {currentTraveler.name}, {currentTraveler.age}
                            {currentTraveler.verified && <CheckCircle className="w-4 h-4 text-accent" />}
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">{currentTraveler.bio}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          {currentTraveler.rating}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-primary mt-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {currentTraveler.distanceKm.toFixed(1)} km away
                      </div>
                    </div>

                    <div className="px-5 py-4 space-y-3 border-b border-border text-sm">
                      <div>
                        <span className="text-muted-foreground">Route: </span>
                        <span className="font-semibold text-foreground">
                          {currentTraveler.origin} → {currentTraveler.destination}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dates: </span>
                        <span className="font-semibold text-foreground">
                          {formatDate(currentTraveler.dateStart)} - {formatDate(currentTraveler.dateEnd)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/40 text-primary">
                          {purposeLabels[currentTraveler.purpose]}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-amber/40 text-amber">
                          {budgetLabels[currentTraveler.budget]}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-purple/40 text-purple">
                          {styleLabels[currentTraveler.travelStyle]}
                        </span>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-b border-border">
                      <p className="text-xs text-muted-foreground font-semibold mb-2">Interests</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentTraveler.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full border border-border"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {currentTraveler.isCarpool && (
                      <div className="px-5 py-3 border-b border-border text-sm">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                          <Car className="w-4 h-4" /> Carpool details
                        </div>
                        <div className="mt-2 space-y-1 text-muted-foreground">
                          <div>
                            Seats available: <span className="font-semibold text-foreground">{currentTraveler.seatsAvailable}</span>
                          </div>
                          {currentTraveler.vehicleType && (
                            <div>
                              Vehicle: <span className="font-semibold text-foreground">{currentTraveler.vehicleType}</span>
                            </div>
                          )}
                          {currentTraveler.departureLocation && (
                            <div>
                              Departure: <span className="font-semibold text-foreground">{currentTraveler.departureLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="px-5 py-4 space-y-3 mt-auto">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Compatibility</span>
                          <span className="text-xs font-bold text-primary">{currentTraveler.compatibilityScore}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${currentTraveler.compatibilityScore}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetails(currentTraveler)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        {currentTraveler.isCarpool ? (
                          <Button
                            onClick={() => handleRequestSeat(currentTraveler)}
                            size="sm"
                            className="flex-1"
                          >
                            Request Seat
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleConnect(currentTraveler)}
                            size="sm"
                            className="flex-1"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                <Button onClick={() => handleSwipe('right')} variant="outline" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex gap-1">
                  {filteredTravelers.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <Button onClick={() => handleSwipe('left')} variant="outline" size="icon">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No travelers found</h3>
              <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters to see more matches</p>
              <Button onClick={() => setFilterOpen(true)} variant="outline">
                Adjust Filters
              </Button>
            </div>
          )}
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:block px-8 py-6">
          {filteredTravelers.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {filteredTravelers.map((traveler) => (
                <div
                  key={traveler.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary transition-all duration-300"
                >
                  <div className="p-5 border-b border-border bg-secondary">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          {traveler.name}, {traveler.age}
                          {traveler.verified && <CheckCircle className="w-4 h-4 text-accent" />}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{traveler.bio}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        {traveler.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-primary mt-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {traveler.distanceKm.toFixed(1)} km away
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-3 border-b border-border text-sm">
                    <div>
                      <span className="text-muted-foreground">Route: </span>
                      <span className="font-semibold text-foreground">
                        {traveler.origin} → {traveler.destination}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dates: </span>
                      <span className="font-semibold text-foreground">
                        {formatDate(traveler.dateStart)} - {formatDate(traveler.dateEnd)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/40 text-primary">
                        {purposeLabels[traveler.purpose]}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-amber/40 text-amber">
                        {budgetLabels[traveler.budget]}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-purple/40 text-purple">
                        {styleLabels[traveler.travelStyle]}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-b border-border">
                    <p className="text-xs text-muted-foreground font-semibold mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {traveler.interests.slice(0, 4).map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full border border-border"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {traveler.isCarpool && (
                    <div className="px-5 py-3 border-b border-border text-sm">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Car className="w-4 h-4" /> Carpool details
                      </div>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <div>
                          Seats available: <span className="font-semibold text-foreground">{traveler.seatsAvailable}</span>
                        </div>
                        {traveler.vehicleType && (
                          <div>
                            Vehicle: <span className="font-semibold text-foreground">{traveler.vehicleType}</span>
                          </div>
                        )}
                        {traveler.departureLocation && (
                          <div>
                            Departure: <span className="font-semibold text-foreground">{traveler.departureLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Compatibility</span>
                        <span className="text-xs font-bold text-primary">{traveler.compatibilityScore}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${traveler.compatibilityScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewDetails(traveler)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      {traveler.isCarpool ? (
                        <Button
                          onClick={() => handleRequestSeat(traveler)}
                          size="sm"
                          className="flex-1"
                        >
                          Request Seat
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleConnect(traveler)}
                          size="sm"
                          className="flex-1"
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No travelers found</h3>
              <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters to see more matches</p>
              <Button onClick={() => setFilterOpen(true)} variant="outline">
                Adjust Filters
              </Button>
            </div>
          )}
        </div>

        {/* Filter Modal */}
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filter Travelers</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Destination</Label>
                <Input
                  placeholder="Search destination or origin..."
                  value={filters.destination}
                  onChange={(event) => setFilters((prev) => ({ ...prev, destination: event.target.value }))}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">From Date</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">To Date</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3">Trip Purpose</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(purposeLabels).map((purpose) => (
                    <label key={purpose} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={filters.purposes.includes(purpose as TripPurpose)}
                        onCheckedChange={() => toggleFilterOption('purposes', purpose as TripPurpose)}
                      />
                      {purposeLabels[purpose as TripPurpose]}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3">Budget Range</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(budgetLabels).map((budget) => (
                    <label key={budget} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={filters.budgets.includes(budget as BudgetRange)}
                        onCheckedChange={() => toggleFilterOption('budgets', budget as BudgetRange)}
                      />
                      {budgetLabels[budget as BudgetRange]}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3">Travel Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(styleLabels).map((style) => (
                    <label key={style} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={filters.styles.includes(style as TravelStyle)}
                        onCheckedChange={() => toggleFilterOption('styles', style as TravelStyle)}
                      />
                      {styleLabels[style as TravelStyle]}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3">Interests</Label>
                <div className="grid grid-cols-2 gap-3">
                  {allInterests.map((interest) => (
                    <label key={interest} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={filters.interests.includes(interest)}
                        onCheckedChange={() => toggleFilterOption('interests', interest)}
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Checkbox
                  checked={filters.seatsAvailableOnly}
                  onCheckedChange={() =>
                    setFilters((prev) => ({ ...prev, seatsAvailableOnly: !prev.seatsAvailableOnly }))
                  }
                />
                <span className="text-sm font-medium">Seats available only</span>
              </div>

              <div>
                <Label className="text-base font-semibold">Minimum Compatibility ({filters.minCompatibility}%)</Label>
                <Slider
                  value={[filters.minCompatibility]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, minCompatibility: value[0] }))}
                  className="mt-3"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      destination: '',
                      dateFrom: '',
                      dateTo: '',
                      purposes: [],
                      budgets: [],
                      styles: [],
                      interests: [],
                      seatsAvailableOnly: false,
                      minCompatibility: 60,
                    })
                  }
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button type="button" onClick={() => setFilterOpen(false)} className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
