# Hexario — sistema de diseño

Sistema de diseño base de Hexario. Es código fuente del proyecto: los
componentes viven acá, se importan desde el barrel y se extienden por
props/composición, nunca se reimplementan en un feature.

## Principios

- **Producto, no landing.** La UI prioriza claridad, jerarquía y datos por
  sobre decoración. Sin gradientes, sin ilustraciones, sin emoji.
- **Mobile-first.** La app se instala como PWA: el layout base usa una barra
  inferior en mobile y una navegación superior en desktop.
- **Tokens antes que valores sueltos.** Colores, tipografía, espaciado,
  radios, sombras y movimiento salen de `tokens/`. No se escriben hex ni
  píxeles mágicos en componentes de producto.
- **Accesible por defecto.** Todo control tiene label o `aria-label`, foco
  visible (`:focus-visible`) y contraste suficiente.
- **Castellano rioplatense, voseo.** Copy directo: qué pasó y qué hacer.
  Botones con verbo + objeto ("Guardar cambios", "Instalar app").

## Tokens

| Familia | Uso |
|---|---|
| `--pino-*` | Marca y acciones primarias. `--pino-900` para superficies oscuras. |
| `--violeta-*` | Acento: foco, información, estados especiales. |
| `--papel-*` | Neutros cálidos: fondo de página (`--papel-50`), tarjetas (`--papel-0`) e ink (`--papel-900`). |
| `--exito/aviso/error/info` | Estados semánticos. |
| `--font-display` | Spectral, títulos y cifras destacadas. |
| `--font-body` | Manrope, interfaz y párrafos. |
| `--font-mono` | JetBrains Mono, datos y códigos. |
| `--text-*` | Escala tipográfica de 11 a 61 px. |
| `--space-*` / `--gutter-page` | Espaciado y margen de página. |
| `--radius-*` | 3 px badges, 5 px controles, 8 px tarjetas, 12 px modales. |
| `--shadow-*` | Sombras cortas; toda superficie elevada lleva borde. |
| `--transition-control` / `--dur-*` | Movimiento corto, sin rebotes. |

Los aliases semánticos (`--surface-card`, `--text-muted`, `--border-subtle`,
`--focus-ring`) son los que debería usar el código de producto. Los valores
crudos (`--pino-600`) quedan para el sistema y para casos puntuales.

## Componentes

Se importan **siempre** desde el barrel:

```tsx
import { Alert, Button, Card, Field, Input } from "../design-system";
```

| Grupo | Componentes |
|---|---|
| `core/` | `Avatar`, `Badge`, `BrandLockup`, `Button`, `Card`, `Icon`, `IconButton`, `Skeleton`, `StatCard` |
| `forms/` | `Checkbox`, `Combobox`, `Field`, `Input`, `PasswordField`, `QuantityStepper`, `Radio`, `SegmentedControl`, `Select`, `Switch`, `Textarea` |
| `data/` | `EmptyState`, `Pagination`, `Table` |
| `feedback/` | `Alert`, `Dialog`, `Toast`, `Tooltip` |
| `navigation/` | `Breadcrumb`, `SessionUser`, `SidebarNav`, `Tabs`, `Topbar` |

Cada componente tiene:

- `Componente.jsx`: implementación.
- `Componente.d.ts`: contrato de props.
- `Componente.prompt.md`: cuándo usarlo y qué evitar.

Antes de crear UI nueva, revisá el `.prompt.md` del componente candidato. Si
falta una variante, se agrega al componente existente o se crea uno nuevo
dentro de `components/`, siguiendo los tokens, y se suma al barrel `index.ts`.

## Layout de la app

- `src/layout/AppLayout.tsx` es el shell: marca, navegación, sesión y
  `<Outlet />`.
- Desktop: header sticky con navegación horizontal.
- Mobile: la navegación baja a una barra fija inferior, con safe-area para
  iOS.
- `src/index.css` define utilidades de página (`.page-stack`, `.card-grid`,
  `.page-heading`) que no son primitivos de UI.

## PWA

- `public/manifest.webmanifest`: nombre, colores, iconos y shortcuts.
- `public/sw.js`: precachea el shell; no cachea respuestas de la API.
- `src/features/pwa/`: instalación (`useInstallPrompt`), estado offline
  (`useOnlineStatus`, `OfflineGate`) y pantallas de instalación/offline.
- El service worker se registra sólo en producción (`src/main.tsx`) para no
  cachear el shell de desarrollo de Vite.

## Agregar una pantalla

1. Crear `src/features/<nombre>/<Nombre>Page.tsx`.
2. Si trae datos, separar el fetch en un hook `use<Nombre>.ts`.
3. Usar componentes del barrel y tokens del sistema.
4. Registrar la ruta en `src/App.tsx` y, si corresponde, sumar el ítem a
   `NAV_ITEMS` en `src/layout/AppLayout.tsx`.
5. Verificar con `npm run build` y `npm run lint`.

## Verificación

```bash
npm run build
npm run lint
```
