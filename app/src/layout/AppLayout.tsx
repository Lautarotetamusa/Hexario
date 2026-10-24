import { Outlet } from 'react-router-dom';
import { AppNav } from './AppNav';

/** Pantallas que no son el mapa: contenido con margen y nav inferior fija. */
export function AppLayout() {
  return (
    <>
      <Outlet />
      <AppNav />
    </>
  );
}
