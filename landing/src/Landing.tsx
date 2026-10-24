import { SiteHeader } from './sections/SiteHeader';
import { Hero } from './sections/Hero';
import { KeyFigures } from './sections/KeyFigures';
import { HowToPlay } from './sections/HowToPlay';
import { Lifecycle } from './sections/Lifecycle';
import { Theft } from './sections/Theft';
import { Points } from './sections/Points';
import { Ranking } from './sections/Ranking';
import { Principles } from './sections/Principles';
import { Merchants } from './sections/Merchants';
import { Faq } from './sections/Faq';
import { ClosingCta } from './sections/ClosingCta';
import { SiteFooter } from './sections/SiteFooter';

export function Landing() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <KeyFigures />
        <HowToPlay />
        <Lifecycle />
        <Theft />
        <Points />
        <Ranking />
        <Principles />
        <Merchants />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
