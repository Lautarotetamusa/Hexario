import { HexarioMark } from '@ds';
import { ButtonLink } from '../components/ButtonLink';
import { APP_SIGNUP_URL } from '../config';
import { NAV_LINKS } from '../content';

export function SiteHeader() {
  return (
    <header className="lp-topbar">
      <div className="lp-container lp-topbar__inner">
        <a href="#top" className="lp-brand" aria-label="Hexario, inicio">
          <HexarioMark size={26} />
          <span>Hexario</span>
        </a>
        <nav aria-label="Secciones" className="lp-topbar__nav">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>
        <ButtonLink href={APP_SIGNUP_URL} className="lp-topbar__cta">Jugar</ButtonLink>
      </div>
    </header>
  );
}
