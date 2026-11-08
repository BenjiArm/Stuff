import { memo, useId } from 'react';

export function LetterAvatar({ name, color, size = 40, className = '' }: { name: string; color: string; size?: number; className?: string }) {
  const letter = (name.replace(/^@/, '').trim()[0] ?? '?').toUpperCase();
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium text-white ${className}`}
      style={{ width: size, height: size, background: color, fontSize: size * 0.45 }}
      aria-hidden
    >
      {letter}
    </span>
  );
}

const AVATAR_STYLES = [
  { bg: ['#1b1208', '#3d2a10'], fg: '#e9c46a', ring: '#c99a3b' },
  { bg: ['#14060a', '#5a0f1d'], fg: '#f4d58d', ring: '#d4a548' },
  { bg: ['#06121c', '#173a5c'], fg: '#e6eef7', ring: '#8fb4d9' },
  { bg: ['#0d0d0d', '#2b2b2b'], fg: '#ff4e45', ring: '#ff4e45' },
];

export const AVATAR_STYLE_COUNT = AVATAR_STYLES.length;

/** The channel's logo: a classical column inside a laurel ring. */
function ChannelAvatarArt({ size = 40, styleIndex = 0, className = '' }: { size?: number; styleIndex?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const s = AVATAR_STYLES[styleIndex % AVATAR_STYLES.length];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`shrink-0 rounded-full ${className}`} aria-label="Channel avatar" role="img">
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={s.bg[1]} />
          <stop offset="100%" stopColor={s.bg[0]} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${id}-bg)`} />
      {/* laurel */}
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (200 + i * 19) * (Math.PI / 180);
        const x = 50 + Math.cos(a) * 33;
        const y = 52 + Math.sin(a) * 33;
        return <ellipse key={`l${i}`} cx={x} cy={y} rx="3.4" ry="7" transform={`rotate(${(a * 180) / Math.PI + 90 - 30} ${x} ${y})`} fill={s.ring} />;
      })}
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (-20 - i * 19) * (Math.PI / 180);
        const x = 50 + Math.cos(a) * 33;
        const y = 52 - Math.sin(a) * 33 * -1;
        return <ellipse key={`r${i}`} cx={x} cy={y} rx="3.4" ry="7" transform={`rotate(${(a * 180) / Math.PI + 90 + 30} ${x} ${y})`} fill={s.ring} />;
      })}
      {/* column */}
      <path d="M33 34 L50 25 L67 34 Z" fill={s.fg} />
      <rect x="32" y="34" width="36" height="4" fill={s.fg} />
      {[36, 44, 52, 60].map((x) => (
        <rect key={x} x={x} y="40" width="4.5" height="24" fill={s.fg} />
      ))}
      <rect x="32" y="65" width="36" height="4" fill={s.fg} />
      <rect x="29" y="70" width="42" height="4" fill={s.fg} />
    </svg>
  );
}
export const ChannelAvatar = memo(ChannelAvatarArt);

const BANNERS = [
  { sky: ['#120a02', '#6b3e0e', '#e3a948'], ink: '#0d0702' },
  { sky: ['#0a0210', '#4a1238', '#d8695a'], ink: '#0a0208' },
  { sky: ['#020812', '#14365a', '#6aa6d6'], ink: '#020611' },
];
export const BANNER_COUNT = BANNERS.length;

function ChannelBannerArt({ styleIndex = 0, name = 'The Past Explained', className = '' }: { styleIndex?: number; name?: string; className?: string }) {
  const id = useId().replace(/:/g, '');
  const b = BANNERS[styleIndex % BANNERS.length];
  return (
    <svg viewBox="0 0 2048 340" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Channel banner" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={b.sky[0]} />
          <stop offset="0.6" stopColor={b.sky[1]} />
          <stop offset="1" stopColor={b.sky[2]} />
        </linearGradient>
      </defs>
      <rect width="2048" height="340" fill={`url(#${id}-s)`} />
      <circle cx="1560" cy="250" r="90" fill={b.sky[2]} opacity="0.9" />
      <path d="M0 340 L0 280 L120 280 L120 230 L150 230 L150 280 L260 280 L330 200 L400 280 L520 280 L520 250 L560 250 L560 280 L1300 280 L1380 160 L1460 280 L1520 280 L1560 230 L1600 280 L1700 280 L1700 210 L1730 210 L1730 280 L2048 280 L2048 340 Z" fill={b.ink} />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={1780 + i * 26} y={200 + ((i * 13) % 50)} width="14" height={80 - ((i * 13) % 50)} fill={b.ink} />
      ))}
      <text x="1024" y="170" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="56" letterSpacing="4" fill="#f6e7c1" stroke="#000" strokeWidth="2" paintOrder="stroke">
        {name.toUpperCase()}
      </text>
      <text x="1024" y="212" textAnchor="middle" fontFamily="Roboto, Arial, sans-serif" fontSize="22" letterSpacing="4" fill="#f6e7c1" opacity="0.85">
        NEW HISTORY DOCUMENTARY EVERY WEEK
      </text>
    </svg>
  );
}
export const ChannelBanner = memo(ChannelBannerArt);
