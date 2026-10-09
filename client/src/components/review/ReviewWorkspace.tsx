import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, ImageOff, Maximize2, Search, XCircle } from 'lucide-react';
import TablePagination from '@/components/TablePagination';
import type { Pagination } from '@/hooks/usePagination';
import { cn } from '@/lib/utils';

// Building blocks for the admin review screens (ID and vehicle verification).
// The page fills the viewport and never scrolls: the queue and the side panel
// scroll on their own, the photos stay in view, and Approve/Reject stay pinned
// at the bottom. Keyboard: Q/W or up/down move through the queue, A/D or
// left/right flip photos, E approves, R rejects.

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

const STATUS_STYLE: Record<ReviewStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
};

const STATUS_DOT: Record<ReviewStatus, string> = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};

export function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLE[status as ReviewStatus] ?? 'bg-secondary text-foreground';
  return <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap', style)}>{status}</span>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-secondary px-1 font-mono text-[10px] font-semibold text-muted-foreground">
      {children}
    </kbd>
  );
}

/** Full-height page shell: toolbar on top, workspace below. Scrolls normally below lg. */
export function ReviewPage({ toolbar, children }: { toolbar: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 lg:h-full lg:min-h-0">
      {toolbar}
      <div className="grid gap-5 lg:flex-1 lg:min-h-0 lg:grid-cols-[minmax(17rem,20rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        {children}
      </div>
    </div>
  );
}

export function ReviewToolbar({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="mr-auto min-w-0">
        <h1 className="text-2xl font-bold text-foreground leading-tight">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function StatChip({ icon: Icon, label, value, tone }: { icon: ComponentType<{ className?: string }>; label: string; value: ReactNode; tone: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 shadow-elevation-1">
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', tone)}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="leading-tight">
        <p className="text-base font-bold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground whitespace-nowrap">{label}</p>
      </div>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-9 pr-3 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
      />
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex h-10 items-center gap-1 rounded-lg border border-border bg-secondary p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
            value === option.value ? 'bg-card text-foreground shadow-elevation-1' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function QueuePanel({
  title,
  count,
  isLoading,
  emptyText,
  pagination,
  itemLabel,
  children,
}: {
  title: string;
  count: number;
  isLoading: boolean;
  emptyText: string;
  pagination: Pagination;
  itemLabel: string;
  children: ReactNode;
}) {
  return (
    <section
      data-paginated
      className="flex flex-col min-h-0 max-lg:max-h-[28rem] rounded-2xl border border-border bg-card shadow-elevation-2 overflow-hidden"
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">{count}</span>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-1.5">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => <div key={i} className="h-[4.5rem] rounded-xl bg-secondary animate-pulse" />)
        ) : count === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10 px-4">{emptyText}</p>
        ) : (
          children
        )}
      </div>
      {!isLoading && <TablePagination pagination={pagination} itemLabel={itemLabel} compact className="border-t border-border px-3 py-2" />}
    </section>
  );
}

export function QueueItem({
  selected,
  onSelect,
  title,
  subtitle,
  meta,
  status,
  badges,
  avatar,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  /** Text for the avatar initial; defaults to the title. */
  avatar?: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  status?: string;
  badges?: ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left flex gap-3 rounded-xl px-3 py-2.5 border transition-colors',
        selected ? 'bg-primary/10 border-primary/50' : 'border-transparent hover:bg-secondary'
      )}
    >
      <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {(avatar ?? title).charAt(0).toUpperCase()}
        {status && (
          <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card', STATUS_DOT[status as ReviewStatus] ?? 'bg-muted')} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
        {subtitle && <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>}
        {(meta || badges) && (
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            {meta}
            {badges}
          </span>
        )}
      </span>
    </button>
  );
}

/** The right-hand review card: header, body (fills the rest), pinned footer. */
export function DetailPanel({ header, footer, children }: { header: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col min-h-0 rounded-2xl border border-border bg-card shadow-elevation-2 overflow-hidden">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 border-b border-border">{header}</header>
      <div className="flex-1 min-h-0 p-4">{children}</div>
      {footer}
    </section>
  );
}

export function DetailHeading({ name, email, children }: { name: string; email?: string | null; children?: ReactNode }) {
  return (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 mr-auto">
        <h3 className="truncate text-base font-bold text-foreground">{name}</h3>
        {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </>
  );
}

export function EmptyDetail({ icon: Icon, text }: { icon: ComponentType<{ className?: string }>; text: string }) {
  return (
    <section className="flex min-h-[20rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <Icon className="w-12 h-12 text-muted-foreground/50" />
      <p className="text-muted-foreground">{text}</p>
      <p className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
        <Kbd>Q</Kbd>
        <Kbd>W</Kbd> to move through the queue
      </p>
    </section>
  );
}

/** A labelled box of facts in the side panel. */
export function InfoCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-secondary/60 p-3', className)}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

export function DecisionBar({
  pending,
  onApprove,
  onReject,
  approveLabel = 'Approve',
  closedNote,
}: {
  pending: boolean;
  onApprove: () => void;
  onReject: () => void;
  approveLabel?: string;
  /** Shown instead of the buttons once the item is decided. */
  closedNote?: ReactNode;
}) {
  return (
    <footer className="flex flex-wrap items-center gap-3 border-t border-border bg-card px-5 py-3">
      <p className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground">
        <Kbd>Q</Kbd>
        <Kbd>W</Kbd> move
        <span className="mx-1">·</span>
        <Kbd>A</Kbd>
        <Kbd>D</Kbd> photos
        {pending && (
          <>
            <span className="mx-1">·</span>
            <Kbd>E</Kbd> approve
            <span className="mx-1">·</span>
            <Kbd>R</Kbd> reject
          </>
        )}
      </p>
      {pending ? (
        <div className="ml-auto flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={onReject}
            className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-300 px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            {approveLabel}
          </button>
        </div>
      ) : (
        <div className="ml-auto text-sm text-muted-foreground">{closedNote}</div>
      )}
    </footer>
  );
}

// src: string = ready, undefined = loading, null = not provided.
export type ViewerPhoto = { key: string; label: string; src: string | null | undefined };

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable="true"]');
}

