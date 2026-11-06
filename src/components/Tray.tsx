import { useEffect, useRef, useState, type WheelEvent } from 'react';
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

/** Ferramentas que ocupam o slot da hotbar. Sementes ficam na tira ao lado. */
type ToolId = 'water' | FertilizerId;

const TOOL_ORDER: ToolId[] = ['water', ...FERTILIZER_ORDER];

function isToolId(value: Tool): value is ToolId {
  return value === 'water' || value === 'growth' || value === 'retention';
}

function toolName(id: ToolId): string {
  return id === 'water' ? 'Regar' : FERTILIZERS[id].name;
}

function toolHint(id: ToolId): string {
  return id === 'water' ? 'clique na terra' : 'antes da semente';
}

function toolKey(id: ToolId): string {
  return id === 'water' ? 'W' : FERTILIZERS[id].key;
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

function ToolIcon({ id }: { id: ToolId }) {
  if (id === 'water') return <WateringCan />;
  return <FertilizerIcon id={id} className="fert-icon" />;
}

function ToolArt({ id, className = '' }: { id: ToolId; className?: string }) {
  return (
    <span className={`${className}${id === 'water' ? '' : ` tool-art-${id}`}`.trim()}>
      <ToolIcon id={id} />
    </span>
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
  const [open, setOpen] = useState(false);
  const [lastTool, setLastTool] = useState<ToolId>('water');
  const slotRef = useRef<HTMLDivElement>(null);
  const activeTool = isToolId(tool) ? tool : null;
  const shown = activeTool ?? lastTool;

  useEffect(() => {
    if (activeTool) setLastTool(activeTool);
  }, [activeTool]);

  // Ao trocar de ferramenta por atalho ou clique, a caixa fecha.
  useEffect(() => {
    setOpen(false);
  }, [tool]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!slotRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.currentTarget.scrollLeft += event.deltaY;
    }
  };

  const pick = (id: ToolId) => {
    setOpen(false);
    if (id !== 'water' && fertilizerStock[id] <= 0) {
      onOpenShop();
      return;
    }
    onSelect(id);
  };

  const shownStock = shown === 'water' ? null : fertilizerStock[shown];

  return (
    <footer className="tray">
      <div className="tool-slot" ref={slotRef}>
        <button
          type="button"
          className={`tool-card tool-current${activeTool ? ' is-active' : ''}${open ? ' is-open' : ''}`}
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={open}
          title={`Ferramentas — ${toolName(shown)} (${toolKey(shown)})`}
        >
          <ToolArt id={shown} className="tool-art" />
          <span className="tool-meta">
            <span className="tool-name">{toolName(shown)}</span>
            <span className="tool-hint">
              {activeTool ? toolHint(shown) : 'toque para escolher'}
            </span>
          </span>
          {shownStock !== null ? (
            <span
              className={`tool-count${shownStock > 0 ? '' : ' is-zero'}`}
              aria-label={`${shownStock} no estoque`}
            >
              {shownStock}
            </span>
          ) : null}
          <span className="tool-caret" aria-hidden="true">
            <svg viewBox="0 0 12 8">
              <path
                d="m1 1.5 5 5 5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {open ? (
          <div className="tool-menu" role="menu" aria-label="Escolher ferramenta">
            {TOOL_ORDER.map((id) => {
              const stock = id === 'water' ? null : fertilizerStock[id];
              const empty = stock !== null && stock <= 0;
              return (
                <button
                  key={id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={activeTool === id}
                  className={`tool-option${activeTool === id ? ' is-active' : ''}${
                    empty ? ' is-empty-stock' : ''
                  }`}
                  onClick={() => pick(id)}
                >
                  <ToolArt id={id} className="tool-option-art" />
                  <span className="tool-option-meta">
                    <span className="tool-option-name">{toolName(id)}</span>
                    <span className="tool-option-hint">
                      {stock === null
                        ? toolHint(id)
                        : stock > 0
                          ? `${stock} no estoque`
                          : 'comprar na loja'}
                    </span>
                  </span>
                  <kbd>{toolKey(id)}</kbd>
                  {activeTool === id ? (
                    <svg className="tool-option-check" viewBox="0 0 16 16" aria-hidden="true">
                      <path
                        d="m3 8.5 3.2 3.2L13 5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div
        className="seed-strip"
        role="group"
        aria-label="Sementes — role para o lado para ver todas"
        tabIndex={0}
        onWheel={handleWheel}
      >
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
