import type { AudioTrack } from '../data/library';
import { createRng, hashString } from './random';

/**
 * Tiny procedural synthesiser so Audio Library tracks can actually be previewed and downloaded
 * without shipping audio files. Each track gets a deterministic pattern from its id.
 */
const SCALES: Record<AudioTrack['scale'], number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
};

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

interface Pattern {
  bass: number[];
  arp: number[];
  chords: number[][];
}

function pattern(track: AudioTrack): Pattern {
  const rng = createRng(hashString(track.id));
  const sc = SCALES[track.scale];
  const degrees = [0, rng.pick([3, 5]), rng.pick([4, 5]), rng.pick([3, 6])];
  const chords = degrees.map((d) => [0, 2, 4].map((o) => track.root + 12 + sc[(d + o) % 7] + (d + o >= 7 ? 12 : 0)));
  const bass = degrees.map((d) => track.root + sc[d % 7]);
  const arp = Array.from({ length: 16 }, () => track.root + 24 + sc[rng.int(0, 6)] + (rng.chance(0.25) ? 12 : 0));
  return { bass, arp, chords };
}

function scheduleMusic(ctx: BaseAudioContext, out: AudioNode, track: AudioTrack, startAt: number, duration: number) {
  const p = pattern(track);
  const beat = 60 / track.bpm;
  const bar = beat * 4;
  const bars = Math.ceil(duration / bar);
  const note = (freq: number, t: number, len: number, type: OscillatorType, gain: number) => {
    if (t > startAt + duration) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + Math.min(0.05, len * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + len + 0.05);
  };
  for (let b = 0; b < bars; b++) {
    const t0 = startAt + b * bar;
    const ci = b % 4;
    note(mtof(p.bass[ci]), t0, bar * 0.95, 'triangle', 0.22);
    p.chords[ci].forEach((m) => note(mtof(m), t0, bar, track.wave === 'square' ? 'triangle' : 'sine', 0.05));
    if (b >= 1) {
      for (let s = 0; s < 8; s++) note(mtof(p.arp[(b * 8 + s) % 16]), t0 + s * (beat / 2), beat * 0.45, track.wave, 0.045);
    }
    if (track.bpm > 80 && b >= 2) {
      for (let k = 0; k < 4; k++) {
        const t = t0 + k * beat;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(120, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
        g.gain.setValueAtTime(k % 2 === 0 ? 0.35 : 0.18, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + 0.32);
      }
    }
  }
}

function scheduleSfx(ctx: BaseAudioContext, out: AudioNode, track: AudioTrack, startAt: number, duration: number) {
  const len = Math.min(duration, track.durationSec);
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const rng = createRng(hashString(track.id));
  for (let i = 0; i < data.length; i++) data[i] = rng.range(-1, 1);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  const cat = track.category ?? '';
  filter.type = cat === 'Weapons' || cat === 'Foley' ? 'highpass' : 'lowpass';
  filter.frequency.value = cat === 'Nature' || cat === 'Weather' ? 600 : cat === 'Crowds' ? 1400 : 2500;
  g.gain.setValueAtTime(0.0001, startAt);
  g.gain.exponentialRampToValueAtTime(0.5, startAt + (cat === 'Weapons' ? 0.01 : 0.4));
  g.gain.exponentialRampToValueAtTime(0.0001, startAt + len);
  src.connect(filter).connect(g).connect(out);
  src.start(startAt);
  if (cat === 'Bells' || cat === 'Music' || cat === 'Ambience') {
    scheduleMusic(ctx, out, { ...track, bpm: 50, wave: 'sine' }, startAt, len);
  }
}

let live: { ctx: AudioContext; master: GainNode } | null = null;

export function playTrack(track: AudioTrack, offset = 0) {
  stopTrack();
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);
  const remaining = Math.max(1, track.durationSec - offset);
  if (track.kind === 'music') scheduleMusic(ctx, master, track, ctx.currentTime + 0.05, Math.min(remaining, 240));
  else scheduleSfx(ctx, master, track, ctx.currentTime + 0.05, remaining);
  live = { ctx, master };
}

export function stopTrack() {
  if (live) {
    const { ctx, master } = live;
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    window.setTimeout(() => ctx.close().catch(() => undefined), 200);
    live = null;
  }
}

export function setVolume(v: number) {
  if (live) live.master.gain.value = v;
}

/** Render a track (up to `maxSeconds`) into a WAV blob. */
export async function renderTrackWav(track: AudioTrack, maxSeconds = 60): Promise<Blob> {
  const seconds = Math.min(track.durationSec, maxSeconds);
  const rate = 22050;
  const ctx = new OfflineAudioContext(1, Math.ceil(seconds * rate), rate);
  const master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);
  if (track.kind === 'music') scheduleMusic(ctx, master, track, 0, seconds);
  else scheduleSfx(ctx, master, track, 0, seconds);
  const buf = await ctx.startRendering();
  const samples = buf.getChannelData(0);
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const w = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  w(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
  return new Blob([view], { type: 'audio/wav' });
}
