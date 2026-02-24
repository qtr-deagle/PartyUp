import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Calendar, Users, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

interface Trip {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  buddiesNeeded: number;
  currentBuddies: number;
  status: 'active' | 'upcoming' | 'completed';
  interests: string[];
}

/**
 * PartyUp My Trips Page
 * 
 * Design: Minimalist Luxury
 * - Display user's travel plans
 * - Create new trip
 * - Edit existing trips
 * - View matched buddies for each trip
 */
export default function MyTrips() {
  const [trips] = useState<Trip[]>([
    {
      id: 1,
      destination: 'Barcelona, Spain',
      startDate: 'Feb 10, 2026',
      endDate: 'Feb 20, 2026',
      buddiesNeeded: 2,
      currentBuddies: 1,
      status: 'active',
      interests: ['Museums', 'Food tours', 'Nightlife'],
    },
    {
      id: 2,
      destination: 'Paris, France',
      startDate: 'Mar 15, 2026',
      endDate: 'Mar 25, 2026',
      buddiesNeeded: 1,
      currentBuddies: 0,
      status: 'upcoming',
      interests: ['Art', 'Architecture', 'Cafes'],
    },
    {
      id: 3,
      destination: 'Tokyo, Japan',
      startDate: 'Apr 5, 2026',
      endDate: 'Apr 20, 2026',
      buddiesNeeded: 2,
      currentBuddies: 2,
      status: 'upcoming',
      interests: ['Culture', 'Food', 'Technology'],
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent/10 text-accent';
      case 'upcoming':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Layout>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">My Trips</h1>
        <button className="p-2 rounded-lg hover:bg-secondary transition-smooth bg-primary text-primary-foreground">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 bg-card border-b border-border z-30">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Trips</h1>
            <p className="text-sm text-muted-foreground mt-2">Manage your travel plans and find buddies</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-smooth">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">New Trip</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="card-luxury p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{trip.destination}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trip.startDate} - {trip.endDate}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(trip.status)}`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{trip.startDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span>{trip.currentBuddies} of {trip.buddiesNeeded} buddies</span>
                </div>
              </div>

              {/* Interests */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {trip.interests.map((interest, i) => (
                    <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary">
                  <Edit2 className="w-4 h-4 mx-auto" />
                </button>
                <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 gap-8">
          {trips.map((trip) => (
            <div key={trip.id} className="card-luxury p-8">
              <div className="grid grid-cols-4 gap-8 items-start">
                {/* Trip Info */}
                <div className="col-span-2">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{trip.destination}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(trip.status)}`}>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trip.startDate} - {trip.endDate}
                      </p>
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.interests.map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="col-span-1">
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Destination</p>
                      <p className="font-bold text-lg">{trip.destination}</p>
                    </div>
                    <div className="p-4 bg-accent/5 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Duration</p>
                      <p className="font-bold">{trip.startDate}</p>
                    </div>
                  </div>
                </div>

                {/* Buddies Progress */}
                <div className="col-span-1">
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-2">Buddies Found</p>
                    <p className="text-3xl font-bold text-primary mb-2">
                      {trip.currentBuddies}/{trip.buddiesNeeded}
                    </p>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{
                          width: `${(trip.currentBuddies / trip.buddiesNeeded) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary">
                      <Edit2 className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary">
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
