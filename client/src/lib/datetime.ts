// One place for how the admin site shows dates and times: always 12-hour
// (3:45 PM) and always Manila time, whatever the browser's locale or zone.
// The mobile app uses the same rules (partyup-mobile/lib/datetime.ts).

const TZ = 'Asia/Manila';

type DateInput = string | number | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const dateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const shortDateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  month: 'short',
  day: 'numeric',
});

/** "Oct 6, 2026, 3:45 PM" */
export function formatDateTime(value: DateInput, fallback = '—') {
  const d = toDate(value);
  return d ? dateTimeFmt.format(d) : fallback;
}

/** "3:45 PM" */
export function formatTime(value: DateInput, fallback = '—') {
  const d = toDate(value);
  return d ? timeFmt.format(d) : fallback;
}

/** "Oct 6, 2026" */
export function formatDate(value: DateInput, fallback = '—') {
  const d = toDate(value);
  return d ? dateFmt.format(d) : fallback;
}

/** "Oct 6" */
export function formatDateShort(value: DateInput, fallback = '—') {
  const d = toDate(value);
  return d ? shortDateFmt.format(d) : fallback;
}

/** "just now", "5m ago", "3h ago", "2d ago", then the date. */
export function timeAgo(value: DateInput, fallback = '—') {
  const d = toDate(value);
  if (!d) return fallback;
  const secs = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}
