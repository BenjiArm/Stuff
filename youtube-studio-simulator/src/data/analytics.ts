/**
 * Deterministic analytics engine for the simulated channel.
 *
 * The channel timeline is anchored to the real current date, so the dashboard always looks "live".
 * Ten monthly windows (oldest → newest) are calibrated to the channel's growth story, and the
 * newest window is exactly the "Last 28 days" period – it reproduces the headline numbers:
 *   1,284,650 views · 146,820 watch hours · £3,247.82 revenue · 9.8M impressions · 6.8% CTR
 *   8:42 average view duration (long-form) · 84,650 subscribers · £2.53 RPM
 *
 * Channel-level daily totals are generated first; they are then split between individual videos,
 * so every per-video number adds up exactly to the channel numbers.
 */
import { addDays, startOfDay } from '../lib/dates';
import { createRng, integerise, monotoneInterpolator } from '../lib/random';
import { LONG_FORM_SEEDS, SHORT_SEEDS } from './catalogue';
import type { VideoKind, VideoSeed } from './types';

export const WINDOW_LENGTHS = [30, 31, 30, 31, 30, 31, 30, 31, 30, 28];
export const N_DAYS = WINDOW_LENGTHS.reduce((a, b) => a + b, 0); // 302

const SUBS_AT_WINDOW_END = [1200, 2800, 5600, 11500, 22000, 35000, 48000, 61000, 72000, 84650];
const VIEWS_PER_WINDOW = [60000, 110000, 210000, 400000, 620000, 790000, 900000, 1010000, 1120000, 1284650];
const SHORTS_VIEWS_PER_WINDOW = [0, 0, 0, 0, 0, 63200, 126000, 181800, 235200, 292254];
const REVENUE_PER_WINDOW = [0, 0, 0, 120, 420, 890, 1450, 2100, 2650, 3247.82];

export const TARGETS = {
  subscribers: 84650,
  views28: 1284650,
  watchHours28: 146820,
  revenue28: 3247.82,
  impressions28: 9_800_000,
  ctr28: 6.8,
  avdLong28: 522, // 8:42
  avdShorts28: 36,
  publishedVideos: 47,
};

// ---------------------------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------------------------
export const SESSION_START = Date.now();
export const TODAY = startOfDay(SESSION_START);
/** Index N_DAYS-1 is yesterday – YouTube Studio's daily analytics end on the last complete day. */
export const DATA_END = addDays(TODAY, -1);
export const LAUNCH = addDays(DATA_END, -(N_DAYS - 1));
export const LAST = N_DAYS - 1;

const dayCache: Date[] = [];
for (let i = 0; i < N_DAYS; i++) dayCache.push(addDays(LAUNCH, i));
export const dayDate = (i: number) => dayCache[Math.max(0, Math.min(N_DAYS - 1, i))] ?? addDays(LAUNCH, i);

export const WINDOWS = (() => {
  const out: { start: number; end: number; label: string; mid: Date }[] = [];
  let s = 0;
  for (const len of WINDOW_LENGTHS) {
    const mid = addDays(LAUNCH, s + Math.floor(len / 2));
    out.push({ start: s, end: s + len - 1, label: mid.toLocaleDateString('en-GB', { month: 'short' }).replace('Sept', 'Sep'), mid });
    s += len;
  }
  return out;
})();

export const MONETISATION_START = WINDOWS[3].start + 10;

// ---------------------------------------------------------------------------------------------
// Publish schedule
// ---------------------------------------------------------------------------------------------
function longFormSchedule(): number[] {
  const rng = createRng(1453);
  const first = [0, 8, 15, 23, 31, 39, 46, 54, 62, 70];
  const rest: number[] = [];
  const count = LONG_FORM_SEEDS.length - first.length;
  const startIdx = 76;
  const endIdx = N_DAYS - 2; // latest upload: two days ago
  for (let k = 0; k < count; k++) {
    const base = startIdx + ((endIdx - startIdx) * k) / (count - 1);
    const jitter = k === 0 || k === count - 1 ? 0 : rng.int(-1, 1);
    rest.push(Math.round(base) + jitter);
  }
  return [...first, ...rest];
}

