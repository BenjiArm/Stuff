import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, ComposedChart, Legend } from 'recharts';
import type { ReactNode } from 'react';
import { formatTime, formatDateShort } from '../../lib/format';

/** Realtime-style hourly bars. */
export function HourlyBars({ hours, height = 64, color = '#2793e8' }: { hours: { hourStart: number; views: number }[]; height?: number; color?: string }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={hours} margin={{ top: 2, right: 0, bottom: 0, left: 0 }} barCategoryGap={1.5}>
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { hourStart: number; views: number };
              const end = p.hourStart + 3_600_000;
              return (
                <div className="rounded bg-[#616161] px-2 py-1.5 text-xs text-white shadow">
                  <div>{formatDateShort(p.hourStart)}, {formatTime(p.hourStart)} – {formatTime(end)}</div>
                  <div className="font-medium">{p.views.toLocaleString('en-GB')} views</div>
                </div>
              );
            }}
          />
          <Bar dataKey="views" isAnimationActive={false} radius={[1, 1, 0, 0]}>
            {hours.map((h, i) => (
              <Cell key={h.hourStart} fill={i === hours.length - 1 ? '#7fbdf0' : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HBarList({ rows, valueFormat = (v) => `${v.toFixed(1)}%`, max, onRowClick, color = '#2793e8' }: { rows: { label: ReactNode; value: number; key?: string; sub?: ReactNode }[]; valueFormat?: (v: number) => string; max?: number; onRowClick?: (i: number) => void; color?: string }) {
  const m = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="flex flex-col">
      {rows.map((r, i) => (
        <div key={r.key ?? i} onClick={() => onRowClick?.(i)} className={`group py-2 ${onRowClick ? 'cursor-pointer' : ''}`}>
          <div className="flex items-baseline gap-3 text-sm">
            <span className={`min-w-0 flex-1 truncate text-[#0f0f0f] ${onRowClick ? 'group-hover:underline' : ''}`}>{r.label}</span>
            {r.sub && <span className="text-xs text-[#606060]">{r.sub}</span>}
            <span className="tabular w-14 shrink-0 text-right text-[#0f0f0f]">{valueFormat(r.value)}</span>
          </div>
          <div className="mt-1.5 h-1 w-full rounded-full bg-black/[0.05]">
            <div className="h-1 rounded-full transition-[width] duration-500" style={{ width: `${Math.max(0.5, (r.value / m) * 100)}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export const DONUT_COLORS = ['#2793e8', '#9c27b0', '#f9a825', '#43a047', '#ef6c00', '#7cb342', '#00acc1', '#8d6e63'];

export function Donut({ data, size = 160, centre }: { data: { label: string; value: number }[]; size?: number; centre?: ReactNode }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={size * 0.32} outerRadius={size * 0.48} paddingAngle={1} stroke="none" startAngle={90} endAngle={-270} animationDuration={500}>
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded bg-[#616161] px-2 py-1 text-xs text-white">{`${payload[0].name}: ${(payload[0].value as number).toFixed(1)}%`}</div>
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      {centre && <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">{centre}</div>}
    </div>
  );
}

export function SimpleBars({ data, format, height = 220, color = '#2793e8', highlightLast }: { data: { label: string; value: number; sub?: string }[]; format: (v: number) => string; height?: number; color?: string; highlightLast?: boolean }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={{ stroke: '#909090' }} interval={0} />
          <YAxis orientation="right" tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={false} tickFormatter={format} width={56} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { label: string; value: number; sub?: string };
              return (
                <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-menu">
                  <div className="text-xs text-[#606060]">{p.sub ?? p.label}</div>
                  <div className="mt-0.5 font-medium">{format(p.value)}</div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={44} animationDuration={500}>
            {data.map((_, i) => (
              <Cell key={i} fill={highlightLast && i === data.length - 1 ? color : highlightLast ? '#9fcdf3' : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Combined bars (revenue) + line (subscribers) used for the channel growth journey. */
export function GrowthComboChart({ data, height = 280 }: { data: { label: string; revenue: number; subscribers: number; sub: string }[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={{ stroke: '#909090' }} />
          <YAxis yAxisId="subs" orientation="left" tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : String(v))} />
          <YAxis yAxisId="rev" orientation="right" tick={{ fontSize: 12, fill: '#606060' }} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => `£${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { label: string; revenue: number; subscribers: number; sub: string };
              return (
                <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-menu">
                  <div className="text-xs text-[#606060]">{p.sub}</div>
                  <div className="mt-1 flex justify-between gap-6"><span className="text-[#606060]">Subscribers</span><span className="font-medium">{p.subscribers.toLocaleString('en-GB')}</span></div>
                  <div className="flex justify-between gap-6"><span className="text-[#606060]">Estimated revenue</span><span className="font-medium">£{p.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                </div>
              );
            }}
          />
          <Legend verticalAlign="top" align="left" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13, color: '#606060' }} />
          <Bar yAxisId="rev" dataKey="revenue" name="Estimated revenue" fill="#9fcdf3" radius={[2, 2, 0, 0]} maxBarSize={38} animationDuration={500} />
          <Line yAxisId="subs" type="monotone" dataKey="subscribers" name="Subscribers" stroke="#cc0000" strokeWidth={2.5} dot={{ r: 3, fill: '#cc0000' }} animationDuration={500} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
