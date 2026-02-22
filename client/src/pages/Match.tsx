import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { X, MapPin, Star, CheckCircle, TrendingUp, Eye, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Traveler {
  id: number;
  name: string;
  age: number;
  destination: string;
  departDate: string;
  rating: number;
  matchType: 'travel-buddy' | 'carpool';
  travelRole: 'driver' | 'passenger' | 'both';
  interests: string[];
  verified: boolean;
  distance: number;
  compatibilityScore: number;
}

/**
 * PartyUp Discover Screen (Match Screen)
 * 
 * Design: Professional, intelligent, safe
 * Mobile View:
 * - Swipe-style traveler cards
 * - Circular profile image with verified badge
 * - Safety rating, compatibility percentage
 * - Travel details and preferences
 * - Smooth swipe animations
 * 
 * Actions: Swipe left (skip), swipe right (match), swipe up (full profile)
 */
export default function Match() {
  const [travelers, setTravelers] = useState<Traveler[]>([
    {
      id: 1,
      name: 'Sarah',
      age: 24,
      destination: 'Manila to Boracay',
      departDate: 'Mar 15, 2026',
      rating: 4.8,
      matchType: 'travel-buddy',
      travelRole: 'passenger',
      interests: ['Beach', 'Food tours', 'Local culture'],
      verified: true,
      distance: 2.3,
      compatibilityScore: 92,
    },
    {
      id: 2,
      name: 'Mike',
      age: 26,
      destination: 'Quezon City to Tagaytay',
      departDate: 'Mar 20, 2026',
      rating: 4.6,
      matchType: 'carpool',
      travelRole: 'driver',
      interests: ['Hiking', 'Photography', 'Nightlife'],
      verified: true,
      distance: 1.8,
      compatibilityScore: 88,
    },
    {
      id: 3,
      name: 'Emma',
      age: 23,
      destination: 'Makati to Batangas',
      departDate: 'Mar 18, 2026',
      rating: 4.9,
      matchType: 'travel-buddy',
      travelRole: 'passenger',
      interests: ['Beach', 'Shopping', 'Adventure'],
      verified: true,
      distance: 3.2,
      compatibilityScore: 95,
    },
    {
      id: 4,
      name: 'Alex',
      age: 25,
      destination: 'BGC to Palawan',
      departDate: 'Mar 22, 2026',
      rating: 4.7,
      matchType: 'carpool',
      travelRole: 'both',
      interests: ['Diving', 'Kayaking', 'Food'],
      verified: false,
      distance: 2.8,
      compatibilityScore: 85,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const currentTraveler = travelers[currentIndex];

  const handleSkip = () => {
    setSwiping(true);
    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % travelers.length);
      setSwiping(false);
      setSwipeDirection(null);
    }, 300);
    toast('Profile skipped');
  };

  const handleMatch = () => {
    setSwiping(true);
    setSwipeDirection('right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % travelers.length);
      setSwiping(false);
      setSwipeDirection(null);
    }, 300);
    toast.success('Match found! Check your messages.');
  };

  const handleViewProfile = () => {
    setSwiping(true);
    setSwipeDirection('up');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % travelers.length);
      setSwiping(false);
      setSwipeDirection(null);
    }, 300);
  };

  return (
    <Layout>
      {/* Mobile View */}
      <div className="md:hidden flex flex-col fixed left-0 right-0 h-[83%] bg-background dark:bg-background p-4 overflow-hidden">
        {currentTraveler ? (
          <>
            {/* Swipe Card */}
            <div
              className={`flex flex-col bg-card dark:bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 h-full ${
                swiping
                  ? swipeDirection === 'left'
                    ? 'opacity-0 -translate-x-full rotate-12'
                    : swipeDirection === 'right'
                    ? 'opacity-0 translate-x-full -rotate-12'
                    : 'opacity-0 translate-y-full'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              {/* Top Section - Profile Image & Badges */}
              <div className="bg-secondary relative flex flex-col items-center justify-center py-4 px-4 flex-shrink-0 border-b border-border">
                <div className="absolute top-3 right-4 flex flex-col gap-1.5">
                  {currentTraveler.verified && (
                    <div className="px-2 py-0.5 bg-accent/20 border border-accent/50 text-accent text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </div>
                  )}
                  <div className="px-2 py-0.5 bg-primary/20 border border-primary/50 text-primary text-xs font-semibold rounded-full">
                    ⭐ {currentTraveler.rating}
                  </div>
                </div>

                {/* Profile Image */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-primary">{currentTraveler.name[0]}</span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground">{currentTraveler.name}, {currentTraveler.age}</h2>
                    <div className="flex items-center justify-center gap-1 mt-1 text-primary">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">
                        {currentTraveler.distance.toFixed(1)} km away
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section - Travel Info */}
              <div className="px-4 py-3 space-y-2 border-t border-border flex-shrink-0">
                {/* Travel Role & Match Type */}
                <div className="flex gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    currentTraveler.matchType === 'travel-buddy'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-yellow-200/30 border-yellow-200/50 text-yellow-700'
                  }`}>
                    {currentTraveler.matchType === 'travel-buddy' ? '🤝 Travel Buddy' : '🚗 Carpool'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    currentTraveler.travelRole === 'driver'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-primary/20 border-primary/50 text-primary'
                  }`}>
                    {currentTraveler.travelRole === 'driver' ? '🚙 Driver' : currentTraveler.travelRole === 'passenger' ? '👤 Passenger' : '↔️ Flexible'}
                  </span>
                </div>

                {/* Destination & Date */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <p className="font-semibold text-foreground">{currentTraveler.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary flex-shrink-0 text-xs">📅</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Departure</p>
                      <p className="font-semibold text-foreground">{currentTraveler.departDate}</p>
                    </div>
                  </div>
                </div>

                {/* Compatibility & Preferences */}
                <div className="pt-1.5 border-t border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Compatibility Match</span>
                    <span className="text-xs font-bold text-primary">{currentTraveler.compatibilityScore}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${currentTraveler.compatibilityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Interests */}
              <div className="px-4 py-2.5 border-t border-border flex-shrink-0">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentTraveler.interests.map((interest, i) => (
                    <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-full font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-3 border-t border-border flex gap-2 flex-shrink-0">
                <button
                  onClick={handleSkip}
                  disabled={swiping}
                  className="flex-1 py-2.5 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg font-semibold text-sm transition-all hover:bg-destructive/10 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Not Now</span>
                </button>
                <button
                  onClick={handleViewProfile}
                  disabled={swiping}
                  className="flex-1 py-2.5 border border-primary/30 bg-primary/5 text-primary rounded-lg font-semibold text-sm transition-all hover:bg-primary/10 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={handleMatch}
                  disabled={swiping}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Match</span>
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-1 justify-center py-2 flex-shrink-0">
              {travelers.map((_, i) => (
                <div
                    key={i}
                    className={`rounded-full transition-all ${
                      i === currentIndex
                        ? 'w-8 h-1.5 bg-primary'
                        : i < currentIndex
                        ? 'w-2 h-1.5 bg-muted'
                        : 'w-2 h-1.5 bg-muted/50'
                    }`}
                  ></div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400">No more travelers to discover</p>
            </div>
          )}
        </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-background dark:bg-background min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">Discover Travelers</h1>
            <p className="text-muted-foreground">Find compatible partners for your next journey</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {travelers.map((traveler) => (
              <div key={traveler.id} className="group bg-card dark:bg-card rounded-2xl border border-border overflow-hidden hover:border-primary dark:hover:border-primary transition-all duration-300">
                {/* Profile Section */}
                <div className="h-48 bg-secondary flex flex-col items-center justify-center gap-3 p-6 relative border-b border-border">
                  {traveler.verified && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-accent/20 border border-accent/50 text-accent text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </div>
                  )}
                  <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{traveler.name[0]}</span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-foreground">{traveler.name}, {traveler.age}</h3>
                    <div className="flex items-center justify-center gap-1 mt-1 text-primary text-sm">
                      <MapPin className="w-4 h-4" /> {traveler.distance.toFixed(1)} km
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-5 space-y-4 border-t border-blue-600/20">
                  {/* Match Type & Role */}
                  <div className="flex gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${
                      traveler.matchType === 'travel-buddy'
                        ? 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                        : 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                    }`}>
                      {traveler.matchType === 'travel-buddy' ? '🤝 Buddy' : '🚗 Carpool'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${
                      traveler.travelRole === 'driver'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                    }`}>
                      {traveler.travelRole === 'driver' ? '🚙 Driver' : '👤 Passenger'}
                    </span>
                  </div>

                  {/* Destination */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Destination</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{traveler.destination}</p>
                  </div>

                  {/* Compatibility */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Compatibility</span>
                      <span className="text-xs font-bold text-blue-400">{traveler.compatibilityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${traveler.compatibilityScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Interests</p>
                    <div className="flex gap-1 flex-wrap">
                      {traveler.interests.slice(0, 2).map((interest, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-blue-600/10 border border-blue-600/30 text-blue-200 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-5 py-4 border-t border-blue-600/20">
                  <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all hover:bg-blue-700">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
