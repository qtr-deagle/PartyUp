import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { ArrowLeft, Edit2, Trash2, Users, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

/**
 * Manage Tours Page
 * 
 * Tour organizers can:
 * - View their created tours
 * - Edit tour details
 * - View participants
 * - Cancel/delete tours
 */
export default function ToursManage() {
  const [, setLocation] = useLocation();
  const [myTours] = useState([
    {
      id: 1,
      title: 'Boracay Beach Paradise',
      destination: 'Boracay, Aklan',
      date: '2026-03-15',
      duration: '3 days',
      participants: 12,
      maxParticipants: 20,
      price: 3500,
      status: 'active',
      rating: 4.9,
      reviews: 48,
    },
    {
      id: 2,
      title: 'Hiking & Waterfall Adventure',
      destination: 'Tanay, Rizal',
      date: '2026-03-22',
      duration: '1 day',
      participants: 6,
      maxParticipants: 12,
      price: 1200,
      status: 'active',
      rating: 4.6,
      reviews: 28,
    },
    {
      id: 3,
      title: 'Mountain Expedition',
      destination: 'Mt. Pulag, Benguet',
      date: '2026-02-10',
      duration: '2 days',
      participants: 8,
      maxParticipants: 15,
      price: 2800,
      status: 'completed',
      rating: 4.8,
      reviews: 32,
    },
  ]);

  const handleEditTour = (tourId: number) => {
    toast.info('Edit functionality coming soon');
  };

  const handleDeleteTour = (tourId: number) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        success: 'Tour deleted successfully',
        error: 'Failed to delete tour',
      }
    );
  };

  const handleViewParticipants = (tourId: number) => {
    toast.info('View participants - coming soon');
  };

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-30 px-4 md:px-6 py-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation('/tours')}
              className="p-1 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h1 className="text-base font-bold text-foreground">My Tours</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <div className="bg-secondary p-1.5 rounded text-center">
            <p className="text-muted-foreground">Active</p>
            <p className="font-bold text-foreground text-sm">{myTours.filter(t => t.status === 'active').length}</p>
          </div>
          <div className="bg-secondary p-1.5 rounded text-center">
            <p className="text-muted-foreground">People</p>
            <p className="font-bold text-foreground text-sm">{myTours.reduce((sum, t) => sum + t.participants, 0)}</p>
          </div>
          <div className="bg-secondary p-1.5 rounded text-center">
            <p className="text-muted-foreground">Rating</p>
            <p className="font-bold text-foreground text-sm">4.8★</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8">
        <div className="space-y-6">
          {/* Active Tours */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Active Tours</h2>
            <div className="space-y-4">
              {myTours.filter(t => t.status === 'active').map(tour => (
                <div key={tour.id} className="bg-card rounded-2xl p-6 border border-border hover:border-primary transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs font-semibold text-green-600">Active</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{tour.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">₱{tour.price.toLocaleString()}/person</p>
                      <p className="text-xs text-yellow-600">★ {tour.rating}</p>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        <p className="text-sm font-medium text-foreground">{tour.destination}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date & Duration</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        <p className="text-sm font-medium text-foreground">{tour.date}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3" />
                        <p className="text-sm font-medium text-foreground">{tour.participants}/{tour.maxParticipants}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                      <p className="text-sm font-medium text-foreground mt-1">{tour.reviews} reviews</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleViewParticipants(tour.id)}
                      className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-smooth font-medium"
                    >
                      View Participants
                    </button>
                    <button
                      onClick={() => handleEditTour(tour.id)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDeleteTour(tour.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Tours */}
          {myTours.filter(t => t.status === 'completed').length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Completed Tours</h2>
              <div className="space-y-4">
                {myTours.filter(t => t.status === 'completed').map(tour => (
                  <div key={tour.id} className="bg-card rounded-2xl p-6 border border-border opacity-75">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          <span className="text-xs font-semibold text-gray-600">Completed</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{tour.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{tour.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-yellow-600">★ {tour.rating}</p>
                        <p className="text-xs text-muted-foreground">{tour.reviews} reviews</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myTours.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">You haven't created any tours yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
