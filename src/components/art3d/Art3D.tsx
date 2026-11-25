import React, { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

/**
 * Crisp, resolution-independent 3D "clay toy" vector artwork (react-native-svg).
 *
 * Every piece is drawn in a 100 x 100 viewBox with:
 *   - a diagonal light -> base -> shade gradient fill (key light from the top-left)
 *   - a darker 3D lip copy offset underneath (clay depth)
 *   - a thin edge outline for crisp definition at small sizes
 *   - white specular highlights and a soft contact shadow
 * Gradient ids are unique per instance (useId) so they never collide on web.
 */

export type ArtColor =
  | 'red' | 'orange' | 'yellow' | 'gold' | 'green' | 'mint' | 'teal' | 'sky' | 'blue'
  | 'purple' | 'pink' | 'white' | 'tan' | 'brown' | 'grey' | 'cream' | 'dark'
  | 'rose' | 'sand' | 'honey' | 'slate' | 'lilac';

/** [light, base, shade, edge/lip] */
const PAL: Record<ArtColor, [string, string, string, string]> = {
  red: ['#FFA4A4', '#F43F5E', '#BE123C', '#9F1239'],
  orange: ['#FFD3A1', '#FB923C', '#EA580C', '#C2410C'],
  yellow: ['#FFF6B0', '#FDE047', '#EAB308', '#CA8A04'],
  gold: ['#FFEDB0', '#FBBF24', '#D97706', '#B45309'],
  green: ['#B4F5CD', '#22C55E', '#15803D', '#166534'],
  mint: ['#C2F7E0', '#34D399', '#059669', '#047857'],
  teal: ['#A5F3E8', '#14B8A6', '#0F766E', '#115E59'],
  sky: ['#C7EBFF', '#38BDF8', '#0284C7', '#0369A1'],
  blue: ['#C7DCFF', '#3B82F6', '#1D4ED8', '#1E40AF'],
  purple: ['#E4DCFF', '#8B5CF6', '#6D28D9', '#5B21B6'],
  pink: ['#FDD6EC', '#F472B6', '#DB2777', '#BE185D'],
  white: ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#CBD5E1'],
  tan: ['#FDE6C6', '#E9B77C', '#C98D56', '#A16207'],
  brown: ['#DDB088', '#A16207', '#78350F', '#5C2E0E'],
  grey: ['#F8FAFC', '#CBD5E1', '#94A3B8', '#64748B'],
  cream: ['#FFFEF7', '#FEF3C7', '#FDE68A', '#E0A82E'],
  dark: ['#7C8BA1', '#334155', '#1E293B', '#0F172A'],
  // soft character tones (animal fur / feathers)
  rose: ['#FFF1F5', '#FBCFE8', '#F49AC1', '#DB2777'],
  sand: ['#FFF3DE', '#EBC994', '#C99A5B', '#9A6B32'],
  honey: ['#FFF3CC', '#F6C866', '#D99A2B', '#A86B12'],
  slate: ['#A3AFC2', '#64748B', '#475569', '#334155'],
  lilac: ['#F1ECFB', '#C9B8E6', '#9B86C4', '#6F5B9A'],
};
const COLORS = Object.keys(PAL) as ArtColor[];

type Fill = (c: ArtColor) => string;
type ShapeProps = { fill: string; stroke?: string; strokeWidth?: number; strokeOpacity?: number };

/** Svg wrapper: provides gradient fills `g(color)` with ids unique to this instance. */
const ArtSvg: React.FC<{ size: number; children: (g: Fill, uid: string) => React.ReactNode }> = ({ size, children }) => {
  const uid = 'a3' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const g: Fill = (c) => `url(#${uid}${c})`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {COLORS.map((c) => (
          <LinearGradient key={c} id={`${uid}${c}`} x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor={PAL[c][0]} />
            <Stop offset="0.48" stopColor={PAL[c][1]} />
            <Stop offset="1" stopColor={PAL[c][2]} />
          </LinearGradient>
        ))}
        <RadialGradient id={`${uid}glow`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFF7C2" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#FFF7C2" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {children(g, uid)}
    </Svg>
  );
};

/** Renders a shape twice: darker lip offset below, then the glossy gradient body with a crisp edge. */
const Clay: React.FC<{ g: Fill; c: ArtColor; depth?: number; shape: (p: ShapeProps) => React.ReactElement }> = ({
  g,
  c,
  depth = 3,
  shape,
}) => (
  <>
    {depth > 0 ? <G transform={`translate(0 ${depth})`}>{shape({ fill: PAL[c][3] })}</G> : null}
    {shape({ fill: g(c), stroke: PAL[c][3], strokeWidth: 1, strokeOpacity: 0.55 })}
  </>
);

const Shine: React.FC<{ cx: number; cy: number; rx: number; ry: number; rot?: number; o?: number }> = ({
  cx,
  cy,
  rx,
  ry,
  rot = -30,
  o = 0.6,
}) => <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" opacity={o} transform={`rotate(${rot} ${cx} ${cy})`} />;

const Shadow: React.FC<{ cx?: number; cy?: number; rx?: number; ry?: number }> = ({ cx = 50, cy = 92, rx = 30, ry = 4.5 }) => (
  <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#0F172A" opacity={0.13} />
);

const Face: React.FC<{ cx: number; cy: number; s?: number }> = ({ cx, cy, s = 1 }) => (
  <G>
    <Ellipse cx={cx - 6 * s} cy={cy} rx={2.3 * s} ry={2.8 * s} fill="#1E1B2E" />
    <Ellipse cx={cx + 6 * s} cy={cy} rx={2.3 * s} ry={2.8 * s} fill="#1E1B2E" />
    <Circle cx={cx - 6.7 * s} cy={cy - 1 * s} r={0.9 * s} fill="#FFFFFF" />
    <Circle cx={cx + 5.3 * s} cy={cy - 1 * s} r={0.9 * s} fill="#FFFFFF" />
    <Path
      d={`M${cx - 3.2 * s} ${cy + 3.6 * s} Q${cx} ${cy + 6.6 * s} ${cx + 3.2 * s} ${cy + 3.6 * s}`}
      stroke="#4A2511"
      strokeWidth={1.5 * s}
      strokeLinecap="round"
      fill="none"
    />
    <Ellipse cx={cx - 10 * s} cy={cy + 4 * s} rx={2.6 * s} ry={1.6 * s} fill="#FB7185" opacity={0.5} />
    <Ellipse cx={cx + 10 * s} cy={cy + 4 * s} rx={2.6 * s} ry={1.6 * s} fill="#FB7185" opacity={0.5} />
  </G>
);

const Sparkle: React.FC<{ x: number; y: number; r: number; color?: string }> = ({ x, y, r, color = '#FCD34D' }) => (
  <Path
    d={`M${x} ${y - r} Q${x + r * 0.2} ${y - r * 0.2} ${x + r} ${y} Q${x + r * 0.2} ${y + r * 0.2} ${x} ${y + r} Q${x - r * 0.2} ${y + r * 0.2} ${x - r} ${y} Q${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r} Z`}
    fill={color}
  />
);

const starPts = (cx: number, cy: number, R: number, r: number, n = 5, rot = -90) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const rad = i % 2 === 0 ? R : r;
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    return `${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`;
  }).join(' ');

const gearPath = (cx: number, cy: number, R: number, r: number, teeth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth;
    [[a0, r], [a0 + step * 0.18, R], [a0 + step * 0.5, R], [a0 + step * 0.68, r]].forEach(([a, rad]) =>
      pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`)
    );
  }
  return `M${pts.join(' L')} Z`;
};

const Label: React.FC<{ x: number; y: number; size: number; text: string; color: ArtColor; g: Fill; depth?: number }> = ({
  x,
  y,
  size,
  text,
  color,
  g,
  depth = 3,
}) => (
  <>
    <SvgText x={x} y={y + depth} fontSize={size} fontWeight="900" textAnchor="middle" fill={PAL[color][3]}>
      {text}
    </SvgText>
    <SvgText x={x} y={y} fontSize={size} fontWeight="900" textAnchor="middle" fill={g(color)} stroke={PAL[color][3]} strokeWidth={0.8}>
      {text}
    </SvgText>
  </>
);

// -------------------------------------------------------------- reusable pieces

const Apple: React.FC<{ g: Fill; x?: number; y?: number; s?: number; c?: ArtColor; face?: boolean }> = ({
  g,
  x = 0,
  y = 0,
  s = 1,
  c = 'red',
  face = true,
}) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    <Path d="M50 28 Q52 18 58 12" stroke="#78350F" strokeWidth={3.4} strokeLinecap="round" fill="none" />
    <Clay g={g} c="green" depth={1.5} shape={(p) => <Path {...p} d="M55 22 Q66 10 78 16 Q68 28 55 22 Z" />} />
    <Clay
      g={g}
      c={c}
      shape={(p) => <Path {...p} d="M50 30 C40 22 16 24 16 50 C16 74 34 90 50 85 C66 90 84 74 84 50 C84 24 60 22 50 30 Z" />}
    />
    <Shine cx={32} cy={42} rx={6} ry={11} rot={20} />
    {face ? <Face cx={50} cy={58} s={1.15} /> : null}
  </G>
);

const Star: React.FC<{ g: Fill; cx: number; cy: number; R: number; face?: boolean; c?: ArtColor }> = ({
  g,
  cx,
  cy,
  R,
  face = true,
  c = 'gold',
}) => (
  <>
    <Clay g={g} c={c} shape={(p) => <Polygon {...p} points={starPts(cx, cy, R, R * 0.48)} strokeLinejoin="round" />} />
    <Shine cx={cx - R * 0.25} cy={cy - R * 0.3} rx={R * 0.16} ry={R * 0.3} />
    {face ? <Face cx={cx} cy={cy + R * 0.08} s={R / 26} /> : null}
  </>
);

const Coin: React.FC<{ g: Fill; cx: number; cy: number; r: number }> = ({ g, cx, cy, r }) => (
  <>
    <Clay g={g} c="gold" depth={3} shape={(p) => <Circle {...p} cx={cx} cy={cy} r={r} />} />
    <Circle cx={cx} cy={cy} r={r * 0.74} fill="none" stroke="#B45309" strokeWidth={1.4} opacity={0.6} />
    <Polygon points={starPts(cx, cy + 0.5, r * 0.45, r * 0.2)} fill="#FFF7D6" stroke="#D97706" strokeWidth={0.8} />
    <Shine cx={cx - r * 0.38} cy={cy - r * 0.4} rx={r * 0.18} ry={r * 0.32} />
  </>
);

const Tile: React.FC<{ g: Fill; x: number; y: number; s: number; c: ArtColor; letter: string; rot?: number }> = ({
  g,
  x,
  y,
  s,
  c,
  letter,
  rot = 0,
}) => (
  <G transform={`rotate(${rot} ${x + s / 2} ${y + s / 2})`}>
    <Clay g={g} c={c} depth={4} shape={(p) => <Rect {...p} x={x} y={y} width={s} height={s} rx={s * 0.22} />} />
    <Shine cx={x + s * 0.3} cy={y + s * 0.2} rx={s * 0.18} ry={s * 0.08} rot={-10} />
    <SvgText x={x + s / 2} y={y + s * 0.74} fontSize={s * 0.62} fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke={PAL[c][3]} strokeWidth={0.8}>
      {letter}
    </SvgText>
  </G>
);

const Pencil: React.FC<{ g: Fill; x: number; y: number; rot: number; s?: number; face?: boolean }> = ({ g, x, y, rot, s = 1, face = false }) => (
  <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Clay g={g} c="pink" depth={2} shape={(p) => <Rect {...p} x={-38} y={-8} width={10} height={16} rx={4} />} />
    <Rect x={-29} y={-8} width={6} height={16} fill="#CBD5E1" stroke="#94A3B8" strokeWidth={0.8} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Rect {...p} x={-23} y={-8} width={40} height={16} rx={2} />} />
    <Rect x={-23} y={-2.5} width={40} height={2} fill="#D97706" opacity={0.6} />
    <Polygon points="17,-8 31,0 17,8" fill="#FDE6C6" stroke="#C98D56" strokeWidth={0.8} />
    <Polygon points="26,-2.8 31,0 26,2.8" fill="#334155" />
    {face ? <Face cx={-3} cy={-1} s={0.55} /> : null}
  </G>
);

const Bubble: React.FC<{ g: Fill; c: ArtColor }> = ({ g, c }) => (
  <>
    <Clay
      g={g}
      c={c}
      depth={4}
      shape={(p) => <Path {...p} d="M22 16 H78 Q90 16 90 28 V58 Q90 70 78 70 H40 L24 86 L28 70 H22 Q10 70 10 58 V28 Q10 16 22 16 Z" />}
    />
    <Shine cx={28} cy={26} rx={10} ry={4} rot={-8} />
  </>
);

const Magnifier: React.FC<{ g: Fill; inner?: React.ReactNode }> = ({ g, inner }) => (
  <>
    <Shadow cx={62} cy={88} rx={20} ry={4} />
    <G transform="rotate(-45 42 42)">
      {/* Golden metal neck collar connecting rim to handle */}
      <Rect x={36.5} y={64} width={11} height={6} rx={2} fill="#FBBF24" stroke="#B45309" strokeWidth={0.8} />

      {/* Sleek blue explorer handle */}
      <Clay g={g} c="sky" depth={2} shape={(p) => <Rect {...p} x={37} y={69} width={10} height={26} rx={3} />} />

      {/* Grip accents */}
      <Rect x={38.5} y={76} width={7} height={1.6} rx={0.8} fill="#FFFFFF" opacity={0.6} />
      <Rect x={38.5} y={81} width={7} height={1.6} rx={0.8} fill="#FFFFFF" opacity={0.6} />

      {/* Golden metal pommel tip at base */}
      <Rect x={36.5} y={93} width={11} height={4.5} rx={2} fill="#FBBF24" stroke="#B45309" strokeWidth={0.8} />
    </G>

    {inner}
    <Circle cx={42} cy={42} r={24} fill="#BAE6FD" opacity={0.35} />
    <Path d="M26 34 A18 18 0 0 1 40 22" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.85} />
    <Circle cx={42} cy={45} r={28} fill="none" stroke="#B45309" strokeWidth={7.5} />
    <Circle cx={42} cy={42} r={28} fill="none" stroke="#FBBF24" strokeWidth={7.5} />
    <Path d="M20 30 A25 25 0 0 1 36 15" stroke="#FFF7D6" strokeWidth={2.4} strokeLinecap="round" fill="none" />
  </>
);

const Jelly: React.FC<{ g: Fill; kind: 'plus' | 'minus' | 'times' | 'divide' | 'equals'; c: ArtColor; cx: number; cy: number; s: number; face?: boolean }> = ({
  g,
  kind,
  c,
  cx,
  cy,
  s,
  face = false,
}) => {
  const bar = (w: number, h: number, dx = 0, dy = 0) => (p: ShapeProps) => (
    <Rect {...p} x={cx - w / 2 + dx} y={cy - h / 2 + dy} width={w} height={h} rx={h / 2} />
  );
  const L = 34 * s;
  const T = 13 * s;
  const parts: ((p: ShapeProps) => React.ReactElement)[] =
    kind === 'plus' || kind === 'times'
      ? [bar(L, T), bar(T, L)]
      : kind === 'minus'
        ? [bar(L, T)]
        : kind === 'equals'
          ? [bar(L, T * 0.85, 0, -T * 0.75), bar(L, T * 0.85, 0, T * 0.75)]
          : [bar(L, T * 0.85), (p) => <Circle {...p} cx={cx} cy={cy - T * 1.35} r={T * 0.55} />, (p) => <Circle {...p} cx={cx} cy={cy + T * 1.35} r={T * 0.55} />];
  return (
    <G transform={kind === 'times' ? `rotate(45 ${cx} ${cy})` : undefined}>
      {parts.map((shape, i) => (
        <G key={`l${i}`} transform={`translate(0 ${3.5 * s})`}>
          {shape({ fill: PAL[c][3] })}
        </G>
      ))}
      {parts.map((shape, i) => (
        <React.Fragment key={`b${i}`}>{shape({ fill: g(c), stroke: PAL[c][3], strokeWidth: 1, strokeOpacity: 0.55 })}</React.Fragment>
      ))}
      <Shine cx={cx - L * 0.22} cy={cy - T * (kind === 'equals' ? 1 : 0.22)} rx={L * 0.16} ry={T * 0.16} rot={0} o={0.7} />
      {face ? <G transform={kind === 'times' ? `rotate(-45 ${cx} ${cy})` : undefined}><Face cx={cx} cy={cy - 0.5} s={0.55 * s} /></G> : null}
    </G>
  );
};

// -------------------------------------------------------------- art pieces

export type ArtProps = { size?: number };
type ArtFC = React.FC<ArtProps>;
const art = (draw: (g: Fill, uid: string) => React.ReactNode): ArtFC => {
  const C: ArtFC = ({ size = 64 }) => <ArtSvg size={size}>{draw}</ArtSvg>;
  return C;
};

// ---- games hub

export const BalloonsArt = art((g) => (
  <>
    <Path d="M30 58 Q36 76 48 94 M70 56 Q62 76 50 94 M50 70 Q46 82 50 94" stroke="#94A3B8" strokeWidth={1.6} fill="none" />
    {([['gold', 30, 38, 15, 18], ['sky', 70, 36, 15, 18], ['red', 50, 48, 18, 22]] as [ArtColor, number, number, number, number][]).map(
      ([c, x, y, rx, ry]) => (
        <G key={c}>
          <Polygon points={`${x - 3},${y + ry + 3} ${x + 3},${y + ry + 3} ${x},${y + ry - 1}`} fill={PAL[c][3]} />
          <Clay g={g} c={c} depth={2} shape={(p) => <Ellipse {...p} cx={x} cy={y} rx={rx} ry={ry} />} />
          <Shine cx={x - rx * 0.4} cy={y - ry * 0.4} rx={rx * 0.2} ry={ry * 0.32} rot={25} o={0.7} />
        </G>
      )
    )}
    <Face cx={50} cy={52} s={0.9} />
    <Sparkle x={86} y={14} r={6} />
    <Sparkle x={12} y={18} r={4.5} color="#FFFFFF" />
  </>
));

export const PaletteArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={36} />
    <Clay
      g={g}
      c="tan"
      depth={4}
      shape={(p) => (
        <Path {...p} d="M50 16 C80 16 95 34 92 54 C89 72 72 84 54 81 C46 80 45 72 38 73 C30 74 30 84 19 80 C6 75 5 54 11 40 C18 24 33 16 50 16 Z" />
      )}
    />
    <Shine cx={28} cy={28} rx={10} ry={4} rot={-25} o={0.45} />
    <Ellipse cx={26} cy={63} rx={7} ry={6} fill="#FFFFFF" stroke="#A16207" strokeWidth={1.4} />
    {([['red', 36, 32], ['gold', 56, 27], ['green', 74, 38], ['purple', 76, 58]] as [ArtColor, number, number][]).map(([c, x, y]) => (
      <G key={c}>
        <Clay g={g} c={c} depth={2} shape={(p) => <Ellipse {...p} cx={x} cy={y} rx={8} ry={7} />} />
        <Shine cx={x - 3} cy={y - 3} rx={2.2} ry={1.4} rot={-20} o={0.85} />
      </G>
    ))}
    <G transform="rotate(-48 50 66)">
      <Clay g={g} c="red" depth={2} shape={(p) => <Rect {...p} x={44} y={62} width={44} height={8} rx={4} />} />
      <Rect x={36} y={61} width={9} height={10} rx={1.5} fill="#FBBF24" stroke="#B45309" strokeWidth={0.8} />
      <Path d="M36 61 Q24 66 36 71 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth={0.8} />
    </G>
  </>
));

export const ShopCartArt = art((g) => (
  <>
    <Shadow cx={52} cy={92} rx={34} />
    <Apple g={g} x={14} y={-2} s={0.42} face={false} />
    <Coin g={g} cx={64} cy={30} r={11} />
    <Path d="M6 22 H16 L26 66 H80" stroke="#BE123C" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Clay g={g} c="red" depth={3} shape={(p) => <Path {...p} d="M18 38 H88 L80 64 H26 Z" opacity={0.95} />} />
    {[34, 46, 58, 70].map((x) => (
      <Path key={x} d={`M${x} 40 L${x - 2} 62`} stroke="#FFFFFF" strokeWidth={1.6} opacity={0.7} />
    ))}
    <Path d="M20 50 H84" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.7} />
    <Shine cx={30} cy={42} rx={6} ry={2.2} rot={0} />
    {[32, 72].map((x) => (
      <G key={x}>
        <Clay g={g} c="dark" depth={1.5} shape={(p) => <Circle {...p} cx={x} cy={78} r={7} />} />
        <Circle cx={x} cy={78} r={2.8} fill="#CBD5E1" />
      </G>
    ))}
  </>
));

export const JigsawArt = art((g) => (
  <>
    <Polygon points={starPts(50, 50, 46, 30, 12)} fill="#FDE68A" opacity={0.45} />
    <Shadow cx={52} cy={88} rx={36} />
    {/* right piece: socket cut into its left side; knob on top */}
    <Clay
      g={g}
      c="sky"
      depth={4}
      shape={(p) => (
        <Path
          {...p}
          d="M58 32 H68 A7 7 0 1 1 80 32 H92 V72 H58 V59 A8 8 0 1 0 58 45 Z"
          strokeLinejoin="round"
        />
      )}
    />
    {/* left piece: knob pushes right into the socket */}
    <Clay
      g={g}
      c="gold"
      depth={4}
      shape={(p) => <Path {...p} d="M10 32 H52 V45 A8 8 0 1 1 52 59 V72 H10 Z" strokeLinejoin="round" />}
    />
    <Shine cx={20} cy={38} rx={7} ry={3} rot={-10} />
    <Shine cx={84} cy={40} rx={3} ry={5} rot={0} />
    <Face cx={31} cy={50} s={0.95} />
    <Sparkle x={86} y={14} r={6} />
    <Sparkle x={10} y={14} r={4.5} />
  </>
));

export const FindObjectArt = art((g) => <Magnifier g={g} inner={<Star g={g} cx={42} cy={44} R={18} />} />);

export const MemoryCardsArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={34} />
    <G transform="rotate(-12 34 52)">
      <Clay g={g} c="purple" depth={4} shape={(p) => <Rect {...p} x={14} y={22} width={40} height={56} rx={9} />} />
      <Rect x={19} y={27} width={30} height={46} rx={6} fill="none" stroke="#DDD6FE" strokeWidth={1.4} opacity={0.8} />
      <Label x={34} y={62} size={30} text="?" color="gold" g={g} depth={2} />
    </G>
    <G transform="rotate(10 66 52)">
      <Clay g={g} c="white" depth={4} shape={(p) => <Rect {...p} x={46} y={22} width={40} height={56} rx={9} />} />
      <Star g={g} cx={66} cy={50} R={15} />
    </G>
    <Sparkle x={90} y={14} r={5} />
  </>
));

export const WordTilesArt = art((g) => (
  <>
    <Shadow cx={46} cy={90} rx={36} />
    <Tile g={g} x={6} y={34} s={28} c="red" letter="C" rot={-8} />
    <Tile g={g} x={36} y={28} s={28} c="gold" letter="A" rot={2} />
    <Tile g={g} x={66} y={34} s={28} c="sky" letter="T" rot={9} />
    <Pencil g={g} x={56} y={80} rot={-18} s={0.75} />
    <Sparkle x={50} y={12} r={5} />
  </>
));

/** Cartoon boxing glove (fist up, thumb on the inside, white striped cuff below), tilted toward the centre. */
const Glove: React.FC<{ g: Fill; c: ArtColor; flip?: boolean }> = ({ g, c, flip }) => (
  <G transform={`${flip ? 'translate(100 0) scale(-1 1) ' : ''}rotate(22 30 56)`}>
    <Clay g={g} c="white" depth={3} shape={(p) => <Rect {...p} x={17} y={62} width={26} height={20} rx={6} />} />
    <Rect x={17} y={70} width={26} height={4} fill={PAL[c][1]} opacity={0.85} />
    <Clay
      g={g}
      c={c}
      depth={3}
      shape={(p) => <Path {...p} d="M14 44 C12 26 24 16 36 18 C48 20 52 32 48 46 C46 56 40 64 30 64 C20 64 15 56 14 44 Z" />}
    />
    <Clay g={g} c={c} depth={2} shape={(p) => <Ellipse {...p} cx={45} cy={50} rx={7} ry={11} transform="rotate(-18 45 50)" />} />
    <Path d="M40 40 Q44 46 42 54" stroke={PAL[c][3]} strokeWidth={1.4} fill="none" opacity={0.6} />
    <Shine cx={24} cy={28} rx={6} ry={3} rot={-25} o={0.7} />
  </G>
);

export const BoxingGlovesArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={38} />
    <Glove g={g} c="red" />
    <Glove g={g} c="blue" flip />
    <Polygon points="50,10 56,24 66,18 60,32 72,34 58,40" fill="#FBBF24" stroke="#D97706" strokeWidth={1} strokeLinejoin="round" />
    <Sparkle x={50} y={52} r={7} />
    <Sparkle x={36} y={14} r={4} />
  </>
));

export const MathJellyArt = art((g, uid) => (
  <>
    <Circle cx={50} cy={52} r={44} fill={`url(#${uid}glow)`} />
    <Ellipse cx={50} cy={80} rx={36} ry={9} fill="#E9D5FF" stroke="#C4B5FD" strokeWidth={1.4} />
    <Jelly g={g} kind="plus" c="mint" cx={30} cy={34} s={0.75} />
    <Jelly g={g} kind="minus" c="red" cx={72} cy={34} s={0.75} />
    <Jelly g={g} kind="equals" c="sky" cx={50} cy={64} s={0.85} face />
    <Sparkle x={90} y={60} r={5} />
  </>
));

// ---- math topics

const signArt = (kind: 'plus' | 'minus' | 'times' | 'divide', c: ArtColor) =>
  art((g) => (
    <>
      <Shadow cx={50} cy={90} rx={28} />
      <Jelly g={g} kind={kind} c={c} cx={50} cy={50} s={1.7} face />
      {kind === 'minus' ? <Coin g={g} cx={80} cy={22} r={7} /> : <Sparkle x={84} y={16} r={6} />}
    </>
  ));
export const PlusArt = signArt('plus', 'mint');
export const MinusArt = signArt('minus', 'red');
export const TimesArt = signArt('times', 'sky');
export const DivideArt = signArt('divide', 'purple');

export const PizzaArt = art((g) => {
  const cx = 44;
  const cy = 52;
  const R = 36;
  const pt = (a: number, r = R, dx = 0) =>
    `${(cx + dx + Math.cos((a * Math.PI) / 180) * r).toFixed(2)} ${(cy + Math.sin((a * Math.PI) / 180) * r).toFixed(2)}`;
  // whole pizza minus a 60deg wedge on the right; the wedge sits 10 units further right
  const pie = `M${cx} ${cy} L${pt(30)} A${R} ${R} 0 1 1 ${pt(-30)} Z`;
  const cheese = `M${cx} ${cy} L${pt(30, R - 7)} A${R - 7} ${R - 7} 0 1 1 ${pt(-30, R - 7)} Z`;
  const slice = `M${cx + 10} ${cy} L${pt(-28, R, 10)} A${R} ${R} 0 0 1 ${pt(28, R, 10)} Z`;
  return (
    <>
      <Shadow cx={50} cy={92} rx={36} />
      <Clay g={g} c="orange" depth={4} shape={(p) => <Path {...p} d={pie} />} />
      <Path d={cheese} fill={g('yellow')} />
      <Clay g={g} c="orange" depth={4} shape={(p) => <Path {...p} d={slice} />} />
      {[[30, 34], [52, 28], [24, 58], [44, 72], [60, 66], [40, 48], [72, 50]].map(([x, y]) => (
        <G key={`${x}${y}`}>
          <Circle cx={x} cy={y} r={5} fill={g('red')} stroke="#9F1239" strokeWidth={0.8} />
          <Circle cx={x - 1.5} cy={y - 1.5} r={1.4} fill="#FFFFFF" opacity={0.7} />
        </G>
      ))}
      <Shine cx={30} cy={24} rx={8} ry={3} rot={-25} o={0.5} />
    </>
  );
});

export const DecimalArt = art((g) => (
  <>
    <Shadow cx={50} cy={88} rx={30} />
    <Label x={50} y={66} size={46} text="0.5" color="sky" g={g} />
    <Sparkle x={86} y={18} r={6} />
    <Sparkle x={14} y={22} r={4.5} />
  </>
));

export const GeometryArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={38} />
    <Polygon points="44,10 14,82 60,86" fill={g('pink')} stroke="#BE185D" strokeWidth={1} strokeLinejoin="round" />
    <Polygon points="44,10 60,86 78,74" fill={g('red')} stroke="#9F1239" strokeWidth={1} strokeLinejoin="round" />
    <Shine cx={34} cy={42} rx={3} ry={10} rot={20} o={0.5} />
    <Face cx={40} cy={64} s={0.8} />
    <Clay g={g} c="sky" depth={2} shape={(p) => <Circle {...p} cx={80} cy={76} r={13} />} />
    <Shine cx={76} cy={71} rx={3.5} ry={2.4} rot={-30} o={0.8} />
    <Sparkle x={84} y={20} r={6} />
  </>
));

