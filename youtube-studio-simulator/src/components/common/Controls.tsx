import { useId, useRef, useState, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Popover } from './Popover';

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full transition-colors duration-150 disabled:opacity-40 ${checked ? 'bg-[#065fd4]' : 'bg-[#bdbdbd]'}`}
    >
      <span
        className={`absolute left-[3px] h-4 w-4 rounded-full bg-white shadow transition-transform duration-150 ${checked ? 'translate-x-[18px]' : ''}`}
      />
    </button>
  );
}

export function Checkbox({ checked, onChange, label, indeterminate, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; indeterminate?: boolean; disabled?: boolean }) {
  return (
    <label className={`inline-flex cursor-pointer select-none items-center gap-3 text-sm ${disabled ? 'opacity-40' : ''}`} onClick={(e) => e.stopPropagation()}>
      <span
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        tabIndex={0}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), onChange(!checked))}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border-2 transition-colors ${
          checked || indeterminate ? 'border-[#0f0f0f] bg-[#0f0f0f]' : 'border-[#606060] bg-white hover:border-[#0f0f0f]'
        }`}
      >
        {indeterminate ? <span className="h-0.5 w-2.5 bg-white" /> : checked ? <Check size={14} strokeWidth={3.5} className="text-white" /> : null}
      </span>
      {label && <span onClick={() => !disabled && onChange(!checked)}>{label}</span>}
    </label>
  );
}

export function Radio({ checked, onChange, label, description, name }: { checked: boolean; onChange: () => void; label: ReactNode; description?: ReactNode; name: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5 text-sm">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-[#0f0f0f]' : 'border-[#606060]'}`}>
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-[#0f0f0f]" />}
      </span>
      <span>
        <span className="block text-[#0f0f0f]">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-5 text-[#606060]">{description}</span>}
      </span>
    </label>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  helper?: ReactNode;
  rows?: number;
  required?: boolean;
  error?: string;
}

/** Studio-style outlined field with the label inside the border (used for title/description). */
export function TextAreaField({ label, value, onChange, maxLength, helper, rows = 2, required, error, ...rest }: TextAreaFieldProps) {
  const id = useId();
  const [focus, setFocus] = useState(false);
  const over = maxLength ? value.length > maxLength : false;
  const invalid = !!error || over || (required && !value.trim());
  return (
    <div>
      <div
        className={`rounded-lg border px-3 pb-2 pt-2 transition-colors ${
          invalid ? 'border-[#cc0000]' : focus ? 'border-[#065fd4] shadow-[0_0_0_1px_#065fd4]' : 'border-black/[0.2] hover:border-[#606060]'
        }`}
      >
        <label htmlFor={id} className={`block text-xs ${invalid ? 'text-[#cc0000]' : 'text-[#606060]'}`}>
          {label}
          {required && ' (required)'}
        </label>
        <textarea
          id={id}
          value={value}
          rows={rows}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full resize-none bg-transparent text-[15px] leading-6 text-[#0f0f0f] outline-none placeholder:text-[#909090]"
          {...rest}
        />
        {maxLength !== undefined && (
          <div className={`mt-1 text-right text-xs ${over ? 'text-[#cc0000]' : 'text-[#606060]'}`}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      {(error || helper) && <div className={`mt-1.5 px-1 text-xs ${error ? 'text-[#cc0000]' : 'text-[#606060]'}`}>{error ?? helper}</div>}
    </div>
  );
}

export function InputField({ label, value, onChange, placeholder, type = 'text', helper, prefix, className = '' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; helper?: ReactNode; prefix?: string; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <div className="rounded-lg border border-black/[0.2] px-3 pb-1.5 pt-2 transition-colors focus-within:border-[#065fd4] focus-within:shadow-[0_0_0_1px_#065fd4] hover:border-[#606060]">
        <label htmlFor={id} className="block text-xs text-[#606060]">
          {label}
        </label>
        <div className="flex items-center">
          {prefix && <span className="mr-0.5 text-[15px] text-[#606060]">{prefix}</span>}
          <input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="block h-7 w-full bg-transparent text-[15px] text-[#0f0f0f] outline-none placeholder:text-[#909090]"
          />
        </div>
      </div>
      {helper && <div className="mt-1.5 px-1 text-xs text-[#606060]">{helper}</div>}
    </div>
  );
}

interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

/** Outlined dropdown (Studio's "Visibility", "Category" style selects). */
export function SelectField<T extends string>({ label, value, options, onChange, className = '', compact }: { label?: string; value: T; options: SelectOption<T>[]; onChange: (v: T) => void; className?: string; compact?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <div className={className}>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center rounded-lg border px-3 text-left transition-colors ${open ? 'border-[#065fd4] shadow-[0_0_0_1px_#065fd4]' : 'border-black/[0.2] hover:border-[#606060]'} ${compact ? 'h-10' : 'min-h-[56px] py-2'}`}
      >
        <span className="min-w-0 flex-1">
          {label && !compact && <span className="block text-xs text-[#606060]">{label}</span>}
          <span className="block truncate text-[15px] text-[#0f0f0f]">{current?.label ?? value}</span>
        </span>
        <ChevronDown size={20} className="ml-2 shrink-0 text-[#606060]" />
      </button>
      <Popover anchor={ref} open={open} onClose={() => setOpen(false)} width={ref.current?.offsetWidth} className="max-h-[320px] overflow-y-auto">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              onChange(o.value);
              setOpen(false);
            }}
            className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-black/[0.05] ${o.value === value ? 'bg-black/[0.05]' : ''}`}
          >
            <span className="block text-[#0f0f0f]">{o.label}</span>
            {o.description && <span className="mt-0.5 block text-xs text-[#606060]">{o.description}</span>}
          </button>
        ))}
      </Popover>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className = '' }: { tabs: { value: T; label: string; badge?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={`flex gap-0 overflow-x-auto border-b border-black/[0.1] no-scrollbar ${className}`} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={`relative mr-2 flex h-12 shrink-0 items-center gap-2 px-3 text-[15px] font-medium transition-colors ${active ? 'text-[#0f0f0f]' : 'text-[#606060] hover:text-[#0f0f0f]'}`}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="rounded-full bg-black/[0.08] px-1.5 text-xs font-medium text-[#0f0f0f]">{t.badge}</span>
            )}
            <span className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t transition-colors ${active ? 'bg-[#0f0f0f]' : 'bg-transparent'}`} />
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ active, children, onClick, onRemove }: { active?: boolean; children: ReactNode; onClick?: () => void; onRemove?: () => void }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`inline-flex h-8 cursor-pointer select-none items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors ${
        active ? 'bg-[#0f0f0f] text-white' : 'bg-black/[0.05] text-[#0f0f0f] hover:bg-black/[0.1]'
      }`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove filter"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 ml-1 rounded-full p-0.5 hover:bg-black/10"
        >
          ×
        </button>
      )}
    </span>
  );
}
