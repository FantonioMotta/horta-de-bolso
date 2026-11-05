import { useEffect, useRef, useState } from 'react';
import type { Mood } from '../game/mood';

interface HudProps {
  coins: number;
  gardenName: string;
  inventoryCount: number;
  capacity: number;
  orderCount: number;
  urgentOrders: boolean;
  mood: Mood;
  muted: boolean;
  ready: number;
  thirsty: number;
  onToggleMute: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onOpenOrders: () => void;
  onRename: () => void;
}

export function Hud({
  coins,
  gardenName,
  inventoryCount,
  capacity,
  orderCount,
  urgentOrders,
  mood,
  muted,
  ready,
  thirsty,
  onToggleMute,
  onOpenShop,
  onOpenInventory,
  onOpenOrders,
  onRename,
}: HudProps) {
  const [bump, setBump] = useState(false);
  const previous = useRef(coins);
  const clock = new Date();
  const time = `${String(clock.getHours()).padStart(2, '0')}:${String(clock.getMinutes()).padStart(2, '0')}`;
  const inventoryFull = inventoryCount >= capacity;

  useEffect(() => {
    if (coins > previous.current) {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 500);
      previous.current = coins;
      return () => window.clearTimeout(timer);
    }
    previous.current = coins;
  }, [coins]);

  return (
    <header className="hud">
      <div className="brand">
        <svg className="brand-leaf" viewBox="0 0 32 32" aria-hidden="true">
          <path
            d="M6 24C6 13 13 6 26 6c0 13-7 20-18 20Z"
            fill="#7fb27f"
          />
          <path d="M6 26C9 19 14 14 21 10" stroke="#4f7f57" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
        <div className="brand-text">
          <div className="brand-title">
            <h1 title={gardenName}>{gardenName}</h1>
            <button
              type="button"
              className="name-edit"
              onClick={onRename}
              aria-label="Renomear a horta"
              title="Renomear a horta"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m14.5 5.5 4 4M5 19l.9-4.2L16.6 4a1.8 1.8 0 0 1 2.6 0l.8.8a1.8 1.8 0 0 1 0 2.6L9.2 18.1 5 19Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p>
            Orta · {mood.label} · {time}
          </p>
        </div>
      </div>

      <div className="hud-actions">
        <div className={`coin-pill${bump ? ' is-bump' : ''}`} title="Suas moedas">
          <span className="coin-coin" aria-hidden="true">
            <i />
          </span>
          <span className="coin-value">{coins}</span>
          <span className="sr-only">moedas</span>
        </div>

        {ready > 0 ? (
          <span className="attention-pill" title="Plantas prontas para colher">
            {ready} pronta{ready > 1 ? 's' : ''}
          </span>
        ) : thirsty > 0 ? (
          <span className="attention-pill is-dry" title="Plantas com sede">
            {thirsty} com sede
          </span>
        ) : null}

        <button
          type="button"
          className={`hud-chip${inventoryFull ? ' is-full' : ''}`}
          onClick={onOpenInventory}
          title={`Sacola: ${inventoryCount} de ${capacity} lugares`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 9h14l-1.1 9.3a2.2 2.2 0 0 1-2.2 1.9H8.3a2.2 2.2 0 0 1-2.2-1.9L5 9Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M8.6 9V7.4a3.4 3.4 0 0 1 6.8 0V9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path d="M9 13.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
          </svg>
          <span>Sacola</span>
          <strong>
            {inventoryCount}/{capacity}
          </strong>
        </button>

        <button
          type="button"
          className={`hud-chip${orderCount > 0 ? ' has-orders' : ''}${urgentOrders ? ' is-urgent' : ''}`}
          onClick={onOpenOrders}
          title={
            orderCount > 0
              ? `${orderCount} pedido${orderCount > 1 ? 's' : ''} na caderneta`
              : 'Caderneta de pedidos'
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 4.5h9.5L19 8v11.5H6Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M15.5 4.5V8H19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 11h6M9 14h6M9 17h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
          </svg>
          <span>Pedidos</span>
          <strong>{orderCount}</strong>
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={onToggleMute}
          aria-label={muted ? 'Ligar som' : 'Desligar som'}
          title={muted ? 'Ligar som' : 'Desligar som'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4Z" fill="currentColor" />
            {muted ? (
              <path d="m15.5 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <>
                <path d="M15 9.2a4 4 0 0 1 0 5.6" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
                <path d="M17.8 6.8a7.4 7.4 0 0 1 0 10.4" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" opacity=".6" />
              </>
            )}
          </svg>
        </button>

        <button type="button" className="shop-button" onClick={onOpenShop}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9h16l-1.2 9.5a2 2 0 0 1-2 1.5H7.2a2 2 0 0 1-2-1.5L4 9Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8.5 9c0-2.5 1.6-4.5 3.5-4.5S15.5 6.5 15.5 9" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span>Loja</span>
        </button>
      </div>
    </header>
  );
}