export const RulerArt = art((g) => (
  <>
    <Shadow cx={50} cy={88} rx={36} />
    <G transform="rotate(-25 50 52)">
      <Clay g={g} c="gold" depth={4} shape={(p) => <Rect {...p} x={6} y={40} width={88} height={24} rx={5} />} />
      {Array.from({ length: 13 }, (_, i) => (
        <Path key={i} d={`M${12 + i * 6.5} 40 V${i % 4 === 0 ? 50 : 46}`} stroke="#92400E" strokeWidth={1.4} />
      ))}
      <Shine cx={22} cy={44} rx={8} ry={1.6} rot={0} />
      <Face cx={56} cy={54} s={0.65} />
    </G>
  </>
));

export const ClockArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={30} />
    <Path d="M30 78 L22 90 M70 78 L78 90" stroke="#BE123C" strokeWidth={5} strokeLinecap="round" />
    <Clay g={g} c="red" depth={2} shape={(p) => <Ellipse {...p} cx={24} cy={18} rx={11} ry={9} transform="rotate(-30 24 18)" />} />
    <Clay g={g} c="red" depth={2} shape={(p) => <Ellipse {...p} cx={76} cy={18} rx={11} ry={9} transform="rotate(30 76 18)" />} />
    <Clay g={g} c="red" depth={4} shape={(p) => <Circle {...p} cx={50} cy={52} r={36} />} />
    <Circle cx={50} cy={52} r={28} fill="#FFFBEB" stroke="#FCA5A5" strokeWidth={1} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      const r0 = i % 3 === 0 ? 20 : 23;
      return (
        <Path
          key={i}
          d={`M${50 + Math.cos(a) * r0} ${52 + Math.sin(a) * r0} L${50 + Math.cos(a) * 26} ${52 + Math.sin(a) * 26}`}
          stroke="#F59E0B"
          strokeWidth={i % 3 === 0 ? 2.4 : 1.4}
          strokeLinecap="round"
        />
      );
    })}
    <Path d="M50 52 V32" stroke="#0284C7" strokeWidth={4} strokeLinecap="round" />
    <Path d="M50 52 L64 44" stroke="#059669" strokeWidth={4} strokeLinecap="round" />
    <Circle cx={50} cy={52} r={3} fill="#F59E0B" />
    <Face cx={50} cy={64} s={0.75} />
    <Shine cx={30} cy={30} rx={6} ry={3} rot={-40} />
  </>
));

export const CoinsArt = art((g) => (
  <>
    <Shadow cx={46} cy={90} rx={36} />
    {[78, 70, 62].map((y) => (
      <G key={y}>
        <Ellipse cx={36} cy={y + 4} rx={26} ry={8} fill="#B45309" />
        <Rect x={10} y={y} width={52} height={4} fill="#D97706" />
        <Ellipse cx={36} cy={y} rx={26} ry={8} fill={g('gold')} stroke="#B45309" strokeWidth={0.8} />
      </G>
    ))}
    <Coin g={g} cx={66} cy={42} r={24} />
    <Sparkle x={88} y={14} r={6} />
    <Sparkle x={14} y={34} r={4.5} />
  </>
));

const BeadsBody: React.FC<{ g: Fill }> = ({ g }) => (
  <>
    <Shadow cx={50} cy={90} rx={38} />
    <Path d="M4 66 Q50 20 96 66" stroke="#64748B" strokeWidth={2.4} fill="none" />
    <Clay g={g} c="red" depth={2} shape={(p) => <Circle {...p} cx={14} cy={56} r={10} />} />
    <Shine cx={11} cy={52} rx={3} ry={2} o={0.8} />
    <Clay g={g} c="gold" depth={3} shape={(p) => <Rect {...p} x={30} y={30} width={20} height={20} rx={4} transform="rotate(-18 40 40)" />} />
    <Shine cx={36} cy={34} rx={4} ry={1.6} rot={-18} o={0.8} />
    <G>
      <Clay g={g} c="sky" depth={2} shape={(p) => <Rect {...p} x={56} y={30} width={16} height={20} rx={3} transform="rotate(16 64 40)" />} />
      <Ellipse cx={65.5} cy={30} rx={8} ry={3} fill="#BAE6FD" stroke="#0369A1" strokeWidth={0.8} transform="rotate(16 64 40)" />
    </G>
    <Clay g={g} c="red" depth={2} shape={(p) => <Circle {...p} cx={86} cy={56} r={10} />} />
    <Shine cx={83} cy={52} rx={3} ry={2} o={0.8} />
    <Sparkle x={50} y={74} r={6} />
  </>
);
export const BeadsArt = art((g) => <BeadsBody g={g} />);

export const MysteryBoxArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={34} />
    <Polygon points="18,30 30,18 86,18 74,30" fill={g('purple')} stroke="#5B21B6" strokeWidth={1} opacity={0.75} />
    <Polygon points="74,30 86,18 86,74 74,86" fill="#5B21B6" stroke="#4C1D95" strokeWidth={1} />
    <Clay g={g} c="purple" depth={0} shape={(p) => <Rect {...p} x={18} y={30} width={56} height={56} rx={8} />} />
    <Shine cx={28} cy={38} rx={8} ry={3} rot={-10} />
    <Label x={46} y={76} size={46} text="?" color="gold" g={g} />
    <Sparkle x={90} y={10} r={6} />
  </>
));

export const QuestionBubbleArt = art((g) => (
  <>
    <Bubble g={g} c="sky" />
    <SvgText x={50} y={60} fontSize={40} fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="#0369A1" strokeWidth={0.8}>
      ?
    </SvgText>
    <Sparkle x={90} y={86} r={5} />
  </>
));

export const ChatBubbleArt = art((g) => (
  <>
    <Bubble g={g} c="purple" />
    {[32, 50, 68].map((x) => (
      <G key={x}>
        <Circle cx={x} cy={44} r={6} fill="#FFFFFF" stroke="#DDD6FE" strokeWidth={0.8} />
      </G>
    ))}
    <Sparkle x={90} y={86} r={5} />
  </>
));

// ---- science topics

export const PawArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={30} />
    <Clay g={g} c="tan" depth={4} shape={(p) => <Path {...p} d="M50 46 C66 46 78 60 76 74 C74 86 62 86 50 82 C38 86 26 86 24 74 C22 60 34 46 50 46 Z" />} />
    <Ellipse cx={50} cy={68} rx={14} ry={10} fill={g('pink')} />
    {[[20, 40, -20], [36, 24, -8], [64, 24, 8], [80, 40, 20]].map(([x, y, r]) => (
      <G key={x}>
        <Clay g={g} c="tan" depth={3} shape={(p) => <Ellipse {...p} cx={x} cy={y} rx={9} ry={11} transform={`rotate(${r} ${x} ${y})`} />} />
        <Ellipse cx={x} cy={y + 1.5} rx={5} ry={6} fill={g('pink')} transform={`rotate(${r} ${x} ${y})`} />
      </G>
    ))}
    <Shine cx={40} cy={52} rx={6} ry={2.4} rot={-10} o={0.45} />
  </>
));

export const SproutArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={26} />
    <Path d="M50 56 Q48 40 52 26" stroke="#15803D" strokeWidth={4} strokeLinecap="round" fill="none" />
    <Clay g={g} c="green" depth={2} shape={(p) => <Ellipse {...p} cx={36} cy={30} rx={15} ry={8} transform="rotate(25 36 30)" />} />
    <Clay g={g} c="mint" depth={2} shape={(p) => <Ellipse {...p} cx={66} cy={22} rx={16} ry={8} transform="rotate(-25 66 22)" />} />
    <Circle cx={72} cy={16} r={3.4} fill="#E0F2FE" stroke="#7DD3FC" strokeWidth={0.8} />
    <Circle cx={71} cy={15} r={1} fill="#FFFFFF" />
    <Clay g={g} c="orange" depth={3} shape={(p) => <Path {...p} d="M24 60 H76 L68 90 H32 Z" />} />
    <Clay g={g} c="orange" depth={2} shape={(p) => <Rect {...p} x={20} y={54} width={60} height={10} rx={4} />} />
    <Ellipse cx={50} cy={56} rx={26} ry={3} fill="#78350F" />
    <Face cx={50} cy={74} s={0.75} />
  </>
));

export const HeartArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={26} />
    <Clay g={g} c="red" depth={4} shape={(p) => <Path {...p} d="M50 86 C20 66 8 50 10 34 C12 18 32 12 50 30 C68 12 88 18 90 34 C92 50 80 66 50 86 Z" />} />
    <Shine cx={26} cy={30} rx={7} ry={4} rot={-35} />
    <Face cx={50} cy={46} s={1.1} />
    <Sparkle x={88} y={10} r={5} />
  </>
));

export const AppleArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={28} />
    <Apple g={g} />
  </>
));

export const DropArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={24} />
    <Clay g={g} c="sky" depth={4} shape={(p) => <Path {...p} d="M50 8 C50 8 20 44 20 62 A30 30 0 0 0 80 62 C80 44 50 8 50 8 Z" />} />
    <Shine cx={36} cy={50} rx={4} ry={10} rot={15} />
    <Face cx={50} cy={64} s={1} />
    <Path d="M78 22 Q88 18 96 22 M76 30 Q86 26 94 30" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" fill="none" />
  </>
));

export const WeatherArt = art((g) => (
  <>
    {(['red', 'gold', 'mint', 'sky'] as ArtColor[]).map((c, i) => (
      <Path key={c} d={`M${10 + i * 6} 64 A${34 - i * 6} ${34 - i * 6} 0 0 1 ${78 - i * 6} 64`} stroke={g(c)} strokeWidth={5.4} fill="none" />
    ))}
    <Polygon points={starPts(64, 32, 24, 18, 12)} fill={g('yellow')} stroke="#CA8A04" strokeWidth={0.8} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Circle {...p} cx={64} cy={32} r={16} />} />
    <Face cx={64} cy={33} s={0.7} />
    <Ellipse cx={58} cy={52} rx={20} ry={5} fill="#0F172A" opacity={0.12} />
    {[[30, 70, 14], [46, 62, 16], [62, 70, 13], [46, 76, 15]].map(([x, y, r]) => (
      <Circle key={`${x}${y}`} cx={x} cy={y + 2.5} r={r} fill="#CBD5E1" />
    ))}
    {[[30, 70, 14], [46, 62, 16], [62, 70, 13], [46, 76, 15]].map(([x, y, r]) => (
      <Circle key={`w${x}${y}`} cx={x} cy={y} r={r} fill={g('white')} />
    ))}
    <Shine cx={40} cy={56} rx={6} ry={2.6} rot={-15} o={0.9} />
    <Face cx={46} cy={70} s={0.75} />
  </>
));

export const MagnifierArt = art((g) => <Magnifier g={g} inner={<Sparkle x={42} y={42} r={12} />} />);

export const RocketArt = art((g) => (
  <>
    <Path d="M42 80 Q50 100 58 80 Z" fill={g('orange')} />
    <Path d="M45 80 Q50 92 55 80 Z" fill={g('yellow')} />
    <Clay g={g} c="red" depth={2} shape={(p) => <Path {...p} d="M34 56 L20 78 L36 72 Z" />} />
    <Clay g={g} c="red" depth={2} shape={(p) => <Path {...p} d="M66 56 L80 78 L64 72 Z" />} />
    <Clay g={g} c="white" depth={3} shape={(p) => <Path {...p} d="M50 6 C66 18 70 40 66 76 H34 C30 40 34 18 50 6 Z" />} />
    <Path d="M50 6 C60 13 64 22 65.6 30 H34.4 C36 22 40 13 50 6 Z" fill={g('red')} stroke="#9F1239" strokeWidth={0.8} />
    <Circle cx={50} cy={46} r={9} fill="#94A3B8" />
    <Circle cx={50} cy={46} r={6.5} fill={g('sky')} />
    <Circle cx={48} cy={44} r={2} fill="#FFFFFF" opacity={0.85} />
    <Shine cx={40} cy={40} rx={2.4} ry={10} rot={8} o={0.7} />
    <Sparkle x={86} y={18} r={6} />
    <Sparkle x={12} y={30} r={4.5} />
  </>
));

// ---- english topics

export const MegaphoneArt = art((g) => (
  <>
    <Shadow cx={46} cy={92} rx={30} />
    <Rect x={30} y={60} width={10} height={22} rx={3} fill="#334155" />
    <Clay g={g} c="red" depth={3} shape={(p) => <Path {...p} d="M14 42 L66 20 V82 L14 60 Z" />} />
    <Clay g={g} c="red" depth={0} shape={(p) => <Ellipse {...p} cx={66} cy={51} rx={8} ry={31} />} />
    <Ellipse cx={68} cy={51} rx={4.5} ry={24} fill="#9F1239" />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Rect {...p} x={8} y={40} width={10} height={22} rx={4} />} />
    <Shine cx={30} cy={38} rx={10} ry={2.4} rot={-22} />
    {([['sky', 10], ['mint', 18], ['gold', 26]] as [ArtColor, number][]).map(([c, r]) => (
      <Path key={c} d={`M${78 + r * 0.3} ${51 - r} Q${78 + r} 51 ${78 + r * 0.3} ${51 + r}`} stroke={g(c)} strokeWidth={4} strokeLinecap="round" fill="none" />
    ))}
  </>
));

export const VowelsArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={38} />
    <Tile g={g} x={6} y={38} s={27} c="red" letter="A" rot={-8} />
    <Tile g={g} x={36} y={26} s={27} c="mint" letter="E" rot={3} />
    <Tile g={g} x={66} y={38} s={27} c="sky" letter="I" rot={9} />
    <Sparkle x={50} y={10} r={5} />
  </>
));

export const GrammarArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={36} />
    <Label x={36} y={74} size={64} text="A" color="red" g={g} depth={4} />
    <Label x={74} y={76} size={46} text="a" color="sky" g={g} depth={3} />
    <Sparkle x={88} y={16} r={6} />
  </>
));

export const HouseArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={36} />
    <Clay g={g} c="brown" depth={2} shape={(p) => <Rect {...p} x={64} y={16} width={10} height={22} rx={2} />} />
    <Clay g={g} c="orange" depth={4} shape={(p) => <Rect {...p} x={18} y={44} width={64} height={44} rx={5} />} />
    <Clay g={g} c="red" depth={4} shape={(p) => <Path {...p} d="M8 48 L50 12 L92 48 Z" strokeLinejoin="round" />} />
    <Shine cx={34} cy={30} rx={8} ry={2.4} rot={-40} o={0.5} />
    <Path d="M42 88 V66 A8 8 0 0 1 58 66 V88 Z" fill={g('brown')} stroke="#5C2E0E" strokeWidth={0.8} />
    <Circle cx={54} cy={78} r={1.4} fill="#FBBF24" />
    {[24, 64].map((x) => (
      <G key={x}>
        <Rect x={x} y={54} width={13} height={12} rx={2.5} fill={g('sky')} stroke="#0369A1" strokeWidth={0.8} />
        <Path d={`M${x + 6.5} 54 V66 M${x} 60 H${x + 13}`} stroke="#FFFFFF" strokeWidth={1.2} />
      </G>
    ))}
  </>
));

export const SneakerArt = art((g) => (
  <>
    <Shadow cx={52} cy={88} rx={40} />
    {[[18, 34, 30], [14, 42, 18], [16, 50, 6]].map(([x, y, r]) => (
      <Ellipse key={y} cx={x} cy={y} rx={12} ry={4.5} fill={g('white')} stroke="#CBD5E1" strokeWidth={0.8} transform={`rotate(${r} ${x} ${y})`} />
    ))}
    <Clay g={g} c="sky" depth={0} shape={(p) => <Path {...p} d="M22 72 L26 40 Q30 34 40 36 L52 48 Q70 52 84 58 Q94 62 92 72 Z" strokeLinejoin="round" />} />
    <Clay g={g} c="white" depth={3} shape={(p) => <Rect {...p} x={16} y={70} width={80} height={12} rx={6} />} />
    <Rect x={16} y={78} width={80} height={4} rx={2} fill="#F43F5E" />
    {[0, 1, 2].map((i) => (
      <Path key={i} d={`M${38 + i * 6} ${42 + i * 3} L${46 + i * 6} ${46 + i * 3}`} stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" />
    ))}
    <Polygon points={starPts(40, 60, 6, 2.6)} fill="#FDE047" stroke="#CA8A04" strokeWidth={0.6} />
    <Shine cx={32} cy={46} rx={2.4} ry={7} rot={10} />
  </>
));

