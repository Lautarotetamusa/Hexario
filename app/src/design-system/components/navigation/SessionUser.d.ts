/** Fila de sesión para el slot `footer` de `SidebarNav`: avatar, nombre y cerrar sesión. */
export interface SessionUserProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nombre o usuario que se muestra junto al avatar. */
  name: string;
  /** Segunda línea opcional (email, rol). */
  caption?: React.ReactNode;
  onLogout: () => void;
  /** Nombre accesible del botón de salida. Default "Cerrar sesión". */
  logoutLabel?: string;
}
export function SessionUser(props: SessionUserProps): JSX.Element;
