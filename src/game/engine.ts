import {
  DEFAULT_GARDEN_NAME,
  DRY_GROWTH_RATE,
  FERTILIZERS,
  INVENTORY_TIERS,
  MAX_GARDEN_NAME,
  ORDER_DEADLINE_SECONDS,
  ORDER_LIMITS,
  ORDER_QUANTITY,
  ORDER_REWARD_MULTIPLIER,
  PLOT_TIERS,
  SPECIES,
  SPECIES_ORDER,
  START_CAPACITY,
  START_COINS,
  START_PLOTS,
  type FertilizerId,
  type SpeciesId,
} from './data';

export interface PlantState {
  species: SpeciesId;
  /** 0 → 1 */
  growth: number;
  /** 0 → 1 */
  moisture: number;
  /** fertilizante aplicado nesta germinação (no máximo um) */
  fertilizer: FertilizerId | null;
}

export interface PlotState {
  unlocked: boolean;
  plant: PlantState | null;
  /** fertilizante já espalhado na terra, esperando a semente */
  fertilizer: FertilizerId | null;
}

export type Inventory = Record<SpeciesId, number>;
export type FertilizerStock = Record<FertilizerId, number>;

export interface Order {
  id: string;
  species: SpeciesId;
  quantity: number;
  reward: number;
  createdAt: number;
  deadline: number;
}

export interface GameStats {
  harvested: number;
  earned: number;
  planted: number;
  watered: number;
  sold: number;
  orders: number;
}

export interface GameState {
  v: 2;
  coins: number;
  gardenName: string;
  plots: PlotState[];
  inventory: Inventory;
  capacity: number;
  fertilizerStock: FertilizerStock;
  orders: Order[];
  orderSeq: number;
  nextOrderAt: number;
  unlocked: SpeciesId[];
  stats: GameStats;
  introSeen: boolean;
  muted: boolean;
  lastTick: number;
}

export type GameEvent =
  | { type: 'water'; plot: number }
  | { type: 'water-full' }
  | { type: 'plant'; plot: number; species: SpeciesId }
  | { type: 'fertilize'; plot: number; fertilizer: FertilizerId }
  | { type: 'harvest'; plot: number; species: SpeciesId }
  | { type: 'sell'; species: SpeciesId | null; quantity: number; coins: number }
  | { type: 'unlock'; species: SpeciesId }
  | { type: 'expand'; plots: number }
  | { type: 'capacity'; capacity: number }
  | { type: 'fertilizer-bought'; fertilizer: FertilizerId; stock: number }
  | { type: 'rename'; name: string }
  | { type: 'order-filled'; species: SpeciesId; quantity: number; coins: number }
  | {
      type: 'error';
      reason:
        | 'coins'
        | 'empty'
        | 'busy'
        | 'locked'
        | 'dry'
        | 'max'
        | 'full'
        | 'nothing'
        | 'stock'
        | 'fertilizer'
        | 'fertilized'
        | 'planted'
        | 'order';
    };

export interface ActionResult {
  state: GameState;
  event?: GameEvent;
}

export function createEmptyInventory(): Inventory {
  return SPECIES_ORDER.reduce((inventory, id) => {
    inventory[id] = 0;
    return inventory;
  }, {} as Inventory);
}