export const MusicArt = art((g) => (
  <>
    <Path d="M18 56 C18 26 82 26 82 56" stroke={g('purple')} strokeWidth={7} strokeLinecap="round" fill="none" />
    <Path d="M18 56 C18 26 82 26 82 56" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.5} />
    <Path d="M40 30 L66 24 V58 M40 30 V66" stroke="#6D28D9" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M40 30 L66 24 V31 L40 37 Z" fill="#6D28D9" />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Ellipse {...p} cx={35} cy={67} rx={8} ry={6} transform="rotate(-20 35 67)" />} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Ellipse {...p} cx={61} cy={59} rx={8} ry={6} transform="rotate(-20 61 59)" />} />
    {[18, 82].map((x) => (
      <G key={x}>
        <Clay g={g} c="purple" depth={3} shape={(p) => <Rect {...p} x={x - 9} y={50} width={18} height={26} rx={8} />} />
        <Shine cx={x - 3} cy={56} rx={2.2} ry={5} rot={0} />
      </G>
    ))}
    <Sparkle x={50} y={12} r={5} />
    <Sparkle x={88} y={22} r={4} />
    <Sparkle x={50} y={86} r={4} color="#C4B5FD" />
  </>
));

export const PencilArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={34} />
    <Pencil g={g} x={52} y={50} rot={-35} s={1.35} face />
    <Sparkle x={86} y={84} r={5} />
  </>
));

// ---- gk topics

export const MapPinArt = art((g) => (
  <>
    <Ellipse cx={50} cy={88} rx={34} ry={8} fill={g('green')} stroke="#15803D" strokeWidth={0.8} />
    <Clay g={g} c="red" depth={4} shape={(p) => <Path {...p} d="M50 86 C34 62 22 50 22 36 A28 28 0 0 1 78 36 C78 50 66 62 50 86 Z" />} />
    <Circle cx={50} cy={36} r={11} fill="#FFFFFF" stroke="#FECDD3" strokeWidth={1} />
    <Shine cx={34} cy={24} rx={4} ry={8} rot={30} />
    <Sparkle x={88} y={14} r={5} />
  </>
));

export const FlagArt = art((g) => (
  <>
    <Shadow cx={28} cy={92} rx={16} />
    <Rect x={20} y={10} width={6} height={82} rx={3} fill={g('grey')} stroke="#64748B" strokeWidth={0.8} />
    <Circle cx={23} cy={10} r={5} fill={g('gold')} stroke="#B45309" strokeWidth={0.8} />
    <Clay g={g} c="sky" depth={3} shape={(p) => <Path {...p} d="M26 16 Q46 8 62 16 T94 16 V56 Q78 48 62 56 T26 56 Z" />} />
    <Polygon points={starPts(58, 36, 11, 5)} fill="#FDE047" stroke="#CA8A04" strokeWidth={0.8} />
    <Shine cx={38} cy={22} rx={6} ry={2} rot={-10} />
  </>
));

export const TempleArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={40} />
    {[14, 86].map((x) => (
      <G key={x}>
        <Rect x={x - 5} y={36} width={10} height={52} rx={2} fill={g('cream')} stroke="#E0A82E" strokeWidth={0.8} />
        <Clay g={g} c="gold" depth={1.5} shape={(p) => <Path {...p} d={`M${x - 7} 38 Q${x} 22 ${x + 7} 38 Z`} />} />
      </G>
    ))}
    <Clay g={g} c="cream" depth={3} shape={(p) => <Rect {...p} x={24} y={52} width={52} height={36} rx={3} />} />
    <Clay g={g} c="gold" depth={3} shape={(p) => <Path {...p} d="M26 54 C26 32 38 24 50 18 C62 24 74 32 74 54 Z" />} />
    <Path d="M50 18 V8" stroke="#D97706" strokeWidth={2.4} strokeLinecap="round" />
    <Circle cx={50} cy={7} r={2.6} fill="#F59E0B" />
    <Shine cx={38} cy={34} rx={3} ry={9} rot={20} />
    <Path d="M42 88 V72 A8 8 0 0 1 58 72 V88 Z" fill="#7C2D12" />
  </>
));

export const ScrollArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={36} />
    <Rect x={22} y={18} width={56} height={64} fill={g('cream')} stroke="#E0A82E" strokeWidth={1} />
    {[30, 40, 50, 60].map((y, i) => (
      <Path key={y} d={`M30 ${y} H${i % 2 ? 58 : 70}`} stroke="#D6B98A" strokeWidth={2.4} strokeLinecap="round" />
    ))}
    {[18, 82].map((y) => (
      <G key={y}>
        <Clay g={g} c="gold" depth={2} shape={(p) => <Rect {...p} x={14} y={y - 7} width={72} height={14} rx={7} />} />
        <Shine cx={26} cy={y - 3} rx={8} ry={1.6} rot={0} />
      </G>
    ))}
    <Clay g={g} c="red" depth={2} shape={(p) => <Circle {...p} cx={66} cy={66} r={8} />} />
  </>
));

export const TreasureMapArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={42} />
    <Polygon points="6,22 36,14 36,84 6,92" fill={g('cream')} stroke="#E0A82E" strokeWidth={1} />
    <Polygon points="36,14 64,22 64,92 36,84" fill={g('gold')} stroke="#B45309" strokeWidth={1} opacity={0.85} />
    <Polygon points="64,22 94,14 94,84 64,92" fill={g('cream')} stroke="#E0A82E" strokeWidth={1} />
    <Ellipse cx={22} cy={40} rx={10} ry={7} fill={g('green')} />
    <Path d="M22 50 Q30 76 50 66 T76 44" stroke="#E11D48" strokeWidth={2.6} strokeDasharray="4 4" strokeLinecap="round" fill="none" />
    <Path d="M70 34 L84 48 M84 34 L70 48" stroke="#9F1239" strokeWidth={6} strokeLinecap="round" transform="translate(0 2)" />
    <Path d="M70 34 L84 48 M84 34 L70 48" stroke={g('red')} strokeWidth={6} strokeLinecap="round" />
  </>
));

export const CarArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={42} />
    <Clay g={g} c="red" depth={2} shape={(p) => <Rect {...p} x={26} y={26} width={46} height={30} rx={11} />} />
    <Rect x={32} y={32} width={15} height={14} rx={4} fill={g('sky')} stroke="#0369A1" strokeWidth={0.8} />
    <Rect x={51} y={32} width={15} height={14} rx={4} fill={g('sky')} stroke="#0369A1" strokeWidth={0.8} />
    <Clay g={g} c="red" depth={3} shape={(p) => <Rect {...p} x={8} y={48} width={86} height={26} rx={12} />} />
    <Shine cx={24} cy={54} rx={9} ry={2.4} rot={0} />
    <Circle cx={88} cy={58} r={4} fill={g('yellow')} stroke="#CA8A04" strokeWidth={0.8} />
    <Path d="M42 64 Q50 70 58 64" stroke="#7F1D1D" strokeWidth={2} strokeLinecap="round" fill="none" />
    {[28, 74].map((x) => (
      <G key={x}>
        <Clay g={g} c="dark" depth={1.5} shape={(p) => <Circle {...p} cx={x} cy={76} r={10} />} />
        <Circle cx={x} cy={76} r={4} fill="#CBD5E1" />
      </G>
    ))}
  </>
));

export const GearsArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={36} />
    <Clay g={g} c="sky" depth={3} shape={(p) => <Path {...p} d={gearPath(72, 70, 20, 15, 8)} strokeLinejoin="round" />} />
    <Circle cx={72} cy={70} r={6} fill="#FFFFFF" stroke="#0369A1" strokeWidth={1} />
    <Clay g={g} c="gold" depth={4} shape={(p) => <Path {...p} d={gearPath(40, 40, 32, 25, 10)} strokeLinejoin="round" />} />
    <Circle cx={40} cy={40} r={10} fill="#FFFFFF" stroke="#B45309" strokeWidth={1.2} />
    <Shine cx={26} cy={26} rx={6} ry={3} rot={-40} />
    <Sparkle x={88} y={16} r={6} />
  </>
));

export const FeatherArt = art((g) => (
  <>
    <Path d="M20 94 Q38 60 70 14" stroke="#A16207" strokeWidth={2.6} strokeLinecap="round" fill="none" />
    <Clay g={g} c="teal" depth={2} shape={(p) => <Ellipse {...p} cx={56} cy={38} rx={22} ry={32} transform="rotate(34 56 38)" />} />
    {[...Array(7)].map((_, i) => (
      <Path key={i} d={`M${36 + i * 4} ${66 - i * 7} l${-10 + i} ${4}`} stroke="#5EEAD4" strokeWidth={1.2} strokeLinecap="round" />
    ))}
    <Ellipse cx={60} cy={30} rx={13} ry={15} fill={g('gold')} transform="rotate(34 60 30)" />
    <Ellipse cx={60} cy={30} rx={9} ry={10.5} fill={g('blue')} transform="rotate(34 60 30)" />
    <Ellipse cx={60} cy={30} rx={4.5} ry={5.5} fill="#1E1B4B" transform="rotate(34 60 30)" />
    <Circle cx={57} cy={27} r={1.6} fill="#FFFFFF" opacity={0.9} />
    <Shine cx={44} cy={40} rx={3} ry={10} rot={34} o={0.4} />
    <Sparkle x={86} y={70} r={5} />
  </>
));

export const MedalArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={24} />
    <Polygon points="30,4 46,4 58,44 42,44" fill={g('sky')} stroke="#0369A1" strokeWidth={0.8} />
    <Polygon points="70,4 54,4 42,44 58,44" fill={g('red')} stroke="#9F1239" strokeWidth={0.8} />
    <Coin g={g} cx={50} cy={64} r={25} />
    <Sparkle x={86} y={44} r={5} />
  </>
));

export const TrophyArt = art((g, uid) => (
  <>
    <Circle cx={50} cy={40} r={40} fill={`url(#${uid}glow)`} />
    <Shadow cx={50} cy={94} rx={28} />
    <Path d="M28 22 C10 22 12 46 32 46 M72 22 C90 22 88 46 68 46" stroke={g('gold')} strokeWidth={6} fill="none" />
    <Clay g={g} c="gold" depth={3} shape={(p) => <Path {...p} d="M24 14 H76 V26 C76 46 64 58 50 58 C36 58 24 46 24 26 Z" />} />
    <Ellipse cx={50} cy={15} rx={25} ry={4} fill="#D97706" />
    <Polygon points={starPts(50, 34, 10, 4.5)} fill="#FFF7D6" stroke="#D97706" strokeWidth={0.6} />
    <Rect x={45} y={58} width={10} height={12} fill={g('gold')} stroke="#B45309" strokeWidth={0.8} />
    <Clay g={g} c="purple" depth={3} shape={(p) => <Rect {...p} x={28} y={70} width={44} height={16} rx={4} />} />
    <Shine cx={34} cy={24} rx={3} ry={9} rot={10} />
  </>
));

// ---- logic topics

export const SeriesArt = art((g) => (
  <>
    <Shadow cx={50} cy={88} rx={40} />
    <Label x={20} y={70} size={42} text="2" color="red" g={g} />
    <Label x={50} y={58} size={42} text="4" color="mint" g={g} />
    <Label x={80} y={70} size={42} text="6" color="sky" g={g} />
    <Sparkle x={50} y={80} r={5} />
  </>
));

const Pear: React.FC<{ g: Fill; x: number; y: number; s: number }> = ({ g, x, y, s }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    <Path d="M50 20 Q52 12 58 8" stroke="#78350F" strokeWidth={3.4} strokeLinecap="round" fill="none" />
    <Clay g={g} c="green" shape={(p) => <Path {...p} d="M50 18 C60 18 62 32 66 42 C80 52 84 70 74 82 C64 92 36 92 26 82 C16 70 20 52 34 42 C38 32 40 18 50 18 Z" />} />
    <Shine cx={38} cy={52} rx={5} ry={10} rot={15} />
    <Face cx={50} cy={64} s={1.1} />
  </G>
);

export const OddOneOutArt = art((g) => (
  <>
    <Shadow cx={50} cy={94} rx={42} />
    <Apple g={g} x={-2} y={-4} s={0.5} face={false} />
    <Apple g={g} x={48} y={-4} s={0.5} face={false} />
    <Apple g={g} x={-2} y={46} s={0.5} face={false} />
    <Circle cx={74} cy={72} r={24} fill="#FEF3C7" opacity={0.9} />
    <Pear g={g} x={49} y={44} s={0.52} />
    <Sparkle x={94} y={52} r={5} />
  </>
));

export const ShapesTrioArt = art((g) => (
  <>
    <Shadow cx={50} cy={86} rx={44} />
    <Clay g={g} c="sky" depth={3} shape={(p) => <Circle {...p} cx={18} cy={62} r={14} />} />
    <Shine cx={14} cy={56} rx={4} ry={2.4} o={0.8} />
    <Clay g={g} c="red" depth={3} shape={(p) => <Polygon {...p} points="50,36 32,74 68,74" strokeLinejoin="round" />} />
    <Face cx={50} cy={62} s={0.6} />
    <Clay g={g} c="gold" depth={3} shape={(p) => <Rect {...p} x={70} y={48} width={26} height={26} rx={5} />} />
    <Shine cx={77} cy={53} rx={4} ry={1.8} rot={0} o={0.8} />
    <Sparkle x={50} y={18} r={6} />
  </>
));

export const RobotArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={30} />
    <Path d="M50 22 V10" stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Circle {...p} cx={50} cy={9} r={5} />} />
    {[14, 86].map((x) => (
      <Clay key={x} g={g} c="grey" depth={2} shape={(p) => <Rect {...p} x={x - 6} y={44} width={12} height={20} rx={5} />} />
    ))}
    <Clay g={g} c="sky" depth={4} shape={(p) => <Rect {...p} x={18} y={22} width={64} height={62} rx={18} />} />
    <Rect x={26} y={32} width={48} height={32} rx={11} fill="#0F172A" stroke="#0369A1" strokeWidth={1} />
    <Circle cx={39} cy={47} r={5.5} fill="#5EEAD4" />
    <Circle cx={61} cy={47} r={5.5} fill="#5EEAD4" />
    <Circle cx={37.6} cy={45.6} r={1.6} fill="#FFFFFF" />
    <Circle cx={59.6} cy={45.6} r={1.6} fill="#FFFFFF" />
    <Path d="M42 56 Q50 61 58 56" stroke="#5EEAD4" strokeWidth={2.2} strokeLinecap="round" fill="none" />
    {[34, 44, 56, 66].map((x, i) => (
      <Rect key={x} x={x - 3} y={70} width={6} height={6} rx={1.5} fill={(['#F43F5E', '#FBBF24', '#22C55E', '#FFFFFF'] as string[])[i]} />
    ))}
    <Shine cx={28} cy={28} rx={8} ry={3} rot={-25} />
  </>
));

export const KeyArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={36} />
    <G transform="rotate(-30 50 50)">
      <Clay g={g} c="gold" depth={4} shape={(p) => <Path {...p} d="M8 50 A18 18 0 1 1 44 50 A18 18 0 1 1 8 50 Z M18 50 A8 8 0 1 0 34 50 A8 8 0 1 0 18 50 Z" fillRule="evenodd" />} />
      <Clay g={g} c="gold" depth={4} shape={(p) => <Path {...p} d="M42 45 H92 V55 H86 V66 H78 V55 H72 V62 H64 V55 H42 Z" strokeLinejoin="round" />} />
      <Shine cx={18} cy={38} rx={5} ry={2.4} rot={-20} />
    </G>
    <Sparkle x={84} y={14} r={6} />
  </>
));

// ---- everyday icons (menus, seasons, habits, garden, certificates)

const CLOUD = 'M26 64 Q10 64 12 51 Q14 40 27 42 Q29 27 47 27 Q61 27 65 38 Q81 34 85 48 Q89 64 72 64 Z';
const drop = (x: number, y: number, s = 1) =>
  `M${x} ${y} Q${x + 5 * s} ${y + 8 * s} ${x + 5 * s} ${y + 11 * s} A${5 * s} ${5 * s} 0 0 1 ${x - 5 * s} ${y + 11 * s} Q${x - 5 * s} ${y + 8 * s} ${x} ${y} Z`;

export const StarArt = art((g, uid) => (
  <>
    <Circle cx={50} cy={50} r={44} fill={`url(#${uid}glow)`} />
    <Shadow cx={50} cy={93} rx={26} />
    <Star g={g} cx={50} cy={50} R={40} />
    <Sparkle x={86} y={16} r={6} />
    <Sparkle x={14} y={20} r={4.5} color="#FFFFFF" />
  </>
));

export const SunArt = art((g, uid) => (
  <>
    <Circle cx={50} cy={48} r={46} fill={`url(#${uid}glow)`} />
    {Array.from({ length: 8 }, (_, i) => (
      <G key={i} transform={`rotate(${i * 45} 50 48)`}>
        <Rect x={45.5} y={4} width={9} height={17} rx={4.5} fill={g('orange')} stroke={PAL.orange[3]} strokeWidth={0.8} strokeOpacity={0.6} />
      </G>
    ))}
    <Clay g={g} c="yellow" depth={4} shape={(p) => <Circle {...p} cx={50} cy={48} r={26} />} />
    <Shine cx={40} cy={37} rx={5} ry={10} rot={35} o={0.85} />
    <Face cx={50} cy={50} s={1.1} />
    <Sparkle x={84} y={16} r={6} color="#FDE047" />
  </>
));

export const RainArt = art((g) => (
  <>
    {/* Falling drops */}
    {[[26, 68], [50, 74], [74, 68]].map(([x, y]) => (
      <Clay key={x} g={g} c="sky" depth={2} shape={(p) => <Path {...p} d={drop(x, y, 1.2)} />} />
    ))}
    <G transform="translate(0 -6)">
      <Shadow cx={50} cy={76} rx={34} ry={4} />
      <Clay g={g} c="white" depth={4} shape={(p) => <Path {...p} d={CLOUD} />} />
      <Shine cx={36} cy={34} rx={8} ry={4} rot={-10} o={0.9} />
      <Face cx={50} cy={48} s={0.95} />
    </G>
    <Sparkle x={84} y={20} r={5} color="#38BDF8" />
  </>
));

export const SnowmanArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={28} />
    {/* Bottom Snowball */}
    <Clay g={g} c="white" depth={3} shape={(p) => <Circle {...p} cx={50} cy={68} r={22} />} />
    {/* Head Snowball */}
    <Clay g={g} c="white" depth={3} shape={(p) => <Circle {...p} cx={50} cy={35} r={16} />} />
    {/* Cozy Winter Beanie */}
    <Path d="M37 23 C37 10 63 10 63 23 Z" fill={g('blue')} stroke={PAL.blue[3]} strokeWidth={0.8} />
    <Clay g={g} c="sky" depth={1.5} shape={(p) => <Rect {...p} x={35} y={20} width={30} height={7} rx={3} />} />
    <Circle cx={50} cy={10} r={4.5} fill={g('white')} stroke="#CBD5E1" strokeWidth={0.8} />
    {/* Cozy Warm Red Scarf */}
    <Clay g={g} c="red" depth={2} shape={(p) => <Rect {...p} x={32} y={45} width={36} height={9} rx={4.5} />} />
    <Clay g={g} c="red" depth={2} shape={(p) => <Rect {...p} x={56} y={48} width={9} height={20} rx={3} />} />
    {/* Scarf White Stripes */}
    <Path d="M57 56 H64 M57 62 H64" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
    {/* Carrot Nose */}
    <Polygon points="50,38 66,41 50,44" fill={g('orange')} stroke={PAL.orange[3]} strokeWidth={0.6} />
    {/* Smiling Face */}
    <Ellipse cx={44} cy={32} rx={2} ry={2.4} fill="#1E1B2E" />
    <Ellipse cx={56} cy={32} rx={2} ry={2.4} fill="#1E1B2E" />
    <Circle cx={43.3} cy={31} r={0.7} fill="#FFFFFF" />
    <Circle cx={55.3} cy={31} r={0.7} fill="#FFFFFF" />
    <Ellipse cx={41} cy={37} rx={2.2} ry={1.2} fill="#FB7185" opacity={0.6} />
    <Ellipse cx={59} cy={37} rx={2.2} ry={1.2} fill="#FB7185" opacity={0.6} />
    {/* Charcoal Buttons */}
    {[60, 70, 80].map((y) => (
      <Circle key={y} cx={50} cy={y} r={2.2} fill="#334155" />
    ))}
    <Shine cx={42} cy={27} rx={3} ry={5} rot={30} o={0.9} />
    <Sparkle x={16} y={18} r={6} color="#7DD3FC" />
    <Sparkle x={86} y={24} r={5} color="#7DD3FC" />
  </>
));

export const UmbrellaArt = art((g) => (
  <>
    <Path d="M50 48 V82 Q50 90 42 90 Q34 90 34 82" stroke="#78350F" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    <Clay
      g={g}
      c="purple"
      depth={4}
      shape={(p) => <Path {...p} d="M10 52 C12 18 88 18 90 52 Q80 44 70 52 Q60 44 50 52 Q40 44 30 52 Q20 44 10 52 Z" />}
    />
    <Path d="M50 20 Q40 34 30 52 M50 20 Q60 34 70 52" stroke={PAL.purple[3]} strokeWidth={1.5} fill="none" opacity={0.55} />
    <Rect x={48} y={12} width={4} height={10} rx={2} fill="#78350F" />
    <Shine cx={30} cy={34} rx={4} ry={9} rot={40} o={0.8} />
    <Path d={drop(18, 64, 0.8)} fill={g('sky')} />
    <Path d={drop(84, 70, 0.8)} fill={g('sky')} />
  </>
));

export const MoonArt = art((g, uid) => (
  <>
    <Circle cx={50} cy={50} r={44} fill={`url(#${uid}glow)`} />
    <Clay g={g} c="gold" depth={3} shape={(p) => <Path {...p} d="M58 12 A38 38 0 1 0 88 68 A30 30 0 1 1 58 12 Z" />} />
    <Path d="M34 50 Q38 54 42 50" stroke="#1E1B2E" strokeWidth={2} strokeLinecap="round" fill="none" />
    <Path d="M37 62 Q42 66 47 62" stroke="#4A2511" strokeWidth={1.6} strokeLinecap="round" fill="none" />
    <Ellipse cx={30} cy={60} rx={3} ry={1.8} fill="#FB7185" opacity={0.5} />
    <Shine cx={28} cy={34} rx={4} ry={9} rot={25} />
    <Sparkle x={78} y={22} r={7} />
    <Sparkle x={70} y={44} r={4} />
  </>
));

export const CrescentArt = MoonArt;