function shortsSchedule(): number[] {
  const start = 160;
  const end = N_DAYS - 6;
  return SHORT_SEEDS.map((_, k) => Math.round(start + ((end - start) * k) / (SHORT_SEEDS.length - 1)));
}

const LONG_DAYS = longFormSchedule();
const SHORT_DAYS = shortsSchedule();

/** Upload hour-of-day for each seeded video (UK evening uploads, as the channel's audience prefers). */
const UPLOAD_HOURS = [17, 18, 17, 16, 17, 19, 17, 18];

export interface SeededVideoTiming {
  id: string;
  publishDay: number;
  publishedAt: number;
}

export const SEEDED_TIMING: Record<string, SeededVideoTiming> = {};
[...LONG_FORM_SEEDS.map((v, i) => [v, LONG_DAYS[i]] as const), ...SHORT_SEEDS.map((v, i) => [v, SHORT_DAYS[i]] as const)].forEach(
  ([v, day], i) => {
    const d = dayDate(day);
    const at = new Date(d);
    at.setHours(UPLOAD_HOURS[i % UPLOAD_HOURS.length], v.kind === 'short' ? 30 : 0, 0, 0);
    SEEDED_TIMING[v.id] = { id: v.id, publishDay: day, publishedAt: at.getTime() };
  },
);

// ---------------------------------------------------------------------------------------------
// Channel-level daily curves
// ---------------------------------------------------------------------------------------------
const WEEKDAY_VIEWS = [1.1, 0.97, 0.95, 0.96, 0.97, 1.0, 1.07]; // Sun..Sat
const WEEKDAY_CPM = [0.9, 1.04, 1.06, 1.05, 1.03, 0.98, 0.9];

function rateInterpolator(perWindowTotals: number[], startValue: number) {
  const xs: number[] = [0];
  const ys: number[] = [startValue];
  WINDOWS.forEach((w, k) => {
    xs.push((w.start + w.end) / 2);
    ys.push(perWindowTotals[k] / WINDOW_LENGTHS[k]);
  });
  xs.push(N_DAYS);
  const lastRate = perWindowTotals[9] / WINDOW_LENGTHS[9];
  ys.push(lastRate * 1.06);
  return monotoneInterpolator(xs, ys);
}

function normaliseWindows(raw: number[], targets: number[], integer: boolean): number[] {
  const out = new Array<number>(N_DAYS).fill(0);
  WINDOWS.forEach((w, k) => {
    const slice = raw.slice(w.start, w.end + 1);
    const target = targets[k];
    if (integer) {
      const ints = integerise(slice, Math.round(target));
      ints.forEach((v, j) => (out[w.start + j] = v));
    } else {
      // revenue: work in pence to keep exact totals
      const ints = integerise(slice, Math.round(target * 100));
      ints.forEach((v, j) => (out[w.start + j] = v / 100));
    }
  });
  return out;
}

function uploadBump(day: number, days: number[], seeds: VideoSeed[], strength: number, tau: number) {
  let b = 0;
  for (let k = 0; k < days.length; k++) {
    const age = day - days[k];
    if (age >= 0 && age < 12) b += strength * Math.min(2.5, Math.sqrt(seeds[k].appeal)) * Math.exp(-age / tau);
  }
  return b;
}

const rng = createRng(20260108);

const longTargets = VIEWS_PER_WINDOW.map((v, k) => v - SHORTS_VIEWS_PER_WINDOW[k]);
const longRate = rateInterpolator(longTargets, 260);
const longRaw: number[] = [];
for (let d = 0; d < N_DAYS; d++) {
  const wd = dayDate(d).getDay();
  const noise = Math.exp(rng.normal(0, 0.05));
  longRaw.push(Math.max(1, longRate(d) * WEEKDAY_VIEWS[wd] * noise * (1 + uploadBump(d, LONG_DAYS, LONG_FORM_SEEDS, 0.12, 2.5))));
}
const LONG_VIEWS = normaliseWindows(longRaw, longTargets, true);

