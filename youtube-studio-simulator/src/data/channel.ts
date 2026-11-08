import { LONG_FORM_SEEDS, SHORT_SEEDS, UNPUBLISHED } from './catalogue';
import { DAY_MS } from '../lib/dates';
import { SEEDED_TIMING, SESSION_START, TODAY } from './analytics';
import { avatarColourFor } from './comments';
import type { CommunityPost, Playlist, StudioNotification, Subscriber, Video, VideoSeed } from './types';

export interface ChannelProfile {
  name: string;
  handle: string;
  description: string;
  email: string;
  country: string;
  keywords: string;
  links: { title: string; url: string }[];
  avatarStyle: number;
  bannerStyle: number;
  featuredForSubscribers: string;
  featuredForNonSubscribers: string;
  sections: { id: string; type: string; title: string }[];
  watermark: boolean;
}

export const DEFAULT_PROFILE: ChannelProfile = {
  name: 'The Past Explained',
  handle: '@ThePastExplained',
  description:
    'Cinematic history documentaries about the empires, wars, mysteries and forgotten stories that shaped our world.\n\nNew documentary every week – from ancient Mesopotamia and Rome to the Mongols, the Black Death and beyond.\n\nOur videos are researched from primary and secondary sources and produced with the help of AI tools for narration and illustrative visuals.',
  email: 'hello@thepastexplained.example',
  country: 'United Kingdom',
  keywords: 'history documentary, ancient history, ancient rome, medieval history, empires, historical mysteries',
  links: [
    { title: 'Patreon', url: 'patreon.example/thepastexplained' },
    { title: 'Sources & reading list', url: 'thepastexplained.example/sources' },
    { title: 'Instagram', url: 'instagram.example/thepastexplained' },
  ],
  avatarStyle: 0,
  bannerStyle: 0,
  featuredForSubscribers: '',
  featuredForNonSubscribers: '',
  sections: [
    { id: 'sec1', type: 'Popular videos', title: 'Popular videos' },
    { id: 'sec2', type: 'Videos', title: 'Latest documentaries' },
    { id: 'sec3', type: 'Playlist', title: 'Ancient Rome' },
    { id: 'sec4', type: 'Shorts', title: 'History in 60 seconds' },
  ],
  watermark: true,
};

const DESCRIPTION_FOOTER = (seed: { title: string; tags: string[]; durationSec: number }) => {
  const mins = Math.floor(seed.durationSec / 60);
  const chapters = ['Introduction', 'Background', 'The turning point', 'Aftermath', 'Legacy'];
  const chapterLines = chapters
    .map((c, i) => {
      const t = Math.floor((mins * i) / chapters.length);
      return `${String(t).padStart(2, '0')}:${i === 0 ? '00' : String((i * 17) % 60).padStart(2, '0')} ${c}`;
    })
    .join('\n');
  return `\n\n⏱️ Chapters\n${chapterLines}\n\n📚 Sources and further reading are listed on our website.\n\n🎨 Visuals in this documentary were created with the help of AI tools and are illustrative reconstructions, not historical records.\n\n🔔 Subscribe for a new history documentary every week: @ThePastExplained\n\n${seed.tags
    .slice(0, 3)
    .map((t) => `#${t.replace(/[^a-z0-9]/gi, '')}`)
    .join(' ')} #history #documentary`;
};

const PLAYLIST_FOR_TOPIC: Record<string, string> = {
  'Ancient Rome': 'pl-rome',
  'Ancient Egypt': 'pl-egypt',
  'Medieval Europe': 'pl-medieval',
  'Medieval Britain': 'pl-medieval',
  Crusades: 'pl-medieval',
  Mongols: 'pl-empires',
  Persia: 'pl-empires',
  Byzantium: 'pl-empires',
  Russia: 'pl-empires',
  Aztecs: 'pl-empires',
  Mysteries: 'pl-mysteries',
  'Indus Valley': 'pl-mysteries',
  'Bronze Age': 'pl-mysteries',
};

