import type { PlayerColor } from '../theme/tokens';
import { cx } from './cx';

type AvatarProps = {
  /** Nombre del jugador; se muestra la inicial. */
  name: string;
  color: PlayerColor;
  size?: 'md' | 'lg';
  className?: string;
};

/**
 * Avatar con color de jugador e inicial en tinta. El color nunca va solo:
 * siempre acompañalo del nombre en texto.
 */
export function Avatar({ name, color, size = 'md', className }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span className={cx('hx-avatar', `hx-avatar--${color}`, size === 'lg' && 'hx-avatar--lg', className)} aria-hidden="true">
      {initial}
    </span>
  );
}
