import { coopAnimalTotal, coopTier, type CoopState } from '../game/coop';
import { ChickenArt, ChickArt, CoopHouseArt, EggArt } from './CoopArt';

const ADULT_SPOTS = [
  { left: 44, top: 70, scale: 1 },
  { left: 58, top: 62, scale: 0.9 },
  { left: 72, top: 72, scale: 1.04 },
  { left: 87, top: 64, scale: 0.88 },
  { left: 49, top: 86, scale: 0.94 },
  { left: 64, top: 88, scale: 1.06 },
  { left: 79, top: 86, scale: 0.9 },
  { left: 94, top: 78, scale: 0.98 },
  { left: 38, top: 80, scale: 0.86 },
  { left: 55, top: 76, scale: 0.82 },
  { left: 70, top: 82, scale: 0.78 },
  { left: 84, top: 95, scale: 0.9 },
  { left: 97, top: 90, scale: 0.82 },
  { left: 40, top: 93, scale: 0.8 },
] as const;

const CHICK_SPOTS = [
  { left: 33, top: 94, scale: 0.8 },
  { left: 40, top: 97, scale: 0.74 },
  { left: 47, top: 94, scale: 0.78 },
  { left: 54, top: 97, scale: 0.72 },
  { left: 61, top: 94, scale: 0.76 },
  { left: 68, top: 97, scale: 0.7 },
] as const;

interface CoopProps {
  coop: CoopState;
  onOpenSheet: () => void;
}

export function Coop({ coop, onOpenSheet }: CoopProps) {
  const tier = coopTier(coop);
  const adults = coopAnimalTotal(coop);
  const chickens = Array.from({ length: coop.chickens }, (_, index) => index);
  const roosters = Array.from({ length: coop.roosters }, (_, index) => index);
  const showEggs = Math.min(coop.eggs, 3);

  return (
    <div className="coop">
      <div className="coop-yard">
        <div className="coop-grass" aria-hidden="true" />
        <div className="coop-fence" aria-hidden="true" />

        <button
          type="button"
          className="coop-house"
          onClick={onOpenSheet}
          title="Abrir o galinheiro"
          aria-label="Abrir o galinheiro"
        >
          <CoopHouseArt />
          <span className="coop-house-label">Galinheiro</span>
        </button>

        <div className={`coop-nest${coop.eggs > 0 ? ' has-eggs' : ''}`}>
          <div className="coop-nest-art" aria-hidden="true">
            {showEggs > 0 ? (
              Array.from({ length: showEggs }, (_, index) => (
                <EggArt key={index} className="coop-nest-egg" />
              ))
            ) : (
              <span className="coop-nest-empty">ninho vazio</span>
            )}
          </div>
          <span className="coop-nest-count">
            {coop.eggs}
            <small>/{tier.eggs}</small>
          </span>
        </div>

        <div className="coop-birds" aria-hidden="true">
          {chickens.map((index) => {
            const spot = ADULT_SPOTS[index % ADULT_SPOTS.length];
            return (
              <span
                key={`hen-${index}`}
                className="coop-bird"
                style={{
                  left: `${spot.left}%`,
                  top: `${spot.top}%`,
                  width: `${58 * spot.scale}px`,
                }}
              >
                <span
                  className="coop-bird-inner"
                  style={{ animationDelay: `${(index % 5) * -0.7}s` }}
                >
                  <ChickenArt kind="chicken" variant={index} flip={index % 2 === 0} />
                </span>
              </span>
            );
          })}

          {roosters.map((index) => {
            const spot = ADULT_SPOTS[(index + 6) % ADULT_SPOTS.length];
            return (
              <span
                key={`rooster-${index}`}
                className="coop-bird is-rooster"
                style={{
                  left: `${spot.left}%`,
                  top: `${spot.top}%`,
                  width: `${64 * spot.scale}px`,
                }}
              >
                <span
                  className="coop-bird-inner"
                  style={{ animationDelay: `${(index % 4) * -0.9}s` }}
                >
                  <ChickenArt kind="rooster" variant={index} flip={index % 2 === 1} />
                </span>
              </span>
            );
          })}

          {coop.chicks.map((chick, index) => {
            const spot = CHICK_SPOTS[index % CHICK_SPOTS.length];
            return (
              <span
                key={`chick-${chick.id}`}
                className="coop-bird is-chick"
                style={{
                  left: `${spot.left}%`,
                  top: `${spot.top}%`,
                  width: `${40 * spot.scale}px`,
                }}
              >
                <span
                  className="coop-bird-inner is-hoppy"
                  style={{ animationDelay: `${index * -0.45}s` }}
                >
                  <ChickArt />
                </span>
              </span>
            );
          })}
        </div>

        {adults === 0 ? (
          <div className="coop-empty">
            <strong>
              {coop.chicks.length > 0 ? 'Seus pintinhos estão crescendo' : 'O galinheiro está vazio'}
            </strong>
            <span>
              {coop.chicks.length > 0
                ? 'Em alguns minutos eles viram adultos e começam a pôr ovos.'
                : 'Compre a primeira galinha para começar a recolher ovos.'}
            </span>
            {coop.chicks.length === 0 ? (
              <button type="button" className="primary-button coop-empty-button" onClick={onOpenSheet}>
                Abrir galinheiro
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
