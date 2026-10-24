import { HexCard, IconArrowRight } from '@ds';
import { ButtonLink } from '../components/ButtonLink';
import { HexMosaicMap } from '../components/HexMosaicMap';
import { APP_SIGNUP_URL } from '../config';
import { HERO_CAPTURE, HERO_FEATURED_HEX, HERO_TERRITORIES, HERO_TRAIL, ROSARIO_CENTER, STEPS } from '../content';
import { goToApp } from '../navigation';

const featuredCard = STEPS[2].card;

export function Hero() {
  return (
    <section id="top" className="lp-hero" aria-labelledby="hero-title">
      <div className="lp-container lp-hero__grid">
        <div className="lp-hero__copy">
          <span className="hx-label">Rosario · a pie</span>
          <h1 id="hero-title" className="lp-h1">Caminá tu ciudad. Quedate con ella.</h1>
          <p className="lp-lead">
            Reclamá hexágonos pasando por ellos, cobrá renta en puntos mientras sean tuyos y canjealos en comercios
            del barrio.
          </p>
          <div className="lp-actions">
            <ButtonLink href={APP_SIGNUP_URL} icon={<IconArrowRight size={18} strokeWidth={2} />}>
              Empezar a jugar
            </ButtonLink>
            <ButtonLink href="#como-se-juega" variant="secondary">Cómo se juega</ButtonLink>
          </div>
          <p className="hx-caption">Sin descargas. Se instala desde el navegador.</p>
        </div>

        <div className="lp-hero__visual">
          <div className="lp-map-frame">
            <HexMosaicMap
              center={ROSARIO_CENTER}
              territories={HERO_TERRITORIES}
              trail={HERO_TRAIL}
              capture={HERO_CAPTURE}
              selected={HERO_FEATURED_HEX}
            />
          </div>
          <HexCard {...featuredCard} className="lp-hero__card" onAction={goToApp} />
        </div>
      </div>
    </section>
  );
}