function seedToVideo(seed: VideoSeed): Video {
  return {
    id: seed.id,
    kind: seed.kind,
    title: seed.title,
    description: seed.kind === 'short' ? `${seed.hook} #shorts #history` : `${seed.hook}${DESCRIPTION_FOOTER(seed)}`,
    durationSec: seed.durationSec,
    topic: seed.topic,
    tags: seed.tags,
    thumb: seed.thumb,
    visibility: 'public',
    monetisation: seed.monetisation,
    restriction: seed.restriction,
    publishedAt: SEEDED_TIMING[seed.id].publishedAt,
    madeForKids: false,
    ageRestricted: false,
    alteredContent: false,
    category: 'Education',
    language: 'English (United Kingdom)',
    commentsMode: 'on',
    playlistIds: seed.kind === 'short' ? ['pl-shorts'] : [PLAYLIST_FOR_TOPIC[seed.topic]].filter(Boolean),
  };
}

export function buildSeedVideos(): Video[] {
  const list = [...LONG_FORM_SEEDS, ...SHORT_SEEDS].map(seedToVideo);
  UNPUBLISHED.forEach((u) => {
    const scheduled = new Date(TODAY.getTime() + u.scheduledInDays * DAY_MS);
    scheduled.setHours(17, 0, 0, 0);
    list.push({
      id: u.id,
      kind: 'video',
      title: u.title,
      description: `${u.hook}${DESCRIPTION_FOOTER(u)}`,
      durationSec: u.durationSec,
      topic: u.topic,
      tags: u.tags,
      thumb: { ...u.thumb },
      visibility: u.visibility,
      monetisation: 'on',
      restriction: 'none',
      publishedAt: SESSION_START - (u.visibility === 'draft' ? 1 : 4) * DAY_MS,
      scheduledFor: u.visibility === 'scheduled' ? scheduled.getTime() : undefined,
      madeForKids: false,
      ageRestricted: false,
      alteredContent: false,
      category: 'Education',
      language: 'English (United Kingdom)',
      commentsMode: 'on',
      playlistIds: ['pl-empires'],
    });
  });
  return list;
}

export const SEED_PLAYLISTS: Playlist[] = [
  { id: 'pl-rome', title: 'Ancient Rome', description: 'Emperors, legions, battles and daily life in the Roman world.', visibility: 'public', videoIds: [], updatedAt: SESSION_START - 9 * DAY_MS },
  { id: 'pl-egypt', title: 'Ancient Egypt', description: 'Pharaohs, pyramids and the secrets of the Nile.', visibility: 'public', videoIds: [], updatedAt: SESSION_START - 4 * DAY_MS },
  { id: 'pl-medieval', title: 'Medieval History', description: 'Castles, crusades, plague and peasants.', visibility: 'public', videoIds: [], updatedAt: SESSION_START - 22 * DAY_MS },
  { id: 'pl-empires', title: 'Empires & Conquerors', description: 'The rise and fall of the world\'s greatest empires.', visibility: 'public', videoIds: [], updatedAt: SESSION_START - 2 * DAY_MS },
  { id: 'pl-mysteries', title: 'Historical Mysteries', description: 'Lost cities, vanished civilisations and unsolved puzzles.', visibility: 'public', videoIds: [], updatedAt: SESSION_START - 8 * DAY_MS },
  { id: 'pl-shorts', title: 'History in 60 Seconds', description: 'Bite-sized history Shorts.', visibility: 'public', videoIds: [], updatedAt: SESSION_START - 5 * DAY_MS },
];

const SUB_NAMES = [
  ['Ancient Echoes', 1_240_000], ['Lucy Thornton', 0], ['The Roman Road', 12_400], ['Battle Maps Daily', 96_400], ['Mark Hollis', 3], ['Greek Myth Corner', 8_210],
  ['Sophie Adeyemi', 0], ['History With Hamish', 2_380], ['Medieval Minds', 433_000], ['Jordan Pike', 41], ['Kai Nakamura', 0], ['DocuNight', 27_900],
  ['Elena Rossi', 12], ['The Sword & Scroll', 5_430], ['Ben Carter', 0], ['Old Maps Club', 1_120], ['Priya Sharma', 0], ['Castle Chronicles', 18_700],
  ['Callum Reid', 7], ['The Archive Room', 64_300], ['Aisha Bello', 0], ['WW History Hub', 15_200],
] as const;

