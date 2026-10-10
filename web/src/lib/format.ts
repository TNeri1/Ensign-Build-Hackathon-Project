interface Opts {
  locale?: string;
  timeZone?: string;
}

/** "Oct 9, 2026" */
export function formatDate(iso: string, o: Opts = {}): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(o.locale, { month: 'short', day: 'numeric', year: 'numeric', timeZone: o.timeZone });
}

/** "Oct 9, 3:40 PM" */
export function formatDateTime(iso: string, o: Opts = {}): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(o.locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: o.timeZone });
}

/** "just now", "5 min ago", "3 h ago", "yesterday", else formatDate. Future times read "just now". */
export function relativeTime(iso: string, now: Date = new Date(), o: Opts = {}): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, (now.getTime() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 172800) return 'yesterday';
  return formatDate(iso, o);
}
