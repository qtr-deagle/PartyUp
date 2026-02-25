import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Calendar, Users, Star, Plus, Search, ArrowRight, Zap } from 'lucide-react';

export default function Carpooling() {
  const [activeTab, setActiveTab] = useState<'find' | 'create' | 'active' | 'history'>('find');
  const [searchTerm, setSearchTerm] = useState('');

  const availableRides = [
    {
      id: 1,
      driver: 'John Doe',
      from: 'Makati',
      to: 'Laguna',
      date: '2026-02-25',
      time: '08:00 AM',
      seats: 3,
      booked: 1,
      price: 150,
      rating: 4.8,
      verified: true,
      distance: '45 km',
    },
    {
      id: 2,
      driver: 'Sarah Wilson',
      from: 'BGC',
      to: 'Tagaytay',
      date: '2026-02-25',
      time: '10:30 AM',
      seats: 2,
      booked: 0,
      price: 200,
      rating: 4.9,
      verified: true,
      distance: '60 km',
    },
    {
      id: 3,
      driver: 'Mike Chen',
      from: 'Quezon City',
      to: 'Cavite',
      date: '2026-02-26',
      time: '02:00 PM',
      seats: 4,
      booked: 2,
      price: 120,
      rating: 4.7,
      verified: true,
      distance: '35 km',
    },
  ];

  const activeRides = [
    {
      id: 101,
      from: 'Makati',
      to: 'Laguna',
      date: '2026-02-25',
      time: '08:00 AM',
      seats: 3,
      booked: 1,
      price: 150,
      status: 'in-progress',
      passengers: ['Maria Santos'],
    },
  ];

  const rideHistory = [
    {
      id: 201,
      from: 'Makati',
      to: 'Laguna',
      date: '2026-02-20',
      price: 150,
      status: 'completed',
    },
    {
      id: 202,
      from: 'BGC',
      to: 'Boracay',
      date: '2026-02-15',
      price: 500,
      status: 'completed',
    },
  ];

  const filteredRides = availableRides.filter(ride =>
    ride.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-background dark:bg-background min-h-screen md:pb-0 pb-24">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-card dark:bg-card border-b border-border z-10">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-foreground mb-4">Carpool</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search rides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary dark:bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-t border-border">
            {[
              { id: 'find', label: 'Find', icon: '🔍' },
              { id: 'create', label: 'Create', icon: '➕' },
              { id: 'active', label: 'Active', icon: '🚗' },
              { id: 'history', label: 'History', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 text-center text-xs font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">Carpooling</h1>
                <p className="text-muted-foreground">Share rides and split costs safely</p>
              </div>
              <button className="px-6 py-3 bg-primary dark:bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 dark:hover:bg-primary/90 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create Ride
              </button>
            </div>

            {/* Available Rides for Desktop */}
            {activeTab === 'find' && (
              <div className="space-y-4">
                {filteredRides.map((ride) => (
                  <div key={ride.id} className="p-6 bg-card dark:bg-card border border-border rounded-2xl hover:border-primary dark:hover:border-primary transition-all">
                    <div className="flex gap-6 items-start">
                      <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-primary">{ride.driver[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{ride.driver}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <Star className="w-4 h-4 fill-current" /> {ride.rating}
                              </span>
                              {ride.verified && (
                                <span className="px-2 py-1 bg-accent/20 border border-accent/50 text-accent text-xs font-semibold rounded-full">✓ Verified</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-primary">₱{ride.price}</p>
                            <p className="text-xs text-slate-400">per seat</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 py-4 mb-4 border-y border-border">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">FROM</p>
                            <p className="text-foreground font-semibold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" /> {ride.from}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">TO</p>
                            <p className="text-foreground font-semibold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-400" /> {ride.to}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-6 mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4" /> {ride.date} at {ride.time}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Users className="w-4 h-4" /> {ride.seats - ride.booked}/{ride.seats} seats left
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Zap className="w-4 h-4" /> {ride.distance}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 py-2.5 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all font-semibold text-sm">
                            View Details
                          </button>
                          <button className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold text-sm">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'create' && (
              <div className="p-12 bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-blue-600/20 rounded-2xl text-center">
                <Plus className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share Your Ride</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">Post a ride and earn while helping other travelers</p>
                <button className="px-8 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition-all">
                  Create Ride
                </button>
              </div>
            )}

            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeRides.map((ride) => (
                  <div key={ride.id} className="p-6 bg-linear-to-br from-green-500/10 to-green-500/10 border border-green-500/30 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-green-400 font-semibold">In Progress</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{ride.from} → {ride.to}</h3>
                      </div>
                      <p className="text-3xl font-bold text-blue-400">₱{ride.price}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-green-500/20">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Date & Time</p>
                        <p className="text-white font-semibold">{ride.date} {ride.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Passengers</p>
                        <p className="text-white font-semibold">{ride.booked}/{ride.seats}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Names</p>
                        {ride.passengers.map((p) => (
                          <p key={p} className="text-foreground font-semibold text-sm">{p}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 py-2.5 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all font-semibold">
                        View Details
                      </button>
                      <button className="flex-1 py-2.5 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all font-semibold">
                        Contact Passengers
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {rideHistory.map((ride) => (
                  <div key={ride.id} className="p-6 bg-slate-900 border border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{ride.from} → {ride.to}</h3>
                        <p className="text-muted-foreground text-sm">{ride.date} • ₱{ride.price}</p>
                      </div>
                      <span className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-semibold">✓ Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden p-4">
          {activeTab === 'find' && (
            <div className="space-y-4">
              {filteredRides.map((ride) => (
                <div key={ride.id} className="p-4 bg-card/50 dark:bg-card/50 border border-border rounded-xl">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">{ride.driver[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{ride.driver}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">{ride.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₱{ride.price}</p>
                      <p className="text-xs text-muted-foreground">/seat</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <p className="text-sm text-card-foreground font-semibold">{ride.from} → {ride.to}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {ride.date} at {ride.time}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {ride.seats - ride.booked} seats left
                    </p>
                  </div>

                  <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'create' && (
              <div className="p-12 bg-card dark:bg-card border border-border rounded-2xl text-center">
                <Plus className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Share Your Ride</h3>
                <p className="text-sm text-muted-foreground mb-4">Earn while helping others travel</p>
                <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
                Create Ride
              </button>
            </div>
          )}

          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeRides.map((ride) => (
                <div key={ride.id} className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></div>
                    <span className="text-accent font-semibold text-xs">In Progress</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{ride.from} → {ride.to}</h3>
                  <div className="space-y-1 text-sm mb-3 pb-3 border-b border-accent/20">
                    <p className="text-muted-foreground">{ride.date} at {ride.time}</p>
                    <p className="text-foreground font-semibold">₱{ride.price} • {ride.booked}/{ride.seats} passengers</p>
                  </div>
                  <button className="w-full py-2 border border-green-500/30 text-green-400 rounded-lg font-semibold text-sm">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {rideHistory.map((ride) => (
                <div key={ride.id} className="p-4 bg-card dark:bg-card border border-border rounded-lg">
                  <h3 className="font-semibold text-foreground mb-1 text-sm">{ride.from} → {ride.to}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{ride.date} • ₱{ride.price}</p>
                  <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full font-semibold">✓ Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
