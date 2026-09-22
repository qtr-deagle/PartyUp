import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { ArrowLeft, Plus, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { createTour, TOUR_INTEREST_TAGS } from '@/lib/tours';

/**
 * Create Tour Page
 *
 * Users can create organized group tours:
 * - Set title, destination, dates
 * - Add description and itinerary
 * - Set pricing
 * - Define interests/themes
 */
export default function ToursCreate() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    origin: '',
    date: '',
    duration: '1',
    description: '',
    maxParticipants: '20',
    price: '',
    itinerary: [''],
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const isVerified = user?.verified ?? false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItineraryChange = (index: number, value: string) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index] = value;
    setFormData((prev) => ({ ...prev, itinerary: newItinerary }));
  };

  const handleAddItinerary = () => {
    setFormData((prev) => ({ ...prev, itinerary: [...prev.itinerary, ''] }));
  };

  const handleRemoveItinerary = (index: number) => {
    setFormData((prev) => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== index) }));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const handleCreateTour = async () => {
    if (!formData.title.trim() || !formData.destination.trim() || !formData.date || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const duration = Number.parseInt(formData.duration, 10);
    if (!duration || duration <= 0) {
      toast.error('Duration must be a positive number of days');
      return;
    }

    const maxParticipants = formData.maxParticipants.trim() ? Number.parseInt(formData.maxParticipants, 10) : null;
    if (formData.maxParticipants.trim() && (Number.isNaN(maxParticipants) || (maxParticipants ?? 0) <= 0)) {
      toast.error('Max participants must be a positive number');
      return;
    }

    const price = Number.parseFloat(formData.price);
    if (Number.isNaN(price) || price <= 0) {
      toast.error('Price per person must be a positive number');
      return;
    }

    setIsCreating(true);
    const { data, error } = await createTour({
      title: formData.title.trim(),
      origin: formData.origin.trim() || formData.destination.trim(),
      destination: formData.destination.trim(),
      startAt: new Date(formData.date).toISOString(),
      seatsTotal: maxParticipants,
      notes: formData.description.trim() || null,
      pricePerPerson: price,
      durationDays: duration,
      interests: selectedInterests,
      itinerary: formData.itinerary
        .map((description, index) => ({ dayNumber: index + 1, description: description.trim() }))
        .filter((day) => day.description.length > 0),
    });
    setIsCreating(false);

    if (error || !data) {
      toast.error(error?.message ?? 'Failed to create tour');
      return;
    }

    toast.success('Tour created successfully!');
    setLocation('/tours/manage');
  };

  if (!isVerified) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 max-w-lg mx-auto text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500" />
          <h2 className="text-lg font-bold text-foreground">Verify your identity to create a tour</h2>
          <p className="text-sm text-muted-foreground leading-6">
            {user?.verificationStatus === 'pending'
              ? 'Your ID verification is still under review. This usually takes 1-2 hours.'
              : user?.verificationStatus === 'rejected'
                ? 'Your last ID verification was rejected. Resubmit clearer documents to continue.'
                : 'Upload a government ID and a selfie to unlock tour creation.'}
          </p>
          {user?.verificationStatus !== 'pending' ? (
            <button
              onClick={() => setLocation('/profile')}
              className="mt-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth"
            >
              {user?.verificationStatus === 'rejected' ? 'Resubmit Documents' : 'Verify Now'}
            </button>
          ) : null}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-30 px-6 md:px-6 py-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setLocation('/tours')} className="p-1 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground">Create Tour</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Tour Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tour Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Boracay Beach Paradise"
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Meeting Point</label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="Where participants meet to start the tour"
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g., Boracay, Aklan"
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Duration (Days) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Participants</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="2"
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price per Person (₱) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 3500"
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your tour experience..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth resize-none"
                />
              </div>
            </div>
          </div>

          {/* Interests/Themes */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Tour Themes/Interests</h2>
            <div className="flex flex-wrap gap-2">
              {TOUR_INTEREST_TAGS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedInterests.includes(interest)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:border-primary border border-border'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Daily Itinerary</h2>
            <div className="space-y-3">
              {formData.itinerary.map((day, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-muted-foreground mb-1">Day {index + 1}</label>
                    <textarea
                      value={day}
                      onChange={(e) => handleItineraryChange(index, e.target.value)}
                      placeholder="Describe activities for this day..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth resize-none"
                    />
                  </div>
                  {formData.itinerary.length > 1 && (
                    <button onClick={() => handleRemoveItinerary(index)} className="mt-7 p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddItinerary}
              className="mt-4 flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-smooth font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Day
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setLocation('/tours')}
              className="flex-1 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-smooth"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleCreateTour()}
              disabled={isCreating}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Tour'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
