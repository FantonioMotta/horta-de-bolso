import type { CSSProperties } from 'react';
import { plotColumns, type FertilizerId, type SpeciesId } from '../game/data';
import type { PlotState } from '../game/engine';
import type { Burst } from '../game/useGame';
import { Plot, type Tool } from './Plot';

function Tuft({ className }: { className: string }) {
  return (
    <svg className={`tuft ${className}`} viewBox="0 0 44 30" aria-hidden="true">
      <path d="M22 30C20 20 15 12 7 7c5 9 7 15 9 23Z" fill="#4f6b2f" />
      <path d="M22 30C22 18 22 11 20 3c4 8 4 16 4 27Z" fill="#86a03e" />
      <path d="M23 30c1-10 5-17 13-22-4 9-7 15-8 22Z" fill="#6a8536" />
      <path d="M23 30c2-7 7-11 14-13-4 6-8 9-11 13Z" fill="#98ad4d" opacity=".8" />
    </svg>
  );
}

interface GardenProps {
  plots: PlotState[];
  tool: Tool;
  bursts: Record<number, Burst>;
  lockedCost: number | null;
  gardenName: string;
  onPlant: (index: number, species: SpeciesId) => void;
  onWater: (index: number) => void;
  onHarvest: (index: number) => void;
  onFertilize: (index: number, fertilizer: FertilizerId) => void;
  onLocked: () => void;
}

export function Garden({
  plots,
  tool,
  bursts,
  lockedCost,
  gardenName,
  onPlant,
  onWater,
  onHarvest,
  onFertilize,
  onLocked,
}: GardenProps) {
  const cols = plotColumns(plots.length);
  const dense = plots.length > 8;
  const style = { '--cols': cols } as CSSProperties;

  return (
    <div className="garden">
      <div className={`garden-bed${dense ? ' is-dense' : ''}`} style={style}>
        <div className="bed-frame">
          <div className="bed-soil">
            <div className="plots">
              {plots.map((plot, index) => (
                <Plot
                  key={index}
                  index={index}
                  plot={plot}
                  tool={tool}
                  lockedCost={lockedCost}
                  burst={bursts[index]}
                  onPlant={onPlant}
                  onWater={onWater}
                  onHarvest={onHarvest}
                  onFertilize={onFertilize}
                  onLocked={onLocked}
                />
              ))}
            </div>
          </div>

          <span className="bed-plank plank-left" />
          <span className="bed-plank plank-right" />
          <span className="bed-plank plank-top" />
          <span className="bed-plank plank-bottom" />

          <div className="bed-sign" title={gardenName}>
            <span>{gardenName}</span>
          </div>
        </div>

        <Tuft className="tuft-1" />
        <Tuft className="tuft-2" />
        <Tuft className="tuft-3" />
        <Tuft className="tuft-4" />
        <Tuft className="tuft-5" />
        <Tuft className="tuft-6" />

        <span className="bed-stone stone-1" aria-hidden="true" />
        <span className="bed-stone stone-2" aria-hidden="true" />
        <span className="bed-stone stone-3" aria-hidden="true" />
      </div>
    </div>
  );
}
