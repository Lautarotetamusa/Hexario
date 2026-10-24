import { APP_SIGNUP_URL } from './config';

// Los componentes de ejemplo (tarjeta, aviso) son los reales de la app: su
// acción en la landing es llevar a jugar.
export const goToApp = () => window.location.assign(APP_SIGNUP_URL);
