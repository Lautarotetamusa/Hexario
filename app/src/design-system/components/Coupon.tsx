import type { CSSProperties, ReactNode } from 'react';
import { formatPoints } from '../format';
import { Chip } from './Chip';
import { IconTicket } from './icons';

type CouponProps = {
  merchant: string;
  /** "Pichincha · a 2 cuadras" */
  merchantPlace: string;
  prize: string;
  costPoints: number;
  code: string;
  /** El QR lo genera tu app; recomendado: <QRCodeSVG value={code} size={172} fgColor="#0D110D" /> de qrcode.react */
  qr: ReactNode;
  /** "14:52" */
  expiresIn?: string;
  status?: 'active' | 'used' | 'expired';
  /** Color de fondo de la pantalla, para recortar las muescas. Por defecto var(--hx-surface). */
  notchColor?: string;
};

/** Cupón de canje para mostrar en el mostrador. Mantené el brillo de pantalla alto mientras está abierto. */
export function Coupon({ merchant, merchantPlace, prize, costPoints, code, qr, expiresIn, status = 'active', notchColor }: CouponProps) {
  return (
    <article
      className="hx-coupon"
      aria-label={`Cupón de ${merchant}: ${prize}`}
      style={notchColor ? ({ ['--hx-coupon-notch' as string]: notchColor } as CSSProperties) : undefined}
    >
      <div className="hx-coupon__top">
        <div className="hx-owner">
          <span className="hx-avatar hx-avatar--outline" aria-hidden="true">
            <IconTicket size={18} />
          </span>
          <span className="hx-owner__text">
            <span style={{ fontWeight: 600 }}>{merchant}</span>
            <span className="hx-caption">{merchantPlace}</span>
          </span>
          {status === 'active' && <Chip tone="ok">Activo</Chip>}
          {status === 'used' && <Chip tone="neutral">Usado</Chip>}
          {status === 'expired' && <Chip tone="alert">Vencido</Chip>}
        </div>
        <span className="hx-coupon__prize">{prize}</span>
        <div className="hx-coupon__cost">
          <span className="hx-label">Costo</span>
          <span className="hx-num" style={{ fontSize: 22, fontWeight: 500 }}>
            {formatPoints(costPoints)}
            <span className="hx-stat__unit" style={{ marginLeft: 4 }}>pts</span>
          </span>
        </div>
      </div>
      <div className="hx-coupon__cut" aria-hidden="true">
        <span className="hx-coupon__notch hx-coupon__notch--l" />
        <span className="hx-coupon__dash" />
        <span className="hx-coupon__notch hx-coupon__notch--r" />
      </div>
      <div className="hx-coupon__bottom">
        <div className="hx-coupon__qr">{qr}</div>
        <span className="hx-coupon__code">{code}</span>
        {expiresIn && (
          <span className="hx-caption">
            Mostralo en el mostrador · vence en <span className="hx-num" style={{ color: 'var(--hx-ink)' }}>{expiresIn}</span>
          </span>
        )}
      </div>
    </article>
  );
}
