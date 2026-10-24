import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  /** Ícono antes del texto (o después con iconPosition="end"). */
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  /** Ancho completo. Por defecto true para primario. */
  block?: boolean;
  size?: 'md' | 'sm';
};

/**
 * Botón píldora. Primario: negro (claro) / claro (oscuro), alto 56.
 * Secundario: borde fino, alto 48. Texto siempre en mayúsculas vía CSS.
 */
export function Button({
  variant = 'primary',
  icon,
  iconPosition = 'start',
  block,
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isBlock = block ?? variant === 'primary';
  const iconEl = icon ? <span className="hx-btn__icon">{icon}</span> : null;
  return (
    <button
      type={type}
      className={cx(
        'hx-btn',
        `hx-btn--${variant}`,
        isBlock && 'hx-btn--block',
        size === 'sm' && 'hx-btn--sm',
        className,
      )}
      {...rest}
    >
      {iconPosition === 'start' && iconEl}
      {children}
      {iconPosition === 'end' && iconEl}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Obligatorio: los botones de solo ícono necesitan nombre accesible. */
  'aria-label': string;
  /** float: sobre el mapa (48 px con sombra). subtle: dentro de un panel. */
  variant?: 'float' | 'subtle' | 'plain';
  children: ReactNode;
};

export function IconButton({ variant = 'float', className, type = 'button', children, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx('hx-icon-btn', variant !== 'plain' && `hx-icon-btn--${variant}`, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
