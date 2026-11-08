import { useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Scissors, Music, Droplets, MonitorPlay, Info, Undo2, Plus, Trash2, BadgeCheck, AlertTriangle, Clapperboard } from 'lucide-react';
import { useStudio } from '../../store/StudioContext';
import { VideoDetails } from './VideoDetails';
import { Tabs, Toggle, SelectField } from '../../components/common/Controls';
import { DateRangePicker } from '../../components/analytics/DateRangePicker';
import { resolveRange } from '../../lib/ranges';
import { OverviewTab, RetentionChart } from '../analytics/OverviewTab';
import { AudienceTab } from '../analytics/AudienceTab';
import { RevenueTab } from '../analytics/RevenueTab';
import { ImpressionsFunnel, TrafficCards } from '../analytics/ContentTab';
import { MetricTabsChart } from '../../components/analytics/MetricTabsChart';
import { ACard } from '../analytics/shared';
import { VIDEO_ANALYTICS, lifetimeVideoStats, LAST } from '../../data/analytics';
import { CommentsList } from '../../components/community/CommentsList';
import { VideoSubtitles } from '../../components/subtitles/VideoSubtitles';
import { VideoCopyright } from '../Copyright';
import { Button, IconButton } from '../../components/common/Button';
import { EmptyArt, EmptyState } from '../../components/common/Card';
import { formatDuration, formatGBP, formatInt } from '../../lib/format';
import { MonetisationIcon } from '../../components/common/StudioIcons';
import { Thumbnail } from '../../components/thumbnails/Thumbnail';
import { variantSpec } from '../../lib/thumbVariants';
import { AUDIO_TRACKS } from '../../data/library';
import type { Video } from '../../data/types';
import { loadState, saveState } from '../../lib/storage';

function Title({ children, actions }: { children: string; actions?: React.ReactNode }) {
  return (
    <div className="flex min-h-[72px] items-center gap-3 px-8 pt-6 max-sm:px-4">
      <h1 className="flex-1 text-[25px] font-medium">{children}</h1>
      {actions}
    </div>
  );
}

