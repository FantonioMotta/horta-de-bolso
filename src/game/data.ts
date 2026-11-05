export type SpeciesId = 'alface' | 'cenoura' | 'morango' | 'tomate' | 'abobora' | 'girassol';

export interface Species {
  id: SpeciesId;
  name: string;
  /** custo de uma semente */
  seedCost: number;
  /** custo para liberar a espécie (0 = já liberada) */
  unlockCost: number;
  /** quanto rende ao colher */
  sellPrice: number;
  /** segundos de crescimento com a terra molhada */
  growSeconds: number;
  /** segundos para a terra secar completamente */
  drySeconds: number;
  /** chave de atalho */
  key: string;
  hint: string;
  palette: {
    leaf: string;
    leafDark: string;
    leafLight: string;
    fruit: string;
    fruitLight: string;
    accent: string;
  };
}

export const DRY_GROWTH_RATE = 0.14;

export const SPECIES: Record<SpeciesId, Species> = {
  alface: {
    id: 'alface',
    name: 'Alface',
    seedCost: 8,
    unlockCost: 0,
    sellPrice: 26,
    growSeconds: 90,
    drySeconds: 55,
    key: '1',
    hint: 'Nasce rápido. Boa para os primeiros trocados.',
    palette: {
      leaf: '#8fc46f',
      leafDark: '#5d9450',
      leafLight: '#c4e39a',
      fruit: '#a9d47e',
      fruitLight: '#e2f2bd',
      accent: '#6fa85c',
    },
  },
  cenoura: {
    id: 'cenoura',
    name: 'Cenoura',
    seedCost: 22,
    unlockCost: 90,
    sellPrice: 85,
    growSeconds: 240,
    drySeconds: 110,
    key: '2',
    hint: 'A raiz aparece quando a copa está cheia.',
    palette: {
      leaf: '#7fb56b',
      leafDark: '#4f854a',
      leafLight: '#b6d992',
      fruit: '#e58a3f',
      fruitLight: '#f6bb78',
      accent: '#c96f2e',
    },
  },
  morango: {
    id: 'morango',
    name: 'Morango',
    seedCost: 55,
    unlockCost: 260,
    sellPrice: 230,
    growSeconds: 420,
    drySeconds: 170,
    key: '3',
    hint: 'Gosta de terra sempre úmida. Floresce antes de frutificar.',
    palette: {
      leaf: '#6fa95f',
      leafDark: '#457a45',
      leafLight: '#a9d18a',
      fruit: '#d94f49',
      fruitLight: '#f08a7f',
      accent: '#f2d7c8',
    },
  },
  tomate: {
    id: 'tomate',
    name: 'Tomate',
    seedCost: 130,
    unlockCost: 650,
    sellPrice: 560,
    growSeconds: 600,
    drySeconds: 220,
    key: '4',
    hint: 'Cresce alto. Dá cachos de três ou quatro.',
    palette: {
      leaf: '#5f9450',
      leafDark: '#3c6b3b',
      leafLight: '#93bd76',
      fruit: '#cf4438',
      fruitLight: '#f07f6a',
      accent: '#8fae5c',
    },
  },
  abobora: {
    id: 'abobora',
    name: 'Abóbora',
    seedCost: 300,
    unlockCost: 1500,
    sellPrice: 1400,
    growSeconds: 900,
    drySeconds: 320,
    key: '5',
    hint: 'Ocupa espaço, mas paga a semana inteira.',
    palette: {
      leaf: '#689a52',
      leafDark: '#406b3b',
      leafLight: '#9cc27a',
      fruit: '#d97a2b',
      fruitLight: '#f3ac5c',
      accent: '#a85a1e',
    },
  },
  girassol: {
    id: 'girassol',
    name: 'Girassol',
    seedCost: 650,
    unlockCost: 3200,
    sellPrice: 3200,
    growSeconds: 1200,
    drySeconds: 400,
    key: '6',
    hint: 'Vira o rosto para o sol. Demora, mas é bonito.',
    palette: {
      leaf: '#6b9d4f',
      leafDark: '#456f3a',
      leafLight: '#a3c878',
      fruit: '#f0bf3f',
      fruitLight: '#f9e08a',
      accent: '#8a5a2b',
    },
  },
};

