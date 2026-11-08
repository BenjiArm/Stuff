import type { SVGProps } from 'react';

/** Studio-style navigation icons with outlined (idle) and filled (selected) variants. */
export type NavIconName =
  | 'dashboard'
  | 'content'
  | 'analytics'
  | 'community'
  | 'subtitles'
  | 'copyright'
  | 'earn'
  | 'customisation'
  | 'audio'
  | 'settings'
  | 'feedback'
  | 'details'
  | 'editor'
  | 'clips';

interface Props extends SVGProps<SVGSVGElement> {
  name: NavIconName;
  active?: boolean;
  size?: number;
}

export function NavIcon({ name, active, size = 24, ...rest }: Props) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...rest };
  const f = active ? 'currentColor' : 'none';
  const inner = active ? '#fff' : 'currentColor';
  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          {[[3.5, 3.5], [13.5, 3.5], [3.5, 13.5], [13.5, 13.5]].map(([x, y]) => (
            <rect key={`${x}${y}`} x={x} y={y} width={7} height={7} rx={1.6} fill={f} />
          ))}
        </svg>
      );
    case 'content':
      return (
        <svg {...common}>
          <rect x={3.5} y={4} width={17} height={12.5} rx={2} fill={f} />
          <path d="M10 7.6v5.3l4.4-2.65z" fill={inner} stroke={active ? '#fff' : 'currentColor'} strokeWidth={1.2} />
          <path d="M6.5 20h11" />
        </svg>
      );
    case 'analytics':
      return (
        <svg {...common}>
          <rect x={3.5} y={3.5} width={17} height={17} rx={2} fill={f} />
          <path d="M8 16.5v-4M12 16.5v-9M16 16.5v-6" stroke={inner} strokeWidth={1.8} />
        </svg>
      );
    case 'community':
      return (
        <svg {...common}>
          <path d="M4.5 4h15a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1H8.2L3.5 20V5a1 1 0 0 1 1-1z" fill={f} />
          <path d="M7.5 8.5h9M7.5 12h6" stroke={inner} />
        </svg>
      );
    case 'subtitles':
      return (
        <svg {...common}>
          <rect x={3} y={5} width={18} height={14} rx={2} fill={f} />
          <path d="M6.5 11.5h3M11.5 11.5h6M6.5 15h7M15.5 15h2" stroke={inner} />
        </svg>
      );
    case 'copyright':
      return (
        <svg {...common}>
          <circle cx={12} cy={12} r={8.6} fill={f} />
          <path d="M14.7 9.6a3.6 3.6 0 1 0 0 4.8" stroke={inner} strokeWidth={1.8} />
        </svg>
      );
    case 'earn':
      return (
        <svg {...common}>
          <circle cx={12} cy={12} r={8.6} fill={f} />
          <path d="M14.6 9.3c-.4-.9-1.4-1.5-2.6-1.5-1.5 0-2.6.8-2.6 2 0 2.6 5.3 1.4 5.3 4.2 0 1.2-1.1 2.1-2.7 2.1-1.3 0-2.3-.6-2.7-1.6M12 6.3v1.5M12 16.1v1.6" stroke={inner} strokeWidth={1.6} />
        </svg>
      );
    case 'customisation':
      return (
        <svg {...common}>
          <path d="M4 20 15 9" strokeWidth={active ? 2.6 : 1.8} />
          <path d="M14 10l2-2" strokeWidth={active ? 2.6 : 1.8} />
          <path d="M17.5 3.5v3M16 5h3M20 9.5v2M19 10.5h2M11 3v2M10 4h2" strokeWidth={1.4} />
        </svg>
      );
    case 'audio':
      return (
        <svg {...common}>
          <rect x={3.5} y={3.5} width={17} height={17} rx={2} fill={f} />
          <circle cx={10} cy={15} r={2} stroke={inner} fill={active ? '#fff' : 'none'} />
          <path d="M12 15V7.5l4 1.3" stroke={inner} />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <path
            d="M10.3 3.5h3.4l.5 2.3 1.4.8 2.2-.8 1.7 2.9-1.7 1.6v1.4l1.7 1.6-1.7 2.9-2.2-.8-1.4.8-.5 2.3h-3.4l-.5-2.3-1.4-.8-2.2.8-1.7-2.9 1.7-1.6v-1.4L4.5 8.7l1.7-2.9 2.2.8 1.4-.8z"
            fill={f}
          />
          <circle cx={12} cy={12} r={2.6} stroke={inner} fill={active ? '#fff' : 'none'} />
        </svg>
      );
    case 'feedback':
      return (
        <svg {...common}>
          <path d="M4.5 4h15a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1H8.2L3.5 20V5a1 1 0 0 1 1-1z" fill={f} />
          <path d="M12 7.5v4" stroke={inner} strokeWidth={1.8} />
          <circle cx={12} cy={13.8} r={0.4} stroke={inner} strokeWidth={1.4} />
        </svg>
      );
    case 'details':
      return (
        <svg {...common}>
          <path d="M14.5 4.5l5 5L9 20H4v-5z" fill={f} />
          <path d="M12.5 6.5l5 5" stroke={inner} />
        </svg>
      );
    case 'editor':
      return (
        <svg {...common}>
          <rect x={3.5} y={5} width={17} height={14} rx={1.5} fill={f} />
          <path d="M7 5v14M17 5v14M3.5 9h3.5M3.5 15h3.5M17 9h3.5M17 15h3.5" stroke={inner} />
        </svg>
      );
    case 'clips':
      return (
        <svg {...common}>
          <circle cx={7} cy={7} r={2.6} fill={f} />
          <circle cx={7} cy={17} r={2.6} fill={f} />
          <path d="M9 8.5 20 17M9 15.5 20 7" />
        </svg>
      );
  }
}

