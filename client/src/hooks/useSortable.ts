import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';
export type SortState<K extends string> = { key: K; direction: SortDirection };
type SortValue = string | number | null | undefined;

// The picked column, cycled by clicking its title: ascending -> descending ->
// off (null); clicking a different column starts it ascending. Use directly
// for server-paged tables (pass `sort` to the query); client tables use
// useSortable below.
export function useSortState<K extends string>() {
  const [sort, setSort] = useState<SortState<K> | null>(null);
  const toggle = (key: K) =>
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      return current.direction === 'asc' ? { key, direction: 'desc' } : null;
    });
  return { sort, toggle };
}

// Click-to-sort for client-side tables. `getters` maps each sortable column
// to the value it sorts by. While no column is picked, rows follow
// `defaultOrder` (e.g. newest first). Empty values always sort last.
export function useSortable<T, K extends string>(
  items: T[],
  getters: Record<K, (item: T) => SortValue>,
  defaultOrder: SortState<NoInfer<K>>
) {
  const { sort, toggle } = useSortState<K>();
  const effective = sort ?? defaultOrder;

  const sorted = useMemo(() => {
    const get = getters[effective.key];
    const factor = effective.direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      const left = get(a);
      const right = get(b);
      const leftEmpty = left == null || left === '';
      const rightEmpty = right == null || right === '';
      if (leftEmpty || rightEmpty) return leftEmpty === rightEmpty ? 0 : leftEmpty ? 1 : -1;
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' }) * factor;
    });
    // getters is a fresh object each render; the sort only depends on its keys' behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, effective.key, effective.direction]);

  return { sorted, sort, toggle };
}
