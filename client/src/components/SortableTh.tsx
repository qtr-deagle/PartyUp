import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortState } from '@/hooks/useSortable';

const DEFAULT_TH = 'px-6 py-4 text-sm font-bold text-foreground';

// A table header cell that sorts its column when clicked (see useSortable).
// `className` replaces the default padding/text styling for tables that look
// different (smaller dialogs, the traveler pages); `align="right"` is for
// number columns.
export default function SortableTh<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className = DEFAULT_TH,
  align = 'left',
}: {
  label: string;
  sortKey: K;
  // null when no column is picked (the table's default order).
  sort: SortState<K> | null;
  onSort: (key: K) => void;
  className?: string;
  align?: 'left' | 'right';
}) {
  const direction = sort?.key === sortKey ? sort.direction : null;
  const active = direction !== null;
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown;
  return (
    <th
      className={`${className} ${align === 'right' ? 'text-right' : 'text-left'} whitespace-nowrap`}
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`group inline-flex items-center whitespace-nowrap gap-1.5 hover:text-primary transition-smooth ${align === 'right' ? 'flex-row-reverse' : ''}`}
        title={direction === 'desc' ? 'Clear sort' : `Sort by ${label.toLowerCase()}${direction === 'asc' ? ' (descending)' : ''}`}>
        {label}
        <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-muted-foreground opacity-50 group-hover:opacity-100'}`} />
      </button>
    </th>
  );
}
