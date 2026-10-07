import { useEffect, useMemo, useState } from 'react';

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  /** Zero-based index of the first row on this page (for `.range(from, to)`). */
  from: number;
  /** Zero-based, inclusive index of the last row on this page. */
  to: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

// Page state for an admin table. `resetKeys` are the search text / filters /
// tab: when any of them changes the table goes back to page 1. If the total
// shrinks (realtime refetch, a row hidden during an Undo window) the page is
// clamped so you never land on an empty page.
export function usePagination(total: number, resetKeys: unknown[] = [], initialPageSize = DEFAULT_PAGE_SIZE): Pagination {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Reset during render (not in an effect) so a server fetch keyed on `page`
  // never runs once with the old page and new filters.
  const resetSig = JSON.stringify(resetKeys);
  const [lastResetSig, setLastResetSig] = useState(resetSig);
  if (resetSig !== lastResetSig) {
    setLastResetSig(resetSig);
    if (page !== 1) setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const current = Math.min(page, pageCount);
  const from = (current - 1) * pageSize;

  return {
    page: current,
    pageSize,
    pageCount,
    total,
    from,
    to: from + pageSize - 1,
    setPage: (next) => setPage(Math.max(1, next)),
    setPageSize: (size) => {
      setPageSizeState(size);
      setPage(1);
    },
  };
}

// Client-side variant: slices an already-filtered array.
export function useClientPagination<T>(items: T[], resetKeys: unknown[] = [], initialPageSize = DEFAULT_PAGE_SIZE) {
  const pagination = usePagination(items.length, resetKeys, initialPageSize);
  const { from, pageSize } = pagination;
  const pageItems = useMemo(() => items.slice(from, from + pageSize), [items, from, pageSize]);
  return { ...pagination, pageItems };
}
