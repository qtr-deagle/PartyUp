import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PostRide() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: 1,
    price: 0,
    description: '',
    carModel: '',
    carColor: '',
    carPlate: '',
    allowPets: false,
    allowSmoking: false,
    musicPreference: 'any',
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Ride posted:', formData);
    setLocation('/carpooling');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24 md:pb-0">
        <div className="sticky top-0 bg-card border-b border-border shadow-elevation-1 z-10">
          <div className="p-4 md:p-8 flex items-center gap-4">
            <button
              onClick={() => setLocation('/carpooling')}
              className="p-2 hover:bg-secondary rounded-lg transition-smooth"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Post a Ride</h1>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-6">Route Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    From
                  </label>
                  <input
                    type="text"
                    name="from"
                    value={formData.from}
                    onChange={handleChange}
                    placeholder="Departure location"
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    To
                  </label>
                  <input
                    type="text"
                    name="to"
                    value={formData.to}
                    onChange={handleChange}
                    placeholder="Destination"
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-6">Ride Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Available Seats
                    </label>
                    <select
                      name="seats"
                      value={formData.seats}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="1">1 Seat</option>
                      <option value="2">2 Seats</option>
                      <option value="3">3 Seats</option>
                      <option value="4">4 Seats</option>
                      <option value="5">5+ Seats</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Price per Seat
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Trip Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell passengers about your trip (optional)"
                    rows={4}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-6">Car Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Car Model
                  </label>
                  <input
                    type="text"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleChange}
                    placeholder="e.g., Toyota Camry 2020"
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Car Color
                    </label>
                    <input
                      type="text"
                      name="carColor"
                      value={formData.carColor}
                      onChange={handleChange}
                      placeholder="e.g., Silver"
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      License Plate
                    </label>
                    <input
                      type="text"
                      name="carPlate"
                      value={formData.carPlate}
                      onChange={handleChange}
                      placeholder="e.g., ABC1234"
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-6">Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowPets"
                    checked={formData.allowPets}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Pets allowed</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowSmoking"
                    checked={formData.allowSmoking}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Smoking allowed</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Music Preference
                  </label>
                  <select
                    name="musicPreference"
                    value={formData.musicPreference}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="any">Any</option>
                    <option value="quiet">Quiet</option>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Safety Tips</p>
                <p className="text-sm text-blue-800 mt-1">
                  Verify passenger identities, share your trip details with trusted contacts, and always meet in public places.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLocation('/carpooling')}
                className="flex-1 py-3 px-4 bg-secondary text-foreground rounded-lg font-medium border border-border hover:bg-secondary/80 transition-smooth"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth"
              >
                Post Ride
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