export const SPECIES_ORDER: SpeciesId[] = [
  'alface',
  'cenoura',
  'morango',
  'tomate',
  'abobora',
  'girassol',
];

export const SPECIES_LIST = SPECIES_ORDER.map((id) => SPECIES[id]);

/** Expansões de canteiro, na ordem. Cada compra libera `plots` espaços. */
export const PLOT_TIERS = [
  { plots: 6, cost: 140 },
  { plots: 8, cost: 450 },
  { plots: 12, cost: 1600 },
] as const;

export const START_PLOTS = 4;
export const START_COINS = 24;

/* ----------------------------- Inventário ----------------------------- */

/** Espaços na sacola antes de qualquer melhoria. */
export const START_CAPACITY = 8;

/** Melhorias da sacola, na ordem. */
export const INVENTORY_TIERS = [
  { capacity: 12, cost: 120 },
  { capacity: 20, cost: 380 },
  { capacity: 32, cost: 1100 },
  { capacity: 48, cost: 2800 },
] as const;

export const MAX_GARDEN_NAME = 24;
export const DEFAULT_GARDEN_NAME = 'Minha horta';

/* ---------------------------- Fertilizantes --------------------------- */

export type FertilizerId = 'growth' | 'retention';

export interface Fertilizer {
  id: FertilizerId;
  name: string;
  /** nome curto usado na terra e nos avisos */
  short: string;
  description: string;
  /** preço de uma dose */
  price: number;
  /** multiplica o tempo de crescimento (< 1 = mais rápido) */
  growthMultiplier: number;
  /** multiplica o tempo até a terra secar (> 1 = segura mais a água) */
  dryMultiplier: number;
  key: string;
}

export const FERTILIZERS: Record<FertilizerId, Fertilizer> = {
  growth: {
    id: 'growth',
    name: 'Húmus',
    short: 'húmus',
    description: 'Terra viva: o pé fica pronto 35% mais depressa.',
    price: 16,
    growthMultiplier: 0.65,
    dryMultiplier: 1,
    key: '7',
  },
  retention: {
    id: 'retention',
    name: 'Cobertura',
    short: 'cobertura',
    description: 'Palha sobre a terra: demora o dobro para secar.',
    price: 12,
    growthMultiplier: 1,
    dryMultiplier: 2,
    key: '8',
  },
};

export const FERTILIZER_ORDER: FertilizerId[] = ['growth', 'retention'];

/* ------------------------------ Pedidos ------------------------------- */

export const ORDER_LIMITS = {
  /** pedidos ativos ao mesmo tempo */
  maxActive: 3,
  /** atraso até o primeiro pedido de uma horta nova */
  firstDelaySeconds: 30,
  /** intervalo entre pedidos quando há espaço */
  minGapSeconds: 45,
  maxGapSeconds: 120,
  /** quando a caderneta está cheia, tenta de novo depois deste tempo */
  waitWhenFullSeconds: 20,
} as const;

/** Quantidade mínima e máxima pedida de cada espécie. */
export const ORDER_QUANTITY: Record<SpeciesId, readonly [number, number]> = {
  alface: [2, 5],
  cenoura: [1, 3],
  morango: [1, 2],
  tomate: [1, 2],
  abobora: [1, 1],
  girassol: [1, 1],
};

/** O pedido paga entre 30% e 70% a mais do que a venda direta. */
export const ORDER_REWARD_MULTIPLIER = [1.3, 1.7] as const;

/** Prazo de entrega, em segundos. */
export const ORDER_DEADLINE_SECONDS = [180, 330] as const;

export const STAGE = {
  sprout: 0.08,
  young: 0.32,
  grown: 0.64,
} as const;

export function isReady(growth: number): boolean {
  return growth >= 1;
}

export function growthStage(growth: number): 'seed' | 'sprout' | 'young' | 'grown' {
  if (growth < STAGE.sprout) return 'seed';
  if (growth < STAGE.young) return 'sprout';
  if (growth < STAGE.grown) return 'young';
  return 'grown';
}

export function plotColumns(count: number): number {
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}
