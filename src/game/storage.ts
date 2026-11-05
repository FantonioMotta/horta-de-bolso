import {
  DEFAULT_GARDEN_NAME,
  FERTILIZERS,
  INVENTORY_TIERS,
  MAX_GARDEN_NAME,
  ORDER_LIMITS,
  PLOT_TIERS,
  SPECIES,
  SPECIES_ORDER,
  START_CAPACITY,
  START_PLOTS,
  type FertilizerId,
  type SpeciesId,
} from './data';
import {
  createEmptyInventory,
  createInitialState,
  tick,
  type GameState,
  type Order,
  type PlantState,
  type PlotState,
} from './engine';

const KEY = 'orta.save.v1';
const EXPORT_APP = 'orta';
const MAX_IMPORT_CHARS = 2_000_000;
const MAX_PLOTS = PLOT_TIERS[PLOT_TIERS.length - 1].plots;

export interface SaveFile {
  app: typeof EXPORT_APP;
  v: 2;
  exportedAt: number;
  state: GameState;
}


export interface OfflineReport {
  seconds: number;
  matured: number;
  growing: number;
  thirsty: number;
  orders: number;
  expired: number;
}

function isValidSpecies(value: unknown): value is SpeciesId {
  return typeof value === 'string' && value in SPECIES;
}

function isValidFertilizer(value: unknown): value is FertilizerId {
  return typeof value === 'string' && value in FERTILIZERS;
}

function isValidCapacity(value: unknown): value is number {
  if (!Number.isFinite(value)) return false;
  return [START_CAPACITY, ...INVENTORY_TIERS.map((tier) => tier.capacity)].includes(value as number);
}

type RawPlant = {
  species?: unknown;
  growth?: unknown;
  moisture?: unknown;
  fertilizer?: unknown;
};

type RawPlot = {
  unlocked?: unknown;
  plant?: RawPlant | null;
  fertilizer?: unknown;
};

function sanitizePlant(raw: RawPlant): PlantState | null {
  if (!isValidSpecies(raw.species)) return null;
  return {
    species: raw.species,
    growth: Number.isFinite(raw.growth) ? Math.min(1, Math.max(0, raw.growth as number)) : 0,
    moisture: Number.isFinite(raw.moisture)
      ? Math.min(1, Math.max(0, raw.moisture as number))
      : 0,
    fertilizer: isValidFertilizer(raw.fertilizer) ? raw.fertilizer : null,
  };
}

function sanitize(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Omit<Partial<GameState>, 'v'> & { v?: number };
  if (data.v !== 1 && data.v !== 2) return null;

  const rawPlots = data.plots as unknown as RawPlot[];
  const plots: PlotState[] = Array.isArray(rawPlots)
    ? rawPlots
        .slice(0, MAX_PLOTS)
        .filter((plot) => Boolean(plot) && typeof plot === 'object')
        .map((plot) => ({
          unlocked: Boolean(plot.unlocked),
          plant:
            plot.plant && typeof plot.plant === 'object' ? sanitizePlant(plot.plant) : null,
          fertilizer: isValidFertilizer(plot.fertilizer) ? plot.fertilizer : null,
        }))
    : [];

  while (plots.length < START_PLOTS) {
    plots.push({ unlocked: true, plant: null, fertilizer: null });
  }

  const unlocked: SpeciesId[] = [];
  if (Array.isArray(data.unlocked)) {
    for (const id of data.unlocked) {
      if (isValidSpecies(id) && !unlocked.includes(id)) unlocked.push(id);
    }
  }
  if (!unlocked.includes('alface')) unlocked.unshift('alface');
  unlocked.sort((a, b) => SPECIES_ORDER.indexOf(a) - SPECIES_ORDER.indexOf(b));

  const stats = (data.stats ?? {}) as Partial<GameState['stats']>;

  const capacity = isValidCapacity(data.capacity) ? data.capacity : START_CAPACITY;

  const inventory = createEmptyInventory();
  if (data.inventory && typeof data.inventory === 'object') {
    const rawInventory = data.inventory as unknown as Record<string, unknown>;
    for (const id of SPECIES_ORDER) {
      const value = Number(rawInventory[id]);
      inventory[id] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    }
  }

  // A sacola nunca pode começar maior do que o espaço comprado.
  let overflow = SPECIES_ORDER.reduce((total, id) => total + inventory[id], 0) - capacity;
  for (let index = SPECIES_ORDER.length - 1; index >= 0 && overflow > 0; index -= 1) {
    const id = SPECIES_ORDER[index];
    const remove = Math.min(inventory[id], overflow);
    inventory[id] -= remove;
    overflow -= remove;
  }

  const fertilizerStock = { growth: 0, retention: 0 };
  if (data.fertilizerStock && typeof data.fertilizerStock === 'object') {
    const rawStock = data.fertilizerStock as unknown as Record<string, unknown>;
    fertilizerStock.growth = Math.max(0, Math.floor(Number(rawStock.growth) || 0));
    fertilizerStock.retention = Math.max(0, Math.floor(Number(rawStock.retention) || 0));
  }

  const orders: Order[] = [];
  if (Array.isArray(data.orders)) {
    for (const item of data.orders) {
      if (!item || typeof item !== 'object') continue;
      const rawOrder = item as Partial<Order>;
      if (typeof rawOrder.id !== 'string' || !isValidSpecies(rawOrder.species)) continue;
      const quantity = Math.floor(Number(rawOrder.quantity));
      const reward = Math.floor(Number(rawOrder.reward));
      const deadline = Number(rawOrder.deadline);
      const createdAt = Number(rawOrder.createdAt);
      if (!(quantity > 0) || !(reward > 0) || !Number.isFinite(deadline)) continue;
      orders.push({
        id: rawOrder.id.slice(0, 40),
        species: rawOrder.species,
        quantity: Math.min(99, quantity),
        reward: Math.min(9_999_999, reward),
        createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
        deadline,
      });
      if (orders.length >= ORDER_LIMITS.maxActive) break;
    }
  }

  const now = Date.now();
  const name =
    typeof data.gardenName === 'string'
      ? data.gardenName.trim().slice(0, MAX_GARDEN_NAME) || DEFAULT_GARDEN_NAME
      : DEFAULT_GARDEN_NAME;

  return {
    v: 2,
    coins: Number.isFinite(data.coins) ? Math.max(0, Math.floor(data.coins as number)) : 0,
    gardenName: name,
    plots,
    inventory,
    capacity,
    fertilizerStock,
    orders,
    orderSeq: Number.isFinite(data.orderSeq)
      ? Math.max(1, Math.floor(data.orderSeq as number))
      : orders.length + 1,
    nextOrderAt: Number.isFinite(data.nextOrderAt)
      ? (data.nextOrderAt as number)
      : now + ORDER_LIMITS.firstDelaySeconds * 1000,
    unlocked,
    stats: {
      harvested: Math.max(0, Math.floor(Number(stats.harvested) || 0)),
      earned: Math.max(0, Math.floor(Number(stats.earned) || 0)),
      planted: Math.max(0, Math.floor(Number(stats.planted) || 0)),
      watered: Math.max(0, Math.floor(Number(stats.watered) || 0)),
      sold: Math.max(0, Math.floor(Number(stats.sold) || 0)),
      orders: Math.max(0, Math.floor(Number(stats.orders) || 0)),
    },
    introSeen: Boolean(data.introSeen),
    muted: Boolean(data.muted),
    lastTick: Number.isFinite(data.lastTick) ? (data.lastTick as number) : now,
  };
}

