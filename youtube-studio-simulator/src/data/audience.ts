/** Audience, traffic and research data for the simulated channel (fictional). */

export const AGE_GROUPS = [
  { label: '13–17 years', value: 3.1 },
  { label: '18–24 years', value: 14.8 },
  { label: '25–34 years', value: 27.6 },
  { label: '35–44 years', value: 22.4 },
  { label: '45–54 years', value: 16.2 },
  { label: '55–64 years', value: 9.8 },
  { label: '65+ years', value: 6.1 },
];

export const GENDER = [
  { label: 'Male', value: 81.4 },
  { label: 'Female', value: 18.4 },
  { label: 'User-specified', value: 0.2 },
];

export const GEOGRAPHY = [
  { country: 'United States', code: 'US', share: 34.8 },
  { country: 'United Kingdom', code: 'GB', share: 14.2 },
  { country: 'Canada', code: 'CA', share: 6.9 },
  { country: 'Australia', code: 'AU', share: 5.1 },
  { country: 'India', code: 'IN', share: 4.8 },
  { country: 'Germany', code: 'DE', share: 3.6 },
  { country: 'Philippines', code: 'PH', share: 2.9 },
  { country: 'Netherlands', code: 'NL', share: 2.1 },
  { country: 'Ireland', code: 'IE', share: 1.8 },
  { country: 'New Zealand', code: 'NZ', share: 1.6 },
  { country: 'South Africa', code: 'ZA', share: 1.4 },
  { country: 'Sweden', code: 'SE', share: 1.2 },
];

export const SUBTITLE_LANGUAGES = [
  { label: 'English', value: 9.6 },
  { label: 'English (auto-generated)', value: 5.1 },
  { label: 'Spanish', value: 1.2 },
  { label: 'German', value: 0.6 },
  { label: 'Portuguese (Brazil)', value: 0.4 },
];

export const DEVICE_TYPES = [
  { label: 'TV', value: 38.6 },
  { label: 'Mobile phone', value: 36.9 },
  { label: 'Computer', value: 19.7 },
  { label: 'Tablet', value: 4.6 },
  { label: 'Game console', value: 0.2 },
];

/** Share of views by traffic source, for long-form videos. */
export const TRAFFIC_SOURCES_VIDEO = [
  { label: 'Browse features', value: 44.6 },
  { label: 'Suggested videos', value: 31.9 },
  { label: 'YouTube search', value: 11.8 },
  { label: 'Channel pages', value: 3.4 },
  { label: 'External', value: 2.7 },
  { label: 'Playlists', value: 2.1 },
  { label: 'Notifications', value: 1.4 },
  { label: 'Direct or unknown', value: 1.2 },
  { label: 'Other YouTube features', value: 0.9 },
];

export const TRAFFIC_SOURCES_SHORTS = [
  { label: 'Shorts feed', value: 91.8 },
  { label: 'Channel pages', value: 3.1 },
  { label: 'YouTube search', value: 2.4 },
  { label: 'Browse features', value: 1.5 },
  { label: 'Other YouTube features', value: 1.2 },
];

export const BROWSE_FEATURES = [
  { label: 'Home', value: 89.1 },
  { label: 'Subscriptions feed', value: 6.8 },
  { label: 'Watch later', value: 2.6 },
  { label: 'Library / You', value: 1.1 },
  { label: 'Other', value: 0.4 },
];

export const SEARCH_TERMS = [
  { term: 'mongol empire', share: 9.4 },
  { term: 'black death documentary', share: 7.1 },
  { term: 'ancient rome documentary', share: 6.6 },
  { term: 'the past explained', share: 5.9 },
  { term: 'history documentary', share: 5.2 },
  { term: 'atlantis', share: 4.4 },
  { term: 'battle of cannae', share: 3.8 },
  { term: 'fall of rome', share: 3.5 },
  { term: 'ancient egypt secrets', share: 3.1 },
  { term: 'caligula', share: 2.7 },
  { term: 'medieval punishments', share: 2.4 },
  { term: 'spartans 300 real story', share: 2.2 },
  { term: 'persian empire', share: 2.0 },
  { term: 'knights templar', share: 1.7 },
  { term: 'history documentary for sleep', share: 1.5 },
];

/** Fictional channels whose videos appear next to ours. */
export const SUGGESTED_SOURCES = [
  { title: 'The Entire History of the Roman Republic', channel: 'Ancient Echoes', share: 6.8 },
  { title: 'Genghis Khan: The Full Story', channel: 'Empire Files', share: 5.9 },
  { title: 'Why the Byzantine Empire Lasted 1,000 Years', channel: 'The Iron Chronicle', share: 4.6 },
  { title: 'Life as a Medieval Peasant', channel: 'Medieval Minds', share: 4.1 },
  { title: 'The Real Gladiators', channel: 'Sands of Time TV', share: 3.4 },
  { title: 'Mysteries of the Bronze Age', channel: 'Lost Kingdoms Documentary', share: 3.0 },
  { title: 'Ancient Egypt in 4K', channel: 'Pharaoh\'s Lens', share: 2.6 },
];

