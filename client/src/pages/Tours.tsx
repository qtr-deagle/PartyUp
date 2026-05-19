import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Calendar, Users, Star, Plus, Search, ArrowRight, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

/**
 * Tours Browsing Page
 * 
 * Users can:
 * - Browse organized group tours
 * - Filter by destination, date, interests
 * - View tour details and pricing
 * - Join tours
 */
export default function Tours() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'browse' | 'joined' | 'interested'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);

  const tours = [
    {
      id: 1,
      title: 'Boracay Beach Paradise',
      destination: 'Boracay, Aklan',
      organizer: 'Maria Santos',
      rating: 4.9,
      reviews: 48,
      participants: 12,
      maxParticipants: 20,
      date: '2026-03-15',
      duration: '3 days',
      price: 3500,
      image: '🏖️',
      interests: ['Beaches', 'Relaxation', 'Nightlife'],
      description: 'Experience the stunning white sand beaches of Boracay with guided tours and water activities.',
    },
    {
      id: 2,
      title: 'Cordillera Mountain Adventure',
      destination: 'Baguio, Benguet',
      organizer: 'Alex Johnson',
      rating: 4.8,
      reviews: 36,
      participants: 8,
      maxParticipants: 15,
      date: '2026-03-20',
      duration: '4 days',
      price: 4200,
      image: '⛰️',
      interests: ['Hiking', 'Nature', 'Photography'],
      description: 'Trek through the majestic Cordillera mountains with experienced guides and fellow adventurers.',
    },
    {
      id: 3,
      title: 'Cultural Heritage Tour',
      destination: 'Manila, Metro Manila',
      organizer: 'Dr. Felipe Cruz',
      rating: 4.7,
      reviews: 52,
      participants: 15,
      maxParticipants: 25,
      date: '2026-03-25',
      duration: '2 days',
      price: 2800,
      image: '🏛️',
      interests: ['History', 'Art', 'Museums'],
      description: 'Explore Manila\'s rich historical and cultural landmarks with expert historical commentary.',
    },
    {
      id: 4,
      title: 'Palawan Island Hopping',
      destination: 'Puerto Princesa, Palawan',
      organizer: 'Island Explorers Co.',
      rating: 4.9,
      reviews: 71,
      participants: 18,
      maxParticipants: 22,
      date: '2026-04-05',
      duration: '5 days',
      price: 5800,
      image: '🌴',
      interests: ['Beaches', 'Adventure', 'Photography'],
      description: 'Island hop through the pristine islands of Palawan including El Nido and Coron.',
    },
    {
      id: 5,
      title: 'Food & Market Tour',
      destination: 'Cebu City, Cebu',
      organizer: 'Chef Antonio',
      rating: 4.8,
      reviews: 45,
      participants: 10,
      maxParticipants: 16,
      date: '2026-03-28',
      duration: '2 days',
      price: 2200,
      image: '🍜',
      interests: ['Food', 'Shopping', 'Culture'],
      description: 'Experience authentic Cebu cuisine and explore local markets with a professional chef guide.',
    },
    {
      id: 6,
      title: 'Hiking & Waterfall Adventure',
      destination: 'Tanay, Rizal',
      organizer: 'Outdoor Philippines',
      rating: 4.6,
      reviews: 28,
      participants: 6,
      maxParticipants: 12,
      date: '2026-03-22',
      duration: '1 day',
      price: 1200,
      image: '💧',
      interests: ['Hiking', 'Nature', 'Adventure'],
      description: 'Discover hidden waterfalls and lush forests near Metro Manila in this day adventure.',
    },
  ];

  const filteredTours = tours.filter(tour =>
    tour.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!filterDestination || tour.destination.includes(filterDestination))
  );

  const joinedTours = [
    { id: 1, title: 'Boracay Beach Paradise', date: '2026-03-15' },
  ];

  const interestedTours = tours.slice(2, 4);

  const handleToggleFavorite = (tourId: number) => {
    setFavorites(prev =>
      prev.includes(tourId)
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    );
  };

  const handleJoinTour = (tourId: number) => {
    toast.success('Successfully joined tour!');
  };

  const renderTourCard = (tour: any) => (
    <div key={tour.id} className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden hover:border-primary transition-all">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="w-full md:w-32 h-32 bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">
          {tour.image}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{tour.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{tour.destination}</span>
                </div>
              </div>
              <button
                onClick={() => handleToggleFavorite(tour.id)}
                className={`p-2 rounded-lg transition-colors ${
                  favorites.includes(tour.id)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-secondary text-muted-foreground hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(tour.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Tour Details */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{tour.participants}/{tour.maxParticipants} joined</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-600" />
                <span className="text-sm">{tour.rating} ({tour.reviews})</span>
              </div>
            </div>

            {/* Interests */}
            <div className="flex flex-wrap gap-2 mt-3">
              {tour.interests.map(interest => (
                <span key={interest} className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold text-foreground">₱{tour.price.toLocaleString()}</p>
            </div>
            <button
              onClick={() => handleJoinTour(tour.id)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth"
            >
              Join Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-30 px-4 md:px-6 py-1.5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm font-bold text-foreground whitespace-nowrap">Tours</h1>
          
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-xs bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-smooth"
            />
          </div>

          {/* Filter */}
          <select
            value={filterDestination}
            onChange={(e) => setFilterDestination(e.target.value)}
            className="px-2 py-1 text-xs bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-smooth whitespace-nowrap"
            style={{ maxWidth: '120px' }}
          >
            <option value="">All Destinations</option>
            <option value="Boracay">Boracay</option>
            <option value="Baguio">Baguio</option>
            <option value="Manila">Manila</option>
            <option value="Palawan">Palawan</option>
            <option value="Cebu">Cebu</option>
          </select>

          {/* Create Button */}
          <button
            onClick={() => setLocation('/tours/create')}
            className="flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded-md font-medium text-xs hover:shadow-lg transition-smooth whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3 h-3" />
            Create
          </button>
        </div>

        {/* Tab Navigation */}
          <div className="flex gap-0 border-b border-border">
            {[
              { id: 'browse', label: 'Browse Tours' },
              { id: 'joined', label: 'My Tours' },
              { id: 'interested', label: 'Interested' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8">
        <div className="space-y-6">
          {activeTab === 'browse' && (
            <>
              {filteredTours.length > 0 ? (
                filteredTours.map(tour => renderTourCard(tour))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No tours found matching your criteria</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'joined' && (
            <>
              {joinedTours.length > 0 ? (
                <div className="space-y-6">
                  {joinedTours.map(tour => (
                    <div key={tour.id} className="p-6 bg-card border-2 border-green-500/30 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-semibold text-green-600">Joined</span>
                          </div>
                          <h3 className="text-xl font-bold text-foreground">{tour.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{tour.date}</p>
                        </div>
                        <button className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-smooth">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">You haven't joined any tours yet</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'interested' && (
            <>
              {interestedTours.length > 0 ? (
                <div className="space-y-6">
                  {interestedTours.map(tour => renderTourCard(tour))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No interested tours yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
