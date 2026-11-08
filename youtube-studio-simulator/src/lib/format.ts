const LOCALE = 'en-GB';

const intFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const gbp = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatInt = (n: number) => intFmt.format(Math.round(n));

export function formatCompact(n: number, digits = 1): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const trim = (v: number) => {
    const fixed = v.toFixed(digits);
    return fixed.replace(/\.0+$/, '');
  };
  if (abs >= 1e9) return `${sign}${trim(abs / 1e9)}B`;
  if (abs >= 1e6) return `${sign}${trim(abs / 1e6)}M`;
  if (abs >= 1e4) return `${sign}${trim(abs / 1e3)}K`;
  if (abs >= 1e3) return `${sign}${trim(abs / 1e3)}K`;
  return `${sign}${Math.round(abs)}`;
}

/** YouTube-style compact counts: 1.2K, 84K, 1.3M (no decimals above 10K for subscriber style). */
export function formatSubs(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(abs >= 1e7 ? 0 : 2).replace(/\.?0+$/, '')}M`;
  if (abs >= 1e5) return `${Math.floor(abs / 1e3)}K`;
  if (abs >= 1e4) return `${(Math.floor(abs / 100) / 10).toFixed(1).replace(/\.0$/, '')}K`;
  if (abs >= 1e3) return `${(Math.floor(abs / 10) / 100).toFixed(2).replace(/\.?0+$/, '')}K`;
  return `${Math.round(abs)}`;
}

export const formatGBP = (n: number) => gbp.format(n);

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

/** seconds → m:ss or h:mm:ss */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (v: number) => String(v).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export function formatSigned(n: number, fmt: (v: number) => string = formatInt): string {
  if (n > 0) return `+${fmt(n)}`;
  if (n < 0) return `-${fmt(Math.abs(n))}`;
  return fmt(0);
}

const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
const dateNoYear = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const monthFmt = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
const monthLongFmt = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });

export const formatDate = (d: Date | number) => dateFmt.format(d);
export const formatDateShort = (d: Date | number) => dateNoYear.format(d);
export const formatMonth = (d: Date | number) => monthFmt.format(d);
export const formatMonthYear = (d: Date | number) => monthLongFmt.format(d);
export const formatWeekdayDate = (d: Date | number) => weekdayFmt.format(d);
export const formatTime = (d: Date | number) => timeFmt.format(d);

export function formatDateRange(a: Date, b: Date): string {
  if (a.getFullYear() === b.getFullYear()) return `${dateNoYear.format(a)} – ${dateFmt.format(b)}`;
  return `${dateFmt.format(a)} – ${dateFmt.format(b)}`;
}

export function timeAgo(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  const plural = (v: number, unit: string) => `${v} ${unit}${v === 1 ? '' : 's'} ago`;
  if (diff < min) return 'Just now';
  if (diff < hour) return plural(Math.floor(diff / min), 'minute');
  if (diff < day) return plural(Math.floor(diff / hour), 'hour');
  if (diff < 7 * day) return plural(Math.floor(diff / day), 'day');
  if (diff < 30 * day) return plural(Math.floor(diff / (7 * day)), 'week');
  if (diff < 365 * day) return plural(Math.floor(diff / (30 * day)), 'month');
  return plural(Math.floor(diff / (365 * day)), 'year');
}

/** "2 days 4 hours" style elapsed label used on the latest video card. */
export function elapsedLabel(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  if (days === 0) return `${rem} hour${rem === 1 ? '' : 's'}`;
  return `${days} day${days === 1 ? '' : 's'} ${rem} hour${rem === 1 ? '' : 's'}`;
}

export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}
