import { formatDuration } from '../game/mood';
import type { OfflineReport } from '../game/storage';
import type { Toast } from '../game/useGame';

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tone}`}>
          {toast.text}
        </div>
      ))}
    </div>
  );
}

export function Intro({ open, onStart }: { open: boolean; onStart: () => void }) {
  if (!open) return null;
  return (
    <div className="intro-backdrop">
      <div className="intro-card" role="dialog" aria-modal="true" aria-labelledby="intro-title">
        <svg className="intro-art" viewBox="0 0 320 130" aria-hidden="true">
          <defs>
            <linearGradient id="intro-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8fc5da" />
              <stop offset="1" stopColor="#e6f1d8" />
            </linearGradient>
          </defs>
          <rect width="320" height="130" rx="16" fill="url(#intro-sky)" />
          <circle cx="252" cy="38" r="20" fill="#fbeec0" />
          <path d="M0 92 C 60 74 104 88 160 82 C 216 76 262 88 320 80 L320 130 L0 130 Z" fill="#8fbb93" />
          <path d="M0 108 C 70 96 128 106 190 100 C 238 96 276 104 320 100 L320 130 L0 130 Z" fill="#649366" />
          <g transform="translate(56 74)">
            <path d="M0 30V10" stroke="#4d7a4a" strokeWidth="3" strokeLinecap="round" />
            <path d="M0 16C-10 16-16 10-16 2c10 0 16 6 16 14Z" fill="#7fb27f" />
            <path d="M0 20c10 0 16-6 16-14-10 0-16 6-16 14Z" fill="#9cc78f" />
          </g>
          <g transform="translate(120 82)">
            <path d="M0 24V8" stroke="#4d7a4a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="4" r="7" fill="#e8744f" />
            <circle cx="-2" cy="2" r="2.4" fill="#f6b39a" opacity=".85" />
          </g>
          <g transform="translate(246 84)">
            <path d="M0 24V6" stroke="#4d7a4a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="4" fill="#f0bf3f" />
            {Array.from({ length: 8 }, (_, index) => (
              <ellipse
                key={index}
                cx="0"
                cy="-8"
                rx="2"
                ry="4"
                fill="#f0bf3f"
                transform={`rotate(${index * 45})`}
              />
            ))}
          </g>
          <g stroke="#3f6b3f" strokeWidth="2" strokeLinecap="round" opacity=".55">
            <path d="M186 120c-2-8-1-13 2-18" />
            <path d="M204 122c-1-7 0-12 3-16" />
          </g>
        </svg>

        <h2 id="intro-title">Uma horta para o canto da tela</h2>
        <p className="intro-lead">
          Plante, regue de vez em quando e colha. A horta cresce em tempo real — enquanto você
          trabalha, lê ou faz outra coisa.
        </p>

        <ol className="intro-steps">
          <li>
            <span className="step-icon">1</span>
            <span>
              <strong>Escolha uma semente</strong> na bandeja e toque num canteiro vazio.
            </span>
          </li>
          <li>
            <span className="step-icon">2</span>
            <span>
              <strong>Regue</strong> quando a terra secar. Sem água, o crescimento quase para.
            </span>
          </li>
          <li>
            <span className="step-icon">3</span>
            <span>
              <strong>Colha</strong> quando aparecer “colher”. A colheita vai para a sacola — venda
              quando quiser.
            </span>
          </li>
          <li>
            <span className="step-icon">4</span>
            <span>
              <strong>Cumpra pedidos</strong> da feira antes do prazo e use as moedas para liberar
              sementes, fertilizantes e canteiros.
            </span>
          </li>
        </ol>

        <button type="button" className="primary-button" onClick={onStart}>
          Começar a plantar
        </button>
        <p className="intro-foot">Dica: deixe esta janela num canto, pequena. Ela cuida do resto.</p>
      </div>
    </div>
  );
}

export function OfflineNotice({
  report,
  onClose,
}: {
  report: OfflineReport | null;
  onClose: () => void;
}) {
  if (!report) return null;
  return (
    <div className="intro-backdrop is-soft" onClick={onClose} role="presentation">
      <div
        className="offline-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offline-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="offline-moon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M15 3a9 9 0 1 0 6 14.5A8 8 0 0 1 15 3Z"
              fill="#f3e3b4"
            />
          </svg>
        </span>
        <h2 id="offline-title">Enquanto você estava fora…</h2>
        <p className="offline-time">{formatDuration(report.seconds)} se passaram na horta.</p>
        <ul className="offline-list">
          {report.matured > 0 ? (
            <li>
              <strong>{report.matured}</strong> {report.matured === 1 ? 'pé amadureceu' : 'pés amadureceram'}.
            </li>
          ) : null}
          {report.thirsty > 0 ? (
            <li>
              <strong>{report.thirsty}</strong> {report.thirsty === 1 ? 'está' : 'estão'} com sede.
            </li>
          ) : null}
          {report.growing > 0 ? (
            <li>
              <strong>{report.growing}</strong> continuam crescendo.
            </li>
          ) : null}
          {report.expired > 0 ? (
            <li>
              <strong>{report.expired}</strong>{' '}
              {report.expired === 1 ? 'pedido expirou' : 'pedidos expiraram'} sem entrega.
            </li>
          ) : null}
          {report.orders > 0 ? (
            <li>
              <strong>{report.orders}</strong>{' '}
              {report.orders === 1 ? 'pedido espera' : 'pedidos esperam'} na caderneta.
            </li>
          ) : null}
          {report.matured === 0 &&
          report.growing === 0 &&
          report.orders === 0 &&
          report.expired === 0 ? (
            <li>A terra descansou em silêncio.</li>
          ) : null}
        </ul>
        <button type="button" className="primary-button" onClick={onClose}>
          Ver a horta
        </button>
      </div>
    </div>
  );
}
