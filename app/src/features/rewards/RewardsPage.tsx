import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Button,
  Chip,
  Coupon,
  HeroNumber,
  IconArrowLeft,
  IconButton,
  IconTicket,
  Num,
  formatPoints,
} from '../../design-system';
import { MOCK_PROMOTIONS, MOCK_REWARDS_SUMMARY, findPromotion, type Promotion } from './mock';

type OfferCardProps = {
  promotion: Promotion;
  points: number;
  onSelect: () => void;
};

function OfferCard({ promotion, points, onSelect }: OfferCardProps) {
  const missing = promotion.costPoints - points;
  const affordable = missing <= 0;

  return (
    <article className="hx-offer" aria-label={`${promotion.merchant}: ${promotion.prize}`}>
      <div className="hx-offer__head">
        <span className="hx-avatar hx-avatar--outline" aria-hidden="true">
          <IconTicket size={18} />
        </span>
        <span className="hx-owner__text">
          <span className="hx-owner__name">{promotion.merchant}</span>
          <span className="hx-caption">{promotion.merchantPlace}</span>
        </span>
        {affordable ? (
          <Chip tone="ok" size="sm">
            Disponible
          </Chip>
        ) : (
          <Chip tone="neutral" size="sm">
            Faltan <Num>{formatPoints(missing)}</Num>
          </Chip>
        )}
      </div>

      <div className="hx-offer__body">
        <span className="hx-offer__prize">{promotion.prize}</span>
        <span className="hx-offer__cost">
          {formatPoints(promotion.costPoints)}
          <span className="hx-stat__unit">pts</span>
        </span>
      </div>

      <Button variant="secondary" size="sm" block disabled={!affordable} onClick={onSelect}>
        {affordable ? 'Ver cupón' : 'Te faltan puntos'}
      </Button>
    </article>
  );
}

function RewardDetail({ promotion, onBack }: { promotion: Promotion; onBack: () => void }) {
  return (
    <main className="hx-screen hx-screen--app">
      <header className="hx-page-header">
        <div className="hx-page-header__row">
          <IconButton aria-label="Volver a canjes" variant="subtle" onClick={onBack}>
            <IconArrowLeft size={20} />
          </IconButton>
          <span className="hx-label">Canje</span>
        </div>
        <h1 className="hx-title">Tu cupón</h1>
      </header>

      <Coupon
        merchant={promotion.merchant}
        merchantPlace={promotion.merchantPlace}
        prize={promotion.prize}
        costPoints={promotion.costPoints}
        code={promotion.code}
        qr={<QRCodeSVG value={promotion.code} size={168} fgColor="#0D110D" bgColor="#FFFFFF" />}
        expiresIn={promotion.expiresIn}
        notchColor="var(--hx-panel)"
      />

      <p className="hx-caption">
        Mostralo en el mostrador. Vence a los 15 minutos y no se puede usar dos veces.
      </p>

      <Button variant="secondary" onClick={onBack}>
        Volver a canjes
      </Button>
    </main>
  );
}

export function RewardsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? findPromotion(selectedId) : undefined;

  if (selected) {
    return <RewardDetail promotion={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <main className="hx-screen hx-screen--app">
      <header className="hx-page-header">
        <span className="hx-label">Canjes</span>
        <h1 className="hx-title">Canjeá tus puntos</h1>
        <p className="hx-caption">Caminá la ciudad, sumá puntos y usalos en los comercios adheridos.</p>
      </header>

      <div className="hx-sheet__row">
        <HeroNumber label="Tus puntos" value={formatPoints(MOCK_REWARDS_SUMMARY.points)} unit="pts" />
        <Chip tone="ok">
          <Num>{MOCK_REWARDS_SUMMARY.available}</Num> canjes disponibles
        </Chip>
      </div>

      <section className="hx-section" aria-labelledby="rewards-near">
        <div className="hx-list-header">
          <span className="hx-label" id="rewards-near">
            Cerca tuyo
          </span>
          <span className="hx-caption">{MOCK_PROMOTIONS.length} comercios</span>
        </div>

        <ul className="hx-offers">
          {MOCK_PROMOTIONS.map((promotion) => (
            <li key={promotion.id}>
              <OfferCard
                promotion={promotion}
                points={MOCK_REWARDS_SUMMARY.points}
                onSelect={() => setSelectedId(promotion.id)}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
