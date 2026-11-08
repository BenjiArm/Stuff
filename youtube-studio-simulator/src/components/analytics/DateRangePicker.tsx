import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, useMenu } from '../common/Popover';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { rangeOptions, resolveRange, type RangeKey } from '../../lib/ranges';
import { useStudio } from '../../store/StudioContext';
import { DATA_END, LAUNCH } from '../../data/analytics';
import { fromInputDate, toInputDate, addDays } from '../../lib/dates';

/** The Studio period selector ("11 Oct – 7 Nov 2026 / Last 28 days ▾"). */
export function DateRangePicker({ align = 'right' }: { align?: 'left' | 'right' }) {
  const { analyticsRange, customRange, setAnalyticsRange } = useStudio();
  const menu = useMenu();
  const range = resolveRange(analyticsRange, customRange);
  const [customOpen, setCustomOpen] = useState(false);
  const [from, setFrom] = useState(toInputDate(range.startDate < LAUNCH ? LAUNCH : range.startDate));
  const [to, setTo] = useState(toInputDate(range.endDate));
  const fromD = fromInputDate(from);
  const toD = fromInputDate(to);
  const valid = !!fromD && !!toD && fromD <= toD && fromD >= addDays(LAUNCH, -400) && toD <= DATA_END;

  return (
    <>
      <button ref={menu.ref} onClick={menu.toggle} className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-left hover:bg-black/[0.05]">
        <span>
          <span className="block text-xs leading-4 text-[#606060]">{range.dateLabel}</span>
          <span className="block text-[15px] font-medium leading-5 text-[#0f0f0f]">{range.label}</span>
        </span>
        <ChevronDown size={20} className="text-[#606060]" />
      </button>
      <Popover anchor={menu.ref} open={menu.open} onClose={menu.close} align={align} width={260}>
        {rangeOptions().map((o) =>
          'divider' in o ? (
            <div key={o.key} className="my-2 h-px bg-black/[0.1]" />
          ) : (
            <button
              key={o.key}
              onClick={() => {
                menu.close();
                if (o.key === 'custom') {
                  setCustomOpen(true);
                  return;
                }
                setAnalyticsRange(o.key as RangeKey);
              }}
              className={`flex h-10 w-full items-center gap-3 px-4 text-left text-sm hover:bg-black/[0.05] ${o.key === analyticsRange ? 'bg-black/[0.05]' : ''}`}
            >
              <span className="w-5">{o.key === analyticsRange && <Check size={18} />}</span>
              {o.label}
            </button>
          ),
        )}
      </Popover>
      <Modal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Custom date range"
        width={480}
        footer={
          <>
            <Button variant="text" onClick={() => setCustomOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!valid}
              onClick={() => {
                if (!fromD || !toD) return;
                setAnalyticsRange('custom', { start: fromD.getTime(), end: toD.getTime() });
                setCustomOpen(false);
              }}
            >
              Apply
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-[#606060]">Choose a start and end date. Daily data is available up to {DATA_END.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Start date', from, setFrom],
            ['End date', to, setTo],
          ].map(([label, value, set]) => (
            <label key={label as string} className="rounded-lg border border-black/[0.2] px-3 pb-2 pt-2 focus-within:border-[#065fd4]">
              <span className="block text-xs text-[#606060]">{label as string}</span>
              <input
                type="date"
                value={value as string}
                min={toInputDate(addDays(LAUNCH, -400))}
                max={toInputDate(DATA_END)}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
                className="mt-1 w-full bg-transparent text-[15px] outline-none"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ['First 30 days of the channel', toInputDate(LAUNCH), toInputDate(addDays(LAUNCH, 29))],
            ['Since monetisation', toInputDate(addDays(LAUNCH, 101)), toInputDate(DATA_END)],
            ['Last 14 days', toInputDate(addDays(DATA_END, -13)), toInputDate(DATA_END)],
          ].map(([label, a, b]) => (
            <button key={label} onClick={() => (setFrom(a), setTo(b))} className="rounded-lg bg-black/[0.05] px-3 py-1.5 text-[13px] font-medium hover:bg-black/[0.1]">
              {label}
            </button>
          ))}
        </div>
        {!valid && <p className="mt-3 text-xs text-[#cc0000]">Enter a valid range – the start date must be before the end date.</p>}
      </Modal>
    </>
  );
}