const shortRate = rateInterpolator(SHORTS_VIEWS_PER_WINDOW, 0);
const shortRaw: number[] = [];
for (let d = 0; d < N_DAYS; d++) {
  if (d < SHORT_DAYS[0]) {
    shortRaw.push(0);
    continue;
  }
  const noise = Math.exp(rng.normal(0, 0.16));
  shortRaw.push(Math.max(1, shortRate(d) * noise * (1 + uploadBump(d, SHORT_DAYS, SHORT_SEEDS, 0.5, 3))));
}
const SHORT_VIEWS = normaliseWindows(shortRaw, SHORTS_VIEWS_PER_WINDOW, true);

const TOTAL_VIEWS = LONG_VIEWS.map((v, i) => v + SHORT_VIEWS[i]);

// Net subscribers
const subsGainedPerWindow = SUBS_AT_WINDOW_END.map((v, k) => v - (k === 0 ? 0 : SUBS_AT_WINDOW_END[k - 1]));
const spv = monotoneInterpolator(
  WINDOWS.map((w) => (w.start + w.end) / 2),
  subsGainedPerWindow.map((g, k) => g / VIEWS_PER_WINDOW[k]),
);
const subsRaw = TOTAL_VIEWS.map((v, d) => Math.max(0.5, v * spv(d) * Math.exp(rng.normal(0, 0.08))));
const SUBS_NET = normaliseWindows(subsRaw, subsGainedPerWindow, true);
const SUBS_LOST = SUBS_NET.map((n, d) => Math.round(n * (0.068 + 0.02 * Math.sin(d * 1.7)) + (d > 120 ? 2 : 0)));
const SUBS_GAINED = SUBS_NET.map((n, d) => n + SUBS_LOST[d]);

// Revenue
const rpmCurve = monotoneInterpolator(
  WINDOWS.map((w) => (w.start + w.end) / 2),
  REVENUE_PER_WINDOW.map((r, k) => (r / VIEWS_PER_WINDOW[k]) * 1000 + (k === 3 ? 0.6 : 0)),
);
const revRaw = TOTAL_VIEWS.map((_, d) => {
  if (d < MONETISATION_START) return 0;
  const date = dayDate(d);
  const monthEnd = date.getDate() > 24 ? 1.06 : date.getDate() < 4 ? 0.9 : 1;
  const eff = LONG_VIEWS[d] + SHORT_VIEWS[d] * 0.025;
  return Math.max(0, eff * Math.max(0.2, rpmCurve(d)) * WEEKDAY_CPM[date.getDay()] * monthEnd * Math.exp(rng.normal(0, 0.06)));
});
const REVENUE = normaliseWindows(revRaw, REVENUE_PER_WINDOW, false);

// ---------------------------------------------------------------------------------------------
// Per-video allocation
// ---------------------------------------------------------------------------------------------
export interface VideoAnalytics {
  id: string;
  kind: VideoKind;
  publishDay: number;
  views: Int32Array;
  subs: Float64Array;
  revenue: Float64Array;
  prefixViews: Float64Array;
  prefixSubs: Float64Array;
  prefixRevenue: Float64Array;
  avd: number; // seconds
  ctr: number; // %
  impressionsPerView: number;
  likeRate: number;
  dislikeRatio: number;
  commentRate: number;
  durationSec: number;
  retention: number;
}

function surgeTerm(seed: VideoSeed, age: number) {
  if (!seed.surge) return 0;
  const [start, len, strength] = seed.surge;
  if (age < start || age > start + len) return 0;
  return strength * Math.sin((Math.PI * (age - start)) / len);
}

