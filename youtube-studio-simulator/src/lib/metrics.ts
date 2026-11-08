import type { Metric } from '../data/analytics';
import { formatCompact, formatDuration, formatGBP, formatInt, formatSigned } from './format';

export interface MetricDef {
  label: string;
  short: (v: number) => string;
  full: (v: number) => string;
  axis: (v: number) => string;
  tooltip?: string;
}

const pct = (v: number) => `${v.toFixed(1)}%`;
const gbpAxis = (v: number) => (v >= 1000 ? `£${(v / 1000).toFixed(1)}K` : `£${v.toFixed(v < 10 ? 2 : 0)}`);

export const METRICS: Record<Metric, MetricDef> = {
  views: { label: 'Views', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v, 1) },
  watchHours: { label: 'Watch time (hours)', short: (v) => formatCompact(v), full: (v) => v.toLocaleString('en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 }), axis: (v) => formatCompact(v, 1) },
  subscribers: { label: 'Subscribers', short: (v) => formatSigned(v, (x) => formatCompact(x)), full: (v) => formatSigned(v), axis: (v) => formatCompact(v, 1) },
  subsGained: { label: 'Subscribers gained', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  subsLost: { label: 'Subscribers lost', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  revenue: { label: 'Estimated revenue', short: formatGBP, full: formatGBP, axis: gbpAxis },
  impressions: { label: 'Impressions', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v, 1) },
  impressionViews: { label: 'Views from impressions', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  ctr: { label: 'Impressions click-through rate', short: pct, full: (v) => `${v.toFixed(2)}%`, axis: (v) => `${v.toFixed(1)}%` },
  avd: { label: 'Average view duration', short: formatDuration, full: formatDuration, axis: formatDuration },
  rpm: { label: 'RPM', short: formatGBP, full: formatGBP, axis: (v) => `£${v.toFixed(2)}`, tooltip: 'Revenue per mille: how much you earned per 1,000 views' },
  cpm: { label: 'CPM', short: formatGBP, full: formatGBP, axis: (v) => `£${v.toFixed(2)}`, tooltip: 'Cost per 1,000 ad impressions paid by advertisers' },
  playbackCpm: { label: 'Playback-based CPM', short: formatGBP, full: formatGBP, axis: (v) => `£${v.toFixed(2)}` },
  monetisedPlaybacks: { label: 'Estimated monetised playbacks', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  adImpressions: { label: 'Ad impressions', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  uniqueViewers: { label: 'Unique viewers', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  returningViewers: { label: 'Returning viewers', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  newViewers: { label: 'New viewers', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  likes: { label: 'Likes', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  comments: { label: 'Comments', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
  shares: { label: 'Shares', short: (v) => formatCompact(v), full: formatInt, axis: (v) => formatCompact(v) },
};
