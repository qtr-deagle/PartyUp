import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StaffLayout from '@/components/StaffLayout';
import { Search, Star, MessageSquare, Filter } from 'lucide-react';
import { listFeedback, type FeedbackRow, type FeedbackType } from '@/lib/feedback';

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
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    const { data } = await listFeedback();
    setFeedback(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const filteredFeedback = useMemo(
    () =>
      feedback.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          !searchLower ||
          (item.author?.display_name ?? '').toLowerCase().includes(searchLower) ||
          (item.comment ?? '').toLowerCase().includes(searchLower);

        const matchesRating = !filterRating || item.rating.toString() === filterRating;

        return matchesSearch && matchesRating;
      }),
    [feedback, searchTerm, filterRating]
  );

  const stats = useMemo(() => {
    const total = feedback.length;
    const avgRating = total ? feedback.reduce((sum, item) => sum + item.rating, 0) / total : 0;
    const fiveStarPct = total ? Math.round((feedback.filter((item) => item.rating === 5).length / total) * 100) : 0;
    const needsReview = feedback.filter((item) => item.rating <= 2).length;

    return [
      {
        label: 'Total Feedback',
        value: total.toLocaleString(),
        icon: MessageSquare,
        color: 'bg-primary/10',
        textColor: 'text-primary',
      },
      {
        label: 'Avg Rating',
        value: `${avgRating.toFixed(1)}/5.0`,
        icon: Star,
        color: 'bg-yellow-500/10',
        textColor: 'text-yellow-500',
      },
      {
        label: '5-Star Reviews',
        value: `${fiveStarPct}%`,
        icon: Star,
        color: 'bg-green-500/10',
        textColor: 'text-green-500',
      },
      {
        label: 'Needs Review',
        value: needsReview.toString(),
        icon: MessageSquare,
        color: 'bg-orange-500/10',
        textColor: 'text-orange-500',
      },
    ];
  }, [feedback]);

  const getRatingColor = (rating: number) => {
    if (rating === 5) return 'text-green-500';
    if (rating === 4) return 'text-emerald-500';
    if (rating === 3) return 'text-yellow-500';
    if (rating === 2) return 'text-orange-500';
    return 'text-destructive';
  };

  const getFeedbackTypeColor = (type: FeedbackType) => {
    switch (type) {
      case 'trip':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'service':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'user':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getFeedbackTypeLabel = (type: FeedbackType) => {
    switch (type) {
      case 'trip':
        return 'Trip';
      case 'service':
        return 'Service';
      case 'user':
        return 'Traveler';
      default:
        return type;
    }
  };

  const getSubject = (item: FeedbackRow) => {
    if (item.feedback_type === 'user' && item.target_user?.display_name) {
      return `Rated ${item.target_user.display_name}`;
    }
    if (item.trip?.title) {
      return item.trip.title;
    }
    return 'Service feedback';
  };

  const formatRelativeTime = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return new Date(isoDate).toLocaleDateString();
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
          {isLoading ? (
            <div className="bg-card rounded-2xl p-8 shadow-elevation-2 border border-border text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 shadow-elevation-2 border border-border text-center text-sm text-muted-foreground">
              No feedback found
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl p-6 shadow-elevation-2 border border-border hover:border-primary/30 transition-smooth">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-foreground">{item.author?.display_name ?? 'Unknown'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(item.feedback_type)}`}>
                        {getFeedbackTypeLabel(item.feedback_type)}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(item.created_at)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">{getSubject(item)}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.comment || 'No written comment.'}</p>

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
            ))
          )}
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