const bloom = (petal: ArtColor, center: ArtColor, petals = 5, r = 13) =>
  art((g) => (
    <>
      <Shadow cx={50} cy={93} rx={18} />
      <Path d="M50 54 Q48 74 50 90" stroke="#15803D" strokeWidth={5} strokeLinecap="round" fill="none" />
      <Clay g={g} c="green" depth={2} shape={(p) => <Path {...p} d="M50 76 Q64 62 78 68 Q66 82 50 76 Z" />} />
      {Array.from({ length: petals }, (_, i) => {
        const a = ((i * (360 / petals) - 90) * Math.PI) / 180;
        return (
          <Clay key={i} g={g} c={petal} depth={2} shape={(p) => <Circle {...p} cx={50 + Math.cos(a) * 17} cy={38 + Math.sin(a) * 17} r={r} />} />
        );
      })}
      <Clay g={g} c={center} depth={2} shape={(p) => <Circle {...p} cx={50} cy={38} r={12} />} />
      <Face cx={50} cy={39} s={0.55} />
      <Shine cx={36} cy={22} rx={3} ry={6} rot={30} />
    </>
  ));

export const FlowerArt = bloom('pink', 'yellow');
export const RoseArt = bloom('red', 'pink', 6, 11);
export const SunflowerArt = bloom('gold', 'brown', 8, 10);
export const LotusArt = bloom('pink', 'cream', 7, 10);

export const StrawberryArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={24} />
    <Clay g={g} c="red" depth={4} shape={(p) => <Path {...p} d="M50 88 C30 80 16 56 22 40 C28 26 72 26 78 40 C84 56 70 80 50 88 Z" />} />
    {[[36, 46], [50, 42], [64, 46], [42, 60], [58, 60], [50, 74]].map(([x, y]) => (
      <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx={1.6} ry={2.4} fill="#FDE68A" />
    ))}
    <Clay g={g} c="green" depth={2} shape={(p) => <Path {...p} d="M30 32 L40 20 L46 28 L50 14 L54 28 L60 20 L70 32 Q50 40 30 32 Z" />} />
    <Face cx={50} cy={56} s={0.8} />
    <Shine cx={32} cy={46} rx={4} ry={8} rot={20} />
  </>
));

export const MangoArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={26} />
    <Path d="M56 22 Q58 14 64 10" stroke="#78350F" strokeWidth={3.4} strokeLinecap="round" fill="none" />
    <Clay g={g} c="green" depth={1.5} shape={(p) => <Path {...p} d="M60 16 Q74 6 86 14 Q74 26 60 16 Z" />} />
    <Clay g={g} c="orange" depth={4} shape={(p) => <Path {...p} d="M56 22 C80 22 88 50 78 70 C68 90 36 92 24 76 C12 60 22 44 34 38 C42 34 44 22 56 22 Z" />} />
    <Path d="M56 22 C80 22 88 50 78 70" stroke="#FDE047" strokeWidth={6} fill="none" opacity={0.35} />
    <Face cx={50} cy={60} s={1.05} />
    <Shine cx={36} cy={48} rx={4} ry={9} rot={30} />
  </>
));

export const LeafArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={22} />
    <Path d="M42 80 Q38 88 32 92" stroke="#78350F" strokeWidth={4} strokeLinecap="round" fill="none" />
    <Clay g={g} c="orange" depth={4} shape={(p) => <Path {...p} d="M54 10 C82 22 88 54 66 76 C56 86 42 86 36 78 C16 56 24 24 54 10 Z" />} />
    <Path d="M42 80 Q50 46 56 16 M48 56 L66 44 M46 66 L32 52 M51 40 L38 30" stroke={PAL.orange[3]} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.6} />
    <Shine cx={40} cy={34} rx={4} ry={10} rot={25} />
  </>
));

export const SeedArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={26} />
    <Clay g={g} c="brown" depth={4} shape={(p) => <Path {...p} d="M50 18 C74 18 84 46 80 64 C76 82 64 88 50 88 C36 88 24 82 20 64 C16 46 26 18 50 18 Z" />} />
    <Path d="M50 18 Q40 10 34 14 Q42 18 50 18 Z" fill={g('green')} />
    <Face cx={50} cy={58} s={1.1} />
    <Shine cx={36} cy={38} rx={5} ry={11} rot={20} o={0.45} />
  </>
));

export const BackpackArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={28} />
    <Path d="M38 26 V18 Q38 10 50 10 Q62 10 62 18 V26" stroke={PAL.red[3]} strokeWidth={5} fill="none" strokeLinecap="round" />
    <Clay g={g} c="red" depth={4} shape={(p) => <Rect {...p} x={20} y={22} width={60} height={66} rx={18} />} />
    <Clay g={g} c="orange" depth={3} shape={(p) => <Rect {...p} x={30} y={58} width={40} height={22} rx={8} />} />
    <Rect x={44} y={56} width={12} height={5} rx={2} fill="#FDE047" stroke="#CA8A04" strokeWidth={0.6} />
    <Face cx={50} cy={40} s={0.95} />
    <Shine cx={30} cy={34} rx={4} ry={9} rot={15} />
  </>
));

export const BookArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={34} />
    <Clay g={g} c="blue" depth={4} shape={(p) => <Path {...p} d="M50 32 Q30 22 8 28 V84 Q30 78 50 88 Q70 78 92 84 V28 Q70 22 50 32 Z" />} />
    <Path d="M50 30 Q32 20 14 24 V78 Q32 74 50 84 Z" fill={g('white')} stroke="#CBD5E1" strokeWidth={0.8} />
    <Path d="M50 30 Q68 20 86 24 V78 Q68 74 50 84 Z" fill={g('cream')} stroke="#E0A82E" strokeWidth={0.6} strokeOpacity={0.6} />
    {[40, 50, 60].map((y) => (
      <G key={y}>
        <Path d={`M20 ${y - 6} Q32 ${y - 9} 44 ${y - 3}`} stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
        <Path d={`M56 ${y - 3} Q68 ${y - 9} 80 ${y - 6}`} stroke="#E0A82E" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.55} />
      </G>
    ))}
    <Sparkle x={50} y={14} r={8} />
  </>
));

export const CalendarArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={30} />
    <Clay g={g} c="white" depth={4} shape={(p) => <Rect {...p} x={14} y={20} width={72} height={68} rx={14} />} />
    <Path d="M14 34 Q14 20 28 20 H72 Q86 20 86 34 V40 H14 Z" fill={g('red')} stroke={PAL.red[3]} strokeWidth={0.8} />
    {[32, 68].map((x) => (
      <Rect key={x} x={x - 3.5} y={12} width={7} height={16} rx={3.5} fill={g('dark')} />
    ))}
    <Label x={50} y={78} size={34} text="7" color="sky" g={g} />
    <Shine cx={26} cy={28} rx={6} ry={2.5} rot={-8} o={0.7} />
  </>
));

export const GiftArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={30} />
    <Clay g={g} c="pink" depth={4} shape={(p) => <Rect {...p} x={18} y={46} width={64} height={42} rx={8} />} />
    <Clay g={g} c="pink" depth={3} shape={(p) => <Rect {...p} x={13} y={34} width={74} height={17} rx={6} />} />
    <Rect x={44} y={34} width={12} height={54} fill={g('gold')} stroke={PAL.gold[3]} strokeWidth={0.6} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Path {...p} d="M50 34 C36 14 22 22 30 32 Q38 36 50 34 Z" />} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Path {...p} d="M50 34 C64 14 78 22 70 32 Q62 36 50 34 Z" />} />
    <Shine cx={26} cy={56} rx={3.5} ry={8} rot={10} />
    <Sparkle x={86} y={18} r={6} />
  </>
));

export const GamepadArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={34} />
    <Clay
      g={g}
      c="purple"
      depth={5}
      shape={(p) => <Path {...p} d="M30 30 H70 Q88 30 91 54 Q93 78 78 80 Q69 80 63 67 H37 Q31 80 22 80 Q7 78 9 54 Q12 30 30 30 Z" />}
    />
    <Path d="M23 44 H31 V50 H37 V58 H31 V64 H23 V58 H17 V50 H23 Z" fill="#FFFFFF" stroke={PAL.purple[3]} strokeWidth={0.8} />
    <Circle cx={70} cy={46} r={5} fill={g('gold')} />
    <Circle cx={80} cy={55} r={5} fill={g('red')} />
    <Circle cx={60} cy={55} r={5} fill={g('mint')} />
    <Circle cx={70} cy={64} r={5} fill={g('sky')} />
    <Shine cx={30} cy={38} rx={9} ry={3} rot={-8} />
  </>
));

export const ChartArt = art((g) => (
  <>
    <Shadow cx={50} cy={91} rx={34} />
    {([['mint', 16, 56], ['sky', 40, 40], ['pink', 64, 22]] as [ArtColor, number, number][]).map(([c, x, y]) => (
      <G key={c}>
        <Clay g={g} c={c} depth={4} shape={(p) => <Rect {...p} x={x} y={y} width={20} height={86 - y} rx={6} />} />
        <Shine cx={x + 6} cy={y + 8} rx={2.5} ry={5} rot={0} />
      </G>
    ))}
    <Polygon points={starPts(74, 12, 9, 4)} fill={g('gold')} stroke={PAL.gold[3]} strokeWidth={0.8} />
  </>
));

export const ToothArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={22} />
    <Clay
      g={g}
      c="white"
      depth={4}
      shape={(p) => (
        <Path {...p} d="M30 16 Q40 10 50 16 Q60 10 70 16 Q86 26 78 52 Q74 68 70 84 Q66 92 61 84 L55 66 Q50 58 45 66 L39 84 Q34 92 30 84 Q26 68 22 52 Q14 26 30 16 Z" />
      )}
    />
    <Face cx={50} cy={40} s={0.95} />
    <Shine cx={33} cy={28} rx={4} ry={8} rot={25} o={0.9} />
    <Sparkle x={84} y={14} r={7} color="#7DD3FC" />
  </>
));

export const SoapArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={30} />
    <G transform="rotate(-10 50 66)">
      <Clay g={g} c="pink" depth={5} shape={(p) => <Rect {...p} x={18} y={52} width={64} height={30} rx={12} />} />
      <Shine cx={32} cy={58} rx={10} ry={3} rot={0} />
      <Face cx={50} cy={67} s={0.8} />
    </G>
    {[[30, 34, 10], [56, 24, 13], [78, 40, 8]].map(([x, y, r]) => (
      <G key={x}>
        <Circle cx={x} cy={y} r={r} fill="#E0F2FE" opacity={0.7} stroke="#7DD3FC" strokeWidth={1.4} />
        <Circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} fill="#FFFFFF" />
      </G>
    ))}
  </>
));

export const ShieldArt = art((g) => (
  <>
    <Shadow cx={50} cy={94} rx={24} />
    <Clay g={g} c="mint" depth={4} shape={(p) => <Path {...p} d="M50 8 L84 20 V46 Q84 74 50 90 Q16 74 16 46 V20 Z" />} />
    <Path d="M50 18 L74 27 V46 Q74 66 50 79 Z" fill="#FFFFFF" opacity={0.2} />
    <Path d="M34 48 L46 60 L67 37" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Shine cx={30} cy={30} rx={4} ry={9} rot={20} />
  </>
));

export const ScarfArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={26} />
    <Clay g={g} c="red" depth={4} shape={(p) => <Path {...p} d="M18 30 Q50 46 82 30 Q86 40 80 46 Q50 60 20 46 Q14 40 18 30 Z" />} />
    <Clay g={g} c="red" depth={4} shape={(p) => <Path {...p} d="M56 48 L70 48 L74 84 Q66 88 58 84 Z" />} />
    {[38, 50, 62].map((x) => (
      <Path key={x} d={`M${x} ${x === 50 ? 44 : 41} L${x + 4} ${x === 50 ? 53 : 50}`} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.75} />
    ))}
    <Path d="M58 64 H72 M59 74 H73" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.75} />
    {[59, 64, 69].map((x) => (
      <Rect key={x} x={x} y={85} width={2.4} height={7} rx={1.2} fill={PAL.red[3]} />
    ))}
    <Shine cx={28} cy={36} rx={6} ry={2.5} rot={20} />
  </>
));

export const SweaterArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    {/* Left and right cozy sleeves */}
    <Clay g={g} c="red" depth={3} shape={(p) => <Path {...p} d="M34 38 L16 62 C14 66 18 70 24 68 L36 50 Z" />} />
    <Clay g={g} c="red" depth={3} shape={(p) => <Path {...p} d="M66 38 L84 62 C86 66 82 70 76 68 L64 50 Z" />} />
    {/* Cozy sweater torso body */}
    <Clay g={g} c="red" depth={4} shape={(p) => <Path {...p} d="M30 36 L70 36 L68 84 L32 84 Z" />} />
    {/* Ribbed bottom trim */}
    <Clay g={g} c="gold" depth={2} shape={(p) => <Rect {...p} x={30} y={80} width={40} height={6} rx={2} />} />
    {/* Ribbed turtleneck collar */}
    <Clay g={g} c="gold" depth={3} shape={(p) => <Rect {...p} x={38} y={24} width={24} height={14} rx={6} />} />
    {/* White knit snowflake on chest */}
    <Path d="M50 48 L50 64 M42 56 L58 56 M44 50 L56 62 M44 62 L56 50" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
    <Shine cx={36} cy={42} rx={4} ry={8} rot={15} />
  </>
));

export const PotatoArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={28} />
    <Clay g={g} c="tan" depth={4} shape={(p) => <Path {...p} d="M48 24 C72 20 84 34 86 52 C88 72 74 86 50 86 C26 86 16 70 16 50 C16 32 30 26 48 24 Z" />} />
    <Circle cx={30} cy={38} r={2} fill="#78350F" opacity={0.4} />
    <Circle cx={68} cy={42} r={2} fill="#78350F" opacity={0.4} />
    <Circle cx={42} cy={72} r={2.2} fill="#78350F" opacity={0.4} />
    <Face cx={50} cy={54} s={1.05} />
    <Shine cx={34} cy={34} rx={4} ry={8} rot={20} o={0.35} />
  </>
));

export const CapArt = art((g) => (
  <>
    <Shadow cx={54} cy={88} rx={34} />
    <Clay g={g} c="sky" depth={4} shape={(p) => <Path {...p} d="M56 66 Q78 64 94 74 Q84 82 60 78 Z" />} />
    <Clay g={g} c="blue" depth={5} shape={(p) => <Path {...p} d="M12 68 C12 34 30 22 50 22 C70 22 86 36 84 68 Z" />} />
    <Path d="M48 22 Q44 44 46 68 M30 30 Q26 48 28 68" stroke={PAL.blue[3]} strokeWidth={1.4} fill="none" opacity={0.5} />
    <Circle cx={50} cy={22} r={4.5} fill={g('gold')} />
    <Shine cx={30} cy={38} rx={4} ry={10} rot={25} />
    <Sparkle x={84} y={18} r={7} />
  </>
));

export const ButterflyArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={26} />
    <Clay g={g} c="purple" depth={3} shape={(p) => <Path {...p} d="M48 46 C36 16 6 14 10 36 C12 50 30 54 48 50 Z" />} />
    <Clay g={g} c="purple" depth={3} shape={(p) => <Path {...p} d="M52 46 C64 16 94 14 90 36 C88 50 70 54 52 50 Z" />} />
    <Clay g={g} c="pink" depth={3} shape={(p) => <Path {...p} d="M48 54 C30 54 14 66 22 80 C30 90 44 76 48 58 Z" />} />
    <Clay g={g} c="pink" depth={3} shape={(p) => <Path {...p} d="M52 54 C70 54 86 66 78 80 C70 90 56 76 52 58 Z" />} />
    <Circle cx={26} cy={34} r={5} fill="#FDE047" opacity={0.85} />
    <Circle cx={74} cy={34} r={5} fill="#FDE047" opacity={0.85} />
    <Clay g={g} c="dark" depth={2} shape={(p) => <Rect {...p} x={45} y={30} width={10} height={52} rx={5} />} />
    <Path d="M47 32 Q42 20 36 16 M53 32 Q58 20 64 16" stroke="#334155" strokeWidth={2} strokeLinecap="round" fill="none" />
    <Circle cx={36} cy={16} r={2.4} fill="#334155" />
    <Circle cx={64} cy={16} r={2.4} fill="#334155" />
    <Shine cx={24} cy={26} rx={3} ry={7} rot={40} />
  </>
));

export const FishArt = art((g) => (
  <>
    <Shadow cx={48} cy={88} rx={30} />
    <Clay g={g} c="orange" depth={3} shape={(p) => <Path {...p} d="M70 50 L92 32 Q88 50 92 68 Z" />} />
    <Clay g={g} c="orange" depth={4} shape={(p) => <Ellipse {...p} cx={44} cy={50} rx={32} ry={24} />} />
    <Path d="M52 28 Q60 40 52 72" stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.8} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Path {...p} d="M36 28 Q46 14 58 28 Z" />} />
    <Circle cx={28} cy={46} r={5} fill="#1E1B2E" />
    <Circle cx={26.5} cy={44.5} r={1.6} fill="#FFFFFF" />
    <Path d="M16 56 Q20 60 24 57" stroke="#4A2511" strokeWidth={1.6} strokeLinecap="round" fill="none" />
    <Shine cx={34} cy={36} rx={7} ry={3} rot={-15} />
    <Circle cx={12} cy={26} r={4} fill="#E0F2FE" stroke="#7DD3FC" strokeWidth={1.2} />
    <Circle cx={20} cy={14} r={2.6} fill="#E0F2FE" stroke="#7DD3FC" strokeWidth={1} />
  </>
));

export const CloudArt = art((g) => (
  <>
    <Shadow cx={50} cy={86} rx={32} />
    <Clay g={g} c="white" depth={5} shape={(p) => <Path {...p} d={CLOUD} />} />
    <Shine cx={36} cy={44} rx={8} ry={3.5} rot={-10} o={0.9} />
    <Face cx={50} cy={52} s={0.95} />
    <Sparkle x={84} y={22} r={6} color="#7DD3FC" />
  </>
));

// ---- quiz content: animals, fruits & objects

/** Friendly clay critter head: body ellipse + ears + muzzle + face. */
const Critter: React.FC<{
  g: Fill;
  c: ArtColor;
  ears?: 'pointy' | 'round' | 'long' | 'none';
  earC?: ArtColor;
  muzzle?: string;
  face?: boolean;
  behind?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ g, c, ears = 'round', earC, muzzle, face = true, behind, children }) => {
  const ec = earC ?? c;
  return (
    <>
      <Shadow cx={50} cy={93} rx={28} />
      {behind}
      {ears === 'pointy' ? (
        <>
          <Clay g={g} c={ec} depth={2} shape={(p) => <Polygon {...p} points="18,46 24,10 48,30" strokeLinejoin="round" />} />
          <Clay g={g} c={ec} depth={2} shape={(p) => <Polygon {...p} points="82,46 76,10 52,30" strokeLinejoin="round" />} />
          <Polygon points="25,38 27,20 39,31" fill="#FBCFE8" />
          <Polygon points="75,38 73,20 61,31" fill="#FBCFE8" />
        </>
      ) : ears === 'round' ? (
        <>
          <Clay g={g} c={ec} depth={2} shape={(p) => <Circle {...p} cx={24} cy={28} r={13} />} />
          <Clay g={g} c={ec} depth={2} shape={(p) => <Circle {...p} cx={76} cy={28} r={13} />} />
          <Circle cx={24} cy={28} r={6.5} fill="#FBCFE8" />
          <Circle cx={76} cy={28} r={6.5} fill="#FBCFE8" />
        </>
      ) : ears === 'long' ? (
        <>
          <Clay g={g} c={ec} depth={2} shape={(p) => <Ellipse {...p} cx={34} cy={20} rx={8} ry={20} transform="rotate(-12 34 20)" />} />
          <Clay g={g} c={ec} depth={2} shape={(p) => <Ellipse {...p} cx={66} cy={20} rx={8} ry={20} transform="rotate(12 66 20)" />} />
          <Ellipse cx={34} cy={22} rx={3.5} ry={13} fill="#FBCFE8" transform="rotate(-12 34 22)" />
          <Ellipse cx={66} cy={22} rx={3.5} ry={13} fill="#FBCFE8" transform="rotate(12 66 22)" />
        </>
      ) : null}
      <Clay g={g} c={c} depth={4} shape={(p) => <Ellipse {...p} cx={50} cy={56} rx={34} ry={31} />} />
      {muzzle ? <Ellipse cx={50} cy={67} rx={15} ry={11} fill={muzzle} /> : null}
      <Shine cx={30} cy={42} rx={5} ry={10} rot={25} />
      {children}
      {face ? (
        <>
          <Face cx={50} cy={53} s={1.15} />
          <Ellipse cx={50} cy={62} rx={3.4} ry={2.4} fill="#3F2A1E" />
        </>
      ) : null}
    </>
  );
};

export const CatArt = art((g) => (
  <Critter g={g} c="orange" ears="pointy" muzzle="#FFF7ED">
    <Path d="M8 60 L30 63 M8 70 L30 67 M92 60 L70 63 M92 70 L70 67" stroke="#7C2D12" strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
    <Path d="M44 30 L46 38 M50 28 L50 37 M56 30 L54 38" stroke={PAL.orange[3]} strokeWidth={2.4} strokeLinecap="round" />
  </Critter>
));

export const TigerArt = art((g) => (
  <Critter g={g} c="orange" ears="round" muzzle="#FFFFFF">
    <Path d="M40 28 L44 38 M50 26 L50 37 M60 28 L56 38 M17 52 L28 54 M17 62 L28 61 M83 52 L72 54 M83 62 L72 61" stroke="#1E293B" strokeWidth={3} strokeLinecap="round" />
  </Critter>
));

export const CowArt = art((g) => (
  <Critter
    g={g}
    c="white"
    ears="round"
    earC="tan"
    muzzle="#FBCFE8"
    behind={
      <>
        <Path d="M30 26 Q22 10 30 6" stroke="#E0A82E" strokeWidth={6} strokeLinecap="round" fill="none" />
        <Path d="M70 26 Q78 10 70 6" stroke="#E0A82E" strokeWidth={6} strokeLinecap="round" fill="none" />
      </>
    }
  >
    <Ellipse cx={30} cy={44} rx={8} ry={6} fill="#78350F" opacity={0.85} />
    <Ellipse cx={72} cy={70} rx={6} ry={5} fill="#78350F" opacity={0.85} />
    <Circle cx={45} cy={68} r={1.8} fill="#BE185D" />
    <Circle cx={55} cy={68} r={1.8} fill="#BE185D" />
  </Critter>
));

export const DeerArt = art((g) => (
  <Critter
    g={g}
    c="tan"
    ears="pointy"
    muzzle="#FFF7ED"
    behind={
      <Path d="M36 30 L28 6 M30 16 L18 10 M64 30 L72 6 M70 16 L82 10" stroke="#78350F" strokeWidth={5} strokeLinecap="round" fill="none" />
    }
  >
    <Circle cx={30} cy={70} r={2.2} fill="#FFF7ED" />
    <Circle cx={72} cy={72} r={2} fill="#FFF7ED" />
    <Circle cx={68} cy={40} r={2} fill="#FFF7ED" />
  </Critter>
));

export const SquirrelArt = art((g) => (
  <Critter
    g={g}
    c="tan"
    ears="pointy"
    earC="brown"
    muzzle="#FFF7ED"
    behind={<Clay g={g} c="brown" depth={3} shape={(p) => <Path {...p} d="M74 84 C102 76 100 30 82 18 C74 12 66 20 74 28 C86 40 84 62 68 74 Z" />} />}
  />
));

