import { DAY_MS } from '../lib/dates';
import { SESSION_START } from './analytics';
import { LONG_FORM_SEEDS } from './catalogue';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  durationSec: number;
  licence: 'none' | 'attribution';
  addedAt: number;
  kind: 'music' | 'sfx';
  category?: string;
  /** synthesiser params */
  bpm: number;
  scale: 'minor' | 'major' | 'phrygian' | 'dorian';
  root: number; // midi note
  wave: OscillatorType;
}

const T = (
  title: string, artist: string, genre: string, mood: string, durationSec: number, daysAgo: number,
  bpm: number, scale: AudioTrack['scale'], root: number, wave: OscillatorType, licence: AudioTrack['licence'] = 'none',
): Omit<AudioTrack, 'id' | 'kind'> => ({ title, artist, genre, mood, durationSec, licence, addedAt: SESSION_START - daysAgo * DAY_MS, bpm, scale, root, wave });

const MUSIC = [
  T('Legions of the North', 'Aurelian Sound', 'Cinematic', 'Dramatic', 184, 6, 76, 'minor', 45, 'sawtooth'),
  T('Sands of Memphis', 'Nile Ensemble', 'Cinematic', 'Calm', 212, 6, 68, 'phrygian', 50, 'triangle'),
  T('The Last Emperor', 'Halcyon Strings', 'Classical', 'Sad', 241, 12, 60, 'minor', 48, 'sine'),
  T('Steppe Riders', 'Khan & Co.', 'World', 'Dramatic', 158, 12, 112, 'dorian', 47, 'square'),
  T('Candlelit Scriptorium', 'Monastery Tapes', 'Ambient', 'Calm', 265, 20, 54, 'dorian', 52, 'sine'),
  T('Siege Engines', 'Iron Choir', 'Cinematic', 'Angry', 176, 20, 96, 'minor', 40, 'sawtooth'),
  T('Dawn Over Athens', 'Aegean Light', 'Classical', 'Inspirational', 198, 27, 72, 'major', 53, 'triangle'),
  T('Plague Bells', 'Grey Friars', 'Ambient', 'Dark', 222, 27, 50, 'phrygian', 43, 'sine'),
  T('Marching to Carthage', 'Aurelian Sound', 'Cinematic', 'Dramatic', 167, 34, 88, 'minor', 46, 'sawtooth'),
  T('Gold of the Pharaohs', 'Nile Ensemble', 'World', 'Bright', 149, 34, 100, 'phrygian', 55, 'triangle'),
  T('Shadows of Byzantium', 'Halcyon Strings', 'Cinematic', 'Dark', 236, 41, 64, 'minor', 44, 'sawtooth'),
  T('Viking Hearth', 'Fjord Folk', 'Folk', 'Happy', 143, 41, 118, 'dorian', 50, 'square'),
  T('Requiem for Pompeii', 'Halcyon Strings', 'Classical', 'Sad', 257, 48, 58, 'minor', 47, 'sine'),
  T('Imperial Court', 'Baroque Room', 'Classical', 'Romantic', 189, 48, 84, 'major', 55, 'triangle'),
  T('Into the Unknown', 'Atlas Cinematic', 'Cinematic', 'Inspirational', 205, 55, 80, 'major', 48, 'sawtooth'),
  T('Old Maps', 'Lo-Fi Archivist', 'Hip hop & rap', 'Calm', 132, 55, 82, 'dorian', 52, 'triangle', 'attribution'),
  T('Hall of Kings', 'Iron Choir', 'Cinematic', 'Dramatic', 194, 62, 70, 'minor', 41, 'sawtooth'),
  T('Desert Caravan', 'Silk Road Players', 'World', 'Calm', 221, 62, 92, 'phrygian', 50, 'triangle'),
  T('Mystery of the Deep', 'Atlas Cinematic', 'Ambient', 'Dark', 248, 69, 56, 'minor', 38, 'sine'),
  T('Feast at the Castle', 'Fjord Folk', 'Folk', 'Funny', 117, 69, 132, 'major', 57, 'square', 'attribution'),
  T('Eternal City', 'Aurelian Sound', 'Cinematic', 'Inspirational', 230, 76, 74, 'major', 50, 'sawtooth'),
  T('The Long Night', 'Grey Friars', 'Ambient', 'Sad', 280, 76, 48, 'minor', 45, 'sine'),
  T('Temple Drums', 'Silk Road Players', 'World', 'Angry', 126, 83, 120, 'phrygian', 42, 'square'),
  T('Parchment & Ink', 'Lo-Fi Archivist', 'Hip hop & rap', 'Calm', 140, 83, 86, 'dorian', 53, 'triangle', 'attribution'),
];

