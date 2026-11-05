import { SPECIES, growthStage, type SpeciesId } from '../game/data';

interface PlantProps {
  species: SpeciesId;
  growth: number;
  moisture: number;
  ready: boolean;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.2);

interface ArtProps {
  g: number;
  leaf: string;
  leafDark: string;
  leafLight: string;
  fruit: string;
  fruitLight: string;
  accent: string;
}

/** Folha pontuda, desenhada para cima a partir da origem. */
function Leaf({
  x,
  y,
  len,
  width = 0.42,
  rotate = 0,
  color,
  vein,
  opacity = 1,
}: {
  x: number;
  y: number;
  len: number;
  width?: number;
  rotate?: number;
  color: string;
  vein?: string;
  opacity?: number;
}) {
  const w = len * width;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={opacity}>
      <path
        d={`M0 0 C ${-w} ${-len * 0.3} ${-w * 0.8} ${-len * 0.82} 0 ${-len} C ${w * 0.8} ${
          -len * 0.82
        } ${w} ${-len * 0.3} 0 0 Z`}
        fill={color}
      />
      {vein ? (
        <path
          d={`M0 -2 L0 ${-len * 0.9}`}
          stroke={vein}
          strokeWidth={Math.max(0.5, len * 0.02)}
          opacity=".35"
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
}

function SoilMound({ g, color }: { g: number; color: string }) {
  return (
    <ellipse cx="60" cy="114" rx={lerp(7, 13, g)} ry={lerp(2, 4, g)} fill={color} opacity=".85" />
  );
}

function Alface({ g, leaf, leafDark, leafLight }: ArtProps) {
  const size = lerp(5, 34, easeOut(g));
  const outer = Array.from({ length: 9 }, (_, i) => {
    const angle = -62 + (124 / 8) * i;
    const len = size * (0.82 + 0.18 * Math.cos((angle / 62) * 1.2));
    return (
      <Leaf
        key={`o${i}`}
        x={60 + Math.sin((angle * Math.PI) / 180) * size * 0.22}
        y={112}
        len={len}
        width={0.5}
        rotate={angle}
        color={i % 2 ? leaf : leafDark}
      />
    );
  });
  const inner = Array.from({ length: 6 }, (_, i) => {
    const angle = -40 + (80 / 5) * i;
    return (
      <Leaf
        key={`i${i}`}
        x={60}
        y={110}
        len={size * 0.62}
        width={0.55}
        rotate={angle}
        color={leafLight}
      />
    );
  });
  return (
    <g>
      {outer}
      {inner}
    </g>
  );
}

function Cenoura({ g, leaf, leafDark, leafLight, fruit, fruitLight }: ArtProps) {
  const size = lerp(4, 42, easeOut(g));
  const fronds = Array.from({ length: 7 }, (_, i) => {
    const spread = -46 + (92 / 6) * i;
    const len = size * (0.72 + 0.28 * (1 - Math.abs(spread) / 60));
    const lean = spread * 0.55;
    const tipX = lean;
    const tipY = -len;
    const leaflets = Array.from({ length: 5 }, (_, j) => {
      const t = 0.28 + j * 0.16;
      const lx = tipX * t;
      const ly = tipY * t;
      const s = 3 + 4 * (1 - t) * (len / 42);
      return (
        <g key={j}>
          <ellipse
            cx={lx - s * 0.7}
            cy={ly}
            rx={s * 1.25}
            ry={s * 0.5}
            fill={j % 2 ? leaf : leafDark}
            transform={`rotate(${-28 + lean * 0.3} ${lx - s} ${ly})`}
          />
          <ellipse
            cx={lx + s * 0.7}
            cy={ly}
            rx={s * 1.25}
            ry={s * 0.5}
            fill={j % 2 ? leafDark : leaf}
            transform={`rotate(${28 + lean * 0.3} ${lx + s} ${ly})`}
          />
        </g>
      );
    });
    return (
      <g key={i}>
        <path
          d={`M0 0 Q ${lean * 0.35} ${tipY * 0.55} ${tipX} ${tipY}`}
          stroke={i % 2 ? leafDark : leaf}
          strokeWidth={Math.max(1.2, len * 0.045)}
          fill="none"
          strokeLinecap="round"
        />
        {leaflets}
      </g>
    );
  });

  const showRoot = g > 0.72;
  return (
    <g transform="translate(60 112)">
      {fronds}
      {showRoot ? (
        <g opacity={clamp01((g - 0.72) / 0.2)}>
          <ellipse cx={2} cy={-1} rx={10} ry={7} fill={fruit} />
          <ellipse cx={0} cy={-3} rx={4} ry={2.6} fill={fruitLight} opacity=".8" />
        </g>
      ) : null}
      <circle cx="0" cy="-2" r={lerp(2.5, 5.5, g)} fill={leafLight} opacity={g > 0.72 ? 0.9 : 0} />
    </g>
  );
}

function Morango({ g, leaf, leafDark, leafLight, fruit, fruitLight, accent }: ArtProps) {
  const size = lerp(4, 26, easeOut(g));
  const leaves = Array.from({ length: 7 }, (_, i) => {
    const angle = -78 + (156 / 6) * i;
    return (
      <Leaf
        key={i}
        x={60}
        y={112}
        len={size * (0.76 + 0.24 * Math.cos((angle / 78) * 1.1))}
        width={0.62}
        rotate={angle}
        color={i % 2 ? leaf : leafDark}
        vein={leafDark}
      />
    );
  });

  const blooming = g > 0.4 && g < 0.82;
  const bloomOpacity = blooming ? Math.min(1, (g - 0.4) / 0.12) * Math.min(1, (0.82 - g) / 0.12) : 0;
  const flowers = [
    { x: -12, y: -18 },
    { x: 10, y: -24 },
    { x: 20, y: -10 },
  ];
  const berries = [
    { x: -14, y: -10, s: 1 },
    { x: 12, y: -14, s: 0.86 },
    { x: 22, y: -3, s: 0.72 },
  ];
  const fruitT = clamp01((g - 0.68) / 0.24);

  return (
    <g transform="translate(60 112)">
      {leaves}
      {flowers.map((f, i) => (
        <g key={`f${i}`} transform={`translate(${f.x} ${f.y})`} opacity={bloomOpacity * (0.6 + 0.4 * fruitT)}>
          {Array.from({ length: 5 }, (_, p) => (
            <ellipse
              key={p}
              cx="0"
              cy="-3.6"
              rx="2.4"
              ry="4"
              fill={accent}
              transform={`rotate(${p * 72})`}
            />
          ))}
          <circle r="1.8" fill={fruitLight} />
        </g>
      ))}
      {fruitT > 0.05
        ? berries.map((b, i) => (
            <g
              key={`b${i}`}
              transform={`translate(${b.x} ${b.y}) scale(${b.s * (0.5 + 0.5 * fruitT)})`}
              opacity={fruitT}
            >
              <path
                d="M0 0 C -7 -2 -10 4 -5.5 8.5 C -2.5 11.5 0 13 0 13 C 0 13 2.5 11.5 5.5 8.5 C 10 4 7 -2 0 0 Z"
                fill={fruit}
              />
              <path
                d="M-3 2 C -5 4 -4.5 6 -3 7"
                stroke={fruitLight}
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity=".75"
                fill="none"
              />
              {[0, 1, 2].map((s) => (
                <circle
                  key={s}
                  cx={-2 + s * 2.4}
                  cy={5 + (s % 2) * 2.6}
                  r="0.7"
                  fill={fruitLight}
                  opacity=".85"
                />
              ))}
            </g>
          ))
        : null}
    </g>
  );
}

function Tomate({ g, leaf, leafDark, leafLight, fruit, fruitLight }: ArtProps) {
  const height = lerp(10, 72, easeOut(g));
  const stemTop = -height;
  const width = lerp(2, 4, g);

  const pairs = [0.32, 0.55, 0.78];
  const leaves = pairs.flatMap((t, i) => {
    const y = stemTop * t + 112;
    const size = lerp(5, 17, g) * (1 - t * 0.25);
    const flip = i % 2 === 0 ? 1 : -1;
    return [-1, 1].map((side) => (
      <g key={`${i}-${side}`} transform={`translate(60 ${y}) scale(${side !== flip ? 1 : -1} 1)`}>
        <Leaf x={0} y={0} len={size} width={0.5} rotate={side === -1 ? -18 : 18} color={side === -1 ? leafDark : leaf} vein={leafDark} />
        <Leaf x={0} y={2} len={size * 0.66} width={0.5} rotate={side === -1 ? -52 : 52} color={leaf} />
      </g>
    ));
  });

  const fruitT = clamp01((g - 0.58) / 0.32);
  const clusters = [
    { y: -height * 0.42, x: 10 },
    { y: -height * 0.66, x: -11 },
  ];

  return (
    <g transform="translate(0 0)">
      <path
        d={`M60 112 C ${58 - 2} ${112 - height * 0.5} ${61} ${112 - height * 0.85} 60 ${112 + stemTop}`}
        stroke={leafDark}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
      />
      {leaves}
      {fruitT > 0.04
        ? clusters.map((c, ci) => (
            <g key={ci} opacity={fruitT} transform={`translate(0 ${(1 - fruitT) * 8})`}>
              {[-7, 1, 8].map((dx, di) => (
                <g key={di} transform={`translate(${60 + c.x + dx} ${112 + c.y + di * 4})`}>
                  <circle r={4.4 * (0.6 + 0.4 * fruitT) + (di === 1 ? 0.9 : 0)} fill={fruit} />
                  <ellipse cx={-1.3} cy={-1.4} rx="1.3" ry="1" fill={fruitLight} opacity=".8" />
                </g>
              ))}
            </g>
          ))
        : null}
    </g>
  );
}

function Abobora({ g, leaf, leafDark, leafLight, fruit, fruitLight, accent }: ArtProps) {
  const size = lerp(6, 30, easeOut(g));
  const fruitT = clamp01((g - 0.55) / 0.4);
  const leaves = [
    { x: 60, y: 112, len: size * 1.05, rot: -30 },
    { x: 60, y: 112, len: size * 0.85, rot: -86 },
    { x: 60, y: 112, len: size * 0.75, rot: 22 },
    { x: 60, y: 112, len: size * 0.62, rot: 62 },
  ];

  return (
    <g>
      <path
        d="M60 112 C 82 108 92 96 96 82"
        stroke={leafDark}
        strokeWidth={2.4}
        fill="none"
        opacity={g * 0.9}
        strokeLinecap="round"
      />
      <path
        d="M96 82 c 8 -2 10 5 2 8"
        stroke={leafDark}
        strokeWidth={1.8}
        fill="none"
        opacity={g * 0.9}
        strokeLinecap="round"
      />
      {leaves.map((l, i) => (
        <g key={i}>
          <Leaf
            x={l.x}
            y={l.y}
            len={l.len}
            width={0.72}
            rotate={l.rot}
            color={i % 2 ? leaf : leafDark}
            vein={leafLight}
          />
        </g>
      ))}
      {fruitT > 0.04 ? (
        <g transform={`translate(72 ${110 - 6 * fruitT}) scale(${0.55 + 0.45 * fruitT})`} opacity={fruitT}>
          <ellipse cx="0" cy="0" rx="17" ry="12.5" fill={fruit} />
          <ellipse cx="0" cy="0" rx="17" ry="12.5" fill="none" stroke={accent} strokeWidth="1" opacity=".5" />
          <path d="M-7 -11 C -9 -4 -9 4 -7 11" stroke={accent} strokeWidth="1.2" fill="none" opacity=".55" />
          <path d="M0 -12.5 L0 12.5" stroke={accent} strokeWidth="1.2" fill="none" opacity=".5" />
          <path d="M7 -11 C 9 -4 9 4 7 11" stroke={accent} strokeWidth="1.2" fill="none" opacity=".55" />
          <ellipse cx="-6" cy="-5" rx="4.5" ry="2.6" fill={fruitLight} opacity=".55" />
          <path d="M0 -12 q -1 -6 -5 -8" stroke={leafDark} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
}

function Girassol({ g, leaf, leafDark, leafLight, fruit, fruitLight, accent }: ArtProps) {
  const height = lerp(12, 78, easeOut(g));
  const headY = 112 - height;
  const headR = lerp(3, 10, easeOut(g));
  const petal = lerp(2, 12, clamp01((g - 0.45) / 0.35));
  const bloom = clamp01((g - 0.62) / 0.28);

  return (
    <g>
      <path
        d={`M60 112 C ${57} ${112 - height * 0.5} ${64} ${112 - height * 0.8} 60 ${headY}`}
        stroke={leafDark}
        strokeWidth={lerp(2, 4, g)}
        fill="none"
        strokeLinecap="round"
      />
      <Leaf x={59} y={112 - height * 0.38} len={lerp(6, 22, g)} width={0.62} rotate={-58} color={leaf} vein={leafLight} />
      <Leaf x={61} y={112 - height * 0.58} len={lerp(5, 18, g)} width={0.62} rotate={54} color={leafDark} vein={leafLight} />

      <g transform={`translate(60 ${headY})`}>
        {Array.from({ length: 15 }, (_, i) => {
          const angle = (360 / 15) * i;
          return (
            <ellipse
              key={i}
              cx="0"
              cy={-headR - petal * 0.42}
              rx={petal * 0.3}
              ry={petal * 0.62}
              fill={bloom > 0.25 ? fruit : leafDark}
              opacity={0.5 + 0.5 * bloom}
              transform={`rotate(${angle})`}
            />
          );
        })}
        <circle r={headR} fill={bloom > 0.25 ? accent : leaf} />
        <circle r={headR * 0.7} fill={bloom > 0.25 ? '#6d4a26' : leafDark} />
        {bloom > 0.3
          ? Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={Math.cos(a) * headR * 0.45}
                  cy={Math.sin(a) * headR * 0.45}
                  r={0.8}
                  fill={fruitLight}
                  opacity=".8"
                />
              );
            })
          : null}
        <ellipse cx={-headR * 0.3} cy={-headR * 0.3} rx={headR * 0.34} ry={headR * 0.22} fill={fruitLight} opacity=".3" />
      </g>
    </g>
  );
}

export function Plant({ species, growth, moisture, ready }: PlantProps) {
  const sp = SPECIES[species];
  const g = clamp01(growth);
  const stage = growthStage(g);
  const dry = moisture <= 0.02 && g < 1;
  const art: ArtProps = {
    g,
    ...sp.palette,
  };

  const body =
    species === 'alface' ? (
      <Alface {...art} />
    ) : species === 'cenoura' ? (
      <Cenoura {...art} />
    ) : species === 'morango' ? (
      <Morango {...art} />
    ) : species === 'tomate' ? (
      <Tomate {...art} />
    ) : species === 'abobora' ? (
      <Abobora {...art} />
    ) : (
      <Girassol {...art} />
    );

  const sway = 5.5 + ((species.length * 7 + (species.charCodeAt(0) % 5)) % 4);

  return (
    <svg
      viewBox="0 0 120 130"
      className={`plant plant-${stage}${dry ? ' is-dry' : ''}${ready ? ' is-ready' : ''}`}
      aria-hidden="true"
    >
      {ready ? <circle className="halo" cx="60" cy="76" r="42" fill="#ffe6a2" /> : null}
      <ellipse className="plant-shadow" cx="60" cy="114" rx={lerp(6, 22, easeOut(g))} ry="3.6" />
      <SoilMound g={g} color="#5a3f2b" />
      <g
        className="sway"
        style={{ animationDuration: `${sway}s`, animationDelay: `${-((g * 13) % 5)}s` }}
      >
        {body}
      </g>
    </svg>
  );
}