export const KangarooArt = art((g) => <Critter g={g} c="tan" ears="long" muzzle="#FDE6C6" />);

export const FrogArt = art((g) => (
  <Critter g={g} c="green" ears="none" face={false}>
    {[34, 66].map((x) => (
      <G key={x}>
        <Clay g={g} c="green" depth={2} shape={(p) => <Circle {...p} cx={x} cy={30} r={12} />} />
        <Circle cx={x} cy={30} r={8} fill="#FFFFFF" />
        <Circle cx={x + 1} cy={31} r={4.2} fill="#1E1B2E" />
        <Circle cx={x - 0.5} cy={29.5} r={1.4} fill="#FFFFFF" />
      </G>
    ))}
    <Path d="M30 60 Q50 76 70 60" stroke="#14532D" strokeWidth={3} strokeLinecap="round" fill="none" />
    <Ellipse cx={26} cy={62} rx={4} ry={2.4} fill="#FB7185" opacity={0.55} />
    <Ellipse cx={74} cy={62} rx={4} ry={2.4} fill="#FB7185" opacity={0.55} />
  </Critter>
));

export const DuckArt = art((g) => (
  <Critter g={g} c="yellow" ears="none" face={false}>
    <Path d="M50 26 Q46 14 54 10 Q52 18 58 20" stroke={PAL.yellow[3]} strokeWidth={3} strokeLinecap="round" fill="none" />
    <Ellipse cx={42} cy={50} rx={3} ry={3.6} fill="#1E1B2E" />
    <Ellipse cx={58} cy={50} rx={3} ry={3.6} fill="#1E1B2E" />
    <Circle cx={41} cy={48.6} r={1.1} fill="#FFFFFF" />
    <Circle cx={57} cy={48.6} r={1.1} fill="#FFFFFF" />
    <Clay g={g} c="orange" depth={2} shape={(p) => <Ellipse {...p} cx={50} cy={64} rx={15} ry={7} />} />
    <Path d="M37 64 Q50 68 63 64" stroke={PAL.orange[3]} strokeWidth={1.4} fill="none" />
    <Ellipse cx={30} cy={60} rx={4} ry={2.4} fill="#FB7185" opacity={0.5} />
    <Ellipse cx={70} cy={60} rx={4} ry={2.4} fill="#FB7185" opacity={0.5} />
  </Critter>
));

export const CrowArt = art((g) => (
  <Critter g={g} c="dark" ears="none" face={false}>
    {[40, 60].map((x) => (
      <G key={x}>
        <Circle cx={x} cy={50} r={6} fill="#FFFFFF" />
        <Circle cx={x + 1} cy={51} r={3.2} fill="#1E1B2E" />
        <Circle cx={x - 0.5} cy={49.5} r={1.1} fill="#FFFFFF" />
      </G>
    ))}
    <Polygon points="42,60 58,60 50,74" fill={g('grey')} stroke="#64748B" strokeWidth={0.8} strokeLinejoin="round" />
    <Path d="M46 26 Q50 16 56 20" stroke="#334155" strokeWidth={3} strokeLinecap="round" fill="none" />
  </Critter>
));

export const BananaArt = art((g) => (
  <>
    <Shadow cx={52} cy={90} rx={30} />
    <Clay g={g} c="yellow" depth={4} shape={(p) => <Path {...p} d="M20 22 Q16 72 66 82 Q82 84 88 74 Q44 70 32 22 Q28 14 20 22 Z" />} />
    <Path d="M24 20 L22 12" stroke="#78350F" strokeWidth={4} strokeLinecap="round" />
    <Circle cx={87} cy={75} r={2.4} fill="#78350F" />
    <Path d="M30 30 Q34 62 62 74" stroke="#FFF6B0" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
    <Face cx={48} cy={64} s={0.75} />
  </>
));

export const GrapesArt = art((g) => (
  <>
    <Shadow cx={50} cy={94} rx={22} />
    <Path d="M50 22 Q52 12 58 8" stroke="#78350F" strokeWidth={3.4} strokeLinecap="round" fill="none" />
    <Clay g={g} c="green" depth={1.5} shape={(p) => <Path {...p} d="M54 16 Q68 4 82 12 Q70 24 54 16 Z" />} />
    {[[36, 32], [50, 30], [64, 32], [30, 46], [44, 46], [58, 46], [72, 46], [38, 60], [52, 60], [66, 60], [45, 74], [59, 74], [52, 86]].map(([x, y]) => (
      <G key={`${x}-${y}`}>
        <Clay g={g} c="purple" depth={2} shape={(p) => <Circle {...p} cx={x} cy={y} r={8} />} />
        <Circle cx={x - 2.6} cy={y - 2.8} r={2} fill="#FFFFFF" opacity={0.6} />
      </G>
    ))}
  </>
));

export const WatermelonArt = art((g) => (
  <>
    <Shadow cx={50} cy={88} rx={36} />
    <Clay g={g} c="green" depth={4} shape={(p) => <Path {...p} d="M8 36 A42 42 0 0 0 92 36 Z" />} />
    <Path d="M14 36 A36 36 0 0 0 86 36 Z" fill="#FFFFFF" />
    <Path d="M18 36 A32 32 0 0 0 82 36 Z" fill={g('red')} />
    {[[34, 46], [50, 52], [66, 46], [42, 58], [58, 58]].map(([x, y]) => (
      <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx={1.8} ry={3} fill="#1E1B2E" />
    ))}
    <Path d="M18 36 H82" stroke="#FDA4AF" strokeWidth={2} />
    <Face cx={50} cy={42} s={0.7} />
  </>
));

export const OrangeArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={28} />
    <Path d="M50 24 Q50 16 54 12" stroke="#78350F" strokeWidth={3.4} strokeLinecap="round" fill="none" />
    <Clay g={g} c="green" depth={1.5} shape={(p) => <Path {...p} d="M52 18 Q64 6 78 12 Q66 24 52 18 Z" />} />
    <Clay g={g} c="orange" depth={4} shape={(p) => <Circle {...p} cx={50} cy={56} r={33} />} />
    {[[34, 44], [64, 40], [70, 64], [30, 68], [56, 78]].map(([x, y]) => (
      <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill={PAL.orange[3]} opacity={0.5} />
    ))}
    <Shine cx={34} cy={40} rx={5} ry={10} rot={25} />
    <Face cx={50} cy={58} s={1.1} />
  </>
));

export const GreenAppleArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={28} />
    <Apple g={g} c="green" />
  </>
));

export const PineappleArt = art((g) => (
  <>
    <Shadow cx={50} cy={94} rx={28} />
    {/* Spiky crown leaves on top */}
    <Clay g={g} c="green" depth={1.5} shape={(p) => <Path {...p} d="M50 8 C44 24 32 30 38 38 C46 34 50 20 50 8 Z" />} />
    <Clay g={g} c="green" depth={1.5} shape={(p) => <Path {...p} d="M50 8 C56 24 68 30 62 38 C54 34 50 20 50 8 Z" />} />
    <Clay g={g} c="green" depth={2} shape={(p) => <Path {...p} d="M50 4 C46 20 42 32 50 36 C58 32 54 20 50 4 Z" />} />
    {/* Golden pineapple body */}
    <Clay g={g} c="gold" depth={4} shape={(p) => <Path {...p} d="M30 40 C22 52 22 72 32 82 C42 90 58 90 68 82 C78 72 78 52 70 40 C62 32 38 32 30 40 Z" />} />
    {/* Texture diagonal criss-cross */}
    <Path d="M32 52 L68 76 M26 62 L60 84 M40 44 L74 66 M68 52 L32 76 M74 62 L40 84 M60 44 L26 66" stroke="#B45309" strokeWidth={1.5} strokeLinecap="round" opacity={0.65} />
    <Shine cx={36} cy={46} rx={4} ry={8} rot={20} o={0.8} />
    <Face cx={50} cy={60} s={0.85} />
  </>
));

export const RainbowArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={36} />
    {(['red', 'orange', 'yellow', 'mint', 'sky', 'purple'] as ArtColor[]).map((c, i) => (
      <Path
        key={c}
        d={`M${14 + i * 5} 80 A${36 - i * 5} ${36 - i * 5} 0 0 1 ${86 - i * 5} 80`}
        stroke={g(c)}
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
      />
    ))}
    {/* Cloud puffs on both ends */}
    <Clay g={g} c="white" depth={2} shape={(p) => <Circle {...p} cx={22} cy={76} r={12} />} />
    <Clay g={g} c="white" depth={2} shape={(p) => <Circle {...p} cx={78} cy={76} r={12} />} />
    <Face cx={22} cy={76} s={0.55} />
    <Face cx={78} cy={76} s={0.55} />
  </>
));

export const BallArt = art((g) => (
  <>
    <Shadow cx={50} cy={93} rx={28} />
    <Clay g={g} c="white" depth={4} shape={(p) => <Circle {...p} cx={50} cy={52} r={36} />} />
    <Polygon points={starPts(50, 52, 11, 11, 5)} fill="#1E293B" />
    <Path d="M50 41 L50 18 M60.5 48.6 L82 41 M56.5 61 L70 80 M43.5 61 L30 80 M39.5 48.6 L18 41" stroke="#334155" strokeWidth={1.6} />
    <Path d="M42 16 Q50 20 58 16 L56 18 Q50 22 44 18 Z" fill="#1E293B" />
    <Path d="M83 36 Q80 46 86 54 L88 46 Z" fill="#1E293B" />
    <Path d="M17 36 Q20 46 14 54 L12 46 Z" fill="#1E293B" />
    <Path d="M64 84 Q70 78 76 78 L70 84 Z" fill="#1E293B" />
    <Path d="M36 84 Q30 78 24 78 L30 84 Z" fill="#1E293B" />
    <Shine cx={32} cy={34} rx={5} ry={10} rot={30} o={0.8} />
  </>
));

export const BoxArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={34} />
    <Polygon points="16,34 50,22 84,34 50,46" fill={g('tan')} stroke={PAL.tan[3]} strokeWidth={0.8} strokeLinejoin="round" />
    <Clay g={g} c="tan" depth={3} shape={(p) => <Polygon {...p} points="16,34 50,46 50,88 16,74" strokeLinejoin="round" />} />
    <Clay g={g} c="brown" depth={3} shape={(p) => <Polygon {...p} points="84,34 50,46 50,88 84,74" strokeLinejoin="round" />} />
    <Polygon points="30,29 64,41 64,50 30,38" fill="#FDE68A" opacity={0.85} />
    <Face cx={33} cy={58} s={0.8} />
  </>
));

export const SamosaArt = art((g) => (
  <>
    <Shadow cx={50} cy={90} rx={34} />
    <Clay g={g} c="gold" depth={5} shape={(p) => <Polygon {...p} points="50,12 90,82 10,82" strokeLinejoin="round" />} />
    <Path d="M50 18 L50 76" stroke="#FFF7D6" strokeWidth={2} opacity={0.5} />
    <Path d="M18 80 Q50 72 82 80" stroke="#B45309" strokeWidth={2} fill="none" opacity={0.6} />
    <Shine cx={38} cy={44} rx={3} ry={10} rot={30} />
    <Face cx={50} cy={58} s={0.95} />
  </>
));

export const DoorArt = art((g) => (
  <>
    <Shadow cx={50} cy={94} rx={30} />
    <Clay g={g} c="brown" depth={4} shape={(p) => <Path {...p} d="M22 92 V30 Q22 8 50 8 Q78 8 78 30 V92 Z" />} />
    <Path d="M32 44 V28 Q32 18 50 18 Q68 18 68 28 V44 Z M32 54 H68 V82 H32 Z" fill="#000000" opacity={0.14} />
    <Clay g={g} c="gold" depth={1.5} shape={(p) => <Circle {...p} cx={68} cy={58} r={4.5} />} />
    <Shine cx={30} cy={34} rx={3} ry={12} rot={0} o={0.35} />
  </>
));

export const ChairArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={28} />
    {/* Legs */}
    <Rect x={26} y={58} width={6} height={32} rx={3} fill="#854D0E" />
    <Rect x={68} y={58} width={6} height={32} rx={3} fill="#854D0E" />
    <Rect x={34} y={62} width={5} height={26} rx={2.5} fill="#A16207" />
    <Rect x={61} y={62} width={5} height={26} rx={2.5} fill="#A16207" />
    {/* Backrest */}
    <Clay g={g} c="gold" depth={3} shape={(p) => <Rect {...p} x={26} y={14} width={48} height={42} rx={6} />} />
    <Rect x={34} y={22} width={6} height={26} rx={3} fill="#78350F" opacity={0.35} />
    <Rect x={47} y={22} width={6} height={26} rx={3} fill="#78350F" opacity={0.35} />
    <Rect x={60} y={22} width={6} height={26} rx={3} fill="#78350F" opacity={0.35} />
    {/* Seat cushion */}
    <Clay g={g} c="tan" depth={4} shape={(p) => <Rect {...p} x={20} y={52} width={60} height={15} rx={5} />} />
    <Face cx={50} cy={34} s={0.8} />
    <Shine cx={32} cy={20} rx={3} ry={8} rot={0} />
  </>
));

export const BedArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={34} />
    {/* Headboard */}
    <Clay g={g} c="brown" depth={4} shape={(p) => <Rect {...p} x={18} y={22} width={64} height={40} rx={6} />} />
    {/* Pillow */}
    <Clay g={g} c="white" depth={2} shape={(p) => <Rect {...p} x={28} y={32} width={26} height={15} rx={4} />} />
    {/* Mattress & Blanket */}
    <Clay g={g} c="sky" depth={4} shape={(p) => <Rect {...p} x={16} y={48} width={68} height={30} rx={6} />} />
    {/* Folded Sheet Accent */}
    <Rect x={16} y={48} width={68} height={7} fill="#FFFFFF" opacity={0.85} />
    {/* Bed Legs */}
    <Rect x={20} y={76} width={6} height={16} rx={3} fill="#78350F" />
    <Rect x={74} y={76} width={6} height={16} rx={3} fill="#78350F" />
    <Face cx={50} cy={63} s={0.8} />
    <Shine cx={26} cy={54} rx={3} ry={8} rot={20} />
  </>
));

export const CarrotArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={22} />
    {/* Greens on top */}
    <Path d="M48 24 Q44 10 38 6 Q44 14 48 22" fill="#22C55E" />
    <Path d="M50 22 Q50 6 50 4 Q52 14 52 22" fill="#16A34A" />
    <Path d="M52 24 Q58 10 64 6 Q56 14 52 22" fill="#22C55E" />
    {/* Carrot Cone */}
    <Clay g={g} c="orange" depth={4} shape={(p) => <Polygon {...p} points="50,90 32,24 68,24" strokeLinejoin="round" />} />
    {/* Ridge texture */}
    <Path d="M38 38 Q50 42 62 38" stroke="#EA580C" strokeWidth={2} fill="none" opacity={0.7} />
    <Path d="M41 52 Q50 56 59 52" stroke="#EA580C" strokeWidth={2} fill="none" opacity={0.7} />
    <Path d="M44 66 Q50 70 56 66" stroke="#EA580C" strokeWidth={1.8} fill="none" opacity={0.7} />
    <Face cx={50} cy={42} s={0.75} />
    <Shine cx={44} cy={32} rx={3} ry={8} rot={15} />
  </>
));

export const PlanetArt = art((g) => (
  <>
    <Path d="M8 58 Q50 30 92 46" stroke={PAL.tan[3]} strokeWidth={7} fill="none" strokeLinecap="round" />
    <Clay g={g} c="orange" depth={3} shape={(p) => <Circle {...p} cx={50} cy={50} r={28} />} />
    <Path d="M26 40 Q50 46 74 38 M24 56 Q50 62 76 54" stroke="#FDE6C6" strokeWidth={4} fill="none" opacity={0.6} />
    <Path d="M8 58 Q50 72 92 46" stroke={g('tan')} strokeWidth={7} fill="none" strokeLinecap="round" />
    <Shine cx={38} cy={36} rx={4} ry={8} rot={30} />
    <Sparkle x={84} y={18} r={6} />
    <Sparkle x={16} y={24} r={4} color="#FFFFFF" />
  </>
));

const ballArt = (c: ArtColor) =>
  art((g) => (
    <>
      <Shadow cx={50} cy={92} rx={26} />
      <Clay g={g} c={c} depth={4} shape={(p) => <Circle {...p} cx={50} cy={52} r={34} />} />
      <Shine cx={36} cy={38} rx={6} ry={11} rot={30} />
    </>
  ));
export const RedBallArt = ballArt('red');
export const BlueBallArt = ballArt('blue');
export const GreenBallArt = ballArt('green');
export const YellowBallArt = ballArt('yellow');
export const OrangeBallArt = ballArt('orange');
export const PurpleBallArt = ballArt('purple');
export const WhiteBallArt = ballArt('white');
export const BlackBallArt = ballArt('dark');
export const PinkBallArt = ballArt('pink');
export const BrownBallArt = ballArt('brown');

// ============================================================================
// GEOMETRY & 3D SHAPES ART
// ============================================================================

export const CircleArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay g={g} c="red" depth={4} shape={(p) => <Circle {...p} cx={50} cy={48} r={34} />} />
    <Circle cx={50} cy={48} r={30} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.3} fill="none" />
    <Shine cx={38} cy={34} rx={6} ry={12} rot={30} o={0.85} />
    <Face cx={50} cy={50} s={0.95} />
  </>
));

export const SquareArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay g={g} c="blue" depth={4} shape={(p) => <Rect {...p} x={20} y={18} width={60} height={60} rx={16} />} />
    <Rect x={24} y={22} width={52} height={52} rx={12} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.3} fill="none" />
    <Shine cx={32} cy={28} rx={6} ry={12} rot={25} o={0.8} />
    <Face cx={50} cy={50} s={0.95} />
  </>
));

export const TriangleArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay
      g={g}
      c="gold"
      depth={4}
      shape={(p) => (
        <Path
          {...p}
          d="M50 14 C54 14 57 18 59 23 L87 72 C90 77 87 82 81 82 L19 82 C13 82 10 77 13 72 L41 23 C43 18 46 14 50 14 Z"
        />
      )}
    />
    <Shine cx={42} cy={36} rx={4} ry={11} rot={25} o={0.85} />
    <Face cx={50} cy={58} s={0.85} />
  </>
));

export const RectangleArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={36} />
    <Clay g={g} c="purple" depth={4} shape={(p) => <Rect {...p} x={12} y={25} width={76} height={50} rx={14} />} />
    <Rect x={16} y={29} width={68} height={42} rx={10} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.3} fill="none" />
    <Shine cx={26} cy={36} rx={6} ry={10} rot={25} o={0.8} />
    <Face cx={50} cy={50} s={0.95} />
  </>
));

export const OvalArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={34} />
    <Clay g={g} c="mint" depth={4} shape={(p) => <Ellipse {...p} cx={50} cy={48} rx={38} ry={27} />} />
    <Ellipse cx={50} cy={48} rx={33} ry={22} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.3} fill="none" />
    <Shine cx={34} cy={36} rx={8} ry={5} rot={-15} o={0.85} />
    <Face cx={50} cy={50} s={0.9} />
  </>
));

export const DiamondArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={30} />
    <Clay
      g={g}
      c="teal"
      depth={4}
      shape={(p) => <Polygon {...p} points="50,12 85,48 50,84 15,48" strokeLinejoin="round" />}
    />
    <Polygon points="50,22 75,48 50,74 25,48" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.35} fill="none" />
    <Shine cx={38} cy={34} rx={5} ry={10} rot={30} o={0.85} />
    <Sparkle x={50} y={28} r={7} color="#FFFFFF" />
    <Face cx={50} cy={52} s={0.85} />
  </>
));

export const PentagonArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay
      g={g}
      c="orange"
      depth={4}
      shape={(p) => <Polygon {...p} points="50,14 86,40 72,82 28,82 14,40" strokeLinejoin="round" />}
    />
    <Polygon points="50,22 78,43 67,75 33,75 22,43" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.3} fill="none" />
    <Shine cx={40} cy={30} rx={5} ry={10} rot={20} o={0.8} />
    <Face cx={50} cy={54} s={0.9} />
  </>
));

export const HexagonArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay
      g={g}
      c="blue"
      depth={4}
      shape={(p) => <Polygon {...p} points="50,14 82,32 82,68 50,86 18,68 18,32" strokeLinejoin="round" />}
    />
    <Polygon points="50,22 74,36 74,64 50,78 26,64 26,36" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.3} fill="none" />
    <Shine cx={40} cy={28} rx={5} ry={10} rot={25} o={0.8} />
    <Face cx={50} cy={50} s={0.95} />
  </>
));

export const CubeArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={34} />
    <Polygon points="50,16 82,32 50,48 18,32" fill={g('sky')} stroke="#38BDF8" strokeWidth={0.8} strokeLinejoin="round" />
    <Polygon points="18,32 50,48 50,84 18,68" fill={g('blue')} stroke="#1D4ED8" strokeWidth={0.8} strokeLinejoin="round" />
    <Polygon points="82,32 50,48 50,84 82,68" fill="#1E40AF" stroke="#172554" strokeWidth={0.8} strokeLinejoin="round" />
    <Circle cx={50} cy={32} r={3} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={34} cy={52} r={2.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={34} cy={66} r={2.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={64} cy={50} r={2.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={68} cy={60} r={2.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={64} cy={70} r={2.5} fill="#FFFFFF" opacity={0.9} />
    <Path d="M50 17 L81 32 M50 17 L19 32" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />
  </>
));

export const CylinderArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={30} />
    <Clay
      g={g}
      c="mint"
      depth={3}
      shape={(p) => <Path {...p} d="M22 34 V72 C22 80 78 80 78 72 V34 Z" />}
    />
    <Clay g={g} c="mint" depth={1} shape={(p) => <Ellipse {...p} cx={50} cy={34} rx={28} ry={12} />} />
    <Ellipse cx={50} cy={34} rx={24} ry={9} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.4} fill="none" />
    <Path d="M30 38 V68" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.55} />
    <Face cx={50} cy={56} s={0.85} />
  </>
));

export const ConeArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay g={g} c="yellow" depth={2} shape={(p) => <Ellipse {...p} cx={50} cy={76} rx={32} ry={11} />} />
    <Clay
      g={g}
      c="gold"
      depth={3}
      shape={(p) => <Path {...p} d="M50 16 L82 76 C82 84 18 84 18 76 Z" />}
    />
    <Path d="M42 28 L28 72" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
    <Circle cx={50} cy={16} r={4} fill={g('yellow')} />
    <Face cx={50} cy={58} s={0.85} />
  </>
));

export const SphereArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={30} />
    <Clay g={g} c="purple" depth={4} shape={(p) => <Circle {...p} cx={50} cy={48} r={36} />} />
    <Shine cx={36} cy={32} rx={7} ry={14} rot={30} o={0.85} />
    <Path d="M22 58 Q50 78 78 58" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.25} fill="none" />
    <Face cx={50} cy={52} s={1} />
  </>
));

