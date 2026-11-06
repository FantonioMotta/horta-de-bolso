export type AnimalKind = 'chicken' | 'rooster';
export type ScreenId = 'garden' | 'coop';

export interface CoopChick {
  id: number;
  kind: AnimalKind;
  /** timestamp em que o pintinho vira adulto */
  readyAt: number;
}

export interface CoopStats {
  eggsLaid: number;
  eggsSold: number;
  chicksHatched: number;
  animalsBought: number;
  animalsSold: number;
  earned: number;
  spent: number;
}

export interface CoopState {
  /** índice em COOP_TIERS */
  tier: number;
  chickens: number;
  roosters: number;
  chicks: CoopChick[];
  eggs: number;
  /** segundos acumulados de postura (somados por galinha) */
  layProgress: number;
  seq: number;
  stats: CoopStats;
}

export interface CoopTier {
  /** moradores adultos (galinhas + galos) */
  animals: number;
  /** ovos que cabem no ninho */
  eggs: number;
  cost: number;
}

/** O galinheiro cresce junto com a horta: mais moradores e mais ninhos. */
export const COOP_TIERS: readonly CoopTier[] = [
  { animals: 4, eggs: 6, cost: 0 },
  { animals: 6, eggs: 10, cost: 220 },
  { animals: 9, eggs: 16, cost: 780 },
  { animals: 14, eggs: 24, cost: 2200 },
];

export interface AnimalInfo {
  kind: AnimalKind;
  name: string;
  plural: string;
  price: number;
  sellPrice: number;
  description: string;
}

export const ANIMALS: Record<AnimalKind, AnimalInfo> = {
  chicken: {
    kind: 'chicken',
    name: 'Galinha',
    plural: 'galinhas',
    price: 55,
    sellPrice: 70,
    description: 'Põe um ovo a cada 2 min e meio. É o coração do galinheiro.',
  },
  rooster: {
    kind: 'rooster',
    name: 'Galo',
    plural: 'galos',
    price: 85,
    sellPrice: 110,
    description: 'Necessário para chocar ovos e trazer pintinhos ao mundo.',
  },
};

/** Por quanto sai cada ovo. */
export const EGG_PRICE = 15;
/** Ovos consumidos para chocar um pintinho. */
export const HATCH_EGG_COST = 3;
/** Preço de um pintinho vendido ainda pequeno. */
export const CHICK_PRICE = 40;
/** Segundos que uma galinha leva para pôr um ovo. */
export const LAY_SECONDS = 150;
/** Segundos para um pintinho virar adulto. */
export const CHICK_SECONDS = 240;
/** Limite de pintinhos crescendo ao mesmo tempo. */
export const MAX_CHICKS = 6;

export function createInitialCoop(): CoopState {
  return {
    tier: 0,
    chickens: 0,
    roosters: 0,
    chicks: [],
    eggs: 0,
    layProgress: 0,
    seq: 1,
    stats: {
      eggsLaid: 0,
      eggsSold: 0,
      chicksHatched: 0,
      animalsBought: 0,
      animalsSold: 0,
      earned: 0,
      spent: 0,
    },
  };
}

export function coopTier(coop: CoopState): CoopTier {
  return COOP_TIERS[Math.min(coop.tier, COOP_TIERS.length - 1)];
}

export function nextCoopTier(coop: CoopState): CoopTier | null {
  return COOP_TIERS[coop.tier + 1] ?? null;
}

export function coopAnimalTotal(coop: CoopState): number {
  return coop.chickens + coop.roosters;
}

export function coopEggValue(quantity: number): number {
  return quantity * EGG_PRICE;
}

export function coopProduction(coop: CoopState): number {
  // ovos por minuto, arredondado para baixo para não prometer demais
  if (coop.chickens <= 0) return 0;
  return Math.floor((coop.chickens * 60) / LAY_SECONDS);
}

export function chickSecondsLeft(chick: CoopChick, now = Date.now()): number {
  return Math.max(0, (chick.readyAt - now) / 1000);
}

export interface CoopAdvance {
  coop: CoopState;
  /** ovos que nasceram neste intervalo */
  laid: number;
  /** pintinhos que cresceram neste intervalo */
  matured: CoopChick[];
}

/**
 * Avança o galinheiro de forma linear: galinhas põem ovos mesmo com a tela
 * fechada e pintinhos crescem até virar adultos.
 */
export function advanceCoop(coop: CoopState, dtSeconds: number, now: number): CoopAdvance {
  let next = coop;
  let laid = 0;

  if (coop.chickens > 0 && dtSeconds > 0) {
    const capacity = coopTier(coop).eggs;
    let progress = coop.layProgress + dtSeconds * coop.chickens;
    let eggs = coop.eggs;

    while (progress >= LAY_SECONDS && eggs < capacity) {
      progress -= LAY_SECONDS;
      eggs += 1;
    }
    // Ninho cheio: guarda no máximo um ovo de crédito para o próximo recolhimento.
    if (eggs >= capacity) progress = Math.min(progress, LAY_SECONDS);

    laid = eggs - coop.eggs;
    if (laid > 0 || progress !== coop.layProgress) {
      next = {
        ...next,
        eggs,
        layProgress: progress,
        stats:
          laid > 0
            ? { ...next.stats, eggsLaid: next.stats.eggsLaid + laid }
            : next.stats,
      };
    }
  } else if (coop.layProgress !== 0) {
    next = { ...next, layProgress: 0 };
  }

  const matured = coop.chicks.filter((chick) => chick.readyAt <= now);
  if (matured.length > 0) {
    let chickens = next.chickens;
    let roosters = next.roosters;
    for (const chick of matured) {
      if (chick.kind === 'rooster') roosters += 1;
      else chickens += 1;
    }
    next = {
      ...next,
      chickens,
      roosters,
      chicks: next.chicks.filter((chick) => chick.readyAt > now),
    };
  }

  return { coop: next, laid, matured };
}
