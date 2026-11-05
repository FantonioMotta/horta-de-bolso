import { SPECIES, ORDER_LIMITS } from '../game/data';
import { orderSecondsLeft, type GameState } from '../game/engine';
import { formatCountdown } from '../game/mood';
import { Plant } from './Plant';

interface OrdersSheetProps {
  open: boolean;
  state: GameState;
  onClose: () => void;
  onDeliver: (orderId: string) => void;
  onOpenInventory: () => void;
}

export function OrdersSheet({
  open,
  state,
  onClose,
  onDeliver,
  onOpenInventory,
}: OrdersSheetProps) {
  if (!open) return null;

  const now = Date.now();
  const orders = state.orders
    .slice()
    .sort((a, b) => a.deadline - b.deadline);
  const room = state.orders.length < ORDER_LIMITS.maxActive;
  const nextIn = Math.max(0, (state.nextOrderAt - now) / 1000);

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orders-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grip" aria-hidden="true" />
        <header className="sheet-header">
          <div>
            <h2 id="orders-title">Pedidos da feira</h2>
            <p>Entregue os itens da sacola antes do prazo e ganhe um extra.</p>
          </div>
          <button
            type="button"
            className="icon-button sheet-close"
            onClick={onClose}
            aria-label="Fechar pedidos"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="sheet-body">
          {orders.length > 0 ? (
            <div className="order-list">
              {orders.map((order) => {
                const species = SPECIES[order.species];
                const left = orderSecondsLeft(order, now);
                const urgent = left <= 90;
                const owned = state.inventory[order.species];
                const enough = owned >= order.quantity;
                return (
                  <div key={order.id} className={`order-card${urgent ? ' is-urgent' : ''}`}>
                    <span className="order-art">
                      <Plant species={order.species} growth={0.95} moisture={1} ready={false} />
                    </span>
                    <span className="order-info">
                      <span className="order-title">
                        {order.quantity}× {species.name}
                        <span className={`order-time${urgent ? ' is-urgent' : ''}`}>
                          {formatCountdown(left)}
                        </span>
                      </span>
                      <span className="order-reward">
                        paga <i className="coin-dot" />
                        {order.reward}
                      </span>
                      <span className="order-stock">
                        {enough
                          ? `você tem ${owned} na sacola`
                          : `faltam ${order.quantity - owned} — você tem ${owned}`}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="order-deliver"
                      onClick={() => onDeliver(order.id)}
                      disabled={!enough}
                      title={
                        enough
                          ? `Entregar ${order.quantity}× ${species.name} por ${order.reward} moedas`
                          : 'Guarde os itens necessários na sacola'
                      }
                    >
                      {enough ? 'Entregar' : 'Faltam itens'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="order-empty">
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <path
                  d="M15 12h26l9 9v31H15Z"
                  fill="#f4ead4"
                  stroke="#b89a63"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <path d="M41 12v9h9" fill="none" stroke="#b89a63" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M23 31h19M23 38h19M23 45h11" stroke="#c9b184" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <strong>Nenhum pedido por enquanto</strong>
              <span>
                {room
                  ? `Um novo pedido deve chegar em ${formatCountdown(nextIn)}.`
                  : 'A caderneta está cheia. Entregue um pedido para abrir espaço.'}
              </span>
            </div>
          )}

          <div className={`next-order${room ? '' : ' is-full'}`}>
            <span className="next-order-dot" aria-hidden="true" />
            {room
              ? `Próximo pedido em até ${formatCountdown(nextIn)}.`
              : `Caderneta cheia: ${orders.length} de ${ORDER_LIMITS.maxActive} pedidos.`}
          </div>

          <div className="inv-actions">
            <button type="button" className="primary-button" onClick={onOpenInventory}>
              Abrir a sacola
            </button>
          </div>

          <p className="shop-note">
            Pedidos aparecem com o tempo, mesmo com a janela fechada. O prazo continua correndo —
            entregue antes que a feira feche.
          </p>
        </div>
      </div>
    </div>
  );
}
