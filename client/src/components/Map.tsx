/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map; // Store to control map from parent anytime, google map itself is in charge of the re-rendering, not react state.
 * </MapView>
 *
 * ======
 * Available Libraries and Core Features:
 * -------------------------------
 * 📍 MARKER (from `marker` library)
 * - Attaches to map using { map, position }
 * new google.maps.marker.AdvancedMarkerElement({
 *   map,
 *   position: { lat: 37.7749, lng: -122.4194 },
 *   title: "San Francisco",
 * });
 *
 * -------------------------------
 * 🏢 PLACES (from `places` library)
 * - Does not attach directly to map; use data with your map manually.
 * const place = new google.maps.places.Place({ id: PLACE_ID });
 * await place.fetchFields({ fields: ["displayName", "location"] });
 * map.setCenter(place.location);
 * new google.maps.marker.AdvancedMarkerElement({ map, position: place.location });
 *
 * -------------------------------
 * 🧭 GEOCODER (from `geocoding` library)
 * - Standalone service; manually apply results to map.
 * const geocoder = new google.maps.Geocoder();
 * geocoder.geocode({ address: "New York" }, (results, status) => {
 *   if (status === "OK" && results[0]) {
 *     map.setCenter(results[0].geometry.location);
 *     new google.maps.marker.AdvancedMarkerElement({
 *       map,
 *       position: results[0].geometry.location,
 *     });
 *   }
 * });
 *
 * -------------------------------
 * 📐 GEOMETRY (from `geometry` library)
 * - Pure utility functions; not attached to map.
 * const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
 *
 * -------------------------------
 * 🛣️ ROUTES (from `routes` library)
 * - Combines DirectionsService (standalone) + DirectionsRenderer (map-attached)
 * const directionsService = new google.maps.DirectionsService();
 * const directionsRenderer = new google.maps.DirectionsRenderer({ map });
 * directionsService.route(
 *   { origin, destination, travelMode: "DRIVING" },
 *   (res, status) => status === "OK" && directionsRenderer.setDirections(res)
 * );
 *
 * -------------------------------
 * 🌦️ MAP LAYERS (attach directly to map)
 * - new google.maps.TrafficLayer().setMap(map);
 * - new google.maps.TransitLayer().setMap(map);
 * - new google.maps.BicyclingLayer().setMap(map);
 *
 * -------------------------------
 * ✅ SUMMARY
 * - “map-attached” → AdvancedMarkerElement, DirectionsRenderer, Layers.
 * - “standalone” → Geocoder, DirectionsService, DistanceMatrixService, ElevationService.
 * - “data-only” → Place, Geometry utilities.
 */

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    mapboxgl?: any;
  }
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoicXRyIiwiYSI6ImNtbHp1dmVsNDAyc3czZnFyaTZoNjg3dzkifQ.LQS0vY_qlC8kYHCVL63QlA';

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 14.5547, lng: 121.0244 }, // Default: Makati, Manila
  initialZoom = 13,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const init = usePersistFn(() => {
    // Wait for mapboxgl to be loaded
    const checkMapbox = setInterval(() => {
      if (!window.mapboxgl) {
        console.log("Waiting for Mapbox GL JS to load...");
        return;
      }
      
      clearInterval(checkMapbox);

      if (!mapContainer.current) {
        console.error("Map container not found");
        return;
      }

      try {
        // Set access token
        window.mapboxgl.accessToken = MAPBOX_TOKEN;
        console.log("Mapbox token set successfully");

        // Initialize map
        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [initialCenter.lng, initialCenter.lat],
          zoom: initialZoom,
          pitch: 0,
          bearing: 0,
          attributionControl: true,
        });

        map.current.on('load', () => {
          console.log("Mapbox map loaded successfully");
        });

        map.current.on('error', (e) => {
          console.error("Mapbox error:", e);
        });

        // Add navigation controls
        map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

        // Add user location control with tracking
        map.current.addControl(
          new window.mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
          }),
          'top-right'
        );

        // Add fullscreen control
        map.current.addControl(new window.mapboxgl.FullscreenControl(), 'top-right');

        // Fire ready callback
        if (onMapReady && map.current) {
          onMapReady(map.current);
        }
      } catch (error) {
        console.error("Error initializing Mapbox:", error);
      }
    }, 100);
  });

  useEffect(() => {
    init();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [init]);

  return (
    <div 
      ref={mapContainer} 
      className={cn("w-full", className)}
      style={{ 
        minHeight: '500px',
        height: '100%',
        position: 'relative'
      }}
    />
  );
}
