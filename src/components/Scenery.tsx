import type { CSSProperties } from 'react';
import type { Mood } from '../game/mood';

const STARS = [
  [8, 12], [16, 26], [23, 8], [31, 19], [38, 6], [46, 23], [54, 11], [61, 28],
  [68, 7], [74, 18], [81, 9], [88, 24], [94, 13], [12, 38], [27, 34], [42, 41],
  [57, 36], [72, 39], [86, 33], [96, 41], [5, 27], [35, 14], [63, 16], [91, 5],
] as const;

const BIRDS = [
  { top: 22, delay: 0, scale: 1 },
  { top: 31, delay: 9, scale: 0.75 },
] as const;

interface TreeProps {
  x: number;
  y: number;
  scale?: number;
  fill: string;
  trunk?: string;
  highlight?: string;
  opacity?: number;
}

/** Árvore de copa arredondada, com o tronco nascendo exatamente no ponto do morro. */
function Broadleaf({ x, y, scale = 1, fill, trunk, highlight, opacity = 1 }: TreeProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="1.5" rx="19" ry="3.2" fill="#000" opacity=".1" />
      <path d="M-2.6 0 L-1.7 -27 L1.7 -27 L2.6 0 Z" fill={trunk} />
      <circle cx="-13" cy="-33" r="14" fill={fill} />
      <circle cx="13" cy="-32" r="15" fill={fill} />
      <circle cx="0" cy="-43" r="18" fill={fill} />
      <circle cx="-6" cy="-29" r="14" fill={fill} />
      {highlight ? (
        <g fill={highlight}>
          <circle cx="-8" cy="-46" r="7.5" opacity=".34" />
          <circle cx="5" cy="-38" r="6" opacity=".24" />
          <circle cx="13" cy="-31" r="4.5" opacity=".16" />
        </g>
      ) : null}
    </g>
  );
}

/** Cipreste alto e fino, bom para preencher as bordas sem esconder o resto. */
function Cypress({ x, y, scale = 1, fill, trunk, highlight, opacity = 1 }: TreeProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="1" rx="10" ry="2.6" fill="#000" opacity=".1" />
      <path d="M-2 0 L-1.3 -19 L1.3 -19 L2 0 Z" fill={trunk} />
      <path
        d="M0 -65 C 7 -52 9 -35 5 -20 C 3 -11 2 -5 0 0 C -2 -5 -3 -11 -5 -20 C -9 -35 -7 -52 0 -65 Z"
        fill={fill}
      />
      <path
        d="M-1.4 -56 C -4 -46 -4 -36 -2.2 -28"
        fill="none"
        stroke={highlight ?? '#ffffff'}
        strokeOpacity={highlight ? 0.34 : 0.08}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Silhueta pequena para a linha de árvores do morro de trás. */
function RidgeTree({ x, y, scale = 1, fill, opacity = 0.55 }: TreeProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={fill} opacity={opacity}>
      <rect x="-1" y="-7" width="2" height="8" opacity=".8" />
      <circle cx="-7" cy="-10" r="8" />
      <circle cx="6" cy="-11" r="8" />
      <circle cx="0" cy="-16" r="9" />
    </g>
  );
}

function Bush({ x, y, scale = 1, fill }: { x: number; y: number; scale?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={fill}>
      <ellipse cx="0" cy="1" rx="17" ry="3" fill="#000" opacity=".08" />
      <circle cx="-10" cy="-6" r="8" />
      <circle cx="8" cy="-7" r="9" />
      <circle cx="0" cy="-12" r="9" />
      <circle cx="-2" cy="-7" r="10" />
    </g>
  );
}

/** Cogumelo pequeno com brilho quente à noite — detalhe de jardim encantado. */
function Mushroom({
  x,
  y,
  scale = 1,
  night,
}: {
  x: number;
  y: number;
  scale?: number;
  night: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {night ? <circle cx="0" cy="-12" r="13" fill="#ffd88f" opacity=".14" /> : null}
      <ellipse cx="0" cy="1" rx="7" ry="2" fill="#000" opacity=".12" />
      <path d="M-2.1 0 L-1.4 -10 L1.4 -10 L2.1 0 Z" fill={night ? '#d8cbb2' : '#f1e4c8'} />
      <path d="M-8 -10 C -8 -18 8 -18 8 -10 C 8 -7 -8 -7 -8 -10 Z" fill={night ? '#b6703f' : '#c96f45'} />
      <circle cx="-3.4" cy="-12.6" r="1.4" fill="#f7ecd2" opacity=".85" />
      <circle cx="2.2" cy="-13.4" r="1.1" fill="#f7ecd2" opacity=".8" />
      <circle cx="4.6" cy="-11" r=".9" fill="#f7ecd2" opacity=".7" />
    </g>
  );
}

