import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Bell, MapPin, Star, Users, Calendar, Search, Heart, TrendingUp, Zap } from 'lucide-react';
import Weather from '@/components/Weather';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(21);

  const destinations = [
    { id: 1, name: 'Barcelona', location: 'Spain', price: '$450/day', image: 'bg-gradient-to-br from-blue-400 to-blue-500' },
    { id: 2, name: 'Tokyo', location: 'Japan', price: '$570/day', image: 'bg-gradient-to-br from-pink-400 to-pink-500' },
    { id: 3, name: 'Paris', location: 'France', price: '$690/day', image: 'bg-gradient-to-br from-purple-400 to-purple-500' },
  ];

  const events = [
    { id: 1, date: 12, name: 'Mt. Merapi', location: 'Semarang, Indonesia', price: '$320/day' },
    { id: 2, date: 14, name: 'Mt. Merbabu', location: 'Central Java, Indonesia', price: '$280/day' },
    { id: 3, date: 15, name: 'Mt. Mandala', location: 'Papua, Indonesia', price: '$570/day' },
    { id: 4, date: 15, name: 'Mt. Kerinci', location: 'Jambi, Indonesia', price: '$320/day' },
    { id: 5, date: 21, name: 'Mt. Slamet', location: 'Tegal, Indonesia', price: '$560/day' },
    { id: 6, date: 21, name: 'Mt. Latuk', location: 'Kalimantan, Indonesia', price: '$440/day' },
  ];

  const dates = Array.from({ length: 14 }, (_, i) => ({ date: 12 + i, day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i % 7] }));

  return (
    <Layout>
      {/* Header Section */}
      <div className="md:sticky md:top-0 bg-background border-b border-border z-30">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-semibold text-foreground">Welcome back</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Explore the world and plan your next trip</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Destination"
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="px-3 sm:px-4 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl font-semibold transition-smooth hover:shadow-lg active:scale-95 flex items-center gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary text-primary-foreground rounded-xl font-semibold transition-smooth hover:shadow-lg active:scale-95">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Top Row: Weather + Discover */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Weather Widget */}
          <div className="lg:col-span-1">
            <Weather />
          </div>

          {/* Discover World Section */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">Discover World</h2>
                <span className="text-2xl">🌍</span>
              </div>
              <button className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                View all <TrendingUp className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Cards */}
            <div className="space-y-3">
              {destinations.map((dest) => (
                <div key={dest.id} className="card-luxury p-4 flex gap-4 items-center hover:shadow-lg transition-shadow cursor-pointer">
                  <div className={`w-20 h-20 rounded-lg ${dest.image} flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">{dest.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {dest.location}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-primary">{dest.price}</p>
                    <button className="mt-2 p-2 bg-primary rounded-full text-white hover:shadow-md transition-smooth">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Dates Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Event Dates</h2>
              <span className="text-2xl">🎯</span>
            </div>
            <button className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
              View all <TrendingUp className="w-4 h-4" />
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {dates.map((item) => (
              <button
                key={item.date}
                onClick={() => setSelectedDate(item.date)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-[60px] text-sm font-medium transition-all ${selectedDate === item.date
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border text-foreground hover:border-primary'
                  }`}
              >
                <span className="text-xs text-muted-foreground mb-1">{item.day}</span>
                <span>{item.date}</span>
              </button>
            ))}
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events
              .filter((event) => event.date === selectedDate)
              .map((event) => (
                <div key={event.id} className="card-luxury p-4 flex gap-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{event.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-2">{event.price}</p>
                    </div>
                    <button className="p-2 rounded-full hover:bg-primary/10 transition-smooth flex-shrink-0">
                      <Heart className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Discount Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">🎉 Special Discount!</h3>
            <p className="text-white/90">Get the best discounts on certain destinations and don't miss it.</p>
          </div>
          <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mb-20"></div>
        </div>
      </div>
    </Layout>
  );
}
