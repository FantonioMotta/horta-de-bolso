import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  FERTILIZERS,
  FERTILIZER_ORDER,
  SPECIES,
  SPECIES_ORDER,
  type FertilizerId,
  type SpeciesId,
} from '../game/data';
import { inventoryTotal, type GameState } from '../game/engine';
import { decodeSave } from '../game/storage';
import { FertilizerIcon } from './FertilizerIcon';
import { Plant } from './Plant';

interface ShopProps {
  open: boolean;
  state: GameState;
  nextTier: { plots: number; cost: number } | null;
  nextCapacity: { capacity: number; cost: number } | null;
  onClose: () => void;
  onUnlock: (species: SpeciesId) => void;
  onExpand: () => void;
  onBuyCapacity: () => void;
  onBuyFertilizer: (fertilizer: FertilizerId) => void;
  onExport: () => void;
  onImport: (text: string) => boolean;
  onReset: () => void;
}

export function Shop({
  open,
  state,
  nextTier,
  nextCapacity,
  onClose,
  onUnlock,
  onExpand,
  onBuyCapacity,
  onBuyFertilizer,
  onExport,
  onImport,
  onReset,
}: ShopProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingSave, setPendingSave] = useState<{
    name: string;
    text: string;
    gardenName: string;
    coins: number;
  } | null>(null);
  const [saveError, setSaveError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setPendingSave(null);
      setSaveError('');
    }
  }, [open]);

  if (!open) return null;

  const stored = inventoryTotal(state);

  const handleSaveFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setSaveError('');
    if (file.size > 2_000_000) {
      setPendingSave(null);
      setSaveError('Esse arquivo é grande demais para ser um save do Horta de Bolso.');
      return;
    }

    try {
      const text = await file.text();
      if (!text.trim()) {
        setPendingSave(null);
        setSaveError('O arquivo escolhido está vazio.');
        return;
      }
      const imported = decodeSave(text);
      if (!imported) {
        setPendingSave(null);
        setSaveError('Esse arquivo não é um save válido do Horta de Bolso.');
        return;
      }
      setPendingSave({
        name: file.name,
        text,
        gardenName: imported.gardenName,
        coins: imported.coins,
      });
    } catch {
      setPendingSave(null);
      setSaveError('Não foi possível ler o arquivo escolhido.');
    }
  };

  const confirmImport = () => {
    if (!pendingSave) return;
    if (onImport(pendingSave.text)) {
      setPendingSave(null);
      setSaveError('');
      onClose();
    } else {
      setSaveError('Save inválido ou corrompido. Sua horta atual não foi alterada.');
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grip" aria-hidden="true" />
        <header className="sheet-header">
          <div>
            <h2 id="shop-title">Loja da horta</h2>
            <p>Sementes, fertilizantes e mais espaço para guardar.</p>
          </div>
          <button type="button" className="icon-button sheet-close" onClick={onClose} aria-label="Fechar loja">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="sheet-body">
          <section className="shop-section">
            <h3>Sementes</h3>
            <div className="shop-list">
              {SPECIES_ORDER.map((id) => {
                const species = SPECIES[id];
                const unlocked = state.unlocked.includes(id);
                const affordable = state.coins >= species.unlockCost;

                return (
                  <div key={id} className={`shop-row${unlocked ? ' is-owned' : ''}`}>
                    <span className="shop-art">
                      <Plant species={id} growth={0.95} moisture={1} ready={false} />
                    </span>
                    <span className="shop-info">
                      <span className="shop-name">
                        {species.name}
                        {unlocked ? <span className="owned-tag">liberada</span> : null}
                      </span>
                      <span className="shop-hint">{species.hint}</span>
                      <span className="shop-numbers">
                        <span>
                          semente <i className="coin-dot" />
                          {species.seedCost}
                        </span>
                        <span className="shop-dot">·</span>
                        <span>
                          vende por <i className="coin-dot" />
                          {species.sellPrice}
                        </span>
                      </span>
                    </span>
                    {unlocked ? (
                      <span className="shop-ready">✓</span>
                    ) : (
                      <button
                        type="button"
                        className="buy-button"
                        onClick={() => onUnlock(id)}
                        disabled={!affordable}
                        title={affordable ? `Liberar ${species.name}` : 'Moedas insuficientes'}
                      >
                        <i className="coin-dot" />
                        {species.unlockCost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="shop-section">
            <h3>Fertilizantes</h3>
            <div className="shop-list">
              {FERTILIZER_ORDER.map((id) => {
                const fertilizer = FERTILIZERS[id];
                const stock = state.fertilizerStock[id];
                const affordable = state.coins >= fertilizer.price;
                return (
                  <div key={id} className="shop-row is-owned">
                    <span className={`shop-art shop-art-fert shop-art-${id}`}>
                      <FertilizerIcon id={id} />
                    </span>
                    <span className="shop-info">
                      <span className="shop-name">
                        {fertilizer.name}
                        <span className="owned-tag">estoque {stock}</span>
                      </span>
                      <span className="shop-hint">{fertilizer.description}</span>
                      <span className="shop-numbers">
                        <span>aplicar antes da semente</span>
                        <span className="shop-dot">·</span>
                        <span>tecla {fertilizer.key}</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      className="buy-button"
                      onClick={() => onBuyFertilizer(id)}
                      disabled={!affordable}
                      title={affordable ? `Comprar ${fertilizer.name}` : 'Moedas insuficientes'}
                    >
                      <i className="coin-dot" />
                      {fertilizer.price}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="shop-section">
            <h3>Sacola</h3>
            <div className="expand-card">
              <div className="expand-info">
                <span className="expand-count">
                  {stored} de {state.capacity} lugares
                </span>
                <span className="expand-hint">
                  {nextCapacity
                    ? `Amplie para ${nextCapacity.capacity} e guarde mais colheitas.`
                    : 'Sua sacola já está no tamanho máximo.'}
                </span>
              </div>
              {nextCapacity ? (
                <button
                  type="button"
                  className="buy-button"
                  onClick={onBuyCapacity}
                  disabled={state.coins < nextCapacity.cost}
                >
                  <i className="coin-dot" />
                  {nextCapacity.cost}
                </button>
              ) : (
                <span className="shop-ready">completa</span>
              )}
            </div>
            <div className="inv-dots" aria-hidden="true">
              {Array.from(
                { length: nextCapacity ? nextCapacity.capacity : state.capacity },
                (_, index) => (
                  <span
                    key={index}
                    className={index < stored ? 'is-filled' : index < state.capacity ? 'is-room' : ''}
                  />
                )
              )}
            </div>
          </section>

          <section className="shop-section">
            <h3>Canteiros</h3>
            <div className="expand-card">
              <div className="expand-info">
                <span className="expand-count">
                  {state.plots.length} canteiros
                </span>
                <span className="expand-hint">
                  {nextTier
                    ? `Amplie para ${nextTier.plots} e plante mais de uma vez.`
                    : 'Sua horta já está no tamanho máximo.'}
                </span>
              </div>
              {nextTier ? (
                <button
                  type="button"
                  className="buy-button"
                  onClick={onExpand}
                  disabled={state.coins < nextTier.cost}
                >
                  <i className="coin-dot" />
                  {nextTier.cost}
                </button>
              ) : (
                <span className="shop-ready">completa</span>
              )}
            </div>
            <div className="plot-dots" aria-hidden="true">
              {Array.from({ length: nextTier ? nextTier.plots : state.plots.length }, (_, index) => (
                <span key={index} className={index < state.plots.length ? 'is-on' : ''} />
              ))}
            </div>
          </section>

          <section className="shop-section shop-stats">
            <h3>Seu caderno</h3>
            <div className="stats-grid">
              <div>
                <strong>{state.stats.harvested}</strong>
                <span>colheitas</span>
              </div>
              <div>
                <strong>{state.stats.planted}</strong>
                <span>sementes</span>
              </div>
              <div>
                <strong>{state.stats.watered}</strong>
                <span>regas</span>
              </div>
              <div>
                <strong>{state.stats.earned}</strong>
                <span>moedas ganhas</span>
              </div>
              <div>
                <strong>{state.stats.sold}</strong>
                <span>itens vendidos</span>
              </div>
              <div>
                <strong>{state.stats.orders}</strong>
                <span>pedidos entregues</span>
              </div>
            </div>
          </section>

          <section className="shop-section">
            <h3>Backup do progresso</h3>
            <div className="save-card">
              <div className="save-info">
                <span className="save-title">Leve sua horta com você</span>
                <span className="save-hint">
                  Exporte um arquivo para guardar ou abrir em outro navegador.
                </span>
              </div>
              <div className="save-actions">
                <button type="button" className="ghost-button" onClick={onExport}>
                  Exportar save
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => fileInput.current?.click()}
                >
                  Importar save
                </button>
              </div>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              className="save-file-input"
              onChange={handleSaveFile}
              tabIndex={-1}
              aria-hidden="true"
            />

            {pendingSave ? (
              <div className="save-confirm">
                <p>
                  Importar <strong>{pendingSave.name}</strong>? A horta atual será substituída por{' '}
                  <strong>“{pendingSave.gardenName}”</strong> com {pendingSave.coins} moedas.
                </p>
                <div className="reset-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setPendingSave(null);
                      setSaveError('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="button" className="danger-button" onClick={confirmImport}>
                    Substituir horta
                  </button>
                </div>
              </div>
            ) : null}

            {saveError ? <p className="save-error">{saveError}</p> : null}

            <p className="shop-note">
              O jogo salva neste navegador. O arquivo exportado contém seu progresso e pode ser
              importado em outro dispositivo.
            </p>
          </section>

          <section className="shop-section shop-footer">
            {confirmReset ? (
              <div className="reset-confirm">
                <p>Isso apaga sua horta e recomeça do zero. Tem certeza?</p>
                <div className="reset-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => {
                      setConfirmReset(false);
                      onReset();
                    }}
                  >
                    Recomeçar
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="text-button" onClick={() => setConfirmReset(true)}>
                Recomeçar a horta
              </button>
            )}
            <p className="shop-note">
              O progresso é salvo neste navegador. A horta continua crescendo com a janela fechada.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
