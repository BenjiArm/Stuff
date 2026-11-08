import type { ReactNode } from 'react';

/**
 * Silhouette scenes for the procedural documentary thumbnails.
 * Every scene is drawn in a 1280×720 coordinate space.
 */
export type SceneName =
  | 'pyramids'
  | 'colosseum'
  | 'temple'
  | 'castle'
  | 'longship'
  | 'helmet'
  | 'skull'
  | 'ruins'
  | 'army'
  | 'swords'
  | 'map'
  | 'plague'
  | 'crown'
  | 'moai'
  | 'stepPyramid'
  | 'storm'
  | 'stonehenge'
  | 'volcano'
  | 'burningCity'
  | 'torii'
  | 'sphinx'
  | 'galleon'
  | 'shield'
  | 'forest'
  | 'emu'
  | 'town'
  | 'library'
  | 'scroll'
  | 'fortress'
  | 'lighthouse';

export interface SceneProps {
  ink: string; // silhouette colour
  glow: string; // light colour (sun, fire, highlights)
  accent: string; // secondary accent
  uid: string;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function Ground({ ink, y = 620, wobble = 18 }: { ink: string; y?: number; wobble?: number }) {
  return (
    <path
      d={`M0 ${y} C 200 ${y - wobble} 420 ${y + wobble} 640 ${y - 4} S 1080 ${y - wobble} 1280 ${y + 6} L1280 720 L0 720 Z`}
      fill={ink}
    />
  );
}

function Sun({ cx, cy, r, glow, uid }: { cx: number; cy: number; r: number; glow: string; uid: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 2.4} fill={`url(#${uid}-sunhalo)`} />
      <circle cx={cx} cy={cy} r={r} fill={glow} opacity={0.95} />
    </g>
  );
}