function allocate(seeds: VideoSeed[], days: number[], totals: number[], weightFn: (seed: VideoSeed, age: number) => number) {
  const out = seeds.map(() => new Int32Array(N_DAYS));
  for (let d = 0; d < N_DAYS; d++) {
    const ws: number[] = [];
    const idx: number[] = [];
    for (let k = 0; k < seeds.length; k++) {
      const age = d - days[k];
      if (age < 0) continue;
      ws.push(weightFn(seeds[k], age));
      idx.push(k);
    }
    if (!idx.length) continue;
    const ints = integerise(ws, totals[d]);
    ints.forEach((v, j) => (out[idx[j]][d] = v));
  }
  return out;
}

const longAlloc = allocate(LONG_FORM_SEEDS, LONG_DAYS, LONG_VIEWS, (s, age) => {
  const partial = age === 0 ? 0.42 : 1;
  return s.appeal * (1 + 22 * Math.exp(-age / 2.5) + 3 * Math.exp(-age / 25) + surgeTerm(s, age)) * partial;
});
const shortAlloc = allocate(SHORT_SEEDS, SHORT_DAYS, SHORT_VIEWS, (s, age) => {
  const partial = age === 0 ? 0.4 : 1;
  return s.appeal * (0.55 + 26 * Math.exp(-age / 4) + 2.5 * Math.exp(-age / 30)) * partial;
});

const ALL_SEEDS = [...LONG_FORM_SEEDS, ...SHORT_SEEDS];
const ALL_DAYS = [...LONG_DAYS, ...SHORT_DAYS];
const ALL_VIEWS = [...longAlloc, ...shortAlloc];

function allocateFloat(totals: number[], weight: (k: number, d: number) => number) {
  const out = ALL_SEEDS.map(() => new Float64Array(N_DAYS));
  for (let d = 0; d < N_DAYS; d++) {
    if (!totals[d]) continue;
    let sum = 0;
    const ws = ALL_SEEDS.map((_, k) => {
      const w = weight(k, d);
      sum += w;
      return w;
    });
    if (sum <= 0) continue;
    ws.forEach((w, k) => (out[k][d] = (totals[d] * w) / sum));
  }
  return out;
}

const subsAlloc = allocateFloat(SUBS_NET, (k, d) => ALL_VIEWS[k][d] * (ALL_SEEDS[k].kind === 'short' ? 0.35 : 1) * ALL_SEEDS[k].subRate);
const revAlloc = allocateFloat(REVENUE, (k, d) => ALL_VIEWS[k][d] * ALL_SEEDS[k].rpmWeight);

function prefix(arr: ArrayLike<number>) {
  const p = new Float64Array(arr.length + 1);
  for (let i = 0; i < arr.length; i++) p[i + 1] = p[i] + arr[i];
  return p;
}

// Calibration: average view duration and impressions so the last 28 days hit the targets exactly.
const L28 = WINDOWS[9];
const sum28 = (arr: ArrayLike<number>) => {
  let s = 0;
  for (let d = L28.start; d <= L28.end; d++) s += arr[d];
  return s;
};

function calibrateAvd(kind: VideoKind, target: number) {
  let num = 0;
  let den = 0;
  ALL_SEEDS.forEach((s, k) => {
    if (s.kind !== kind) return;
    const v = sum28(ALL_VIEWS[k]);
    num += v * s.durationSec * s.retention;
    den += v;
  });
  return den ? target / (num / den) : 1;
}
const AVD_K_LONG = calibrateAvd('video', TARGETS.avdLong28);
const AVD_K_SHORT = calibrateAvd('short', TARGETS.avdShorts28);

const L28_LONG_VIEWS = sum28(LONG_VIEWS);
/** share of long-form views that originate from a thumbnail impression on YouTube */
export const IMPRESSION_VIEW_SHARE = (TARGETS.impressions28 * TARGETS.ctr28) / 100 / L28_LONG_VIEWS;
const CTR_K = (() => {
  let s = 0;
  LONG_FORM_SEEDS.forEach((seed, k) => {
    s += (sum28(ALL_VIEWS[k]) * IMPRESSION_VIEW_SHARE) / (seed.ctr / 100);
  });
  return s / TARGETS.impressions28;
})();

