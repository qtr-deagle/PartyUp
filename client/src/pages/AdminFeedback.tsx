import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Search, Star, MessageSquare, User, Calendar, Filter, CheckCircle, Clock, 
  AlertCircle, ThumbsUp, TrendingUp, Download, X 
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

/**
 * Admin Feedback Management
 * 
 * Admin can:
 * - View all user feedback and reviews
 * - Filter by rating, date, type, status
 * - Respond to feedback
 * - Track feedback trends
 * - Export feedback reports
 */
export default function AdminFeedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  const feedback = [
    {
      id: 1,
      author: 'Sarah Johnson',
      authorAvatar: '👩',
      type: 'trip',
      subject: 'Amazing experience with John',
      message: 'Had a wonderful time on the Boracay trip. John was an excellent travel buddy, very responsible and fun!',
      rating: 5,
      date: '2 hours ago',
      status: 'unreviewed',
      tripDetails: 'Manila to Boracay • Feb 22-24',
    },
    {
      id: 2,
      author: 'Mike Chen',
      authorAvatar: '👨',
      type: 'car',
      subject: 'Great rental car condition',
      message: 'The Honda CR-V was in excellent condition. Smooth ride and very clean. Would rent again!',
      rating: 5,
      date: '5 hours ago',
      status: 'unreviewed',
      tripDetails: 'Honda CR-V • Vehicle ID: VH-2847',
    },
    {
      id: 3,
      author: 'Lisa Rodriguez',
      authorAvatar: '👩',
      type: 'trip',
      subject: 'Service issue during trip',
      message: 'The carpool ride was late by 20 minutes. Otherwise good experience.',
      rating: 3,
      date: '1 day ago',
      status: 'reviewed',
      tripDetails: 'Makati to Tagaytay • Feb 20',
    },
    {
      id: 4,
      author: 'James Williams',
      authorAvatar: '👨',
      type: 'car',
      subject: 'Vehicle issue',
      message: 'The GPS wasn\'t working properly. Please ensure all equipment is tested before rental.',
      rating: 2,
      date: '2 days ago',
      status: 'reviewed',
      tripDetails: 'Toyota Vios • Vehicle ID: TV-1423',
    },
    {
      id: 5,
      author: 'Emma Thompson',
      authorAvatar: '👩',
      type: 'trip',
      subject: 'Excellent communication',
      message: 'Great communication throughout the trip. Very responsive and helpful. Highly recommended!',
      rating: 5,
      date: '3 days ago',
      status: 'unreviewed',
      tripDetails: 'Cebu to Oslob • Feb 18-19',
    },
    {
      id: 6,
      author: 'David Park',
      authorAvatar: '👨',
      type: 'platform',
      subject: 'Feature suggestion',
      message: 'Would love to see group messaging feature for trip members. This would make coordination much easier!',
      rating: 4,
      date: '1 week ago',
      status: 'unreviewed',
      tripDetails: 'Feature Request • Priority: Medium',
    },
    {
      id: 7,
      author: 'Jessica Lee',
      authorAvatar: '👩',
      type: 'trip',
      subject: 'Had technical issues',
      message: 'The app crashed twice during the trip. Lost access to map tracking temporarily.',
      rating: 2,
      date: '2 days ago',
      status: 'reviewed',
      tripDetails: 'Bug Report • Status: Acknowledged',
    },
    {
      id: 8,
      author: 'Robert Martinez',
      authorAvatar: '👨',
      type: 'car',
      subject: 'Perfect rental experience',
      message: 'Everything was smooth from booking to return. Car was clean, staff was friendly. Excellent service!',
      rating: 5,
      date: '3 days ago',
      status: 'reviewed',
      tripDetails: 'Mitsubishi Montero • Vehicle ID: MM-5621',
    },
  ];

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !filterRating || item.rating.toString() === filterRating;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    const matchesType = !filterType || item.type === filterType;
    return matchesSearch && matchesRating && matchesStatus && matchesType;
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

  const handleRespond = (item: any) => {
    setSelectedFeedback(item);
    setIsResponseDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    toast.success('Response sent to ' + selectedFeedback.author);
    setResponseText('');
    setIsResponseDialogOpen(false);
    setSelectedFeedback(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
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

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'trip': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
      case 'car': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30';
      case 'platform': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'trip': return '🚗';
      case 'car': return '🚙';
      case 'platform': return '⚙️';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'trip': return 'Trip';
      case 'car': return 'Vehicle';
      case 'platform': return 'Platform';
      default: return 'Other';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Feedback Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Review and respond to user feedback</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth font-medium">
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

          <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-orange-200 bg-orange-50/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Unreviewed</p>
                <p className="text-3xl font-bold text-orange-600">{stats.unreviewed}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Avg Rating</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgRating} ⭐</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-green-200 bg-green-50/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Positive (4-5★)</p>
                <p className="text-3xl font-bold text-green-600">{stats.positive}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{Math.round(stats.positive / stats.total * 100)}% of total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 shadow-elevation-2 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Author or subject..."
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
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-sm"
              >
                <option value="">All Types</option>
                <option value="trip">🚗 Trip</option>
                <option value="car">🚙 Vehicle</option>
                <option value="platform">⚙️ Platform</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-sm"
              >
                <option value="">All Status</option>
                <option value="unreviewed">⏳ Unreviewed</option>
                <option value="reviewed">✓ Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map(item => (
              <div
                key={item.id}
                className={`bg-card rounded-xl shadow-elevation-2 border transition-all duration-200 hover:shadow-lg ${
                  item.status === 'unreviewed'
                    ? 'border-orange-300 bg-gradient-to-r from-orange-50/50 to-transparent'
                    : 'border-border'
                }`}
              >
                <div className="p-6">
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl flex-shrink-0">
                        {item.authorAvatar}
                      </div>

                      {/* Author Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-foreground">{item.author}</p>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)} {getTypeLabel(item.type)}
                          </span>
                          {item.status === 'unreviewed' && (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                              ⏳ Unreviewed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.tripDetails}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 ml-4">
                      {renderStars(item.rating)}
                      <span className="text-sm font-bold text-foreground ml-2">{item.rating}</span>
                    </div>
                  </div>

                  {/* Subject */}
                  <h3 className="font-bold text-foreground mb-2 text-base">{item.subject}</h3>

                  {/* Message */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.message}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {item.status === 'unreviewed' && (
                      <button
                        onClick={() => handleMarkAsReviewed(item.id)}
                        className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-smooth font-medium text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Reviewed
                      </button>
                    )}
                    <button
                      onClick={() => handleRespond(item)}
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
            <div className="py-16 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg font-medium">No feedback found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters to see more feedback</p>
            </div>
          )}
        </div>
      </div>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              {/* Original Feedback */}
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-xs text-muted-foreground font-medium mb-2">ORIGINAL FEEDBACK</p>
                <p className="text-sm text-foreground font-medium mb-1">{selectedFeedback.subject}</p>
                <p className="text-sm text-muted-foreground">{selectedFeedback.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  {renderStars(selectedFeedback.rating)}
                  <span className="text-xs font-medium text-foreground ml-2">From {selectedFeedback.author}</span>
                </div>
              </div>

              {/* Response Text */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Your Response</label>
                <Textarea
                  placeholder="Type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="min-h-24 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">{responseText.length} / 1000 characters</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsResponseDialogOpen(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendResponse}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth font-medium"
                >
                  Send Response
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
