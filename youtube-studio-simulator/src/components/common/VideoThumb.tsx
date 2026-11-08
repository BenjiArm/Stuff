import { Thumbnail } from '../thumbnails/Thumbnail';
import { formatDuration } from '../../lib/format';
import type { Video } from '../../data/types';
import { variantSpec } from '../../lib/thumbVariants';

export function VideoThumb({ video, width = 120, showDuration = true, className = '', rounded = 'rounded-lg' }: { video: Pick<Video, 'thumb' | 'durationSec' | 'kind' | 'title' | 'thumbVariant' | 'customThumb'>; width?: number | string; showDuration?: boolean; className?: string; rounded?: string }) {
  const spec = variantSpec(video.thumb, video.thumbVariant ?? 0);
  return (
    <div className={`relative shrink-0 self-start overflow-hidden bg-[#1f1f1f] ${rounded} ${className}`} style={{ width, aspectRatio: '16 / 9' }}>
      {video.customThumb ? (
        <img src={video.customThumb} alt={video.title} className="h-full w-full object-cover" />
      ) : video.kind === 'short' ? (
        <div className="flex h-full w-full justify-center bg-[#0f0f0f]">
          <div className="h-full" style={{ aspectRatio: '9 / 16' }}>
            <Thumbnail spec={spec} vertical title={video.title} />
          </div>
        </div>
      ) : (
        <Thumbnail spec={spec} title={video.title} />
      )}
      {showDuration && (
        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-px text-[11px] font-medium leading-4 text-white">
          {formatDuration(video.durationSec)}
        </span>
      )}
    </div>
  );
}

export function ShortThumb({ video, width = 120, className = '' }: { video: Pick<Video, 'thumb' | 'title' | 'thumbVariant'>; width?: number; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg bg-black ${className}`} style={{ width, aspectRatio: '9 / 16' }}>
      <Thumbnail spec={variantSpec(video.thumb, video.thumbVariant ?? 0)} vertical title={video.title} />
    </div>
  );
}