export function createInitialState(now = Date.now()): GameState {
  return {
    v: 2,
    coins: START_COINS,
    gardenName: DEFAULT_GARDEN_NAME,
    plots: Array.from({ length: START_PLOTS }, () => ({
      unlocked: true,
      plant: null,
      fertilizer: null,
    })),
    inventory: createEmptyInventory(),
    capacity: START_CAPACITY,
    fertilizerStock: { growth: 0, retention: 0 },
    orders: [],
    orderSeq: 1,
    nextOrderAt: now + ORDER_LIMITS.firstDelaySeconds * 1000,
    unlocked: ['alface'],
    stats: { harvested: 0, earned: 0, planted: 0, watered: 0, sold: 0, orders: 0 },
    introSeen: false,
    muted: false,
    lastTick: now,
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function advancePlot(plot: PlotState, dt: number): PlotState {
  if (!plot.plant) return plot;
  const plant = plot.plant;
  const species = SPECIES[plant.species];
  if (plant.growth >= 1 && plant.moisture <= 0) return plot;

  const fertilizer = plant.fertilizer ? FERTILIZERS[plant.fertilizer] : null;
  const growSeconds = species.growSeconds * (fertilizer?.growthMultiplier ?? 1);
  const drySeconds = species.drySeconds * (fertilizer?.dryMultiplier ?? 1);

  const wetSeconds = Math.min(dt, plant.moisture * drySeconds);
  const drySecondsElapsed = dt - wetSeconds;
  const effective = wetSeconds + drySecondsElapsed * DRY_GROWTH_RATE;
  const growth = clamp01(plant.growth + effective / growSeconds);
  const moisture = clamp01(plant.moisture - dt / drySeconds);

  if (growth === plant.growth && moisture === plant.moisture) return plot;
  return { ...plot, plant: { ...plant, growth, moisture } };
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function makeOrder(unlocked: SpeciesId[], seq: number, now: number): Order {
  const pool = unlocked.length ? unlocked : (['alface'] as SpeciesId[]);
  const speciesId = pool[Math.floor(Math.random() * pool.length)];
  const species = SPECIES[speciesId];
  const [minQuantity, maxQuantity] = ORDER_QUANTITY[speciesId];
  const quantity =
    minQuantity + Math.floor(Math.random() * (maxQuantity - minQuantity + 1));
  const bonus = randomBetween(ORDER_REWARD_MULTIPLIER[0], ORDER_REWARD_MULTIPLIER[1]);
  const reward = Math.max(1, Math.round(species.sellPrice * quantity * bonus));
  const deadline =
    now + randomBetween(ORDER_DEADLINE_SECONDS[0], ORDER_DEADLINE_SECONDS[1]) * 1000;

  return {
    id: `p${seq}`,
    species: speciesId,
    quantity,
    reward,
    createdAt: now,
    deadline,
  };
}

/**
 * Avança o tempo do jogo. Funciona igual para 1 segundo ou para 8 horas:
 * o crescimento é linear enquanto há umidade, então o cálculo é exato.
 * Pedidos vencidos saem da caderneta e novos pedidos chegam com o tempo.
 */
export function tick(state: GameState, now: number): GameState {
  const dt = Math.max(0, (now - state.lastTick) / 1000);
  if (dt < 0.2) {
    return state.lastTick === now ? state : { ...state, lastTick: now };
  }

  let changed = false;
  const plots = state.plots.map((plot) => {
    const next = advancePlot(plot, dt);
    if (next !== plot) changed = true;
    return next;
  });

  let orders = state.orders.filter((order) => order.deadline > now);
  let ordersChanged = orders.length !== state.orders.length;
  let orderSeq = state.orderSeq;
  let nextOrderAt = state.nextOrderAt;

  while (orders.length < ORDER_LIMITS.maxActive && now >= nextOrderAt) {
    orders = [...orders, makeOrder(state.unlocked, orderSeq, now)];
    orderSeq += 1;
    nextOrderAt = now + randomBetween(ORDER_LIMITS.minGapSeconds, ORDER_LIMITS.maxGapSeconds) * 1000;
    ordersChanged = true;
  }

  if (orders.length >= ORDER_LIMITS.maxActive && now >= nextOrderAt) {
    nextOrderAt = now + ORDER_LIMITS.waitWhenFullSeconds * 1000;
  }

  return {
    ...state,
    plots: changed ? plots : state.plots,
    orders: ordersChanged ? orders : state.orders,
    orderSeq,
    nextOrderAt,
    lastTick: now,
  };
}

export function plantSeed(
  state: GameState,
  plotIndex: number,
  speciesId: SpeciesId
): ActionResult {
  const plot = state.plots[plotIndex];
  const species = SPECIES[speciesId];

  if (!plot || !plot.unlocked) return { state, event: { type: 'error', reason: 'locked' } };
  if (!state.unlocked.includes(speciesId))
    return { state, event: { type: 'error', reason: 'locked' } };
  if (plot.plant) return { state, event: { type: 'error', reason: 'busy' } };
  if (state.coins < species.seedCost) return { state, event: { type: 'error', reason: 'coins' } };

  const plots = state.plots.slice();
  plots[plotIndex] = {
    ...plot,
    fertilizer: null,
    plant: { species: speciesId, growth: 0, moisture: 0.55, fertilizer: plot.fertilizer },
  };

  return {
    state: {
      ...state,
      coins: state.coins - species.seedCost,
      plots,
      stats: { ...state.stats, planted: state.stats.planted + 1 },
    },
    event: { type: 'plant', plot: plotIndex, species: speciesId },
  };
}

export function applyFertilizer(
  state: GameState,
  plotIndex: number,
  fertilizerId: FertilizerId
): ActionResult {
  const plot = state.plots[plotIndex];
  if (!plot || !plot.unlocked) return { state, event: { type: 'error', reason: 'locked' } };
  if (plot.plant) return { state, event: { type: 'error', reason: 'planted' } };
  if (plot.fertilizer) return { state, event: { type: 'error', reason: 'fertilized' } };
  if (state.fertilizerStock[fertilizerId] <= 0)
    return { state, event: { type: 'error', reason: 'fertilizer' } };

  const plots = state.plots.slice();
  plots[plotIndex] = { ...plot, fertilizer: fertilizerId };

  return {
    state: {
      ...state,
      plots,
      fertilizerStock: {
        ...state.fertilizerStock,
        [fertilizerId]: state.fertilizerStock[fertilizerId] - 1,
      },
    },
    event: { type: 'fertilize', plot: plotIndex, fertilizer: fertilizerId },
  };
}

export function waterPlot(state: GameState, plotIndex: number): ActionResult {
  const plot = state.plots[plotIndex];
  if (!plot || !plot.unlocked) return { state, event: { type: 'error', reason: 'locked' } };
  if (!plot.plant) return { state, event: { type: 'error', reason: 'empty' } };
  if (plot.plant.moisture >= 0.97) return { state, event: { type: 'water-full' } };

  const plots = state.plots.slice();
  plots[plotIndex] = {
    ...plot,
    plant: { ...plot.plant, moisture: 1 },
  };

  return {
    state: {
      ...state,
      plots,
      stats: { ...state.stats, watered: state.stats.watered + 1 },
    },
    event: { type: 'water', plot: plotIndex },
  };
}

export function harvestPlot(state: GameState, plotIndex: number): ActionResult {
  const plot = state.plots[plotIndex];
  if (!plot || !plot.unlocked) return { state, event: { type: 'error', reason: 'locked' } };
  if (!plot.plant) return { state, event: { type: 'error', reason: 'empty' } };
  if (plot.plant.growth < 1) return { state, event: { type: 'error', reason: 'dry' } };
  if (inventoryTotal(state) >= state.capacity)
    return { state, event: { type: 'error', reason: 'full' } };

  const species = SPECIES[plot.plant.species];
  const plots = state.plots.slice();
  plots[plotIndex] = { ...plot, plant: null };

  return {
    state: {
      ...state,
      plots,
      inventory: {
        ...state.inventory,
        [species.id]: state.inventory[species.id] + 1,
      },
      stats: { ...state.stats, harvested: state.stats.harvested + 1 },
    },
    event: { type: 'harvest', plot: plotIndex, species: species.id },
  };
}

export function sellSpecies(state: GameState, speciesId: SpeciesId): ActionResult {
  const quantity = state.inventory[speciesId];
  if (quantity <= 0) return { state, event: { type: 'error', reason: 'nothing' } };

  const coins = quantity * SPECIES[speciesId].sellPrice;

  return {
    state: {
      ...state,
      coins: state.coins + coins,
      inventory: { ...state.inventory, [speciesId]: 0 },
      stats: {
        ...state.stats,
        sold: state.stats.sold + quantity,
        earned: state.stats.earned + coins,
      },
    },
    event: { type: 'sell', species: speciesId, quantity, coins },
  };
}

export function sellAll(state: GameState): ActionResult {
  const total = inventoryTotal(state);
  if (total <= 0) return { state, event: { type: 'error', reason: 'nothing' } };

  const coins = SPECIES_ORDER.reduce(
    (sum, id) => sum + state.inventory[id] * SPECIES[id].sellPrice,
    0
  );

  return {
    state: {
      ...state,
      coins: state.coins + coins,
      inventory: createEmptyInventory(),
      stats: {
        ...state.stats,
        sold: state.stats.sold + total,
        earned: state.stats.earned + coins,
      },
    },
    event: { type: 'sell', species: null, quantity: total, coins },
  };
}

export function unlockSpecies(state: GameState, speciesId: SpeciesId): ActionResult {
  const species = SPECIES[speciesId];
  if (state.unlocked.includes(speciesId)) return { state, event: { type: 'error', reason: 'busy' } };
  if (state.coins < species.unlockCost) return { state, event: { type: 'error', reason: 'coins' } };

  return {
    state: {
      ...state,
      coins: state.coins - species.unlockCost,
      unlocked: [...state.unlocked, speciesId],
    },
    event: { type: 'unlock', species: speciesId },
  };
}

export function nextPlotTier(state: GameState) {
  return PLOT_TIERS.find((tier) => tier.plots > state.plots.length) ?? null;
}

export function expandPlots(state: GameState): ActionResult {
  const tier = nextPlotTier(state);
  if (!tier) return { state, event: { type: 'error', reason: 'max' } };
  if (state.coins < tier.cost) return { state, event: { type: 'error', reason: 'coins' } };

  const target = tier.plots;
  const plots = state.plots.slice();
  while (plots.length < target) plots.push({ unlocked: true, plant: null, fertilizer: null });

  return {
    state: { ...state, coins: state.coins - tier.cost, plots },
    event: { type: 'expand', plots: target },
  };
}

export function nextCapacityTier(state: GameState) {
  return INVENTORY_TIERS.find((tier) => tier.capacity > state.capacity) ?? null;
}

export function buyCapacity(state: GameState): ActionResult {
  const tier = nextCapacityTier(state);
  if (!tier) return { state, event: { type: 'error', reason: 'max' } };
  if (state.coins < tier.cost) return { state, event: { type: 'error', reason: 'coins' } };

  return {
    state: { ...state, coins: state.coins - tier.cost, capacity: tier.capacity },
    event: { type: 'capacity', capacity: tier.capacity },
  };
}

export function buyFertilizer(state: GameState, fertilizerId: FertilizerId): ActionResult {
  const fertilizer = FERTILIZERS[fertilizerId];
  if (state.coins < fertilizer.price) return { state, event: { type: 'error', reason: 'coins' } };

  const stock = state.fertilizerStock[fertilizerId] + 1;

  return {
    state: {
      ...state,
      coins: state.coins - fertilizer.price,
      fertilizerStock: { ...state.fertilizerStock, [fertilizerId]: stock },
    },
    event: { type: 'fertilizer-bought', fertilizer: fertilizerId, stock },
  };
}

export function deliverOrder(state: GameState, orderId: string, now = Date.now()): ActionResult {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order || order.deadline <= now) return { state, event: { type: 'error', reason: 'order' } };
  if (state.inventory[order.species] < order.quantity)
    return { state, event: { type: 'error', reason: 'stock' } };

  return {
    state: {
      ...state,
      coins: state.coins + order.reward,
      inventory: {
        ...state.inventory,
        [order.species]: state.inventory[order.species] - order.quantity,
      },
      orders: state.orders.filter((item) => item.id !== orderId),
      stats: {
        ...state.stats,
        orders: state.stats.orders + 1,
        earned: state.stats.earned + order.reward,
      },
    },
    event: {
      type: 'order-filled',
      species: order.species,
      quantity: order.quantity,
      coins: order.reward,
    },
  };
}

export function renameGarden(state: GameState, rawName: string): ActionResult {
  const name = rawName.trim().slice(0, MAX_GARDEN_NAME) || DEFAULT_GARDEN_NAME;
  if (name === state.gardenName) return { state };
  return { state: { ...state, gardenName: name }, event: { type: 'rename', name } };
}

export function toggleMute(state: GameState): GameState {
  return { ...state, muted: !state.muted };
}

export function markIntroSeen(state: GameState): GameState {
  return { ...state, introSeen: true };
}

export function inventoryTotal(state: GameState): number {
  return SPECIES_ORDER.reduce((total, id) => total + state.inventory[id], 0);
}

export function inventoryValue(state: GameState): number {
  return SPECIES_ORDER.reduce(
    (total, id) => total + state.inventory[id] * SPECIES[id].sellPrice,
    0
  );
}

export function orderSecondsLeft(order: Order, now = Date.now()): number {
  return Math.max(0, (order.deadline - now) / 1000);
}

/** Quantos pés estão prontos para colher. */
export function readyCount(state: GameState): number {
  return state.plots.reduce(
    (total, plot) => (plot.plant && plot.plant.growth >= 1 ? total + 1 : total),
    0
  );
}

export function thirstyCount(state: GameState): number {
  return state.plots.reduce(
    (total, plot) =>
      plot.plant && plot.plant.growth < 1 && plot.plant.moisture < 0.06 ? total + 1 : total,
    0
  );
}

/** Segundos de crescimento que faltam, supondo que a terra será mantida úmida. */
export function secondsToReady(plant: PlantState): number {
  const species = SPECIES[plant.species];
  if (plant.growth >= 1) return 0;
  const fertilizer = plant.fertilizer ? FERTILIZERS[plant.fertilizer] : null;
  const growSeconds = species.growSeconds * (fertilizer?.growthMultiplier ?? 1);
  return Math.max(1, (1 - plant.growth) * growSeconds);
}
