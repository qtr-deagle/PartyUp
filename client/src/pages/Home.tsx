import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Star, MapPinCheck, Users, Calendar, Activity, Shield, Navigation, Share2, AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Weather from '@/components/Weather';

export default function Home() {
  // Active ride (only if user has a trip today/ongoing)
  const activeRide = {
    id: 1,
    destination: 'Boracay',
    pickupTime: '2:15h',
    status: 'confirmed',
    buddy: 'Sarah',
    traffic: 'Moderate',
    compatibilityScore: 92,
  };

  // Safety data
  const safetyData = {
    geofenceStatus: 'Within 5km safe zone',
    location: 'Makati CBD',
    distanceToBuddy: 2.3,
    trustScore: 92,
    verified: true,
    progressPercent: 75,
  };

  // Notifications/Activity feed
  const notifications = [
    { id: 1, type: 'match', message: 'Sarah accepted your request', time: '2 min ago', icon: CheckCircle },
    { id: 2, type: 'update', message: 'Mike updated pickup time to 2:00 PM', time: '15 min ago', icon: Clock },
    { id: 3, type: 'alert', message: 'Route adjusted due to traffic', time: '1 hour ago', icon: AlertTriangle },
  ];

  return (
    <Layout>
      {/* Mobile View */}
      <div className="md:hidden bg-background dark:bg-background min-h-screen">
        {/* Header Section */}
        <div className="relative p-4 bg-card dark:bg-card border-b border-border">
          <h1 className="text-2xl font-bold text-foreground mb-1">What's happening now</h1>
          <p className="text-sm text-muted-foreground">Your live dashboard</p>
        </div>

        <div className="p-4 space-y-4">
          {/* SECTION 1: Active Ride Status - Only shows if ongoing */}
          {activeRide ? (
            <div className="p-4 bg-linear-to-br from-primary/15 to-primary/5 border-2 border-primary rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
                  <span className="text-sm font-bold text-primary">Active Trip</span>
                </div>
                <Navigation className="w-5 h-5 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-1">{activeRide.destination}</h2>
              <p className="text-sm text-muted-foreground mb-3">With {activeRide.buddy}</p>

              {/* Key Info Row */}
              <div className="space-y-2 mb-4 p-3 bg-white/50 dark:bg-black/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pickup in</span>
                  <span className="text-lg font-bold text-foreground">{activeRide.pickupTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Live Traffic</span>
                  <span className="text-sm font-semibold text-yellow-600">{activeRide.traffic}</span>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2 px-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-1">
                  <Navigation className="w-4 h-4" /> Start Trip
                </button>
                <button className="py-2 px-3 bg-secondary text-foreground rounded-lg font-semibold text-sm hover:bg-secondary/80 transition-all flex items-center justify-center gap-1">
                  <Share2 className="w-4 h-4" /> Share Location
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 border border-border rounded-2xl text-center">
              <p className="text-muted-foreground mb-2">No active rides today</p>
              <a href="/discovery" className="text-primary font-semibold text-sm hover:underline">Find a travel buddy →</a>
            </div>
          )}

          {/* SECTION 2: Safety Overview */}
          <div className="p-4 bg-linear-to-br from-accent/15 to-accent/5 border-2 border-accent rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" /> Safety Overview
              </h3>
            </div>

            <div className="space-y-3">
              {/* Geofence Status */}
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Geofence Status</p>
                <p className="text-sm font-semibold text-foreground">{safetyData.geofenceStatus}</p>
                <p className="text-xs text-muted-foreground">{safetyData.location}</p>
              </div>

              {/* Distance from Buddy */}
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Distance from Travel Buddy</p>
                <p className="text-sm font-semibold text-foreground">{safetyData.distanceToBuddy} km</p>
              </div>

              {/* Trust Score */}
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Trust Score</p>
                  {safetyData.verified && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded font-semibold">✓ Verified</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div className="bg-accent h-full rounded-full" style={{ width: `${safetyData.trustScore}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-accent">{safetyData.trustScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Notifications Feed */}
          <div>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" /> Activity Feed
            </h3>
            <div className="space-y-2">
              {notifications.map((notif) => {
                const IconComponent = notif.icon;
                return (
                  <div key={notif.id} className="p-3 bg-card dark:bg-card border border-border rounded-lg hover:border-primary/50 transition-all">
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a href="/discovery" className="p-3 bg-secondary dark:bg-secondary border border-border rounded-lg text-center hover:border-primary transition-all">
              <p className="text-sm font-semibold text-foreground">Find Nearby</p>
            </a>
            <button className="p-3 bg-red-500/20 dark:bg-red-500/20 border-2 border-red-500/50 rounded-lg text-center hover:bg-red-500/30 transition-all">
              <p className="text-sm font-bold text-red-600">🚨 SOS</p>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-background dark:bg-background min-h-screen p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              What's happening now
            </h1>
            <p className="text-lg text-muted-foreground">Your live control panel</p>
          </div>

          {/* Main Layout - Priority Order */}
          <div className="space-y-6">
            {/* SECTION 1: Active Ride Status - TOP PRIORITY */}
            {activeRide ? (
              <div className="p-8 bg-linear-to-br from-primary/15 to-primary/5 border-2 border-primary rounded-3xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-4 h-4 rounded-full bg-accent animate-pulse"></div>
                      <span className="text-sm font-bold text-primary uppercase tracking-wide">Live Trip in Progress</span>
                    </div>
                    <h2 className="text-5xl font-bold text-foreground mb-2">{activeRide.destination}</h2>
                    <p className="text-lg text-muted-foreground">Traveling with {activeRide.buddy}</p>
                  </div>
                  <Navigation className="w-12 h-12 text-primary" />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-white/50 dark:bg-black/30 rounded-2xl">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Pickup in</p>
                    <p className="text-3xl font-bold text-foreground">{activeRide.pickupTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Live Traffic</p>
                    <p className="text-xl font-bold text-yellow-600">{activeRide.traffic} 🚗</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Compatibility</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${activeRide.compatibilityScore}%` }}></div>
                      </div>
                      <p className="text-xl font-bold text-primary">{activeRide.compatibilityScore}%</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-4">
                  <button className="py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5" /> Start Trip
                  </button>
                  <button className="py-3 px-4 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" /> Share Location
                  </button>
                  <button className="py-3 px-4 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" /> Contact Buddy
                  </button>
                  <button className="py-3 px-4 bg-red-500/20 border-2 border-red-500/50 text-red-600 rounded-xl font-bold hover:bg-red-500/30 transition-all">
                    🚨 Emergency SOS
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-muted/50 border-2 border-dashed border-border rounded-2xl text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg text-muted-foreground mb-4">No active trips right now</p>
                <a href="/discovery" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
                  Find a Travel Buddy
                </a>
              </div>
            )}

            {/* SECTION 2 & 3: Safety & Notifications Side by Side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Safety Overview */}
              <div className="p-8 bg-linear-to-br from-accent/15 to-accent/5 border-2 border-accent rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-6 h-6 text-accent" /> Safety Overview
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Geofence */}
                  <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-2">📍 Geofence Status</p>
                    <p className="text-lg font-boldtext-foreground mb-1">{safetyData.geofenceStatus}</p>
                    <p className="text-sm text-muted-foreground">{safetyData.location}</p>
                  </div>

                  {/* Distance from Buddy */}
                  <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-2">👥 Distance from Buddy</p>
                    <p className="text-2xl font-bold text-foreground">{safetyData.distanceToBuddy} km away</p>
                  </div>

                  {/* Trust Score */}
                  <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">⭐ Trust Score</p>
                      {safetyData.verified && (
                        <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full font-bold">✓ Verified</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${safetyData.trustScore}%` }}></div>
                      </div>
                      <p className="text-xl font-bold text-accent">{safetyData.trustScore}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="p-8 bg-card dark:bg-card border border-border rounded-2xl">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-muted-foreground" /> Activity Feed
                </h3>

                <div className="space-y-3">
                  {notifications.map((notif) => {
                    const IconComponent = notif.icon;
                    return (
                      <div key={notif.id} className="p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-all">
                        <div className="flex items-start gap-3">
                          <IconComponent className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-6">
              <a href="/discovery" className="p-6 bg-secondary dark:bg-secondary border border-border rounded-xl text-center hover:border-primary transition-all group">
                <p className="text-lg font-bold text-foreground group-hover:text-primary transition-all">Find Nearby Travelers</p>
                <p className="text-sm text-muted-foreground mt-1">Browse available connections</p>
              </a>
              <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-center cursor-pointer hover:bg-red-500/20 transition-all">
                <p className="text-lg font-bold text-red-600">🚨 Emergency SOS</p>
                <p className="text-sm text-red-500 mt-1">Alert trusted circle</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
