import React, { useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, Star, MessageSquare, Filter } from 'lucide-react';

/**
 * Staff Feedback Monitoring (View Only)
 * 
 * Staff can:
 * - View all user feedback and reviews
 * - Monitor feedback trends
 * - See rating distributions
 * - Track user satisfaction
 */
export default function StaffFeedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');

  const feedback = [
    {
      id: 1,
      author: 'Sarah Johnson',
      type: 'trip',
      subject: 'Amazing experience with John',
      message: 'Had a wonderful time on the Boracay trip. John was an excellent travel buddy, very responsible and fun!',
      rating: 5,
      date: '2 hours ago',
    },
    {
      id: 2,
      author: 'Mike Chen',
      type: 'car',
      subject: 'Great rental car condition',
      message: 'The Honda CR-V was in excellent condition. Smooth ride and very clean. Would rent again!',
      rating: 5,
      date: '5 hours ago',
    },
    {
      id: 3,
      author: 'Lisa Rodriguez',
      type: 'trip',
      subject: 'Service issue during trip',
      message: 'The carpool ride was late by 20 minutes. Otherwise good experience.',
      rating: 3,
      date: '1 day ago',
    },
    {
      id: 4,
      author: 'James Wilson',
      type: 'user',
      subject: 'Great platform overall',
      message: 'Love using PartyUp! The matching algorithm works great and I meet awesome people.',
      rating: 5,
      date: '2 days ago',
    },
    {
      id: 5,
      author: 'Emma Davis',
      type: 'trip',
      subject: 'Needs improvement',
      message: 'App crashed twice during booking. Please fix these bugs.',
      rating: 2,
      date: '3 days ago',
    },
  ];

  const filteredFeedback = feedback.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.author.toLowerCase().includes(searchLower) ||
      item.subject.toLowerCase().includes(searchLower) ||
      item.message.toLowerCase().includes(searchLower);

    const matchesRating = !filterRating || item.rating.toString() === filterRating;

    return matchesSearch && matchesRating;
  });

  const stats = [
    {
      label: 'Total Feedback',
      value: '1,243',
      icon: MessageSquare,
      color: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      label: 'Avg Rating',
      value: '4.7/5.0',
      icon: Star,
      color: 'bg-yellow-500/10',
      textColor: 'text-yellow-500'
    },
    {
      label: '5-Star Reviews',
      value: '78%',
      icon: Star,
      color: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      label: 'Needs Review',
      value: '12',
      icon: MessageSquare,
      color: 'bg-orange-500/10',
      textColor: 'text-orange-500'
    },
  ];

  const getRatingColor = (rating: number) => {
    if (rating === 5) return 'text-green-500';
    if (rating === 4) return 'text-emerald-500';
    if (rating === 3) return 'text-yellow-500';
    if (rating === 2) return 'text-orange-500';
    return 'text-destructive';
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'trip':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'car':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'user':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feedback Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-2">Monitor user feedback and reviews (Staff View)</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`${stat.textColor} w-6 h-6`} />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search feedback by author or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            />
          </div>
          <div className="flex gap-2">
            <Filter className="w-5 h-5 text-muted-foreground mt-3" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border hover:border-primary/30 transition-smooth">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-foreground">{item.author}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(item.type)}`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{item.subject}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.message}</p>

                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating ? `${getRatingColor(item.rating)} fill-current` : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className={`text-sm font-semibold ml-2 ${getRatingColor(item.rating)}`}>
                      {item.rating}.0/5.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> This is a view-only interface for staff monitoring. Staff can track feedback trends,
            identify patterns, and escalate critical feedback to administrators. For response management and detailed analysis,
            contact the admin panel.
          </p>
        </div>
      </div>
    </StaffLayout>
  );
}
