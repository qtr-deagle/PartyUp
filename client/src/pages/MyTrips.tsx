import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Link } from 'wouter';
import { MapPin, Calendar, Users, Plus, Edit2, Trash2, CheckCircle, X, Map, Phone, MessageCircle, AlertCircle, Clock, Gauge, Star, History } from 'lucide-react';

interface Trip {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  buddiesNeeded: number;
  currentBuddies: number;
  status: 'active' | 'upcoming' | 'completed';
  interests: string[];
  type: 'carpool' | 'tour';
  pricePerPerson: number;
  pickupLocation?: string;
  eta?: string;
  distance?: string;
  driver?: {
    name: string;
    rating: number;
    verified: boolean;
    avatar: string;
  };
  vehicle?: string;
  passengers?: {
    current: number;
    max: number;
    list: { name: string; avatar: string }[];
  };
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
  const [activeTab, setActiveTab] = useState<'carpool' | 'tours'>('carpool');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [trips] = useState<Trip[]>([
    {
      id: 1,
      destination: 'Makati → Laguna',
      pickupLocation: 'Makati',
      startDate: 'Feb 10, 2026',
      endDate: 'Feb 10, 2026',
      buddiesNeeded: 7,
      currentBuddies: 7,
      status: 'active',
      interests: ['Commute', 'Budget Travel', 'Scenic Route'],
      type: 'carpool',
      pricePerPerson: 360,
      eta: '45 mins',
      distance: '60 km',
      driver: {
        name: 'John Reyes',
        rating: 4.8,
        verified: true,
        avatar: 'J',
      },
      vehicle: 'Honda Civic: LFB 4321',
      passengers: {
        current: 7,
        max: 7,
        list: [{ name: 'Maria Santos', avatar: 'M' }],
      },
    },
    {
      id: 2,
      destination: 'Manila City Tour',
      pickupLocation: 'Manila Hotel',
      startDate: 'Mar 15, 2026',
      endDate: 'Mar 20, 2026',
      buddiesNeeded: 20,
      currentBuddies: 8,
      status: 'upcoming',
      interests: ['History', 'Culture', 'Food Tours'],
      type: 'tour',
      pricePerPerson: 1800,
      eta: '30 mins',
      distance: '50 km',
      driver: {
        name: 'Carlos Diaz',
        rating: 4.9,
        verified: true,
        avatar: 'C',
      },
      vehicle: 'Toyota Hiace: ABC 5678',
      passengers: {
        current: 8,
        max: 20,
        list: [
          { name: 'Rosa Garcia', avatar: 'R' },
          { name: 'Miguel Lopez', avatar: 'M' },
        ],
      },
    },
    {
      id: 3,
      destination: 'Quezon City → Cavite',
      pickupLocation: 'Quezon City',
      startDate: 'Apr 5, 2026',
      endDate: 'Apr 5, 2026',
      buddiesNeeded: 7,
      currentBuddies: 7,
      status: 'active',
      interests: ['Commute', 'Cost-Sharing', 'Weekend Trip'],
      type: 'carpool',
      pricePerPerson: 280,
      eta: '35 mins',
      distance: '40 km',
      driver: {
        name: 'Sarah Wilson',
        rating: 4.9,
        verified: true,
        avatar: 'S',
      },
      vehicle: 'Toyota Fortuner: DEF 1234',
      passengers: {
        current: 7,
        max: 7,
        list: [
          { name: 'John Smith', avatar: 'J' },
          { name: 'Lisa Chen', avatar: 'L' },
        ],
      },
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'carpool':
        return 'bg-blue-500/10 text-blue-600';
      case 'tour':
        return 'bg-purple-500/10 text-purple-600';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleEditTrip = (tripId: number) => {
    console.log('Edit trip:', tripId);
  };

  const handleDeleteTrip = (tripId: number) => {
    console.log('Delete trip:', tripId);
  };

  const closeModal = () => {
    setSelectedTrip(null);
  };

  // Filter trips based on active tab
  const filteredTrips = trips.filter(trip => trip.type === activeTab);

  return (
    <Layout>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">My Trips</h1>
        <button
          onClick={() => setCreateMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary transition-smooth bg-primary text-primary-foreground"
        >
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
          <button
            onClick={() => setCreateMenuOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-smooth"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Create</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-16 md:top-28 z-20 bg-card border-b border-border">
        <div className="p-4 md:px-8 flex gap-4">
          <button
            onClick={() => setActiveTab('carpool')}
            className={`px-6 py-2 font-medium text-sm rounded-lg transition-smooth ${
              activeTab === 'carpool'
                ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🚗 Carpool
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-6 py-2 font-medium text-sm rounded-lg transition-smooth ${
              activeTab === 'tours'
                ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ✈️ Tours
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Empty State */}
        {filteredTrips.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{activeTab === 'carpool' ? '🚗' : '✈️'}</div>
            <h3 className="text-lg font-bold text-foreground mb-2">No {activeTab} trips yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {activeTab === 'carpool'
                ? 'Create a carpool ride or join an existing one to get started'
                : 'Join a tour or create one to get started'}
            </p>
            <button
              onClick={() => setCreateMenuOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-smooth"
            >
              <Plus className="w-4 h-4" />
              <span>Create {activeTab === 'carpool' ? 'Carpool' : 'Tour'}</span>
            </button>
          </div>
        )}

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="card-luxury p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{trip.destination}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trip.startDate} - {trip.endDate}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(trip.status)}`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(trip.type)}`}>
                    {trip.type.charAt(0).toUpperCase() + trip.type.slice(1)}
                  </span>
                </div>
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
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-primary">₱</span>
                  <span>{trip.pricePerPerson} per person</span>
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
                <button 
                  onClick={() => handleEditTrip(trip.id)}
                  className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary">
                  <Edit2 className="w-4 h-4 mx-auto" />
                </button>
                <button 
                  onClick={() => handleViewDetails(trip)}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 gap-8">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="card-luxury p-8">
              <div className="grid grid-cols-4 gap-8 items-start">
                {/* Trip Info */}
                <div className="col-span-2">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-2xl font-bold">{trip.destination}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(trip.status)}`}>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(trip.type)}`}>
                          {trip.type.charAt(0).toUpperCase() + trip.type.slice(1)}
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
                    <div className="p-4 bg-green-500/5 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Your Contribution</p>
                      <p className="font-bold text-lg text-green-600">₱{trip.pricePerPerson}</p>
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
                  <div className="flex gap-2 mt-4 flex-col">
                    <button 
                      onClick={() => handleViewDetails(trip)}
                      className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
                      View Details
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditTrip(trip.id)}
                        className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary">
                        <Edit2 className="w-4 h-4 mx-auto" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary">
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end md:items-center justify-center p-4">
          {/* Modal */}
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto md:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-bold text-foreground">Trip Details</h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-secondary rounded-lg transition-smooth"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Location Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pick-up</p>
                    <p className="font-semibold text-foreground">{selectedTrip.pickupLocation || selectedTrip.destination}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="font-semibold text-foreground">{selectedTrip.destination}</p>
                  </div>
                </div>
              </div>

              {/* Trip Metrics */}
              {selectedTrip.eta && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <p className="text-xs text-muted-foreground">ETA</p>
                    </div>
                    <p className="font-bold text-foreground">🟢 {selectedTrip.eta}</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Gauge className="w-4 h-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Distance</p>
                    </div>
                    <p className="font-bold text-foreground">{selectedTrip.distance}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="font-bold text-green-600">₱{selectedTrip.pricePerPerson}</p>
                  </div>
                </div>
              )}

              {/* Driver Info */}
              {selectedTrip.driver && (
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground mb-3">Driver</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {selectedTrip.driver.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{selectedTrip.driver.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold">{selectedTrip.driver.rating}</span>
                        {selectedTrip.driver.verified && (
                          <span className="text-xs text-green-600 font-semibold">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Info */}
              {selectedTrip.vehicle && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Vehicle</p>
                  <p className="text-sm font-semibold text-foreground">🚗 {selectedTrip.vehicle}</p>
                </div>
              )}

              {/* Price Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Your Share</p>
                  <p className="text-lg font-bold text-green-600">₱{selectedTrip.pricePerPerson}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Trip Type</p>
                  <p className="text-lg font-bold text-blue-600">{selectedTrip.type === 'carpool' ? '🚗 Carpool' : '✈️ Tour'}</p>
                </div>
              </div>

              {/* Passengers */}
              {selectedTrip.passengers && (
                <div>
                  <p className="text-xs text-muted-foreground mb-3">PASSENGERS ({selectedTrip.passengers.current}/{selectedTrip.passengers.max})</p>
                  <div className="space-y-2">
                    {selectedTrip.passengers.list.map((passenger, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-secondary rounded">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {passenger.avatar}
                        </div>
                        <span className="text-sm font-medium text-foreground">{passenger.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Action */}
              <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-md transition-smooth">
                <Map className="w-5 h-5" />
                View Live Map
              </button>

              {/* Action Buttons */}
              <div className="flex justify-around pt-4 border-t border-border">
                <button className="flex flex-col items-center gap-2 p-3 hover:bg-secondary rounded-lg transition-smooth flex-1">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Call</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 hover:bg-secondary rounded-lg transition-smooth flex-1">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Message</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 hover:bg-secondary rounded-lg transition-smooth flex-1">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-xs text-muted-foreground">Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Trip Menu Modal */}
      {createMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setCreateMenuOpen(false)} />
          <div className="relative w-full md:max-w-sm bg-card rounded-t-3xl md:rounded-2xl shadow-2xl p-6 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Create</h3>
              <button
                onClick={() => setCreateMenuOpen(false)}
                className="p-1 hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Link href="/post-ride" asChild>
              <button
                onClick={() => setCreateMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 text-left cursor-pointer bg-accent hover:bg-accent/80 text-foreground font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create Carpool</span>
              </button>
            </Link>

            <Link href="/tours/create" asChild>
              <button
                onClick={() => setCreateMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 text-left cursor-pointer bg-accent hover:bg-accent/80 text-foreground font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create Tour</span>
              </button>
            </Link>

            <Link href="/my-participated-tours" asChild>
              <button
                onClick={() => setCreateMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth border-0 text-left cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground font-medium"
              >
                <History className="w-5 h-5" />
                <span>History</span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </Layout>
  );
}
