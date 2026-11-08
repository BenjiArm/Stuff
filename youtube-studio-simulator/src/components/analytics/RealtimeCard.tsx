import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime, video48h } from '../../lib/realtime';
import { formatInt } from '../../lib/format';
import { HourlyBars } from '../charts/MiniCharts';
import { useStudio } from '../../store/StudioContext';
import { VideoThumb } from '../common/VideoThumb';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ChannelAvatar } from '../common/Avatar';

function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2ba640] opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2ba640]" />
    </span>
  );
}

export function RealtimeCard({ compact = false, showButton = true }: { compact?: boolean; showButton?: boolean }) {
  const rt = useRealtime();
  const { videos, profile } = useStudio();
  const navigate = useNavigate();
  const [liveCountOpen, setLiveCountOpen] = useState(false);

  const top = useMemo(
    () =>
      videos
        .filter((v) => v.visibility === 'public' && !v.uploaded)
        .map((v) => ({ v, views: video48h(v.id) }))
        .sort((a, b) => b.views - a.views)
        .slice(0, compact ? 3 : 5),
    [videos, compact],
  );

  return (
    <div>
      <h3 className="text-[18px] font-medium leading-6 text-[#0f0f0f]">Realtime</h3>
      <div className="mt-1 flex items-center gap-2 text-[13px] text-[#606060]">
        <LiveDot /> Updating live
      </div>

      <div className="mt-5 border-t border-black/[0.1] pt-4">
        <div key={rt.subscribers} className="animate-tick text-[26px] font-medium leading-8 tabular text-[#0f0f0f]">
          {formatInt(rt.subscribers)}
        </div>
        <div className="text-[13px] text-[#606060]">Subscribers</div>
        {rt.gainedThisSession > 0 && <div className="mt-1 text-xs text-[#2ba640]">+{rt.gainedThisSession} since you opened Studio</div>}
        <button className="mt-3 h-8 rounded-full bg-black/[0.05] px-3 text-[13px] font-medium hover:bg-black/[0.1]" onClick={() => setLiveCountOpen(true)}>
          See live count
        </button>
      </div>

      <div className="mt-5 border-t border-black/[0.1] pt-4">
        <div className="text-[26px] font-medium leading-8 tabular text-[#0f0f0f]">{formatInt(rt.total48)}</div>
        <div className="text-[13px] text-[#606060]">Views · Last 48 hours</div>
        <div className="mt-3">
          <HourlyBars hours={rt.hours} height={compact ? 56 : 72} />
          <div className="mt-1 flex justify-between text-[11px] text-[#606060]">
            <span>-48h</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-black/[0.1] pt-4">
        <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-[#606060]">
          <span>Top content</span>
          <span>Views</span>
        </div>
        {top.map(({ v, views }) => (
          <button key={v.id} onClick={() => navigate(`/video/${v.id}/analytics`)} className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-black/[0.05]">
            <VideoThumb video={v} width={56} showDuration={false} rounded="rounded" />
            <span className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-[18px] text-[#0f0f0f]">{v.title}</span>
            <span className="tabular text-[13px] text-[#0f0f0f]">{formatInt(views)}</span>
          </button>
        ))}
      </div>
      {showButton && (
        <Button variant="tonal" className="mt-5" onClick={() => navigate('/analytics/overview')}>
          Go to channel analytics
        </Button>
      )}

      <Modal open={liveCountOpen} onClose={() => setLiveCountOpen(false)} title="Live subscriber count" width={520}>
        <div className="flex flex-col items-center py-6">
          <ChannelAvatar size={88} styleIndex={profile.avatarStyle} />
          <div className="mt-4 text-[15px] font-medium">{profile.name}</div>
          <div key={rt.subscribers} className="mt-6 animate-tick text-[64px] font-medium leading-none tabular tracking-tight text-[#0f0f0f]">
            {formatInt(rt.subscribers)}
          </div>
          <div className="mt-2 text-sm text-[#606060]">subscribers</div>
          <div className="mt-6 flex items-center gap-2 text-[13px] text-[#606060]">
            <LiveDot /> Updating live · {formatInt(rt.gainedThisSession)} new this session
          </div>
          <div className="mt-6 w-full rounded-lg bg-[#f9f9f9] p-4 text-[13px] text-[#606060]">
            <div className="mb-1 flex justify-between">
              <span>Next milestone: 100,000 subscribers</span>
              <span className="font-medium text-[#0f0f0f]">{((rt.subscribers / 100000) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/[0.08]">
              <div className="h-2 rounded-full bg-[#cc0000] transition-[width]" style={{ width: `${(rt.subscribers / 100000) * 100}%` }} />
            </div>
            <div className="mt-2">At your current pace (~450 a day), you'll reach 100K in about {Math.ceil((100000 - rt.subscribers) / 452)} days.</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
