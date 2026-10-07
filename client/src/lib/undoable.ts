import { useSyncExternalStore } from 'react';
import { toast } from 'sonner';

// Admin actions run through here so every one gets a flash message with an
// Undo button. Most actions notify the traveler (push + email) the moment
// they hit the database, so a "write the opposite change" undo would send a
// second, contradictory notification. Instead runUndoable() HOLDS the write:
// the UI updates optimistically, the toast shows Undo for a few seconds, and
// commit() only runs once the toast closes. Undo therefore means the action
// never happened -- nothing saved, nothing audited, nobody notified.

export const UNDO_DELAY_MS = 6000;

type Result = { error?: { message?: string } | null } | void;

interface PendingEntry {
  key: string;
  commit: () => Promise<void>;
}

const pending = new Map<string, PendingEntry>();
const listeners = new Set<() => void>();
let snapshot: ReadonlySet<string> = new Set();

function emit() {
  snapshot = new Set(pending.keys());
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Keys of actions still inside their undo window. Pages filter realtime
// refetches against this so a held row doesn't pop back into a queue.
export function usePendingUndoKeys(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

export function hasPendingUndos() {
  return pending.size > 0;
}

// Commit everything still waiting right now (logout, tab close).
export async function flushPendingUndos() {
  const entries = Array.from(pending.values());
  await Promise.all(entries.map((e) => e.commit()));
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', (e) => {
    if (pending.size === 0) return;
    void flushPendingUndos();
    // Shows the browser's "Leave site?" prompt, which also gives the
    // flushed requests time to reach the server.
    e.preventDefault();
    e.returnValue = '';
  });
}

function errorText(result: Result, fallback: string) {
  const msg = result && 'error' in result ? result.error?.message : undefined;
  return msg ? `${fallback}: ${msg}` : fallback;
}

export interface UndoableOptions {
  /** Unique per entity+action, e.g. `id:<uuid>`. Also the toast id. */
  key: string;
  /** Shown while the action is held, e.g. "Approving Juan's ID…" */
  message: string;
  description?: string;
  /** The real write. Return Supabase's `{ error }` so failures surface. */
  commit: () => Promise<Result>;
  /** Optimistic UI change applied immediately. */
  onHide?: () => void;
  /** Reverts onHide (Undo, or the write failed). */
  onRestore?: () => void;
  /** Runs after a successful commit (e.g. refetch). */
  onCommitted?: () => void;
  success: string;
  error: string;
  delayMs?: number;
}

export function runUndoable(opts: UndoableOptions) {
  const { key, delayMs = UNDO_DELAY_MS } = opts;

  // Same entity acted on twice: commit the earlier one first.
  const existing = pending.get(key);
  if (existing) void existing.commit();

  let settled = false;
  let fallback: ReturnType<typeof setTimeout> | undefined;

  const finish = () => {
    settled = true;
    if (fallback) clearTimeout(fallback);
    pending.delete(key);
    emit();
  };

  // Results get their own toast: sonner removes the Undo toast right after
  // it closes, so reusing its id for the outcome could swallow the message.
  const resultId = `${key}:result`;

  const commit = async () => {
    if (settled) return;
    finish();
    let result: Result;
    try {
      result = await opts.commit();
    } catch (err) {
      result = { error: { message: err instanceof Error ? err.message : String(err) } };
    }
    if (result && 'error' in result && result.error) {
      opts.onRestore?.();
      toast.error(errorText(result, opts.error), { id: resultId });
      return;
    }
    toast.success(opts.success, { id: resultId, duration: 4000 });
    opts.onCommitted?.();
  };

  const undo = () => {
    if (settled) return;
    finish();
    opts.onRestore?.();
    toast.dismiss(key);
    toast.info('Undone. Nothing was changed.', { id: resultId, duration: 2500 });
  };

  pending.set(key, { key, commit });
  emit();
  opts.onHide?.();

  toast(opts.message, {
    id: key,
    description: opts.description,
    duration: delayMs,
    action: { label: 'Undo', onClick: undo },
    onAutoClose: () => void commit(),
    onDismiss: () => void commit(),
  });

  // Sonner pauses its timer while the toast is hovered or the browser tab is
  // hidden; this ceiling makes sure a held action still saves eventually.
  fallback = setTimeout(() => void commit(), delayMs * 5);
}

export interface InstantUndoableOptions {
  key: string;
  /** The write. */
  run: () => Promise<Result>;
  /** The compensating write that Undo performs. */
  revert: () => Promise<Result>;
  success: string;
  error: string;
  onDone?: () => void;
}

// For silent toggles only (nothing is notified), where saving right away
// and writing the opposite on Undo is harmless.
export async function instantUndoable(opts: InstantUndoableOptions) {
  let result: Result;
  try {
    result = await opts.run();
  } catch (err) {
    result = { error: { message: err instanceof Error ? err.message : String(err) } };
  }
  if (result && 'error' in result && result.error) {
    toast.error(errorText(result, opts.error), { id: opts.key });
    return false;
  }
  opts.onDone?.();
  toast.success(opts.success, {
    id: opts.key,
    duration: UNDO_DELAY_MS,
    action: {
      label: 'Undo',
      onClick: async () => {
        const r = await opts.revert();
        if (r && 'error' in r && r.error) {
          toast.error(errorText(r, 'Could not undo'), { id: `${opts.key}:result` });
        } else {
          toast.info('Undone', { id: `${opts.key}:result`, duration: 2500 });
          opts.onDone?.();
        }
      },
    },
  });
  return true;
}
