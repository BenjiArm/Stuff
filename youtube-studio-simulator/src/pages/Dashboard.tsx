import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Upload, Radio, SquarePen, ThumbsUp, MessageSquare, Eye, Bookmark, BookmarkCheck, CircleDollarSign, TrendingUp, BadgeCheck, Copyright, Lightbulb, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button, IconButton } from '../components/common/Button';
import { VideoThumb } from '../components/common/VideoThumb';
import { LetterAvatar } from '../components/common/Avatar';
import { Thumbnail } from '../components/thumbnails/Thumbnail';
import { RealtimeCard } from '../components/analytics/RealtimeCard';
import { Modal } from '../components/common/Modal';
import { useStudio } from '../store/StudioContext';
import { CURRENT_SUBSCRIBERS, LAST, firstDaysViews, lifetimeVideoStats, metricTotal, videoRangeStats } from '../data/analytics';
import { RECENT_SUBSCRIBERS, INSPIRATION, STUDIO_NEWS } from '../data/channel';
import { elapsedLabel, formatCompact, formatDuration, formatGBP, formatInt, formatSubs, pctChange, timeAgo } from '../lib/format';
import { video48h } from '../lib/realtime';
import { DeltaIcon } from '../components/common/Delta';
import { Tooltip } from '../components/common/Tooltip';

