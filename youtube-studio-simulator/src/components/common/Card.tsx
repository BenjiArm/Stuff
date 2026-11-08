import type { ReactNode } from 'react';

export function Card({ children, className = '', padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <section className={`rounded-xl border border-black/[0.1] bg-white ${padded ? 'p-6' : ''} ${className}`}>{children}</section>;
}

export function CardTitle({ children, subtitle, action }: { children: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="text-[18px] font-medium leading-6 text-[#0f0f0f]">{children}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-[#606060]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-black/[0.1] ${className}`} />;
}

export function EmptyState({ art, title, body, action }: { art?: ReactNode; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {art}
      <p className="mt-6 text-[15px] font-medium text-[#0f0f0f]">{title}</p>
      {body && <p className="mt-2 max-w-md text-sm leading-5 text-[#606060]">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Simple illustration used by empty states. */
export function EmptyArt({ kind = 'box' }: { kind?: 'box' | 'live' | 'search' | 'podcast' | 'mail' }) {
  const accent = { box: '#ffd166', live: '#ff6b6b', search: '#74b9ff', podcast: '#a29bfe', mail: '#55efc4' }[kind];
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" aria-hidden>
      <ellipse cx="80" cy="108" rx="58" ry="7" fill="#eeeeee" />
      <rect x="34" y="30" width="92" height="66" rx="10" fill="#f4f4f4" stroke="#d6d6d6" strokeWidth="2" />
      <rect x="46" y="44" width="40" height="8" rx="4" fill="#dcdcdc" />
      <rect x="46" y="58" width="62" height="6" rx="3" fill="#e5e5e5" />
      <rect x="46" y="70" width="52" height="6" rx="3" fill="#e5e5e5" />
      <circle cx="116" cy="34" r="16" fill={accent} />
      <path d="M110 34 l4 4 l8 -8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
