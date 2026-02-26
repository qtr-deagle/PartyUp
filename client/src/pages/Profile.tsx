import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Star, MapPin, Shield, Edit2, LogOut, Users, MessageSquare, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

/**
 * PartyUp Profile Screen
 * 
 * Design: Minimalist Luxury
 * Mobile View:
 * - User photo and basic info
 * - Bio and travel experience
 * - Ratings and reviews
 * - Verification badge
 * - Trusted circle management
 * - Location toggle
 * - Emergency contacts
 * 
 * Desktop View:
 * - Comprehensive profile layout
 * - Edit profile option
 * - Ratings and reviews panel
 * - Trusted circle sidebar
 */
export default function Profile() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [trustedCircle] = useState([
    { id: 1, name: 'Mom', phone: '+1 (555) 123-4567', verified: true },
    { id: 2, name: 'Best Friend Sarah', phone: '+1 (555) 987-6543', verified: true },
    { id: 3, name: 'Dad', phone: '+1 (555) 456-7890', verified: true },
  ]);

  const [reviews] = useState([
    {
      id: 1,
      author: 'Sarah',
      rating: 5,
      text: 'Amazing travel buddy! Very responsible and fun to be around.',
      date: '2 weeks ago',
    },
    {
      id: 2,
      author: 'Mike',
      rating: 5,
      text: 'Great communication and very reliable. Highly recommended!',
      date: '1 month ago',
    },
    {
      id: 3,
      author: 'Emma',
      rating: 4,
      text: 'Good company and flexible with plans. Would travel again!',
      date: '2 months ago',
    },
  ]);

  const handleLogout = () => {
    toast.success('Logged out successfully');
  };

  return (
    <Layout>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center">
        <div className="flex-1 flex items-center justify-start">
          <button
            onClick={() => setLocation('/settings')}
            className="p-2 rounded-lg hover:bg-secondary transition-smooth"
          >
            <Settings className="w-5 h-5 text-primary" />
          </button>

        </div>
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-primary whitespace-nowrap">Alex</h1>
        </div>
        <div className="flex-1 flex items-center justify-end">
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 bg-card border-b border-border z-30">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-2">Manage your travel buddy profile</p>
          </div>
          <button
            onClick={() => setLocation('/settings')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-smooth"
          >
            <Edit2 className="w-5 h-5" />
            <span className="text-sm font-medium">Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {/* Profile Card */}
          <div className="card-luxury p-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-accent/20 mx-auto mb-4"></div>

            {/* User Info */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">Alex, 25</h2>
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">San Francisco, CA</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">4.9 rating (12 reviews)</p>
            </div>

            {/* Bio */}
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-sm text-foreground leading-relaxed">
                Adventure seeker and travel enthusiast! Love exploring new cultures, trying local food, and making new friends. Always up for hiking, museums, and spontaneous adventures.
              </p>
            </div>

            {/* Travel Experience */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="font-bold text-sm mb-3">Travel Experience</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Countries Visited</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Solo Trips</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Group Trips</span>
                  <span className="font-bold">4</span>
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="mb-6">
              <h3 className="font-bold text-sm mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {['Hiking', 'Food Tours', 'Museums', 'Photography', 'Nightlife', 'Local Culture'].map((interest, i) => (
                  <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="card-luxury p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Verification Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                <span className="text-sm">Email Verified</span>
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                <span className="text-sm">Phone Verified</span>
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                <span className="text-sm">ID Verified</span>
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
            </div>
          </div>

          {/* Trusted Circle */}
          <div className="card-luxury p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Trusted Circle
            </h3>
            <div className="space-y-3 mb-4">
              {trustedCircle.map((contact) => (
                <div key={contact.id} className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{contact.phone}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary">
              Add Contact
            </button>
          </div>

          {/* Reviews */}
          <div className="card-luxury p-6">
            <h3 className="font-bold text-lg mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="pb-4 border-b border-border last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{review.author}</p>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="card-luxury p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Emergency Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              When you activate SOS, your location will be shared with your trusted circle and our safety team.
            </p>
            <button className="w-full py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
              Manage Emergency Contacts
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3 border border-destructive text-destructive rounded-lg font-medium transition-smooth hover:bg-destructive/5"
          >
            <LogOut className="w-5 h-5 mx-auto" />
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="card-luxury p-8">
              <div className="flex items-start gap-8 mb-8 pb-8 border-b border-border">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 shrink-0"></div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">Alex, 25</h2>
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">San Francisco, CA</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-500 fill-yellow-500"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">4.9 rating (12 reviews)</p>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-8 pb-8 border-b border-border">
                <h3 className="font-bold text-lg mb-3">About</h3>
                <p className="text-foreground leading-relaxed">
                  Adventure seeker and travel enthusiast! Love exploring new cultures, trying local food, and making new friends. Always up for hiking, museums, and spontaneous adventures.
                </p>
              </div>

              {/* Travel Experience */}
              <div className="mb-8 pb-8 border-b border-border">
                <h3 className="font-bold text-lg mb-4">Travel Experience</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-3xl font-bold text-primary">12</p>
                    <p className="text-sm text-muted-foreground mt-2">Countries</p>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <p className="text-3xl font-bold text-accent">8</p>
                    <p className="text-sm text-muted-foreground mt-2">Solo Trips</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-3xl font-bold text-primary">4</p>
                    <p className="text-sm text-muted-foreground mt-2">Group Trips</p>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div>
                <h3 className="font-bold text-lg mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {['Hiking', 'Food Tours', 'Museums', 'Photography', 'Nightlife', 'Local Culture'].map((interest, i) => (
                    <span key={i} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card-luxury p-8">
              <h3 className="font-bold text-2xl mb-6">Recent Reviews</h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-border last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-lg">{review.author}</p>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-8">
            {/* Verification Status */}
            <div className="card-luxury p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Verification
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                  <span className="text-sm">Email</span>
                  <span className="text-xs font-bold text-accent">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                  <span className="text-sm">Phone</span>
                  <span className="text-xs font-bold text-accent">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                  <span className="text-sm">ID</span>
                  <span className="text-xs font-bold text-accent">✓</span>
                </div>
              </div>
            </div>

            {/* Trusted Circle */}
            <div className="card-luxury p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Trusted Circle
              </h3>
              <div className="space-y-3 mb-4">
                {trustedCircle.map((contact) => (
                  <div key={contact.id} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{contact.phone}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 border border-border rounded-lg text-sm font-medium transition-smooth hover:bg-secondary">
                Add Contact
              </button>
            </div>

            {/* Emergency */}
            <div className="card-luxury p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Emergency
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                When you activate SOS, your location is shared with your trusted circle and our safety team.
              </p>
              <button className="w-full py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-md">
                Manage Contacts
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-3 border border-destructive text-destructive rounded-lg font-medium transition-smooth hover:bg-destructive/5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
