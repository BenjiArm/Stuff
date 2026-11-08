import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { metricTotal, videoRangeStats, LAST, type Scope } from '../../data/analytics';
import { TRAFFIC_SOURCES_SHORTS, TRAFFIC_SOURCES_VIDEO } from '../../data/audience';
import type { ResolvedRange } from '../../lib/ranges';
import { useStudio } from '../../store/StudioContext';
import { VideoThumb } from '../../components/common/VideoThumb';
import { formatCompact, formatDuration, formatGBP, formatInt } from '../../lib/format';
import { hashString } from '../../lib/random';
import type { Video } from '../../data/types';

export function ACard({ title, subtitle, children, action, className = '' }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-black/[0.1] bg-white p-6 ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-medium leading-6 text-[#0f0f0f]">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-[#606060]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SeeMore({ onClick, label = 'See more' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="mt-4 h-9 rounded-full bg-black/[0.05] px-4 text-sm font-medium hover:bg-black/[0.1]">
      {label}
    </button>
  );
}

export function useScopedVideos(scope: Scope) {
  const { videos } = useStudio();
  return useMemo(
    () => videos.filter((v) => !v.uploaded && v.visibility !== 'draft' && v.visibility !== 'scheduled' && (scope.kind && scope.kind !== 'all' ? v.kind === scope.kind : true)),
    [videos, scope.kind],
  );
}

export interface RowStats {
  v: Video;
  views: number;
  watchHours: number;
  subs: number;
  revenue: number;
  impressions: number;
  ctr: number;
  avd: number;
  likes: number;
  comments: number;
}

export function useVideoRows(scope: Scope, range: ResolvedRange): RowStats[] {
  const vids = useScopedVideos(scope);
  return useMemo(() => vids.map((v) => ({ v, ...videoRangeStats(v.id, range.start, range.end) })), [vids, range]);
}

type Col = 'views' | 'watchHours' | 'subs' | 'revenue' | 'impressions' | 'ctr' | 'avd' | 'rpm';

const COL_LABEL: Record<Col, string> = {
  views: 'Views',
  watchHours: 'Watch time (hours)',
  subs: 'Subscribers',
  revenue: 'Estimated revenue',
  impressions: 'Impressions',
  ctr: 'Impressions CTR',
  avd: 'Average view duration',
  rpm: 'RPM',
};

function colValue(r: RowStats, c: Col) {
  if (c === 'rpm') return r.views ? (r.revenue / r.views) * 1000 : 0;
  return r[c];
}

