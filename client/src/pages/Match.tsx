import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Heart, X, MapPin, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Traveler {
  id: number;
  name: string;
  age: number;
  destination: string;
  rating: number;
  matchType: 'same-plan' | 'experienced';
  interests: string[];
  verified: boolean;
  distance: string;
}

/**
 * PartyUp Match Screen
 * 
 * Design: Minimalist Luxury
 * Mobile View:
 * - Swipe-style traveler cards
 * - Each card shows photo, name, destination, rating, match type
 * - Skip and Match buttons
 * - Smooth card transitions
 * 
 * Desktop View:
 * - Grid of traveler cards
 * - Request Match button for each
 * - Filter options
 */
export default function Match() {
  const [travelers, setTravelers] = useState<Traveler[]>([
    {
      id: 1,
      name: 'Sarah',
      age: 24,
      destination: 'Barcelona, Spain',
      rating: 4.8,
      matchType: 'same-plan',
      interests: ['Museums', 'Food tours', 'Nightlife'],
      verified: true,
      distance: '2.3 km away',
    },
    {
      id: 2,
      name: 'Mike',
      age: 26,
      destination: 'Barcelona, Spain',
      rating: 4.6,
      matchType: 'experienced',
      interests: ['Hiking', 'Photography', 'Local culture'],
      verified: true,
      distance: '1.8 km away',
    },
    {
      id: 3,
      name: 'Emma',
      age: 23,
      destination: 'Barcelona, Spain',
      rating: 4.9,
      matchType: 'same-plan',
      interests: ['Art', 'Shopping', 'Beaches'],
      verified: true,
      distance: '3.2 km away',
    },
    {
      id: 4,
      name: 'Alex',
      age: 25,
      destination: 'Barcelona, Spain',
      rating: 4.7,
      matchType: 'experienced',
      interests: ['Adventure sports', 'Nightlife', 'Food'],
      verified: false,
      distance: '2.8 km away',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const currentTraveler = travelers[currentIndex];

  const handleSkip = () => {
    setSwiping(true);
    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % travelers.length);
      setSwiping(false);
      setSwipeDirection(null);
    }, 300);
    toast('Skipped');
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

  return (
    <Layout>
      {/* Mobile View - Full Screen */}
      <div className="md:hidden flex flex-col h-screen w-screen fixed inset-0 bg-background">
        {/* Mobile Header */}
        <div className="bg-card border-b border-border z-30 p-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-primary">Find Your Buddy</h1>
          <p className="text-xs text-muted-foreground mt-1">Swipe to match with travelers</p>
        </div>

        {/* Main Content - Flex Grow */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Swipe Cards */}
          <div className="flex-1 flex flex-col">
            {currentTraveler ? (
              <>
                {/* Swipe Card */}
                <div
                  className={`flex-1 flex flex-col overflow-hidden rounded-none card-luxury transition-all duration-300 mx-0 ${swiping
                      ? swipeDirection === 'left'
                        ? 'opacity-0 -translate-x-full'
                        : 'opacity-0 translate-x-full'
                      : 'opacity-100 translate-x-0'
                    }`}
                >
                  {/* Card Image */}
                  <div className="flex-1 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/30 mx-auto mb-4"></div>
                        <p className="text-lg font-bold">{currentTraveler.name}</p>
                        <p className="text-sm text-muted-foreground">{currentTraveler.age}</p>
                      </div>
                    </div>
                    {currentTraveler.verified && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-accent/90 text-white text-xs font-bold rounded-full">
                        ✓ Verified
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex-shrink-0 p-6 bg-card overflow-y-auto max-h-[50vh]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold">{currentTraveler.name}, {currentTraveler.age}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{currentTraveler.distance}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{currentTraveler.rating}</span>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">{currentTraveler.destination}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Match Type</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${currentTraveler.matchType === 'same-plan'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-primary/10 text-primary'
                        }`}>
                        {currentTraveler.matchType === 'same-plan' ? '🤝 Same Plan' : '🧭 Experienced Buddy'}
                      </span>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {currentTraveler.interests.map((interest, i) => (
                          <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSkip}
                        disabled={swiping}
                        className="flex-1 py-3 border border-border rounded-lg font-medium transition-smooth hover:bg-secondary disabled:opacity-50"
                      >
                        <X className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={handleMatch}
                        disabled={swiping}
                        className="flex-1 py-3 bg-accent text-accent-foreground rounded-lg font-medium transition-smooth hover:shadow-md disabled:opacity-50"
                      >
                        <Heart className="w-5 h-5 mx-auto fill-current" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex-shrink-0 flex gap-2 justify-center py-4 bg-card border-t border-border">
                  {travelers.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${i === currentIndex
                          ? 'w-8 bg-primary'
                          : i < currentIndex
                            ? 'w-2 bg-primary/30'
                            : 'w-2 bg-border'
                        }`}
                    ></div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">No more travelers to show</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 bg-card border-b border-border z-30">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-primary">Find Your Travel Buddy</h1>
          <p className="text-sm text-muted-foreground mt-2">Discover compatible travelers heading to your destination</p>
        </div>
      </div>

      {/* Desktop Main Content */}
      <div className="hidden md:block p-4 md:p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="col-span-1">
            <div className="card-luxury p-6 sticky top-32">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Match Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-sm">Same Plan</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-sm">Experienced Buddy</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Verified Only</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-sm">Show verified travelers</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Travelers Grid */}
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-6">
              {travelers.map((traveler) => (
                <div key={traveler.id} className="card-luxury p-6 hover:shadow-md transition-smooth">
                  {/* Card Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/30 mx-auto mb-2"></div>
                      <p className="text-sm font-bold">{traveler.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{traveler.name}, {traveler.age}</h3>
                      <p className="text-xs text-muted-foreground">{traveler.distance}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{traveler.rating}</span>
                    </div>
                  </div>

                  <div className="mb-3 p-2 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{traveler.destination}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${traveler.matchType === 'same-plan'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-primary/10 text-primary'
                      }`}>
                      {traveler.matchType === 'same-plan' ? '🤝 Same Plan' : '🧭 Experienced'}
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {traveler.interests.slice(0, 2).map((interest, i) => (
                        <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full py-2 bg-accent text-accent-foreground rounded-lg font-medium transition-smooth hover:shadow-md">
                    Request Match
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