// ============================================================================
// PATTERNS & SEQUENCES ART
// ============================================================================

export const ColorPatternArt = art((g) => (
  <>
    <Shadow cx={32} cy={78} rx={18} />
    <Shadow cx={68} cy={78} rx={18} />
    <Clay g={g} c="red" depth={3} shape={(p) => <Circle {...p} cx={32} cy={48} r={20} />} />
    <Shine cx={26} cy={40} rx={3.5} ry={7} rot={30} o={0.85} />
    <Face cx={32} cy={50} s={0.55} />
    <Clay g={g} c="yellow" depth={3} shape={(p) => <Circle {...p} cx={68} cy={48} r={20} />} />
    <Shine cx={62} cy={40} rx={3.5} ry={7} rot={30} o={0.85} />
    <Face cx={68} cy={50} s={0.55} />
    <Circle cx={47} cy={48} r={2.5} fill="#CBD5E1" />
    <Circle cx={53} cy={48} r={2.5} fill="#CBD5E1" />
    <Sparkle x={50} y={22} r={6} color="#F59E0B" />
  </>
));

export const ShapePatternArt = art((g) => (
  <>
    <Shadow cx={30} cy={78} rx={18} />
    <Shadow cx={70} cy={78} rx={18} />
    <Clay g={g} c="red" depth={3} shape={(p) => <Circle {...p} cx={30} cy={48} r={20} />} />
    <Shine cx={24} cy={40} rx={3.5} ry={7} rot={30} o={0.85} />
    <Face cx={30} cy={50} s={0.55} />
    <Clay g={g} c="blue" depth={3} shape={(p) => <Rect {...p} x={52} y={30} width={36} height={36} rx={9} />} />
    <Shine cx={60} cy={38} rx={3.5} ry={7} rot={25} o={0.8} />
    <Face cx={70} cy={50} s={0.55} />
    <Sparkle x={50} y={22} r={6} color="#38BDF8" />
  </>
));

export const AbcPatternArt = art((g) => (
  <>
    <Shadow cx={22} cy={76} rx={14} />
    <Shadow cx={50} cy={76} rx={14} />
    <Shadow cx={78} cy={76} rx={14} />
    <Clay
      g={g}
      c="gold"
      depth={2}
      shape={(p) => <Polygon {...p} points="22,28 36,66 8,66" strokeLinejoin="round" />}
    />
    <Face cx={22} cy={54} s={0.4} />
    <Clay g={g} c="red" depth={2} shape={(p) => <Circle {...p} cx={50} cy={50} r={16} />} />
    <Shine cx={45} cy={44} rx={2.5} ry={5} rot={30} o={0.8} />
    <Face cx={50} cy={52} s={0.45} />
    <Clay g={g} c="blue" depth={2} shape={(p) => <Rect {...p} x={64} y={36} width={28} height={28} rx={7} />} />
    <Face cx={78} cy={52} s={0.45} />
  </>
));

export const SizePatternArt = art((g) => (
  <>
    <Shadow cx={36} cy={82} rx={24} />
    <Shadow cx={78} cy={82} rx={12} />
    <Clay g={g} c="purple" depth={4} shape={(p) => <Circle {...p} cx={36} cy={48} r={28} />} />
    <Shine cx={28} cy={38} rx={5} ry={10} rot={30} o={0.85} />
    <Face cx={36} cy={52} s={0.8} />
    <Clay g={g} c="pink" depth={2} shape={(p) => <Circle {...p} cx={78} cy={60} r={14} />} />
    <Shine cx={74} cy={55} rx={2.5} ry={5} rot={30} o={0.8} />
    <Face cx={78} cy={62} s={0.4} />
    <Path d="M36 14 L36 10 M78 38 L78 34" stroke="#64748B" strokeWidth={2} strokeLinecap="round" />
  </>
));

export const GrowingPatternArt = art((g) => (
  <>
    <Shadow cx={28} cy={84} rx={16} />
    <Shadow cx={70} cy={84} rx={22} />
    <Path d="M28 80 V58 Q28 46 20 44 Q30 42 30 58" stroke="#15803D" strokeWidth={3} fill="none" strokeLinecap="round" />
    <Clay g={g} c="mint" depth={2} shape={(p) => <Path {...p} d="M28 58 Q40 44 38 32 Q24 38 28 58 Z" />} />
    <Rect x={66} y={56} width={8} height={26} rx={3} fill="#78350F" />
    <Clay g={g} c="green" depth={4} shape={(p) => <Circle {...p} cx={70} cy={42} r={24} />} />
    <Clay g={g} c="mint" depth={2} shape={(p) => <Circle {...p} cx={62} cy={34} r={12} />} />
    <Clay g={g} c="mint" depth={2} shape={(p) => <Circle {...p} cx={78} cy={36} r={11} />} />
    <Face cx={70} cy={48} s={0.65} />
  </>
));

export const DayNightPatternArt = art((g) => (
  <>
    <Shadow cx={32} cy={80} rx={18} />
    <Shadow cx={70} cy={80} rx={18} />
    <Clay g={g} c="yellow" depth={3} shape={(p) => <Circle {...p} cx={32} cy={46} r={19} />} />
    {Array.from({ length: 8 }, (_, i) => (
      <G key={i} transform={`rotate(${i * 45} 32 46)`}>
        <Rect x={29.5} y={20} width={5} height={6} rx={2.5} fill="#F59E0B" />
      </G>
    ))}
    <Face cx={32} cy={48} s={0.5} />
    <Clay g={g} c="gold" depth={3} shape={(p) => <Path {...p} d="M74 24 A20 20 0 1 0 88 56 A16 16 0 1 1 74 24 Z" />} />
    <Face cx={68} cy={50} s={0.45} />
    <Sparkle x={86} y={28} r={5} color="#FDE047" />
  </>
));

export const DirectionPatternArt = art((g) => (
  <>
    <Shadow cx={32} cy={82} rx={18} />
    <Shadow cx={68} cy={82} rx={18} />
    <Clay g={g} c="sky" depth={4} shape={(p) => <Rect {...p} x={14} y={24} width={36} height={52} rx={12} />} />
    <Path d="M32 38 L22 52 H28 V64 H36 V52 H42 Z" fill="#FFFFFF" />
    <Clay g={g} c="blue" depth={4} shape={(p) => <Rect {...p} x={50} y={24} width={36} height={52} rx={12} />} />
    <Path d="M68 62 L58 48 H64 V36 H72 V48 H78 Z" fill="#FFFFFF" />
  </>
));

export const WavePatternArt = art((g) => (
  <>
    <Shadow cx={50} cy={88} rx={34} />
    <Path
      d="M10 58 Q24 38 38 58 Q52 78 66 58 Q80 38 92 58"
      stroke={g('teal')}
      strokeWidth={9}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M10 56 Q24 36 38 56 Q52 76 66 56 Q80 36 92 56"
      stroke="#FFFFFF"
      strokeWidth={2.5}
      strokeLinecap="round"
      fill="none"
      opacity={0.65}
    />
    <Clay
      g={g}
      c="gold"
      depth={3}
      shape={(p) => <Polygon {...p} points="58,12 42,42 54,42 42,76 74,36 60,36" strokeLinejoin="round" />}
    />
    <Sparkle x={78} y={24} r={6} color="#FDE047" />
  </>
));

// ============================================================================
// TIME & CALENDAR ART
// ============================================================================

export const AlarmClockArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={28} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Circle {...p} cx={28} cy={22} r={10} />} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Circle {...p} cx={72} cy={22} r={10} />} />
    <Rect x={47} y={12} width={6} height={10} rx={3} fill="#94A3B8" />
    <Path d="M26 80 L18 90 M74 80 L82 90" stroke="#475569" strokeWidth={4} strokeLinecap="round" />
    <Clay g={g} c="red" depth={4} shape={(p) => <Circle {...p} cx={50} cy={54} r={32} />} />
    <Circle cx={50} cy={54} r={24} fill="#FFFFFF" />
    <Circle cx={50} cy={34} r={1.8} fill="#1E293B" />
    <Circle cx={70} cy={54} r={1.8} fill="#1E293B" />
    <Circle cx={50} cy={74} r={1.8} fill="#1E293B" />
    <Circle cx={30} cy={54} r={1.8} fill="#1E293B" />
    <Path d="M50 54 V40" stroke="#1E293B" strokeWidth={3} strokeLinecap="round" />
    <Path d="M50 54 H62" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
    <Circle cx={50} cy={54} r={3} fill="#1E293B" />
    <Shine cx={38} cy={42} rx={4} ry={8} rot={30} o={0.7} />
  </>
));

export const WeekCalendarArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay g={g} c="white" depth={4} shape={(p) => <Rect {...p} x={18} y={22} width={64} height={64} rx={14} />} />
    <Path d="M18 34 C18 25 24 22 32 22 H68 C76 22 82 25 82 34 V40 H18 Z" fill={g('red')} />
    <Rect x={30} y={16} width={5} height={10} rx={2.5} fill="#475569" />
    <Rect x={48} y={16} width={5} height={10} rx={2.5} fill="#475569" />
    <Rect x={66} y={16} width={5} height={10} rx={2.5} fill="#475569" />
    {[[30, 52], [50, 52], [70, 52], [24, 66], [40, 66], [58, 66], [74, 66]].map(([x, y], idx) => (
      <Circle key={idx} cx={x} cy={y} r={3.5} fill={idx === 6 ? '#EF4444' : '#3B82F6'} />
    ))}
    <Shine cx={30} cy={30} rx={3} ry={6} rot={25} o={0.8} />
  </>
));

export const YearCalendarArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay g={g} c="white" depth={4} shape={(p) => <Rect {...p} x={18} y={20} width={64} height={66} rx={14} />} />
    <Path d="M18 32 C18 24 24 20 32 20 H68 C76 20 82 24 82 32 V38 H18 Z" fill={g('blue')} />
    {[28, 42, 56, 70].map((x) => (
      <Rect key={x} x={x} y={14} width={4} height={10} rx={2} fill="#64748B" />
    ))}
    <SvgText x="50" y="68" fontSize="26" fontWeight="900" fill="#1E293B" textAnchor="middle">
      31
    </SvgText>
    <Path d="M66 84 L82 68 V84 Z" fill="#E2E8F0" />
  </>
));

export const CelestialDayNightArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Path d="M50 16 A32 32 0 0 0 50 80 Z" fill={g('yellow')} />
    <Path d="M50 16 A32 32 0 0 1 50 80 Z" fill="#1E293B" />
    <Path d="M14 48 H24 M22 28 L30 34 M22 68 L30 62" stroke="#F59E0B" strokeWidth={3} strokeLinecap="round" />
    <Path d="M60 36 A12 12 0 1 0 72 58 A10 10 0 1 1 60 36 Z" fill="#FDE047" />
    <Circle cx={76} cy={34} r={1.5} fill="#FFFFFF" />
    <Circle cx={66} cy={66} r={1.2} fill="#FFFFFF" />
    <Path d="M50 14 V82" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.6} />
  </>
));

export const MorningSunArt = art((g, uid) => (
  <>
    <Shadow cx={50} cy={92} rx={36} />
    <Circle cx={50} cy={44} r={28} fill={`url(#${uid}glow)`} />
    {Array.from({ length: 8 }, (_, i) => (
      <G key={i} transform={`rotate(${i * 45} 50 44)`}>
        <Rect x={46.5} y={4} width={7} height={14} rx={3.5} fill={g('orange')} />
      </G>
    ))}
    <Clay g={g} c="yellow" depth={3} shape={(p) => <Circle {...p} cx={50} cy={44} r={22} />} />
    <Face cx={50} cy={46} s={0.9} />
    <Clay g={g} c="white" depth={2} shape={(p) => <Path {...p} d="M16 82 C16 68 36 66 42 74 C48 64 70 66 74 74 C80 68 92 72 90 82 Z" />} />
    <Sparkle x={82} y={22} r={6} color="#FDE047" />
  </>
));

export const HourglassArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={26} />
    <Clay g={g} c="brown" depth={2} shape={(p) => <Rect {...p} x={22} y={14} width={56} height={8} rx={4} />} />
    <Clay g={g} c="brown" depth={2} shape={(p) => <Rect {...p} x={22} y={78} width={56} height={8} rx={4} />} />
    <Path
      d="M30 22 C30 42 46 48 46 50 C46 52 30 58 30 78 H70 C70 58 54 52 54 50 C54 48 70 42 70 22 Z"
      fill="#F0FDF4"
      stroke="#CBD5E1"
      strokeWidth={1.5}
      opacity={0.8}
    />
    <Polygon points="36,36 64,36 50,48" fill={g('gold')} />
    <Path d="M50 48 V64" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
    <Path d="M36 78 Q50 64 64 78 Z" fill={g('gold')} />
    <Shine cx={38} cy={30} rx={3} ry={6} rot={20} o={0.7} />
  </>
));

export const StopwatchArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={28} />
    <Rect x={46} y={10} width={8} height={10} rx={2.5} fill="#64748B" />
    <Path d="M38 16 H62" stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
    <Clay g={g} c="sky" depth={4} shape={(p) => <Circle {...p} cx={50} cy={54} r={32} />} />
    <Circle cx={50} cy={54} r={24} fill="#FFFFFF" />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <G key={deg} transform={`rotate(${deg} 50 54)`}>
        <Rect x={49} y={32} width={2} height={deg % 90 === 0 ? 5 : 3} fill="#475569" />
      </G>
    ))}
    <Path d="M50 54 L66 44" stroke="#EF4444" strokeWidth={2.2} strokeLinecap="round" />
    <Circle cx={50} cy={54} r={3} fill="#1E293B" />
    <Shine cx={38} cy={42} rx={4} ry={8} rot={30} o={0.75} />
  </>
));

// ============================================================================
// MEASUREMENT ART
// ============================================================================

export const BalanceScaleArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Rect {...p} x={28} y={82} width={44} height={8} rx={4} />} />
    <Rect x={47} y={24} width={6} height={60} rx={3} fill={PAL.gold[2]} />
    <Circle cx={50} cy={24} r={5} fill={g('gold')} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Rect {...p} x={12} y={22} width={76} height={6} rx={3} />} />
    <Path d="M18 26 L12 56 M18 26 L30 56" stroke="#94A3B8" strokeWidth={1.5} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Path {...p} d="M10 56 Q21 68 32 56 Z" />} />
    <Path d="M82 26 L70 56 M82 26 L88 56" stroke="#94A3B8" strokeWidth={1.5} />
    <Clay g={g} c="gold" depth={2} shape={(p) => <Path {...p} d="M68 56 Q79 68 90 56 Z" />} />
    <Sparkle x={50} y={16} r={5} color="#FDE047" />
  </>
));

export const BeakerArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={26} />
    <Clay
      g={g}
      c="sky"
      depth={3}
      shape={(p) => <Path {...p} d="M26 22 L32 82 Q32 86 36 86 H64 Q68 86 68 82 L74 22 Z" />}
    />
    <Path d="M30 48 L33 80 H67 L70 48 Q50 52 30 48 Z" fill="#38BDF8" opacity={0.65} />
    {[34, 46, 58, 70].map((y) => (
      <Path key={y} d={`M${y % 24 === 0 ? 32 : 36} ${y} H${y % 24 === 0 ? 46 : 42}`} stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
    ))}
    <Path d="M22 22 L26 26" stroke="#0284C7" strokeWidth={2.5} strokeLinecap="round" />
    <Shine cx={38} cy={34} rx={3} ry={10} rot={15} o={0.7} />
  </>
));

export const SetSquareArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={32} />
    <Clay
      g={g}
      c="orange"
      depth={4}
      shape={(p) => <Polygon {...p} points="16,84 86,84 16,14" strokeLinejoin="round" />}
    />
    <Polygon points="26,76 70,76 26,32" fill="#FFFFFF" opacity={0.9} />
    {[26, 36, 46, 56, 66, 76].map((x) => (
      <Path key={x} d={`M${x} 84 V${x % 20 === 0 ? 79 : 81}`} stroke="#9A3412" strokeWidth={1.5} />
    ))}
    {[26, 38, 50, 62, 74].map((y) => (
      <Path key={y} d={`M16 ${y} H${y % 24 === 0 ? 21 : 19}`} stroke="#9A3412" strokeWidth={1.5} />
    ))}
    <Shine cx={26} cy={26} rx={3} ry={8} rot={-30} o={0.8} />
  </>
));

export const MeasuringTapeArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={30} />
    <Path d="M48 68 H88 V80 H48 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth={1.2} />
    {[54, 62, 70, 78, 86].map((x) => (
      <Path key={x} d={`M${x} 68 V${x % 16 === 0 ? 73 : 71}`} stroke="#1E293B" strokeWidth={1.2} />
    ))}
    <Rect x={86} y={67} width={3} height={14} fill="#1E293B" />
    <Clay g={g} c="gold" depth={4} shape={(p) => <Circle {...p} cx={42} cy={50} r={28} />} />
    <Circle cx={42} cy={50} r={18} fill="#1E293B" />
    <Circle cx={42} cy={50} r={10} fill={g('yellow')} />
    <Shine cx={30} cy={36} rx={4} ry={8} rot={30} o={0.7} />
  </>
));

export const ThermometerArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={22} />
    <Clay
      g={g}
      c="white"
      depth={3}
      shape={(p) => <Path {...p} d="M44 14 Q44 10 50 10 Q56 10 56 14 V64 A16 16 0 1 1 44 64 Z" />}
    />
    <Circle cx={50} cy={74} r={11} fill={g('red')} />
    <Rect x={48} y={32} width={4} height={42} rx={2} fill="#EF4444" />
    {[20, 28, 36, 44, 52].map((y) => (
      <Path key={y} d={`M56 ${y} H60`} stroke="#64748B" strokeWidth={1.5} strokeLinecap="round" />
    ))}
    <Shine cx={47} cy={24} rx={1.8} ry={8} rot={0} o={0.8} />
    <Circle cx={47} cy={72} r={3} fill="#FFFFFF" opacity={0.6} />
  </>
));

// ============================================================================
// WORD PROBLEMS ART
// ============================================================================

export const BirdArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={26} />
    <Path d="M12 84 Q50 78 88 84" stroke="#78350F" strokeWidth={4} strokeLinecap="round" />
    <Polygon points="22,64 10,78 26,72" fill={PAL.red[3]} />
    <Clay g={g} c="red" depth={3} shape={(p) => <Ellipse {...p} cx={46} cy={56} rx={24} ry={18} />} />
    <Clay g={g} c="red" depth={2} shape={(p) => <Circle {...p} cx={62} cy={40} r={14} />} />
    <Polygon points="74,38 88,42 74,46" fill={g('gold')} />
    <Circle cx={66} cy={38} r={2.5} fill="#1E293B" />
    <Circle cx={65} cy={37} r={0.8} fill="#FFFFFF" />
    <Clay g={g} c="orange" depth={2} shape={(p) => <Path {...p} d="M32 54 C32 42 54 44 56 62 C46 66 32 64 32 54 Z" />} />
    <Shine cx={58} cy={34} rx={3} ry={6} rot={20} o={0.8} />
  </>
));

export const CandyArt = art((g) => (
  <>
    <Shadow cx={50} cy={92} rx={30} />
    <Clay
      g={g}
      c="pink"
      depth={2}
      shape={(p) => <Polygon {...p} points="28,50 10,34 14,50 10,66" strokeLinejoin="round" />}
    />
    <Clay
      g={g}
      c="pink"
      depth={2}
      shape={(p) => <Polygon {...p} points="72,50 90,34 86,50 90,66" strokeLinejoin="round" />}
    />
    <Clay g={g} c="red" depth={4} shape={(p) => <Circle {...p} cx={50} cy={50} r={22} />} />
    <Path d="M40 32 L36 68 M52 28 L48 72 M64 32 L60 68" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
    <Shine cx={42} cy={40} rx={4} ry={8} rot={30} o={0.85} />
    <Sparkle x={74} y={26} r={6} color="#FDE047" />
  </>
));

// ============================================================================
// PIXAR-STYLE FULL-BODY CHARACTERS (benchmark: the 3D lion / monkey / rabbit renders)
//
// Volume shading instead of flat fills + outlines:
//   - radial "ball" gradients per part (key light from the top-left)
//   - warm rim light on the back/bottom edges of every part
//   - soft ambient occlusion where parts meet (chin on chest, between legs, ground)
//   - curved specular highlight strokes + glossy catchlight eyes
// No black outlines anywhere, so they read as soft vinyl toys, not stickers.
// ============================================================================

type Vol3 = { vol: (c: ArtColor) => string; rim: string; ao: string; blush: string };

const VolSvg: React.FC<{ size: number; children: (v: Vol3) => React.ReactNode }> = ({ size, children }) => {
  const uid = 'v3' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const v: Vol3 = { vol: (c) => `url(#${uid}${c})`, rim: `url(#${uid}rim)`, ao: `url(#${uid}ao)`, blush: `url(#${uid}blush)` };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {COLORS.map((c) => (
          <RadialGradient key={c} id={`${uid}${c}`} cx="40%" cy="34%" r="72%" fx="32%" fy="24%">
            <Stop offset="0" stopColor={PAL[c][0]} />
            <Stop offset="0.5" stopColor={PAL[c][1]} />
            <Stop offset="1" stopColor={PAL[c][2]} />
          </RadialGradient>
        ))}
        <RadialGradient id={`${uid}rim`} cx="34%" cy="28%" r="82%">
          <Stop offset="0.72" stopColor="#FFF4DC" stopOpacity="0" />
          <Stop offset="1" stopColor="#FFF4DC" stopOpacity="0.62" />
        </RadialGradient>
        <RadialGradient id={`${uid}ao`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#2A1A10" stopOpacity="0.32" />
          <Stop offset="1" stopColor="#2A1A10" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`${uid}blush`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FB7185" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#FB7185" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {children(v)}
    </Svg>
  );
};

const charArt = (draw: (v: Vol3) => React.ReactNode): ArtFC => {
  const C: ArtFC = ({ size = 64 }) => <VolSvg size={size}>{draw}</VolSvg>;
  return C;
};

/** One volumetric part: ball-shaded fill + rim-light pass. */
const Vol: React.FC<{ v: Vol3; c: ArtColor; shape: (fill: string) => React.ReactElement; rim?: boolean }> = ({ v, c, shape, rim = true }) => (
  <>
    {shape(v.vol(c))}
    {rim ? shape(v.rim) : null}
  </>
);
const AO: React.FC<{ v: Vol3; cx: number; cy: number; rx: number; ry: number }> = ({ v, cx, cy, rx, ry }) => (
  <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={v.ao} />
);
const Gloss: React.FC<{ d: string; w?: number; o?: number }> = ({ d, w = 2.6, o = 0.55 }) => (
  <Path d={d} stroke="#FFFFFF" strokeWidth={w} strokeLinecap="round" fill="none" opacity={o} />
);