export const VIDEO_ANALYTICS: Record<string, VideoAnalytics> = {};
ALL_SEEDS.forEach((s, k) => {
  const ctr = s.kind === 'short' ? 0 : s.ctr * CTR_K;
  VIDEO_ANALYTICS[s.id] = {
    id: s.id,
    kind: s.kind,
    publishDay: ALL_DAYS[k],
    views: ALL_VIEWS[k],
    subs: subsAlloc[k],
    revenue: revAlloc[k],
    prefixViews: prefix(ALL_VIEWS[k]),
    prefixSubs: prefix(subsAlloc[k]),
    prefixRevenue: prefix(revAlloc[k]),
    avd: s.durationSec * s.retention * (s.kind === 'short' ? AVD_K_SHORT : AVD_K_LONG),
    ctr,
    impressionsPerView: s.kind === 'short' ? 0 : IMPRESSION_VIEW_SHARE / (ctr / 100),
    likeRate: s.likeRate,
    dislikeRatio: 0.012 + ((k * 7) % 10) / 600,
    commentRate: s.commentRate,
    durationSec: s.durationSec,
    retention: s.retention,
  };
});

// ---------------------------------------------------------------------------------------------
// Aggregated daily series per kind
// ---------------------------------------------------------------------------------------------
export type KindFilter = 'all' | 'video' | 'short';

interface KindSeries {
  views: Float64Array;
  watchSec: Float64Array;
  impressions: Float64Array;
  impressionViews: Float64Array;
  subs: Float64Array;
  subsGained: Float64Array;
  subsLost: Float64Array;
  revenue: Float64Array;
  likes: Float64Array;
  dislikes: Float64Array;
  comments: Float64Array;
  shares: Float64Array;
}

function buildKindSeries(filter: KindFilter): KindSeries {
  const z = () => new Float64Array(N_DAYS);
  const s: KindSeries = {
    views: z(), watchSec: z(), impressions: z(), impressionViews: z(), subs: z(), subsGained: z(), subsLost: z(),
    revenue: z(), likes: z(), dislikes: z(), comments: z(), shares: z(),
  };
  Object.values(VIDEO_ANALYTICS).forEach((va) => {
    if (filter !== 'all' && va.kind !== filter) return;
    for (let d = 0; d < N_DAYS; d++) {
      const v = va.views[d];
      if (!v) continue;
      s.views[d] += v;
      s.watchSec[d] += v * va.avd;
      s.impressions[d] += v * va.impressionsPerView;
      s.impressionViews[d] += va.kind === 'video' ? v * IMPRESSION_VIEW_SHARE : 0;
      s.subs[d] += va.subs[d];
      s.revenue[d] += va.revenue[d];
      s.likes[d] += v * va.likeRate;
      s.dislikes[d] += v * va.likeRate * va.dislikeRatio;
      s.comments[d] += v * va.commentRate;
      s.shares[d] += v * 0.0042;
    }
  });
  for (let d = 0; d < N_DAYS; d++) {
    const net = filter === 'all' ? SUBS_NET[d] : s.subs[d];
    const share = SUBS_NET[d] ? net / SUBS_NET[d] : 0;
    s.subsGained[d] = SUBS_GAINED[d] * share;
    s.subsLost[d] = SUBS_LOST[d] * share;
  }
  return s;
}

export const SERIES: Record<KindFilter, KindSeries> = {
  all: buildKindSeries('all'),
  video: buildKindSeries('video'),
  short: buildKindSeries('short'),
};

export const SUBSCRIBERS_CUMULATIVE = (() => {
  const out = new Float64Array(N_DAYS);
  let c = 0;
  for (let d = 0; d < N_DAYS; d++) {
    c += SUBS_NET[d];
    out[d] = c;
  }
  return out;
})();

export const CURRENT_SUBSCRIBERS = Math.round(SUBSCRIBERS_CUMULATIVE[LAST]);
export const LIFETIME_VIEWS = TOTAL_VIEWS.reduce((a, b) => a + b, 0);