export const OTHER_CHANNELS = [
  { name: 'Ancient Echoes', subscribers: 1_240_000, color: '#8d6e63' },
  { name: 'Empire Files', subscribers: 892_000, color: '#5c6bc0' },
  { name: 'The Iron Chronicle', subscribers: 615_000, color: '#546e7a' },
  { name: 'Medieval Minds', subscribers: 433_000, color: '#7cb342' },
  { name: 'Sands of Time TV', subscribers: 298_000, color: '#ef6c00' },
  { name: 'Lost Kingdoms Documentary', subscribers: 187_000, color: '#26a69a' },
  { name: 'Pharaoh\'s Lens', subscribers: 151_000, color: '#c0a033' },
  { name: 'Battle Maps Daily', subscribers: 96_400, color: '#d84315' },
];

export const FORMATS_WATCHED = [
  { label: 'Long videos', value: 77.3 },
  { label: 'Shorts', value: 21.9 },
  { label: 'Live', value: 0.8 },
];

/** Relative audience activity, 7 days × 24 hours (local time). */
export function viewerActivity(): number[][] {
  const base = [0.32, 0.22, 0.16, 0.12, 0.1, 0.1, 0.14, 0.22, 0.3, 0.38, 0.45, 0.52, 0.58, 0.6, 0.62, 0.64, 0.68, 0.74, 0.82, 0.9, 0.96, 0.94, 0.78, 0.52];
  const dayFactor = [1.12, 0.92, 0.9, 0.92, 0.94, 1.0, 1.1]; // Sun..Sat
  return dayFactor.map((f, d) => base.map((b, h) => Math.min(1, b * f * (d === 0 || d === 6 ? (h > 9 && h < 17 ? 1.25 : 1) : 1))));
}

export interface ResearchTopic {
  term: string;
  volume: 'High' | 'Medium' | 'Low';
  trend: number; // % change in search interest
  contentGap?: boolean;
  category: string;
}

export const RESEARCH_TOPICS: ResearchTopic[] = [
  { term: 'byzantine empire documentary', volume: 'High', trend: 42, contentGap: true, category: 'Empires' },
  { term: 'bronze age collapse explained', volume: 'Medium', trend: 118, category: 'Ancient world' },
  { term: 'sea peoples who were they', volume: 'Medium', trend: 64, contentGap: true, category: 'Mysteries' },
  { term: 'ottoman empire rise', volume: 'High', trend: 23, category: 'Empires' },
  { term: 'hannibal barca full documentary', volume: 'Medium', trend: 12, category: 'Wars' },
  { term: 'roman empire for sleep', volume: 'High', trend: 87, contentGap: true, category: 'Ancient Rome' },
  { term: 'what happened to the minoans', volume: 'Low', trend: 35, contentGap: true, category: 'Mysteries' },
  { term: 'mansa musa richest man', volume: 'Medium', trend: 51, category: 'Africa' },
  { term: 'khmer empire angkor', volume: 'Low', trend: 76, contentGap: true, category: 'Asia' },
  { term: 'carthage destroyed', volume: 'Medium', trend: 19, category: 'Wars' },
  { term: 'vikings in constantinople', volume: 'Low', trend: 140, contentGap: true, category: 'Vikings' },
  { term: 'medieval peasant life', volume: 'High', trend: 8, category: 'Medieval' },
  { term: 'great fire of london 1666', volume: 'Medium', trend: -6, category: 'Britain' },
  { term: 'library of alexandria truth', volume: 'Medium', trend: 14, category: 'Ancient world' },
  { term: 'alexander the great death', volume: 'High', trend: 29, category: 'Ancient Greece' },
  { term: 'tartaria', volume: 'Medium', trend: -22, category: 'Mysteries' },
  { term: 'battle of hastings 1066', volume: 'Medium', trend: 4, category: 'Britain' },
  { term: 'roman soldier diet', volume: 'Low', trend: 58, category: 'Ancient Rome' },
  { term: 'aztec human sacrifice', volume: 'Medium', trend: 11, category: 'Americas' },
  { term: 'the anarchy england civil war', volume: 'Low', trend: 47, contentGap: true, category: 'Britain' },
  { term: 'justinian plague', volume: 'Low', trend: 93, contentGap: true, category: 'Empires' },
  { term: 'roman empire map every year', volume: 'High', trend: 33, category: 'Ancient Rome' },
];

export const VIEWER_SEARCHES = [
  { term: 'byzantine empire', volume: 'High' as const, contentGap: true },
  { term: 'roman empire documentary', volume: 'High' as const },
  { term: 'mongol empire documentary', volume: 'High' as const },
  { term: 'history documentary for sleep', volume: 'Medium' as const, contentGap: true },
  { term: 'ottoman empire', volume: 'Medium' as const, contentGap: true },
  { term: 'ancient egypt documentary', volume: 'Medium' as const },
  { term: 'black death', volume: 'Medium' as const },
  { term: 'sea peoples', volume: 'Low' as const, contentGap: true },
  { term: 'achaemenid empire', volume: 'Low' as const },
  { term: 'knights templar', volume: 'Low' as const },
];