export const RECENT_SUBSCRIBERS: Subscriber[] = SUB_NAMES.map(([name, count], i) => {
  const handle = `@${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
  return {
    id: `sub${i}`,
    name,
    handle,
    avatarColor: avatarColourFor(handle),
    subscriberCount: count,
    subscribedAt: SESSION_START - (i * 3.7 + 0.4) * DAY_MS,
  };
});

const latest = LONG_FORM_SEEDS[LONG_FORM_SEEDS.length - 1];
const mongol = LONG_FORM_SEEDS[13];
const blackDeath = LONG_FORM_SEEDS[22];
const masada = LONG_FORM_SEEDS[41];
const brutal = LONG_FORM_SEEDS[24];

export const SEED_NOTIFICATIONS: StudioNotification[] = [
  { id: 'n1', kind: 'milestone', title: 'Your latest video is off to a great start', body: `“${latest.title}” is performing better than your last 10 videos in its first 24 hours.`, at: SESSION_START - 22 * 3600_000, link: `/video/${latest.id}/analytics`, read: false },
  { id: 'n2', kind: 'payment', title: 'Your AdSense payment has been sent', body: 'A payment of £2,650.14 for your September earnings has been issued to your bank account ending 4417.', at: SESSION_START - 2 * DAY_MS - 4 * 3600_000, link: '/earn', read: false },
  { id: 'n3', kind: 'subscriber', title: 'You reached 80,000 subscribers!', body: 'Congratulations – your channel is growing fast. 100K and the Silver Creator Award are in sight.', at: SESSION_START - 9 * DAY_MS, link: '/analytics/audience', read: false },
  { id: 'n4', kind: 'copyright', title: 'Copyright claim on one of your videos', body: `A Content ID claim was made on “${masada.title}” for the music track “Legion Rising”. Revenue is being paid to the claimant.`, at: SESSION_START - 13 * DAY_MS, link: '/copyright', read: false },
  { id: 'n5', kind: 'milestone', title: 'Video milestone: 500K views', body: `“${mongol.title}” just passed 500,000 views. It is your most-watched video.`, at: SESSION_START - 16 * DAY_MS, link: `/video/${mongol.id}/analytics`, read: true },
  { id: 'n6', kind: 'monetisation', title: 'Limited ads on one video', body: `“${brutal.title}” isn't suitable for most advertisers. You can request a human review.`, at: SESSION_START - 34 * DAY_MS, link: `/video/${brutal.id}/monetisation`, read: true },
  { id: 'n7', kind: 'milestone', title: 'Video milestone: 350K views', body: `“${blackDeath.title}” has passed 350,000 views.`, at: SESSION_START - 41 * DAY_MS, link: `/video/${blackDeath.id}/analytics`, read: true },
  { id: 'n8', kind: 'tip', title: 'Shorts are bringing new viewers', body: 'Viewers who find you through Shorts are watching your long videos too. Try linking a related video from your next Short.', at: SESSION_START - 47 * DAY_MS, link: '/analytics/content', read: true },
  { id: 'n9', kind: 'monetisation', title: 'Memberships are now on', body: 'Your channel memberships are live with 3 levels: Legionary, Centurion and Senator.', at: SESSION_START - 88 * DAY_MS, link: '/earn/memberships', read: true },
  { id: 'n10', kind: 'monetisation', title: 'Welcome to the YouTube Partner Programme', body: 'Your channel has been approved for monetisation. Ads are now enabled on your eligible videos.', at: SESSION_START - (302 - 101) * DAY_MS, link: '/earn', read: true },
];

export const SEED_POSTS: CommunityPost[] = [
  {
    id: 'post1', kind: 'poll', text: 'Which empire should we cover after Byzantium? 🏛️', at: SESSION_START - 3 * DAY_MS, likes: 2140, comments: 486, visibility: 'public',
    options: [ { label: 'The Ottoman Empire', votes: 6120 }, { label: 'The Khmer Empire', votes: 2210 }, { label: 'The Mali Empire', votes: 3080 }, { label: 'The Carolingian Empire', votes: 1590 } ],
  },
  { id: 'post2', kind: 'image', text: '80,000 of you! 🎉 When we uploaded our first video in January, we had no idea this channel would grow like this. Thank you for watching, commenting and sharing. Next stop: 100K.', at: SESSION_START - 9 * DAY_MS, likes: 4810, comments: 612, visibility: 'public', imageScene: { scene: 'temple', palette: 'gold', text: '80,000|Thank You', align: 'center', font: 'cinzel', textColor: 'gold' } },
  { id: 'post3', kind: 'text', text: 'Big one coming next week: the full story of the Byzantine Empire, Rome\'s final thousand years. It\'s our longest documentary yet. 👀', at: SESSION_START - 4 * DAY_MS, likes: 3360, comments: 401, visibility: 'public' },
  { id: 'post4', kind: 'quiz', text: 'History quiz: which of these cities was NOT a capital of the Persian Empire?', at: SESSION_START - 17 * DAY_MS, likes: 1290, comments: 233, visibility: 'public', options: [ { label: 'Persepolis', votes: 1210 }, { label: 'Susa', votes: 980 }, { label: 'Carthage', votes: 5840 }, { label: 'Pasargadae', votes: 760 } ] },
];

export interface IdeaCard {
  id: string;
  type: 'Trending' | 'Your audience' | 'Content gap' | 'Remix';
  title: string;
  why: string;
  stat: string;
  scene: VideoSeed['thumb'];
}

export const INSPIRATION: IdeaCard[] = [
  { id: 'i1', type: 'Your audience', title: 'The Byzantine Empire: Rome\'s Final Thousand Years', why: 'Viewers of “How Rome Actually Fell” are searching for this', stat: 'High search volume · Content gap', scene: { scene: 'temple', palette: 'purple', text: 'Byzantium', font: 'cinzel', textColor: 'gold' } },
  { id: 'i2', type: 'Trending', title: 'The Bronze Age Collapse: What Really Destroyed the Ancient World?', why: 'Search interest is up 118% in the last 28 days', stat: '↑ 118% search interest', scene: { scene: 'burningCity', palette: 'ember', text: '1177 BC' } },
  { id: 'i3', type: 'Content gap', title: 'The Vikings Who Guarded the Emperor of Constantinople', why: 'Few high-quality videos exist on the Varangian Guard', stat: 'Low competition · Rising', scene: { scene: 'longship', palette: 'night', text: 'Varangians' } },
  { id: 'i4', type: 'Remix', title: 'What Life Was Really Like in a Roman City', why: 'Your “Day in the life” videos keep viewers 18% longer than average', stat: 'Avg. view duration 10:12 for this format', scene: { scene: 'colosseum', palette: 'desert', text: 'A Day In|Rome' } },
  { id: 'i5', type: 'Trending', title: 'The Plague of Justinian: The First Pandemic', why: 'Related to your top-performing Black Death documentary', stat: '↑ 93% search interest', scene: { scene: 'plague', palette: 'storm', text: '541 AD' } },
  { id: 'i6', type: 'Your audience', title: 'Mansa Musa: The Richest Man Who Ever Lived', why: 'Your audience also watches videos about African empires', stat: 'Medium search volume', scene: { scene: 'crown', palette: 'gold', text: 'Richest|Ever' } },
];

export const STUDIO_NEWS = [
  { id: 'news1', title: 'Get feedback on titles and thumbnails with A/B testing', body: 'Test up to three thumbnails on a video and YouTube will pick the one with the most watch time.', tag: 'What\'s new in Studio' },
  { id: 'news2', title: 'Creator Insider: How the algorithm treats long videos', body: 'Watch time matters, but satisfaction matters more. Here\'s what that means for documentary creators.', tag: 'Creator Insider' },
  { id: 'news3', title: 'Updated: AI disclosure for altered or synthetic content', body: 'Make sure to tell viewers when realistic content was made with altered or synthetic media.', tag: 'Policy update' },
];

/** All seed videos (published + unpublished) as Video objects. */
export const SEED_VIDEOS = buildSeedVideos();
SEED_PLAYLISTS.forEach((pl) => {
  pl.videoIds = SEED_VIDEOS.filter((v) => v.playlistIds.includes(pl.id) && v.visibility === 'public').map((v) => v.id);
});
