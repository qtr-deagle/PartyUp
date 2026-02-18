import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Eye, EyeOff, Users, Navigation } from 'lucide-react';

interface Traveler {
  id: number;
  name: string;
  distance: string;
  matched: boolean;
}

/**
 * PartyUp Map Screen
 * 
 * Design: Minimalist Luxury
 * Mobile View:
 * - Map showing nearby travelers as anonymous dots
 * - Tap user to request pairing
 * - Location hidden until mutual match
 * - Geofencing notifications
 * 
 * Desktop View:
 * - Full map view
 * - Traveler list sidebar
 * - Location toggle
 * - Privacy controls
 */
export default function MapPage() {
  const [showLocation, setShowLocation] = useState(false);
  const [travelers] = useState<Traveler[]>([
    { id: 1, name: 'Sarah', distance: '2.3 km', matched: true },
    { id: 2, name: 'Mike', distance: '1.8 km', matched: false },
    { id: 3, name: 'Emma', distance: '3.2 km', matched: true },
    { id: 4, name: 'Alex', distance: '2.8 km', matched: false },
    { id: 5, name: 'Jordan', distance: '4.1 km', matched: false },
  ]);

  const [selectedTraveler, setSelectedTraveler] = useState<Traveler | null>(null);

  return (
    <Layout>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Map</h1>
          <p className="text-xs text-muted-foreground mt-1">Nearby travelers</p>
        </div>
        <button
          onClick={() => setShowLocation(!showLocation)}
          className="p-2 rounded-lg hover:bg-secondary transition-smooth"
        >
          {showLocation ? (
            <Eye className="w-5 h-5 text-primary" />
          ) : (
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 bg-card border-b border-border z-30">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Nearby Travelers Map</h1>
            <p className="text-sm text-muted-foreground mt-2">Find and connect with travelers in your area</p>
          </div>
          <button
            onClick={() => setShowLocation(!showLocation)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-smooth"
          >
            {showLocation ? (
              <>
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">Location Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-5 h-5" />
                <span className="text-sm font-medium">Location Hidden</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {/* Map Container */}
          <div className="card-luxury p-6 h-96 flex items-center justify-center relative overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>

            {/* Traveler Dots */}
            <div className="relative w-full h-full">
              {/* Your Location */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-primary/30 animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 rounded-full border-2 border-primary/20 animate-ping"></div>
              </div>

              {/* Other Travelers */}
              {travelers.map((traveler, i) => {
                const angle = (i / travelers.length) * Math.PI * 2;
                const distance = 60 + (i % 3) * 20;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                return (
                  <button
                    key={traveler.id}
                    onClick={() => setSelectedTraveler(traveler)}
                    className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 z-10 group"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                    }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        traveler.matched
                          ? 'bg-accent border-accent'
                          : 'bg-primary/30 border-primary'
                      } group-hover:scale-125`}
                    ></div>
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-primary border border-primary"></div>
                <span>Nearby travelers</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-accent border border-accent"></div>
                <span>Matched travelers</span>
              </div>
            </div>
          </div>

          {/* Location Privacy Notice */}
          {!showLocation && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-primary font-medium">
                ✓ Your location is hidden until you match with someone
              </p>
            </div>
          )}

          {/* Nearby Travelers List */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Nearby Travelers</h3>
            <div className="space-y-2">
              {travelers.map((traveler) => (
                <button
                  key={traveler.id}
                  onClick={() => setSelectedTraveler(traveler)}
                  className="w-full p-3 card-luxury text-left hover:shadow-md transition-smooth"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${traveler.matched ? 'bg-accent' : 'bg-primary/30'}`}></div>
                      <div>
                        <p className="font-medium text-sm">{traveler.name}</p>
                        <p className="text-xs text-muted-foreground">{traveler.distance}</p>
                      </div>
                    </div>
                    {traveler.matched && (
                      <span className="text-xs font-bold text-accent">✓ Matched</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Traveler Detail */}
          {selectedTraveler && (
            <div className="card-luxury p-4">
              <h4 className="font-bold text-lg mb-2">{selectedTraveler.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">{selectedTraveler.distance} away</p>
              {selectedTraveler.matched ? (
                <button className="w-full py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
                  View Profile
                </button>
              ) : (
                <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
                  Request to Connect
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-4 gap-8">
          {/* Map */}
          <div className="col-span-3 card-luxury p-8 h-96 flex items-center justify-center relative overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>

            {/* Traveler Dots */}
            <div className="relative w-full h-full">
              {/* Your Location */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-5 h-5 bg-primary rounded-full border-2 border-primary/30 animate-pulse"></div>
                <div className="absolute inset-0 w-5 h-5 rounded-full border-2 border-primary/20 animate-ping"></div>
              </div>

              {/* Other Travelers */}
              {travelers.map((traveler, i) => {
                const angle = (i / travelers.length) * Math.PI * 2;
                const distance = 80 + (i % 3) * 30;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                return (
                  <button
                    key={traveler.id}
                    onClick={() => setSelectedTraveler(traveler)}
                    className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 z-10 group"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                    }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        traveler.matched
                          ? 'bg-accent border-accent'
                          : 'bg-primary/30 border-primary'
                      } group-hover:scale-125`}
                    ></div>
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-primary border border-primary"></div>
                <span>Nearby travelers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-accent border border-accent"></div>
                <span>Matched travelers</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            {/* Location Privacy */}
            <div className="card-luxury p-6">
              <h3 className="font-bold text-lg mb-4">Location Privacy</h3>
              {!showLocation && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
                  <p className="text-xs text-primary font-medium">
                    ✓ Your location is hidden until you match
                  </p>
                </div>
              )}
              <button
                onClick={() => setShowLocation(!showLocation)}
                className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-smooth hover:bg-secondary/80"
              >
                {showLocation ? 'Hide Location' : 'Show Location'}
              </button>
            </div>

            {/* Nearby Travelers */}
            <div className="card-luxury p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Nearby ({travelers.length})
              </h3>
              <div className="space-y-2">
                {travelers.map((traveler) => (
                  <button
                    key={traveler.id}
                    onClick={() => setSelectedTraveler(traveler)}
                    className={`w-full p-3 rounded-lg text-left transition-smooth ${
                      selectedTraveler?.id === traveler.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{traveler.name}</p>
                        <p className="text-xs text-muted-foreground">{traveler.distance}</p>
                      </div>
                      {traveler.matched && (
                        <span className="text-xs font-bold text-accent">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Traveler */}
            {selectedTraveler && (
              <div className="card-luxury p-6">
                <h4 className="font-bold text-lg mb-1">{selectedTraveler.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">{selectedTraveler.distance} away</p>
                {selectedTraveler.matched ? (
                  <button className="w-full py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
                    View Profile
                  </button>
                ) : (
                  <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
                    Request to Connect
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