const scenes: Record<SceneName, (p: SceneProps) => ReactNode> = {
  pyramids: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={790} cy={300} r={110} glow={glow} uid={uid} />
      <path d="M300 630 L560 250 L820 630 Z" fill={ink} />
      <path d="M560 250 L820 630 L640 630 Z" fill="#000" opacity={0.35} />
      <path d="M700 630 L900 340 L1100 630 Z" fill={ink} opacity={0.92} />
      <path d="M900 340 L1100 630 L960 630 Z" fill="#000" opacity={0.3} />
      <path d="M80 640 L210 450 L340 640 Z" fill={ink} opacity={0.85} />
      <path d="M0 640 C 260 590 520 660 760 615 S 1120 600 1280 630 L1280 720 L0 720 Z" fill={ink} />
    </g>
  ),
  colosseum: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={640} cy={250} r={90} glow={glow} uid={uid} />
      <path d="M170 640 L170 300 Q 640 230 1110 300 L1110 640 Z" fill={ink} />
      <path d="M760 248 Q 940 262 1110 300 L1110 440 L980 470 L900 400 L820 430 Z" fill="#000" opacity={0.0} />
      {range(3).map((row) =>
        range(11).map((i) => {
          const x = 205 + i * 80;
          const y = 330 + row * 100;
          return <rect key={`${row}-${i}`} x={x} y={y} width={44} height={70} rx={22} fill={glow} opacity={0.55 - row * 0.12} />;
        }),
      )}
      <rect x={170} y={300} width={940} height={12} fill={ink} />
      <rect x={170} y={410} width={940} height={10} fill={ink} />
      <rect x={170} y={510} width={940} height={10} fill={ink} />
      {/* crumbled top right */}
      <path d="M860 262 L900 230 L940 258 L990 222 L1040 262 L1110 250 L1110 300 Q 960 268 860 262 Z" fill={ink} />
      <Ground ink={ink} y={630} wobble={6} />
    </g>
  ),
  temple: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={980} cy={240} r={80} glow={glow} uid={uid} />
      <path d="M300 300 L640 170 L980 300 Z" fill={ink} />
      <rect x={290} y={300} width={700} height={36} fill={ink} />
      {range(8).map((i) => (
        <g key={i}>
          <rect x={320 + i * 86} y={336} width={44} height={230} fill={ink} />
          <rect x={312 + i * 86} y={336} width={60} height={14} fill={ink} />
          <rect x={312 + i * 86} y={552} width={60} height={14} fill={ink} />
        </g>
      ))}
      <rect x={270} y={566} width={740} height={22} fill={ink} />
      <rect x={240} y={588} width={800} height={22} fill={ink} />
      <rect x={210} y={610} width={860} height={22} fill={ink} />
      <Ground ink={ink} y={628} wobble={4} />
    </g>
  ),
  castle: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={300} cy={220} r={70} glow={glow} uid={uid} />
      <path d="M0 640 L0 560 Q 300 470 640 520 Q 980 470 1280 540 L1280 720 L0 720 Z" fill={ink} />
      <rect x={430} y={300} width={420} height={260} fill={ink} />
      {range(8).map((i) => (
        <rect key={i} x={430 + i * 54} y={276} width={30} height={30} fill={ink} />
      ))}
      <rect x={340} y={230} width={110} height={340} fill={ink} />
      <path d="M330 232 L395 120 L460 232 Z" fill={ink} />
      <rect x={830} y={210} width={120} height={360} fill={ink} />
      <path d="M820 212 L890 90 L960 212 Z" fill={ink} />
      <rect x={590} y={180} width={100} height={140} fill={ink} />
      {range(3).map((i) => (
        <rect key={i} x={590 + i * 38} y={160} width={24} height={26} fill={ink} />
      ))}
      <path d="M590 560 L590 470 Q 640 420 690 470 L690 560 Z" fill={glow} opacity={0.75} />
      <rect x={378} y={300} width={16} height={34} rx={8} fill={glow} opacity={0.8} />
      <rect x={880} y={290} width={16} height={34} rx={8} fill={glow} opacity={0.8} />
      <rect x={630} y={220} width={16} height={34} rx={8} fill={glow} opacity={0.8} />
      <path d="M890 90 L890 40 L940 55 L890 70" fill={glow} />
    </g>
  ),
  longship: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={900} cy={330} r={100} glow={glow} uid={uid} />
      <path d="M560 160 L560 470" stroke={ink} strokeWidth={14} />
      <path d="M380 190 L740 190 L760 450 L360 450 Z" fill={ink} />
      {range(5).map((i) => (
        <rect key={i} x={380 + i * 76} y={190} width={36} height={260} fill={glow} opacity={0.18} />
      ))}
      <path d="M220 470 L960 470 C 930 540 840 580 590 580 C 380 580 270 545 220 470 Z" fill={ink} />
      <path d="M960 470 C 1010 440 1020 380 990 340 C 1040 340 1060 380 1050 420 C 1040 460 1010 480 960 480 Z" fill={ink} />
      <path d="M220 470 C 170 430 180 380 220 360 C 230 400 240 440 260 470 Z" fill={ink} />
      {range(9).map((i) => (
        <circle key={i} cx={300 + i * 72} cy={492} r={20} fill={ink} stroke={glow} strokeWidth={3} opacity={0.95} />
      ))}
      <path d="M0 600 Q 80 570 160 600 T 320 600 T 480 600 T 640 600 T 800 600 T 960 600 T 1120 600 T 1280 600 L1280 720 L0 720 Z" fill={ink} />
      <path d="M0 640 Q 80 610 160 640 T 320 640 T 480 640 T 640 640 T 800 640 T 960 640 T 1120 640 T 1280 640" stroke={glow} strokeWidth={3} fill="none" opacity={0.35} />
    </g>
  ),
  helmet: ({ ink, glow, accent }) => (
    <g>
      <path d="M640 150 C 560 60 470 70 430 120 C 520 100 590 120 640 190 C 690 120 760 100 850 120 C 810 70 720 60 640 150 Z" fill={accent} />
      <path d="M640 170 C 480 170 440 300 450 420 L462 590 C 510 640 580 650 612 640 L612 455 L668 455 L668 640 C 700 650 770 640 818 590 L830 420 C 840 300 800 170 640 170 Z" fill={ink} />
      <path d="M500 368 L612 380 L612 455 L668 455 L668 380 L780 368 L770 410 L668 420 L668 640 L612 640 L612 420 L510 410 Z" fill={glow} opacity={0.9} />
      <path d="M640 170 C 760 175 820 260 830 380" stroke={glow} strokeWidth={6} fill="none" opacity={0.35} />
      <path d="M0 720 L0 640 Q 640 560 1280 640 L1280 720 Z" fill={ink} />
    </g>
  ),
  skull: ({ ink, glow, accent }) => (
    <g>
      <circle cx={640} cy={330} r={190} fill={accent} opacity={0.15} />
      <path d="M640 150 C 500 150 430 250 440 360 C 445 420 480 455 500 470 L505 540 L775 540 L780 470 C 800 455 835 420 840 360 C 850 250 780 150 640 150 Z" fill={ink} />
      <ellipse cx={565} cy={370} rx={52} ry={58} fill={glow} />
      <ellipse cx={715} cy={370} rx={52} ry={58} fill={glow} />
      <path d="M640 420 L615 475 L665 475 Z" fill={glow} opacity={0.8} />
      <rect x={520} y={540} width={240} height={70} rx={14} fill={ink} />
      {range(6).map((i) => (
        <rect key={i} x={540 + i * 36} y={540} width={6} height={60} fill={glow} opacity={0.6} />
      ))}
      <Ground ink={ink} y={650} wobble={10} />
    </g>
  ),
  ruins: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={640} cy={330} r={120} glow={glow} uid={uid} />
      {[
        [180, 260],
        [300, 380],
        [420, 210],
        [800, 300],
        [920, 160],
        [1040, 340],
      ].map(([x, h], i) => (
        <g key={i}>
          <rect x={x} y={620 - h * 1.4} width={56} height={h * 1.4} fill={ink} />
          <path d={`M${x - 6} ${620 - h * 1.4} l20 -26 l14 18 l12 -22 l22 30 Z`} fill={ink} />
        </g>
      ))}
      <path d="M520 620 L520 380 Q 640 260 760 380 L760 620 L710 620 L710 400 Q 640 330 570 400 L570 620 Z" fill={ink} />
      <rect x={490} y={360} width={300} height={24} fill={ink} opacity={0} />
      <Ground ink={ink} y={615} wobble={14} />
    </g>
  ),
  army: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={640} cy={360} r={140} glow={glow} uid={uid} />
      <rect x={0} y={420} width={1280} height={300} fill={`url(#${uid}-dust)`} />
      {range(42).map((i) => {
        const x = 20 + i * 30.5;
        const h = 210 + ((i * 37) % 70);
        return <line key={i} x1={x} y1={620} x2={x + 10} y2={620 - h} stroke={ink} strokeWidth={5} />;
      })}
      {[220, 520, 860, 1110].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={620} x2={x} y2={250} stroke={ink} strokeWidth={8} />
          <path d={`M${x} 255 q 60 20 110 0 l -20 40 l 20 40 q -50 20 -110 0 Z`} fill={ink} />
        </g>
      ))}
      {range(26).map((i) => (
        <circle key={`s${i}`} cx={25 + i * 50} cy={600} r={30} fill={ink} />
      ))}
      <rect x={0} y={600} width={1280} height={120} fill={ink} />
    </g>
  ),
  swords: ({ ink, glow, accent }) => (
    <g>
      <circle cx={640} cy={360} r={260} fill={glow} opacity={0.18} />
      {[-38, 38].map((rot, i) => (
        <g key={i} transform={`rotate(${rot} 640 380)`}>
          <path d="M620 40 L660 40 L664 520 L616 520 Z" fill="#d9dde2" />
          <path d="M640 40 L660 40 L664 520 L640 520 Z" fill="#9aa3ad" />
          <path d="M620 40 L640 0 L660 40 Z" fill="#d9dde2" />
          <rect x={540} y={520} width={200} height={26} rx={10} fill={accent} />
          <rect x={626} y={546} width={28} height={110} fill={ink} />
          <circle cx={640} cy={670} r={26} fill={accent} />
        </g>
      ))}
      <path d="M0 720 L0 680 Q 640 640 1280 680 L1280 720 Z" fill={ink} />
    </g>
  ),
  map: ({ ink, glow, accent }) => (
    <g>
      <rect x={0} y={0} width={1280} height={720} fill={accent} opacity={0.25} />
      <path d="M120 160 C 260 110 420 150 520 120 C 640 90 760 140 820 210 C 880 280 760 330 700 390 C 640 450 520 430 450 500 C 380 570 260 560 200 500 C 130 430 160 360 120 300 C 90 250 70 190 120 160 Z" fill={ink} opacity={0.88} />
      <path d="M760 420 C 860 380 1000 400 1100 460 C 1180 510 1160 600 1060 640 C 960 680 840 650 790 590 C 740 530 700 450 760 420 Z" fill={ink} opacity={0.88} />
      <path d="M880 120 C 980 90 1120 120 1180 200 C 1220 260 1140 300 1060 290 C 980 280 920 240 880 200 C 850 170 850 130 880 120 Z" fill={ink} opacity={0.88} />
      <path d="M300 230 C 380 200 520 210 600 260 C 660 300 620 380 540 400 C 460 420 360 400 310 350 C 260 300 250 250 300 230 Z" fill={glow} opacity={0.85} />
      <path d="M560 300 C 700 280 820 300 930 360" stroke={glow} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d="M915 320 L990 380 L900 405 Z" fill={glow} />
      <path d="M450 380 C 470 470 560 540 700 560" stroke={glow} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d="M690 520 L760 570 L680 600 Z" fill={glow} />
      <path d="M380 240 C 420 170 520 130 640 150" stroke={glow} strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d="M630 115 L700 155 L630 185 Z" fill={glow} />
    </g>
  ),
  plague: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={420} cy={280} r={150} glow={glow} uid={uid} />
      <path d="M520 250 C 520 170 600 120 690 120 C 780 120 840 170 840 250 L940 260 C 960 262 960 290 940 292 L470 300 C 440 300 440 270 470 268 Z" fill={ink} />
      <path d="M560 300 C 560 380 600 420 620 440 C 520 470 400 520 290 600 C 420 560 560 520 640 500 C 700 520 760 540 820 540 L860 720 L470 720 L520 560 C 560 520 580 480 600 450 Z" fill={ink} />
      <path d="M600 300 L820 300 C 830 370 800 420 740 450 C 690 470 640 460 610 440 C 570 400 590 350 600 300 Z" fill={ink} />
      <path d="M640 380 C 560 400 440 470 300 560 C 440 520 560 480 660 450 Z" fill={ink} />
      <circle cx={700} cy={360} r={26} fill={glow} opacity={0.85} />
      <circle cx={700} cy={360} r={12} fill={ink} />
    </g>
  ),
  crown: ({ ink, glow, accent }) => (
    <g>
      <circle cx={640} cy={380} r={250} fill={glow} opacity={0.16} />
      <path d="M380 520 L340 230 L480 360 L560 180 L640 340 L720 180 L800 360 L940 230 L900 520 Z" fill={accent} />
      <path d="M380 520 L900 520 L900 470 L380 470 Z" fill={ink} opacity={0.3} />
      <rect x={370} y={520} width={540} height={70} rx={8} fill={accent} />
      {[450, 560, 640, 720, 830].map((x, i) => (
        <circle key={i} cx={x} cy={555} r={18} fill={i % 2 ? glow : '#b0122a'} />
      ))}
      {[340, 560, 720, 940].map((x, i) => (
        <circle key={`t${i}`} cx={x} cy={i === 1 || i === 2 ? 175 : 225} r={20} fill={glow} />
      ))}
      <path d="M0 720 L0 650 Q 640 600 1280 650 L1280 720 Z" fill={ink} />
    </g>
  ),
  moai: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={960} cy={300} r={100} glow={glow} uid={uid} />
      {[
        [220, 1],
        [520, 1.15],
        [840, 0.95],
      ].map(([x, s], i) => (
        <g key={i} transform={`translate(${x} ${620 - 430 * s}) scale(${s})`}>
          <path d="M40 30 C 40 0 180 0 190 30 L200 120 L230 150 L210 200 L230 240 L200 270 L200 330 L240 430 L0 430 L20 330 L10 200 C 0 140 30 80 40 30 Z" fill={ink} />
          <path d="M60 130 L170 125 L172 145 L62 150 Z" fill="#000" opacity={0.5} />
        </g>
      ))}
      <Ground ink={ink} y={620} wobble={20} />
    </g>
  ),
  stepPyramid: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={640} cy={210} r={90} glow={glow} uid={uid} />
      {range(6).map((i) => (
        <rect key={i} x={300 + i * 55} y={600 - (i + 1) * 60} width={680 - i * 110} height={62} fill={ink} />
      ))}
      <rect x={580} y={200} width={120} height={60} fill={ink} />
      <rect x={605} y={215} width={70} height={45} fill={glow} opacity={0.6} />
      <path d="M600 600 L620 260 L660 260 L680 600 Z" fill="#000" opacity={0.35} />
      {range(10).map((i) => (
        <path key={i} d={`M${i * 140 - 40} 640 q 50 -150 100 0 q 40 -110 90 0 Z`} fill={ink} />
      ))}
      <rect x={0} y={630} width={1280} height={90} fill={ink} />
    </g>
  ),
  storm: ({ ink, glow }) => (
    <g>
      <path d="M760 0 L700 180 L770 180 L690 380 L840 150 L770 150 L830 0 Z" fill={glow} />
      <path d="M520 360 L520 230 M520 240 L660 300 L520 340" stroke={ink} strokeWidth={10} fill={ink} />
      <path d="M360 380 L700 380 C 680 430 640 450 520 450 C 420 450 380 430 360 380 Z" fill={ink} />
      <path d="M0 460 C 120 380 220 520 360 430 C 500 340 560 520 720 440 C 880 360 960 520 1100 430 C 1180 380 1240 420 1280 440 L1280 720 L0 720 Z" fill={ink} />
      <path d="M0 560 C 160 480 300 620 480 540 C 660 460 780 620 980 540 C 1100 490 1200 520 1280 540 L1280 720 L0 720 Z" fill="#000" opacity={0.5} />
    </g>
  ),
  stonehenge: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={640} cy={420} r={90} glow={glow} uid={uid} />
      {[
        [170, 0.85],
        [430, 1],
        [740, 1.05],
        [1010, 0.8],
      ].map(([x, s], i) => (
        <g key={i} transform={`translate(${x} ${620 - 300 * s}) scale(${s})`}>
          <rect x={0} y={40} width={70} height={260} fill={ink} />
          <rect x={150} y={40} width={70} height={260} fill={ink} />
          <rect x={-14} y={0} width={248} height={52} fill={ink} />
        </g>
      ))}
      <rect x={350} y={500} width={50} height={120} fill={ink} transform="rotate(-12 375 560)" />
      <Ground ink={ink} y={612} wobble={12} />
    </g>
  ),
  volcano: ({ ink, glow, accent }) => (
    <g>
      <path d="M560 250 C 420 160 460 40 600 40 C 640 -20 780 -10 800 70 C 900 60 940 180 840 230 C 780 260 680 280 560 250 Z" fill="#000" opacity={0.45} />
      <path d="M640 260 C 620 200 660 160 700 200 C 720 150 760 170 740 240 Z" fill={glow} />
      <path d="M200 620 L560 270 L720 270 L1080 620 Z" fill={ink} />
      <path d="M600 280 C 620 360 580 420 610 520 C 630 470 650 380 660 280 Z" fill={glow} opacity={0.9} />
      <path d="M680 280 C 700 340 720 400 760 450 C 740 380 720 320 700 280 Z" fill={accent} opacity={0.9} />
      {range(14).map((i) => (
        <rect key={i} x={40 + i * 90} y={600 - ((i * 53) % 60) - 30} width={60} height={((i * 53) % 60) + 40} fill={ink} />
      ))}
      <rect x={0} y={620} width={1280} height={100} fill={ink} />
    </g>
  ),
  burningCity: ({ ink, glow, accent }) => (
    <g>
      {range(9).map((i) => (
        <path
          key={i}
          d={`M${80 + i * 140} 560 C ${40 + i * 140} 440 ${120 + i * 140} 380 ${100 + i * 140} ${270 + ((i * 41) % 90)} C ${170 + i * 140} 360 ${210 + i * 140} 440 ${170 + i * 140} 560 Z`}
          fill={i % 2 ? glow : accent}
          opacity={0.85}
        />
      ))}
      <path d="M0 620 L0 470 L90 470 L90 420 L160 420 L160 500 L240 500 L240 380 Q 300 310 360 380 L360 500 L430 500 L430 440 L520 440 L520 330 L600 290 L680 330 L680 470 L760 470 L760 400 L850 400 L850 500 L930 500 L930 360 Q 990 300 1050 360 L1050 480 L1130 480 L1130 430 L1280 430 L1280 620 Z" fill={ink} />
      {range(6).map((i) => (
        <rect key={i} x={260 + i * 160} y={520} width={18} height={30} fill={glow} opacity={0.8} />
      ))}
      <rect x={0} y={610} width={1280} height={110} fill={ink} />
    </g>
  ),
  torii: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={640} cy={300} r={150} glow={glow} uid={uid} />
      <path d="M0 520 L260 330 L420 450 L600 300 L820 470 L1000 360 L1280 520 L1280 720 L0 720 Z" fill={ink} opacity={0.55} />
      <path d="M330 200 Q 640 160 950 200 L960 240 Q 640 205 320 240 Z" fill={ink} />
      <rect x={370} y={260} width={540} height={34} fill={ink} />
      <rect x={430} y={230} width={46} height={400} fill={ink} />
      <rect x={804} y={230} width={46} height={400} fill={ink} />
      <rect x={620} y={240} width={40} height={50} fill={ink} />
      <Ground ink={ink} y={625} wobble={8} />
    </g>
  ),
  sphinx: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={1000} cy={260} r={90} glow={glow} uid={uid} />
      <path d="M880 620 L1040 380 L1200 620 Z" fill={ink} opacity={0.7} />
      <path d="M170 620 L170 520 C 260 470 420 470 560 480 L700 480 C 720 420 700 330 760 290 C 790 270 830 270 860 290 C 900 320 900 380 880 430 C 900 470 930 500 960 540 L1000 620 Z" fill={ink} />
      <path d="M760 290 C 760 250 860 250 860 290 L880 380 C 850 360 790 360 760 380 Z" fill={ink} />
      <path d="M780 300 L780 380 M800 300 L800 380 M820 300 L820 380 M840 300 L840 380" stroke={glow} strokeWidth={4} opacity={0.35} />
      <Ground ink={ink} y={620} wobble={10} />
    </g>
  ),
  galleon: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={300} cy={330} r={80} glow={glow} uid={uid} />
      {[480, 640, 790].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={120 + i * 10} x2={x} y2={470} stroke={ink} strokeWidth={10} />
          <path d={`M${x - 90} ${150 + i * 10} Q ${x} ${130 + i * 10} ${x + 90} ${150 + i * 10} L ${x + 80} ${270 + i * 10} Q ${x} ${250 + i * 10} ${x - 80} ${270 + i * 10} Z`} fill={ink} />
          <path d={`M${x - 110} ${290 + i * 10} Q ${x} ${270 + i * 10} ${x + 110} ${290 + i * 10} L ${x + 100} ${430} Q ${x} ${410} ${x - 100} ${430} Z`} fill={ink} />
        </g>
      ))}
      <path d="M330 470 L960 470 L1000 400 L1040 420 L980 560 L380 560 L300 440 Z" fill={ink} />
      {range(8).map((i) => (
        <rect key={i} x={420 + i * 66} y={500} width={22} height={16} fill={glow} opacity={0.75} />
      ))}
      <path d="M0 580 Q 90 550 180 580 T 360 580 T 540 580 T 720 580 T 900 580 T 1080 580 T 1260 580 T 1440 580 L1440 720 L0 720 Z" fill={ink} />
    </g>
  ),
  shield: ({ ink, glow, accent }) => (
    <g>
      <circle cx={640} cy={360} r={270} fill={glow} opacity={0.15} />
      <path d="M440 150 L840 150 L840 360 C 840 500 740 590 640 640 C 540 590 440 500 440 360 Z" fill="#efe8dc" />
      <path d="M460 170 L820 170 L820 360 C 820 490 730 570 640 615 C 550 570 460 490 460 360 Z" fill="#f7f2ea" />
      <path d="M610 170 L670 170 L670 330 L820 330 L820 390 L670 390 L670 610 C 660 616 650 616 640 615 C 630 616 620 616 610 610 L610 390 L460 390 L460 330 L610 330 Z" fill={accent} />
      <path d="M0 720 L0 670 Q 640 620 1280 670 L1280 720 Z" fill={ink} />
    </g>
  ),
  forest: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={640} cy={280} r={70} glow={glow} uid={uid} />
      <rect x={0} y={360} width={1280} height={120} fill={`url(#${uid}-dust)`} opacity={0.8} />
      {range(16).map((i) => {
        const x = i * 84 - 20;
        const h = 300 + ((i * 71) % 160);
        return <path key={i} d={`M${x} 640 L${x + 45} ${640 - h} L${x + 90} 640 Z`} fill={ink} opacity={i % 3 === 0 ? 0.7 : 1} />;
      })}
      <rect x={590} y={340} width={100} height={300} fill={ink} />
      <rect x={605} y={420} width={70} height={36} fill={glow} opacity={0.65} />
      <rect x={0} y={630} width={1280} height={90} fill={ink} />
    </g>
  ),
  emu: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={950} cy={320} r={120} glow={glow} uid={uid} />
      <g transform="translate(330 120)">
        <ellipse cx={240} cy={320} rx={200} ry={120} fill={ink} />
        <path d="M380 260 C 420 200 420 120 400 60 C 395 30 420 0 450 10 C 480 20 480 50 470 70 L500 80 L470 95 C 450 160 470 220 440 300 Z" fill={ink} />
        <circle cx={455} cy={40} r={8} fill={glow} />
        <path d="M200 420 L170 560 L130 600 M190 560 L210 600 M300 420 L320 560 L280 600 M320 560 L360 600" stroke={ink} strokeWidth={18} strokeLinecap="round" fill="none" />
      </g>
      <Ground ink={ink} y={690} wobble={6} />
    </g>
  ),
  town: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={640} cy={240} r={110} glow={glow} uid={uid} />
      <path d="M0 640 L0 420 L60 360 L120 420 L120 380 L200 300 L280 380 L280 450 L340 450 L340 350 L360 330 L360 220 L380 170 L400 220 L400 330 L420 350 L420 450 L480 400 L560 460 L560 380 L640 300 L720 380 L720 460 L780 420 L840 470 L840 340 L900 280 L960 340 L960 450 L1040 380 L1120 450 L1120 400 L1200 330 L1280 400 L1280 640 Z" fill={ink} />
      {[150, 230, 520, 600, 690, 880, 1000, 1180].map((x, i) => (
        <rect key={i} x={x} y={470 + (i % 3) * 30} width={22} height={28} fill={glow} opacity={0.75} />
      ))}
      <rect x={0} y={630} width={1280} height={90} fill={ink} />
    </g>
  ),
  library: ({ ink, glow }) => (
    <g>
      <circle cx={640} cy={330} r={300} fill={glow} opacity={0.18} />
      {range(5).map((s) => (
        <g key={s}>
          <rect x={150} y={150 + s * 95} width={980} height={12} fill={ink} />
          {range(28).map((b) => (
            <rect
              key={b}
              x={160 + b * 34.5}
              y={95 + s * 95 + ((b * 7 + s * 3) % 18)}
              width={26}
              height={55 - ((b * 7 + s * 3) % 18)}
              fill={(b + s) % 4 === 0 ? glow : ink}
              opacity={(b + s) % 4 === 0 ? 0.55 : 0.95}
            />
          ))}
        </g>
      ))}
      <path d="M0 720 L0 620 L1280 620 L1280 720 Z" fill={ink} />
      {range(7).map((i) => (
        <path key={i} d={`M${200 + i * 140} 620 C ${170 + i * 140} 560 ${230 + i * 140} 520 ${210 + i * 140} 470 C ${260 + i * 140} 530 ${270 + i * 140} 580 ${240 + i * 140} 620 Z`} fill={glow} opacity={0.85} />
      ))}
    </g>
  ),
  scroll: ({ ink, glow, accent }) => (
    <g>
      <rect x={260} y={140} width={760} height={440} fill="#e9d8b4" />
      <rect x={260} y={140} width={760} height={440} fill={accent} opacity={0.15} />
      <rect x={220} y={120} width={60} height={480} rx={30} fill="#b88a4a" />
      <rect x={1000} y={120} width={60} height={480} rx={30} fill="#b88a4a" />
      {range(8).map((i) => (
        <rect key={i} x={330} y={200 + i * 44} width={420 + ((i * 97) % 200)} height={10} rx={5} fill={ink} opacity={0.55} />
      ))}
      <circle cx={880} cy={480} r={46} fill="#b0122a" />
      <circle cx={880} cy={480} r={30} fill={glow} opacity={0.3} />
    </g>
  ),
  fortress: ({ ink, glow, uid }) => (
    <g>
      <Sun cx={260} cy={260} r={90} glow={glow} uid={uid} />
      <path d="M0 640 L0 500 L180 470 L360 300 L560 250 L860 260 L1000 330 L1120 470 L1280 500 L1280 640 Z" fill={ink} />
      <path d="M520 255 L520 200 L560 200 L560 225 L600 225 L600 200 L640 200 L640 225 L680 225 L680 200 L720 200 L720 225 L760 225 L760 200 L800 200 L800 258 Z" fill={ink} />
      {range(10).map((i) => (
        <circle key={i} cx={120 + i * 110} cy={620 - ((i * 37) % 30)} r={6} fill={glow} opacity={0.85} />
      ))}
      <rect x={0} y={630} width={1280} height={90} fill={ink} />
    </g>
  ),
  lighthouse: ({ ink, glow }) => (
    <g>
      <path d="M640 210 L1280 60 L1280 330 Z" fill={glow} opacity={0.4} />
      <path d="M640 210 L0 90 L0 300 Z" fill={glow} opacity={0.25} />
      <path d="M580 620 L600 260 L680 260 L700 620 Z" fill={ink} />
      <rect x={585} y={200} width={110} height={60} fill={glow} />
      <path d="M570 200 L640 140 L710 200 Z" fill={ink} />
      <path d="M0 620 Q 160 590 320 620 T 640 620 T 960 620 T 1280 620 L1280 720 L0 720 Z" fill={ink} />
    </g>
  ),
};

export function renderScene(name: SceneName, props: SceneProps) {
  return scenes[name](props);
}
