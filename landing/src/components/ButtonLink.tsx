import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '@ds';

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
};

// Los CTA de la landing navegan (a la app o a un ancla), así que tienen que
// ser <a> y no <button>: reusan las clases del Button del sistema de diseño.
export function ButtonLink({ variant = 'primary', icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <a className={cx('hx-btn', `hx-btn--${variant}`, 'lp-btn-link', className)} {...rest}>
      {children}
      {icon && <span className="hx-btn__icon">{icon}</span>}
    </a>
  );
}
