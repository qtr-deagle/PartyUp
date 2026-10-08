import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export { SearchField, Segmented } from '@/components/review/ReviewWorkspace';

// Shared look for the admin pages: page header, stat tiles, cards, table
// styles and empty states. Same visual language as the review workspaces
// (ReviewWorkspace.tsx) and Guilds & Rewards.

type Icon = ComponentType<{ className?: string }>;

/** Table header cell classes (pass to SortableTh `className` too). */
export const TH = 'px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground';
/** Body row classes: soft hover, dividers come from the tbody. */
export const TR = 'hover:bg-secondary/40 transition-colors';
export const TD = 'px-5 py-3.5';

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

export function StatTile({
  icon: IconCmp,
  tone,
  label,
  value,
  hint,
  onClick,
  active = false,
}: {
  icon: Icon;
  /** Tinted icon square, e.g. "bg-green-500/15 text-green-600 dark:text-green-400". */
  tone: string;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const body = (
    <>
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone)}>
        <IconCmp className="w-5 h-5" />
      </span>
      <div className="min-w-0 text-left">
        <p className="text-2xl font-bold leading-tight text-foreground tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        {hint && <p className="truncate text-[11px] text-muted-foreground/80 mt-0.5">{hint}</p>}
      </div>
    </>
  );
  const className = cn(
    'flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-elevation-1',
    active ? 'border-primary ring-1 ring-primary/40' : 'border-border'
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(className, 'transition-smooth hover:border-primary/40 hover:shadow-elevation-2')}>
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-2 xl:grid-cols-4 gap-4', className)}>{children}</div>;
}

/** Rounded content card with an optional header row. */
export function Card({
  title,
  icon: IconCmp,
  action,
  children,
  className,
  bodyClassName,
  ...rest
}: {
  title?: ReactNode;
  icon?: Icon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  'data-paginated'?: boolean;
}) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card shadow-elevation-2 overflow-hidden', className)} {...rest}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {IconCmp && <IconCmp className="w-4 h-4 text-muted-foreground" />}
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Row of filters above a table: search, switches, extra controls. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>;
}

export function EmptyState({ icon: IconCmp, title, text, className }: { icon: Icon; title: string; text?: ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-14 text-center', className)}>
      <IconCmp className="mx-auto mb-3 w-10 h-10 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {text && <p className="mt-1 text-xs text-muted-foreground">{text}</p>}
    </div>
  );
}

/** Empty / loading row for a table body. */
export function TableMessage({ colSpan, icon, title, text, loading = false }: { colSpan: number; icon: Icon; title: string; text?: ReactNode; loading?: boolean }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        {loading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <EmptyState icon={icon} title={title} text={text} />
        )}
      </td>
    </tr>
  );
}

export function Avatar({ name, url, size = 'md' }: { name?: string | null; url?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-7 w-7 text-[11px]' : size === 'lg' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-xs';
  return url ? (
    <img src={url} alt="" className={cn('shrink-0 rounded-full object-cover', dims)} />
  ) : (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary', dims)}>
      {(name ?? '?').trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}

/** Avatar + name + secondary line, for table cells and lists. */
export function PersonCell({ name, sub, url }: { name?: string | null; sub?: ReactNode; url?: string | null }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar name={name} url={url} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{name ?? 'Unknown'}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

const PILL_TONES = {
  green: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  violet: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300',
  gray: 'bg-secondary text-muted-foreground',
} as const;
export type PillTone = keyof typeof PILL_TONES;

export function Pill({ tone = 'gray', dot = false, children, className }: { tone?: PillTone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', PILL_TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
