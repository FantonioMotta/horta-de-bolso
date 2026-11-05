import { SPECIES, SPECIES_ORDER, type SpeciesId } from '../game/data';
import { inventoryTotal, inventoryValue, type GameState } from '../game/engine';
import { Plant } from './Plant';

interface InventorySheetProps {
  open: boolean;
  state: GameState;
  onClose: () => void;
  onSell: (species: SpeciesId) => void;
  onSellAll: () => void;
  onOpenShop: () => void;
}

export function InventorySheet({
  open,
  state,
  onClose,
  onSell,
  onSellAll,
  onOpenShop,
}: InventorySheetProps) {
  if (!open) return null;

  const total = inventoryTotal(state);
  const value = inventoryValue(state);
  const stocked = SPECIES_ORDER.filter((id) => state.inventory[id] > 0);
  const free = Math.max(0, state.capacity - total);
  const full = total >= state.capacity;

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grip" aria-hidden="true" />
        <header className="sheet-header">
          <div>
            <h2 id="inventory-title">Sacola da horta</h2>
            <p>Colheitas guardadas para vender ou entregar nos pedidos.</p>
          </div>
          <button
            type="button"
            className="icon-button sheet-close"
            onClick={onClose}
            aria-label="Fechar sacola"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="sheet-body">
          <div className={`inv-meter${full ? ' is-full' : ''}`}>
            <div className="inv-meter-head">
              <span>
                <strong>{total}</strong> de {state.capacity} lugares
              </span>
              <span>{free === 0 ? 'sacola cheia' : `${free} livre${free > 1 ? 's' : ''}`}</span>
            </div>
            <div className="inv-meter-track">
              <span
                className="inv-meter-fill"
                style={{ width: `${Math.min(100, (total / state.capacity) * 100)}%` }}
              />
            </div>
          </div>

          {stocked.length > 0 ? (
            <div className="inv-list">
              {stocked.map((id) => {
                const species = SPECIES[id];
                const count = state.inventory[id];
                const sale = count * species.sellPrice;
                return (
                  <div key={id} className="inv-row">
                    <span className="inv-art">
                      <Plant species={id} growth={0.95} moisture={1} ready={false} />
                    </span>
                    <span className="inv-info">
                      <span className="inv-name">
                        {species.name}
                        <span className="inv-unit">
                          <i className="coin-dot" />
                          {species.sellPrice} cada
                        </span>
                      </span>
                      <span className="inv-numbers">
                        {count} na sacola · total de <i className="coin-dot" />
                        {sale}
                      </span>
                    </span>
                    <span className="inv-count">×{count}</span>
                    <button
                      type="button"
                      className="sell-button"
                      onClick={() => onSell(id)}
                      title={`Vender ${count}× ${species.name} por ${sale} moedas`}
                    >
                      Vender <i className="coin-dot" />
                      {sale}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="inv-empty">
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <path
                  d="M14 24h36l-3 26a6 6 0 0 1-6 5.2H23a6 6 0 0 1-6-5.2L14 24Z"
                  fill="#e6d6b6"
                  stroke="#b89a63"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <path
                  d="M23 24v-4a9 9 0 0 1 18 0v4"
                  fill="none"
                  stroke="#b89a63"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path d="M25 35c2.5 2.4 4.6 3.6 7 3.6s4.5-1.2 7-3.6" stroke="#c9b184" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <strong>Sua sacola está vazia</strong>
              <span>Colha um pé pronto e ele vem parar aqui.</span>
            </div>
          )}

          <div className="inv-actions">
            <button
              type="button"
              className="primary-button"
              onClick={onSellAll}
              disabled={total === 0}
            >
              {total > 0 ? `Vender tudo · ${value} moedas` : 'Nada para vender'}
            </button>
            <button type="button" className="ghost-button" onClick={onOpenShop}>
              Melhorar sacola
            </button>
          </div>

          <p className="shop-note">
            A colheita não vira moeda sozinha. Venda na sacola ou guarde para cumprir um pedido.
          </p>
        </div>
      </div>
    </div>
  );
}