/** Florzinha de campina para quebrar a monotonia do gramado. */
function Flower({
  x,
  y,
  scale = 1,
  night,
}: {
  x: number;
  y: number;
  scale?: number;
  night: boolean;
}) {
  const petal = night ? '#d8ccaa' : '#f7e7b8';
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0 L0 -8" stroke={night ? '#3f552c' : '#6d8a3f'} strokeWidth="1.2" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-10.2"
          rx="2.3"
          ry="3.1"
          fill={petal}
          transform={`rotate(${deg} 0 -8)`}
        />
      ))}
      <circle cx="0" cy="-8" r="1.6" fill={night ? '#d9a13f' : '#e7b54d'} />
    </g>
  );
}

function Hills({ mood }: { mood: Mood }) {
  const { colors, night } = mood;
  const trunk = night ? '#3b3128' : '#6b5540';
  const rock = night ? '#2e3834' : '#858b6d';

  return (
    <svg className="hills" viewBox="0 0 800 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {/* morro distante */}
      <path
        d="M0 196 C 96 154 164 182 250 162 C 336 142 402 176 486 156 C 570 136 664 168 800 148 L800 340 L0 340 Z"
        fill={colors.hillFar}
        opacity=".72"
      />

      {/* linha de árvores no alto do morro distante */}
      <RidgeTree x={300} y={159} scale={.9} fill={colors.hillMid} />
      <RidgeTree x={392} y={161} scale={.7} fill={colors.hillMid} opacity={.45} />
      <RidgeTree x={478} y={160} scale={.85} fill={colors.hillMid} />
      <RidgeTree x={572} y={150} scale={.75} fill={colors.hillMid} opacity={.5} />
      <RidgeTree x={660} y={152} scale={.9} fill={colors.hillMid} />
      <RidgeTree x={752} y={152} scale={.65} fill={colors.hillMid} opacity={.45} />

      {/* morro do meio */}
      <path
        d="M0 232 C 90 200 174 216 262 204 C 350 192 428 222 516 208 C 604 194 700 218 800 204 L800 340 L0 340 Z"
        fill={colors.hillMid}
        opacity=".9"
      />

      {/* árvores do morro do meio — bem espaçadas e com a base na encosta */}
      <Broadleaf x={105} y={213} scale={1.1} fill={colors.hillNear} trunk={trunk} highlight={colors.hillFar} />
      <Cypress x={168} y={209} scale={1.12} fill={colors.hillNear} trunk={trunk} highlight={colors.hillFar} />
      <Broadleaf
        x={235}
        y={207}
        scale={.85}
        fill={colors.hillNear}
        trunk={trunk}
        highlight={colors.hillFar}
        opacity={.92}
      />

      {/* casinha assentada na encosta, à direita do canteiro */}
      <g transform="translate(630 206)">
        <ellipse cx="18" cy="15.5" rx="31" ry="4.6" fill="#000" opacity=".14" />
        <circle cx="18" cy="3" r="17" fill="#ffd88f" opacity={night ? 0.14 : 0} />
        <path d="M-2 14 L-2 -8 L18 -22 L38 -8 L38 14 Z" fill={night ? '#7b7061' : '#efe4cc'} opacity=".96" />
        <path d="M-7 -6 L18 -25 L43 -6 Z" fill={night ? '#4a3a3a' : '#a8604f'} />
        <path d="M-7 -6 L18 -25 L18 -21 L-2 -6 Z" fill="#ffffff" opacity=".08" />
        <rect x="8" y="1" width="7" height="7" rx="1" fill={night ? '#ffd88f' : '#c9bda3'} opacity={night ? 0.95 : 0.8} />
        <rect x="24" y="1" width="6" height="7" rx="1" fill={night ? '#ffcf7a' : '#c9bda3'} opacity={night ? 0.85 : 0.7} />
        <rect x="16" y="6" width="5" height="8" rx="1" fill={night ? '#5a4230' : '#7a5a44'} />
        <rect x="30" y="-18" width="5" height="12" fill={night ? '#4a3a3a' : '#8a5a4a'} />
        <g className="smoke">
          <circle cx="33" cy="-22" r="2.6" fill="#ffffff" opacity=".28" />
          <circle cx="36" cy="-28" r="3.4" fill="#ffffff" opacity=".2" />
          <circle cx="40" cy="-35" r="4.2" fill="#ffffff" opacity=".14" />
        </g>
      </g>

      {/* morro da frente */}
      <path
        d="M0 274 C 104 250 196 268 292 256 C 388 244 480 270 578 258 C 676 246 748 264 800 256 L800 340 L0 340 Z"
        fill={colors.hillNear}
      />

      {/* arbustos e pedras só nas bordas, para não competir com o canteiro */}
      <Bush x={72} y={263} scale={1.05} fill={colors.hillNear} />
      <Bush x={118} y={262} scale={.8} fill={colors.hillNear} />
      <Bush x={676} y={254} scale={.75} fill={colors.hillNear} />
      <Bush x={724} y={256} scale={1} fill={colors.hillNear} />
      <Bush x={764} y={258} scale={.75} fill={colors.hillNear} />

      <Mushroom x={94} y={267} scale={1.15} night={night} />
      <Mushroom x={140} y={265} scale={.85} night={night} />
      <Mushroom x={668} y={262} scale={.85} night={night} />
      <Mushroom x={705} y={259} scale={1.05} night={night} />
      <Mushroom x={748} y={261} scale={.8} night={night} />

      <Flower x={84} y={266} scale={.9} night={night} />
      <Flower x={156} y={267} scale={.8} night={night} />
      <Flower x={686} y={261} scale={.75} night={night} />
      <Flower x={716} y={260} scale={.85} night={night} />
      <Flower x={738} y={259} scale={.7} night={night} />

      <ellipse cx="52" cy="281" rx="10" ry="5" fill={rock} opacity=".55" />
      <ellipse cx="748" cy="276" rx="8" ry="4" fill={rock} opacity=".5" />
    </svg>
  );
}