/** Big glossy Pixar eye: socket shade, lid shadow, iris glow, twin catchlights. */
const PixarEye: React.FC<{ x: number; y: number; iris: string; s?: number }> = ({ x, y, iris, s = 1 }) => (
  <G>
    <Ellipse cx={x} cy={y + 0.8 * s} rx={7.4 * s} ry={8.4 * s} fill="#2A1A10" opacity={0.16} />
    <Ellipse cx={x} cy={y} rx={6.8 * s} ry={7.8 * s} fill="#FFFFFF" />
    <Ellipse cx={x} cy={y - 3.8 * s} rx={6 * s} ry={3.4 * s} fill="#64748B" opacity={0.16} />
    <Circle cx={x + 0.3 * s} cy={y + 1 * s} r={5.3 * s} fill={iris} />
    <Ellipse cx={x + 0.3 * s} cy={y + 3.7 * s} rx={3.6 * s} ry={1.8 * s} fill="#FFFFFF" opacity={0.32} />
    <Circle cx={x + 0.3 * s} cy={y + 1.2 * s} r={3.2 * s} fill="#140C1C" />
    <Ellipse cx={x - 1.9 * s} cy={y - 1.8 * s} rx={2.2 * s} ry={2.5 * s} fill="#FFFFFF" />
    <Circle cx={x + 2.3 * s} cy={y + 2.9 * s} r={1.05 * s} fill="#FFFFFF" />
    <Path d={`M${x - 6.8 * s} ${y - 1.4 * s} Q${x} ${y - 10 * s} ${x + 6.8 * s} ${y - 1.4 * s}`} stroke="#3B2416" strokeWidth={1.1 * s} strokeLinecap="round" fill="none" opacity={0.8} />
  </G>
);

type EarKind = 'pointy' | 'round' | 'tiny' | 'floppy' | 'pony' | 'calf' | 'big' | 'none';
type TailKind = 'fluffy' | 'curl' | 'thin' | 'pony' | 'ringed' | 'squirrel' | 'kangaroo' | 'none';

interface CubProps {
  v: Vol3;
  fur: ArtColor;
  belly: ArtColor;
  muzzle?: ArtColor;
  limb?: ArtColor;
  pad?: ArtColor;
  iris: string;
  ears: EarKind;
  earC?: ArtColor;
  earInner?: string;
  tail: TailKind;
  tailC?: ArtColor;
  tuft?: string;
  nose?: string;
  hooves?: boolean;
  mouth?: 'smile' | 'tongue' | 'cat' | 'wide';
  snout?: 'short' | 'long' | 'wide' | 'none';
  eyes?: boolean;
  behind?: React.ReactNode;
  behindHead?: React.ReactNode;
  head?: React.ReactNode;
  body?: React.ReactNode;
  top?: React.ReactNode;
}

/** Quadruped sitting rig: same pose and proportions as the lion cub. */
const Cub: React.FC<CubProps> = ({
  v, fur, belly, muzzle, limb, pad, iris, ears, earC, earInner = '#F9A8D4', tail, tailC, tuft = '#3F2A1E', nose = '#3B2416',
  hooves, mouth = 'smile', snout = 'short', eyes = true, behind, behindHead, head, body, top,
}) => {
  const ec = earC ?? fur;
  const tc = tailC ?? fur;
  const lc = limb ?? fur;
  const mc = muzzle ?? belly;
  const pc = pad ?? (hooves ? 'dark' : belly);
  const eyeY = snout === 'long' || snout === 'wide' ? 29.5 : 31;
  return (
    <>
      <AO v={v} cx={50} cy={92.5} rx={34} ry={6} />
      {behind}
      {/* ---- tail */}
      {tail === 'fluffy' ? (
        <Vol v={v} c={tc} shape={(f) => <Path fill={f} d="M64 85 C80 85 91 74 93 60 C94 53 88 51 86 57 C83 68 76 76 63 78 Z" />} />
      ) : tail === 'squirrel' ? (
        <Vol v={v} c={tc} shape={(f) => <Path fill={f} d="M62 87 C94 90 102 54 88 28 C81 16 64 20 71 32 C83 50 80 70 61 77 Z" />} />
      ) : tail === 'pony' ? (
        <Vol v={v} c={tc} shape={(f) => <Path fill={f} d="M65 73 C82 71 93 80 95 93 C89 91 85 93 80 95 C78 86 72 83 63 82 Z" />} />
      ) : tail === 'kangaroo' ? (
        <Vol v={v} c={tc} shape={(f) => <Path fill={f} d="M66 82 C80 84 92 88 99 94 C88 95 76 93 64 90 Z" />} />
      ) : tail === 'curl' || tail === 'ringed' ? (
        <>
          <Path d="M65 86 C83 89 94 76 89 63 C86 56 79 59 82 64" stroke={PAL[tc][2]} strokeWidth={7.5} strokeLinecap="round" fill="none" />
          <Path d="M65 85 C82 87.5 92.5 76 88 64" stroke={PAL[tc][1]} strokeWidth={5} strokeLinecap="round" fill="none" />
          <Path d="M68 84 C80 85 88 78 88.5 70" stroke={PAL[tc][0]} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.7} />
          {tail === 'ringed' ? <Path d="M76 87 L78 81 M84 83 L88 78 M88.5 72 L94 70" stroke="#1E293B" strokeWidth={2.4} strokeLinecap="round" /> : null}
        </>
      ) : tail === 'thin' ? (
        <>
          <Path d="M65 86 C79 86 85 76 87 66" stroke={PAL[tc][2]} strokeWidth={3.2} strokeLinecap="round" fill="none" />
          <Ellipse cx={87.5} cy={62.5} rx={4} ry={5.4} fill={tuft} />
        </>
      ) : null}
      {/* ---- back haunches */}
      <Vol v={v} c={lc} shape={(f) => <Ellipse fill={f} cx={31} cy={79} rx={14.5} ry={12.5} />} />
      <Vol v={v} c={lc} shape={(f) => <Ellipse fill={f} cx={69} cy={79} rx={14.5} ry={12.5} />} />
      {/* ---- chubby body */}
      <Vol v={v} c={fur} shape={(f) => <Path fill={f} d="M35 49 C27 60 26 78 33 89.5 L67 89.5 C74 78 73 60 65 49 Z" />} />
      <AO v={v} cx={50} cy={56} rx={16} ry={6} />
      <Vol v={v} c={belly} shape={(f) => <Ellipse fill={f} cx={50} cy={70} rx={11} ry={14.5} />} />
      {body}
      <Gloss d="M36.5 60 Q34.5 68 36.5 76" w={2.2} o={0.32} />
      {/* ---- front legs + paws */}
      <Vol v={v} c={lc} shape={(f) => <Rect fill={f} x={37} y={65} width={11.5} height={25} rx={5.75} />} />
      <Vol v={v} c={lc} shape={(f) => <Rect fill={f} x={51.5} y={65} width={11.5} height={25} rx={5.75} />} />
      <AO v={v} cx={50} cy={84} rx={3} ry={7} />
      {[42.75, 57.25].map((x) => (
        <G key={x}>
          <Vol v={v} c={pc} shape={(f) => <Ellipse fill={f} cx={x} cy={89} rx={7.4} ry={4.6} />} />
          {hooves ? null : <Path d={`M${x - 2.4} 87.2 V90.6 M${x + 2.4} 87.2 V90.6`} stroke="#2A1A10" strokeWidth={0.8} strokeLinecap="round" opacity={0.25} />}
        </G>
      ))}
      {/* ---- ears behind the head */}
      {ears === 'pointy' || ears === 'big' ? (
        <>
          <Vol v={v} c={ec} shape={(f) => <Path fill={f} d={ears === 'big' ? 'M30 24 C18 18 14 4 22 2 C32 2 42 10 44 16 Z' : 'M28 25 C24 16 23 7 26 3 C33 5 42 11 46 15 Z'} />} />
          <Vol v={v} c={ec} shape={(f) => <Path fill={f} d={ears === 'big' ? 'M70 24 C82 18 86 4 78 2 C68 2 58 10 56 16 Z' : 'M72 25 C76 16 77 7 74 3 C67 5 58 11 54 15 Z'} />} />
          <Path d={ears === 'big' ? 'M31 19 C24 15 21 7 25 6 C31 7 37 11 38 15 Z' : 'M30 20 C28 14 27.5 9 29 7 C33 9 38 12 40 15 Z'} fill={earInner} />
          <Path d={ears === 'big' ? 'M69 19 C76 15 79 7 75 6 C69 7 63 11 62 15 Z' : 'M70 20 C72 14 72.5 9 71 7 C67 9 62 12 60 15 Z'} fill={earInner} />
        </>
      ) : ears === 'round' || ears === 'tiny' ? (
        <>
          {[30, 70].map((x) => (
            <G key={x}>
              <Vol v={v} c={ec} shape={(f) => <Circle fill={f} cx={x} cy={ears === 'tiny' ? 17 : 15.5} r={ears === 'tiny' ? 5.6 : 9.5} />} />
              <Circle cx={x} cy={ears === 'tiny' ? 17 : 15.5} r={ears === 'tiny' ? 2.8 : 5} fill={earInner} />
            </G>
          ))}
        </>
      ) : ears === 'pony' ? (
        <>
          <Vol v={v} c={ec} shape={(f) => <Path fill={f} d="M33 22 Q29 6 36 -1 Q45 8 43.5 18 Z" />} />
          <Vol v={v} c={ec} shape={(f) => <Path fill={f} d="M67 22 Q71 6 64 -1 Q55 8 56.5 18 Z" />} />
          <Path d="M35.5 17 Q33.5 8 37 3.5 Q41.5 10 40.5 16 Z" fill={earInner} />
          <Path d="M64.5 17 Q66.5 8 63 3.5 Q58.5 10 59.5 16 Z" fill={earInner} />
        </>
      ) : ears === 'calf' ? (
        <>
          <Vol v={v} c={ec} shape={(f) => <Ellipse fill={f} cx={21.5} cy={28} rx={11.5} ry={5.8} transform="rotate(-18 21.5 28)" />} />
          <Vol v={v} c={ec} shape={(f) => <Ellipse fill={f} cx={78.5} cy={28} rx={11.5} ry={5.8} transform="rotate(18 78.5 28)" />} />
          <Ellipse cx={21} cy={28.3} rx={7} ry={2.9} fill={earInner} transform="rotate(-18 21 28.3)" />
          <Ellipse cx={79} cy={28.3} rx={7} ry={2.9} fill={earInner} transform="rotate(18 79 28.3)" />
        </>
      ) : null}
      {behindHead}
      {/* ---- head */}
      <Vol v={v} c={fur} shape={(f) => <Ellipse fill={f} cx={50} cy={34} rx={24.5} ry={23} />} />
      {head}
      {ears === 'floppy' ? (
        <>
          <Vol v={v} c={ec} shape={(f) => <Path fill={f} d="M31 15 C18 15 13 34 18 50 C21.5 58 30.5 55 31.5 44 C32.5 34 34.5 23 31 15 Z" />} />
          <Vol v={v} c={ec} shape={(f) => <Path fill={f} d="M69 15 C82 15 87 34 82 50 C78.5 58 69.5 55 68.5 44 C67.5 34 65.5 23 69 15 Z" />} />
        </>
      ) : null}
      {/* ---- muzzle, nose, mouth */}
      {snout === 'short' ? (
        <>
          <Vol v={v} c={mc} shape={(f) => <Ellipse fill={f} cx={50} cy={44.5} rx={11} ry={8} />} rim={false} />
          <Path d="M45.5 39.5 Q50 37 54.5 39.5 Q54.5 43 50 44.6 Q45.5 43 45.5 39.5 Z" fill={nose} />
          <Ellipse cx={48.3} cy={39.6} rx={1.7} ry={0.9} fill="#FFFFFF" opacity={0.75} />
          {mouth === 'cat' ? (
            <Path d="M45.5 46.2 Q48 49.2 50 46.6 Q52 49.2 54.5 46.2" stroke="#4A2511" strokeWidth={1.3} strokeLinecap="round" fill="none" />
          ) : (
            <>
              <Path d="M44 46 Q50 54 56 46 Q50 48.6 44 46 Z" fill="#7F1D1D" />
              {mouth === 'tongue' ? <Ellipse cx={50} cy={50.8} rx={3.3} ry={3.8} fill="#FB7185" /> : <Ellipse cx={50} cy={49.8} rx={2.7} ry={1.4} fill="#FB7185" />}
            </>
          )}
        </>
      ) : snout === 'long' || snout === 'wide' ? (
        <>
          <Vol v={v} c={mc} shape={(f) => <Ellipse fill={f} cx={50} cy={47} rx={snout === 'wide' ? 16.5 : 13.5} ry={10.5} />} rim={false} />
          <Ellipse cx={snout === 'wide' ? 43.5 : 45} cy={45.5} rx={1.8} ry={2.5} fill="#3B2416" opacity={0.85} />
          <Ellipse cx={snout === 'wide' ? 56.5 : 55} cy={45.5} rx={1.8} ry={2.5} fill="#3B2416" opacity={0.85} />
          <Path d={snout === 'wide' ? 'M41 51 Q50 58 59 51' : 'M44 51.5 Q50 56.5 56 51.5'} stroke="#4A2511" strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Gloss d="M42 43 Q45 40.5 49 40.5" w={1.6} o={0.6} />
        </>
      ) : null}
      {/* ---- eyes, brows, cheeks */}
      {eyes ? (
        <>
          <PixarEye x={40} y={eyeY} iris={iris} />
          <PixarEye x={60} y={eyeY} iris={iris} />
          <Path d={`M34.5 ${eyeY - 9.5} Q40 ${eyeY - 12} 45 ${eyeY - 10} M55 ${eyeY - 10} Q60 ${eyeY - 12} 65.5 ${eyeY - 9.5}`} stroke={PAL[fur][3]} strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.55} />
        </>
      ) : null}
      <Ellipse cx={29.5} cy={43} rx={6} ry={4} fill={v.blush} />
      <Ellipse cx={70.5} cy={43} rx={6} ry={4} fill={v.blush} />
      <Gloss d="M33 24 Q36 16 45 13" w={3} o={0.5} />
      <Ellipse cx={31.5} cy={28.5} rx={1.3} ry={1.6} fill="#FFFFFF" opacity={0.6} />
      {top}
    </>
  );
};

interface ChickProps {
  v: Vol3;
  body: ArtColor;
  belly: ArtColor;
  wing?: ArtColor;
  iris?: string;
  beak: 'short' | 'duck' | 'long' | 'hook' | 'flat' | 'bent';
  beakC: ArtColor;
  neck?: number;
  legs?: 'short' | 'long';
  legC?: string;
  crest?: React.ReactNode;
  tail?: React.ReactNode;
  face?: React.ReactNode;
  top?: React.ReactNode;
}

