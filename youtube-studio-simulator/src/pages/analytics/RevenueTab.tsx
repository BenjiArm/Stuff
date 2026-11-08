import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { WINDOWS, growthByWindow, metricTotal, dayDate, MONETISATION_START, type Scope } from '../../data/analytics';
import type { ResolvedRange } from '../../lib/ranges';
import { MetricTabsChart } from '../../components/analytics/MetricTabsChart';
import { Donut, DONUT_COLORS, SimpleBars } from '../../components/charts/MiniCharts';
import { ACard, TopContentTable, revenueSources, useVideoRows } from './shared';
import { formatCompact, formatDateRange, formatGBP, formatInt } from '../../lib/format';
import { Tooltip } from '../../components/common/Tooltip';
import { useStudio } from '../../store/StudioContext';

const AD_TYPES = [
  { label: 'Skippable video ads', share: 61.4 },
  { label: 'Non-skippable video ads', share: 13.8 },
  { label: 'Bumper ads', share: 10.6 },
  { label: 'Display ads', share: 5.9 },
  { label: 'Unknown', share: 8.3 },
];

export function RevenueTab({ scope, range }: { scope: Scope; range: ResolvedRange }) {
  const navigate = useNavigate();
  const { earn } = useStudio();
  const isVideo = !!scope.videoId;
  const total = metricTotal('revenue', scope, range.start, range.end);
  const rpm = metricTotal('rpm', scope, range.start, range.end);
  const cpm = metricTotal('cpm', scope, range.start, range.end);
  const pcpm = metricTotal('playbackCpm', scope, range.start, range.end);
  const mp = metricTotal('monetisedPlaybacks', scope, range.start, range.end);
  const views = metricTotal('views', scope, range.start, range.end);
  const sources = revenueSources(scope, range.start, range.end);
  const rows = useVideoRows(scope.videoId ? {} : scope, range);
  const [showAll, setShowAll] = useState(false);

  const monthly = useMemo(() => {
    const g = growthByWindow();
    return g.map((m) => ({
      label: m.label,
      value: isVideo ? metricTotal('revenue', scope, m.start, m.end) : m.revenue,
      sub: `${m.label} · ${formatDateRange(dayDate(m.start), dayDate(m.end))}`,
    }));
  }, [isVideo, scope]);
  const monthlyTotal = monthly.reduce((a, m) => a + m.value, 0);
  const visibleSources = sources.filter((s) => s.value > 0.005);
  const sourceTotal = visibleSources.reduce((a, s) => a + s.value, 0);

  if (range.end < MONETISATION_START && !isVideo) {
    return (
      <div className="rounded-xl border border-black/[0.1] p-10 text-center">
        <div className="text-xl font-medium">£0.00</div>
        <p className="mt-2 text-sm text-[#606060]">Your channel joined the YouTube Partner Programme on {dayDate(MONETISATION_START).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Choose a later period to see revenue.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-5 text-center text-[26px] font-medium leading-9 tracking-[-0.3px] max-md:text-xl">
        {isVideo ? 'This video' : 'Your channel'} made an estimated {formatGBP(total)} {range.phrase}
      </h2>
      <div className="flex gap-6 max-xl:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <MetricTabsChart metrics={['revenue', 'rpm', 'playbackCpm', 'monetisedPlaybacks']} scope={scope} range={range} />

          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            {[
              { l: 'RPM', v: formatGBP(rpm), d: 'What you earned per 1,000 views, after YouTube\'s share. Includes all revenue sources.' },
              { l: 'Playback-based CPM', v: formatGBP(pcpm), d: 'What advertisers paid per 1,000 monetised playbacks (before YouTube\'s share).' },
              { l: 'CPM', v: formatGBP(cpm), d: 'What advertisers paid per 1,000 ad impressions.' },
            ].map((c) => (
              <div key={c.l} className="rounded-xl border border-black/[0.1] p-5">
                <div className="flex items-center gap-1 text-[13px] text-[#606060]">
                  {c.l}
                  <Tooltip content={c.d}>
                    <Info size={14} />
                  </Tooltip>
                </div>
                <div className="mt-1 text-[24px] font-medium">{c.v}</div>
                <div className="mt-1 text-xs leading-[17px] text-[#909090]">{c.d}</div>
              </div>
            ))}
          </div>

          <ACard title={isVideo ? 'Revenue from this video' : 'Revenue per video'} subtitle={`${range.label} · ${formatInt(rows.filter((r) => r.revenue > 0).length)} monetised items`}>
            <TopContentTable rows={rows.filter((r) => (isVideo ? r.v.id === scope.videoId : true))} columns={['revenue', 'rpm', 'views', 'watchHours']} sortBy="revenue" limit={showAll ? 200 : 10} showBars title="Content" />
            {!isVideo && rows.length > 10 && (
              <button onClick={() => setShowAll(!showAll)} className="mt-4 h-9 rounded-full bg-black/[0.05] px-4 text-sm font-medium hover:bg-black/[0.1]">
                {showAll ? 'Show top 10' : `Show all ${rows.length}`}
              </button>
            )}
          </ACard>

          <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            <ACard title="Ad type" subtitle={`Estimated ad revenue · ${range.label}`}>
              {AD_TYPES.map((a) => {
                const adRev = sources[0].value + sources[2].value;
                return (
                  <div key={a.label} className="py-2">
                    <div className="flex justify-between text-sm">
                      <span>{a.label}</span>
                      <span className="tabular">{formatGBP((adRev * a.share) / 100)}</span>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-black/[0.05]">
                      <div className="h-1 rounded-full bg-[#2793e8]" style={{ width: `${a.share}%` }} />
                    </div>
                  </div>
                );
              })}
            </ACard>
            <ACard title="Estimated monetised playbacks" subtitle={range.label}>
              <div className="text-[28px] font-medium">{formatCompact(mp)}</div>
              <div className="text-[13px] text-[#606060]">{views ? ((mp / views) * 100).toFixed(1) : '0'}% of {formatCompact(views)} views showed at least one ad</div>
              <div className="mt-4 h-2 rounded-full bg-black/[0.06]">
                <div className="h-2 rounded-full bg-[#2ba640]" style={{ width: `${views ? (mp / views) * 100 : 0}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <div className="text-[#606060]">Ad impressions</div>
                  <div className="text-lg font-medium">{formatCompact(metricTotal('adImpressions', scope, range.start, range.end))}</div>
                </div>
                <div>
                  <div className="text-[#606060]">Ads per playback</div>
                  <div className="text-lg font-medium">1.26</div>
                </div>
              </div>
            </ACard>
          </div>
        </div>

        <div className="flex w-[380px] shrink-0 flex-col gap-6 max-xl:w-full">
          <ACard title="Monthly estimated revenue" subtitle={`${formatGBP(monthlyTotal)} since monetisation`}>
            <SimpleBars data={monthly} format={(v) => (v >= 1000 ? `£${(v / 1000).toFixed(1)}K` : `£${Math.round(v)}`)} height={220} highlightLast />
            <div className="mt-3 flex justify-between border-t border-black/[0.1] pt-3 text-[13px]">
              <span className="text-[#606060]">{monthly[monthly.length - 1].label} (last 28 days)</span>
              <span className="font-medium">{formatGBP(monthly[monthly.length - 1].value)}</span>
            </div>
            <div className="mt-1 flex justify-between text-[13px]">
              <span className="text-[#606060]">{monthly[monthly.length - 2].label}</span>
              <span className="font-medium">{formatGBP(monthly[monthly.length - 2].value)}</span>
            </div>
            {!isVideo && <div className="mt-1 text-xs text-[#909090]">Months are rolling periods; the latest month is the last 28 days. Final payments are confirmed in AdSense.</div>}
          </ACard>

          <ACard title="How you make money" subtitle={range.label}>
            {visibleSources.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3 py-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[i] }} />
                <span className="flex-1">{s.label}</span>
                <span className="tabular w-14 text-right text-[#606060]">{sourceTotal ? ((s.value / sourceTotal) * 100).toFixed(1) : '0.0'}%</span>
                <span className="tabular w-20 text-right font-medium">{formatGBP(s.value)}</span>
              </div>
            ))}
            {!isVideo && (
              <button className="mt-3 text-sm font-medium text-[#065fd4] hover:underline" onClick={() => navigate('/earn/overview')}>
                Manage ways to earn
              </button>
            )}
          </ACard>

          <ACard title="Revenue sources" subtitle={range.label}>
            <div className="flex items-center gap-5">
              <Donut data={visibleSources.map((s) => ({ label: s.label, value: sourceTotal ? (s.value / sourceTotal) * 100 : 0 }))} size={150} centre={<><div className="text-sm font-medium">{formatGBP(total)}</div><div className="text-[11px] text-[#606060]">Total</div></>} />
              <div className="flex flex-col gap-1.5 text-xs">
                {visibleSources.map((s, i) => (
                  <span key={s.label} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: DONUT_COLORS[i] }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </ACard>

          {!isVideo && (
            <ACard title="Transaction revenue" subtitle={range.label}>
              {[
                { l: 'Memberships', v: sources[3].value, s: earn.memberships ? '42 active members' : 'Off' },
                { l: 'Super Thanks', v: sources[4].value * 0.74, s: earn.superThanks ? 'On' : 'Off' },
                { l: 'Super Chat & Super Stickers', v: sources[4].value * 0.26, s: earn.superChat ? 'On' : 'Off' },
                { l: 'Shopping', v: sources[5].value, s: earn.shopping ? 'On' : 'Affiliate only' },
              ].map((t) => (
                <div key={t.l} className="flex items-center py-2 text-sm">
                  <span className="flex-1">
                    {t.l}
                    <span className="block text-xs text-[#606060]">{t.s}</span>
                  </span>
                  <span className="tabular font-medium">{formatGBP(t.v)}</span>
                </div>
              ))}
            </ACard>
          )}
          {!isVideo && WINDOWS.length > 0 && null}
        </div>
      </div>
    </div>
  );
}
