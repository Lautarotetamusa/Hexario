import type { ReactNode } from 'react';
import { IconHex, IconHexActive, IconRanking, IconTicket, IconUser } from './icons';

export type NavTab = 'map' | 'redeem' | 'ranking' | 'profile';

const TABS: Array<{ id: NavTab; label: string; icon: (active: boolean) => ReactNode }> = [
  { id: 'map', label: 'Mapa', icon: (a) => (a ? <IconHexActive /> : <IconHex />) },
  { id: 'redeem', label: 'Canjes', icon: (a) => <IconTicket strokeWidth={a ? 2 : 1.75} /> },
  { id: 'ranking', label: 'Ranking', icon: (a) => <IconRanking strokeWidth={a ? 2.25 : 1.75} /> },
  { id: 'profile', label: 'Perfil', icon: (a) => <IconUser strokeWidth={a ? 2 : 1.75} /> },
];

type BottomNavProps = {
  active: NavTab;
  onSelect: (tab: NavTab) => void;
};

/**
 * Barra inferior: Mapa, Canjes, Ranking, Perfil. Siempre ícono + texto.
 * Se oculta durante una caminata. Si usás react-router, llamá navigate() dentro de onSelect.
 */
export function BottomNav({ active, onSelect }: BottomNavProps) {
  return (
    <nav className="hx-nav" aria-label="Principal">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            className="hx-nav__item"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(t.id)}
          >
            {t.icon(isActive)}
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
