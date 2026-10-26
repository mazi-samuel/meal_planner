const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parse(iso: string): Date {
  const match = ISO_DATE.exec(iso);
  if (!match) throw new Error(`Invalid ISO date "${iso}", expected YYYY-MM-DD`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function format(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Calendar-day arithmetic that is immune to time zones and DST. */
export function addDays(iso: string, days: number): string {
  const date = parse(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return format(date);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function weekdayShort(iso: string): string {
  return WEEKDAYS[parse(iso).getUTCDay()]!;
}

export function dayOfMonth(iso: string): number {
  return parse(iso).getUTCDate();
}

/** Formats a local `Date` as `YYYY-MM-DD` using the device's calendar day. */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
