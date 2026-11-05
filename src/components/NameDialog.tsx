import { useEffect, useState } from 'react';
import { DEFAULT_GARDEN_NAME, MAX_GARDEN_NAME } from '../game/data';

interface NameDialogProps {
  open: boolean;
  current: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function NameDialog({ open, current, onClose, onSave }: NameDialogProps) {
  const [name, setName] = useState(current);

  useEffect(() => {
    if (open) setName(current);
  }, [open, current]);

  if (!open) return null;

  const trimmed = name.trim();

  return (
    <div className="intro-backdrop is-soft" onClick={onClose} role="presentation">
      <form
        className="name-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (!trimmed) return;
          onSave(trimmed);
        }}
      >
        <span className="name-card-art" aria-hidden="true">
          <svg viewBox="0 0 64 48">
            <path d="M10 36h44" stroke="#b89a63" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M16 36V19l16-9 16 9v17" fill="#f4ead4" stroke="#b89a63" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M26 36V26h12v10" fill="none" stroke="#c9b184" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M24 16c2-4 5-6 8-6s6 2 8 6" fill="none" stroke="#7fb27f" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M34 11c2-3 5-4 8-3-1 3-4 5-8 3Z" fill="#8dbb62" />
          </svg>
        </span>
        <h2 id="name-title">Como chamar sua horta?</h2>
        <p>O nome aparece no topo e na plaquinha do canteiro.</p>
        <input
          className="name-input"
          type="text"
          value={name}
          maxLength={MAX_GARDEN_NAME}
          placeholder={DEFAULT_GARDEN_NAME}
          aria-label="Nome da horta"
          autoFocus
          onChange={(event) => setName(event.target.value)}
        />
        <div className="name-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={!trimmed}>
            Salvar nome
          </button>
        </div>
        <p className="name-foot">{trimmed.length}/{MAX_GARDEN_NAME} caracteres</p>
      </form>
    </div>
  );
}
