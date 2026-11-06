import type { WheelEvent } from 'react';
import {
  CHICK_PRICE,
  CHICK_SECONDS,
  EGG_PRICE,
  HATCH_EGG_COST,
  MAX_CHICKS,
  chickRatio,
  coopAnimalTotal,
  coopLayRatio,
  coopNextEggSeconds,
  coopProduction,
  coopTier,
  type CoopChick,
  type CoopState,
} from '../game/coop';
import { formatCountdown } from '../game/mood';
import { ChickArt, CoopHouseArt, EggArt } from './CoopArt';

interface CoopTrayProps {
  coop: CoopState;
  onSellEggs: () => void;
  onHatch: () => void;
  onOpenSheet: () => void;
}

export function CoopTray({ coop, onSellEggs, onHatch, onOpenSheet }: CoopTrayProps) {
  const tier = coopTier(coop);
  const adults = coopAnimalTotal(coop);
  const canHatch =
    coop.roosters > 0 && coop.eggs >= HATCH_EGG_COST && coop.chicks.length < MAX_CHICKS;
  const perMinute = coopProduction(coop);
  const nestFull = coop.eggs >= tier.eggs;
  const layRatio = coopLayRatio(coop);
  const nextEgg = coopNextEggSeconds(coop);
  const growing = coop.chicks.reduce<CoopChick | null>(
    (nearest, chick) => (!nearest || chick.readyAt < nearest.readyAt ? chick : nearest),
    null
  );
  const chickLeft = growing ? Math.max(0, (growing.readyAt - Date.now()) / 1000) : 0;
  const chickProgress = growing ? chickRatio(growing) : 0;

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.currentTarget.scrollLeft += event.deltaY;
    }
  };

  const hatchHint = !adults
    ? 'compre uma galinha'
    : coop.roosters <= 0
      ? 'precisa de um galo'
      : coop.eggs < HATCH_EGG_COST
        ? `junte ${HATCH_EGG_COST} ovos`
        : coop.chicks.length >= MAX_CHICKS
          ? 'pintinhos demais'
          : `${HATCH_EGG_COST} ovos · ${Math.round(CHICK_SECONDS / 60)} min`;

  const hatchText = growing && !canHatch ? `pintinho em ${formatCountdown(chickLeft)}` : hatchHint;

  const eggHint = coop.eggs > 0
    ? `vender ${coop.eggs} · +${coop.eggs * EGG_PRICE}`
    : perMinute > 0
      ? nestFull
        ? 'ninho cheio'
        : `próximo ovo em ${formatCountdown(nextEgg)}`
      : 'as galinhas ainda vão pôr';

  const eggTitle = nestFull
    ? 'O ninho está cheio. Recolha ou venda os ovos.'
    : coop.chickens > 0
      ? `Próximo ovo em ${formatCountdown(nextEgg)}`
      : 'As galinhas ainda vão pôr ovos';

  return (
    <footer className="tray coop-tray">
      <div
        className="seed-strip coop-strip"
        role="group"
        aria-label="Galinheiro — role para o lado para ver as ações"
        tabIndex={0}
        onWheel={handleWheel}
      >
        <button
          type="button"
          className={`coop-card coop-card-eggs${coop.eggs > 0 ? ' is-ready' : ''}`}
          onClick={coop.eggs > 0 ? onSellEggs : onOpenSheet}
          title={
            coop.eggs > 0
              ? `Vender ${coop.eggs} ovos por ${coop.eggs * EGG_PRICE} moedas. ${eggTitle}`
              : eggTitle
          }
        >
          <span className="coop-card-art coop-card-art-eggs">
            <EggArt className="coop-card-egg" />
          </span>
          <span className="coop-card-meta">
            <span className="coop-card-name">Ovos</span>
            <span className="coop-card-hint">{eggHint}</span>
          </span>
          <span className={`coop-card-badge${coop.eggs >= tier.eggs ? ' is-full' : ''}`}>
            {coop.eggs}/{tier.eggs}
          </span>
          {coop.chickens > 0 ? (
            <span
              className={`coop-card-progress${nestFull ? ' is-full' : ''}`}
              aria-hidden="true"
            >
              <i style={{ width: `${Math.round(layRatio * 100)}%` }} />
            </span>
          ) : null}
        </button>

        <button
          type="button"
          className={`coop-card coop-card-hatch${canHatch ? ' is-ready' : ' is-muted'}`}
          onClick={canHatch ? onHatch : onOpenSheet}
          title={
            canHatch
              ? `Chocar 3 ovos e gerar um pintinho.${
                  growing ? ` Pintinho mais próximo em ${formatCountdown(chickLeft)}.` : ''
                }`
              : growing
                ? `Pintinho mais próximo cresce em ${formatCountdown(chickLeft)}`
                : hatchHint
          }
        >
          <span className="coop-card-art coop-card-art-hatch">
            <ChickArt className="coop-card-chick" />
          </span>
          <span className="coop-card-meta">
            <span className="coop-card-name">Chocar</span>
            <span className="coop-card-hint">{hatchText}</span>
          </span>
          <span className="coop-card-badge">
            {coop.chicks.length}/{MAX_CHICKS}
          </span>
          {growing ? (
            <span className="coop-card-progress is-chick" aria-hidden="true">
              <i style={{ width: `${Math.round(chickProgress * 100)}%` }} />
            </span>
          ) : null}
        </button>

        <button
          type="button"
          className="coop-card coop-card-house"
          onClick={onOpenSheet}
          title="Comprar animais, vender pintinhos e ampliar o galinheiro"
        >
          <span className="coop-card-art coop-card-art-house">
            <CoopHouseArt className="coop-card-house-art" />
          </span>
          <span className="coop-card-meta">
            <span className="coop-card-name">Galinheiro</span>
            <span className="coop-card-hint">
              {adults}/{tier.animals} moradores · {coop.chicks.length} pintinho
              {coop.chicks.length === 1 ? '' : 's'}
            </span>
          </span>
          <span className="coop-card-badge coop-card-badge-coins">
            {coop.chicks.length > 0
              ? `${CHICK_PRICE} / pintinho`
              : `${coop.eggs * EGG_PRICE} em ovos`}
          </span>
        </button>
      </div>
    </footer>
  );
}