export function loadGame(now = Date.now()): { state: GameState; offline: OfflineReport | null } {
  let saved: GameState | null = null;
  try {
    const text = localStorage.getItem(KEY);
    if (text) saved = sanitize(JSON.parse(text));
  } catch {
    saved = null;
  }

  if (!saved) return { state: createInitialState(now), offline: null };

  const before = saved.plots;
  const beforeOrders = saved.orders;
  const elapsed = Math.max(0, (now - saved.lastTick) / 1000);
  const state = tick(saved, now);

  let matured = 0;
  let growing = 0;
  let thirsty = 0;
  state.plots.forEach((plot, index) => {
    if (!plot.plant) return;
    const was = before[index]?.plant;
    if (was && was.growth < 1 && plot.plant.growth >= 1) matured += 1;
    if (plot.plant.growth < 1) growing += 1;
    if (plot.plant.growth < 1 && plot.plant.moisture < 0.06) thirsty += 1;
  });

  const expired = beforeOrders.filter((order) => order.deadline <= now).length;

  const offline: OfflineReport | null =
    elapsed > 45
      ? {
          seconds: elapsed,
          matured,
          growing,
          thirsty,
          orders: state.orders.length,
          expired,
        }
      : null;

  return { state, offline };
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* armazenamento cheio ou bloqueado — seguimos sem salvar */
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada a fazer */
  }
}

/** Transforma o estado atual num arquivo de backup legível. */
export function encodeSave(state: GameState): string {
  const file: SaveFile = {
    app: EXPORT_APP,
    v: 2,
    exportedAt: Date.now(),
    state,
  };
  return JSON.stringify(file, null, 2);
}

/**
 * Lê um backup exportado (ou um save antigo colado à mão), valida tudo e
 * devolve um estado pronto para jogar. Retorna `null` se o arquivo não servir.
 */
export function decodeSave(text: string, now = Date.now()): GameState | null {
  if (typeof text !== 'string' || text.length === 0 || text.length > MAX_IMPORT_CHARS) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  const looksLikeFile =
    parsed !== null &&
    typeof parsed === 'object' &&
    (parsed as { app?: unknown }).app === EXPORT_APP &&
    'state' in parsed;
  const raw = looksLikeFile ? (parsed as { state?: unknown }).state : parsed;

  const state = sanitize(raw);
  if (!state) return null;

  // O backup é uma fotografia: não aplica o tempo em que ficou guardado.
  return {
    ...state,
    lastTick: now,
    orders: state.orders.filter((order) => order.deadline > now),
  };
}