function dialogOpen() {
  return !!document.querySelector('[role="dialog"], [role="alertdialog"]');
}

/**
 * Big photo stage with a thumbnail strip. With `keyboard`, A/D or left/right flip
 * through the photos (only one viewer per screen should set it).
 */
export function PhotoViewer({
  title,
  photos,
  onOpen,
  keyboard = false,
  className,
}: {
  title?: string;
  photos: ViewerPhoto[];
  onOpen: (src: string) => void;
  keyboard?: boolean;
  className?: string;
}) {
  const signature = photos.map((p) => p.key).join('|');
  const [activeKey, setActiveKey] = useState(photos[0]?.key);
  useEffect(() => setActiveKey(photos[0]?.key), [signature]); // eslint-disable-line react-hooks/exhaustive-deps

  const index = Math.max(0, photos.findIndex((p) => p.key === activeKey));
  const active = photos[index];
  const step = (delta: number) => {
    if (photos.length < 2) return;
    setActiveKey(photos[(index + delta + photos.length) % photos.length].key);
  };

  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    if (!keyboard) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || dialogOpen()) return;
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'd' || key === 'arrowleft' || key === 'arrowright') {
        e.preventDefault();
        stepRef.current(key === 'd' || key === 'arrowright' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [keyboard]);

  return (
    <div className={cn('flex min-h-[16rem] flex-col overflow-hidden rounded-xl border border-border bg-secondary/40', className)}>
      {title && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          {active && photos.length > 1 && <p className="text-xs font-medium text-foreground">{active.label}</p>}
        </div>
      )}
      <div className="group relative flex-1 min-h-0">
        <div className="absolute inset-0 flex items-center justify-center p-3">
          {active?.src ? (
            <img
              src={active.src}
              alt={active.label}
              onClick={() => onOpen(active.src as string)}
              className="max-h-full max-w-full cursor-zoom-in rounded-md object-contain shadow-elevation-1"
            />
          ) : active?.src === null ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageOff className="w-8 h-8 opacity-50" />
              <p className="text-sm">No photo</p>
            </div>
          ) : (
            <div className="h-full w-full animate-pulse rounded-md bg-secondary" />
          )}
        </div>
        {active?.src && (
          <button
            type="button"
            onClick={() => onOpen(active.src as string)}
            className="absolute right-2 top-2 rounded-md bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="View full size"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-border bg-card/60 p-2">
          {photos.map((photo) => (
            <button
              key={photo.key}
              type="button"
              onClick={() => setActiveKey(photo.key)}
              className={cn(
                'flex w-20 shrink-0 flex-col items-center gap-1 rounded-lg p-1 transition-colors',
                photo.key === active?.key ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-secondary'
              )}
            >
              <span className="flex h-11 w-full items-center justify-center overflow-hidden rounded-md bg-secondary">
                {photo.src ? (
                  <img src={photo.src} alt="" className="h-full w-full object-cover" />
                ) : photo.src === null ? (
                  <ImageOff className="w-4 h-4 text-muted-foreground/60" />
                ) : (
                  <span className="h-full w-full animate-pulse bg-secondary" />
                )}
              </span>
              <span className="w-full truncate text-center text-[10px] font-medium text-muted-foreground">{photo.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Queue keyboard shortcuts. Ignored while typing, while any dialog is open,
 * or when `enabled` is false (custom modals, lightbox).
 */
export function useReviewShortcuts(options: {
  ids: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApprove?: () => void;
  onReject?: () => void;
  enabled: boolean;
}) {
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const { ids, selectedId, onSelect, onApprove, onReject, enabled } = latest.current;
      if (!enabled || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || dialogOpen()) return;
      const key = e.key.toLowerCase();
      if (key === 'q' || key === 'w' || key === 'arrowdown' || key === 'arrowup') {
        if (!ids.length) return;
        e.preventDefault();
        const current = selectedId ? ids.indexOf(selectedId) : -1;
        const forward = key === 'w' || key === 'arrowdown';
        const next = current === -1 ? 0 : Math.min(ids.length - 1, Math.max(0, current + (forward ? 1 : -1)));
        onSelect(ids[next]);
      } else if (key === 'e' && onApprove) {
        e.preventDefault();
        onApprove();
      } else if (key === 'r' && onReject) {
        e.preventDefault();
        onReject();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
}

/** The item to open after `id` leaves the queue: the next one, else the previous. */
export function neighborId(ids: string[], id: string) {
  const index = ids.indexOf(id);
  if (index === -1) return null;
  return ids[index + 1] ?? ids[index - 1] ?? null;
}