function colFormat(c: Col, v: number) {
  switch (c) {
    case 'revenue':
    case 'rpm':
      return formatGBP(v);
    case 'ctr':
      return v ? `${v.toFixed(1)}%` : '—';
    case 'avd':
      return v ? formatDuration(v) : '—';
    case 'watchHours':
      return v.toLocaleString('en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    case 'subs':
      return v >= 0 ? `+${formatInt(v)}` : formatInt(v);
    default:
      return formatInt(v);
  }
}

/** Ranked content table ("Your top content in this period"). */
export function TopContentTable({ rows, columns, sortBy, limit = 10, title, showBars }: { rows: RowStats[]; columns: Col[]; sortBy: Col; limit?: number; title?: string; showBars?: boolean }) {
  const navigate = useNavigate();
  const [sort, setSort] = useState<{ c: Col; dir: 'desc' | 'asc' }>({ c: sortBy, dir: 'desc' });
  const sorted = useMemo(() => [...rows].sort((a, b) => (sort.dir === 'desc' ? colValue(b, sort.c) - colValue(a, sort.c) : colValue(a, sort.c) - colValue(b, sort.c))), [rows, sort]);
  const shown = sorted.slice(0, limit);
  const max = Math.max(1, ...shown.map((r) => colValue(r, sort.c)));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="h-10 border-b border-black/[0.1] text-xs text-[#606060]">
            <th className="w-8 font-medium">#</th>
            <th className="min-w-[240px] font-medium">{title ?? 'Content'}</th>
            {columns.map((c) => (
              <th key={c} className="w-[1%] whitespace-nowrap pl-5 text-right font-medium">
                <button onClick={() => setSort((s) => ({ c, dir: s.c === c && s.dir === 'desc' ? 'asc' : 'desc' }))} className={`ml-auto flex items-center gap-1 hover:text-[#0f0f0f] ${sort.c === c ? 'text-[#0f0f0f]' : ''}`}>
                  {sort.c === c && (sort.dir === 'desc' ? <ArrowDown size={13} /> : <ArrowUp size={13} />)}
                  {COL_LABEL[c]}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((r, i) => (
            <tr key={r.v.id} onClick={() => navigate(`/video/${r.v.id}/analytics`)} className="cursor-pointer border-b border-black/[0.06] hover:bg-[#f9f9f9]">
              <td className="py-2 text-[#606060]">{i + 1}</td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-3">
                  <VideoThumb video={r.v} width={84} rounded="rounded-md" />
                  <span className="line-clamp-2 min-w-0">{r.v.title}</span>
                </div>
              </td>
              {columns.map((c) => (
                <td key={c} className="tabular whitespace-nowrap py-2 pl-5 text-right">
                  {colFormat(c, colValue(r, c))}
                  {showBars && c === sort.c && (
                    <div className="ml-auto mt-1 h-1 w-20 rounded-full bg-black/[0.05]">
                      <div className="ml-auto h-1 rounded-full bg-[#2793e8]" style={{ width: `${(colValue(r, c) / max) * 100}%` }} />
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {shown.length === 0 && <div className="py-10 text-center text-sm text-[#606060]">No content in this period</div>}
    </div>
  );
}

/** Traffic sources with mild per-video variation. */
export function trafficSources(scope: Scope, views: number) {
  const isShort = scope.kind === 'short' || (scope.videoId?.startsWith('s') ?? false);
  const base = isShort ? TRAFFIC_SOURCES_SHORTS : TRAFFIC_SOURCES_VIDEO;
  const seed = scope.videoId ? hashString(scope.videoId) : 0;
  const weights = base.map((s, i) => s.value * (scope.videoId ? 0.75 + (((seed >> (i * 3)) & 7) / 7) * 0.5 : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  return base.map((s, i) => ({ label: s.label, share: (weights[i] / total) * 100, views: (views * weights[i]) / total })).sort((a, b) => b.share - a.share);
}

export function revenueSources(scope: Scope, a: number, b: number) {
  const total = metricTotal('revenue', scope, a, b);
  const shorts = scope.videoId ? (scope.videoId.startsWith('s') ? total : 0) : scope.kind === 'video' ? 0 : metricTotal('revenue', { kind: 'short' }, a, b);
  const rest = total - shorts;
  const channel = !scope.videoId;
  const membershipsStart = LAST - 88;
  const overlap = Math.max(0, Math.min(b, LAST) - Math.max(a, membershipsStart) + 1) / Math.max(1, Math.min(b, LAST) - Math.max(0, a) + 1);
  const memb = channel ? rest * 0.0299 * overlap : 0;
  const supers = channel ? rest * 0.00863 * overlap : 0;
  const shopping = channel ? rest * 0.00115 * overlap : 0;
  const premium = (rest - memb - supers - shopping) * 0.0692;
  const watch = rest - memb - supers - shopping - premium;
  return [
    { label: 'Watch page ads', value: watch },
    { label: 'YouTube Premium', value: premium },
    { label: 'Shorts feed ads', value: shorts },
    { label: 'Memberships', value: memb },
    { label: 'Supers', value: supers },
    { label: 'Shopping', value: shopping },
  ];
}

export function headline(metric: string, value: number, range: ResolvedRange, isVideo: boolean) {
  const subject = isVideo ? 'Your video' : 'Your channel';
  const since = isVideo && (range.key === 'lifetime' || range.phrase === 'since it was published');
  const verb = since ? 'has got' : 'got';
  const phrase = since ? 'since it was published' : range.phrase;
  return `${subject} ${verb} ${metric === 'revenue' ? formatGBP(value) : formatInt(value)} ${metric} ${phrase}`;
}

export function fmtCompactOrInt(v: number) {
  return v >= 100000 ? formatCompact(v) : formatInt(v);
}
