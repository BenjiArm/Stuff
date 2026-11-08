import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { metricSeries, metricTotal, type Metric, type Scope } from '../../data/analytics';
import { METRICS } from '../../lib/metrics';
import { pctChange } from '../../lib/format';
import type { ResolvedRange } from '../../lib/ranges';
import { DeltaIcon } from '../common/Delta';
import { MetricChart, type ChartMarker } from '../charts/MetricChart';
import { Tooltip } from '../common/Tooltip';
import { useStudio } from '../../store/StudioContext';

interface Props {
  metrics: Metric[];
  scope: Scope;
  range: ResolvedRange;
  initial?: Metric;
  height?: number;
  showMarkers?: boolean;
  footer?: React.ReactNode;
  onSelect?: (m: Metric) => void;
}

/** Studio's metric tab strip with the big line chart underneath. */
export function MetricTabsChart({ metrics, scope, range, initial, height = 280, showMarkers = true, footer, onSelect }: Props) {
  const [selected, setSelected] = useState<Metric>(initial ?? metrics[0]);
  const { videos } = useStudio();
  const navigate = useNavigate();
  const [comparePrev, setComparePrev] = useState(false);
  const active = metrics.includes(selected) ? selected : metrics[0];

  const totals = useMemo(
    () =>
      metrics.map((m) => {
        const cur = metricTotal(m, scope, range.start, range.end);
        const hasPrev = range.prevStart >= 0 && range.prevEnd >= 0;
        const prev = hasPrev ? metricTotal(m, scope, range.prevStart, range.prevEnd) : 0;
        return { m, cur, prev, pct: hasPrev ? pctChange(cur, prev) : null };
      }),
    [metrics, scope, range],
  );

  const data = useMemo(() => {
    const cur = metricSeries(active, scope, range.start, range.end);
    if (!comparePrev) return cur;
    const offset = range.length;
    return cur.map((p) => ({ ...p, prev: p.day - offset >= 0 ? metricSeries(active, scope, p.day - offset, p.day - offset)[0]?.value ?? 0 : 0 }));
  }, [active, scope, range, comparePrev]);

  const markers: ChartMarker[] = useMemo(() => {
    if (!showMarkers || scope.videoId) return [];
    const startMs = range.startDate.getTime();
    const endMs = range.endDate.getTime() + 86_400_000;
    return videos
      .filter((v) => v.visibility === 'public' && !v.uploaded && v.publishedAt >= startMs && v.publishedAt < endMs && (scope.kind === 'short' ? v.kind === 'short' : scope.kind === 'video' ? v.kind === 'video' : v.kind === 'video'))
      .slice(0, 40)
      .filter((_, __, arr) => arr.length <= 18)
      .map((v) => ({ id: v.id, label: v.title, day: range.start + Math.floor((v.publishedAt - startMs) / 86_400_000) }));
  }, [videos, range, scope, showMarkers]);

  return (
    <div className="overflow-hidden rounded-xl border border-black/[0.1] bg-white">
      <div className="flex overflow-x-auto no-scrollbar">
        {totals.map(({ m, cur, pct }) => {
          const def = METRICS[m];
          const isActive = m === active;
          return (
            <button
              key={m}
              onClick={() => {
                setSelected(m);
                onSelect?.(m);
              }}
              className={`relative min-w-[150px] flex-1 border-b px-6 pb-5 pt-5 text-left transition-colors ${
                isActive ? 'border-transparent bg-white' : 'border-black/[0.1] bg-[#f9f9f9] hover:bg-[#f2f2f2]'
              } border-r border-r-black/[0.06] last:border-r-0`}
            >
              {isActive && <span className="absolute inset-x-0 top-0 h-[3px] bg-[#2793e8]" />}
              <Tooltip content={def.tooltip}>
                <span className="block text-[13px] font-medium text-[#606060]">{def.label}</span>
              </Tooltip>
              <span className="mt-2 flex items-center gap-2">
                <Tooltip content={def.full(cur)}>
                  <span className="text-[26px] font-medium leading-8 tracking-[-0.3px] text-[#0f0f0f]">{def.short(cur)}</span>
                </Tooltip>
                <DeltaIcon pct={m === 'subscribers' && cur < 0 ? -Math.abs(pct ?? 0) : pct} compareLabel={range.compareLabel} />
              </span>
              <span className="mt-1 block text-xs text-[#606060]">
                {pct === null ? ' ' : Math.abs(pct) < 0.5 ? 'About the same as usual' : `${Math.abs(pct) > 999 ? '999+' : Math.abs(pct).toFixed(0)}% ${pct > 0 ? 'more' : 'less'} than ${range.compareLabel}`}
              </span>
            </button>
          );
        })}
      </div>
      <div className="px-6 pb-4 pt-5">
        <MetricChart
          data={data}
          format={METRICS[active].full}
          axisFormat={METRICS[active].axis}
          metricLabel={METRICS[active].label}
          height={height}
          showPrev={comparePrev}
          markers={markers}
          onMarkerClick={(id) => navigate(`/video/${id}/analytics`)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {range.prevStart >= 0 && range.prevEnd >= 0 && (
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#606060]">
              <input type="checkbox" className="studio-check" checked={comparePrev} onChange={(e) => setComparePrev(e.target.checked)} />
              Compare to {range.compareLabel}
            </label>
          )}
          <div className="flex-1" />
          {footer}
        </div>
      </div>
    </div>
  );
}