// ---------------------------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------------------------
export type Metric =
  | 'views'
  | 'watchHours'
  | 'subscribers'
  | 'subsGained'
  | 'subsLost'
  | 'revenue'
  | 'impressions'
  | 'ctr'
  | 'avd'
  | 'rpm'
  | 'cpm'
  | 'playbackCpm'
  | 'monetisedPlaybacks'
  | 'adImpressions'
  | 'uniqueViewers'
  | 'returningViewers'
  | 'newViewers'
  | 'likes'
  | 'comments'
  | 'shares'
  | 'impressionViews';

export interface Scope {
  kind?: KindFilter;
  videoId?: string;
}

/** Fraction of long-form views that showed at least one ad. */
const MONETISED_PLAYBACK_RATE = 0.584;
const CREATOR_SHARE = 0.55;
const ADS_PER_PLAYBACK = 1.26;

function dailyValue(metric: Metric, scope: Scope, d: number): number {
  if (d < 0 || d >= N_DAYS) return 0;
  if (scope.videoId) {
    const va = VIDEO_ANALYTICS[scope.videoId];
    if (!va) return 0;
    const v = va.views[d];
    switch (metric) {
      case 'views': return v;
      case 'watchHours': return (v * va.avd) / 3600;
      case 'subscribers': return va.subs[d];
      case 'subsGained': return va.subs[d] * 1.075;
      case 'subsLost': return va.subs[d] * 0.075;
      case 'revenue': return va.revenue[d];
      case 'impressions': return v * va.impressionsPerView;
      case 'impressionViews': return va.kind === 'video' ? v * IMPRESSION_VIEW_SHARE : 0;
      case 'ctr': return va.ctr;
      case 'avd': return v ? va.avd : 0;
      case 'likes': return v * va.likeRate;
      case 'comments': return v * va.commentRate;
      case 'shares': return v * 0.0042;
      case 'monetisedPlaybacks': return va.revenue[d] > 0 ? v * (va.kind === 'short' ? 0.22 : MONETISED_PLAYBACK_RATE) : 0;
      case 'adImpressions': return va.revenue[d] > 0 ? v * (va.kind === 'short' ? 0.22 : MONETISED_PLAYBACK_RATE) * ADS_PER_PLAYBACK : 0;
      case 'rpm': return v ? (va.revenue[d] / v) * 1000 : 0;
      case 'uniqueViewers': return v / 1.24;
      case 'returningViewers': return (v / 1.24) * 0.31;
      case 'newViewers': return (v / 1.24) * 0.69;
      default: return 0;
    }
  }
  const s = SERIES[scope.kind ?? 'all'];
  switch (metric) {
    case 'views': return s.views[d];
    case 'watchHours': return s.watchSec[d] / 3600;
    case 'subscribers': return s.subs[d];
    case 'subsGained': return s.subsGained[d];
    case 'subsLost': return s.subsLost[d];
    case 'revenue': return s.revenue[d];
    case 'impressions': return s.impressions[d];
    case 'impressionViews': return s.impressionViews[d];
    case 'likes': return s.likes[d];
    case 'comments': return s.comments[d];
    case 'shares': return s.shares[d];
    case 'uniqueViewers': return s.views[d] / 1.33;
    case 'returningViewers': return (s.views[d] / 1.33) * 0.29;
    case 'newViewers': return (s.views[d] / 1.33) * 0.71;
    case 'monetisedPlaybacks': return d >= MONETISATION_START ? SERIES.video.views[d] * MONETISED_PLAYBACK_RATE * (scope.kind === 'short' ? 0 : 1) + (scope.kind === 'video' ? 0 : SERIES.short.views[d] * 0.22) : 0;
    case 'adImpressions': return dailyValue('monetisedPlaybacks', scope, d) * ADS_PER_PLAYBACK;
    case 'ctr': return s.impressions[d] ? (s.impressionViews[d] / s.impressions[d]) * 100 : 0;
    case 'avd': return s.views[d] ? s.watchSec[d] / s.views[d] : 0;
    case 'rpm': return s.views[d] ? (s.revenue[d] / s.views[d]) * 1000 : 0;
    case 'cpm': {
      const ai = dailyValue('adImpressions', scope, d);
      return ai ? ((s.revenue[d] * 0.93) / CREATOR_SHARE / ai) * 1000 : 0;
    }
    case 'playbackCpm': {
      const mp = dailyValue('monetisedPlaybacks', scope, d);
      return mp ? ((s.revenue[d] * 0.93) / CREATOR_SHARE / mp) * 1000 : 0;
    }
    default: return 0;
  }
}

