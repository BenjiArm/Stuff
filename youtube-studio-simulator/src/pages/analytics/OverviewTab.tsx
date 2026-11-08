import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { growthByWindow, last48Hours, metricTotal, VIDEO_ANALYTICS, dayDate, LAST, type Scope } from '../../data/analytics';
import type { ResolvedRange } from '../../lib/ranges';
import { MetricTabsChart } from '../../components/analytics/MetricTabsChart';
import { RealtimeCard } from '../../components/analytics/RealtimeCard';
import { GrowthComboChart, HourlyBars, HBarList } from '../../components/charts/MiniCharts';
import { ACard, SeeMore, TopContentTable, headline, trafficSources, useVideoRows } from './shared';
import { formatDateRange, formatDuration, formatGBP, formatInt } from '../../lib/format';
import { useStudio } from '../../store/StudioContext';
import { VideoThumb } from '../../components/common/VideoThumb';
import { hashString } from '../../lib/random';

export function retentionCurve(videoId: string) {
  const va = VIDEO_ANALYTICS[videoId];
  const target = (va?.retention ?? 0.45) * 100;
  const seed = hashString(videoId);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    let g = 0.78 * Math.pow(1 - x, 0.55) + 0.22 * Math.exp(-x * 25);
    [0.22, 0.47, 0.71].forEach((c, k) => {
      g += (((seed >> (k * 4)) & 15) / 15) * 0.06 * Math.exp(-Math.pow((x - c) / 0.025, 2));
    });
    if (x > 0.93) g *= 1 - (x - 0.93) * 3;
    pts.push({ x: i, y: g });
  }
  const mean = pts.slice(1).reduce((a, p) => a + p.y, 0) / 100;
  const k = target / 100 / mean;
  return pts.map((p, i) => ({ x: p.x, y: i === 0 ? 100 : Math.min(100, p.y * k * 100) }));
}