function useColumns() {
  const get = () => (window.innerWidth >= 1340 ? 3 : window.innerWidth >= 900 ? 2 : 1);
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const on = () => setCols(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return cols;
}

function Arrow({ up }: { up: boolean }) {
  return up ? <ArrowUp size={16} className="text-[#2ba640]" strokeWidth={2.5} /> : <ArrowDown size={16} className="text-[#cc0000]" strokeWidth={2.5} />;
}

function LatestVideoCard() {
  const { videos, comments } = useStudio();
  const navigate = useNavigate();
  const longForm = videos.filter((v) => v.kind === 'video' && v.visibility === 'public' && !v.uploaded).sort((a, b) => b.publishedAt - a.publishedAt);
  const latest = longForm[0];
  const data = useMemo(() => {
    if (!latest) return null;
    const previous = longForm.slice(1, 10);
    const days = 2;
    const mine = firstDaysViews(latest.id, days) + Math.round(video48h(latest.id) * 0.18);
    const others = previous.map((v) => firstDaysViews(v.id, days));
    const rank = [mine, ...others].sort((a, b) => b - a).indexOf(mine) + 1;
    const typical = [...others].sort((a, b) => a - b)[Math.floor(others.length / 2)] ?? 1;
    const life = lifetimeVideoStats(latest.id)!;
    const typicalCtr = previous.reduce((a, v) => a + (lifetimeVideoStats(v.id)?.ctr ?? 0), 0) / Math.max(1, previous.length);
    const typicalAvd = previous.reduce((a, v) => a + (lifetimeVideoStats(v.id)?.avd ?? 0), 0) / Math.max(1, previous.length);
    return { mine, rank, total: previous.length + 1, typical, ctr: life.ctr, typicalCtr, avd: life.avd, typicalAvd, impressions: mine * (life.impressions / Math.max(1, life.views)) };
  }, [latest, longForm]);
  if (!latest || !data) return null;
  const commentCount = comments.filter((c) => c.videoId === latest.id && c.status === 'published').length;
  const rows: [string, ReactNode, boolean | null][] = [
    ['Ranking by views', `${data.rank} of ${data.total}`, data.rank <= 3],
    ['Views', formatInt(data.mine), data.mine >= data.typical],
    ['Impressions', formatCompact(data.impressions), true],
    ['Impressions click-through rate', `${data.ctr.toFixed(1)}%`, data.ctr >= data.typicalCtr],
    ['Average view duration', formatDuration(data.avd), data.avd >= data.typicalAvd],
  ];
  return (
    <Card>
      <h3 className="text-[18px] font-medium">Latest video performance</h3>
      <button className="mt-4 block w-full overflow-hidden rounded-lg" onClick={() => navigate(`/video/${latest.id}/analytics`)}>
        <VideoThumb video={latest} width="100%" />
      </button>
      <button onClick={() => navigate(`/video/${latest.id}/edit`)} className="mt-3 line-clamp-2 text-left text-[15px] leading-[22px] text-[#0f0f0f] hover:underline">
        {latest.title}
      </button>
      <p className="mt-3 text-[13px] text-[#606060]">First {elapsedLabel(Date.now() - latest.publishedAt)} compared to your typical performance:</p>
      <div className="mt-3">
        {rows.map(([label, value, up]) => (
          <div key={label} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-[#606060]">{label}</span>
            <span className="flex items-center gap-1.5 font-medium text-[#0f0f0f]">
              {value}
              {up !== null && <Arrow up={up} />}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="tonal" onClick={() => navigate(`/video/${latest.id}/analytics`)}>Go to video analytics</Button>
        <Button variant="tonal" onClick={() => navigate(`/video/${latest.id}/comments`)}>See comments ({commentCount})</Button>
      </div>
    </Card>
  );
}

function ChannelAnalyticsCard() {
  const navigate = useNavigate();
  const { videos } = useStudio();
  const start = LAST - 27;
  const prevStart = start - 28;
  const rows = (['views', 'watchHours', 'revenue'] as const).map((m) => {
    const cur = metricTotal(m, {}, start, LAST);
    const prev = metricTotal(m, {}, prevStart, start - 1);
    return { m, cur, pct: pctChange(cur, prev) };
  });
  const subs28 = metricTotal('subscribers', {}, start, LAST);
  const subsPrev = metricTotal('subscribers', {}, prevStart, start - 1);
  const top = videos
    .filter((v) => v.visibility === 'public' && !v.uploaded)
    .map((v) => ({ v, views: video48h(v.id) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);
  const labels = { views: 'Views', watchHours: 'Watch time (hours)', revenue: 'Estimated revenue' };
  return (
    <Card>
      <h3 className="text-[18px] font-medium">Channel analytics</h3>
      <div className="mt-4">
        <div className="text-[13px] text-[#606060]">Current subscribers</div>
        <div className="mt-1 text-[34px] font-medium leading-10 tracking-tight">{formatInt(CURRENT_SUBSCRIBERS)}</div>
        <div className="mt-1 flex items-center gap-1 text-[13px]">
          <span className="font-medium text-[#2ba640]">+{formatInt(subs28)}</span>
          <span className="text-[#606060]">in last 28 days</span>
          <DeltaIcon pct={pctChange(subs28, subsPrev)} compareLabel="previous 28 days" size={16} />
        </div>
      </div>
      <div className="my-4 h-px bg-black/[0.1]" />
      <div className="text-[15px] font-medium">Summary</div>
      <div className="text-[13px] text-[#606060]">Last 28 days</div>
      <div className="mt-2">
        {rows.map((r) => (
          <div key={r.m} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-[#606060]">{labels[r.m]}</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Tooltip content={r.m === 'revenue' ? formatGBP(r.cur) : formatInt(r.cur)}>
                <span>{r.m === 'revenue' ? formatGBP(r.cur) : formatCompact(r.cur)}</span>
              </Tooltip>
              {r.pct !== null && <Arrow up={r.pct >= 0} />}
            </span>
          </div>
        ))}
      </div>
      <div className="my-4 h-px bg-black/[0.1]" />
      <div className="text-[15px] font-medium">Top videos</div>
      <div className="mb-1 flex justify-between text-[13px] text-[#606060]">
        <span>Last 48 hours</span>
        <span>Views</span>
      </div>
      {top.map(({ v, views }) => (
        <button key={v.id} onClick={() => navigate(`/video/${v.id}/analytics`)} className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-black/[0.05]">
          <span className="line-clamp-1 min-w-0 flex-1 text-sm">{v.title}</span>
          <span className="tabular text-sm">{formatInt(views)}</span>
        </button>
      ))}
      <Button variant="tonal" className="mt-4" onClick={() => navigate('/analytics/overview')}>
        Go to channel analytics
      </Button>
    </Card>
  );
}

function PublishedVideosCard() {
  const { videos } = useStudio();
  const navigate = useNavigate();
  const list = videos.filter((v) => v.visibility === 'public').sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 4);
  return (
    <Card>
      <h3 className="text-[18px] font-medium">Published videos</h3>
      <div className="mt-3">
        {list.map((v) => {
          const st = lifetimeVideoStats(v.id) ?? { views: v.fixedStats?.views ?? 0, comments: 0, likes: 0 };
          return (
            <button key={v.id} onClick={() => navigate(`/video/${v.id}/analytics`)} className="group -mx-2 flex w-[calc(100%+16px)] gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.05]">
              <VideoThumb video={v} width={88} showDuration={false} rounded="rounded-md" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[13px] leading-[18px] text-[#0f0f0f]">{v.title}</span>
                <span className="mt-1 flex gap-3 text-xs text-[#606060]">
                  <span className="flex items-center gap-1"><Eye size={13} /> {formatCompact(st.views)}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={13} /> {formatCompact(st.comments)}</span>
                  <span className="flex items-center gap-1"><ThumbsUp size={13} /> {formatCompact(st.likes)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <Button variant="tonal" className="mt-3" onClick={() => navigate('/content/videos')}>
        Go to videos
      </Button>
    </Card>
  );
}

function LatestCommentsCard() {
  const { comments, allVideos } = useStudio();
  const navigate = useNavigate();
  const list = comments.filter((c) => c.status === 'published').sort((a, b) => b.at - a.at).slice(0, 4);
  return (
    <Card>
      <h3 className="text-[18px] font-medium">Latest comments</h3>
      <p className="text-[13px] text-[#606060]">Channel comments that I haven't responded to</p>
      <div className="mt-3">
        {list.map((c) => {
          const v = allVideos.find((x) => x.id === c.videoId);
          return (
            <button key={c.id} onClick={() => navigate('/community/comments')} className="-mx-2 flex w-[calc(100%+16px)] gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-black/[0.05]">
              <LetterAvatar name={c.handle} color={c.avatarColor} size={32} />
              <span className="min-w-0 flex-1">
                <span className="text-xs text-[#606060]">
                  <span className="font-medium text-[#0f0f0f]">{c.handle}</span> · {timeAgo(c.at)}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[13px] leading-[18px] text-[#0f0f0f]">{c.text}</span>
              </span>
              {v && <VideoThumb video={v} width={64} showDuration={false} rounded="rounded" />}
            </button>
          );
        })}
      </div>
      <Button variant="tonal" className="mt-3" onClick={() => navigate('/community/comments')}>
        View more
      </Button>
    </Card>
  );
}

function RecentSubscribersCard() {
  const [open, setOpen] = useState(false);
  const list = RECENT_SUBSCRIBERS;
  const Row = ({ s }: { s: (typeof list)[number] }) => (
    <div className="flex items-center gap-3 py-2">
      <LetterAvatar name={s.name} color={s.avatarColor} size={40} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-[#0f0f0f]">{s.name}</div>
        <div className="text-xs text-[#606060]">{s.subscriberCount ? `${formatSubs(s.subscriberCount)} subscriber${s.subscriberCount === 1 ? '' : 's'}` : 'No subscribers'}</div>
      </div>
      <span className="text-xs text-[#909090]">{timeAgo(s.subscribedAt)}</span>
    </div>
  );
  return (
    <Card>
      <h3 className="text-[18px] font-medium">Recent subscribers</h3>
      <p className="text-[13px] text-[#606060]">Last 90 days · Public subscribers only</p>
      <div className="mt-2">
        {list.slice(0, 5).map((s) => (
          <Row key={s.id} s={s} />
        ))}
      </div>
      <Button variant="tonal" className="mt-3" onClick={() => setOpen(true)}>
        See all
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Recent subscribers" width={520}>
        <p className="mb-2 text-[13px] text-[#606060]">Only subscribers who have made their subscriptions public are shown. Last 90 days.</p>
        {list.map((s) => (
          <Row key={s.id} s={s} />
        ))}
      </Modal>
    </Card>
  );
}

function ActivityCard() {
  const { notifications, markNotification } = useStudio();
  const navigate = useNavigate();
  const icon = (k: string) =>
    k === 'payment' || k === 'monetisation' ? <CircleDollarSign size={18} /> : k === 'copyright' ? <Copyright size={18} /> : k === 'subscriber' ? <BadgeCheck size={18} /> : k === 'tip' ? <Lightbulb size={18} /> : <TrendingUp size={18} />;
  return (
    <Card>
      <h3 className="text-[18px] font-medium">Recent activity</h3>
      <p className="text-[13px] text-[#606060]">Milestones, monetisation and channel updates</p>
      <div className="mt-3">
        {notifications.slice(0, 6).map((n) => (
          <button
            key={n.id}
            onClick={() => {
              markNotification(n.id, true);
              if (n.link) navigate(n.link);
            }}
            className="-mx-2 flex w-[calc(100%+16px)] gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.05]"
          >
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${n.kind === 'copyright' ? 'bg-[#fdecea] text-[#cc0000]' : n.kind === 'payment' || n.kind === 'monetisation' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#e8f0fe] text-[#1967d2]'}`}>
              {icon(n.kind)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[13px] font-medium text-[#0f0f0f]">
                {n.title}
                {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#065fd4]" />}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-xs leading-[17px] text-[#606060]">{n.body}</span>
              <span className="mt-0.5 block text-[11px] text-[#909090]">{timeAgo(n.at)}</span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function IdeasCard() {
  const [i, setI] = useState(0);
  const { savedTopics, toggleSavedTopic, toast } = useStudio();
  const navigate = useNavigate();
  const idea = INSPIRATION[i];
  const saved = savedTopics.includes(idea.title);
  return (
    <Card>
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="flex items-center gap-2 text-[18px] font-medium">
            <Sparkles size={18} className="text-[#065fd4]" /> Ideas for you
          </h3>
          <p className="text-[13px] text-[#606060]">Inspiration based on your audience</p>
        </div>
        <IconButton label="Previous idea" size={32} onClick={() => setI((i - 1 + INSPIRATION.length) % INSPIRATION.length)}>
          <ChevronLeft size={20} />
        </IconButton>
        <span className="w-10 text-center text-xs text-[#606060]">
          {i + 1}/{INSPIRATION.length}
        </span>
        <IconButton label="Next idea" size={32} onClick={() => setI((i + 1) % INSPIRATION.length)}>
          <ChevronRight size={20} />
        </IconButton>
      </div>
      <div key={idea.id} className="mt-4 animate-fade-in">
        <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '16/9' }}>
          <Thumbnail spec={idea.scene} />
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white">{idea.type}</span>
        </div>
        <div className="mt-3 text-[15px] font-medium leading-[22px]">{idea.title}</div>
        <div className="mt-1 text-[13px] leading-[18px] text-[#606060]">{idea.why}</div>
        <div className="mt-2 inline-flex rounded bg-[#e6f4ea] px-2 py-0.5 text-xs font-medium text-[#137333]">{idea.stat}</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="tonal"
          icon={saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          onClick={() => {
            toggleSavedTopic(idea.title);
            toast(saved ? 'Removed from saved ideas' : 'Idea saved to Analytics › Trends', saved ? undefined : 'View', () => navigate('/analytics/trends'));
          }}
        >
          {saved ? 'Saved' : 'Save idea'}
        </Button>
        <Button variant="tonal" onClick={() => navigate('/analytics/trends')}>
          Explore trends
        </Button>
      </div>
    </Card>
  );
}

function NewsCard() {
  const [i, setI] = useState(0);
  const n = STUDIO_NEWS[i];
  const { toast } = useStudio();
  return (
    <Card>
      <div className="flex items-center">
        <h3 className="flex-1 text-[18px] font-medium">News</h3>
        <IconButton label="Previous" size={32} onClick={() => setI((i - 1 + STUDIO_NEWS.length) % STUDIO_NEWS.length)}>
          <ChevronLeft size={20} />
        </IconButton>
        <IconButton label="Next" size={32} onClick={() => setI((i + 1) % STUDIO_NEWS.length)}>
          <ChevronRight size={20} />
        </IconButton>
      </div>
      <div key={n.id} className="mt-3 animate-fade-in">
        <div className="text-xs font-medium uppercase tracking-wide text-[#065fd4]">{n.tag}</div>
        <div className="mt-1 text-[15px] font-medium leading-[22px]">{n.title}</div>
        <p className="mt-1 text-[13px] leading-5 text-[#606060]">{n.body}</p>
      </div>
      <Button variant="tonal" className="mt-4" onClick={() => toast('External articles are not available in the simulator')}>
        Learn more
      </Button>
    </Card>
  );
}

function RevenueSnapshotCard() {
  const navigate = useNavigate();
  const rev = metricTotal('revenue', {}, LAST - 27, LAST);
  const prev = metricTotal('revenue', {}, LAST - 55, LAST - 28);
  const rpm = metricTotal('rpm', {}, LAST - 27, LAST);
  const best = useStudio()
    .videos.filter((v) => v.visibility === 'public' && !v.uploaded)
    .map((v) => ({ v, r: videoRangeStats(v.id, LAST - 27, LAST).revenue }))
    .sort((a, b) => b.r - a.r)[0];
  return (
    <Card>
      <h3 className="text-[18px] font-medium">Monetisation</h3>
      <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#137333]">
        <BadgeCheck size={16} /> You're in the YouTube Partner Programme
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[13px] text-[#606060]">Estimated revenue</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[22px] font-medium">
            {formatGBP(rev)} <DeltaIcon pct={pctChange(rev, prev)} compareLabel="previous 28 days" size={16} />
          </div>
        </div>
        <div>
          <div className="text-[13px] text-[#606060]">RPM</div>
          <div className="mt-0.5 text-[22px] font-medium">{formatGBP(rpm)}</div>
        </div>
      </div>
      <div className="mt-1 text-xs text-[#606060]">Last 28 days</div>
      {best && (
        <div className="mt-4 rounded-lg bg-[#f9f9f9] p-3 text-[13px]">
          <div className="text-[#606060]">Top earner this month</div>
          <div className="mt-0.5 line-clamp-1 font-medium">{best.v.title}</div>
          <div className="text-[#606060]">{formatGBP(best.r)}</div>
        </div>
      )}
      <Button variant="tonal" className="mt-4" onClick={() => navigate('/analytics/revenue')}>
        Go to revenue analytics
      </Button>
    </Card>
  );
}

export function DashboardPage() {
  const cols = useColumns();
  const { setUploadOpen } = useStudio();
  const navigate = useNavigate();
  const cards = {
    latest: <LatestVideoCard key="latest" />,
    analytics: <ChannelAnalyticsCard key="analytics" />,
    realtime: (
      <Card key="realtime">
        <RealtimeCard compact />
      </Card>
    ),
    published: <PublishedVideosCard key="published" />,
    comments: <LatestCommentsCard key="comments" />,
    subscribers: <RecentSubscribersCard key="subscribers" />,
    activity: <ActivityCard key="activity" />,
    ideas: <IdeasCard key="ideas" />,
    news: <NewsCard key="news" />,
    revenue: <RevenueSnapshotCard key="revenue" />,
  };
  const layout: (keyof typeof cards)[][] =
    cols === 3
      ? [
          ['latest', 'published', 'ideas'],
          ['analytics', 'comments', 'subscribers'],
          ['realtime', 'revenue', 'activity', 'news'],
        ]
      : cols === 2
        ? [
            ['latest', 'realtime', 'published', 'ideas', 'news'],
            ['analytics', 'revenue', 'comments', 'subscribers', 'activity'],
          ]
        : [['latest', 'analytics', 'realtime', 'revenue', 'comments', 'published', 'subscribers', 'activity', 'ideas', 'news']];

  return (
    <div className="pb-12">
      <PageHeader
        title="Channel dashboard"
        actions={
          <>
            <IconButton label="Upload videos" onClick={() => setUploadOpen(true)}>
              <Upload size={22} strokeWidth={1.6} />
            </IconButton>
            <IconButton label="Go live" onClick={() => navigate('/content/live')}>
              <Radio size={22} strokeWidth={1.6} />
            </IconButton>
            <IconButton label="Create post" onClick={() => navigate('/content/posts?compose=1')}>
              <SquarePen size={22} strokeWidth={1.6} />
            </IconButton>
          </>
        }
      />
      <div className="mx-auto mt-4 flex max-w-[1180px] gap-6 px-8 max-sm:px-4">
        {layout.map((col, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col gap-6">
            {col.map((k) => cards[k])}
          </div>
        ))}
      </div>
    </div>
  );
}
