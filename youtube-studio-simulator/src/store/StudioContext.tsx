import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clearAllState, loadState, saveState } from '../lib/storage';
import { SEED_VIDEOS, DEFAULT_PROFILE, SEED_NOTIFICATIONS, SEED_PLAYLISTS, SEED_POSTS, type ChannelProfile } from '../data/channel';
import { buildSeedComments } from '../data/comments';
import { SEED_CLAIMS, SEED_MATCHES, seedSubtitles, type ContentClaim, type CopyrightMatch, type SubtitleTrack } from '../data/library';
import type { CommunityPost, Playlist, StudioComment, StudioNotification, Video } from '../data/types';
import type { RangeKey } from '../lib/ranges';

// ---------------------------------------------------------------------------------------------
// Persisted slice helper
// ---------------------------------------------------------------------------------------------
function usePersisted<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => loadState<T>(key, typeof initial === 'function' ? (initial as () => T)() : initial));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => saveState(key, value), 120);
    return () => window.clearTimeout(t);
  }, [key, value]);
  return [value, setValue] as const;
}

// ---------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------
export interface StudioSettings {
  currency: string;
  defaultVisibility: 'public' | 'unlisted' | 'private';
  defaultTitle: string;
  defaultDescription: string;
  defaultTags: string;
  defaultCategory: string;
  defaultLanguage: string;
  defaultComments: 'on' | 'hold' | 'off';
  defaultLicence: 'standard' | 'cc';
  allowEmbedding: boolean;
  publishToSubscriptions: boolean;
  showSubscriberCount: boolean;
  holdLinks: boolean;
  holdPotentiallyInappropriate: 'none' | 'basic' | 'strict';
  blockedWords: string;
  approvedUsers: string;
  moderators: string;
  emailNotifications: boolean;
  appearance: 'light' | 'device';
  language: string;
  location: string;
  permissions: { name: string; email: string; role: string }[];
}

export const DEFAULT_SETTINGS: StudioSettings = {
  currency: 'GBP – British Pound',
  defaultVisibility: 'private',
  defaultTitle: '',
  defaultDescription: '🔔 Subscribe for a new history documentary every week: @ThePastExplained\n\n#history #documentary',
  defaultTags: 'history, documentary, ancient history',
  defaultCategory: 'Education',
  defaultLanguage: 'English (United Kingdom)',
  defaultComments: 'on',
  defaultLicence: 'standard',
  allowEmbedding: true,
  publishToSubscriptions: true,
  showSubscriberCount: true,
  holdLinks: true,
  holdPotentiallyInappropriate: 'basic',
  blockedWords: 'telegram, whatsapp, giveaway, crypto signals',
  approvedUsers: '',
  moderators: '',
  emailNotifications: true,
  appearance: 'light',
  language: 'English (UK)',
  location: 'United Kingdom',
  permissions: [
    { name: 'Benji (you)', email: 'Owner', role: 'Owner' },
    { name: 'Research assistant', email: 'research@thepastexplained.example', role: 'Editor (limited)' },
    { name: 'Thumbnail designer', email: 'design@thepastexplained.example', role: 'Viewer' },
  ],
};

export interface EarnSettings {
  watchPageAds: boolean;
  shortsAds: boolean;
  memberships: boolean;
  superChat: boolean;
  superStickers: boolean;
  superThanks: boolean;
  shopping: boolean;
  adPreRoll: boolean;
  adMidRoll: boolean;
  adPostRoll: boolean;
  adSkippable: boolean;
  adNonSkippable: boolean;
  midRollAuto: boolean;
}

export const DEFAULT_EARN: EarnSettings = {
  watchPageAds: true,
  shortsAds: true,
  memberships: true,
  superChat: true,
  superStickers: true,
  superThanks: true,
  shopping: false,
  adPreRoll: true,
  adMidRoll: true,
  adPostRoll: true,
  adSkippable: true,
  adNonSkippable: true,
  midRollAuto: true,
};

export interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface StudioState {
  // data
  videos: Video[];
  allVideos: Video[];
  comments: StudioComment[];
  notifications: StudioNotification[];
  playlists: Playlist[];
  posts: CommunityPost[];
  postVotes: Record<string, number>;
  profile: ChannelProfile;
  settings: StudioSettings;
  earn: EarnSettings;
  starredTracks: string[];
  subtitles: (videoId: string) => SubtitleTrack[];
  matches: CopyrightMatch[];
  claims: ContentClaim[];
  savedTopics: string[];
  feedback: { text: string; at: number; area: string }[];
  analyticsRange: RangeKey;
  customRange: { start: number; end: number } | null;
  sidebarCollapsed: boolean;

  // actions
  updateVideo: (id: string, patch: Partial<Video>) => void;
  deleteVideos: (ids: string[]) => void;
  restoreVideos: (ids: string[]) => void;
  addUpload: (video: Video) => void;
  updateComment: (id: string, patch: Partial<StudioComment>) => void;
  replyToComment: (id: string, text: string) => void;
  markNotification: (id: string, read: boolean) => void;
  markAllNotificationsRead: () => void;
  setProfile: (p: ChannelProfile) => void;
  setSettings: (s: StudioSettings) => void;
  setEarn: (patch: Partial<EarnSettings>) => void;
  toggleStar: (trackId: string) => void;
  setSubtitles: (videoId: string, tracks: SubtitleTrack[]) => void;
  updateMatch: (id: string, status: CopyrightMatch['status']) => void;
  updateClaim: (id: string, patch: Partial<ContentClaim>) => void;
  addPost: (post: CommunityPost) => void;
  deletePost: (id: string) => void;
  votePost: (postId: string, option: number) => void;
  upsertPlaylist: (p: Playlist) => void;
  deletePlaylist: (id: string) => void;
  toggleSavedTopic: (term: string) => void;
  addFeedback: (text: string, area: string) => void;
  setAnalyticsRange: (key: RangeKey, custom?: { start: number; end: number } | null) => void;
  setSidebarCollapsed: (v: boolean) => void;
  resetSimulator: () => void;

  // ui
  toasts: Toast[];
  toast: (message: string, actionLabel?: string, onAction?: () => void) => void;
  dismissToast: (id: number) => void;
  settingsOpen: string | null;
  openSettings: (tab?: string) => void;
  closeSettings: () => void;
  feedbackOpen: boolean;
  setFeedbackOpen: (v: boolean) => void;
  uploadOpen: boolean;
  setUploadOpen: (v: boolean) => void;
}

const Ctx = createContext<StudioState | null>(null);

const SEED_COMMENTS = buildSeedComments();