export function RetentionChart({ videoId, durationSec, height = 220 }: { videoId: string; durationSec: number; height?: number }) {
  const data = useMemo(() => retentionCurve(videoId), [videoId]);
  const typical = useMemo(() => data.map((p, i) => ({ ...p, typ: i === 0 ? 100 : Math.max(5, p.y * 0.92 - 2) })), [data]);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={typical} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`ret-${videoId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2793e8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2793e8" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="x" type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(x) => formatDuration((x / 100) * durationSec)} tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={{ stroke: '#909090' }} />
          <YAxis orientation="right" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-menu">
                  <div className="text-xs text-[#606060]">{formatDuration(((payload[0].payload.x as number) / 100) * durationSec)}</div>
                  <div className="font-medium">{(payload[0].payload.y as number).toFixed(1)}% still watching</div>
                  <div className="text-xs text-[#606060]">Typical: {(payload[0].payload.typ as number).toFixed(1)}%</div>
                </div>
              ) : null
            }
          />
          <ReferenceLine x={3} stroke="#909090" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="typ" stroke="#909090" strokeDasharray="4 4" fill="none" strokeWidth={1.5} isAnimationActive={false} />
          <Area type="monotone" dataKey="y" stroke="#2793e8" strokeWidth={2.5} fill={`url(#ret-${videoId})`} animationDuration={500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function GrowthCard() {
  const rows = growthByWindow();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const data = rows.map((r) => ({ label: r.label, revenue: r.revenue, subscribers: r.subscribers, sub: formatDateRange(dayDate(r.start), dayDate(r.end)) }));
  const first = rows.findIndex((r) => r.revenue > 0);
  return (
    <ACard
      title="Channel growth since launch"
      subtitle="Subscribers at the end of each month and estimated revenue earned that month"
      action={
        <div className="flex rounded-lg bg-black/[0.05] p-0.5 text-[13px] font-medium">
          {(['chart', 'table'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-md px-3 py-1 capitalize ${view === v ? 'bg-white shadow-sm' : 'text-[#606060]'}`}>
              {v}
            </button>
          ))}
        </div>
      }
    >
      {view === 'chart' ? (
        <GrowthComboChart data={data} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="h-10 border-b border-black/[0.1] text-left text-xs text-[#606060]">
                <th className="font-medium">Month</th>
                <th className="text-right font-medium">Subscribers</th>
                <th className="text-right font-medium">Gained</th>
                <th className="text-right font-medium">Views</th>
                <th className="text-right font-medium">Watch time (hours)</th>
                <th className="text-right font-medium">Estimated revenue</th>
                <th className="text-right font-medium">RPM</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className={`h-10 border-b border-black/[0.06] ${i === rows.length - 1 ? 'font-medium' : ''}`}>
                  <td>
                    {r.label}
                    {i === rows.length - 1 && <span className="ml-2 rounded bg-[#e8f0fe] px-1.5 py-0.5 text-[11px] text-[#1967d2]">Last 28 days</span>}
                  </td>
                  <td className="tabular text-right">{formatInt(r.subscribers)}</td>
                  <td className="tabular text-right text-[#2ba640]">+{formatInt(r.subsGained)}</td>
                  <td className="tabular text-right">{formatInt(r.views)}</td>
                  <td className="tabular text-right">{formatInt(r.watchHours)}</td>
                  <td className="tabular text-right">{r.revenue ? formatGBP(r.revenue) : '£0.00'}</td>
                  <td className="tabular text-right">{r.revenue ? formatGBP(r.rpm) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-[#f9f9f9] p-4 text-[13px] max-md:grid-cols-1">
        <div>
          <div className="text-[#606060]">Subscriber growth (first → latest month)</div>
          <div className="mt-0.5 text-lg font-medium">{(rows[rows.length - 1].subscribers / rows[0].subscribers).toFixed(0)}×</div>
        </div>
        <div>
          <div className="text-[#606060]">Monetised since</div>
          <div className="mt-0.5 text-lg font-medium">{first >= 0 ? rows[first].label : '—'}</div>
        </div>
        <div>
          <div className="text-[#606060]">Revenue month over month</div>
          <div className="mt-0.5 text-lg font-medium text-[#2ba640]">+{(((rows[9].revenue - rows[8].revenue) / rows[8].revenue) * 100).toFixed(1)}%</div>
        </div>
      </div>
    </ACard>
  );
}

function VideoRealtime({ videoId }: { videoId: string }) {
  const hours = useMemo(() => last48Hours(Date.now(), videoId), [videoId]);
  const total = hours.reduce((a, h) => a + h.views, 0);
  const lastHour = hours[hours.length - 1].views + hours[hours.length - 2].views;
  return (
    <ACard title="Realtime" subtitle={<span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse2 rounded-full bg-[#2ba640]" /> Updating live</span>}>
      <div className="text-[26px] font-medium">{formatInt(total)}</div>
      <div className="text-[13px] text-[#606060]">Views · Last 48 hours</div>
      <div className="mt-3">
        <HourlyBars hours={hours} height={72} />
        <div className="mt-1 flex justify-between text-[11px] text-[#606060]"><span>-48h</span><span>Now</span></div>
      </div>
      <div className="mt-4 border-t border-black/[0.1] pt-3 text-[13px]">
        <div className="flex justify-between"><span className="text-[#606060]">Views · Last 60 minutes (approx.)</span><span className="font-medium">{formatInt(Math.round(lastHour / 2))}</span></div>
      </div>
    </ACard>
  );
}

export function OverviewTab({ scope, range }: { scope: Scope; range: ResolvedRange }) {
  const navigate = useNavigate();
  const isVideo = !!scope.videoId;
  const views = metricTotal('views', scope, range.start, range.end);
  const rows = useVideoRows(scope, range);
  const { allVideos } = useStudio();
  const video = isVideo ? allVideos.find((v) => v.id === scope.videoId) : undefined;
  const latest = useMemo(() => [...rows].sort((a, b) => b.v.publishedAt - a.v.publishedAt).slice(0, 3), [rows]);

  return (
    <div className="flex gap-6 max-xl:flex-col">
      <div className="min-w-0 flex-1">
        <h2 className="mb-5 text-center text-[26px] font-medium leading-9 tracking-[-0.3px] text-[#0f0f0f] max-md:text-xl">{headline('views', views, range, isVideo)}</h2>
        <MetricTabsChart
          metrics={['views', 'watchHours', 'subscribers', 'revenue']}
          scope={scope}
          range={range}
          footer={!isVideo ? <SeeMore onClick={() => navigate('/analytics/overview?advanced=1')} /> : undefined}
        />
        {isVideo && video && video.kind === 'video' && (
          <ACard title="Key moments for audience retention" subtitle={`Average view duration ${formatDuration(VIDEO_ANALYTICS[video.id]?.avd ?? 0)} · ${(((VIDEO_ANALYTICS[video.id]?.avd ?? 0) / video.durationSec) * 100).toFixed(1)}% average percentage viewed`} className="mt-6">
            <RetentionChart videoId={video.id} durationSec={video.durationSec} />
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#606060]">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#2793e8]" /> This video</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-[#909090]" /> Typical retention for videos of a similar length</span>
            </div>
          </ACard>
        )}
        {isVideo && (
          <ACard title="How viewers find this video" subtitle={range.label} className="mt-6">
            <HBarList rows={trafficSources(scope, views).slice(0, 6).map((t) => ({ label: t.label, value: t.share }))} />
          </ACard>
        )}
        {!isVideo && (
          <>
            <ACard title="Your top content in this period" subtitle={range.label} className="mt-6">
              <TopContentTable rows={rows} columns={['avd', 'views']} sortBy="views" />
              <SeeMore onClick={() => navigate('/analytics/content')} />
            </ACard>
            {range.end === LAST && <div className="mt-6"><GrowthCard /></div>}
          </>
        )}
      </div>
      <div className="flex w-[340px] shrink-0 flex-col gap-6 max-xl:w-full">
        {isVideo && scope.videoId ? (
          <VideoRealtime videoId={scope.videoId} />
        ) : (
          <>
            <div className="rounded-xl border border-black/[0.1] bg-white p-6">
              <RealtimeCard showButton={false} />
            </div>
            <ACard title="Latest content">
              {latest.map((r) => (
                <button key={r.v.id} onClick={() => navigate(`/video/${r.v.id}/analytics`)} className="-mx-2 flex w-[calc(100%+16px)] gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.05]">
                  <VideoThumb video={r.v} width={96} rounded="rounded-md" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[13px] leading-[18px]">{r.v.title}</span>
                    <span className="mt-1 block text-xs text-[#606060]">{formatInt(r.views)} views in period</span>
                  </span>
                </button>
              ))}
            </ACard>
          </>
        )}
      </div>
    </div>
  );
}
