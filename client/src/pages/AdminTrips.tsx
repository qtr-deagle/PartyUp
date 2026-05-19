import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, MapPin, Calendar, Users, MoreVertical } from 'lucide-react';

export default function AdminTrips() {
  const [searchTerm, setSearchTerm] = useState('');

  const trips = [
    { id: 1, type: 'carpool', destination: 'Antipolo', organizer: 'John Doe', startDate: '2026-03-15', members: 3, status: 'active' },
    { id: 2, type: 'touring', locations: ['Manila', 'Makati', 'Quezon City'], organizer: 'Jane Smith', startDate: '2026-04-10', members: 5, status: 'active' },
    { id: 3, type: 'carpool', destination: 'Laguna', organizer: 'Mike Johnson', startDate: '2026-02-20', members: 2, status: 'completed' },
    { id: 4, type: 'touring', locations: ['Tagaytay', 'Cavite', 'Batangas'], organizer: 'Sarah Williams', startDate: '2026-05-01', members: 4, status: 'active' },
    { id: 5, type: 'carpool', destination: 'Baguio', organizer: 'Tom Brown', startDate: '2026-06-15', members: 1, status: 'planned' },
  ];

  const filteredTrips = trips.filter(trip => {
    const searchLower = searchTerm.toLowerCase();
    const destinations = trip.type === 'touring' 
      ? trip.locations.join(' ').toLowerCase()
      : trip.destination.toLowerCase();
    return destinations.includes(searchLower) || trip.organizer.toLowerCase().includes(searchLower);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trips Management</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trips by destination or organizer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Trips Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Destination</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Organizer</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Members</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        trip.type === 'carpool' 
                          ? 'bg-blue-500/10 text-blue-700' 
                          : 'bg-purple-500/10 text-purple-700'
                      }`}>
                        {trip.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="font-medium text-foreground">
                          {trip.type === 'touring' ? (
                            <div className="space-y-1">
                              {trip.locations.map((loc, idx) => (
                                <div key={idx} className="text-sm">{loc}</div>
                              ))}
                            </div>
                          ) : (
                            <span>{trip.destination}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{trip.organizer}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {trip.startDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {trip.members}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        trip.status === 'active' ? 'bg-green-100 text-green-700' :
                        trip.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-secondary rounded-lg transition-smooth">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
