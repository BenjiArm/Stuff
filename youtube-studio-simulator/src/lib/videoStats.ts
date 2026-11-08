import { lifetimeVideoStats } from '../data/analytics';
import type { Video } from '../data/types';

export function videoLifetime(v: Video) {
  const s = lifetimeVideoStats(v.id);
  if (s) return s;
  const f = v.fixedStats ?? { views: 0, likes: 0, comments: 0 };
  return { views: f.views, likes: f.likes, dislikes: 0, comments: f.comments, revenue: 0, subs: 0, watchHours: 0, impressions: 0, ctr: 0, avd: 0 };
}

export const visibilityLabel: Record<Video['visibility'], string> = {
  public: 'Public',
  unlisted: 'Unlisted',
  private: 'Private',
  scheduled: 'Scheduled',
  draft: 'Draft',
};

export const monetisationLabel: Record<Video['monetisation'], string> = {
  on: 'On',
  limited: 'Limited ads',
  off: 'Off',
  claimed: 'Claim',
};
