import { TheftNotice } from '@ds';
import { SectionHeader } from '../components/SectionHeader';
import { THEFT_EXAMPLE } from '../content';
import { goToApp } from '../navigation';

export function Theft() {
  return (
    <section className="lp-section" aria-labelledby="robos">
      <div className="lp-container lp-split">
        <SectionHeader id="robos" kicker="Te van a robar" title="Te sacaron la cuadra. Andá a buscarla.">
          Si alguien pasa por tu hexágono cuando ya no está protegido, es suyo. Te avisamos al toque, con quién fue y
          cuánta renta perdés. Los puntos que ya cobraste no se tocan.
        </SectionHeader>
        <div className="lp-split__visual">
          <TheftNotice {...THEFT_EXAMPLE} onRecover={goToApp} />
        </div>
      </div>
    </section>
  );
}
