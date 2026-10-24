import { QRCodeSVG } from 'qrcode.react';
import { Coupon, IconCheck } from '@ds';
import { SectionHeader } from '../components/SectionHeader';
import { COUPON_EXAMPLE, COUPON_FACTS } from '../content';

export function Points() {
  return (
    <section className="lp-section lp-section--surface" aria-labelledby="puntos">
      <div className="lp-container lp-split">
        <div>
          <SectionHeader id="puntos" kicker="Puntos" title="Tus pasos se canjean en el barrio.">
            Los puntos se ganan sólo caminando. No se compran, no se transfieren y no son plata: se canjean por
            promos de comercios adheridos.
          </SectionHeader>
          <ul className="lp-checklist">
            {COUPON_FACTS.map((fact) => (
              <li key={fact}>
                <IconCheck size={18} strokeWidth={2} />
                {fact}
              </li>
            ))}
          </ul>
        </div>
        <div className="lp-split__visual lp-coupon">
          <Coupon
            {...COUPON_EXAMPLE}
            qr={<QRCodeSVG value={COUPON_EXAMPLE.code} size={148} fgColor="#0D110D" bgColor="#FFFFFF" />}
          />
        </div>
      </div>
    </section>
  );
}
