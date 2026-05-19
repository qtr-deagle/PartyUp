import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

/**
 * Edit Profile Page
 * 
 * Allows users to update their profile information:
 * - Bio and personal details
 * - Profile photo
 * - Travel preferences
 * - Interests
 */
export default function EditProfile() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: 'Alex',
    age: '25',
    location: 'San Francisco, CA',
    bio: 'Adventure seeker and travel enthusiast! Love exploring new cultures, trying local food, and making new friends. Always up for hiking, museums, and spontaneous adventures.',
    travelStyle: 'explorer',
    budget: 'mid-range',
  });

  const [interests, setInterests] = useState([
    'Hiking',
    'Museums',
    'Food',
    'Photography',
    'Beaches',
  ]);

  const [newInterest, setNewInterest] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const allInterests = [
    'Hiking', 'Museums', 'Food', 'Photography', 'Beaches',
    'Shopping', 'Nightlife', 'History', 'Nature', 'Art',
    'Adventure', 'Relaxation'
  ];

  const availableInterests = allInterests.filter(i => !interests.includes(i));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setInterests(prev => [...prev, newInterest]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(prev => prev.filter(i => i !== interest));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      setLocation('/profile');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-30 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation('/profile')}
              className="p-1 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h1 className="text-base font-bold text-foreground">Edit Profile</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-xs hover:shadow-lg transition-smooth disabled:opacity-50 flex-shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="space-y-8">
          {/* Profile Photo Section */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">A</span>
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth cursor-pointer w-fit">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" />
                </label>
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">{formData.bio.length}/500 characters</p>
              </div>
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Travel Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Travel Style</label>
                <select
                  name="travelStyle"
                  value={formData.travelStyle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                >
                  <option value="explorer">Explorer - Love discovering new places</option>
                  <option value="relaxation">Relaxation - Prefer calm, peaceful trips</option>
                  <option value="party">Party - Always ready for nightlife</option>
                  <option value="budget">Budget - Looking for value experiences</option>
                  <option value="luxury">Luxury - Premium experiences matter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Budget</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                >
                  <option value="budget">Budget (₱ 50-150/day)</option>
                  <option value="mid-range">Mid-range (₱ 150-500/day)</option>
                  <option value="luxury">Luxury (₱ 500+/day)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Interests</h2>
            
            {/* Add Interest */}
            <div className="mb-6 flex gap-2">
              <select
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              >
                <option value="">Select an interest to add...</option>
                {availableInterests.map(interest => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
              <button
                onClick={handleAddInterest}
                disabled={!newInterest}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {/* Selected Interests */}
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <div
                  key={interest}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full"
                >
                  <span className="text-sm font-medium text-foreground">{interest}</span>
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="p-1 hover:bg-primary/20 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-primary" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setLocation('/profile')}
              className="flex-1 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-smooth"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
