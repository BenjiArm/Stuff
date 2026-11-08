import { memo, useId } from 'react';
import { renderScene, type SceneName } from './scenes';

export type PaletteName =
  | 'blood'
  | 'desert'
  | 'night'
  | 'storm'
  | 'ember'
  | 'gold'
  | 'teal'
  | 'ice'
  | 'purple'
  | 'sepia'
  | 'green'
  | 'dusk'
  | 'crimson'
  | 'ocean';

interface Palette {
  sky: [string, string, string];
  glow: string;
  ink: string;
  accent: string;
}

export const PALETTES: Record<PaletteName, Palette> = {
  blood: { sky: ['#1a0202', '#7a0b0b', '#ff5a1f'], glow: '#ffb347', ink: '#0b0303', accent: '#d81e1e' },
  desert: { sky: ['#1d1206', '#a65a17', '#f8c76d'], glow: '#fff1b8', ink: '#140b03', accent: '#e0a030' },
  night: { sky: ['#01040d', '#13294b', '#4f7fae'], glow: '#e8f1ff', ink: '#02050b', accent: '#7fb2e5' },
  storm: { sky: ['#06090d', '#26323f', '#7b8a96'], glow: '#f1f6ff', ink: '#05070a', accent: '#a3b8c8' },
  ember: { sky: ['#0b0000', '#4d0d05', '#e8551c'], glow: '#ffcf5a', ink: '#080101', accent: '#ff7a1a' },
  gold: { sky: ['#0f0a02', '#5c3d0c', '#e9b949'], glow: '#fff0b3', ink: '#0d0802', accent: '#f2c14e' },
  teal: { sky: ['#01100f', '#0b4842', '#5fb8a6'], glow: '#e2fff7', ink: '#010c0b', accent: '#32c5a8' },
  ice: { sky: ['#07121c', '#2f5d7d', '#bfe2f2'], glow: '#ffffff', ink: '#050d14', accent: '#8fd3ff' },
  purple: { sky: ['#0b0416', '#45175f', '#cf6fc9'], glow: '#ffd6f7', ink: '#08030f', accent: '#b154e0' },
  sepia: { sky: ['#160f08', '#634726', '#d8b07a'], glow: '#fff2d6', ink: '#110b05', accent: '#c48a3c' },
  green: { sky: ['#020d06', '#174526', '#8fc76c'], glow: '#f1ffd6', ink: '#020a04', accent: '#5fbf4a' },
  dusk: { sky: ['#120720', '#702845', '#f59e5b'], glow: '#ffe2b0', ink: '#0c0414', accent: '#f26b4b' },
  crimson: { sky: ['#0e0105', '#5a0718', '#c2183b'], glow: '#ffd1d9', ink: '#090003', accent: '#ff2d55' },
  ocean: { sky: ['#020815', '#0b3a63', '#2f8fc4'], glow: '#d8f3ff', ink: '#010611', accent: '#48b5ff' },
};

export interface ThumbSpec {
  scene: SceneName;
  palette: PaletteName;
  /** Main overlay text (upper-cased). Use '|' to break onto a second line. */
  text?: string;
  textColor?: 'white' | 'yellow' | 'red' | 'gold';
  font?: 'anton' | 'cinzel';
  align?: 'left' | 'right' | 'center';
  arrow?: boolean;
  circle?: boolean;
  question?: boolean;
  flip?: boolean;
}

const TEXT_COLORS = { white: '#ffffff', yellow: '#ffe14d', red: '#ff2b2b', gold: '#f5cf6b' };

interface Props {
  spec: ThumbSpec;
  className?: string;
  vertical?: boolean;
  title?: string;
}

