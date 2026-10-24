import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNav, type NavTab } from '../design-system';

const ROUTES: Record<NavTab, string> = {
  map: '/',
  redeem: '/canjes',
  ranking: '/ranking',
  profile: '/perfil',
};

function activeTab(pathname: string): NavTab {
  if (pathname.startsWith('/canjes')) return 'redeem';
  if (pathname.startsWith('/ranking')) return 'ranking';
  if (pathname.startsWith('/perfil') || pathname.startsWith('/instalar')) return 'profile';
  return 'map';
}

type AppNavProps = {
  /** false cuando la nav va dentro de otro contenedor (la hoja del mapa). */
  fixed?: boolean;
};

export function AppNav({ fixed = true }: AppNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const nav = <BottomNav active={activeTab(pathname)} onSelect={(tab) => navigate(ROUTES[tab])} />;

  return fixed ? <div className="hx-app-nav">{nav}</div> : nav;
}