function sumMetric(metric: Metric, scope: Scope, a: number, b: number) {
  let total = 0;
  const lo = Math.max(0, a);
  const hi = Math.min(LAST, b);
  for (let d = lo; d <= hi; d++) total += dailyValue(metric, scope, d);
  return total;
}

/** Range total for any metric. Ratio metrics are computed from their components. */
export function metricTotal(metric: Metric, scope: Scope, a: number, b: number): number {
  if (b < 0 || a > LAST) return 0;
  switch (metric) {
    case 'ctr': {
      const impr = sumMetric('impressions', scope, a, b);
      return impr ? (sumMetric('impressionViews', scope, a, b) / impr) * 100 : 0;
    }
    case 'avd': {
      const v = sumMetric('views', scope, a, b);
      return v ? (sumMetric('watchHours', scope, a, b) * 3600) / v : 0;
    }
    case 'rpm': {
      const v = sumMetric('views', scope, a, b);
      return v ? (sumMetric('revenue', scope, a, b) / v) * 1000 : 0;
    }
    case 'cpm': {
      const ai = sumMetric('adImpressions', scope, a, b);
      return ai ? ((sumMetric('revenue', scope, a, b) * 0.93) / CREATOR_SHARE / ai) * 1000 : 0;
    }
    case 'playbackCpm': {
      const mp = sumMetric('monetisedPlaybacks', scope, a, b);
      return mp ? ((sumMetric('revenue', scope, a, b) * 0.93) / CREATOR_SHARE / mp) * 1000 : 0;
    }
    case 'uniqueViewers':
    case 'returningViewers':
    case 'newViewers': {
      const v = sumMetric('views', scope, a, b);
      const len = Math.min(LAST, b) - Math.max(0, a) + 1;
      const unique = v / (1.18 + 0.52 * Math.log(1 + len / 3));
      if (metric === 'uniqueViewers') return unique;
      const returningShare = Math.min(0.42, 0.18 + 0.03 * Math.log(1 + len));
      return metric === 'returningViewers' ? unique * returningShare : unique * (1 - returningShare);
    }
    default:
      return sumMetric(metric, scope, a, b);
  }
}

export function metricSeries(metric: Metric, scope: Scope, a: number, b: number): { day: number; value: number }[] {
  const out: { day: number; value: number }[] = [];
  for (let d = Math.max(0, a); d <= Math.min(LAST, b); d++) out.push({ day: d, value: dailyValue(metric, scope, d) });
  return out;
}

export function lifetimeVideoStats(id: string) {
  const va = VIDEO_ANALYTICS[id];
  if (!va) return null;
  const views = va.prefixViews[N_DAYS];
  return {
    views,
    likes: Math.round(views * va.likeRate),
    dislikes: Math.round(views * va.likeRate * va.dislikeRatio),
    comments: Math.round(views * va.commentRate),
    revenue: va.prefixRevenue[N_DAYS],
    subs: va.prefixSubs[N_DAYS],
    watchHours: (views * va.avd) / 3600,
    impressions: views * va.impressionsPerView,
    ctr: va.ctr,
    avd: va.avd,
  };
}

export function videoRangeStats(id: string, a: number, b: number) {
  const va = VIDEO_ANALYTICS[id];
  const lo = Math.max(0, a);
  const hi = Math.min(LAST, b);
  if (!va || hi < lo) return { views: 0, watchHours: 0, subs: 0, revenue: 0, impressions: 0, ctr: 0, avd: 0, likes: 0, comments: 0 };
  const views = va.prefixViews[hi + 1] - va.prefixViews[lo];
  return {
    views,
    watchHours: (views * va.avd) / 3600,
    subs: va.prefixSubs[hi + 1] - va.prefixSubs[lo],
    revenue: va.prefixRevenue[hi + 1] - va.prefixRevenue[lo],
    impressions: views * va.impressionsPerView,
    ctr: va.ctr,
    avd: views ? va.avd : 0,
    likes: views * va.likeRate,
    comments: views * va.commentRate,
  };
}

