import { formatDuration } from '../game/mood';
import { secondsToReady, type PlantState, type PlotState } from '../game/engine';
import { FERTILIZERS, SPECIES, type FertilizerId, type SpeciesId } from '../game/data';
import type { Burst } from '../game/useGame';
import { FertilizerIcon } from './FertilizerIcon';
import { Plant } from './Plant';

export type Tool = 'water' | FertilizerId | SpeciesId;

interface PlotProps {
  index: number;
  plot: PlotState;
  tool: Tool;
  lockedCost: number | null;
  burst?: Burst;
  onPlant: (index: number, species: SpeciesId) => void;
  onWater: (index: number) => void;
  onHarvest: (index: number) => void;
  onFertilize: (index: number, fertilizer: FertilizerId) => void;
  onLocked: () => void;
}

function isFertilizerTool(tool: Tool): tool is FertilizerId {
  return tool === 'growth' || tool === 'retention';
}

function Droplet({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.2c3.4 4 6.2 7 6.2 10.2A6.2 6.2 0 0 1 12 19.6a6.2 6.2 0 0 1-6.2-6.2C5.8 10.2 8.6 7.2 12 3.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MoistureMeter({ plant }: { plant: PlantState }) {
  const moisture = plant.moisture;
  const tone = moisture > 0.4 ? 'wet' : moisture > 0.08 ? 'damp' : 'dry';
  return (
    <span className={`moisture moisture-${tone}`} title={`Umidade ${Math.round(moisture * 100)}%`}>
      <Droplet className="moisture-drop" />
      <span className="moisture-track">
        <span className="moisture-fill" style={{ width: `${Math.max(3, moisture * 100)}%` }} />
      </span>
    </span>
  );
}

function FertilizerMark({ id }: { id: FertilizerId }) {
  const fertilizer = FERTILIZERS[id];
  return (
    <span
      className={`plot-fert is-${id}`}
      title={`Fertilizante: ${fertilizer.name} — ${fertilizer.description}`}
    >
      <FertilizerIcon id={id} />
    </span>
  );
}

function BurstFx({ burst }: { burst: Burst }) {
  if (burst.kind === 'water') {
    return (
      <span className="fx fx-water" key={burst.id} aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={index}
            className="droplet"
            style={{ left: `${8 + index * 11.5}%`, animationDelay: `${index * 35}ms` }}
          />
        ))}
        <span className="splash" />
      </span>
    );
  }
  if (burst.kind === 'harvest') {
    return (
      <span className="fx fx-harvest" key={burst.id} aria-hidden="true">
        <span className="coin-float">+{burst.amount ?? 1}</span>
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className="leaf-bit"
            style={{
              left: `${30 + index * 11}%`,
              animationDelay: `${index * 60}ms`,
              transform: `rotate(${index * 34}deg)`,
            }}
          />
        ))}
      </span>
    );
  }
  if (burst.kind === 'fertilize') {
    return (
      <span className="fx fx-plant" key={burst.id} aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <span
            key={index}
            className="dust dust-fert"
            style={{ left: `${26 + index * 8}%`, animationDelay: `${index * 40}ms` }}
          />
        ))}
      </span>
    );
  }
  return (
    <span className="fx fx-plant" key={burst.id} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className="dust"
          style={{ left: `${38 + index * 6}%`, animationDelay: `${index * 45}ms` }}
        />
      ))}
    </span>
  );
}

export function Plot({
  index,
  plot,
  tool,
  lockedCost,
  burst,
  onPlant,
  onWater,
  onHarvest,
  onFertilize,
  onLocked,
}: PlotProps) {
  const plant = plot.plant;
  const species = plant ? SPECIES[plant.species] : null;
  const ready = Boolean(plant && plant.growth >= 1);
  const dry = Boolean(plant && plant.growth < 1 && plant.moisture < 0.06);
  const empty = plot.unlocked && !plant;
  const fertilizerTool = isFertilizerTool(tool);

  const handleClick = () => {
    if (!plot.unlocked) {
      onLocked();
      return;
    }
    if (plant) {
      if (ready) onHarvest(index);
      else onWater(index);
      return;
    }
    if (tool === 'water') {
      onWater(index);
      return;
    }
    if (isFertilizerTool(tool)) {
      onFertilize(index, tool);
      return;
    }
    onPlant(index, tool);
  };

  const label = !plot.unlocked
    ? 'Canteiro bloqueado. Abrir a loja para expandir a horta.'
    : plant
      ? `${species?.name}: ${Math.round(plant.growth * 100)}% de crescimento, umidade ${Math.round(
          plant.moisture * 100
        )}%.${plant.fertilizer ? ` Com ${FERTILIZERS[plant.fertilizer].name}.` : ''} ${
          ready ? 'Pronto para colher.' : 'Clique para regar.'
        }`
      : plot.fertilizer
        ? `Canteiro vazio com ${FERTILIZERS[plot.fertilizer].name}. Escolha uma semente e plante.`
        : fertilizerTool
          ? `Canteiro vazio. Aplicar ${FERTILIZERS[tool].name} antes de plantar.`
          : 'Canteiro vazio. Plante uma semente.';

  return (
    <button
      type="button"
      className={[
        'plot',
        !plot.unlocked ? 'is-locked' : '',
        empty ? 'is-empty' : '',
        plot.fertilizer ? 'is-fertilized' : '',
        ready ? 'is-ready' : '',
        dry ? 'is-thirsty' : '',
        tool === 'water' ? 'tool-water' : fertilizerTool ? 'tool-fert' : 'tool-seed',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <span className="plot-soil" />
      <span className="plot-rim" />

      {!plot.unlocked ? (
        <span className="plot-locked">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 10V8a5 5 0 0 1 10 0v2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="4.5" y="10" width="15" height="10" rx="2.6" fill="currentColor" />
          </svg>
          <span className="plot-locked-text">novo canteiro</span>
          {lockedCost ? (
            <span className="plot-locked-cost">
              <i className="coin-dot" />
              {lockedCost}
            </span>
          ) : null}
        </span>
      ) : plant && species ? (
        <>
          <span className="plant-wrap">
            <Plant
              species={plant.species}
              growth={plant.growth}
              moisture={plant.moisture}
              ready={ready}
            />
          </span>
          {plant.fertilizer ? <FertilizerMark id={plant.fertilizer} /> : null}
          {ready ? <span className="ready-tag">colher</span> : null}
          {!ready ? (
            <span className="plot-time">{formatDuration(secondsToReady(plant))}</span>
          ) : null}
          {!ready ? <MoistureMeter plant={plant} /> : null}
          {dry ? <span className="thirst-badge">sede</span> : null}
        </>
      ) : (
        <span className="plot-empty">
          {plot.fertilizer ? (
            <FertilizerIcon id={plot.fertilizer} className="plot-empty-fert" />
          ) : (
            <span className="plot-plus" aria-hidden="true">
              +
            </span>
          )}
          <span className="plot-empty-text">
            {plot.fertilizer
              ? FERTILIZERS[plot.fertilizer].short
              : tool === 'water'
                ? 'regador'
                : fertilizerTool
                  ? 'adubar'
                  : 'plantar'}
          </span>
        </span>
      )}

      {burst ? <BurstFx burst={burst} /> : null}
    </button>
  );
}
