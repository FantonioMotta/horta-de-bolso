import {
  FERTILIZERS,
  FERTILIZER_ORDER,
  SPECIES,
  type FertilizerId,
  type SpeciesId,
} from '../game/data';
import { FertilizerIcon } from './FertilizerIcon';
import { Plant } from './Plant';
import type { Tool } from './Plot';

interface TrayProps {
  unlocked: SpeciesId[];
  coins: number;
  tool: Tool;
  nextLocked: SpeciesId | null;
  fertilizerStock: Record<FertilizerId, number>;
  onSelect: (tool: Tool) => void;
  onOpenShop: () => void;
}

function WateringCan() {
  return (
    <svg className="can" viewBox="0 0 48 40" aria-hidden="true">
      <path
        d="M14 13h20a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5Z"
        fill="#8fb8b2"
      />
      <path d="M14 13h20a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5Z" fill="#a8ccc4" opacity=".45" />
      <path d="M12 17 4 9" stroke="#7da7a1" strokeWidth="4" strokeLinecap="round" />
      <path d="M4 9 2 7" stroke="#7da7a1" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 15c6 0 8 4 8 9" stroke="#7da7a1" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M13 13c0-4 2-6 5-6s5 2 5 6" stroke="#7da7a1" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="24" rx="7" ry="4" fill="#d7ece6" opacity=".55" />
    </svg>
  );
}

export function Tray({
  unlocked,
  coins,
  tool,
  nextLocked,
  fertilizerStock,
  onSelect,
  onOpenShop,
}: TrayProps) {
  return (
    <footer className="tray">
      <button
        type="button"
        className={`tool-card${tool === 'water' ? ' is-active' : ''}`}
        onClick={() => onSelect('water')}
        aria-pressed={tool === 'water'}
        title="Regador (W)"
      >
        <span className="tool-art">
          <WateringCan />
        </span>
        <span className="tool-meta">
          <span className="tool-name">Regar</span>
          <span className="tool-hint">clique na terra</span>
        </span>
        <kbd>W</kbd>
      </button>

      {FERTILIZER_ORDER.map((id) => {
        const fertilizer = FERTILIZERS[id];
        const stock = fertilizerStock[id];
        const selected = tool === id;
        return (
          <button
            key={id}
            type="button"
            className={`tool-card tool-fert${selected ? ' is-active' : ''}${
              stock <= 0 ? ' is-empty-stock' : ''
            }`}
            onClick={() => (stock > 0 ? onSelect(id) : onOpenShop())}
            aria-pressed={selected}
            title={
              stock > 0
                ? `${fertilizer.name} (${fertilizer.key}) — ${fertilizer.description}`
                : `${fertilizer.name} esgotado. Compre na loja.`
            }
          >
            <span className={`tool-art tool-art-${id}`}>
              <FertilizerIcon id={id} className="fert-icon" />
            </span>
            <span className="tool-meta">
              <span className="tool-name">{fertilizer.name}</span>
              <span className="tool-hint">
                {stock > 0 ? 'antes da semente' : 'comprar na loja'}
              </span>
            </span>
            <span className="tool-count" aria-label={`${stock} no estoque`}>
              {stock}
            </span>
            <kbd>{fertilizer.key}</kbd>
          </button>
        );
      })}

      <div className="seed-strip" role="group" aria-label="Sementes">
        {unlocked.map((id) => {
          const species = SPECIES[id];
          const selected = tool === id;
          const affordable = coins >= species.seedCost;
          return (
            <button
              key={id}
              type="button"
              className={`seed-card${selected ? ' is-active' : ''}${affordable ? '' : ' is-pricey'}`}
              onClick={() => onSelect(id)}
              aria-pressed={selected}
              title={`${species.name} — ${species.seedCost} moedas (${species.key})`}
            >
              <span className="seed-art">
                <Plant species={id} growth={0.92} moisture={1} ready={false} />
              </span>
              <span className="seed-meta">
                <span className="seed-name">{species.name}</span>
                <span className="seed-price">
                  <i className="coin-dot" />
                  {species.seedCost}
                </span>
              </span>
              <kbd>{species.key}</kbd>
            </button>
          );
        })}

        {nextLocked ? (
          <button
            type="button"
            className="seed-card seed-locked"
            onClick={onOpenShop}
            title={`${SPECIES[nextLocked].name} ainda está bloqueada. Abra a loja.`}
          >
            <span className="seed-art seed-art-locked">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 10V8a4 4 0 0 1 8 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <rect x="5" y="10" width="14" height="9.5" rx="2.4" fill="currentColor" />
              </svg>
            </span>
            <span className="seed-meta">
              <span className="seed-name">{SPECIES[nextLocked].name}</span>
              <span className="seed-price seed-price-lock">na loja</span>
            </span>
          </button>
        ) : null}
      </div>
    </footer>
  );
}
