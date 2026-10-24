import { useState } from 'react';
import {
  Button,
  Chip,
  EmptyState,
  HeroNumber,
  IconArrowLeft,
  IconButton,
  IconTicket,
  Num,
  StatRow,
  formatPoints,
} from '../../design-system';
import type { Promotion } from '../../api/businesses';
import { usePromotions } from '../businesses/useCatalog';

// El módulo de puntos todavía no existe en el back. Hasta que haya un
// endpoint de saldo, la pantalla usa este valor de demostración para mostrar
// el estado "disponible / te faltan". El catálogo sí sale de /promotions.
const DEMO_POINTS = 1284;

const placeFor = (promotion: Promotion) =>
  `${promotion.business.neighborhood} · ${promotion.business.address}`;

type OfferCardProps = {
  promotion: Promotion;
  points: number;
  onSelect: () => void;
};

function OfferCard({ promotion, points, onSelect }: OfferCardProps) {
  const missing = promotion.costPoints - points;
  const affordable = missing <= 0;

  return (
    <article className="hx-offer" aria-label={`${promotion.business.name}: ${promotion.title}`}>
      <div className="hx-offer__head">
        <span className="hx-avatar hx-avatar--outline" aria-hidden="true">
          <IconTicket size={18} />
        </span>
        <span className="hx-owner__text">
          <span className="hx-owner__name">{promotion.business.name}</span>
          <span className="hx-caption">{placeFor(promotion)}</span>
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
        <span className="hx-offer__prize">{promotion.title}</span>
        <span className="hx-offer__cost">
          {formatPoints(promotion.costPoints)}
          <span className="hx-stat__unit">pts</span>
        </span>
      </div>

      <Button variant="secondary" size="sm" block disabled={!affordable} onClick={onSelect}>
        {affordable ? 'Ver promoción' : 'Te faltan puntos'}
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
          <span className="hx-label">Promoción</span>
        </div>
        <h1 className="hx-title">{promotion.title}</h1>
        <p className="hx-caption">
          {promotion.business.name} · {placeFor(promotion)}
        </p>
      </header>

      <article className="hx-card hx-card--flat">
        <div className="hx-owner">
          <span className="hx-avatar hx-avatar--outline" aria-hidden="true">
            <IconTicket size={18} />
          </span>
          <span className="hx-owner__text">
            <span className="hx-owner__name">{promotion.business.name}</span>
            <span className="hx-caption">{promotion.business.category}</span>
          </span>
          <Chip tone="ok" size="sm">
            Disponible
          </Chip>
        </div>

        <p className="hx-caption">{promotion.description}</p>
        {promotion.conditions && (
          <p className="hx-caption">
            <strong>Condiciones:</strong> {promotion.conditions}
          </p>
        )}

        <StatRow
          stats={[
            { label: 'Costo', value: formatPoints(promotion.costPoints), unit: 'pts' },
            { label: 'Stock', value: promotion.stock },
          ]}
        />

        <p className="hx-caption">
          El canje con cupón se habilita cuando esté el módulo de puntos.
        </p>
        <Button disabled>Canje próximamente</Button>
      </article>

      <Button variant="secondary" onClick={onBack}>
        Volver a canjes
      </Button>
    </main>
  );
}

export function RewardsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data, loading, error, refresh } = usePromotions();
  const promotions = data ?? [];
  const selected = selectedId !== null ? promotions.find((promotion) => promotion.id === selectedId) : undefined;

  if (selected) {
    return <RewardDetail promotion={selected} onBack={() => setSelectedId(null)} />;
  }

  if (loading && !data) {
    return (
      <main className="hx-screen hx-screen--app">
        <header className="hx-page-header">
          <span className="hx-label">Canjes</span>
          <h1 className="hx-title">Canjeá tus puntos</h1>
        </header>
        <p className="hx-caption">Cargando promociones…</p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="hx-screen hx-screen--app">
        <EmptyState
          title="No pudimos cargar las promos"
          body={error.message}
          actionLabel="Reintentar"
          onAction={refresh}
        />
      </main>
    );
  }

  if (promotions.length === 0) {
    return (
      <main className="hx-screen hx-screen--app">
        <EmptyState
          title="Todavía no hay promos"
          body="Estamos sumando comercios del barrio. Volvé a mirar pronto."
        />
      </main>
    );
  }

  return (
    <main className="hx-screen hx-screen--app">
      <header className="hx-page-header">
        <span className="hx-label">Canjes</span>
        <h1 className="hx-title">Canjeá tus puntos</h1>
        <p className="hx-caption">Caminá la ciudad, sumá puntos y usalos en los comercios adheridos.</p>
      </header>

      <div className="hx-sheet__row">
        <HeroNumber label="Tus puntos" value={formatPoints(DEMO_POINTS)} unit="pts" />
        <Chip tone="ok">
          <Num>{promotions.length}</Num> promos disponibles
        </Chip>
      </div>

      <section className="hx-section" aria-labelledby="rewards-near">
        <div className="hx-list-header">
          <span className="hx-label" id="rewards-near">
            Cerca tuyo
          </span>
          <span className="hx-caption">{promotions.length} promociones</span>
        </div>

        <ul className="hx-offers">
          {promotions.map((promotion) => (
            <li key={promotion.id}>
              <OfferCard
                promotion={promotion}
                points={DEMO_POINTS}
                onSelect={() => setSelectedId(promotion.id)}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
