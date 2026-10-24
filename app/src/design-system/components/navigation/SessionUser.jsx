import React from 'react';
import { Avatar } from '../core/Avatar.jsx';
import { Icon } from '../core/Icon.jsx';

// Fila de sesión para el pie de `SidebarNav`: avatar, nombre y la acción de
// cerrar sesión. Vive en el sistema, y no en cada layout, porque hereda las
// convenciones de la barra oscura (hover `rgba(255,255,255,.10)` como el ítem
// activo, texto papel-50/300) que Button e IconButton no pueden reproducir
// sin romperles el estado de hover propio.
//
// El botón de salida no lleva etiqueta visible (la barra entra hasta 248 px),
// pero sí `aria-label` + `title`: sin eso queda un icono sin nombre accesible.
export function SessionUser({ name = '', caption, onLogout, logoutLabel = 'Cerrar sesión', style, ...rest }) {
  const [hover, setHover] = React.useState(false);

  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'center', gap: 9, ...style }}>
      <Avatar name={name} size="sm" />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)',
          color: 'var(--papel-50)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{name}</span>
        {caption ? (
          <span style={{
            display: 'block', fontSize: 'var(--text-2xs)', color: 'rgba(217,234,232,.55)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{caption}</span>
        ) : null}
      </span>
      <button
        type="button"
        onClick={onLogout}
        aria-label={logoutLabel}
        title={logoutLabel}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, padding: 0, border: 'none', flex: '0 0 auto',
          borderRadius: 'var(--radius-sm)', background: hover ? 'rgba(255,255,255,.10)' : 'transparent',
          cursor: 'pointer', transition: 'var(--transition-control)',
        }}
      >
        <Icon name="log-out" size={16} color={hover ? 'var(--papel-0)' : 'rgba(217,234,232,.75)'} />
      </button>
    </div>
  );
}