function VideoAnalytics({ video }: { video: Video }) {
  const { tab = 'overview' } = useParams();
  const navigate = useNavigate();
  const { analyticsRange, customRange } = useStudio();
  const range = resolveRange(analyticsRange, customRange);
  const scope = useMemo(() => ({ videoId: video.id }), [video.id]);
  const hasData = !!VIDEO_ANALYTICS[video.id];
  const life = lifetimeVideoStats(video.id);
  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'reach', label: 'Reach' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'audience', label: 'Audience' },
    { value: 'revenue', label: 'Revenue' },
  ];
  return (
    <div className="pb-16">
      <Title>Video analytics</Title>
      <div className="flex items-end gap-4 px-8 max-sm:px-4">
        <Tabs className="min-w-0 flex-1 border-b-0" tabs={tabs} value={tab} onChange={(t) => navigate(`/video/${video.id}/analytics/${t}`)} />
        <div className="mb-1 shrink-0">
          <DateRangePicker />
        </div>
      </div>
      <div className="border-b border-black/[0.1]" />
      <div className="mx-auto max-w-[1440px] px-8 pt-6 max-sm:px-4">
        {!hasData ? (
          <EmptyState art={<EmptyArt kind="search" />} title="Analytics for this video will appear soon" body="It can take up to 48 hours for data to be processed after a video is published. Realtime data will appear once your video starts getting views." />
        ) : (
          <>
            {range.end < VIDEO_ANALYTICS[video.id].publishDay && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#fef7e0] p-3 text-[13px] text-[#5f4b00]">
                <AlertTriangle size={16} /> This video was published after the selected period. Try “Lifetime” or a more recent period.
              </div>
            )}
            {tab === 'overview' && <OverviewTab scope={scope} range={range} />}
            {tab === 'reach' && video.kind === 'video' && (
              <div className="flex gap-6 max-xl:flex-col">
                <div className="flex min-w-0 flex-1 flex-col gap-6">
                  <MetricTabsChart metrics={['impressions', 'ctr', 'views', 'uniqueViewers']} scope={scope} range={range} />
                  <ImpressionsFunnel scope={scope} range={range} />
                </div>
                <div className="flex w-[380px] shrink-0 flex-col gap-6 max-xl:w-full">
                  <TrafficCards scope={scope} range={range} />
                </div>
              </div>
            )}
            {tab === 'reach' && video.kind === 'short' && (
              <div className="flex flex-col gap-6">
                <MetricTabsChart metrics={['views', 'uniqueViewers', 'subscribers']} scope={scope} range={range} />
                <ACard title="Shown in feed" subtitle="How many times your Short was shown in the Shorts feed">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div><div className="text-[#606060]">Chose to view</div><div className="text-2xl font-medium">74.2%</div></div>
                    <div><div className="text-[#606060]">Swiped away</div><div className="text-2xl font-medium">25.8%</div></div>
                  </div>
                </ACard>
                <TrafficCards scope={scope} range={range} />
              </div>
            )}
            {tab === 'engagement' && (
              <div className="flex gap-6 max-xl:flex-col">
                <div className="flex min-w-0 flex-1 flex-col gap-6">
                  <MetricTabsChart metrics={['watchHours', 'avd', 'likes', 'comments']} scope={scope} range={range} />
                  <ACard title="Audience retention" subtitle={`How long viewers watched “${video.title}”`}>
                    <RetentionChart videoId={video.id} durationSec={video.durationSec} height={260} />
                  </ACard>
                </div>
                <div className="flex w-[380px] shrink-0 flex-col gap-6 max-xl:w-full">
                  <ACard title="Likes (vs. dislikes)" subtitle="Lifetime">
                    <div className="text-[28px] font-medium">{life ? ((life.likes / (life.likes + life.dislikes)) * 100).toFixed(1) : 0}%</div>
                    <div className="mt-2 h-1.5 rounded-full bg-black/[0.1]">
                      <div className="h-1.5 rounded-full bg-[#0f0f0f]" style={{ width: `${life ? (life.likes / (life.likes + life.dislikes)) * 100 : 0}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[13px] text-[#606060]">
                      <span>{formatInt(life?.likes ?? 0)} likes</span>
                      <span>{formatInt(life?.dislikes ?? 0)} dislikes</span>
                    </div>
                  </ACard>
                  {video.kind === 'video' && (
                    <ACard title="Top end screen elements" subtitle="Lifetime">
                      {[
                        ['Best for viewer', 'Video', '9.8%'],
                        ['Subscribe', 'Subscribe button', '2.1%'],
                        ['Ancient Rome playlist', 'Playlist', '4.4%'],
                      ].map(([n, t, c]) => (
                        <div key={n} className="flex items-center py-2 text-sm">
                          <div className="flex-1">
                            <div>{n}</div>
                            <div className="text-xs text-[#606060]">{t}</div>
                          </div>
                          <div className="font-medium">{c} CTR</div>
                        </div>
                      ))}
                    </ACard>
                  )}
                </div>
              </div>
            )}
            {tab === 'audience' && <AudienceTab scope={scope} range={range} />}
            {tab === 'revenue' && <RevenueTab scope={scope} range={range} />}
          </>
        )}
      </div>
    </div>
  );
}

function VideoMonetisation({ video }: { video: Video }) {
  const { updateVideo, earn, toast } = useStudio();
  const key = `review:${video.id}`;
  const [review, setReview] = useState<boolean>(() => loadState(key, false));
  const [breaks, setBreaks] = useState<number[]>(() => loadState(`breaks:${video.id}`, video.kind === 'video' ? [Math.round(video.durationSec * 0.3), Math.round(video.durationSec * 0.62)] : []));
  const life = lifetimeVideoStats(video.id);
  const saveBreaks = (b: number[]) => {
    setBreaks(b);
    saveState(`breaks:${video.id}`, b);
  };
  return (
    <div className="pb-16">
      <Title>Video monetisation</Title>
      <div className="flex max-w-[960px] flex-col gap-6 px-8 max-sm:px-4">
        <div className="rounded-xl border border-black/[0.1] p-6">
          <div className="flex items-center gap-4">
            <MonetisationIcon status={video.monetisation} size={32} />
            <div className="flex-1">
              <div className="text-[15px] font-medium">Monetisation</div>
              <div className="text-[13px] text-[#606060]">{video.monetisation === 'claimed' ? 'A copyright claimant is monetising this video' : video.monetisation === 'off' ? 'Ads are turned off for this video' : 'Ads can run on this video'}</div>
            </div>
            <SelectField
              compact
              className="w-[160px]"
              value={video.monetisation === 'off' ? 'off' : 'on'}
              onChange={(v) => {
                updateVideo(video.id, { monetisation: v === 'off' ? 'off' : video.monetisation === 'off' ? 'on' : video.monetisation });
                toast(`Monetisation turned ${v}`);
              }}
              options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
            />
          </div>
          {life && (
            <div className="mt-5 grid grid-cols-3 gap-4 border-t border-black/[0.08] pt-5 text-sm max-md:grid-cols-1">
              <div><div className="text-[#606060]">Lifetime estimated revenue</div><div className="text-xl font-medium">{formatGBP(life.revenue)}</div></div>
              <div><div className="text-[#606060]">RPM</div><div className="text-xl font-medium">{formatGBP(life.views ? (life.revenue / life.views) * 1000 : 0)}</div></div>
              <div><div className="text-[#606060]">Views</div><div className="text-xl font-medium">{formatInt(life.views)}</div></div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-black/[0.1] p-6">
          <div className="text-[15px] font-medium">Ad suitability</div>
          {video.monetisation === 'limited' ? (
            <div className="mt-3 flex gap-3 rounded-lg bg-[#fef7e0] p-4 text-sm text-[#5f4b00]">
              <AlertTriangle size={20} className="shrink-0" />
              <div className="flex-1">
                <div className="font-medium">Limited or no ads</div>
                <p className="mt-1 text-[13px]">Our systems found content that isn't suitable for most advertisers (graphic descriptions of violence). {review ? 'A human review has been requested – you\'ll usually hear back within 7 days.' : 'If you think this is a mistake, request a human review.'}</p>
                {!review && (
                  <Button variant="primary" className="mt-3" onClick={() => (setReview(true), saveState(key, true), toast('Human review requested'))}>
                    Request review
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-sm text-[#2ba640]"><BadgeCheck size={18} /> Suitable for most advertisers</div>
          )}
        </div>

        {video.kind === 'video' && (
          <div className="rounded-xl border border-black/[0.1] p-6">
            <div className="text-[15px] font-medium">Types of ads</div>
            <p className="mt-1 text-[13px] text-[#606060]">Inherited from your channel defaults in Earn › Ads. Changes here apply only to this video.</p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {[
                ['Before video (pre-roll)', earn.adPreRoll],
                ['During video (mid-roll)', earn.adMidRoll],
                ['After video (post-roll)', earn.adPostRoll],
              ].map(([l, v]) => (
                <label key={l as string} className="flex items-center gap-4">
                  <Toggle checked={v as boolean} onChange={() => toast('Change channel-wide defaults in Earn › Ads')} label={l as string} />
                  {l as string}
                </label>
              ))}
            </div>
            <div className="mt-6 text-[15px] font-medium">Mid-roll ad breaks ({breaks.length})</div>
            <div className="relative mt-3 h-10 rounded bg-black/[0.06]">
              {breaks.map((b) => (
                <span key={b} title={formatDuration(b)} className="absolute top-0 h-10 w-1 -translate-x-1/2 bg-[#f9ab00]" style={{ left: `${(b / video.durationSec) * 100}%` }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {breaks.map((b) => (
                <span key={b} className="flex items-center gap-1 rounded-full bg-black/[0.05] py-1 pl-3 pr-1 text-[13px]">
                  {formatDuration(b)}
                  <IconButton label="Remove break" size={24} onClick={() => saveBreaks(breaks.filter((x) => x !== b))}><Trash2 size={14} /></IconButton>
                </span>
              ))}
              <Button variant="tonal" size="sm" icon={<Plus size={16} />} onClick={() => saveBreaks([...breaks, Math.round(video.durationSec * (0.15 + Math.random() * 0.7))].sort((a, b) => a - b))}>
                Add break
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoEditor({ video }: { video: Video }) {
  const { toast } = useStudio();
  const [trim, setTrim] = useState<[number, number]>([0, video.durationSec]);
  const [trimming, setTrimming] = useState(false);
  const [audio, setAudio] = useState('');
  const [blur, setBlur] = useState(false);
  const dirty = trim[0] !== 0 || trim[1] !== video.durationSec || !!audio || blur;
  const tracks = [
    { icon: <Droplets size={18} />, label: 'Blur', on: blur, add: () => setBlur(!blur), desc: blur ? 'Face blur applied to 2 segments' : 'Add face or custom blur' },
    { icon: <Music size={18} />, label: 'Audio', on: !!audio, add: () => setAudio(audio ? '' : AUDIO_TRACKS[0].id), desc: audio ? `“${AUDIO_TRACKS.find((t) => t.id === audio)?.title}” at 20% volume` : 'Add music from the Audio Library' },
    { icon: <MonitorPlay size={18} />, label: 'End screen', on: true, add: () => toast('End screen imported from your latest upload'), desc: '1 video, 1 playlist, subscribe button' },
    { icon: <Info size={18} />, label: 'Info cards', on: true, add: () => toast('Cards can be edited after publishing'), desc: '2 cards' },
  ];
  return (
    <div className="pb-16">
      <Title
        actions={
          <>
            <Button variant="text" disabled={!dirty} icon={<Undo2 size={18} />} onClick={() => (setTrim([0, video.durationSec]), setAudio(''), setBlur(false))}>
              Discard changes
            </Button>
            <Button variant="primary" disabled={!dirty} onClick={() => toast('Saving – your edits will be live once processing completes')}>
              Save
            </Button>
          </>
        }
      >
        Video editor
      </Title>
      <div className="px-8 max-sm:px-4">
        <div className="flex gap-6 max-lg:flex-col">
          <div className="w-[520px] max-w-full shrink-0 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: '16/9' }}>
            {video.customThumb ? <img src={video.customThumb} alt="" className="h-full w-full object-cover" /> : <Thumbnail spec={variantSpec(video.thumb, video.thumbVariant ?? 0)} vertical={video.kind === 'short'} />}
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-medium">{video.title}</div>
            <div className="mt-1 text-[13px] text-[#606060]">Duration {formatDuration(trim[1] - trim[0])}{trim[1] - trim[0] !== video.durationSec && ` (originally ${formatDuration(video.durationSec)})`}</div>
            <Button variant="tonal" className="mt-4" icon={<Scissors size={18} />} onClick={() => setTrimming(!trimming)}>
              {trimming ? 'Done trimming' : 'Trim & cut'}
            </Button>
            {trimming && (
              <div className="mt-4 rounded-lg bg-[#f9f9f9] p-4 text-[13px]">
                <label className="block">Start: {formatDuration(trim[0])}
                  <input type="range" className="studio-range w-full" min={0} max={trim[1] - 5} value={trim[0]} onChange={(e) => setTrim([Number(e.target.value), trim[1]])} />
                </label>
                <label className="mt-2 block">End: {formatDuration(trim[1])}
                  <input type="range" className="studio-range w-full" min={trim[0] + 5} max={video.durationSec} value={trim[1]} onChange={(e) => setTrim([trim[0], Number(e.target.value)])} />
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 overflow-hidden rounded-xl border border-black/[0.1]">
          <div className="flex h-8 items-center border-b border-black/[0.1] bg-[#f9f9f9] pl-[160px] text-[11px] text-[#606060]">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <span key={f} className="flex-1">{formatDuration(video.durationSec * f)}</span>
            ))}
          </div>
          <div className="flex h-16 items-center border-b border-black/[0.06]">
            <span className="flex w-[160px] items-center gap-2 px-4 text-[13px] font-medium"><Clapperboard size={18} /> Video</span>
            <div className="relative h-12 flex-1">
              <div className="absolute inset-y-0 flex overflow-hidden rounded" style={{ left: `${(trim[0] / video.durationSec) * 100}%`, right: `${100 - (trim[1] / video.durationSec) * 100}%` }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-full flex-1 border-r border-black/40">
                    <Thumbnail spec={variantSpec(video.thumb, i % 3)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {tracks.map((t) => (
            <div key={t.label} className="flex h-14 items-center border-b border-black/[0.06] last:border-0">
              <span className="flex w-[160px] items-center gap-2 px-4 text-[13px] font-medium">{t.icon} {t.label}</span>
              <div className="flex flex-1 items-center gap-3 pr-4">
                <div className={`h-8 flex-1 rounded ${t.on ? 'bg-[#e8f0fe]' : 'border border-dashed border-black/[0.15]'} flex items-center px-3 text-xs text-[#606060]`}>{t.desc}</div>
                <Button variant="tonal" size="sm" onClick={t.add}>{t.on && (t.label === 'Blur' || t.label === 'Audio') ? 'Remove' : t.on ? 'Edit' : 'Add'}</Button>
              </div>
            </div>
          ))}
        </div>
        {audio && (
          <div className="mt-4 max-w-[400px]">
            <SelectField label="Audio track" value={audio} onChange={setAudio} options={AUDIO_TRACKS.filter((t) => t.kind === 'music').map((t) => ({ value: t.id, label: `${t.title} – ${t.artist}` }))} />
          </div>
        )}
      </div>
    </div>
  );
}

export function VideoRoutes() {
  const { id } = useParams();
  const { allVideos, videos } = useStudio();
  const video = allVideos.find((v) => v.id === id);
  if (!video || !videos.some((v) => v.id === id)) {
    return (
      <EmptyState
        art={<EmptyArt kind="search" />}
        title="This video isn't available"
        body="It may have been deleted. Restore it from the undo message, or reset the simulator in Settings."
        action={<Button variant="primary" onClick={() => (window.location.hash = '#/content/videos')}>Back to content</Button>}
      />
    );
  }
  void LAST;
  return (
    <Routes>
      <Route path="edit" element={<VideoDetails video={video} />} />
      <Route path="analytics" element={<Navigate to="overview" replace />} />
      <Route path="analytics/:tab" element={<VideoAnalytics video={video} />} />
      <Route path="editor" element={<VideoEditor video={video} />} />
      <Route path="comments" element={<div><Title>Video comments</Title><CommentsList videoId={video.id} /></div>} />
      <Route path="subtitles" element={<div><Title>Video subtitles</Title><VideoSubtitles video={video} /></div>} />
      <Route path="copyright" element={<div><Title>Video copyright</Title><VideoCopyright videoId={video.id} /></div>} />
      <Route path="monetisation" element={<VideoMonetisation video={video} />} />
      <Route path="clips" element={<div><Title>Video clips</Title><EmptyState art={<EmptyArt kind="box" />} title="No clips yet" body="Clips are short segments viewers create and share from your video. When someone clips this documentary, it'll show up here." /></div>} />
      <Route path="*" element={<Navigate to="edit" replace />} />
    </Routes>
  );
}
