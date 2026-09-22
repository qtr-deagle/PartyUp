import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Star, MessageSquare, Filter, ThumbsUp, AlertCircle, Download } from 'lucide-react';
import { listFeedback, type FeedbackRow, type FeedbackType } from '@/lib/feedback';

/**
 * Admin Feedback Management
 *
 * Admin can:
 * - View all real user feedback and reviews (feedback table)
 * - Filter by rating, type, and search text
 * - Export the current filtered view as CSV
 *
 * Note: the feedback table has no "reviewed" status and no response/reply
 * mechanism (no such column or RPC exists), so this page is read-only --
 * same scope as StaffFeedback.tsx, which this mirrors.
 */
export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterType, setFilterType] = useState<FeedbackType | ''>('');

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
        const matchesType = !filterType || item.feedback_type === filterType;
        return matchesSearch && matchesRating && matchesType;
      }),
    [feedback, searchTerm, filterRating, filterType]
  );

  const stats = useMemo(() => {
    const total = feedback.length;
    const avgRating = total ? feedback.reduce((sum, item) => sum + item.rating, 0) / total : 0;
    const positive = feedback.filter((item) => item.rating >= 4).length;
    const needsReview = feedback.filter((item) => item.rating <= 2).length;
    return { total, avgRating: avgRating.toFixed(1), positive, needsReview };
  }, [feedback]);

  const handleExport = () => {
    const header = ['Author', 'Type', 'Rating', 'Comment', 'Date'];
    const rows = filteredFeedback.map((item) => [
      item.author?.display_name ?? 'Unknown',
      getFeedbackTypeLabel(item.feedback_type),
      String(item.rating),
      (item.comment ?? '').replace(/"/g, '""'),
      new Date(item.created_at).toISOString(),
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Feedback Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Review user feedback and reviews</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth font-medium"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Total Feedback</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">All feedback received</p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Avg Rating</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgRating}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Positive (4-5★)</p>
                <p className="text-3xl font-bold text-foreground">{stats.positive}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{stats.total ? Math.round((stats.positive / stats.total) * 100) : 0}% of total</p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Needs Review</p>
                <p className="text-3xl font-bold text-foreground">{stats.needsReview}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Rated 2 stars or below</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Author or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Rating</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-sm"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FeedbackType | '')}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-sm"
              >
                <option value="">All Types</option>
                <option value="trip">Trip</option>
                <option value="user">Traveler</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-card rounded-xl p-8 shadow-elevation-2 border border-border text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <div key={item.id} className="bg-card rounded-xl shadow-elevation-2 border border-border transition-all duration-200 hover:shadow-lg">
                <div className="p-6">
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {(item.author?.display_name ?? '?').charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-foreground">{item.author?.display_name ?? 'Unknown'}</p>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getFeedbackTypeColor(item.feedback_type)}`}>
                            {getFeedbackTypeLabel(item.feedback_type)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {renderStars(item.rating)}
                      <span className="text-sm font-bold text-foreground ml-2">{item.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground mb-2 text-base">{getSubject(item)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.comment || 'No written comment.'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg font-medium">No feedback found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters to see more feedback</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