export function Scenery({ mood }: { mood: Mood }) {
  const style = {
    '--sky-top': mood.colors.skyTop,
    '--sky-mid': mood.colors.skyMid,
    '--sky-low': mood.colors.skyLow,
    '--glow': mood.colors.glow,
    '--hill-far': mood.colors.hillFar,
    '--hill-mid': mood.colors.hillMid,
    '--hill-near': mood.colors.hillNear,
    '--sun-x': mood.sun ? `${mood.sun.x}%` : '24%',
    '--sun-y': mood.sun ? `${mood.sun.y}%` : '18%',
    '--light': mood.light,
  } as CSSProperties;

  return (
    <div className={`scenery${mood.night ? ' is-night' : ''}`} style={style} aria-hidden="true">
      <div className="sky" />
      <div className="sky-haze" />

      {mood.sun ? (
        <div className="sun" style={{ left: `${mood.sun.x}%`, top: `${mood.sun.y}%` }} />
      ) : null}
      {mood.moon ? (
        <div className="moon" style={{ left: `${mood.moon.x}%`, top: `${mood.moon.y}%` }}>
          <span className="moon-crater c1" />
          <span className="moon-crater c2" />
          <span className="moon-crater c3" />
        </div>
      ) : null}

      <div className="stars" style={{ opacity: mood.starOpacity }}>
        {STARS.map(([x, y], index) => (
          <span
            key={index}
            className="star"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${(index % 7) * 0.7}s`,
              animationDuration: `${3 + (index % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="clouds">
        <div className="cloud cloud-a" />
        <div className="cloud cloud-b" />
        <div className="cloud cloud-c" />
      </div>

      <div className="birds">
        {BIRDS.map((bird, index) => (
          <svg
            key={index}
            className="bird"
            viewBox="0 0 40 16"
            style={{
              top: `${bird.top}%`,
              animationDelay: `${bird.delay}s`,
              ['--bird-scale' as string]: bird.scale,
            }}
          >
            <path d="M2 10 Q 10 2 20 9 Q 30 2 38 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ))}
      </div>

      <Hills mood={mood} />

      <div className="fireflies" style={{ opacity: mood.night ? 1 : 0 }}>
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className="firefly"
            style={{
              left: `${8 + ((index * 13) % 84)}%`,
              top: `${58 + ((index * 17) % 26)}%`,
              animationDelay: `${index * 0.9}s`,
              animationDuration: `${4 + (index % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="vignette" />
      <div className="grain" />
    </div>
  );
}
