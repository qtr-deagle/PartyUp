import React, { useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';

/**
 * Staff Vehicles - Personal Vehicle Verification
 * 
 * Staff can:
 * - Review travelers' personal vehicles
 * - Verify vehicle information for carpooling safety
 * - Approve or reject vehicle listings
 * - Flag suspicious vehicles
 */
export default function StaffVehicles() {
  const [searchTerm, setSearchTerm] = useState('');

  const vehicles = [
    { id: 1, owner: 'John Smith', model: 'Honda CR-V', year: 2022, status: 'pending', time: '2 hours ago', seats: 5 },
    { id: 2, owner: 'Emma Wilson', model: 'Tesla Model 3', year: 2023, status: 'pending', time: '4 hours ago', seats: 4 },
    { id: 3, owner: 'Michael Brown', model: 'Toyota Camry', year: 2021, status: 'pending', time: '6 hours ago', seats: 5 },
  ];

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Verification</h1>
          <p className="text-sm text-muted-foreground mt-2">Review and approve travelers' personal vehicles for carpooling</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by owner or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
        </div>

        {/* Vehicles Table */}
        <div className="bg-card rounded-2xl shadow-elevation-2 border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Owner</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Vehicle</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Year</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Seats</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{vehicle.owner}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{vehicle.model}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{vehicle.year}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{vehicle.seats} seats</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{vehicle.time}</td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-colors" title="View Details">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="Approve">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors" title="Reject">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Verification Purpose:</strong> Ensure travelers' personal vehicles are safe and legitimate for carpooling. Check vehicle condition, ownership, and safety compliance.
          </p>
        </div>
      </div>
    </StaffLayout>
  );
}
