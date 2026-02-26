import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Eye, EyeOff, Users, Navigation } from 'lucide-react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from '@/contexts/ThemeContext';

// Ensure mapbox-gl is loaded
import mapboxgl from 'mapbox-gl';

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
  const { theme } = useTheme();
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  // Set mapbox access token
  if (mapboxToken) {
    mapboxgl.accessToken = mapboxToken;
  }

  // Use night mode (outdoors-v12) when in dark mode, otherwise use streets
  // Mapbox styles: https://docs.mapbox.com/api/maps/styles/#mapbox-styles
  const mapStyle = theme === 'dark' 
    ? 'mapbox://styles/qtr/cmm07weof003s01r624vi188t'
    : 'mapbox://styles/mapbox/navigation-day-v1';

  const [showLocation, setShowLocation] = useState(false);
  const [travelers] = useState<Traveler[]>([
    { id: 1, name: 'Sarah', distance: '2.3 km', matched: true },
    { id: 2, name: 'Mike', distance: '1.8 km', matched: false },
    { id: 3, name: 'Emma', distance: '3.2 km', matched: true },
    { id: 4, name: 'Alex', distance: '2.8 km', matched: false },
    { id: 5, name: 'Jordan', distance: '4.1 km', matched: false },
  ]);

  const [selectedTraveler, setSelectedTraveler] = useState<Traveler | null>(null);
  
  // Generate random coordinates around user location for demo
  const userLocation = { lng: 121.0244, lat: 14.5547 }; // Manila, Philippines
  const getTravelerLocation = (id: number) => ({
    lng: userLocation.lng + (Math.random() - 0.5) * 0.05,
    lat: userLocation.lat + (Math.random() - 0.5) * 0.05,
  });

  return (
    <Layout>
      <div className="p-4 md:p-8">
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {/* Map Container */}
          <div 
            className="card-luxury h-96 rounded-lg overflow-hidden relative flex"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLocation(!showLocation)}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-background/80 backdrop-blur border border-border"
            >
              {showLocation ? (
                <Eye className="w-4 h-4 text-primary" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <Map
              initialViewState={{
                longitude: userLocation.lng,
                latitude: userLocation.lat,
                zoom: 13,
              }}
              style={{ width: '100%', height: '100%', flex: 1 }}
              mapStyle={mapStyle}
              mapboxAccessToken={mapboxToken}
              attributionControl={false}
            >
              {/* User Location */}
              <Marker
                longitude={userLocation.lng}
                latitude={userLocation.lat}
                anchor="center"
              >
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-primary/30 animate-pulse"></div>
              </Marker>

              {/* Traveler Markers */}
              {travelers.map((traveler) => {
                const location = getTravelerLocation(traveler.id);
                return (
                  <Marker
                    key={traveler.id}
                    longitude={location.lng}
                    latitude={location.lat}
                    anchor="center"
                    onClick={() => setSelectedTraveler(traveler)}
                  >
                    <button className="group focus:outline-none">
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all ${
                          traveler.matched
                            ? 'bg-accent border-accent'
                            : 'bg-primary/30 border-primary'
                        } group-hover:scale-125`}
                      />
                    </button>
                  </Marker>
                );
              })}

              {/* Selected Traveler Popup */}
              {selectedTraveler && (
                <Popup
                  longitude={getTravelerLocation(selectedTraveler.id).lng}
                  latitude={getTravelerLocation(selectedTraveler.id).lat}
                  anchor="bottom"
                  onClose={() => setSelectedTraveler(null)}
                >
                  <div className="p-2 text-sm">
                    <p className="font-medium">{selectedTraveler.name}</p>
                    <p className="text-xs text-gray-600">{selectedTraveler.distance} away</p>
                  </div>
                </Popup>
              )}
            </Map>
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
          <div 
            className="col-span-3 card-luxury h-[70vh] rounded-lg overflow-hidden relative flex"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLocation(!showLocation)}
              className="absolute top-4 right-4 z-10 px-3 py-2 rounded-lg bg-background/90 backdrop-blur border border-border text-sm font-medium"
            >
              {showLocation ? 'Hide Location' : 'Show Location'}
            </button>
            <Map
              initialViewState={{
                longitude: userLocation.lng,
                latitude: userLocation.lat,
                zoom: 13,
              }}
              style={{ width: '100%', height: '100%', flex: 1 }}
              mapStyle={mapStyle}
              mapboxAccessToken={mapboxToken}
              attributionControl={false}
            >
              {/* User Location */}
              <Marker
                longitude={userLocation.lng}
                latitude={userLocation.lat}
                anchor="center"
              >
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-primary/30 animate-pulse"></div>
              </Marker>

              {/* Traveler Markers */}
              {travelers.map((traveler) => {
                const location = getTravelerLocation(traveler.id);
                return (
                  <Marker
                    key={traveler.id}
                    longitude={location.lng}
                    latitude={location.lat}
                    anchor="center"
                    onClick={() => setSelectedTraveler(traveler)}
                  >
                    <button className="group focus:outline-none">
                      <div
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          traveler.matched
                            ? 'bg-accent border-accent'
                            : 'bg-primary/30 border-primary'
                        } group-hover:scale-125`}
                      />
                    </button>
                  </Marker>
                );
              })}

              {/* Selected Traveler Popup */}
              {selectedTraveler && (
                <Popup
                  longitude={getTravelerLocation(selectedTraveler.id).lng}
                  latitude={getTravelerLocation(selectedTraveler.id).lat}
                  anchor="bottom"
                  onClose={() => setSelectedTraveler(null)}
                >
                  <div className="p-2 text-sm">
                    <p className="font-medium">{selectedTraveler.name}</p>
                    <p className="text-xs text-gray-600">{selectedTraveler.distance} away</p>
                  </div>
                </Popup>
              )}
            </Map>
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
