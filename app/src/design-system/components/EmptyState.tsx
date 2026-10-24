import type { ReactNode } from 'react';
import { Button } from './Button';
import { IconPlay } from './icons';

type EmptyStateProps = {
  title?: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: ReactNode;
};

function HexIllustration() {
  return (
    <svg width="132" height="84" viewBox="0 0 132 84" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.25">
        <path d="M30 6 L48 16.5 L48 37.5 L30 48 L12 37.5 L12 16.5 Z" />
        <path d="M102 6 L120 16.5 L120 37.5 L102 48 L84 37.5 L84 16.5 Z" />
        <path d="M48 37.5 L66 48 L66 69 L48 79.5 L30 69 L30 48" />
        <path d="M84 37.5 L102 48 L102 69 L84 79.5 L66 69" />
      </g>
      <path d="M66 6 L84 16.5 L84 37.5 L66 48 L48 37.5 L48 16.5 Z" fill="var(--hx-me)" fillOpacity="0.42" stroke="var(--hx-me-line)" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="66" cy="27" r="5" fill="var(--hx-me-line)" stroke="#FFFFFF" strokeWidth="2.5" />
    </svg>
  );
}

/** Estado vacío: invitación a la primera caminata. */
export function EmptyState({
  title = 'Tu primera cuadra te espera',
  body = 'Salí a caminar y cada hexágono que pises empieza a sumarte puntos.',
  actionLabel = 'Empezar caminata',
  onAction,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="hx-empty">
      {illustration ?? <HexIllustration />}
      <span className="hx-empty__title">{title}</span>
      <span className="hx-empty__body">{body}</span>
      {onAction && (
        <Button onClick={onAction} icon={<IconPlay size={20} strokeWidth={2} />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
