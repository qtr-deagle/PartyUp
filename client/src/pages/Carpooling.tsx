import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Calendar, Users, DollarSign, Star, Filter, Plus, Search } from 'lucide-react';

export default function Carpooling() {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-rides' | 'bookings'>('browse');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const availableRides = [
    {
      id: 1,
      driver: 'John Doe',
      from: 'San Francisco, CA',
      to: 'Los Angeles, CA',
      date: '2026-02-20',
      time: '08:00 AM',
      seats: 3,
      price: 45,
      rating: 4.8,
      reviews: 124,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      verified: true,
    },
    {
      id: 2,
      driver: 'Sarah Wilson',
      from: 'Los Angeles, CA',
      to: 'San Diego, CA',
      date: '2026-02-21',
      time: '10:30 AM',
      seats: 2,
      price: 35,
      rating: 4.9,
      reviews: 89,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      verified: true,
    },
    {
      id: 3,
      driver: 'Mike Chen',
      from: 'San Francisco, CA',
      to: 'San Jose, CA',
      date: '2026-02-22',
      time: '02:00 PM',
      seats: 4,
      price: 25,
      rating: 4.7,
      reviews: 156,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      verified: true,
    },
    {
      id: 4,
      driver: 'Emma Davis',
      from: 'Oakland, CA',
      to: 'Los Angeles, CA',
      date: '2026-02-23',
      time: '06:00 PM',
      seats: 1,
      price: 50,
      rating: 4.6,
      reviews: 72,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      verified: false,
    },
  ];

  const myRides = [
    {
      id: 101,
      from: 'San Francisco, CA',
      to: 'Los Angeles, CA',
      date: '2026-02-25',
      time: '09:00 AM',
      seats: 3,
      booked: 2,
      price: 45,
      status: 'active',
    },
    {
      id: 102,
      from: 'San Francisco, CA',
      to: 'Las Vegas, NV',
      date: '2026-03-01',
      time: '08:00 AM',
      seats: 4,
      booked: 1,
      price: 80,
      status: 'active',
    },
  ];

  const bookings = [
    {
      id: 201,
      driver: 'John Doe',
      from: 'San Francisco, CA',
      to: 'Los Angeles, CA',
      date: '2026-02-20',
      time: '08:00 AM',
      price: 45,
      status: 'confirmed',
    },
  ];

  const filteredRides = availableRides.filter(ride =>
    ride.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-card border-b border-border shadow-elevation-1 z-10">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-foreground mb-4">Carpooling</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-t border-border">
            {['browse', 'my-rides', 'bookings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-center text-sm font-medium transition-smooth border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                {tab === 'browse' && 'Browse'}
                {tab === 'my-rides' && 'My Rides'}
                {tab === 'bookings' && 'Bookings'}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6 p-8">
          {/* Sidebar */}
          <div className="w-80">
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border sticky top-8">
              <h2 className="text-lg font-bold text-foreground mb-6">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="From or to..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Max Price</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  defaultValue="200"
                  className="w-full"
                />
              </div>

              {/* Seats Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Seats Needed</label>
                <select className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Any</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-foreground">Verified drivers only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Available Rides</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
                <Plus className="w-4 h-4" />
                Post a Ride
              </button>
            </div>

            {/* Rides Grid */}
            <div className="space-y-4">
              {filteredRides.map((ride) => (
                <div key={ride.id} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border hover:shadow-elevation-3 transition-smooth">
                  <div className="flex gap-4">
                    {/* Driver Avatar */}
                    <img src={ride.image} alt={ride.driver} className="w-16 h-16 rounded-full" />

                    {/* Ride Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-foreground">{ride.driver}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-foreground">{ride.rating}</span>
                              <span className="text-xs text-muted-foreground">({ride.reviews})</span>
                            </div>
                            {ride.verified && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">${ride.price}</p>
                          <p className="text-xs text-muted-foreground">per seat</p>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-4 mb-4 py-3 border-t border-b border-border">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">From</p>
                          <p className="font-medium text-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {ride.from}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">To</p>
                          <p className="font-medium text-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {ride.to}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {ride.date} at {ride.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {ride.seats} seats available
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex gap-3">
                        <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium bg-gray-100 hover:bg-gray-2npm run dev00 transition-smooth">
                          View Details
                        </button>
                        <button className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth">
                          Request to Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Browse Tab */}
        {activeTab === 'browse' && (
          <div className="md:hidden p-4 space-y-4">
            {filteredRides.map((ride) => (
              <div key={ride.id} className="bg-card rounded-2xl p-4 shadow-elevation-2 border border-border">
                <div className="flex gap-3 mb-4">
                  <img src={ride.image} alt={ride.driver} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-sm">{ride.driver}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-foreground">{ride.rating}</span>
                      <span className="text-xs text-muted-foreground">({ride.reviews})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${ride.price}</p>
                    <p className="text-xs text-muted-foreground">per seat</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {ride.from} → {ride.to}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {ride.date} at {ride.time}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {ride.seats} seats available
                  </p>
                </div>

                <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                  Request to Book
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mobile My Rides Tab */}
        {activeTab === 'my-rides' && (
          <div className="md:hidden p-4 space-y-4">
            <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Post a New Ride
            </button>
            {myRides.map((ride) => (
              <div key={ride.id} className="bg-card rounded-2xl p-4 shadow-elevation-2 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{ride.from}</p>
                    <p className="font-bold text-foreground">→ {ride.to}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                    {ride.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">{ride.date} at {ride.time}</p>
                  <p className="text-sm text-muted-foreground">{ride.booked}/{ride.seats} seats booked</p>
                  <p className="text-sm font-medium text-foreground">${ride.price} per seat</p>
                </div>
                <button className="w-full py-2 px-4 bg-secondary text-foreground rounded-lg font-medium text-sm border border-border">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="md:hidden p-4 space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-card rounded-2xl p-4 shadow-elevation-2 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{booking.driver}</p>
                    <p className="text-sm text-muted-foreground">{booking.from}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                    {booking.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">→ {booking.to}</p>
                  <p className="text-sm text-muted-foreground">{booking.date} at {booking.time}</p>
                  <p className="text-sm font-bold text-primary">${booking.price}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                    Contact Driver
                  </button>
                  <button className="flex-1 py-2 px-4 bg-secondary text-foreground rounded-lg font-medium text-sm border border-border">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
