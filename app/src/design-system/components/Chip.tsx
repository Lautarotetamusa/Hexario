import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export type ChipTone = 'ok' | 'alert' | 'gold' | 'protected' | 'neutral';

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: ChipTone;
  icon?: ReactNode;
  size?: 'md' | 'sm';
  children: ReactNode;
};

/**
 * Chip de estado: informa, no se toca. Si necesita acción, usá un Button.
 * Envolvé las cifras en <Num> para que vayan en mono.
 */
export function Chip({ tone = 'ok', icon, size = 'md', className, children, ...rest }: ChipProps) {
  return (
    <span className={cx('hx-chip', `hx-chip--${tone}`, size === 'sm' && 'hx-chip--sm', className)} {...rest}>
      {icon}
      {children}
    </span>
  );
}

/** Cifra en Geist Mono con dígitos tabulares. */
export function Num({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('hx-num', className)}>{children}</span>;
}
