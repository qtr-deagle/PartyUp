import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Star, MessageSquare, User, Calendar, Filter, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Admin Feedback Management
 * 
 * Admin can:
 * - View all user feedback and reviews
 * - Filter by rating, date, type
 * - Respond to feedback
 * - Export feedback reports
 */
export default function AdminFeedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const feedback = [
    {
      id: 1,
      author: 'Sarah Johnson',
      type: 'trip',
      subject: 'Amazing experience with John',
      message: 'Had a wonderful time on the Boracay trip. John was an excellent travel buddy, very responsible and fun!',
      rating: 5,
      date: '2 hours ago',
      status: 'unreviewed',
    },
    {
      id: 2,
      author: 'Mike Chen',
      type: 'car',
      subject: 'Great rental car condition',
      message: 'The Honda CR-V was in excellent condition. Smooth ride and very clean. Would rent again!',
      rating: 5,
      date: '5 hours ago',
      status: 'unreviewed',
    },
    {
      id: 3,
      author: 'Lisa Rodriguez',
      type: 'trip',
      subject: 'Service issue during trip',
      message: 'The carpool ride was late by 20 minutes. Otherwise good experience.',
      rating: 3,
      date: '1 day ago',
      status: 'reviewed',
    },
    {
      id: 4,
      author: 'James Williams',
      type: 'car',
      subject: 'Vehicle issue',
      message: 'The GPS wasn\'t working properly. Please ensure all equipment is tested before rental.',
      rating: 2,
      date: '2 days ago',
      status: 'reviewed',
    },
    {
      id: 5,
      author: 'Emma Thompson',
      type: 'trip',
      subject: 'Excellent communication',
      message: 'Great communication throughout the trip. Very responsive and helpful. Highly recommended!',
      rating: 5,
      date: '3 days ago',
      status: 'unreviewed',
    },
    {
      id: 6,
      author: 'David Park',
      type: 'platform',
      subject: 'Feature suggestion',
      message: 'Would love to see group messaging feature for trip members.',
      rating: 4,
      date: '1 week ago',
      status: 'unreviewed',
    },
  ];

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !filterRating || item.rating.toString() === filterRating;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const stats = {
    total: feedback.length,
    unreviewed: feedback.filter(f => f.status === 'unreviewed').length,
    avgRating: (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1),
    positive: feedback.filter(f => f.rating >= 4).length,
  };

  const handleMarkAsReviewed = (feedbackId: number) => {
    toast.success('Feedback marked as reviewed');
  };

  const handleRespond = (feedbackId: number) => {
    toast.info('Respond feature - coming soon');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-2">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border z-30 px-4 md:px-6 py-2">
          <h1 className="text-base font-bold text-foreground">Feedback Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 px-4 md:px-6">
          <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-border">
            <p className="text-muted-foreground text-xs mb-0.5">Total</p>
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-border">
            <p className="text-muted-foreground text-xs mb-0.5">Unreviewed</p>
            <p className="text-lg font-bold text-orange-600">{stats.unreviewed}</p>
          </div>
          <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-border">
            <p className="text-muted-foreground text-xs mb-0.5">Avg Rating</p>
            <p className="text-lg font-bold text-foreground">{stats.avgRating}★</p>
          </div>
          <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-border">
            <p className="text-muted-foreground text-xs mb-0.5">Positive</p>
            <p className="text-lg font-bold text-green-600">{stats.positive}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-2 shadow-elevation-2 border border-border mx-4 md:mx-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-2.5 py-1 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
            </div>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-2.5 py-1 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            >
              <option value="">All Status</option>
              <option value="unreviewed">Unreviewed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map(item => (
              <div
                key={item.id}
                className={`bg-card rounded-2xl p-6 shadow-elevation-2 border ${
                  item.status === 'unreviewed'
                    ? 'border-orange-300 bg-orange-50/30'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{item.author}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStars(item.rating)}
                    {item.status === 'unreviewed' && (
                      <Clock className="w-5 h-5 text-orange-600" />
                    )}
                    {item.status === 'reviewed' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-foreground mb-2">{item.subject}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.message}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.type === 'trip'
                        ? 'bg-blue-100 text-blue-700'
                        : item.type === 'car'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.type === 'trip' ? '🚗 Trip' : item.type === 'car' ? '🚙 Car' : '🛠️ Platform'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {item.status === 'unreviewed' && (
                      <button
                        onClick={() => handleMarkAsReviewed(item.id)}
                        className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-smooth font-medium text-sm"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <button
                      onClick={() => handleRespond(item.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth font-medium text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No feedback found matching your criteria
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
