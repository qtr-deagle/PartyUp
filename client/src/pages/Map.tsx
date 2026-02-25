import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Navigation, AlertTriangle, Phone, AlertCircle, ZoomIn, ZoomOut, Home, Heart, Shield } from 'lucide-react';

interface NearbyBuddy {
  id: number;
  name: string;
  age: number;
  distance: number;
  direction: string;
  verified: boolean;
  matchType: 'travel-buddy' | 'carpool';
}

interface SafeZone {
  id: number;
  name: string;
  type: 'home' | 'office' | 'trusted-location';
  inside: boolean;
}

interface EmergencyService {
  id: number;
  type: 'police' | 'hospital' | 'ambulance';
  name: string;
  distance: string;
}

/**
 * PartyUp Map Screen - Real-time Location Tracking
 * 
 * Design: Safety-First Navigation
 * - Dark gradient with geofence visualization
 * - Real-time location tracking (blue user indicator)
 * - Nearby travel buddies with distance badges
 * - Safe zones (home, office, trusted locations)
 * - Emergency service markers
 */
export default function Map() {
  const [zoom, setZoom] = useState(12);
  const [showGeofence, setShowGeofence] = useState(true);
  const [showEmergency, setShowEmergency] = useState(true);
  const [selectedBuddy, setSelectedBuddy] = useState<NearbyBuddy | null>(null);

  const nearbyBuddies: NearbyBuddy[] = [
    { id: 1, name: 'Sarah', age: 24, distance: 0.8, direction: 'NE', verified: true, matchType: 'travel-buddy' },
    { id: 2, name: 'Mike', age: 26, distance: 1.2, direction: 'SW', verified: true, matchType: 'carpool' },
    { id: 3, name: 'Emma', age: 23, distance: 2.1, direction: 'E', verified: true, matchType: 'travel-buddy' },
  ];

  const safeZones: SafeZone[] = [
    { id: 1, name: 'Home', type: 'home', inside: false },
    { id: 2, name: 'Office', type: 'office', inside: false },
    { id: 3, name: 'BGC Safe Zone', type: 'trusted-location', inside: true },
  ];

  const emergencyServices: EmergencyService[] = [
    { id: 1, type: 'police', name: 'Makati Police Station', distance: '0.6 km' },
    { id: 2, type: 'hospital', name: 'Makati Medical Center', distance: '1.2 km' },
    { id: 3, type: 'ambulance', name: 'Emergency Services', distance: 'On Standby' },
  ];

  const getDirectionDegrees = (direction: string) => {
    const directions: { [key: string]: number } = {
      N: 0, NNE: 23, NE: 45, ENE: 67,
      E: 90, ESE: 113, SE: 135, SSE: 158,
      S: 180, SSW: 203, SW: 225, WSW: 248,
      W: 270, WNW: 293, NW: 315, NNW: 338,
    };
    return directions[direction] || 0;
  };

  return (
    <Layout>
      {/* Mobile View */}
      <div className="md:hidden h-screen bg-background relative overflow-hidden">
        {/* Map Container */}
        <div className="relative w-full h-2/3 bg-card border-b-2 border-border">
          {/* Gradient Map Background */}
          <div className="absolute inset-0 bg-card"></div>

          {/* Geofence Circle */}
          {showGeofence && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Outer Ring (Safe Zone Boundary) */}
              <div className="absolute w-48 h-48 rounded-full border-2 border-primary/30 border-dashed opacity-60"></div>
              {/* Middle Ring */}
              <div className="absolute w-32 h-32 rounded-full border border-primary/20 opacity-40"></div>
              
              {/* User Location (Center) */}
              <div className="absolute w-5 h-5 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>

              {/* User Location Path Trail */}
              <div className="absolute w-16 h-0.5 bg-linear-to-r from-primary to-transparent opacity-50" style={{ transform: 'rotate(-45deg)' }}></div>
            </div>
          )}

          {/* Nearby Buddies on Map */}
          {nearbyBuddies.map((buddy) => {
            const angle = getDirectionDegrees(buddy.direction);
            const radius = buddy.distance * 30; // Scale for visualization
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
            
            return (
              <button
                key={buddy.id}
                onClick={() => setSelectedBuddy(buddy)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/30 border-primary/50 flex items-center justify-center font-bold text-primary text-sm shadow-lg hover:shadow-2xl transition-all hover:scale-110 border-2">
                  {buddy.name[0]}
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded whitespace-nowrap text-xs text-primary opacity-0 group-hover:opacity-100 transition-all border border-primary/20 pointer-events-none">
                  {buddy.distance} km
                </div>
              </button>
            );
          })}

          {/* Emergency Services Markers */}
          {showEmergency && (
            <>
              <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-red-500/30 rounded-full border-2 border-red-500 flex items-center justify-center cursor-pointer hover:bg-red-500/50 transition-all">
                <span className="text-red-400 text-xs font-bold">🚔</span>
              </div>
              <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-red-500/30 rounded-full border-2 border-red-500 flex items-center justify-center cursor-pointer hover:bg-red-500/50 transition-all">
                <span className="text-red-400 text-xs font-bold">🏥</span>
              </div>
            </>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30">
            <button
              onClick={() => setZoom(Math.min(20, zoom + 1))}
              className="p-2 bg-black/60 backdrop-blur-sm border border-primary/30 rounded-full hover:bg-black/80 transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              <ZoomIn className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={() => setZoom(Math.max(5, zoom - 1))}
              className="p-2 bg-black/60 backdrop-blur-sm border border-primary/30 rounded-full hover:bg-black/80 transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              <ZoomOut className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={() => setShowGeofence(!showGeofence)}
              className={`p-2 rounded-full transition-all backdrop-blur-sm border ${
                showGeofence
                  ? 'bg-primary/20 border-primary/50'
                  : 'bg-black/60 border-primary/30'
              }`}
            >
              <Shield className={`w-4 h-4 ${showGeofence ? 'text-primary' : 'text-muted-foreground'}`} />
            </button>
          </div>

          {/* Current Location Button */}
          <button className="absolute top-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all z-30 hover:bg-primary/90">
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Panel - Nearby Buddies */}
        <div className="h-1/3 overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-card backdrop-blur-sm border-b border-border p-4 z-20">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Nearby Matches {nearbyBuddies.length}
            </h3>
          </div>

          {/* Buddies List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {nearbyBuddies.map((buddy) => (
              <button
                key={buddy.id}
                onClick={() => setSelectedBuddy(buddy)}
                className={`w-full p-3 rounded-xl border transition-all text-left ${
                  selectedBuddy?.id === buddy.id
                    ? 'bg-primary/20 border-primary/50'
                    : 'bg-secondary/40 border-border hover:border-primary/40 hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/30 border-primary/50 flex items-center justify-center font-bold text-primary text-sm shrink-0 border-2">
                      {buddy.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm text-foreground">{buddy.name}, {buddy.age}</p>
                        {buddy.verified && <span className="text-accent text-xs">✓</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{buddy.distance} km • {buddy.direction}</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-semibold shrink-0">
                    {buddy.matchType === 'travel-buddy' ? '🤝' : '🚗'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Buddy Actions */}
          {selectedBuddy && (
            <div className="p-4 border-t border-border bg-black/50 backdrop-blur-sm space-y-2">
              <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                View Profile & Match
              </button>
              <button className="w-full py-2.5 bg-secondary/60 border border-border text-primary rounded-lg font-semibold hover:bg-secondary/80 transition-all text-sm flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex h-screen bg-background">
        {/* Map - Left Side */}
        <div className="flex-1 relative bg-card border-r-2 border-border overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 bg-card"></div>

          {/* Geofence Visualization */}
          {showGeofence && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Outer Safety Ring */}
              <div className="absolute w-96 h-96 rounded-full border-4 border-primary/25 opacity-70 shadow-lg shadow-primary/10"></div>
              {/* Safe Zone Inner Ring */}
              <div className="absolute w-72 h-72 rounded-full border-2 border-primary/35 opacity-50"></div>
              {/* Warning Zone */}
              <div className="absolute w-48 h-48 rounded-full border-2 border-yellow-400/20 opacity-40"></div>

              {/* User Location (Heart) */}
              <div className="absolute w-6 h-6 rounded-full bg-linear-to-b from-primary to-primary shadow-2xl shadow-primary/80 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          )}

          {/* Nearby Buddy Markers */}
          {nearbyBuddies.map((buddy) => {
            const angle = getDirectionDegrees(buddy.direction);
            const radius = buddy.distance * 60; // Scale for desktop
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;

            return (
              <button
                key={buddy.id}
                onClick={() => setSelectedBuddy(buddy)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 transition-all hover:scale-125"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/30 border-primary/50 flex items-center justify-center font-bold text-primary shadow-xl hover:shadow-2xl border-2 transition-all">
                  {buddy.name[0]}
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-sm px-3 py-1 rounded-lg whitespace-nowrap text-xs text-primary border border-primary/30 pointer-events-none font-semibold">
                  {buddy.name} • {buddy.distance} km
                </div>
              </button>
            );
          })}

          {/* Emergency Services */}
          {showEmergency && (
            <>
              <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-red-500/40 rounded-full border-2 border-red-500 flex items-center justify-center cursor-pointer hover:bg-red-500/60 transition-all shadow-lg">
                <span className="text-red-300 text-lg">🚔</span>
              </div>
              <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-red-500/40 rounded-full border-2 border-red-500 flex items-center justify-center cursor-pointer hover:bg-red-500/60 transition-all shadow-lg">
                <span className="text-red-300 text-lg">🏥</span>
              </div>
            </>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-30">
            <button
              onClick={() => setZoom(Math.min(20, zoom + 1))}
              className="p-3 bg-black/70 backdrop-blur-sm border border-primary/40 rounded-lg hover:bg-black/90 transition-all hover:shadow-lg hover:shadow-primary/30 font-bold text-primary"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(Math.max(5, zoom - 1))}
              className="p-3 bg-black/70 backdrop-blur-sm border border-primary/40 rounded-lg hover:bg-black/90 transition-all hover:shadow-lg hover:shadow-primary/30 font-bold text-primary"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <div className="h-px bg-primary/20"></div>
            <button
              onClick={() => setShowGeofence(!showGeofence)}
              className={`p-3 rounded-lg transition-all backdrop-blur-sm border font-bold ${
                showGeofence
                  ? 'bg-primary/30 border-primary/60 text-primary'
                  : 'bg-black/70 border-primary/40 text-muted-foreground'
              }`}
            >
              <Shield className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowEmergency(!showEmergency)}
              className={`p-3 rounded-lg transition-all backdrop-blur-sm border font-bold ${
                showEmergency
                  ? 'bg-destructive/30 border-destructive/60 text-destructive'
                  : 'bg-black/70 border-destructive/40 text-muted-foreground'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </div>

          {/* Current Location Button */}
          <button className="absolute top-6 right-6 p-3 bg-primary rounded-lg shadow-xl hover:shadow-2xl hover:shadow-primary/60 transition-all text-primary-foreground font-bold z-30">
            <Navigation className="w-6 h-6" />
          </button>

          {/* Zoom Level Display */}
          <div className="absolute bottom-24 left-6 px-4 py-2 bg-black/70 backdrop-blur-sm border border-primary/30 rounded-lg text-primary text-sm font-bold">
            Zoom: {zoom}x
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-card/40 backdrop-blur-sm border-l border-border flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold bg-linear-to-r from-primary to-primary bg-clip-text text-transparent mb-1">Your Location</h2>
            <p className="text-xs text-muted-foreground">Makati CBD, Metro Manila</p>
          </div>

          {/* Location Status */}
          <div className="p-4 bg-primary/10 border-b border-border space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm text-primary font-medium">📍 Live Location Sharing</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Geofence Status</span>
              <span className="px-2 py-1 bg-accent/20 text-accent rounded font-semibold">INSIDE</span>
            </div>
          </div>

          {/* Safe Zones Section */}
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" />
              Safe Zones
            </h3>
            <div className="space-y-2">
              {safeZones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-2.5 rounded-lg border transition-all ${
                    zone.inside
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-secondary/30 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{zone.name}</span>
                    {zone.inside && (
                      <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded font-bold">
                        ✓ Safe
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Matches Section */}
          <div className="p-4 border-b border-border flex-1 overflow-y-auto">
            <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Nearby Matches
            </h3>
            <div className="space-y-2">
              {nearbyBuddies.map((buddy) => (
                <button
                  key={buddy.id}
                  onClick={() => setSelectedBuddy(buddy)}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    selectedBuddy?.id === buddy.id
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-secondary/40 border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/30 border-primary/50 flex items-center justify-center font-bold text-primary text-sm shrink-0 border-2">
                      {buddy.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <p className="font-semibold text-xs text-foreground">{buddy.name}, {buddy.age}</p>
                        {buddy.verified && <span className="text-accent text-xs">✓</span>}
                      </div>
                      <p className="text-xs text-primary font-medium mb-1">{buddy.distance} km • {buddy.direction}</p>
                      <span className="inline-block px-1.5 py-0.5 bg-primary/15 text-primary text-xs rounded border border-primary/20">
                        {buddy.matchType === 'travel-buddy' ? 'Travel Buddy' : 'Carpool'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Services */}
          <div className="p-4 border-t border-border bg-destructive/5">
            <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              Emergency Services
            </h3>
            <div className="space-y-2">
              {emergencyServices.map((service) => (
                <div key={service.id} className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs font-semibold text-foreground mb-1">{service.name}</p>
                  <p className="text-xs text-destructive">{service.distance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {selectedBuddy && (
            <div className="p-4 border-t border-border space-y-2">
              <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all text-sm">
                View Profile
              </button>
              <button className="w-full py-2 bg-secondary/60 border border-border text-primary rounded-lg font-semibold hover:bg-secondary/80 transition-all text-sm flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
