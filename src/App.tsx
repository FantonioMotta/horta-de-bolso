import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FERTILIZERS,
  FERTILIZER_ORDER,
  SPECIES,
  SPECIES_ORDER,
  type FertilizerId,
  type SpeciesId,
} from './game/data';
import { audio } from './game/audio';
import { getMood } from './game/mood';
import { coopAnimalTotal, coopTier } from './game/coop';
import {
  inventoryTotal,
  nextCapacityTier,
  nextPlotTier,
  orderSecondsLeft,
  readyCount,
  thirstyCount,
} from './game/engine';
import { useGame } from './game/useGame';
import { Hud } from './components/Hud';
import { Scenery } from './components/Scenery';
import { Garden } from './components/Garden';
import { Coop } from './components/Coop';
import { Tray } from './components/Tray';
import { CoopTray } from './components/CoopTray';
import { Shop } from './components/Shop';
import { CoopSheet } from './components/CoopSheet';
import { InventorySheet } from './components/InventorySheet';
import { OrdersSheet } from './components/OrdersSheet';
import { NameDialog } from './components/NameDialog';
import { Intro, OfflineNotice, Toasts } from './components/Overlays';
import type { Tool } from './components/Plot';

type Panel = 'shop' | 'inventory' | 'orders' | 'coop';

/** Em desenvolvimento, `?hora=21.5` permite espiar a horta em outro horário. */
const DEV_HOUR = import.meta.env.DEV
  ? new URLSearchParams(window.location.search).get('hora')
  : null;

function readMood() {
  if (!DEV_HOUR) return getMood();
  const [hours, minutes] = DEV_HOUR.split(':').map(Number);
  const date = new Date();
  date.setHours(
    Number.isFinite(hours) ? hours : 12,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0
  );
  return getMood(date);
}

