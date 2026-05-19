import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Calendar, Users, MessageCircle, Map as MapIcon, Star } from 'lucide-react';

interface ParticipatedTour {
  id: number;
  title: string;
  destination: string;
  pickupLocation: string;
  startDate: string;
  endDate: string;
  organizer: {
    name: string;
    rating: number;
    avatar: string;
  };
  participants: {
    current: number;
    max: number;
  };
  status: 'active' | 'upcoming' | 'completed';
  type: 'carpool' | 'tour';
  pricePerPerson: number;
  totalContribution: number;
  interests: string[];
  distance?: string;
  image?: string;
}

export default function MyParticipatedTours() {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  const tours: ParticipatedTour[] = [
    {
      id: 1,
      title: 'Makati to Laguna Carpool',
      destination: 'Laguna',
      pickupLocation: 'Makati',
      startDate: '2026-02-25',
      endDate: '2026-02-25',
      organizer: {
        name: 'John Doe',
        rating: 4.8,
        avatar: 'J',
      },
      participants: { current: 2, max: 3 },
      status: 'active',
      type: 'carpool',
      pricePerPerson: 360,
      totalContribution: 360,
      interests: ['Commute', 'Budget Travel'],
      distance: '45 km',
    },
    {
      id: 2,
      title: 'Barcelona City Tour',
      destination: 'Barcelona, Spain',
      pickupLocation: 'Hotel Centro',
      startDate: '2026-03-15',
      endDate: '2026-03-20',
      organizer: {
        name: 'Maria Garcia',
        rating: 4.9,
        avatar: 'M',
      },
      participants: { current: 5, max: 8 },
      status: 'upcoming',
      type: 'tour',
      pricePerPerson: 2500,
      totalContribution: 2500,
      interests: ['Museums', 'Food Tours', 'History'],
      distance: '45 km',
    },
    {
      id: 3,
      title: 'Bangkok Street Food Adventure',
      destination: 'Bangkok, Thailand',
      pickupLocation: 'Airport Hotel',
      startDate: '2026-01-10',
      endDate: '2026-01-15',
      organizer: {
        name: 'Alex Chen',
        rating: 4.7,
        avatar: 'A',
      },
      participants: { current: 6, max: 8 },
      status: 'completed',
      type: 'tour',
      pricePerPerson: 1800,
      totalContribution: 1800,
      interests: ['Food', 'Culture', 'Nightlife'],
      distance: '60 km',
    },
  ];

  const filteredTours = tours.filter((tour) => tour.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-500/10', text: 'text-green-600', label: '🟢 In Progress' };
      case 'upcoming':
        return { bg: 'bg-blue-500/10', text: 'text-blue-600', label: '🟡 Upcoming' };
      case 'completed':
        return { bg: 'bg-gray-500/10', text: 'text-gray-600', label: '✅ Completed' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-600', label: 'Unknown' };
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'carpool'
      ? { bg: 'bg-blue-500/10', text: 'text-blue-600', label: '🚗 Carpool' }
      : { bg: 'bg-purple-500/10', text: 'text-purple-600', label: '✈️ Tour' };
  };

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-30 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">My Participated Tours</h1>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-secondary rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Tours</p>
            <p className="text-xl font-bold text-foreground">{tours.length}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Upcoming</p>
            <p className="text-xl font-bold text-blue-600">{tours.filter(t => t.status === 'upcoming').length}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-xl font-bold text-green-600">{tours.filter(t => t.status === 'completed').length}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
            <p className="text-xl font-bold text-primary">₱{tours.reduce((sum, t) => sum + t.totalContribution, 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(['active', 'upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-smooth ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="space-y-4">
          {filteredTours.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No {activeTab} tours</p>
            </div>
          ) : (
            filteredTours.map((tour) => {
              const statusBadge = getStatusBadge(tour.status);
              const typeBadge = getTypeBadge(tour.type);

              return (
                <div key={tour.id} className="bg-card border border-border rounded-2xl p-4 md:p-6 hover:shadow-md transition-smooth">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Left - Info */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {tour.type === 'carpool' ? '🚗' : '✈️'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground">{tour.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeBadge.bg} ${typeBadge.text}`}>
                              {typeBadge.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-foreground">{tour.pickupLocation} → {tour.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-foreground">{tour.startDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-foreground">{tour.participants.current}/{tour.participants.max} participants</span>
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {tour.interests.map((interest, idx) => (
                          <span key={idx} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Middle - Organizer & Stats */}
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">Organizer</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {tour.organizer.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-foreground">{tour.organizer.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-semibold">{tour.organizer.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {tour.distance && (
                        <div className="p-3 bg-secondary rounded-lg">
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="font-bold text-foreground">{tour.distance}</p>
                        </div>
                      )}
                    </div>

                    {/* Right - Price & Actions */}
                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Your Contribution</p>
                        <p className="text-2xl font-bold text-green-600">₱{tour.pricePerPerson.toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary flex items-center justify-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Chat</span>
                        </button>
                        <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md flex items-center justify-center gap-1">
                          <MapIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Map</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
