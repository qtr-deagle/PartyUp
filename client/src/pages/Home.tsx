import React from 'react';
import Layout from '@/components/Layout';
import { MapPin, Star, MapPinCheck, Users, Calendar, Activity, Shield } from 'lucide-react';
import Weather from '@/components/Weather';

export default function Home() {
  const upcomingRides = [
    { id: 1, type: 'travel-buddy', destination: 'Boracay', date: 'Mar 15', travelers: 2, status: 'confirmed', compatibility: 92 },
    { id: 2, type: 'carpool', destination: 'Tagaytay', date: 'Mar 20', travelers: 3, status: 'pending', compatibility: 88 },
  ];

  const nearbyMatches = [
    { id: 1, name: 'Sarah', age: 24, destination: 'Boracay', distance: 2.3, compatibility: 92 },
    { id: 2, name: 'Mike', age: 26, destination: 'Tagaytay', distance: 1.8, compatibility: 88 },
  ];

  return (
    <Layout>
      {/* Mobile View */}
      <div className="md:hidden bg-background dark:bg-background min-h-screen">
        {/* Header Section */}
        <div className="relative p-4 bg-card dark:bg-card border-b border-border">
          {/* Greeting */}
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Let's find your next travel buddy</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Active Pairing Status */}
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
                <span className="text-sm font-semibold text-accent">Active Pairing</span>
              </div>
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs text-accent-foreground">You're matched with Sarah for Boracay trip</p>
          </div>

          {/* Geofence Status */}
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-primary">Geofence Status</span>
              <MapPinCheck className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-primary/70 mb-3">Within 5km safe zone - Makati CBD</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-primary/20 rounded-full h-1">
                <div className="bg-primary h-full rounded-full w-3/4"></div>
              </div>
              <span className="text-xs font-semibold text-primary">75%</span>
            </div>
          </div>

          {/* Upcoming Rides */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Upcoming Rides
              </h2>
              <a href="/my-trips" className="text-xs text-primary hover:text-primary/80 font-semibold">View all</a>
            </div>

            <div className="space-y-3">
              {upcomingRides.map((ride) => (
                <div key={ride.id} className="p-4 bg-card dark:bg-card border border-border rounded-xl hover:border-primary dark:hover:border-primary transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{ride.destination}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          ride.status === 'confirmed'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {ride.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {ride.date}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">{ride.compatibility}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" /> {ride.travelers} travelers
                  </div>
                </div>
              ))})
            </div>
          </div>

          {/* Nearby Matches Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" /> Nearby Matches
              </h2>
              <a href="/match" className="text-xs text-primary hover:text-primary/80 font-semibold">Discover more</a>
            </div>

            <div className="space-y-2">
              {nearbyMatches.map((match) => (
                <div key={match.id} className="p-3 bg-card dark:bg-card border border-border rounded-lg hover:border-primary dark:hover:border-primary transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-foreground">{match.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{match.name}, {match.age}</p>
                      <p className="text-xs text-muted-foreground">{match.destination} • {match.distance.toFixed(1)}km</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">{match.compatibility}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-background dark:bg-background min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Your travel safety dashboard</p>
          </div>

          {/* Top Row - Safety & Status */}

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Upcoming Rides */}
            <div className="p-6 bg-card dark:bg-card border border-border rounded-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Rides</h2>
              <div className="space-y-4">
                {upcomingRides.map((ride) => (
                  <div key={ride.id} className="p-4 bg-secondary dark:bg-secondary border border-border rounded-xl hover:border-primary dark:hover:border-primary transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{ride.destination}</h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {ride.date} • {ride.travelers} travelers
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ride.status === 'confirmed'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {ride.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Compatibility</span>
                      <div className="flex items-center gap-2 flex-1 ml-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${ride.compatibility}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-primary">{ride.compatibility}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all font-semibold">
                View All Trips
              </button>
            </div>

            {/* Nearby Matches */}
            <div className="p-6 bg-card dark:bg-card border border-border rounded-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Nearby Matches</h2>
              <div className="space-y-3">
                {nearbyMatches.map((match) => (
                  <div key={match.id} className="p-4 bg-secondary dark:bg-secondary border border-border rounded-xl hover:border-primary dark:hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary-foreground">{match.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{match.name}, {match.age}</p>
                        <p className="text-sm text-muted-foreground">{match.destination} • {match.distance.toFixed(1)}km</p>
                      </div>
                      <span className="text-lg font-bold text-primary">{match.compatibility}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all font-semibold">
                Discover More
              </button>
            </div>
          </div>

          {/* Geofence & Security Info */}
          <div className="p-6 bg-primary/10 dark:bg-primary/10 border border-primary/30 dark:border-primary/30 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPinCheck className="w-6 h-6 text-primary" /> Geofence Status
              </h2>
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Zone</p>
                <p className="text-lg font-bold text-foreground">Makati CBD</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Safety Level</p>
                <span className="text-lg font-bold text-accent">✓ Safe</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Distance from Center</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-primary/20 rounded-full h-2">
                    <div className="bg-primary h-full rounded-full w-3/4"></div>
                  </div>
                  <span className="text-sm font-bold text-primary">3.5 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