export function StudioProvider({ children }: { children: ReactNode }) {
  const [videoEdits, setVideoEdits] = usePersisted<Record<string, Partial<Video>>>('videoEdits', {});
  const [deletedIds, setDeletedIds] = usePersisted<string[]>('deletedVideos', []);
  const [uploads, setUploads] = usePersisted<Video[]>('uploads', []);
  const [commentEdits, setCommentEdits] = usePersisted<Record<string, Partial<StudioComment>>>('commentEdits', {});
  const [notifRead, setNotifRead] = usePersisted<Record<string, boolean>>('notifRead', {});
  const [profile, setProfileState] = usePersisted<ChannelProfile>('profile', DEFAULT_PROFILE);
  const [settings, setSettingsState] = usePersisted<StudioSettings>('settings', DEFAULT_SETTINGS);
  const [earn, setEarnState] = usePersisted<EarnSettings>('earn', DEFAULT_EARN);
  const [starredTracks, setStarred] = usePersisted<string[]>('starredTracks', ['mus1', 'mus11']);
  const [subtitleEdits, setSubtitleEdits] = usePersisted<Record<string, SubtitleTrack[]>>('subtitles', {});
  const [matchStatus, setMatchStatus] = usePersisted<Record<string, CopyrightMatch['status']>>('matches', {});
  const [claimEdits, setClaimEdits] = usePersisted<Record<string, Partial<ContentClaim>>>('claims', {});
  const [createdPosts, setCreatedPosts] = usePersisted<CommunityPost[]>('posts', []);
  const [deletedPosts, setDeletedPosts] = usePersisted<string[]>('deletedPosts', []);
  const [postVotes, setPostVotes] = usePersisted<Record<string, number>>('postVotes', {});
  const [playlistEdits, setPlaylistEdits] = usePersisted<Record<string, Playlist>>('playlists', {});
  const [deletedPlaylists, setDeletedPlaylists] = usePersisted<string[]>('deletedPlaylists', []);
  const [savedTopics, setSavedTopics] = usePersisted<string[]>('savedTopics', ['byzantine empire documentary']);
  const [feedback, setFeedback] = usePersisted<{ text: string; at: number; area: string }[]>('feedback', []);
  const [rangeState, setRangeState] = usePersisted<{ key: RangeKey; custom: { start: number; end: number } | null }>('analyticsRange', { key: 'last28', custom: null });
  const [sidebarCollapsed, setSidebarCollapsed] = usePersisted<boolean>('sidebarCollapsed', false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const allVideos = useMemo(() => {
    const seeded = SEED_VIDEOS.map((v) => (videoEdits[v.id] ? { ...v, ...videoEdits[v.id] } : v));
    const ups = uploads.map((v) => (videoEdits[v.id] ? { ...v, ...videoEdits[v.id] } : v));
    return [...ups, ...seeded];
  }, [videoEdits, uploads]);

  const videos = useMemo(() => allVideos.filter((v) => !deletedIds.includes(v.id)), [allVideos, deletedIds]);

  const comments = useMemo(
    () =>
      SEED_COMMENTS.map((c) => (commentEdits[c.id] ? { ...c, ...commentEdits[c.id] } : c)).filter(
        (c) => c.status !== 'removed' && !deletedIds.includes(c.videoId),
      ),
    [commentEdits, deletedIds],
  );

  const notifications = useMemo(
    () => SEED_NOTIFICATIONS.map((n) => (n.id in notifRead ? { ...n, read: notifRead[n.id] } : n)),
    [notifRead],
  );

  const playlists = useMemo(() => {
    const base = SEED_PLAYLISTS.map((p) => playlistEdits[p.id] ?? p);
    const created = Object.values(playlistEdits).filter((p) => !SEED_PLAYLISTS.some((s) => s.id === p.id));
    return [...created, ...base].filter((p) => !deletedPlaylists.includes(p.id));
  }, [playlistEdits, deletedPlaylists]);

  const posts = useMemo(() => [...createdPosts, ...SEED_POSTS].filter((p) => !deletedPosts.includes(p.id)), [createdPosts, deletedPosts]);

  const matches = useMemo(() => SEED_MATCHES.map((m) => (matchStatus[m.id] ? { ...m, status: matchStatus[m.id] } : m)), [matchStatus]);
  const claims = useMemo(() => SEED_CLAIMS.map((c) => (claimEdits[c.id] ? { ...c, ...claimEdits[c.id] } : c)), [claimEdits]);

  const toastId = useRef(1);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) => {
      const id = toastId.current++;
      setToasts((t) => [...t.slice(-2), { id, message, actionLabel, onAction }]);
      window.setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast],
  );

  const subtitleIndex = useMemo(() => {
    const map: Record<string, number> = {};
    SEED_VIDEOS.forEach((v, i) => (map[v.id] = i));
    return map;
  }, []);

  const subtitles = useCallback(
    (videoId: string) => {
      if (subtitleEdits[videoId]) return subtitleEdits[videoId];
      const v = allVideos.find((x) => x.id === videoId);
      if (!v) return [];
      if (v.visibility === 'draft') return [];
      return seedSubtitles(videoId, subtitleIndex[videoId] ?? 1, v.publishedAt);
    },
    [subtitleEdits, allVideos, subtitleIndex],
  );

  const value: StudioState = {
    videos,
    allVideos,
    comments,
    notifications,
    playlists,
    posts,
    postVotes,
    profile,
    settings,
    earn,
    starredTracks,
    subtitles,
    matches,
    claims,
    savedTopics,
    feedback,
    analyticsRange: rangeState.key,
    customRange: rangeState.custom,
    sidebarCollapsed,

    updateVideo: (id, patch) => setVideoEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } })),
    deleteVideos: (ids) => setDeletedIds((d) => Array.from(new Set([...d, ...ids]))),
    restoreVideos: (ids) => setDeletedIds((d) => d.filter((x) => !ids.includes(x))),
    addUpload: (video) => setUploads((u) => [video, ...u]),
    updateComment: (id, patch) => setCommentEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } })),
    replyToComment: (id, text) => {
      const current = comments.find((c) => c.id === id) ?? SEED_COMMENTS.find((c) => c.id === id);
      if (!current) return;
      const reply = {
        id: `${id}-u${Date.now()}`,
        author: profile.handle,
        handle: profile.handle,
        avatarColor: '#1b1b1b',
        text,
        at: Date.now(),
        likes: 0,
        isCreator: true,
      };
      setCommentEdits((e) => ({ ...e, [id]: { ...e[id], replies: [...(e[id]?.replies ?? current.replies), reply] } }));
    },
    markNotification: (id, read) => setNotifRead((r) => ({ ...r, [id]: read })),
    markAllNotificationsRead: () => setNotifRead(Object.fromEntries(SEED_NOTIFICATIONS.map((n) => [n.id, true]))),
    setProfile: setProfileState,
    setSettings: setSettingsState,
    setEarn: (patch) => setEarnState((e) => ({ ...e, ...patch })),
    toggleStar: (trackId) => setStarred((s) => (s.includes(trackId) ? s.filter((x) => x !== trackId) : [...s, trackId])),
    setSubtitles: (videoId, tracks) => setSubtitleEdits((s) => ({ ...s, [videoId]: tracks })),
    updateMatch: (id, status) => setMatchStatus((m) => ({ ...m, [id]: status })),
    updateClaim: (id, patch) => setClaimEdits((c) => ({ ...c, [id]: { ...c[id], ...patch } })),
    addPost: (post) => setCreatedPosts((p) => [post, ...p]),
    deletePost: (id) => {
      setCreatedPosts((p) => p.filter((x) => x.id !== id));
      setDeletedPosts((d) => [...d, id]);
    },
    votePost: (postId, option) => setPostVotes((v) => ({ ...v, [postId]: option })),
    upsertPlaylist: (p) => setPlaylistEdits((e) => ({ ...e, [p.id]: p })),
    deletePlaylist: (id) => setDeletedPlaylists((d) => [...d, id]),
    toggleSavedTopic: (term) => setSavedTopics((s) => (s.includes(term) ? s.filter((x) => x !== term) : [term, ...s])),
    addFeedback: (text, area) => setFeedback((f) => [{ text, area, at: Date.now() }, ...f]),
    setAnalyticsRange: (key, custom = null) => setRangeState({ key, custom }),
    setSidebarCollapsed,
    resetSimulator: () => {
      clearAllState();
      window.location.hash = '#/';
      window.location.reload();
    },

    toasts,
    toast,
    dismissToast,
    settingsOpen,
    openSettings: (tab = 'general') => setSettingsOpen(tab),
    closeSettings: () => setSettingsOpen(null),
    feedbackOpen,
    setFeedbackOpen,
    uploadOpen,
    setUploadOpen,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStudio must be used inside <StudioProvider>');
  return ctx;
}
