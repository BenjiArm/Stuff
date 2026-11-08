import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dayDate } from '../../data/analytics';
import { formatWeekdayDate } from '../../lib/format';

export interface ChartPoint {
  day: number;
  value: number;
  prev?: number;
}

export interface ChartMarker {
  day: number;
  label: string;
  id: string;
}

interface Props {
  data: ChartPoint[];
  format: (v: number) => string;
  axisFormat?: (v: number) => string;
  height?: number;
  color?: string;
  showPrev?: boolean;
  markers?: ChartMarker[];
  onMarkerClick?: (id: string) => void;
  metricLabel: string;
  cumulative?: boolean;
}

function tickLabel(day: number, span: number) {
  const d = dayDate(day);
  if (span > 200) return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function MetricChart({ data, format, axisFormat, height = 260, color = '#2793e8', showPrev, markers = [], onMarkerClick, metricLabel }: Props) {
  const span = data.length;
  const ticks = useMemo(() => {
    if (!data.length) return [];
    const n = span <= 8 ? span : 5;
    const out: number[] = [];
    for (let i = 0; i < n; i++) out.push(data[Math.round((i * (data.length - 1)) / Math.max(1, n - 1))].day);
    return Array.from(new Set(out));
  }, [data, span]);
  const gid = useMemo(() => `g${Math.random().toString(36).slice(2, 8)}`, []);
  const first = data[0]?.day ?? 0;
  const last = data[data.length - 1]?.day ?? 1;

  return (
    <div className="w-full">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e5e5e5" />
            <XAxis
              dataKey="day"
              type="number"
              domain={[first, last]}
              ticks={ticks}
              tick={(props: { x: number; y: number; payload: { value: number } }) => {
                const v = props.payload.value;
                const anchor = v === ticks[0] && ticks.length > 1 ? 'start' : v === ticks[ticks.length - 1] && ticks.length > 1 ? 'end' : 'middle';
                return (
                  <text x={props.x} y={props.y + 14} textAnchor={anchor} fontSize={12} fill="#606060">
                    {tickLabel(v, span)}
                  </text>
                );
              }}
              tickLine={false}
              axisLine={{ stroke: '#909090' }}
              interval={0}
              height={30}
            />
            <YAxis
              orientation="right"
              tick={{ fontSize: 12, fill: '#606060' }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={axisFormat ?? format}
              allowDecimals={false}
              tickCount={5}
            />
            <Tooltip
              cursor={{ stroke: '#909090', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as ChartPoint;
                return (
                  <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-menu">
                    <div className="text-xs text-[#606060]">{formatWeekdayDate(dayDate(p.day))}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                      <span className="text-[#606060]">{metricLabel}</span>
                      <span className="ml-auto pl-4 font-medium text-[#0f0f0f]">{format(p.value)}</span>
                    </div>
                    {showPrev && p.prev !== undefined && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-0.5 w-2 bg-[#909090]" />
                        <span className="text-[#606060]">Previous period</span>
                        <span className="ml-auto pl-4 font-medium text-[#0f0f0f]">{format(p.prev)}</span>
                      </div>
                    )}
                  </div>
                );
              }}
            />
            {showPrev && <Line type="linear" dataKey="prev" stroke="#909090" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />}
            <Area type="linear" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#${gid})`} dot={false} activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }} animationDuration={500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {markers.length > 0 && (
        <div className="relative mr-[56px] mt-1 h-7">
          {markers.map((m) => {
            const pct = last === first ? 50 : ((m.day - first) / (last - first)) * 100;
            if (pct < 0 || pct > 100) return null;
            return (
              <button
                key={m.id}
                title={m.label}
                onClick={() => onMarkerClick?.(m.id)}
                className="absolute top-0 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-black/[0.15] bg-white text-[#606060] hover:border-[#0f0f0f] hover:text-[#0f0f0f]"
                style={{ left: `${pct}%` }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
