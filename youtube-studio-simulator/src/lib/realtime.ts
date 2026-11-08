import { useSyncExternalStore } from 'react';
import { CURRENT_SUBSCRIBERS, last48Hours, VIDEO_ANALYTICS, hourlyShare, TODAY_EST_VIEWS } from '../data/analytics';

/**
 * Simulated realtime feed: the subscriber counter and the "last 48 hours" bars keep ticking
 * while the app is open, so the channel feels alive.
 */
interface RealtimeState {
  subscribers: number;
  gainedThisSession: number;
  hours: { hourStart: number; views: number }[];
  total48: number;
  lastTick: number;
  lastSubAt: number;
}

let state: RealtimeState = init();
const listeners = new Set<() => void>();
let timer: number | undefined;

function init(): RealtimeState {
  const hours = last48Hours();
  return {
    subscribers: CURRENT_SUBSCRIBERS,
    gainedThisSession: 0,
    hours,
    total48: hours.reduce((a, h) => a + h.views, 0),
    lastTick: Date.now(),
    lastSubAt: 0,
  };
}

function poisson(lambda: number) {
  if (lambda > 30) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * (Math.random() * 2 - 1)));
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function tick() {
  const now = Date.now();
  const dt = (now - state.lastTick) / 1000;
  let hours = state.hours;
  const last = hours[hours.length - 1];
  if (now - last.hourStart >= 3_600_000) {
    // a new hour started – roll the window forward
    const fresh = last48Hours(now);
    hours = [...hours.slice(1, hours.length), { hourStart: fresh[fresh.length - 1].hourStart, views: 0 }];
  }
  const h = new Date(now).getHours();
  const ratePerSec = (TODAY_EST_VIEWS * hourlyShare(h)) / 3600;
  const add = poisson(ratePerSec * dt);
  const updated = hours.map((x, i) => (i === hours.length - 1 ? { ...x, views: x.views + add } : x));
  const subGain = Math.random() < Math.min(0.6, dt / 70) ? (Math.random() < 0.15 ? 2 : 1) : 0;
  state = {
    ...state,
    hours: updated,
    total48: updated.reduce((a, b) => a + b.views, 0),
    subscribers: state.subscribers + subGain,
    gainedThisSession: state.gainedThisSession + subGain,
    lastTick: now,
    lastSubAt: subGain ? now : state.lastSubAt,
  };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === undefined) {
    const loop = () => {
      tick();
      timer = window.setTimeout(loop, 2200 + Math.random() * 2600);
    };
    timer = window.setTimeout(loop, 1800);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };
}

export function useRealtime() {
  return useSyncExternalStore(subscribe, () => state);
}

const videoCache = new Map<string, number>();
/** Views in the last 48 hours for a single video (static estimate). */
export function video48h(id: string) {
  if (!VIDEO_ANALYTICS[id]) return 0;
  if (!videoCache.has(id)) videoCache.set(id, last48Hours(Date.now(), id).reduce((a, h) => a + h.views, 0));
  return videoCache.get(id)!;
}
