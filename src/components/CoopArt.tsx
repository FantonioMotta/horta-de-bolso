import type { AnimalKind } from '../game/coop';

interface Palette {
  body: string;
  light: string;
  wing: string;
  shade: string;
  comb: string;
  tail: string;
  tailLight: string;
}

const HEN_PALETTES: Palette[] = [
  { body: '#e7cfa4', light: '#f7e7c8', wing: '#c9a56c', shade: '#cdb083', comb: '#d6553f', tail: '#cbb080', tailLight: '#e0c99d' },
  { body: '#cf9360', light: '#eaB783', wing: '#a96b3f', shade: '#b47a4c', comb: '#c94c3a', tail: '#a96b3f', tailLight: '#cf9360' },
  { body: '#efe9dd', light: '#fffaf1', wing: '#cfc5b3', shade: '#d8cfbc', comb: '#d6553f', tail: '#d8cfbc', tailLight: '#efe9dd' },
  { body: '#9b8d7b', light: '#c0b3a2', wing: '#7c6e5e', shade: '#887a69', comb: '#c24b37', tail: '#7c6e5e', tailLight: '#a99b88' },
  { body: '#d9b98a', light: '#f1d7ae', wing: '#b08a58', shade: '#c3a373', comb: '#d6553f', tail: '#b08a58', tailLight: '#d9b98a' },
];

const ROOSTER_PALETTES: Palette[] = [
  { body: '#c46b3f', light: '#e08a56', wing: '#a14f2e', shade: '#a14f2e', comb: '#cf3f2e', tail: '#2f5b56', tailLight: '#477a6d' },
  { body: '#b98a4e', light: '#d9ac6e', wing: '#8f6634', shade: '#8f6634', comb: '#c93e2c', tail: '#3a4f6b', tailLight: '#57708f' },
  { body: '#d08b63', light: '#e9ad84', wing: '#a96642', shade: '#a96642', comb: '#d4442f', tail: '#4a3f63', tailLight: '#6b5c86' },
];

function Comb({ color, rooster }: { color: string; rooster: boolean }) {
  if (rooster) {
    return (
      <g fill={color}>
        <path d="M38 16c-1-6 2-9 5-8 2-4 6-4 8-1 3-2 6 0 6 4l-2 3Z" />
      </g>
    );
  }
  return (
    <g fill={color}>
      <path d="M39 18c0-5 3-7 5-5 1-3 4-3 5-1 2-2 4 0 3 4l-1 2Z" />
    </g>
  );
}

function Hen({ palette }: { palette: Palette }) {
  return (
    <g>
      <ellipse cx="31" cy="59" rx="15" ry="2.6" fill="#2f3a25" opacity=".16" />
      <path d="M25 49 23 58M36 49l2 9" stroke="#d99a3f" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M23 58h-4M38 58h4" stroke="#d99a3f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 37C12 35 6 39 4 46c7 2 13 1 17-4Z" fill={palette.shade} />
      <ellipse cx="30" cy="40" rx="16" ry="13" fill={palette.body} />
      <ellipse cx="38" cy="42" rx="8.5" ry="9.5" fill={palette.light} opacity=".7" />
      <path d="M24 35c-5 2-7 7-6 12 6 1 11-2 13-7Z" fill={palette.wing} />
      <path d="M22 39c3 0 6 2 7 5" stroke={palette.shade} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".65" />
      <circle cx="44" cy="25" r="9" fill={palette.body} />
      <path d="M39 19c-2-3 0-6 3-5 1-3 4-3 5-1 2-2 4 0 3 4" fill={palette.comb} />
      <path d="M52 26 60 29 52 32Z" fill="#e9a13b" />
      <path d="M50 32c0 3 2 5 4 4l-1-4Z" fill={palette.comb} />
      <circle cx="47" cy="24" r="1.7" fill="#35271d" />
      <circle cx="47.4" cy="23.4" r=".6" fill="#fff" opacity=".8" />
    </g>
  );
}

function Rooster({ palette }: { palette: Palette }) {
  return (
    <g>
      <ellipse cx="31" cy="59" rx="15" ry="2.6" fill="#2f3a25" opacity=".16" />
      <path d="M25 48 23 58M36 48l2 10" stroke="#d99a3f" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M23 58h-4M38 58h4" stroke="#d99a3f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 37C10 36 3 27 2 16c8 1 14 7 16 14Z" fill={palette.tail} />
      <path d="M20 37C13 32 8 24 9 14c7 4 11 11 12 19Z" fill={palette.tailLight} />
      <path d="M21 39C14 37 8 31 6 23c7 1 13 6 16 13Z" fill={palette.tail} opacity=".8" />
      <ellipse cx="30" cy="40" rx="16" ry="13" fill={palette.body} />
      <ellipse cx="38" cy="42" rx="8" ry="9" fill={palette.light} opacity=".6" />
      <path d="M24 35c-5 2-7 7-6 12 6 1 11-2 13-7Z" fill={palette.wing} />
      <path d="M22 39c3 0 6 2 7 5" stroke={palette.shade} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".7" />
      <circle cx="45" cy="24" r="9" fill={palette.body} />
      <Comb color={palette.comb} rooster />
      <path d="M53 25 61 28 53 31Z" fill="#e9a13b" />
      <path d="M51 31c0 4 3 6 5 4l-1-4Z" fill={palette.comb} />
      <circle cx="48" cy="23" r="1.8" fill="#35271d" />
      <circle cx="48.5" cy="22.4" r=".6" fill="#fff" opacity=".8" />
    </g>
  );
}

