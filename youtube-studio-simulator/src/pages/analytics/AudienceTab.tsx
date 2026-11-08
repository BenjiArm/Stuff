import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { metricTotal, SUBSCRIBERS_CUMULATIVE, dayDate, type Scope } from '../../data/analytics';
import { AGE_GROUPS, DEVICE_TYPES, FORMATS_WATCHED, GENDER, GEOGRAPHY, OTHER_CHANNELS, SUBTITLE_LANGUAGES, viewerActivity } from '../../data/audience';
import type { ResolvedRange } from '../../lib/ranges';
import { MetricTabsChart } from '../../components/analytics/MetricTabsChart';
import { Donut, DONUT_COLORS, HBarList } from '../../components/charts/MiniCharts';
import { ACard, useVideoRows } from './shared';
import { formatCompact, formatDate, formatInt, formatSubs } from '../../lib/format';
import { LetterAvatar } from '../../components/common/Avatar';
import { VideoThumb } from '../../components/common/VideoThumb';
import { hashString } from '../../lib/random';
import { Tooltip as Tip } from '../../components/common/Tooltip';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Heatmap() {
  const grid = useMemo(() => viewerActivity(), []);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        <div className="flex flex-col gap-[3px] pr-1 pt-5 text-[11px] text-[#606060]">
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="flex h-[10px] items-center leading-none">{h % 4 === 0 ? `${String(h).padStart(2, '0')}:00` : ''}</div>
          ))}
        </div>
        {order.map((d) => (
          <div key={d} className="flex flex-1 flex-col gap-[3px]">
            <div className="mb-1 h-4 text-center text-[11px] text-[#606060]">{DAYS[d]}</div>
            {grid[d].map((v, h) => (
              <Tip key={h} content={`${DAYS[d]} ${String(h).padStart(2, '0')}:00 · ${v > 0.75 ? 'Very high' : v > 0.5 ? 'High' : v > 0.3 ? 'Medium' : 'Low'} activity`}>
                <div className="h-[10px] w-full min-w-[20px] rounded-[2px]" style={{ background: `rgba(92, 61, 184, ${0.08 + v * 0.85})` }} />
              </Tip>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#606060]">
        Fewer viewers
        {[0.15, 0.35, 0.55, 0.75, 0.93].map((o) => (
          <span key={o} className="h-2.5 w-5 rounded-[2px]" style={{ background: `rgba(92,61,184,${o})` }} />
        ))}
        More viewers
      </div>
      <p className="mt-2 text-xs text-[#909090]">Your local time (GMT). Best time to publish: Thursday to Saturday, 16:00–18:00.</p>
    </div>
  );
}

function perturb(list: { label: string; value: number }[], seed: number) {
  if (!seed) return list;
  const w = list.map((x, i) => x.value * (0.85 + (((seed >> (i * 2)) & 3) / 3) * 0.3));
  const t = w.reduce((a, b) => a + b, 0);
  return list.map((x, i) => ({ ...x, value: (w[i] / t) * 100 }));
}

export function AudienceTab({ scope, range }: { scope: Scope; range: ResolvedRange }) {
  const navigate = useNavigate();
  const seed = scope.videoId ? hashString(scope.videoId) : 0;
  const unique = metricTotal('uniqueViewers', scope, range.start, range.end);
  const watch = metricTotal('watchHours', scope, range.start, range.end);
  const views = metricTotal('views', scope, range.start, range.end);
  const subShare = 18.4 + (seed % 7) - 3;
  const rows = useVideoRows({}, range);
  const [geoMetric, setGeoMetric] = useState<'views' | 'watch'>('views');
  const subsData = useMemo(() => {
    const out: { day: number; value: number }[] = [];
    for (let d = Math.max(0, range.start); d <= range.end; d++) out.push({ day: d, value: Math.round(SUBSCRIBERS_CUMULATIVE[d]) });
    return out;
  }, [range]);
  const age = perturb(AGE_GROUPS, seed);
  const gender = perturb(GENDER, seed >> 3);

  return (
    <div>
      <h2 className="mb-5 text-center text-[26px] font-medium leading-9 tracking-[-0.3px] max-md:text-xl">
        {scope.videoId ? 'This video' : 'Your channel'} reached {formatInt(unique)} unique viewers {range.phrase}
      </h2>
      <div className="flex gap-6 max-xl:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <MetricTabsChart metrics={['returningViewers', 'newViewers', 'uniqueViewers', 'subscribers']} scope={scope} range={range} initial="returningViewers" />
          {!scope.videoId && (
            <ACard title="Subscriber growth" subtitle={`Total subscribers · ${range.label}`}>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={subsData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="subgrow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#cc0000" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#cc0000" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="day" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(d) => formatDate(dayDate(d))} tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={{ stroke: '#909090' }} tickCount={5} />
                    <YAxis orientation="right" tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={false} width={52} domain={['dataMin', 'dataMax']} />
                    <Tooltip content={({ active, payload }) => (active && payload?.length ? <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-menu"><div className="text-xs text-[#606060]">{formatDate(dayDate(payload[0].payload.day))}</div><div className="font-medium">{formatInt(payload[0].payload.value)} subscribers</div></div> : null)} />
                    <Area type="monotone" dataKey="value" stroke="#cc0000" strokeWidth={2.5} fill="url(#subgrow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ACard>
          )}
          <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            <ACard title="Age and gender" subtitle={`Views · ${range.label}`}>
              <div className="flex items-center gap-6">
                <Donut data={gender} size={130} centre={<><div className="text-lg font-medium">{gender[0].value.toFixed(1)}%</div><div className="text-[11px] text-[#606060]">Male</div></>} />
                <div className="flex flex-col gap-2 text-[13px]">
                  {gender.map((g, i) => (
                    <div key={g.label} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[i] }} />{g.label} <span className="font-medium">{g.value.toFixed(1)}%</span></div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <HBarList rows={age.map((a) => ({ label: a.label, value: a.value }))} color="#5c3db8" />
              </div>
            </ACard>
            <ACard title="Watch time from subscribers" subtitle={`Watch time · ${range.label}`}>
              <div className="flex items-center gap-6">
                <Donut data={[{ label: 'Not subscribed', value: 100 - subShare }, { label: 'Subscribed', value: subShare }]} size={130} centre={<><div className="text-lg font-medium">{subShare.toFixed(1)}%</div><div className="text-[11px] text-[#606060]">Subscribed</div></>} />
                <div className="flex flex-col gap-3 text-[13px]">
                  <div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[0] }} />Not subscribed</div><div className="pl-[18px] font-medium">{formatCompact(watch * (1 - subShare / 100))} hours</div></div>
                  <div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[1] }} />Subscribed</div><div className="pl-[18px] font-medium">{formatCompact(watch * (subShare / 100))} hours</div></div>
                </div>
              </div>
              <div className="mt-5 rounded-lg bg-[#f9f9f9] p-3 text-[13px] leading-5 text-[#606060]">
                Most of your watch time comes from viewers who aren't subscribed yet – the algorithm is recommending your documentaries to new audiences. Views from subscribers: <span className="font-medium text-[#0f0f0f]">{formatCompact(views * 0.142)}</span> (14.2%).
              </div>
            </ACard>
          </div>
          <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            <ACard
              title="Top geographies"
              subtitle={range.label}
              action={
                <select value={geoMetric} onChange={(e) => setGeoMetric(e.target.value as 'views' | 'watch')} className="rounded-lg border border-black/[0.2] bg-white px-2 py-1 text-[13px]">
                  <option value="views">Views</option>
                  <option value="watch">Watch time</option>
                </select>
              }
            >
              <HBarList
                rows={GEOGRAPHY.slice(0, 10).map((g) => ({ label: g.country, value: g.share * (geoMetric === 'watch' && (g.code === 'US' || g.code === 'GB') ? 1.06 : 1), sub: geoMetric === 'views' ? formatCompact((views * g.share) / 100) : `${formatCompact((watch * g.share) / 100)} h` }))}
              />
            </ACard>
            <ACard title="When your viewers are on YouTube" subtitle="Last 28 days">
              <Heatmap />
            </ACard>
          </div>
        </div>
        <div className="flex w-[380px] shrink-0 flex-col gap-6 max-xl:w-full">
          <ACard title="Channels your audience watches" subtitle="Last 28 days">
            {OTHER_CHANNELS.map((c) => (
              <div key={c.name} className="flex items-center gap-3 py-2">
                <LetterAvatar name={c.name} color={c.color} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{c.name}</div>
                  <div className="text-xs text-[#606060]">{formatSubs(c.subscribers)} subscribers</div>
                </div>
              </div>
            ))}
          </ACard>
          <ACard title="Content your audience watches" subtitle="Last 7 days · from your channel">
            {[...rows].sort((a, b) => b.views - a.views).slice(0, 4).map((r) => (
              <button key={r.v.id} onClick={() => navigate(`/video/${r.v.id}/analytics`)} className="-mx-2 flex w-[calc(100%+16px)] gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.05]">
                <VideoThumb video={r.v} width={88} rounded="rounded-md" />
                <span className="line-clamp-2 text-[13px] leading-[18px]">{r.v.title}</span>
              </button>
            ))}
          </ACard>
          <ACard title="Formats your audience watches" subtitle="Views · Last 28 days">
            <HBarList rows={FORMATS_WATCHED} />
          </ACard>
          <ACard title="Top subtitle/CC languages" subtitle={`Views · ${range.label}`}>
            <HBarList rows={SUBTITLE_LANGUAGES} />
          </ACard>
          <ACard title="Device type" subtitle={`Watch time · ${range.label}`}>
            <HBarList rows={DEVICE_TYPES} />
          </ACard>
        </div>
      </div>
    </div>
  );
}
