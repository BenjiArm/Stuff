import { LAST, LAUNCH, DATA_END, dayDate, N_DAYS } from '../data/analytics';
import { addDays, diffDays, startOfDay } from './dates';
import { formatDateRange } from './format';

export type RangeKey =
  | 'last7'
  | 'last28'
  | 'last90'
  | 'last365'
  | 'lifetime'
  | 'year'
  | 'month0'
  | 'month1'
  | 'month2'
  | 'custom';

export interface ResolvedRange {
  key: RangeKey;
  label: string;
  /** "Last 28 days" style phrase used in sentences */
  phrase: string;
  start: number; // day index (may be < 0 for ranges older than the channel)
  end: number;
  startDate: Date;
  endDate: Date;
  dateLabel: string;
  length: number;
  /** previous comparable period */
  prevStart: number;
  prevEnd: number;
  compareLabel: string;
}

const idxOf = (d: Date) => diffDays(d, LAUNCH);

function monthBounds(offset: number) {
  const ref = new Date(DATA_END.getFullYear(), DATA_END.getMonth() - offset, 1);
  const start = startOfDay(ref);
  const end = offset === 0 ? DATA_END : startOfDay(new Date(ref.getFullYear(), ref.getMonth() + 1, 0));
  return { start, end };
}

export function rangeOptions() {
  const months = [0, 1, 2].map((o) => monthBounds(o).start);
  const year = DATA_END.getFullYear();
  return [
    { key: 'last7' as const, label: 'Last 7 days' },
    { key: 'last28' as const, label: 'Last 28 days' },
    { key: 'last90' as const, label: 'Last 90 days' },
    { key: 'last365' as const, label: 'Last 365 days' },
    { key: 'lifetime' as const, label: 'Lifetime' },
    { divider: true as const, key: 'd1' },
    { key: 'year' as const, label: String(year) },
    { divider: true as const, key: 'd2' },
    ...months.map((m, i) => ({ key: `month${i}` as RangeKey, label: m.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) })),
    { divider: true as const, key: 'd3' },
    { key: 'custom' as const, label: 'Custom' },
  ];
}

export function resolveRange(key: RangeKey, custom?: { start: number; end: number } | null): ResolvedRange {
  let start: number;
  let end = LAST;
  let label = '';
  let phrase = '';
  switch (key) {
    case 'last7':
      start = LAST - 6; label = 'Last 7 days'; phrase = 'in the last 7 days'; break;
    case 'last28':
      start = LAST - 27; label = 'Last 28 days'; phrase = 'in the last 28 days'; break;
    case 'last90':
      start = LAST - 89; label = 'Last 90 days'; phrase = 'in the last 90 days'; break;
    case 'last365':
      start = LAST - 364; label = 'Last 365 days'; phrase = 'in the last 365 days'; break;
    case 'lifetime':
      start = 0; label = 'Lifetime'; phrase = 'since your channel started'; break;
    case 'year': {
      const y = new Date(DATA_END.getFullYear(), 0, 1);
      start = idxOf(y); label = String(DATA_END.getFullYear()); phrase = `in ${DATA_END.getFullYear()}`; break;
    }
    case 'month0':
    case 'month1':
    case 'month2': {
      const b = monthBounds(Number(key.slice(5)));
      start = idxOf(b.start);
      end = Math.min(LAST, idxOf(b.end));
      label = b.start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      phrase = `in ${label}`;
      break;
    }
    case 'custom': {
      const s = custom ? idxOf(new Date(custom.start)) : LAST - 27;
      const e = custom ? idxOf(new Date(custom.end)) : LAST;
      start = Math.min(s, e);
      end = Math.min(LAST, Math.max(s, e));
      label = 'Custom';
      phrase = 'in this period';
      break;
    }
  }
  const length = end - start + 1;
  const startDate = start >= 0 ? dayDate(start) : addDays(LAUNCH, start);
  const endDate = dayDate(end);
  const prevEnd = start - 1;
  const prevStart = start - length;
  const compareLabel =
    key === 'last7' || key === 'last28' || key === 'last90' || key === 'last365'
      ? `previous ${length} days`
      : key.startsWith('month')
        ? 'previous month'
        : 'previous period';
  return {
    key,
    label,
    phrase,
    start,
    end,
    startDate,
    endDate,
    dateLabel: formatDateRange(startDate, endDate),
    length,
    prevStart,
    prevEnd,
    compareLabel,
  };
}

/** Clamp a range to the days the channel has data for. */
export function clampToChannel(r: ResolvedRange) {
  return { start: Math.max(0, r.start), end: Math.min(N_DAYS - 1, r.end) };
}
