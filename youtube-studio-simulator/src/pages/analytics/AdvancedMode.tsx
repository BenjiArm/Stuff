import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, Download, X } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { metricSeries, metricTotal, dayDate, type Metric } from '../../data/analytics';
import { resolveRange } from '../../lib/ranges';
import { useStudio } from '../../store/StudioContext';
import { DateRangePicker } from '../../components/analytics/DateRangePicker';
import { METRICS } from '../../lib/metrics';
import { IconButton, Button } from '../../components/common/Button';
import { SelectField, Checkbox, Chip } from '../../components/common/Controls';
import { useVideoRows, type RowStats } from './shared';
import { VideoThumb } from '../../components/common/VideoThumb';
import { DONUT_COLORS } from '../../components/charts/MiniCharts';
import { formatDate, formatDuration, formatGBP, formatInt } from '../../lib/format';
import type { KindFilter } from '../../data/analytics';

const CHART_METRICS: Metric[] = ['views', 'watchHours', 'subscribers', 'revenue', 'impressions', 'likes', 'comments'];
type ColKey = 'views' | 'watchHours' | 'subs' | 'revenue' | 'impressions' | 'ctr' | 'avd' | 'likes';
const COLS: { k: ColKey; label: string; fmt: (v: number) => string }[] = [
  { k: 'views', label: 'Views', fmt: formatInt },
  { k: 'watchHours', label: 'Watch time (hours)', fmt: (v) => v.toLocaleString('en-GB', { maximumFractionDigits: 1 }) },
  { k: 'subs', label: 'Subscribers', fmt: (v) => formatInt(v) },
  { k: 'revenue', label: 'Estimated revenue', fmt: formatGBP },
  { k: 'impressions', label: 'Impressions', fmt: formatInt },
  { k: 'ctr', label: 'Impressions CTR', fmt: (v) => (v ? `${v.toFixed(1)}%` : '—') },
  { k: 'avd', label: 'Average view duration', fmt: (v) => (v ? formatDuration(v) : '—') },
  { k: 'likes', label: 'Likes', fmt: formatInt },
];

