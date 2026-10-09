// Unsent form drafts kept in this browser, so an accidental navigation or a
// reload doesn't lose what someone typed. Mirrors partyup-mobile/lib/drafts.ts.

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type StoredDraft<T> = { value: T; savedAt: string };

const fullKey = (key: string) => `partyup:draft:${key}`;

export function loadDraft<T>(key: string): StoredDraft<T> | null {
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft<T>;
    if (!parsed?.savedAt || Date.now() - new Date(parsed.savedAt).getTime() > MAX_AGE_MS) {
      window.localStorage.removeItem(fullKey(key));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify({ value, savedAt: new Date().toISOString() }));
  } catch {
    // Storage full or blocked: drafts are best-effort.
  }
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(fullKey(key));
  } catch {
    // ignore
  }
}