const SFX = [
  ['Sword Clash', 'Weapons', 3], ['Battle Horn', 'Ambience', 6], ['Colosseum Crowd Cheer', 'Crowds', 11], ['Galloping Horses', 'Animals', 9],
  ['Cathedral Bell Toll', 'Bells', 7], ['Crackling Torch', 'Fire', 15], ['Arrow Volley', 'Weapons', 4], ['Heavy Wooden Door', 'Doors', 3],
  ['Ocean Waves on Rocks', 'Nature', 20], ['Thunder Clap', 'Weather', 5], ['Medieval Market Ambience', 'Crowds', 30], ['War Drums', 'Music', 12],
  ['Scroll Unrolling', 'Foley', 2], ['Catapult Launch', 'Weapons', 4], ['Wind Through Ruins', 'Nature', 25], ['Chains Rattling', 'Foley', 4],
] as const;

export const AUDIO_TRACKS: AudioTrack[] = [
  ...MUSIC.map((m, i) => ({ ...m, id: `mus${i + 1}`, kind: 'music' as const })),
  ...SFX.map(([title, category, dur], i) => ({
    id: `sfx${i + 1}`, kind: 'sfx' as const, title, artist: 'YouTube Sound Effects', genre: category, mood: '', category, durationSec: dur,
    licence: 'none' as const, addedAt: SESSION_START - (i * 9 + 3) * DAY_MS, bpm: 60 + i * 9, scale: (['minor', 'phrygian', 'dorian', 'major'] as const)[i % 4], root: 36 + (i % 12), wave: (['sawtooth', 'square', 'triangle', 'sine'] as const)[i % 4],
  })),
];

export const MUSIC_GENRES = ['Ambient', 'Cinematic', 'Classical', 'Folk', 'Hip hop & rap', 'World'];
export const MUSIC_MOODS = ['Angry', 'Bright', 'Calm', 'Dark', 'Dramatic', 'Funny', 'Happy', 'Inspirational', 'Romantic', 'Sad'];

// ---------------------------------------------------------------------------------------------
// Copyright
// ---------------------------------------------------------------------------------------------
export interface CopyrightMatch {
  id: string;
  videoId: string;
  channel: string;
  channelSubs: number;
  matchTitle: string;
  matchViews: number;
  matchPercent: number;
  matchLength: string;
  uploadedAt: number;
  status: 'new' | 'removal-requested' | 'contacted' | 'archived';
}

export interface ContentClaim {
  id: string;
  videoId: string;
  claimant: string;
  asset: string;
  segment: string;
  impact: string;
  status: 'active' | 'disputed' | 'resolved';
  resolution?: string;
  at: number;
}

const masada = LONG_FORM_SEEDS[41];

