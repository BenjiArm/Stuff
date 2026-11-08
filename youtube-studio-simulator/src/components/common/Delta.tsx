import { ArrowDown, ArrowUp } from 'lucide-react';
import { Tooltip } from './Tooltip';

/** Green/red circular arrow used next to metric values (vs. previous period). */
export function DeltaIcon({ pct, compareLabel, size = 18 }: { pct: number | null; compareLabel?: string; size?: number }) {
  if (pct === null || !isFinite(pct) || Math.abs(pct) < 0.5) {
    return null;
  }
  const up = pct > 0;
  const text = `${Math.abs(pct) >= 999 ? '999+' : Math.abs(pct).toFixed(0)}% ${up ? 'more' : 'less'} than ${compareLabel ?? 'previous period'}`;
  return (
    <Tooltip content={text}>
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full ${up ? 'bg-[#2ba640]' : 'bg-[#cc0000]'}`}
        style={{ width: size, height: size }}
        aria-label={text}
      >
        {up ? <ArrowUp size={size * 0.72} strokeWidth={3} className="text-white" /> : <ArrowDown size={size * 0.72} strokeWidth={3} className="text-white" />}
      </span>
    </Tooltip>
  );
}

export function DeltaText({ pct, compareLabel }: { pct: number | null; compareLabel: string }) {
  if (pct === null || !isFinite(pct)) return <span className="text-[13px] text-[#606060]">No data for {compareLabel}</span>;
  if (Math.abs(pct) < 0.5) return <span className="text-[13px] text-[#606060]">About the same as {compareLabel}</span>;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[13px] ${up ? 'text-[#2ba640]' : 'text-[#cc0000]'}`}>
      {up ? <ArrowUp size={14} strokeWidth={2.5} /> : <ArrowDown size={14} strokeWidth={2.5} />}
      {Math.abs(pct) >= 999 ? '999+' : Math.abs(pct).toFixed(0)}% <span className="text-[#606060]">{up ? 'more' : 'less'} than {compareLabel}</span>
    </span>
  );
}