export default function App() {
  const { state, actions, bursts, toasts, offline } = useGame();
  const [tool, setTool] = useState<Tool>('water');
  const [panel, setPanel] = useState<Panel | null>(null);
  const [nameOpen, setNameOpen] = useState(false);
  const [mood, setMood] = useState(readMood);

  const stateRef = useRef(state);
  stateRef.current = state;

  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const id = window.setInterval(() => setMood(readMood()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    audio.setMuted(state.muted);
  }, [state.muted]);

  useEffect(() => {
    audio.setNight(mood.night);
  }, [mood.night]);

  useEffect(() => {
    const unlock = () => {
      audio.init();
      audio.setMuted(stateRef.current.muted);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const selectTool = useCallback((next: Tool) => setTool(next), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const key = event.key.toLowerCase();
      if (key === 'escape') {
        if (nameOpen) setNameOpen(false);
        else if (panel) setPanel(null);
        else if (stateRef.current.screen === 'coop') actionsRef.current.setScreen('garden');
        else setTool('water');
        return;
      }
      if (key === 'g') {
        setNameOpen(false);
        setPanel(null);
        actionsRef.current.setScreen(stateRef.current.screen === 'coop' ? 'garden' : 'coop');
        return;
      }
      if (key === 'h') {
        setNameOpen(false);
        setPanel(null);
        actionsRef.current.setScreen('garden');
        return;
      }
      if (key === 'l') {
        setNameOpen(false);
        setPanel((current) => (current === 'shop' ? null : 'shop'));
        return;
      }
      if (key === 'i') {
        setNameOpen(false);
        setPanel((current) => (current === 'inventory' ? null : 'inventory'));
        return;
      }
      if (key === 'p') {
        setNameOpen(false);
        setPanel((current) => (current === 'orders' ? null : 'orders'));
        return;
      }
      if (key === 'w') {
        setTool('water');
        return;
      }
      const fertilizer = FERTILIZER_ORDER.find((id) => FERTILIZERS[id].key === key);
      if (fertilizer) {
        if (stateRef.current.fertilizerStock[fertilizer] > 0) setTool(fertilizer);
        else setPanel('shop');
        event.preventDefault();
        return;
      }
      const found = SPECIES_ORDER.find((id) => SPECIES[id].key === key);
      if (found && stateRef.current.unlocked.includes(found)) {
        setTool(found);
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [panel, nameOpen]);

  const tier = nextPlotTier(state);
  const capacityTier = nextCapacityTier(state);
  const nextLocked = SPECIES_ORDER.find((id) => !state.unlocked.includes(id)) ?? null;
  const ready = readyCount(state);
  const thirsty = thirstyCount(state);
  const stored = inventoryTotal(state);
  const urgentOrders = state.orders.some((order) => orderSecondsLeft(order) <= 90);
  const showOffline = Boolean(offline && state.introSeen);
  const screen = state.screen;
  const coopTierInfo = coopTier(state.coop);
  const coopAdults = coopAnimalTotal(state.coop);
  const coopStatus =
    state.coop.eggs >= coopTierInfo.eggs && state.coop.eggs > 0
      ? 'o ninho está cheio'
      : state.coop.eggs > 0
        ? `${state.coop.eggs} ovo${state.coop.eggs > 1 ? 's' : ''} no ninho`
        : state.coop.chicks.length > 0
          ? `${state.coop.chicks.length} pintinho${state.coop.chicks.length > 1 ? 's' : ''} crescendo`
          : coopAdults > 0
            ? `${coopAdults} morador${coopAdults > 1 ? 'es' : ''} no galinheiro`
            : 'o galinheiro está vazio';
  const showHint =
    state.introSeen &&
    state.stats.planted === 0 &&
    !panel &&
    !nameOpen &&
    !showOffline &&
    screen === 'garden';

  const handlePlant = useCallback(
    (index: number, species: SpeciesId) => {
      actions.plant(index, species);
    },
    [actions]
  );

  const handleFertilize = useCallback(
    (index: number, fertilizer: FertilizerId) => {
      actions.fertilize(index, fertilizer);
    },
    [actions]
  );

  const handleLocked = useCallback(() => {
    setPanel('shop');
  }, []);

  const openShop = useCallback(() => {
    setNameOpen(false);
    setPanel('shop');
  }, []);

  const goToScreen = useCallback(
    (next: 'garden' | 'coop') => {
      setNameOpen(false);
      setPanel(null);
      actions.setScreen(next);
    },
    [actions]
  );

  const openCoopSheet = useCallback(() => {
    setNameOpen(false);
    setPanel('coop');
  }, []);

  return (
    <div className={`app${mood.night ? ' is-night' : ''}`}>
      <Hud
        coins={state.coins}
        gardenName={state.gardenName}
        inventoryCount={stored}
        capacity={state.capacity}
        orderCount={state.orders.length}
        urgentOrders={urgentOrders}
        mood={mood}
        muted={state.muted}
        ready={ready}
        thirsty={thirsty}
        onToggleMute={actions.toggleMute}
        onOpenShop={openShop}
        onOpenInventory={() => {
          setNameOpen(false);
          setPanel((current) => (current === 'inventory' ? null : 'inventory'));
        }}
        onOpenOrders={() => {
          setNameOpen(false);
          setPanel((current) => (current === 'orders' ? null : 'orders'));
        }}
        onRename={() => setNameOpen(true)}
      />

      <main className="scene">
        <Scenery mood={mood} />

        <div className="scene-top">
          <span className="scene-chip">
            <span className="scene-dot" />
            {screen === 'coop'
              ? coopStatus
              : ready > 0
                ? `${ready} pronto${ready > 1 ? 's' : ''} para colher`
                : thirsty > 0
                  ? `${thirsty} com sede`
                  : 'a horta está em paz'}
          </span>

          <div className="scene-switch" role="group" aria-label="Trocar de tela">
            <button
              type="button"
              className={`scene-switch-button${screen === 'garden' ? ' is-active' : ''}`}
              onClick={() => goToScreen('garden')}
              aria-pressed={screen === 'garden'}
              title="Ir para a horta (H)"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M4 16c0-7 4-11 12-12 0 8-4 12-11 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M4 18c1.5-4 4-7 8-9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span>Horta</span>
            </button>
            <button
              type="button"
              className={`scene-switch-button${screen === 'coop' ? ' is-active' : ''}`}
              onClick={() => goToScreen('coop')}
              aria-pressed={screen === 'coop'}
              title="Ir para o galinheiro (G)"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 9.5 10 4l7 5.5V17H3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M8 17v-5h4v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span>Galinheiro</span>
              {state.coop.eggs > 0 && screen !== 'coop' ? (
                <i className="scene-switch-dot" aria-hidden="true" />
              ) : null}
            </button>
          </div>
        </div>

        {showHint ? (
          <div className="scene-hint">
            Escolha uma semente na bandeja e toque num canteiro vazio.
          </div>
        ) : null}

        {screen === 'garden' ? (
          <Garden
            plots={state.plots}
            tool={tool}
            bursts={bursts}
            lockedCost={tier?.cost ?? null}
            gardenName={state.gardenName}
            onPlant={handlePlant}
            onWater={actions.water}
            onHarvest={actions.harvest}
            onFertilize={handleFertilize}
            onLocked={handleLocked}
          />
        ) : (
          <Coop coop={state.coop} onOpenSheet={openCoopSheet} />
        )}
      </main>

      {screen === 'garden' ? (
        <Tray
          unlocked={state.unlocked}
          coins={state.coins}
          tool={tool}
          nextLocked={nextLocked}
          fertilizerStock={state.fertilizerStock}
          onSelect={selectTool}
          onOpenShop={openShop}
        />
      ) : (
        <CoopTray
          coop={state.coop}
          onSellEggs={actions.sellEggs}
          onHatch={actions.hatchEggs}
          onOpenSheet={openCoopSheet}
        />
      )}

      <Shop
        open={panel === 'shop'}
        state={state}
        nextTier={tier}
        nextCapacity={capacityTier}
        onClose={() => setPanel(null)}
        onUnlock={actions.unlock}
        onExpand={actions.expand}
        onBuyCapacity={actions.buyCapacity}
        onBuyFertilizer={actions.buyFertilizer}
        onExport={actions.exportSave}
        onImport={actions.importSave}
        onReset={actions.reset}
      />

      <CoopSheet
        open={panel === 'coop'}
        coop={state.coop}
        coins={state.coins}
        onClose={() => setPanel(null)}
        onBuy={actions.buyCoopAnimal}
        onSell={actions.sellCoopAnimal}
        onSellEggs={actions.sellEggs}
        onHatch={actions.hatchEggs}
        onSellChick={actions.sellChick}
        onExpand={actions.expandCoop}
      />

      <InventorySheet
        open={panel === 'inventory'}
        state={state}
        onClose={() => setPanel(null)}
        onSell={actions.sell}
        onSellAll={actions.sellAll}
        onOpenShop={() => setPanel('shop')}
      />

      <OrdersSheet
        open={panel === 'orders'}
        state={state}
        onClose={() => setPanel(null)}
        onDeliver={actions.deliver}
        onOpenInventory={() => setPanel('inventory')}
      />

      <NameDialog
        open={nameOpen}
        current={state.gardenName}
        onClose={() => setNameOpen(false)}
        onSave={(name) => {
          actions.rename(name);
          setNameOpen(false);
        }}
      />

      <Toasts toasts={toasts} />

      <Intro
        open={!state.introSeen}
        onStart={() => {
          audio.init();
          audio.setMuted(state.muted);
          actions.markIntroSeen();
        }}
      />

      <OfflineNotice report={showOffline ? offline : null} onClose={actions.dismissOffline} />
    </div>
  );
}
