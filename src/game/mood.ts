export interface MoodColors {
  skyTop: string;
  skyMid: string;
  skyLow: string;
  glow: string;
  hillFar: string;
  hillMid: string;
  hillNear: string;
}

export interface Mood {
  label: string;
  colors: MoodColors;
  light: number;
  night: boolean;
  starOpacity: number;
  sun: { x: number; y: number } | null;
  moon: { x: number; y: number } | null;
}

interface Stop extends MoodColors {
  h: number;
  light: number;
  label: string;
}

const STOPS: Stop[] = [
  {
    h: 0,
    label: 'Noite',
    skyTop: '#0b1426',
    skyMid: '#17243f',
    skyLow: '#2a384f',
    glow: '#41506c',
    hillFar: '#2b3947',
    hillMid: '#223331',
    hillNear: '#1a2a24',
    light: 0.07,
  },
  {
    h: 4.9,
    label: 'Madrugada',
    skyTop: '#1b2b48',
    skyMid: '#505a75',
    skyLow: '#b3867c',
    glow: '#e6ac8e',
    hillFar: '#434c55',
    hillMid: '#36443c',
    hillNear: '#293629',
    light: 0.2,
  },
  {
    h: 6.6,
    label: 'Amanhecer',
    skyTop: '#6489ab',
    skyMid: '#cfa99e',
    skyLow: '#f8d6a8',
    glow: '#ffcf96',
    hillFar: '#8f9f74',
    hillMid: '#6d8248',
    hillNear: '#51652f',
    light: 0.6,
  },
  {
    h: 8.5,
    label: 'Manhã',
    skyTop: '#7fb6d0',
    skyMid: '#c0dccf',
    skyLow: '#f1edcf',
    glow: '#ffeebd',
    hillFar: '#a6bb80',
    hillMid: '#7d9a4e',
    hillNear: '#5c7834',
    light: 0.9,
  },
  {
    h: 12,
    label: 'Meio-dia',
    skyTop: '#74b1cf',
    skyMid: '#b3d6d8',
    skyLow: '#f4eac6',
    glow: '#ffeec6',
    hillFar: '#a9bb7a',
    hillMid: '#82994b',
    hillNear: '#607a33',
    light: 1,
  },
  {
    h: 16,
    label: 'Tarde',
    skyTop: '#83b3c8',
    skyMid: '#cedecc',
    skyLow: '#f7e8bd',
    glow: '#ffdda6',
    hillFar: '#b0bb82',
    hillMid: '#86984f',
    hillNear: '#627837',
    light: 0.92,
  },
  {
    h: 18.2,
    label: 'Fim de tarde',
    skyTop: '#6f7f9f',
    skyMid: '#d8a889',
    skyLow: '#f8d3a4',
    glow: '#ffca86',
    hillFar: '#9d9c6c',
    hillMid: '#7c7e45',
    hillNear: '#5c6133',
    light: 0.66,
  },
  {
    h: 19.7,
    label: 'Crepúsculo',
    skyTop: '#3d4572',
    skyMid: '#986b84',
    skyLow: '#e2a17f',
    glow: '#f2a97e',
    hillFar: '#6c6a55',
    hillMid: '#56553c',
    hillNear: '#40422a',
    light: 0.35,
  },
  {
    h: 21.2,
    label: 'Noite',
    skyTop: '#121c34',
    skyMid: '#2b3550',
    skyLow: '#4f4e5e',
    glow: '#5c6078',
    hillFar: '#2c3a4b',
    hillMid: '#243530',
    hillNear: '#1c2b24',
    light: 0.13,
  },
  {
    h: 24,
    label: 'Noite',
    skyTop: '#0b1426',
    skyMid: '#17243f',
    skyLow: '#2a384f',
    glow: '#41506c',
    hillFar: '#2b3947',
    hillMid: '#223331',
    hillNear: '#1a2a24',
    light: 0.07,
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const blue = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${blue
    .toString(16)
    .padStart(2, '0')}`;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export function getMood(date = new Date()): Mood {
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

  let index = 0;
  for (let i = 0; i < STOPS.length - 1; i += 1) {
    if (hour >= STOPS[i].h && hour <= STOPS[i + 1].h) {
      index = i;
      break;
    }
  }

  const a = STOPS[index];
  const b = STOPS[index + 1] ?? STOPS[STOPS.length - 1];
  const span = Math.max(0.0001, b.h - a.h);
  const t = smooth(Math.min(1, Math.max(0, (hour - a.h) / span)));

  const colors: MoodColors = {
    skyTop: mix(a.skyTop, b.skyTop, t),
    skyMid: mix(a.skyMid, b.skyMid, t),
    skyLow: mix(a.skyLow, b.skyLow, t),
    glow: mix(a.glow, b.glow, t),
    hillFar: mix(a.hillFar, b.hillFar, t),
    hillMid: mix(a.hillMid, b.hillMid, t),
    hillNear: mix(a.hillNear, b.hillNear, t),
  };

  const light = a.light + (b.light - a.light) * t;
  const night = light < 0.32;
  const starOpacity = Math.min(1, Math.max(0, (0.5 - light) / 0.42));

  // Sol: nasce às 6h, se põe às 19h30.
  const sunrise = 6;
  const sunset = 19.5;
  let sun: Mood['sun'] = null;
  if (hour > sunrise && hour < sunset) {
    const p = (hour - sunrise) / (sunset - sunrise);
    sun = { x: 8 + 84 * p, y: 62 - 46 * Math.sin(Math.PI * p) };
  }

  // Lua: aparece depois das 19h30 e some às 6h.
  let moon: Mood['moon'] = null;
  if (hour >= sunset || hour <= sunrise) {
    const p =
      hour >= sunset ? (hour - sunset) / (24 - sunset + sunrise) : (24 - sunset + hour) / (24 - sunset + sunrise);
    moon = { x: 82 - 64 * p, y: 30 - 12 * Math.sin(Math.PI * p) };
  }

  return {
    label: light < 0.2 ? 'Noite' : t > 0.55 ? b.label : a.label,
    colors,
    light,
    night,
    starOpacity,
    sun,
    moon,
  };
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

/** Contagem regressiva curta, no formato m:ss. */
export function formatCountdown(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
