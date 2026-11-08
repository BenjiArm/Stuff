import type { ThumbSpec } from '../components/thumbnails/Thumbnail';

export type Visibility = 'public' | 'unlisted' | 'private' | 'scheduled' | 'draft';
export type Monetisation = 'on' | 'limited' | 'off' | 'claimed';
export type Restriction = 'none' | 'copyright' | 'age' | 'kids';
export type VideoKind = 'video' | 'short';

export interface VideoSeed {
  id: string;
  kind: VideoKind;
  title: string;
  hook: string;
  durationSec: number;
  topic: string;
  tags: string[];
  thumb: ThumbSpec;
  /** relative long-tail interest */
  appeal: number;
  /** base impressions click-through rate (%) */
  ctr: number;
  /** fraction of the video watched on average */
  retention: number;
  likeRate: number;
  commentRate: number;
  subRate: number;
  rpmWeight: number;
  monetisation: Monetisation;
  restriction: Restriction;
  /** optional algorithmic surge: [startAgeDays, lengthDays, strength] */
  surge?: [number, number, number];
}

export interface Video {
  id: string;
  kind: VideoKind;
  title: string;
  description: string;
  durationSec: number;
  topic: string;
  tags: string[];
  thumb: ThumbSpec;
  /** custom thumbnail variant chosen in the details editor (0 = original) */
  thumbVariant?: number;
  /** user-uploaded custom thumbnail (downscaled JPEG data URL) */
  customThumb?: string;
  visibility: Visibility;
  monetisation: Monetisation;
  restriction: Restriction;
  /** epoch ms of publish/upload */
  publishedAt: number;
  /** for scheduled videos */
  scheduledFor?: number;
  madeForKids: boolean;
  ageRestricted: boolean;
  alteredContent: boolean;
  category: string;
  language: string;
  commentsMode: 'on' | 'hold' | 'off';
  playlistIds: string[];
  /** user-uploaded through the simulator (no seeded analytics) */
  uploaded?: boolean;
  /** frozen lifetime stats for uploaded videos */
  fixedStats?: { views: number; likes: number; comments: number };
}

export type CommentStatus = 'published' | 'held' | 'spam' | 'removed';

export interface CommentReply {
  id: string;
  author: string;
  handle: string;
  avatarColor: string;
  text: string;
  at: number;
  likes: number;
  isCreator?: boolean;
}

export interface StudioComment {
  id: string;
  videoId: string;
  author: string;
  handle: string;
  avatarColor: string;
  text: string;
  at: number;
  likes: number;
  isSubscriber: boolean;
  subscriberCount?: number;
  status: CommentStatus;
  liked: boolean;
  disliked: boolean;
  hearted: boolean;
  pinned?: boolean;
  replies: CommentReply[];
  isQuestion?: boolean;
}

export interface StudioNotification {
  id: string;
  kind: 'milestone' | 'monetisation' | 'comment' | 'copyright' | 'payment' | 'tip' | 'subscriber';
  title: string;
  body: string;
  at: number;
  link?: string;
  read: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  visibility: 'public' | 'unlisted' | 'private';
  videoIds: string[];
  updatedAt: number;
}

export interface CommunityPost {
  id: string;
  kind: 'text' | 'poll' | 'image' | 'quiz';
  text: string;
  at: number;
  likes: number;
  comments: number;
  options?: { label: string; votes: number }[];
  imageScene?: ThumbSpec;
  visibility: 'public' | 'members';
}

export interface Subscriber {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  subscriberCount: number;
  subscribedAt: number;
}