export function YouTubeStudioLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`}>
      <svg width="30" height="21" viewBox="0 0 30 21" aria-hidden>
        <path d="M29.4 3.3A3.8 3.8 0 0 0 26.7.6C24.4 0 15 0 15 0S5.6 0 3.3.6A3.8 3.8 0 0 0 .6 3.3C0 5.6 0 10.5 0 10.5s0 4.9.6 7.2a3.8 3.8 0 0 0 2.7 2.7c2.3.6 11.7.6 11.7.6s9.4 0 11.7-.6a3.8 3.8 0 0 0 2.7-2.7c.6-2.3.6-7.2.6-7.2s0-4.9-.6-7.2z" fill="#ff0000" />
        <path d="M12 15l7.8-4.5L12 6z" fill="#fff" />
      </svg>
      <span className="text-[21px] font-medium tracking-[-0.6px] text-[#0f0f0f]" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>
        Studio
      </span>
    </span>
  );
}

/** Monetisation status icon ($ in a circle, coloured). */
export function MonetisationIcon({ status, size = 20 }: { status: 'on' | 'limited' | 'off' | 'claimed'; size?: number }) {
  const color = status === 'on' ? '#2ba640' : status === 'limited' ? '#f9a825' : status === 'claimed' ? '#909090' : '#909090';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx={12} cy={12} r={10} fill={status === 'off' ? 'none' : color} stroke={color} strokeWidth={status === 'off' ? 1.8 : 0} />
      <path d="M14.6 9.3c-.4-.9-1.4-1.5-2.6-1.5-1.5 0-2.6.8-2.6 2 0 2.6 5.3 1.4 5.3 4.2 0 1.2-1.1 2.1-2.7 2.1-1.3 0-2.3-.6-2.7-1.6M12 6.3v1.5M12 16.1v1.6" stroke={status === 'off' ? color : '#fff'} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {status === 'off' && <path d="M4.5 4.5l15 15" stroke={color} strokeWidth={1.8} />}
    </svg>
  );
}
