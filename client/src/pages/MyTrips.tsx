import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Link } from 'wouter';
import { MapPin, Calendar, Users, Plus, Edit2, Trash2, X, Map, Phone, MessageCircle, AlertCircle, Clock, Gauge, Star, History, Compass, Archive } from 'lucide-react';
import { toast } from 'sonner';

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
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'history'>('ongoing');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'choose' | 'carpool' | 'tour'>('choose');
  const [carpoolForm, setCarpoolForm] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: '1',
    price: '',
    description: '',
    carModel: '',
    carColor: '',
    carPlate: '',
    allowPets: false,
    allowSmoking: false,
    musicPreference: 'any',
  });
  const [tourForm, setTourForm] = useState({
    title: '',
    destination: '',
    date: '',
    duration: '1',
    maxParticipants: '20',
    price: '',
    description: '',
    itinerary: '',
  });
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
    {
      id: 4,
      destination: 'Tagaytay Weekend Escape',
      pickupLocation: 'BGC',
      startDate: 'Jan 12, 2026',
      endDate: 'Jan 13, 2026',
      buddiesNeeded: 5,
      currentBuddies: 5,
      status: 'completed',
      interests: ['Leisure', 'Food Trips', 'Relaxation'],
      type: 'tour',
      pricePerPerson: 2400,
      eta: '1 hr 15 mins',
      distance: '65 km',
      driver: {
        name: 'Elena Cruz',
        rating: 4.9,
        verified: true,
        avatar: 'E',
      },
      vehicle: 'Toyota Hiace: GHI 9012',
      passengers: {
        current: 5,
        max: 5,
        list: [
          { name: 'Nina Patel', avatar: 'N' },
          { name: 'Mark Tan', avatar: 'M' },
        ],
      },
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-600';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusLabel = (status: Trip['status']) => {
    switch (status) {
      case 'active':
        return 'Ongoing';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'History';
      default:
        return status;
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

  const openCreateMenu = () => {
    setCreateMode('choose');
    setCreateMenuOpen(true);
  };

  const closeCreateMenu = () => {
    setCreateMenuOpen(false);
    setCreateMode('choose');
  };

  const updateCarpoolForm = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.currentTarget;
    const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox';
    setCarpoolForm((previous) => ({
      ...previous,
      [target.name]: isCheckbox ? target.checked : target.value,
    }));
  };

  const updateTourForm = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setTourForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateSubmit = () => {
    if (createMode === 'carpool') {
      if (!carpoolForm.from || !carpoolForm.to || !carpoolForm.date || !carpoolForm.time || !carpoolForm.price || !carpoolForm.carModel) {
        toast.error('Please fill in the required carpool fields');
        return;
      }

      toast.success('Carpool draft ready');
      closeCreateMenu();
      return;
    }

    if (!tourForm.title || !tourForm.destination || !tourForm.date || !tourForm.price) {
      toast.error('Please fill in the required travel fields');
      return;
    }

    toast.success('Travel draft ready');
    closeCreateMenu();
  };

  const filteredTrips = trips.filter((trip) => {
    if (activeTab === 'ongoing') {
      return trip.status === 'active';
    }

    if (activeTab === 'upcoming') {
      return trip.status === 'upcoming';
    }

    return trip.status === 'completed';
  });

  const sectionMeta = {
    ongoing: {
      title: 'Ongoing Travels',
      description: 'Trips that are currently active and need your attention.',
      icon: Compass,
    },
    upcoming: {
      title: 'Upcoming Travels',
      description: 'Planned trips coming soon.',
      icon: Calendar,
    },
    history: {
      title: 'Travel History',
      description: 'Completed trips you have already finished.',
      icon: Archive,
    },
  }[activeTab];

  const SectionIcon = sectionMeta.icon;

  return (
    <Layout>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">My Trips</h1>
        <button
          onClick={openCreateMenu}
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
            onClick={openCreateMenu}
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
            onClick={() => setActiveTab('ongoing')}
            className={`px-6 py-2 font-medium text-sm rounded-lg transition-smooth ${
              activeTab === 'ongoing'
                ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 font-medium text-sm rounded-lg transition-smooth ${
              activeTab === 'upcoming'
                ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 font-medium text-sm rounded-lg transition-smooth ${
              activeTab === 'history'
                ? 'bg-muted text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Empty State */}
        {filteredTrips.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">
              {activeTab === 'ongoing' ? '🚗' : activeTab === 'upcoming' ? '🗓️' : '📋'}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No {sectionMeta.title.toLowerCase()} yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {activeTab === 'ongoing'
                ? 'Start or join a trip to see it here when it is active.'
                : activeTab === 'upcoming'
                  ? 'Schedule a trip or join one that is coming up soon.'
                  : 'Completed trips will appear here after they finish.'}
            </p>
            <button
              onClick={openCreateMenu}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-smooth"
            >
              <Plus className="w-4 h-4" />
              <span>Create Trip</span>
            </button>
          </div>
        )}

        {/* Section intro */}
        {filteredTrips.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <SectionIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{sectionMeta.title}</h2>
              <p className="text-sm text-muted-foreground">{sectionMeta.description}</p>
            </div>
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
                          {getStatusLabel(trip.status)}
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

              {selectedTrip.status === 'completed' && (
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold text-foreground">This trip is part of your travel history.</p>
                </div>
              )}

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

      {/* Create Trip Modal */}
      {createMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeCreateMenu} />
          <div className="relative w-full md:max-w-2xl bg-card rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-6 pb-0">
                <h3 className="text-lg font-bold text-foreground">
                  {createMode === 'choose' ? 'Create a Trip' : createMode === 'carpool' ? 'Create Carpool' : 'Create Travel'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {createMode === 'choose'
                    ? 'Choose the type of trip you want to set up.'
                    : createMode === 'carpool'
                      ? 'Fill in the ride details for your carpool.'
                      : 'Fill in the trip details for your travel plan.'}
                </p>
              </div>
              <button
                onClick={closeCreateMenu}
                className="absolute right-4 top-4 p-2 hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-0 overflow-y-auto space-y-4">
              {createMode === 'choose' && (
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    onClick={() => setCreateMode('carpool')}
                    className="rounded-2xl border border-border bg-secondary/40 p-5 text-left hover:border-primary/30 hover:bg-primary/5 transition-smooth"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Map className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Carpool</p>
                        <p className="text-xs text-muted-foreground">Ride details and vehicle info</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Best for shared drives, commuting, and seat-based trips.
                    </p>
                  </button>

                  <button
                    onClick={() => setCreateMode('tour')}
                    className="rounded-2xl border border-border bg-secondary/40 p-5 text-left hover:border-primary/30 hover:bg-primary/5 transition-smooth"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Travel</p>
                        <p className="text-xs text-muted-foreground">Tour details and itinerary</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Best for vacations, organized tours, and longer travel plans.
                    </p>
                  </button>
                </div>
              )}

              {createMode === 'carpool' && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">From *</label>
                      <input name="from" value={carpoolForm.from} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Departure location" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">To *</label>
                      <input name="to" value={carpoolForm.to} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Destination" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Date *</label>
                      <input type="date" name="date" value={carpoolForm.date} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Time *</label>
                      <input type="time" name="time" value={carpoolForm.time} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Available Seats</label>
                      <select name="seats" value={carpoolForm.seats} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="1">1 Seat</option>
                        <option value="2">2 Seats</option>
                        <option value="3">3 Seats</option>
                        <option value="4">4 Seats</option>
                        <option value="5">5+ Seats</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Price per Seat *</label>
                      <input type="number" name="price" value={carpoolForm.price} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" min="0" step="0.01" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Trip Description</label>
                    <textarea name="description" value={carpoolForm.description} onChange={updateCarpoolForm} rows={3} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Tell passengers about your ride" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Car Model *</label>
                      <input name="carModel" value={carpoolForm.carModel} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Toyota Camry 2020" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Car Color</label>
                      <input name="carColor" value={carpoolForm.carColor} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Silver" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Plate Number</label>
                      <input name="carPlate" value={carpoolForm.carPlate} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ABC1234" />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="flex items-center gap-3 rounded-xl border border-border p-4">
                      <input type="checkbox" name="allowPets" checked={carpoolForm.allowPets} onChange={updateCarpoolForm} />
                      <span className="text-sm text-foreground">Pets allowed</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-border p-4">
                      <input type="checkbox" name="allowSmoking" checked={carpoolForm.allowSmoking} onChange={updateCarpoolForm} />
                      <span className="text-sm text-foreground">Smoking allowed</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Music Preference</label>
                      <select name="musicPreference" value={carpoolForm.musicPreference} onChange={updateCarpoolForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="any">Any</option>
                        <option value="quiet">Quiet</option>
                        <option value="loud">Lively</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {createMode === 'tour' && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Tour Title *</label>
                      <input name="title" value={tourForm.title} onChange={updateTourForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Boracay Beach Escape" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Destination *</label>
                      <input name="destination" value={tourForm.destination} onChange={updateTourForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Boracay, Aklan" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
                      <input type="date" name="date" value={tourForm.date} onChange={updateTourForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Duration (Days)</label>
                      <input type="number" name="duration" min="1" value={tourForm.duration} onChange={updateTourForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Max Participants</label>
                      <input type="number" name="maxParticipants" min="2" value={tourForm.maxParticipants} onChange={updateTourForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Price per Person (₱) *</label>
                    <input type="number" name="price" value={tourForm.price} onChange={updateTourForm} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., 3500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <textarea name="description" value={tourForm.description} onChange={updateTourForm} rows={3} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Describe the experience" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Itinerary Summary</label>
                    <textarea name="itinerary" value={tourForm.itinerary} onChange={updateTourForm} rows={3} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Short day-by-day plan" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {createMode !== 'choose' ? (
                  <button
                    type="button"
                    onClick={() => setCreateMode('choose')}
                    className="px-5 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-smooth"
                  >
                    Back
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  className="flex-1 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-md transition-smooth"
                >
                  {createMode === 'choose' ? 'Continue' : 'Save Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
