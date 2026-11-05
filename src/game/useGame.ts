import { useCallback, useEffect, useRef, useState } from 'react';
import { SPECIES, FERTILIZERS, type FertilizerId, type SpeciesId } from './data';
import { audio } from './audio';
import {
  applyFertilizer,
  buyCapacity,
  buyFertilizer,
  createInitialState,
  deliverOrder,
  expandPlots,
  harvestPlot,
  markIntroSeen,
  plantSeed,
  renameGarden,
  sellAll,
  sellSpecies,
  tick,
  toggleMute,
  unlockSpecies,
  waterPlot,
  type ActionResult,
  type GameEvent,
  type GameState,
} from './engine';
import { clearSave, decodeSave, encodeSave, loadGame, saveGame, type OfflineReport } from './storage';

export interface Burst {
  id: number;
  kind: 'water' | 'harvest' | 'plant' | 'fertilize';
  amount?: number;
}

export interface Toast {
  id: number;
  text: string;
  tone: 'good' | 'info' | 'bad';
}

let sequence = 1;

export function useGame() {
  const [initial] = useState(() => loadGame());
  const [state, setState] = useState<GameState>(initial.state);
  const [offline, setOffline] = useState<OfflineReport | null>(initial.offline);
  const [bursts, setBursts] = useState<Record<number, Burst>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const stateRef = useRef(state);
  const burstTimers = useRef<Record<number, number>>({});

  const commit = useCallback((next: GameState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const toast = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = sequence++;
    setToasts((current) => [...current.slice(-2), { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  const burst = useCallback((plot: number, kind: Burst['kind'], amount?: number) => {
    const id = sequence++;
    setBursts((current) => ({ ...current, [plot]: { id, kind, amount } }));
    if (burstTimers.current[plot]) window.clearTimeout(burstTimers.current[plot]);
    burstTimers.current[plot] = window.setTimeout(() => {
      setBursts((current) => {
        const next = { ...current };
        delete next[plot];
        return next;
      });
    }, 1200);
  }, []);

  const handleEvent = useCallback(
    (event: GameEvent) => {
      switch (event.type) {
        case 'plant':
          audio.play('plant');
          burst(event.plot, 'plant');
          break;
        case 'water':
          audio.play('water');
          burst(event.plot, 'water');
          break;
        case 'fertilize':
          audio.play('fertilize');
          burst(event.plot, 'fertilize');
          toast(`${FERTILIZERS[event.fertilizer].name} aplicado. Agora plante a semente.`, 'good');
          break;
        case 'harvest':
          audio.play('harvest');
          burst(event.plot, 'harvest', 1);
          toast(`${SPECIES[event.species].name} guardada na sacola.`, 'good');
          break;
        case 'sell':
          audio.play('sell');
          if (event.species) {
            toast(
              `${event.quantity}× ${SPECIES[event.species].name} vendida${
                event.quantity > 1 ? 's' : ''
              } por ${event.coins} moedas.`,
              'good'
            );
          } else {
            toast(`${event.quantity} itens vendidos por ${event.coins} moedas.`, 'good');
          }
          break;
        case 'water-full':
          audio.play('error');
          toast('Essa terra já está molhada.', 'info');
          break;
        case 'unlock':
          audio.play('unlock');
          toast(`${SPECIES[event.species].name} liberada!`, 'good');
          break;
        case 'expand':
          audio.play('expand');
          toast(`Agora você tem ${event.plots} canteiros.`, 'good');
          break;
        case 'capacity':
          audio.play('expand');
          toast(`Sacola ampliada para ${event.capacity} lugares.`, 'good');
          break;
        case 'fertilizer-bought':
          audio.play('coin');
          toast(
            `${FERTILIZERS[event.fertilizer].name} comprado. Estoque: ${event.stock}.`,
            'good'
          );
          break;
        case 'rename':
          toast(`A horta agora se chama “${event.name}”.`, 'good');
          break;
        case 'order-filled':
          audio.play('sell');
          window.setTimeout(() => audio.play('order'), 160);
          toast(
            `Pedido entregue: ${event.quantity}× ${SPECIES[event.species].name} por ${
              event.coins
            } moedas.`,
            'good'
          );
          break;
        case 'error':
          audio.play('error');
          if (event.reason === 'coins') toast('Moedas insuficientes.', 'bad');
          if (event.reason === 'empty') toast('Plante uma semente primeiro.', 'info');
          if (event.reason === 'locked') toast('Esse canteiro ainda está bloqueado.', 'info');
          if (event.reason === 'dry') toast('Ainda não está pronto para colher.', 'info');
          if (event.reason === 'busy') toast('Esse canteiro já está ocupado.', 'info');
          if (event.reason === 'max') toast('Isso já está no tamanho máximo.', 'info');
          if (event.reason === 'full') toast('Sacola cheia. Venda alguma colheita primeiro.', 'bad');
          if (event.reason === 'nothing') toast('Não há nada para vender na sacola.', 'info');
          if (event.reason === 'stock') toast('Itens insuficientes na sacola.', 'info');
          if (event.reason === 'fertilizer')
            toast('Sem fertilizante no estoque. Compre na loja.', 'info');
          if (event.reason === 'fertilized')
            toast('Essa terra já recebeu um fertilizante.', 'info');
          if (event.reason === 'planted')
            toast('O fertilizante vai na terra antes da semente.', 'info');
          if (event.reason === 'order') toast('Esse pedido já não está disponível.', 'info');
          break;
        default:
          break;
      }
    },
    [burst, toast]
  );

  const run = useCallback(
    (action: (current: GameState) => ActionResult) => {
      const result = action(stateRef.current);
      if (result.state !== stateRef.current) commit(result.state);
      if (result.event) handleEvent(result.event);
      return result;
    },
    [commit, handleEvent]
  );

  /** Avança o relógio e avisa quando pedidos chegam ou vencem. */
  const advance = useCallback(
    (now: number) => {
      const current = stateRef.current;
      const next = tick(current, now);
      if (next === current) return;

      const added = next.orders.filter(
        (order) => !current.orders.some((previous) => previous.id === order.id)
      );
      if (added.length > 0) {
        const first = added[0];
        toast(`Novo pedido: ${first.quantity}× ${SPECIES[first.species].name}.`, 'info');
        audio.play('order');
      }

      const expired = current.orders.filter(
        (order) =>
          order.deadline <= now && !next.orders.some((active) => active.id === order.id)
      );
      if (expired.length > 0) {
        toast(
          expired.length > 1
            ? `${expired.length} pedidos expiraram sem entrega.`
            : 'Um pedido expirou sem entrega.',
          'bad'
        );
      }

      commit(next);
    },
    [commit, toast]
  );

  useEffect(() => {
    const interval = window.setInterval(() => advance(Date.now()), 400);
    return () => window.clearInterval(interval);
  }, [advance]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') advance(Date.now());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [advance]);

  // Salva em intervalos fixos; o tick não pode adiar o save para sempre.
  useEffect(() => {
    const interval = window.setInterval(() => saveGame(stateRef.current), 3000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const flush = () => saveGame(stateRef.current);
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(burstTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const actions = {
    plant: (plot: number, species: SpeciesId) => run((s) => plantSeed(s, plot, species)),
    water: (plot: number) => run((s) => waterPlot(s, plot)),
    harvest: (plot: number) => run((s) => harvestPlot(s, plot)),
    fertilize: (plot: number, fertilizer: FertilizerId) =>
      run((s) => applyFertilizer(s, plot, fertilizer)),
    sell: (species: SpeciesId) => run((s) => sellSpecies(s, species)),
    sellAll: () => run((s) => sellAll(s)),
    buyFertilizer: (fertilizer: FertilizerId) => run((s) => buyFertilizer(s, fertilizer)),
    buyCapacity: () => run((s) => buyCapacity(s)),
    deliver: (orderId: string) => run((s) => deliverOrder(s, orderId)),
    rename: (name: string) => run((s) => renameGarden(s, name)),
    unlock: (species: SpeciesId) => run((s) => unlockSpecies(s, species)),
    expand: () => run((s) => expandPlots(s)),
    toggleMute: () => run((s) => ({ state: toggleMute(s) })),
    markIntroSeen: () => run((s) => ({ state: markIntroSeen(s) })),
    exportSave: () => {
      try {
        const text = encodeSave(stateRef.current);
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orta-save-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
        toast('Backup exportado. Guarde o arquivo em lugar seguro.', 'good');
      } catch {
        toast('Não foi possível exportar o save neste navegador.', 'bad');
      }
    },
    importSave: (text: string) => {
      const imported = decodeSave(text);
      if (!imported) {
        audio.play('error');
        toast('Esse arquivo não é um save válido do Orta.', 'bad');
        return false;
      }

      // Quem está importando já conhece o jogo: não mostra a introdução de novo.
      const next: GameState = { ...imported, introSeen: true };
      commit(next);
      saveGame(next);
      setBursts({});
      setOffline(null);
      audio.play('unlock');
      toast(`Save importado: ${next.gardenName}.`, 'good');
      return true;
    },
    dismissOffline: () => setOffline(null),
    reset: () => {
      clearSave();
      commit({ ...createInitialState(Date.now()), introSeen: true });
      setBursts({});
      setOffline(null);
      toast('Horta recomeçada. Boa plantação!', 'info');
    },
    toast,
  };

  return { state, actions, bursts, toasts, offline };
}
