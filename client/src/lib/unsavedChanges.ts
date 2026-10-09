import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { clearDraft, loadDraft, saveDraft, type StoredDraft } from '@/lib/drafts';

// "Discard changes?" for the whole site. Pages register themselves as dirty
// (useUnsavedChanges) so UnsavedChangesGuard can stop link clicks, browser
// back and tab close; dialogs call confirmDiscard() on Esc/Cancel/backdrop.
// Both show the same styled confirm, rendered by UnsavedChangesGuard.

export type DiscardRequest = { id: number; title: string; message: string; onDiscard: () => void };

const DEFAULT_TITLE = 'Discard changes?';
const DEFAULT_MESSAGE = "You have unsaved changes. If you leave now, what you typed won't be saved.";

let request: DiscardRequest | null = null;
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

const dirtyPages = new Map<string, string>();

/** Close right away when clean; otherwise ask first. */
export function confirmDiscard(dirty: boolean, onDiscard: () => void, copy: { title?: string; message?: string } = {}) {
  if (!dirty) {
    onDiscard();
    return;
  }
  request = { id: nextId++, title: copy.title ?? DEFAULT_TITLE, message: copy.message ?? DEFAULT_MESSAGE, onDiscard };
  emit();
}

export function resolveDiscard(discard: boolean) {
  const current = request;
  request = null;
  emit();
  if (discard) current?.onDiscard();
}

export function useDiscardRequest() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => request,
  );
}

/** The message of a dirty page, if any (the latest registered wins). */
export function currentDirtyMessage() {
  const values = [...dirtyPages.values()];
  return values.length ? values[values.length - 1] : null;
}

/** Marks this page as having unsaved changes while `dirty`. */
export function useUnsavedChanges(dirty: boolean, message = DEFAULT_MESSAGE) {
  const id = useId();
  useEffect(() => {
    if (dirty) dirtyPages.set(id, message);
    else dirtyPages.delete(id);
    return () => {
      dirtyPages.delete(id);
    };
  }, [dirty, id, message]);
}

/**
 * For in-page Back/Cancel buttons that navigate in code (setLocation): asks
 * first when the page is dirty.
 */
export function guardedNavigate(dirty: boolean, navigate: () => void, copy?: { title?: string; message?: string }) {
  confirmDiscard(dirty, () => {
    allowNextLeave();
    navigate();
  }, copy);
}

/** Lets the next navigation through after a successful submit. */
export function allowNextLeave() {
  dirtyPages.clear();
}

/**
 * Autosaves `value` as a draft while there's something worth keeping, and
 * offers the saved draft back once ("Continue your draft?").
 */
export function useDraft<T>(key: string | null, value: T, isEmpty: (value: T) => boolean) {
  const [offer, setOffer] = useState<StoredDraft<T> | null>(() => (key ? loadDraft<T>(key) : null));
  const decided = useRef(offer === null);

  useEffect(() => {
    if (!key) return;
    const stored = loadDraft<T>(key);
    setOffer(stored);
    decided.current = stored === null;
  }, [key]);

  useEffect(() => {
    if (!key || !decided.current) return;
    const timer = window.setTimeout(() => {
      if (isEmpty(value)) clearDraft(key);
      else saveDraft(key, value);
    }, 600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, JSON.stringify(value)]);

  const restore = useCallback(() => {
    decided.current = true;
    const saved = offer?.value ?? null;
    setOffer(null);
    return saved;
  }, [offer]);

  const clear = useCallback(() => {
    decided.current = true;
    if (key) clearDraft(key);
    setOffer(null);
  }, [key]);

  return { offer, restore, dismiss: clear, clear };
}
