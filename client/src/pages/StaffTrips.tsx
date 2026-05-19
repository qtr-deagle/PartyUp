import React, { useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, AlertTriangle, Eye } from 'lucide-react';

/**
 * Staff Trips - Trip Monitoring
 * 
 * Staff can:
 * - Monitor active trips
 * - Flag safety concerns
 * - View trip details
 * - Respond to emergencies
 */
export default function StaffTrips() {
  const [searchTerm, setSearchTerm] = useState('');

  const trips = [
    { id: 1, trip: '#456 | Manila to Laguna', type: 'carpool', travelers: 'John + Jane', status: 'in-progress', safety: 'normal', time: 'Started 1h ago' },
    { id: 2, trip: '#453 | Manila → Tagaytay → Batangas', type: 'touring', travelers: 'Mike + Sarah', status: 'in-progress', safety: 'normal', time: 'Started 30m ago' },
    { id: 3, trip: '#451 | Makati to Antipolo', type: 'carpool', travelers: 'Tom + Lisa', status: 'in-progress', safety: 'alert', time: 'Started 2h ago' },
  ];

  const filteredTrips = trips.filter(trip =>
    trip.trip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.travelers.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trip Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-2">Monitor active trips and respond to safety concerns</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by trip ID or travelers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Trips Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Trip</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Travelers</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Safety</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{trip.trip}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        trip.type === 'carpool' 
                          ? 'bg-blue-500/10 text-blue-700' 
                          : 'bg-purple-500/10 text-purple-700'
                      }`}>
                        {trip.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{trip.travelers}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {trip.safety === 'alert' ? (
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="w-4 h-4" />
                          Alert
                        </span>
                      ) : (
                        <span className="text-primary">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{trip.time}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