export const SEED_MATCHES: CopyrightMatch[] = [
  { id: 'm1', videoId: LONG_FORM_SEEDS[13].id, channel: 'History Daily Clips', channelSubs: 2_310, matchTitle: 'mongol empire documentary FULL (reupload)', matchViews: 18_420, matchPercent: 96, matchLength: '23:12', uploadedAt: SESSION_START - 6 * DAY_MS, status: 'new' },
  { id: 'm2', videoId: LONG_FORM_SEEDS[22].id, channel: 'Top10 Facts Hub', channelSubs: 41_800, matchTitle: 'Life during the Black Death #history #shorts', matchViews: 92_100, matchPercent: 12, matchLength: '0:58', uploadedAt: SESSION_START - 11 * DAY_MS, status: 'new' },
  { id: 'm3', videoId: LONG_FORM_SEEDS[17].id, channel: 'Rome Edits', channelSubs: 860, matchTitle: 'Cannae edit 🔥 (phonk)', matchViews: 4_230, matchPercent: 7, matchLength: '0:34', uploadedAt: SESSION_START - 19 * DAY_MS, status: 'new' },
  { id: 'm4', videoId: LONG_FORM_SEEDS[27].id, channel: 'Documentary Mirror', channelSubs: 15_600, matchTitle: 'The Roman Emperor Who Declared War on the Sea', matchViews: 7_910, matchPercent: 100, matchLength: '15:07', uploadedAt: SESSION_START - 26 * DAY_MS, status: 'new' },
];

export const SEED_CLAIMS: ContentClaim[] = [
  { id: 'cl1', videoId: masada.id, claimant: 'Epic Score Publishing', asset: 'Legion Rising (Instrumental) – Epic Score Publishing', segment: '04:12 – 05:31', impact: 'Monetised by claimant. Video can be viewed worldwide.', status: 'active', at: SESSION_START - 13 * DAY_MS },
];

// ---------------------------------------------------------------------------------------------
// Subtitles
// ---------------------------------------------------------------------------------------------
export interface SubtitleTrack {
  language: string;
  kind: 'auto' | 'published' | 'draft';
  modifiedAt: number;
  titleAndDescription?: boolean;
  lines?: { start: number; end: number; text: string }[];
}

export function seedSubtitles(videoId: string, index: number, publishedAt: number): SubtitleTrack[] {
  const tracks: SubtitleTrack[] = [{ language: 'English (United Kingdom)', kind: 'published', modifiedAt: publishedAt + 3600_000, titleAndDescription: true }];
  tracks.push({ language: 'English (auto-generated)', kind: 'auto', modifiedAt: publishedAt + 2 * 3600_000 });
  if (index % 3 === 0) tracks.push({ language: 'Spanish', kind: 'published', modifiedAt: publishedAt + 5 * DAY_MS, titleAndDescription: true });
  if (index % 5 === 0) tracks.push({ language: 'German', kind: 'published', modifiedAt: publishedAt + 8 * DAY_MS, titleAndDescription: index % 10 === 0 });
  if (index % 7 === 0) tracks.push({ language: 'Portuguese (Brazil)', kind: 'draft', modifiedAt: publishedAt + 9 * DAY_MS });
  void videoId;
  // never show a modification date in the future
  return tracks.map((t) => ({ ...t, modifiedAt: Math.min(t.modifiedAt, SESSION_START - (index % 5) * 3_600_000) }));
}

export const SUBTITLE_LANGUAGE_OPTIONS = [
  'Arabic', 'Chinese (Simplified)', 'Dutch', 'French', 'German', 'Hindi', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Polish',
  'Portuguese (Brazil)', 'Russian', 'Spanish', 'Swedish', 'Turkish', 'Ukrainian', 'Vietnamese',
];

export function sampleCaptionLines(title: string, durationSec: number) {
  const lines = [
    `Welcome back to The Past Explained.`,
    `Today's story: ${title.replace(/\?$/, '')}.`,
    'To understand what happened, we need to go back to the very beginning.',
    'Historians have argued about this for centuries.',
    'But the evidence tells a far more interesting story.',
    'And what happened next would change everything.',
  ];
  const step = Math.min(6, durationSec / lines.length);
  return lines.map((text, i) => ({ start: i * step, end: (i + 1) * step - 0.2, text }));
}