export function AdvancedMode({ onClose, initialMetric = 'views' }: { onClose: () => void; initialMetric?: Metric }) {
  const { analyticsRange, customRange, toast } = useStudio();
  const range = resolveRange(analyticsRange, customRange);
  const [kind, setKind] = useState<KindFilter>('all');
  const rows = useVideoRows({ kind }, range);
  const [metric, setMetric] = useState<Metric>(initialMetric);
  const [sort, setSort] = useState<{ k: ColKey; dir: 'asc' | 'desc' }>({ k: 'views', dir: 'desc' });
  const sorted = useMemo(() => [...rows].sort((a, b) => (sort.dir === 'desc' ? b[sort.k] - a[sort.k] : a[sort.k] - b[sort.k])), [rows, sort]);
  const [picked, setPicked] = useState<string[] | null>(null);
  const plotted = picked ?? sorted.slice(0, 5).map((r) => r.v.id);

  const chartData = useMemo(() => {
    const series = plotted.map((id) => metricSeries(metric, { videoId: id }, range.start, range.end));
    const total = metricSeries(metric, { kind }, range.start, range.end);
    return total.map((p, i) => {
      const row: Record<string, number> = { day: p.day, total: p.value };
      series.forEach((s, j) => (row[plotted[j]] = s[i]?.value ?? 0));
      return row;
    });
  }, [plotted, metric, range, kind]);

  const totals = useMemo(() => {
    const t: Record<ColKey, number> = { views: 0, watchHours: 0, subs: 0, revenue: 0, impressions: 0, ctr: 0, avd: 0, likes: 0 };
    rows.forEach((r) => COLS.forEach((c) => c.k !== 'ctr' && c.k !== 'avd' && (t[c.k] += r[c.k])));
    t.ctr = metricTotal('ctr', { kind }, range.start, range.end);
    t.avd = metricTotal('avd', { kind }, range.start, range.end);
    return t;
  }, [rows, kind, range]);

  const exportCsv = () => {
    const header = ['Content', 'Published', ...COLS.map((c) => c.label)].join(',');
    const lines = sorted.map((r: RowStats) => [`"${r.v.title.replace(/"/g, '""')}"`, formatDate(r.v.publishedAt), ...COLS.map((c) => (c.k === 'revenue' ? r[c.k].toFixed(2) : c.k === 'ctr' ? r[c.k].toFixed(2) : c.k === 'avd' ? Math.round(r[c.k]) : Math.round(r[c.k])))].join(','));
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `the-past-explained-analytics-${range.key}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Exported current view as CSV');
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-white">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-black/[0.1] px-4">
        <IconButton label="Close advanced mode" onClick={onClose}>
          <X size={22} />
        </IconButton>
        <h2 className="flex-1 text-xl font-medium">Advanced mode</h2>
        <Button variant="tonal" icon={<Download size={18} />} onClick={exportCsv}>
          Export current view
        </Button>
        <DateRangePicker />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-3 px-6 pt-4">
          {(['all', 'video', 'short'] as KindFilter[]).map((k) => (
            <Chip key={k} active={kind === k} onClick={() => (setKind(k), setPicked(null))}>
              {k === 'all' ? 'All content' : k === 'video' ? 'Videos' : 'Shorts'}
            </Chip>
          ))}
          <div className="flex-1" />
          <SelectField compact className="w-[240px]" value={metric} onChange={setMetric} options={CHART_METRICS.map((m) => ({ value: m, label: METRICS[m].label }))} />
        </div>
        <div className="px-6 pt-4" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="day" tickFormatter={(d) => formatDate(dayDate(d))} tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={{ stroke: '#909090' }} minTickGap={60} />
              <YAxis orientation="right" tickFormatter={METRICS[metric].axis} tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={false} width={60} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as Record<string, number>;
                  return (
                    <div className="max-w-[360px] rounded-lg bg-white px-4 py-3 text-xs shadow-menu">
                      <div className="mb-1 text-[#606060]">{formatDate(dayDate(p.day))}</div>
                      <div className="flex justify-between gap-4 font-medium"><span>Total</span><span>{METRICS[metric].full(p.total)}</span></div>
                      {plotted.map((id, i) => (
                        <div key={id} className="flex justify-between gap-4">
                          <span className="flex min-w-0 items-center gap-1.5"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} /><span className="truncate">{rows.find((r) => r.v.id === id)?.v.title}</span></span>
                          <span>{METRICS[metric].full(p[id] ?? 0)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Line dataKey="total" stroke="#0f0f0f" strokeWidth={2} dot={false} name="Total" />
              {plotted.map((id, i) => (
                <Line key={id} dataKey={id} stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth={1.75} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto px-6 pb-10 pt-4">
          <table className="w-full min-w-[1100px] text-left text-[13px]">
            <thead>
              <tr className="h-12 border-b border-black/[0.1] text-xs text-[#606060]">
                <th className="w-10" />
                <th className="font-medium">Content</th>
                <th className="w-[110px] font-medium">Published</th>
                {COLS.map((c) => (
                  <th key={c.k} className="w-[120px] text-right font-medium">
                    <button onClick={() => setSort((s) => ({ k: c.k, dir: s.k === c.k && s.dir === 'desc' ? 'asc' : 'desc' }))} className={`ml-auto flex items-center gap-1 ${sort.k === c.k ? 'text-[#0f0f0f]' : ''}`}>
                      {sort.k === c.k && (sort.dir === 'desc' ? <ArrowDown size={13} /> : <ArrowUp size={13} />)}
                      {c.label}
                    </button>
                  </th>
                ))}
              </tr>
              <tr className="h-11 border-b border-black/[0.1] bg-[#f9f9f9] font-medium">
                <td />
                <td>Total</td>
                <td />
                {COLS.map((c) => (
                  <td key={c.k} className="tabular text-right">{c.fmt(totals[c.k])}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const idx = plotted.indexOf(r.v.id);
                return (
                  <tr key={r.v.id} className="border-b border-black/[0.06] hover:bg-[#f9f9f9]">
                    <td className="py-2">
                      <span className="flex items-center gap-1">
                        <Checkbox checked={idx >= 0} onChange={(c) => setPicked((p) => { const base = p ?? plotted; return c ? [...base, r.v.id].slice(-8) : base.filter((x) => x !== r.v.id); })} />
                        {idx >= 0 && <span className="h-2 w-2 rounded-full" style={{ background: DONUT_COLORS[idx % DONUT_COLORS.length] }} />}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-3">
                        <VideoThumb video={r.v} width={72} rounded="rounded" />
                        <span className="line-clamp-2">{r.v.title}</span>
                      </div>
                    </td>
                    <td>{formatDate(r.v.publishedAt)}</td>
                    {COLS.map((c) => (
                      <td key={c.k} className="tabular text-right">{c.fmt(r[c.k])}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  );
}
