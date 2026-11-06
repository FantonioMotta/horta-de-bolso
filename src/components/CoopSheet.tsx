import {
  ANIMALS,
  CHICK_PRICE,
  CHICK_SECONDS,
  EGG_PRICE,
  HATCH_EGG_COST,
  MAX_CHICKS,
  coopAnimalTotal,
  coopProduction,
  coopTier,
  nextCoopTier,
  type AnimalKind,
  type CoopState,
} from '../game/coop';
import { formatCountdown } from '../game/mood';
import { ChickArt, ChickenArt, EggArt } from './CoopArt';

interface CoopSheetProps {
  open: boolean;
  coop: CoopState;
  coins: number;
  onClose: () => void;
  onBuy: (kind: AnimalKind) => void;
  onSell: (kind: AnimalKind) => void;
  onSellEggs: () => void;
  onHatch: () => void;
  onSellChick: (id: number) => void;
  onExpand: () => void;
}

const ANIMAL_ORDER: AnimalKind[] = ['chicken', 'rooster'];

export function CoopSheet({
  open,
  coop,
  coins,
  onClose,
  onBuy,
  onSell,
  onSellEggs,
  onHatch,
  onSellChick,
  onExpand,
}: CoopSheetProps) {
  if (!open) return null;

  const tier = coopTier(coop);
  const next = nextCoopTier(coop);
  const adults = coopAnimalTotal(coop);
  const perMinute = coopProduction(coop);
  const now = Date.now();
  const hasRoom = adults < tier.animals;
  const canHatch = coop.roosters > 0 && coop.eggs >= HATCH_EGG_COST && coop.chicks.length < MAX_CHICKS;

  const hatchHint =
    coop.roosters <= 0
      ? 'Coloque um galo no galinheiro para chocar os ovos.'
      : coop.eggs < HATCH_EGG_COST
        ? `Junte ${HATCH_EGG_COST} ovos no ninho para chocar.`
        : coop.chicks.length >= MAX_CHICKS
          ? 'Pintinhos demais crescendo. Espere ou venda algum.'
          : `Consome ${HATCH_EGG_COST} ovos e leva ${Math.round(CHICK_SECONDS / 60)} minutos para crescer.`;

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet coop-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coop-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grip" aria-hidden="true" />
        <header className="sheet-header">
          <div>
            <h2 id="coop-title">Galinheiro</h2>
            <p>
              {adults} de {tier.animals} moradores · ninho com {coop.eggs} de {tier.eggs} ovos
            </p>
          </div>
          <button
            type="button"
            className="icon-button sheet-close"
            onClick={onClose}
            aria-label="Fechar galinheiro"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="sheet-body">
          <div className="coop-summary">
            <div className="coop-summary-item">
              <ChickenArt kind="chicken" variant={0} className="coop-summary-icon" />
              <strong>{coop.chickens}</strong>
              <span>galinhas</span>
            </div>
            <div className="coop-summary-item">
              <ChickenArt kind="rooster" variant={1} className="coop-summary-icon" />
              <strong>{coop.roosters}</strong>
              <span>galos</span>
            </div>
            <div className="coop-summary-item">
              <EggArt className="coop-summary-icon coop-summary-egg" />
              <strong>{coop.eggs}</strong>
              <span>ovos</span>
            </div>
            <div className="coop-summary-item">
              <ChickArt className="coop-summary-icon" />
              <strong>{coop.chicks.length}</strong>
              <span>pintinhos</span>
            </div>
          </div>

          <section className="shop-section">
            <h3>Moradores</h3>
            <div className="shop-list">
              {ANIMAL_ORDER.map((kind) => {
                const info = ANIMALS[kind];
                const count = kind === 'chicken' ? coop.chickens : coop.roosters;
                const affordable = coins >= info.price;
                return (
                  <div key={kind} className="shop-row is-owned coop-animal-row">
                    <span className="shop-art coop-animal-art">
                      <ChickenArt kind={kind} variant={count} className="coop-animal-svg" />
                    </span>
                    <span className="shop-info">
                      <span className="shop-name">
                        {info.name}
                        <span className="owned-tag">{count} no galinheiro</span>
                      </span>
                      <span className="shop-hint">{info.description}</span>
                      <span className="shop-numbers">
                        <span>
                          compra <i className="coin-dot" />
                          {info.price}
                        </span>
                        <span className="shop-dot">·</span>
                        <span>
                          vende por <i className="coin-dot" />
                          {info.sellPrice}
                        </span>
                      </span>
                    </span>
                    <span className="coop-animal-actions">
                      <button
                        type="button"
                        className="buy-button"
                        onClick={() => onBuy(kind)}
                        disabled={!affordable || !hasRoom}
                        title={
                          !hasRoom
                            ? 'Sem espaço no galinheiro'
                            : affordable
                              ? `Comprar ${info.name}`
                              : 'Moedas insuficientes'
                        }
                      >
                        <i className="coin-dot" />
                        {info.price}
                      </button>
                      {count > 0 ? (
                        <button
                          type="button"
                          className="sell-button coop-sell-button"
                          onClick={() => onSell(kind)}
                          title={`Vender ${info.name} por ${info.sellPrice} moedas`}
                        >
                          Vender
                        </button>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
            {!hasRoom ? (
              <p className="coop-inline-hint">
                O galinheiro está cheio. Amplie o espaço abaixo ou venda um morador.
              </p>
            ) : null}
          </section>

          <section className="shop-section">
            <h3>Ninho</h3>
            <div className="coop-nest-card">
              <div className="coop-nest-line">
                <span className="coop-nest-art-small">
                  <EggArt className="coop-line-art" />
                </span>
                <span className="coop-line-info">
                  <strong>
                    {coop.eggs} de {tier.eggs} ovos
                  </strong>
                  <span>
                    {perMinute > 0
                      ? `Produção de cerca de ${perMinute} ovo${perMinute > 1 ? 's' : ''} por minuto.`
                      : 'Compre uma galinha para começar a produção.'}
                  </span>
                </span>
                <button
                  type="button"
                  className="sell-button"
                  onClick={onSellEggs}
                  disabled={coop.eggs <= 0}
                  title={coop.eggs > 0 ? 'Vender todos os ovos do ninho' : 'O ninho está vazio'}
                >
                  Vender {coop.eggs > 0 ? `+${coop.eggs * EGG_PRICE}` : ''}
                </button>
              </div>

              <div className="coop-nest-line">
                <span className="coop-nest-art-small">
                  <ChickArt className="coop-line-art" />
                </span>
                <span className="coop-line-info">
                  <strong>Chocar um pintinho</strong>
                  <span>{hatchHint}</span>
                </span>
                <button
                  type="button"
                  className="buy-button"
                  onClick={onHatch}
                  disabled={!canHatch}
                  title={canHatch ? 'Chocar 3 ovos' : hatchHint}
                >
                  Chocar
                </button>
              </div>
            </div>
          </section>

          {coop.chicks.length > 0 ? (
            <section className="shop-section">
              <h3>Pintinhos</h3>
              <div className="coop-chick-list">
                {coop.chicks.map((chick) => {
                  const left = Math.max(0, (chick.readyAt - now) / 1000);
                  return (
                    <div key={chick.id} className="coop-chick-row">
                      <span className="coop-chick-art">
                        <ChickArt />
                      </span>
                      <span className="coop-chick-info">
                        <strong>Pintinho</strong>
                        <span>vira adulto em {formatCountdown(left)}</span>
                      </span>
                      <button
                        type="button"
                        className="sell-button"
                        onClick={() => onSellChick(chick.id)}
                        title={`Vender o pintinho por ${CHICK_PRICE} moedas`}
                      >
                        Vender <i className="coin-dot" />
                        {CHICK_PRICE}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="shop-section">
            <h3>Espaço do galinheiro</h3>
            <div className="expand-card">
              <div className="expand-info">
                <span className="expand-count">
                  {adults} de {tier.animals} moradores
                </span>
                <span className="expand-hint">
                  {next
                    ? `Amplie para ${next.animals} moradores e ${next.eggs} lugares no ninho.`
                    : 'Seu galinheiro já está no tamanho máximo.'}
                </span>
              </div>
              {next ? (
                <button
                  type="button"
                  className="buy-button"
                  onClick={onExpand}
                  disabled={coins < next.cost}
                  title={coins >= next.cost ? 'Ampliar o galinheiro' : 'Moedas insuficientes'}
                >
                  <i className="coin-dot" />
                  {next.cost}
                </button>
              ) : (
                <span className="shop-ready">completo</span>
              )}
            </div>
            <div className="plot-dots" aria-hidden="true">
              {Array.from({ length: tier.animals }, (_, index) => (
                <span key={index} className={index < adults ? 'is-on' : ''} />
              ))}
            </div>
          </section>

          <section className="shop-section">
            <h3>Desde o começo</h3>
            <div className="stats-grid coop-stats">
              <div>
                <strong>{coop.stats.eggsLaid}</strong>
                <span>ovos postos</span>
              </div>
              <div>
                <strong>{coop.stats.eggsSold}</strong>
                <span>ovos vendidos</span>
              </div>
              <div>
                <strong>{coop.stats.chicksHatched}</strong>
                <span>pintinhos</span>
              </div>
              <div>
                <strong>{coop.stats.earned}</strong>
                <span>moedas ganhas</span>
              </div>
            </div>
          </section>

          <p className="shop-note">
            As galinhas põem ovos mesmo com a janela fechada e os pintinhos crescem em tempo real.
            Venda os ovos, choque novos moradores ou venda os pintinhos para reinvestir na horta.
          </p>
        </div>
      </div>
    </div>
  );
}