/** Bird rig: plump round chick perched upright, same eye/cheek language as the cubs. */
const Chick: React.FC<ChickProps> = ({ v, body, belly, wing, iris = '#1E1B2E', beak, beakC, neck = 0, legs = 'short', legC = '#F59E0B', crest, tail, face, top }) => {
  const long = legs === 'long';
  const by = long ? 57 : 67;
  const hy = (long ? 29 : 35) - neck;
  const wc = wing ?? body;
  return (
    <>
      <AO v={v} cx={50} cy={93} rx={26} ry={5} />
      {tail}
      {/* legs + feet */}
      {long ? (
        <>
          <Path d={`M44 ${by + 18} L42 82 L45 92 M56 ${by + 18} L58 82 L55 92`} stroke={legC} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M40 92.5 H49 M51 92.5 H60" stroke={legC} strokeWidth={2.6} strokeLinecap="round" />
        </>
      ) : (
        <Path d={`M44 ${by + 18} V90 M40 91 L44 89.5 L48 91 M56 ${by + 18} V90 M52 91 L56 89.5 L60 91`} stroke={legC} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
      {/* body, belly, wings */}
      <Vol v={v} c={body} shape={(f) => <Ellipse fill={f} cx={50} cy={by} rx={26} ry={23.5} />} />
      <Vol v={v} c={belly} shape={(f) => <Ellipse fill={f} cx={50} cy={by + 5} rx={15} ry={15.5} />} rim={false} />
      <Vol v={v} c={wc} shape={(f) => <Path fill={f} d={`M27 ${by - 8} C15 ${by} 17 ${by + 18} 31 ${by + 20} C34 ${by + 10} 33 ${by} 27 ${by - 8} Z`} />} />
      <Vol v={v} c={wc} shape={(f) => <Path fill={f} d={`M73 ${by - 8} C85 ${by} 83 ${by + 18} 69 ${by + 20} C66 ${by + 10} 67 ${by} 73 ${by - 8} Z`} />} />
      <Gloss d={`M33 ${by - 10} Q30 ${by - 2} 31 ${by + 6}`} w={2.2} o={0.35} />
      {neck > 0 ? <Vol v={v} c={body} shape={(f) => <Rect fill={f} x={42.5} y={hy + 8} width={15} height={by - hy - 14} rx={7.5} />} /> : null}
      <AO v={v} cx={50} cy={hy + 17} rx={12} ry={4} />
      {/* head */}
      <Vol v={v} c={body} shape={(f) => <Circle fill={f} cx={50} cy={hy} r={18.5} />} />
      {face}
      {crest}
      <PixarEye x={43} y={hy - 1} iris={iris} s={0.74} />
      <PixarEye x={57} y={hy - 1} iris={iris} s={0.74} />
      {/* beak */}
      {beak === 'duck' ? (
        <>
          <Vol v={v} c={beakC} shape={(f) => <Ellipse fill={f} cx={50} cy={hy + 8} rx={8} ry={4} />} />
          <Path d={`M43 ${hy + 8} Q50 ${hy + 10.5} 57 ${hy + 8}`} stroke={PAL[beakC][3]} strokeWidth={1} fill="none" opacity={0.7} />
        </>
      ) : beak === 'long' ? (
        <Vol v={v} c={beakC} shape={(f) => <Path fill={f} d={`M46.5 ${hy + 4.5} Q50 ${hy + 3} 53.5 ${hy + 4.5} L50.5 ${hy + 19} Q50 ${hy + 19.6} 49.5 ${hy + 19} Z`} />} />
      ) : beak === 'bent' ? (
        <>
          <Vol v={v} c={beakC} shape={(f) => <Path fill={f} d={`M46 ${hy + 4.5} Q50 ${hy + 3} 54 ${hy + 4.5} Q56 ${hy + 12} 51 ${hy + 16} Q52 ${hy + 10} 46 ${hy + 4.5} Z`} />} />
          <Path d={`M54.6 ${hy + 10} Q55 ${hy + 13} 51 ${hy + 16}`} stroke="#1E293B" strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </>
      ) : beak === 'hook' ? (
        <Vol v={v} c={beakC} shape={(f) => <Path fill={f} d={`M45.5 ${hy + 4} Q50 ${hy + 2} 54.5 ${hy + 4} Q55 ${hy + 9} 50.5 ${hy + 12} Q51.5 ${hy + 8} 45.5 ${hy + 4} Z`} />} />
      ) : beak === 'flat' ? (
        <Vol v={v} c={beakC} shape={(f) => <Ellipse fill={f} cx={50} cy={hy + 7} rx={5.5} ry={2.8} />} />
      ) : (
        <Vol v={v} c={beakC} shape={(f) => <Path fill={f} d={`M46 ${hy + 4.5} Q50 ${hy + 3} 54 ${hy + 4.5} L50 ${hy + 10.5} Z`} />} />
      )}
      <Ellipse cx={36} cy={hy + 5} rx={4.5} ry={3} fill={v.blush} />
      <Ellipse cx={64} cy={hy + 5} rx={4.5} ry={3} fill={v.blush} />
      <Gloss d={`M37 ${hy - 10} Q41 ${hy - 16} 48 ${hy - 17}`} w={2.6} o={0.5} />
      {top}
    </>
  );
};

// ---------------------------------------------------------------- quadrupeds

export const PuppyArt = charArt((v) => (
  <Cub v={v} fur="tan" belly="cream" iris="#6B3A1E" ears="floppy" earC="brown" tail="fluffy" mouth="tongue" />
));

export const KittenArt = charArt((v) => (
  <Cub
    v={v} fur="orange" belly="cream" iris="#16A34A" ears="pointy" tail="curl" nose="#F472B6" mouth="cat"
    head={<Path d="M43.5 13.5 L45.5 20.5 M50 12 L50 19.5 M56.5 13.5 L54.5 20.5" stroke={PAL.orange[3]} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />}
    body={<Path d="M23 74 L31 75 M22.5 81 L30 81 M77 74 L69 75 M77.5 81 L70 81" stroke={PAL.orange[3]} strokeWidth={2.1} strokeLinecap="round" opacity={0.8} />}
    top={<Path d="M21 41 L35.5 43.5 M22 47 L35.5 46 M79 41 L64.5 43.5 M78 47 L64.5 46" stroke="#7C2D12" strokeWidth={0.8} strokeLinecap="round" opacity={0.5} />}
  />
));

export const CalfArt = charArt((v) => (
  <Cub
    v={v} fur="white" belly="white" muzzle="rose" iris="#6B3A1E" ears="calf" earInner="#F9A8D4" tail="thin" tailC="grey" hooves snout="long"
    behindHead={
      <>
        <Vol v={v} c="cream" shape={(f) => <Path fill={f} d="M35 15 Q31 6 35 2 Q40 7 40 13 Z" />} />
        <Vol v={v} c="cream" shape={(f) => <Path fill={f} d="M65 15 Q69 6 65 2 Q60 7 60 13 Z" />} />
      </>
    }
    head={<Path d="M55 13.5 C66 11 73 20 71.5 29 C64 31 57 24 55 13.5 Z" fill="#1F2937" opacity={0.92} />}
    body={
      <>
        <Ellipse cx={30} cy={77} rx={6.5} ry={5.2} fill="#1F2937" opacity={0.92} />
        <Ellipse cx={66.5} cy={59} rx={4.2} ry={5.2} fill="#1F2937" opacity={0.92} />
      </>
    }
  />
));

const ponyMane = (v: Vol3, c: ArtColor) => (
  <Vol v={v} c={c} shape={(f) => <Path fill={f} d="M37 16 C40 5 57 3 63 11 C59 11 57.5 17 53 16.5 C51 21.5 45 21.5 43 17.5 C40.5 21 35.5 20 37 16 Z" />} />
);
const neckMane = (v: Vol3, c: ArtColor) => (
  <Vol v={v} c={c} shape={(f) => <Path fill={f} d="M60 17 C71 23 73 40 67 55 C64.5 46 62.5 36 56 30 Z" />} />
);

export const PonyArt = charArt((v) => (
  <Cub v={v} fur="tan" belly="cream" iris="#5C2E0E" ears="pony" earInner="#E9B77C" tail="pony" tailC="brown" hooves pad="brown" snout="long"
    head={ponyMane(v, 'brown')} body={neckMane(v, 'brown')} />
));

export const TigerCubArt = charArt((v) => (
  <Cub
    v={v} fur="orange" belly="white" iris="#B45309" ears="round" tail="ringed"
    head={<Path d="M43 13 L45 20 M50 11.5 L50 19 M57 13 L55 20 M26.5 30 L33.5 31 M26.5 36 L32.5 36 M73.5 30 L66.5 31 M73.5 36 L67.5 36" stroke="#1E293B" strokeWidth={2.2} strokeLinecap="round" />}
    body={<Path d="M21.5 76 L29.5 77 M21.5 83 L28.5 83 M78.5 76 L70.5 77 M78.5 83 L71.5 83" stroke="#1E293B" strokeWidth={2.2} strokeLinecap="round" />}
  />
));

export const CamelArt = charArt((v) => (
  <Cub
    v={v} fur="sand" belly="cream" iris="#5C2E0E" ears="tiny" earInner="#C99A5B" tail="thin" tailC="sand" tuft="#7C5A2E" pad="tan" snout="long"
    behind={<Vol v={v} c="sand" shape={(f) => <Ellipse fill={f} cx={63} cy={52} rx={15} ry={13} />} />}
    head={<Vol v={v} c="tan" shape={(f) => <Path fill={f} d="M40 14 C43 9 57 9 60 14 C56 15 53 17 50 16 C47 17 44 15 40 14 Z" />} />}
    top={<Path d="M33.5 24 L32 21.5 M36.5 22.5 L35.5 19.8 M66.5 24 L68 21.5 M63.5 22.5 L64.5 19.8" stroke="#3B2416" strokeWidth={1} strokeLinecap="round" />}
  />
));

export const GiraffeArt = charArt((v) => (
  <Cub
    v={v} fur="honey" belly="cream" muzzle="cream" iris="#5C2E0E" ears="pony" earInner="#F6C866" tail="thin" tailC="honey" hooves pad="brown" snout="long"
    behindHead={
      <>
        {[42, 58].map((x) => (
          <G key={x}>
            <Rect x={x - 2} y={1} width={4} height={14} rx={2} fill={PAL.honey[2]} />
            <Vol v={v} c="brown" shape={(f) => <Circle fill={f} cx={x} cy={2.5} r={3.6} />} />
          </G>
        ))}
      </>
    }
    head={
      <>
        <Path d="M30 25 Q33 21 37 24 Q36 29 31 29 Z M64 22 Q69 20 70 25 Q67 29 63 27 Z" fill="#B7791F" opacity={0.85} />
        {ponyMane(v, 'brown')}
      </>
    }
    body={
      <>
        <Path d="M27 72 Q31 67 36 71 Q35 77 29 77 Z M64 70 Q69 66 73 71 Q71 77 65 76 Z M58 57 Q62 54 65 58 Q63 62 59 61 Z M35 58 Q38 55 41 58 Q39 62 36 61 Z" fill="#B7791F" opacity={0.85} />
        {neckMane(v, 'brown')}
      </>
    }
  />
));

export const ZebraArt = charArt((v) => (
  <Cub
    v={v} fur="white" belly="white" muzzle="dark" iris="#3B2416" ears="pony" earC="white" earInner="#94A3B8" tail="thin" tailC="grey" hooves snout="long"
    head={
      <>
        <Path d="M30 22 Q36 25 38 31 M70 22 Q64 25 62 31 M27 33 Q32 34 34 38 M73 33 Q68 34 66 38 M44 14 Q46 19 45 24 M56 14 Q54 19 55 24" stroke="#1E293B" strokeWidth={2.6} strokeLinecap="round" fill="none" />
        {ponyMane(v, 'dark')}
      </>
    }
    body={
      <>
        <Path d="M22 72 Q27 74 30 79 M21 80 Q25 81 28 86 M78 72 Q73 74 70 79 M79 80 Q75 81 72 86 M37 56 Q40 60 39 65 M63 56 Q60 60 61 65" stroke="#1E293B" strokeWidth={2.6} strokeLinecap="round" fill="none" />
        {neckMane(v, 'dark')}
      </>
    }
  />
));

export const FawnArt = charArt((v) => (
  <Cub
    v={v} fur="tan" belly="cream" muzzle="cream" iris="#5C2E0E" ears="big" earInner="#FDE6C6" tail="none" hooves pad="brown" snout="long"
    behindHead={<Path d="M39 13 L36 4 M37.5 8 L33 6 M61 13 L64 4 M62.5 8 L67 6" stroke="#78350F" strokeWidth={2.6} strokeLinecap="round" />}
    body={
      <>
        {[[27, 73], [32, 80], [24, 81], [73, 73], [68, 80], [76, 81], [37, 59], [63, 59]].map(([x, y]) => (
          <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx={1.9} ry={1.5} fill="#FFFFFF" opacity={0.9} />
        ))}
      </>
    }
  />
));

export const GoatKidArt = charArt((v) => (
  <Cub
    v={v} fur="white" belly="white" muzzle="cream" iris="#B45309" ears="calf" earInner="#FBCFE8" tail="none" hooves pad="grey" snout="long"
    behindHead={
      <>
        <Path d="M40 14 Q36 4 30 4" stroke="#94A3B8" strokeWidth={4.5} strokeLinecap="round" fill="none" />
        <Path d="M60 14 Q64 4 70 4" stroke="#94A3B8" strokeWidth={4.5} strokeLinecap="round" fill="none" />
      </>
    }
    top={<Vol v={v} c="white" shape={(f) => <Path fill={f} d="M46 56 Q50 66 54 56 Q50 58 46 56 Z" />} />}
  />
));

export const LambArt = charArt((v) => (
  <Cub
    v={v} fur="cream" belly="white" muzzle="white" iris="#3B2416" ears="calf" earC="cream" earInner="#FBCFE8" tail="none" hooves snout="long"
    head={
      <>
        {[[36, 15], [44, 11], [52, 10], [60, 12], [66, 17]].map(([x, y]) => (
          <Vol key={`${x}`} v={v} c="white" shape={(f) => <Circle fill={f} cx={x} cy={y} r={6} />} />
        ))}
      </>
    }
    body={
      <>
        {[[24, 74], [30, 70], [70, 70], [76, 74], [36, 56], [64, 56]].map(([x, y]) => (
          <Vol key={`${x}-${y}`} v={v} c="white" shape={(f) => <Circle fill={f} cx={x} cy={y} r={5.5} />} />
        ))}
      </>
    }
  />
));

const bigHorns = (v: Vol3, c: ArtColor) => (
  <>
    <Vol v={v} c={c} shape={(f) => <Path fill={f} d="M34 18 C22 18 14 12 14 4 C20 10 28 11 36 12 Z" />} />
    <Vol v={v} c={c} shape={(f) => <Path fill={f} d="M66 18 C78 18 86 12 86 4 C80 10 72 11 64 12 Z" />} />
  </>
);

export const BuffaloCalfArt = charArt((v) => (
  <Cub v={v} fur="slate" belly="grey" muzzle="grey" iris="#3B2416" ears="calf" earC="slate" earInner="#94A3B8" tail="thin" tailC="slate" hooves snout="wide"
    behindHead={bigHorns(v, 'grey')} />
));

export const OxCalfArt = charArt((v) => (
  <Cub v={v} fur="white" belly="white" muzzle="grey" iris="#3B2416" ears="calf" earInner="#FBCFE8" tail="thin" tailC="grey" hooves snout="long"
    behind={<Vol v={v} c="white" shape={(f) => <Ellipse fill={f} cx={50} cy={50} rx={17} ry={8} />} />}
    behindHead={
      <>
        <Path d="M38 14 Q34 4 38 0" stroke={PAL.tan[1]} strokeWidth={4.6} strokeLinecap="round" fill="none" />
        <Path d="M62 14 Q66 4 62 0" stroke={PAL.tan[1]} strokeWidth={4.6} strokeLinecap="round" fill="none" />
      </>
    } />
));

export const WolfPupArt = charArt((v) => (
  <Cub v={v} fur="grey" belly="white" muzzle="white" iris="#D97706" ears="pointy" earInner="#E2E8F0" tail="fluffy" tailC="grey" />
));

const spots = (pts: number[][], ring: boolean) => (
  <>
    {pts.map(([x, y]) =>
      ring ? (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} fill="none" stroke="#3B2416" strokeWidth={1.3} opacity={0.85} />
      ) : (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="#1E1B2E" opacity={0.85} />
      )
    )}
  </>
);

export const LeopardCubArt = charArt((v) => (
  <Cub v={v} fur="honey" belly="cream" iris="#16A34A" ears="round" tail="curl" tailC="honey"
    head={spots([[38, 15], [50, 12], [62, 15], [29, 30], [71, 30]], true)}
    body={spots([[25, 74], [31, 81], [69, 81], [75, 74], [37, 57], [63, 57], [24, 84], [76, 84]], true)} />
));

export const CheetahCubArt = charArt((v) => (
  <Cub v={v} fur="honey" belly="cream" iris="#B45309" ears="tiny" tail="ringed" tailC="honey"
    head={
      <>
        {spots([[39, 15], [50, 12.5], [61, 15], [28, 31], [72, 31]], false)}
        <Path d="M37 38 Q38 43 41 46 M63 38 Q62 43 59 46" stroke="#1E1B2E" strokeWidth={1.6} strokeLinecap="round" fill="none" />
      </>
    }
    body={spots([[25, 74], [31, 81], [69, 81], [75, 74], [37, 57], [63, 57], [26, 85], [74, 85], [33, 69], [67, 69]], false)} />
));

export const PandaCubArt = charArt((v) => (
  <Cub v={v} fur="white" belly="white" limb="dark" pad="dark" iris="#3B2416" ears="round" earC="dark" earInner="#475569" tail="none"
    head={
      <>
        <Ellipse cx={39.5} cy={31.5} rx={8.4} ry={10} fill="#1E293B" transform="rotate(20 39.5 31.5)" />
        <Ellipse cx={60.5} cy={31.5} rx={8.4} ry={10} fill="#1E293B" transform="rotate(-20 60.5 31.5)" />
      </>
    } />
));

export const HippoCalfArt = charArt((v) => (
  <Cub v={v} fur="lilac" belly="rose" muzzle="lilac" iris="#3B2416" ears="tiny" earInner="#F9A8D4" tail="none" pad="lilac" snout="wide" mouth="wide" />
));

export const RhinoCalfArt = charArt((v) => (
  <Cub v={v} fur="grey" belly="white" muzzle="grey" iris="#3B2416" ears="tiny" earInner="#CBD5E1" tail="thin" tailC="grey" hooves snout="wide"
    top={
      <>
        <Vol v={v} c="cream" shape={(f) => <Path fill={f} d="M45.5 41 Q50 27 54.5 41 Z" />} />
        <Vol v={v} c="cream" shape={(f) => <Path fill={f} d="M47.5 32 Q50 25 52.5 32 Z" />} />
      </>
    } />
));

export const DonkeyFoalArt = charArt((v) => (
  <Cub v={v} fur="grey" belly="white" muzzle="white" iris="#3B2416" ears="pony" earInner="#E2E8F0" tail="thin" tailC="grey" hooves snout="long"
    head={ponyMane(v, 'slate')} body={neckMane(v, 'slate')} />
));

export const KangarooJoeyArt = charArt((v) => (
  <Cub v={v} fur="tan" belly="cream" iris="#5C2E0E" ears="pony" earInner="#FDE6C6" tail="kangaroo" snout="long"
    body={<Path d="M41 74 Q50 79 59 74" stroke={PAL.tan[3]} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.6} />} />
));

export const SquirrelPupArt = charArt((v) => (
  <Cub v={v} fur="orange" belly="cream" iris="#3B2416" ears="pointy" tail="squirrel"
    top={
      <>
        <Vol v={v} c="brown" shape={(f) => <Ellipse fill={f} cx={50} cy={80} rx={6} ry={5.5} />} />
        <Vol v={v} c="tan" shape={(f) => <Path fill={f} d="M43.5 76 Q50 70 56.5 76 Z" />} />
      </>
    } />
));

export const FroggyArt = charArt((v) => (
  <Cub
    v={v} fur="green" belly="cream" limb="green" pad="green" iris="#1E1B2E" ears="none" tail="none" snout="none" eyes={false}
    head={<Path d="M33 42 Q50 56 67 42" stroke="#14532D" strokeWidth={2.4} strokeLinecap="round" fill="none" />}
    top={
      <>
        {[38, 62].map((x) => (
          <G key={x}>
            <Vol v={v} c="green" shape={(f) => <Circle fill={f} cx={x} cy={17} r={10.5} />} />
            <PixarEye x={x} y={17} iris="#1E1B2E" s={0.95} />
          </G>
        ))}
      </>
    }
  />
));

// ---------------------------------------------------------------- birds

const fanTail = (v: Vol3) => (
  <>
    {Array.from({ length: 9 }, (_, i) => {
      const a = -160 + i * 17.5;
      const rad = (a * Math.PI) / 180;
      const tx = 50 + Math.cos(rad) * 37;
      const ty = 62 + Math.sin(rad) * 37;
      return (
        <G key={i}>
          <Path d={`M50 62 L${tx.toFixed(1)} ${ty.toFixed(1)}`} stroke="#0F766E" strokeWidth={1.3} />
          <Vol v={v} c={i % 2 === 0 ? 'teal' : 'green'} shape={(f) => <Ellipse fill={f} cx={tx} cy={ty} rx={9} ry={12.5} transform={`rotate(${a + 90} ${tx} ${ty})`} />} />
          <Circle cx={tx} cy={ty} r={5} fill="#FDE047" />
          <Circle cx={tx} cy={ty} r={3.4} fill="#1D4ED8" />
          <Circle cx={tx - 0.9} cy={ty - 0.9} r={1} fill="#FFFFFF" opacity={0.8} />
        </G>
      );
    })}
  </>
);

export const PeacockArt = charArt((v) => (
  <Chick
    v={v} body="blue" belly="sky" wing="teal" beak="short" beakC="gold" legC="#B45309" tail={fanTail(v)}
    crest={
      <>
        {[44, 50, 56].map((x, i) => (
          <G key={x}>
            <Path d={`M50 22 L${x} ${i === 1 ? 7 : 10}`} stroke="#1D4ED8" strokeWidth={1.3} />
            <Vol v={v} c="blue" shape={(f) => <Circle fill={f} cx={x} cy={i === 1 ? 7 : 10} r={2.8} />} />
            <Circle cx={x} cy={i === 1 ? 7 : 10} r={1.2} fill="#FDE047" />
          </G>
        ))}
      </>
    }
    face={
      <>
        <Ellipse cx={42} cy={34} rx={7.5} ry={5} fill="#FFFFFF" opacity={0.85} />
        <Ellipse cx={58} cy={34} rx={7.5} ry={5} fill="#FFFFFF" opacity={0.85} />
      </>
    }
  />
));

export const DucklingArt = charArt((v) => (
  <Chick v={v} body="yellow" belly="cream" beak="duck" beakC="orange" legC="#F97316"
    crest={<Path d="M50 17 Q46 8 52 5 Q51 11 56 12" stroke={PAL.yellow[2]} strokeWidth={2.6} strokeLinecap="round" fill="none" />} />
));

export const RoosterArt = charArt((v) => (
  <Chick v={v} body="gold" belly="cream" wing="orange" beak="short" beakC="yellow" legC="#F59E0B"
    tail={
      <>
        <Vol v={v} c="green" shape={(f) => <Path fill={f} d="M68 60 C84 46 92 36 90 24 C98 34 96 54 74 70 Z" />} />
        <Vol v={v} c="red" shape={(f) => <Path fill={f} d="M70 66 C88 58 96 50 98 40 C100 54 92 66 74 74 Z" />} />
      </>
    }
    crest={
      <>
        {[44, 50, 56].map((x, i) => (
          <Vol key={x} v={v} c="red" shape={(f) => <Circle fill={f} cx={x} cy={i === 1 ? 15 : 17.5} r={4.4} />} />
        ))}
      </>
    }
    top={<Vol v={v} c="red" shape={(f) => <Ellipse fill={f} cx={50} cy={47} rx={3} ry={4.2} />} />}
  />
));

export const CygnetArt = charArt((v) => (
  <Chick v={v} body="white" belly="white" beak="short" beakC="orange" neck={6} legC="#475569" />
));

export const FlamingoArt = charArt((v) => (
  <Chick v={v} body="rose" belly="rose" wing="pink" beak="bent" beakC="rose" neck={6} legs="long" legC="#F472B6" />
));

export const CraneChickArt = charArt((v) => (
  <Chick v={v} body="grey" belly="white" wing="slate" beak="long" beakC="grey" neck={6} legs="long" legC="#57534E"
    crest={<Vol v={v} c="red" shape={(f) => <Ellipse fill={f} cx={50} cy={8} rx={8} ry={4.5} />} />} />
));

export const WoodpeckerArt = charArt((v) => (
  <Chick v={v} body="dark" belly="white" wing="dark" beak="long" beakC="grey" legC="#475569"
    crest={<Vol v={v} c="red" shape={(f) => <Path fill={f} d="M36 25 Q50 6 64 25 Q50 19 36 25 Z" />} />}
    top={<>{[[24, 66], [27, 74], [76, 66], [73, 74]].map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="#FFFFFF" />)}</>} />
));

export const KingfisherArt = charArt((v) => (
  <Chick v={v} body="sky" belly="orange" wing="blue" beak="long" beakC="dark" legC="#EF4444"
    face={<Ellipse cx={50} cy={46} rx={7} ry={4} fill="#FFFFFF" opacity={0.9} />} />
));

export const PenguinArt = charArt((v) => (
  <Chick v={v} body="dark" belly="white" wing="dark" beak="short" beakC="orange" legC="#F97316"
    face={<Path d="M34 38 Q34 24 44 24 Q50 28 56 24 Q66 24 66 38 Q60 50 50 51 Q40 50 34 38 Z" fill="#FFFFFF" />} />
));

export const OstrichChickArt = charArt((v) => (
  <Chick v={v} body="sand" belly="cream" wing="brown" beak="short" beakC="honey" neck={4} legs="long" legC="#C99A5B"
    crest={<Path d="M46 12 Q47 6 50 8 Q52 4 54 9" stroke={PAL.sand[3]} strokeWidth={2} strokeLinecap="round" fill="none" />} />
));

export const CrowChickArt = charArt((v) => (
  <Chick v={v} body="dark" belly="slate" wing="dark" beak="short" beakC="grey" legC="#475569" />
));

export const ElephantCalfArt = charArt((v) => (
  <Cub
    v={v} fur="lilac" belly="rose" muzzle="lilac" iris="#3B2416" ears="none" tail="thin" tailC="lilac" pad="rose" snout="none"
    behindHead={
      <>
        <Vol v={v} c="lilac" shape={(f) => <Ellipse fill={f} cx={21} cy={34} rx={15} ry={17} />} />
        <Vol v={v} c="lilac" shape={(f) => <Ellipse fill={f} cx={79} cy={34} rx={15} ry={17} />} />
        <Ellipse cx={22} cy={35} rx={9} ry={11} fill="#F9A8D4" opacity={0.75} />
        <Ellipse cx={78} cy={35} rx={9} ry={11} fill="#F9A8D4" opacity={0.75} />
      </>
    }
    top={
      <>
        <Path d="M50 40 C50 50 47 54 52 58 C58 62 66 56 66 48 C66 44 62 44 62 48" stroke={PAL.lilac[2]} strokeWidth={9.5} strokeLinecap="round" fill="none" />
        <Path d="M50 40 C50 50 47 54 52 58 C58 62 66 56 66 48 C66 44 62 44 62 48" stroke={PAL.lilac[1]} strokeWidth={7} strokeLinecap="round" fill="none" />
        <Path d="M48.5 42 C48.5 50 46.5 53 50 56" stroke={PAL.lilac[0]} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.8} />
        <Path d="M44 51 Q47 54 48.5 52" stroke="#4A2511" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      </>
    }
  />
));

export const ParrotChickArt = charArt((v) => (
  <Chick v={v} body="green" belly="yellow" wing="blue" beak="hook" beakC="red" legC="#475569"
    tail={<Vol v={v} c="red" shape={(f) => <Path fill={f} d="M46 78 L42 97 L50 92 L58 97 L54 78 Z" />} />}
    crest={
      <>
        {[44, 50, 56].map((x, i) => (
          <Vol key={x} v={v} c="red" shape={(f) => <Ellipse fill={f} cx={x} cy={i === 1 ? 14 : 16} rx={3.2} ry={6} transform={`rotate(${(i - 1) * 18} ${x} ${i === 1 ? 14 : 16})`} />} />
        ))}
      </>
    }
  />
));

export const BearCubArt = charArt((v) => (
  <Cub v={v} fur="brown" belly="tan" muzzle="tan" iris="#3B2416" ears="round" earInner="#E9B77C" tail="none" pad="tan" />
));

export const OwletArt = charArt((v) => (
  <Chick v={v} body="brown" belly="cream" wing="tan" iris="#D97706" beak="hook" beakC="gold" legC="#F59E0B"
    crest={
      <>
        <Vol v={v} c="brown" shape={(f) => <Path fill={f} d="M34 24 L30 8 L44 18 Z" />} />
        <Vol v={v} c="brown" shape={(f) => <Path fill={f} d="M66 24 L70 8 L56 18 Z" />} />
      </>
    }
    face={
      <>
        <Ellipse cx={43} cy={34} rx={9} ry={9.5} fill="#FFF3D6" opacity={0.9} />
        <Ellipse cx={57} cy={34} rx={9} ry={9.5} fill="#FFF3D6" opacity={0.9} />
      </>
    }
    top={<Path d="M40 70 Q43 67 46 70 M54 70 Q57 67 60 70 M47 77 Q50 74 53 77" stroke={PAL.tan[3]} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.55} />}
  />
));

export const EagletArt = charArt((v) => (
  <Chick v={v} body="brown" belly="tan" wing="brown" iris="#B45309" beak="hook" beakC="gold" legC="#F59E0B"
    face={<Path d="M31.5 33 Q31 16 50 16 Q69 16 68.5 33 Q66 46 50 47 Q34 46 31.5 33 Z" fill="#FFFFFF" />} />
));

export const VultureChickArt = charArt((v) => (
  <Chick v={v} body="brown" belly="cream" wing="brown" iris="#3B2416" beak="hook" beakC="grey" legC="#57534E"
    face={<Path d="M32 33 Q32 17 50 17 Q68 17 68 33 Q65 45 50 46 Q35 45 32 33 Z" fill="#FBCFE8" />}
    top={<Path d="M30 52 Q40 46 50 50 Q60 46 70 52 Q60 56 50 54 Q40 56 30 52 Z" fill="#FFF7ED" />} />
));

export const KoelArt = charArt((v) => (
  <Chick v={v} body="dark" belly="slate" wing="dark" iris="#DC2626" beak="short" beakC="mint" legC="#475569"
    tail={<Vol v={v} c="dark" shape={(f) => <Path fill={f} d="M44 80 L40 98 L50 94 L60 98 L56 80 Z" />} />} />
));