function ThumbnailArt({ spec, className, vertical, title }: Props) {
  const raw = useId().replace(/:/g, '');
  const uid = `t${raw}`;
  const pal = PALETTES[spec.palette];
  const lines = (spec.text ?? '').toUpperCase().split('|').filter(Boolean);
  const color = TEXT_COLORS[spec.textColor ?? 'white'];
  const font = spec.font === 'cinzel' ? 'Cinzel, Georgia, serif' : 'Anton, Impact, sans-serif';
  const align = spec.align ?? 'left';

  const viewBox = vertical ? '437 0 405 720' : '0 0 1280 720';

  // Text layout (landscape)
  const fontSize = spec.font === 'cinzel' ? 104 : lines.some((l) => l.length > 11) ? 118 : 138;
  const lineGap = fontSize * 1.02;
  const tx = align === 'left' ? 60 : align === 'right' ? 1220 : 640;
  const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
  const ty0 = align === 'center' ? 120 : 140;

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={title ?? 'Video thumbnail'}
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.sky[0]} />
          <stop offset="55%" stopColor={pal.sky[1]} />
          <stop offset="100%" stopColor={pal.sky[2]} />
        </linearGradient>
        <radialGradient id={`${uid}-sunhalo`}>
          <stop offset="0%" stopColor={pal.glow} stopOpacity="0.75" />
          <stop offset="45%" stopColor={pal.glow} stopOpacity="0.22" />
          <stop offset="100%" stopColor={pal.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-dust`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.glow} stopOpacity="0" />
          <stop offset="100%" stopColor={pal.accent} stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={`${uid}-vig`} cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.85" />
        </filter>
      </defs>
      <rect x={0} y={0} width={1280} height={720} fill={`url(#${uid}-sky)`} />
      <g transform={spec.flip ? 'translate(1280 0) scale(-1 1)' : undefined}>
        {renderScene(spec.scene, { ink: pal.ink, glow: pal.glow, accent: pal.accent, uid })}
      </g>
      <rect x={0} y={0} width={1280} height={720} fill={`url(#${uid}-vig)`} />

      {spec.circle && !vertical && (
        <circle cx={align === 'right' ? 380 : 900} cy={400} r={150} fill="none" stroke="#ff1f1f" strokeWidth={16} filter={`url(#${uid}-shadow)`} />
      )}
      {spec.arrow && !vertical && (
        <g filter={`url(#${uid}-shadow)`} transform={align === 'right' ? 'translate(1280 0) scale(-1 1)' : undefined}>
          <path d="M520 470 C 600 470 660 440 720 380 L700 350 L800 330 L780 430 L755 405 C 690 480 610 520 520 520 Z" fill="#ff1f1f" stroke="#fff" strokeWidth={6} />
        </g>
      )}
      {spec.question && !vertical && (
        <text x={align === 'right' ? 200 : 1080} y={560} fontFamily="Anton, Impact, sans-serif" fontSize={380} fill="#ff2222" stroke="#000" strokeWidth={10} textAnchor="middle" filter={`url(#${uid}-shadow)`}>
          ?
        </text>
      )}

      {!vertical &&
        lines.map((line, i) => (
          <text
            key={i}
            x={tx}
            y={ty0 + fontSize * 0.82 + i * lineGap}
            fontFamily={font}
            fontWeight={spec.font === 'cinzel' ? 700 : 400}
            fontSize={fontSize}
            letterSpacing={spec.font === 'cinzel' ? 4 : 1}
            textAnchor={anchor}
            fill={i === 1 && spec.textColor === 'white' ? '#ffe14d' : color}
            stroke="#000"
            strokeWidth={spec.font === 'cinzel' ? 5 : 9}
            paintOrder="stroke"
            filter={`url(#${uid}-shadow)`}
          >
            {line}
          </text>
        ))}

      {vertical && lines.length > 0 && (
        <g>
          {lines.map((line, i) => (
            <text
              key={i}
              x={640}
              y={150 + i * 66}
              fontFamily={font}
              fontSize={line.length > 9 ? 50 : 62}
              textAnchor="middle"
              fill={i === 1 ? '#ffe14d' : color}
              stroke="#000"
              strokeWidth={6}
              paintOrder="stroke"
              filter={`url(#${uid}-shadow)`}
            >
              {line}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}

export const Thumbnail = memo(ThumbnailArt);