/** Views a video achieved in its first `days` days (used for "ranking compared to previous uploads"). */
export function firstDaysViews(id: string, days: number) {
  const va = VIDEO_ANALYTICS[id];
  if (!va) return 0;
  const end = Math.min(LAST, va.publishDay + days - 1);
  return va.prefixViews[end + 1] - va.prefixViews[va.publishDay];
}

export function growthByWindow() {
  return WINDOWS.map((w, k) => ({
    label: w.label,
    start: w.start,
    end: w.end,
    subscribers: SUBS_AT_WINDOW_END[k],
    subsGained: subsGainedPerWindow[k],
    views: VIEWS_PER_WINDOW[k],
    revenue: REVENUE_PER_WINDOW[k],
    watchHours: metricTotal('watchHours', {}, w.start, w.end),
    rpm: (REVENUE_PER_WINDOW[k] / VIEWS_PER_WINDOW[k]) * 1000,
  }));
}

// ---------------------------------------------------------------------------------------------
// Realtime (hourly) model
// ---------------------------------------------------------------------------------------------
const DIURNAL = [0.9, 0.75, 0.62, 0.55, 0.5, 0.45, 0.42, 0.45, 0.55, 0.68, 0.8, 0.9, 0.98, 1.02, 1.05, 1.08, 1.12, 1.18, 1.25, 1.32, 1.38, 1.36, 1.25, 1.08];
const DIURNAL_SUM = DIURNAL.reduce((a, b) => a + b, 0);

export function hourlyShare(hour: number) {
  return DIURNAL[hour] / DIURNAL_SUM;
}

/** Estimated views for "today" (the partial day not yet in daily analytics). */
export const TODAY_EST_VIEWS = Math.round(TOTAL_VIEWS[LAST] * 1.025);
export const TODAY_EST_SUBS = Math.round(SUBS_NET[LAST] * 1.02);

/**
 * Hourly views for the 48 hours ending at the current hour (oldest first). `hourStart` is epoch ms.
 * The current hour is pro-rated by how far into the hour we are.
 */
export function last48Hours(now = Date.now(), videoId?: string) {
  const out: { hourStart: number; views: number }[] = [];
  const currentHour = new Date(now);
  currentHour.setMinutes(0, 0, 0);
  const rngH = createRng(7 + (videoId ? videoId.length * 31 : 0));
  for (let h = 47; h >= 0; h--) {
    const start = currentHour.getTime() - h * 3_600_000;
    const date = new Date(start);
    const dayIdx = Math.round((startOfDay(date).getTime() - LAUNCH.getTime()) / 86_400_000);
    let daily: number;
    if (videoId) {
      const va = VIDEO_ANALYTICS[videoId];
      if (!va) daily = 0;
      else if (dayIdx > LAST) daily = va.views[LAST] * (dayIdx - va.publishDay <= 3 ? 0.9 : 1.0);
      else daily = va.views[dayIdx] ?? 0;
      if (va && dayIdx < va.publishDay) daily = 0;
      const pubAt = SEEDED_TIMING[videoId]?.publishedAt ?? 0;
      if (start + 3_600_000 <= pubAt) daily = 0;
    } else {
      daily = dayIdx > LAST ? TODAY_EST_VIEWS : TOTAL_VIEWS[dayIdx] ?? 0;
    }
    let v = daily * hourlyShare(date.getHours()) * Math.exp(rngH.normal(0, 0.07));
    if (h === 0) v *= (now - start) / 3_600_000;
    out.push({ hourStart: start, views: Math.max(0, Math.round(v)) });
  }
  return out;
}
