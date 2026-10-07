import { useRef } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_SIZE_OPTIONS, type Pagination } from '@/hooks/usePagination';
import { cn } from '@/lib/utils';

// 1 … 4 5 6 … 12
function pageList(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5));
  if (start > 2) pages.push('gap');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < pageCount - 1) pages.push('gap');
  pages.push(pageCount);
  return pages;
}

const navButton =
  'inline-flex items-center justify-center gap-1 h-8 min-w-8 px-2 rounded-md text-sm transition-smooth disabled:opacity-40 disabled:pointer-events-none';

interface TablePaginationProps {
  pagination: Pagination;
  /** Noun for the summary line, e.g. "users". */
  itemLabel?: string;
  /** Narrow lists (review queues): just "1–10 of 43" and arrows. */
  compact?: boolean;
  className?: string;
}

// Pager for admin tables. Put it at the bottom of the table card; on page
// change it scrolls the closest `[data-paginated]` ancestor back into view
// (falls back to its parent) since <main> is the scroll container.
export default function TablePagination({ pagination, itemLabel = 'results', compact = false, className }: TablePaginationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { page, pageCount, pageSize, total, from, setPage, setPageSize } = pagination;

  // Nothing to page through at the smallest page size.
  if (total <= PAGE_SIZE_OPTIONS[0]) return null;

  const go = (next: number) => {
    if (next < 1 || next > pageCount || next === page) return;
    setPage(next);
    const scope = ref.current?.closest('[data-paginated]') ?? ref.current?.parentElement;
    if (scope && scope.getBoundingClientRect().top < 0) scope.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const first = from + 1;
  const last = Math.min(from + pageSize, total);
  const summary = compact ? `${first}–${last} of ${total}` : `Showing ${first}–${last} of ${total} ${itemLabel}`;

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between gap-3 border-t border-border',
        compact ? 'px-3 py-2' : 'flex-wrap px-6 py-3',
        className
      )}
    >
      <span className="text-xs text-muted-foreground whitespace-nowrap">{summary}</span>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button type="button" className={cn(navButton, 'hover:bg-secondary')} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
          {!compact && <span className="hidden sm:inline">Prev</span>}
        </button>

        {!compact &&
          pageList(page, pageCount).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} aria-hidden className="inline-flex h-8 w-6 items-center justify-center text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => go(p)}
                aria-current={p === page ? 'page' : undefined}
                className={cn(
                  navButton,
                  p === page ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground hover:bg-secondary'
                )}
              >
                {p}
              </button>
            )
          )}

        <button type="button" className={cn(navButton, 'hover:bg-secondary')} onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Next page">
          {!compact && <span className="hidden sm:inline">Next</span>}
          <ChevronRight className="w-4 h-4" />
        </button>

        {!compact && (
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger size="sm" className="ml-2 w-auto shrink-0 whitespace-nowrap bg-card" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </nav>
    </div>
  );
}
