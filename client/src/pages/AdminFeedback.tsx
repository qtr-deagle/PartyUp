import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { AlertCircle, Download, MessageSquare, Quote, Search, Star, ThumbsUp, X } from 'lucide-react';
import { Avatar, EmptyState, PageHeader, Pill, SearchField, Segmented, StatGrid, StatTile, type PillTone } from '@/components/admin/AdminUI';
import { listFeedback, type FeedbackRow, type FeedbackType } from '@/lib/feedback';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { useClientPagination } from '@/hooks/usePagination';
import TablePagination from '@/components/TablePagination';
import { formatDateTime } from '@/lib/datetime';

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

  // `silent` refreshes (realtime / tab focus) skip the loading state.
  const loadFeedback = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const { data } = await listFeedback();
    setFeedback(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  useTableRealtime('feedback', () => void loadFeedback(true));

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

  const feedbackPage = useClientPagination(filteredFeedback, [searchTerm, filterRating, filterType]);

  const stats = useMemo(() => {
    const total = feedback.length;
    const avgRating = total ? feedback.reduce((sum, item) => sum + item.rating, 0) / total : 0;
    const positive = feedback.filter((item) => item.rating >= 4).length;
    const needsReview = feedback.filter((item) => item.rating <= 2).length;
    const byStar = [5, 4, 3, 2, 1].map((star) => ({ star, count: feedback.filter((item) => item.rating === star).length }));
    return { total, avgRating: avgRating.toFixed(1), positive, needsReview, byStar };
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
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );

  const TYPE_TONE: Record<string, PillTone> = { trip: 'blue', service: 'violet', user: 'green' };

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

  const maxStar = Math.max(1, ...stats.byStar.map((row) => row.count));
  const filtered = searchTerm.trim() !== '' || filterRating !== '' || filterType !== '';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Feedback" subtitle="Ratings and reviews from travelers, read-only">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 h-10 px-4 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-secondary transition-smooth"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </PageHeader>

        <StatGrid>
          <StatTile icon={MessageSquare} tone="bg-primary/10 text-primary" label="Total feedback" value={stats.total} />
          <StatTile icon={Star} tone="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" label="Average rating" value={stats.avgRating} hint="Out of 5 stars" />
          <StatTile
            icon={ThumbsUp}
            tone="bg-green-500/15 text-green-600 dark:text-green-400"
            label="Positive (4-5★)"
            value={stats.positive}
            hint={`${stats.total ? Math.round((stats.positive / stats.total) * 100) : 0}% of total`}
          />
          <StatTile icon={AlertCircle} tone="bg-orange-500/15 text-orange-600 dark:text-orange-400" label="Low (1-2★)" value={stats.needsReview} hint="Worth a closer look" />
        </StatGrid>

        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          {/* Ratings breakdown: click a row to filter */}
          <aside className="rounded-2xl border border-border bg-card p-5 shadow-elevation-2 lg:sticky lg:top-0">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-foreground">{stats.avgRating}</p>
              <div className="pb-1.5">{renderStars(Math.round(Number(stats.avgRating)))}</div>
            </div>
            <p className="text-xs text-muted-foreground">{stats.total} ratings</p>
            <div className="mt-4 space-y-1">
              {stats.byStar.map(({ star, count }) => {
                const active = filterRating === String(star);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilterRating(active ? '' : String(star))}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                      active ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-secondary'
                    }`}
                  >
                    <span className="flex w-7 items-center gap-0.5 font-semibold text-foreground">
                      {star}
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <span
                        className={`block h-full rounded-full ${star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-400' : 'bg-orange-500'}`}
                        style={{ width: `${(count / maxStar) * 100}%` }}
                      />
                    </span>
                    <span className="w-7 text-right tabular-nums text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </div>
            {filterRating && (
              <button
                type="button"
                onClick={() => setFilterRating('')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <X className="w-3 h-3" /> Clear rating filter
              </button>
            )}
          </aside>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search author or comment..." />
              <Segmented
                value={filterType}
                options={[
                  { value: '' as const, label: 'All' },
                  { value: 'trip' as const, label: 'Trips' },
                  { value: 'user' as const, label: 'Travelers' },
                  { value: 'service' as const, label: 'Service' },
                ]}
                onChange={setFilterType}
              />
            </div>

            <div data-paginated className="space-y-3">
              {isLoading ? (
                [0, 1, 2].map((i) => <div key={i} className="h-32 rounded-2xl border border-border bg-card animate-pulse" />)
              ) : filteredFeedback.length > 0 ? (
                feedbackPage.pageItems.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-2xl border bg-card p-5 shadow-elevation-1 transition-smooth hover:shadow-elevation-2 ${
                      item.rating <= 2 ? 'border-orange-400/40' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={item.author?.display_name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{item.author?.display_name ?? 'Unknown'}</p>
                          <Pill tone={TYPE_TONE[item.feedback_type] ?? 'gray'}>{getFeedbackTypeLabel(item.feedback_type)}</Pill>
                          <span className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</span>
                        </div>
                        <p className="mt-0.5 truncate text-sm font-medium text-muted-foreground">{getSubject(item)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
                        {renderStars(item.rating)}
                        <span className="text-xs font-bold text-foreground">{item.rating}</span>
                      </div>
                    </div>
                    {item.comment ? (
                      <div className="relative mt-3 rounded-xl bg-secondary/50 px-4 py-3 pl-10">
                        <Quote className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/40" />
                        <p className="text-sm leading-relaxed text-foreground">{item.comment}</p>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs italic text-muted-foreground">No written comment.</p>
                    )}
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/50">
                  <EmptyState
                    icon={filtered ? Search : MessageSquare}
                    title={filtered ? 'No feedback matches these filters' : 'No feedback yet'}
                    text={filtered ? 'Try a different search, rating or type.' : 'Ratings from the app show up here.'}
                  />
                </div>
              )}
              {!isLoading && (
                <TablePagination pagination={feedbackPage} itemLabel="reviews" className="bg-card rounded-2xl border border-border shadow-elevation-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