export function ChickenArt({
  kind,
  variant = 0,
  className = 'chicken-art',
  flip = false,
}: {
  kind: AnimalKind;
  variant?: number;
  className?: string;
  flip?: boolean;
}) {
  const palette =
    kind === 'rooster'
      ? ROOSTER_PALETTES[Math.abs(variant) % ROOSTER_PALETTES.length]
      : HEN_PALETTES[Math.abs(variant) % HEN_PALETTES.length];

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      {kind === 'rooster' ? <Rooster palette={palette} /> : <Hen palette={palette} />}
    </svg>
  );
}

export function ChickArt({ className = 'chick-art' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="36.5" rx="10" ry="2" fill="#2f3a25" opacity=".15" />
      <path d="M16 30 15 36M24 30l1 6" stroke="#d99a3f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 36h-3M25 36h3" stroke="#d99a3f" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="19" cy="25" r="10.5" fill="#f6d25a" />
      <circle cx="26" cy="15.5" r="8" fill="#f8da6f" />
      <path d="M22 8c0-2 1-3 2-2 0-2 2-2 2 0 1-1 2 0 1 2" fill="#f0c044" />
      <ellipse cx="14" cy="25" rx="4.6" ry="3.6" fill="#eabf45" />
      <path d="M33 14.5 39 16.5 33 19Z" fill="#e9a13b" />
      <circle cx="28.5" cy="14" r="1.6" fill="#35271d" />
      <circle cx="29" cy="13.4" r=".55" fill="#fff" opacity=".8" />
      <path d="M8 24c2-2 5-2 7-1" stroke="#e0b13c" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".65" />
    </svg>
  );
}

export function EggArt({ className = 'egg-art' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 40" aria-hidden="true">
      <path
        d="M16 3C10.4 3 4.5 14.4 4.5 24a11.5 11.5 0 0 0 23 0C27.5 14.4 21.6 3 16 3Z"
        fill="#fdf8e9"
        stroke="#e3d5b4"
        strokeWidth="1.4"
      />
      <ellipse cx="11.5" cy="16" rx="2.8" ry="5" fill="#fff" opacity=".8" transform="rotate(-18 11.5 16)" />
      <circle cx="20" cy="26" r="1.1" fill="#e8dcbf" opacity=".7" />
      <circle cx="15" cy="31" r=".8" fill="#e8dcbf" opacity=".7" />
    </svg>
  );
}

export function CoopHouseArt({ className = 'coop-house-art' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 130 118" aria-hidden="true">
      <ellipse cx="66" cy="110" rx="52" ry="6" fill="#2f3a25" opacity=".16" />
      <rect x="22" y="48" width="86" height="60" rx="6" fill="#b9744a" />
      <path d="M22 54h86v8H22Z" fill="#a3623d" opacity=".6" />
      <path d="M30 62h70M30 74h70M30 86h70" stroke="#8f5434" strokeWidth="1.6" opacity=".55" />
      <path d="M12 52 65 14l53 38Z" fill="#a94f3f" />
      <path d="M12 52 65 14l53 38" fill="none" stroke="#8f3f33" strokeWidth="3" strokeLinejoin="round" />
      <path d="M65 17v35" stroke="#8f3f33" strokeWidth="1.4" opacity=".45" />
      <rect x="53" y="76" width="24" height="32" rx="11" fill="#5c3a26" />
      <circle cx="71" cy="94" r="1.8" fill="#e7c27e" />
      <rect x="33" y="66" width="14" height="13" rx="2.5" fill="#f5e6b7" stroke="#7d4c2f" strokeWidth="2" />
      <path d="M40 66v13M33 72.5h14" stroke="#7d4c2f" strokeWidth="1.4" />
      <rect x="84" y="66" width="14" height="13" rx="2.5" fill="#f5e6b7" stroke="#7d4c2f" strokeWidth="2" />
      <path d="M91 66v13M84 72.5h14" stroke="#7d4c2f" strokeWidth="1.4" />
      <path d="M46 108 56 96h18l10 12Z" fill="#c9a06d" />
      <path d="M46 108 56 96M88 108 78 96" stroke="#a97f4d" strokeWidth="1.6" />
      <circle cx="65" cy="46" r="6.5" fill="#f3e3b3" stroke="#8f3f33" strokeWidth="1.8" />
      <path d="M65 42v8M61 46h8" stroke="#8f3f33" strokeWidth="1.3" />
    </svg>
  );
}
