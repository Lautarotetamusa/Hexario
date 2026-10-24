# Hexario · Sistema de diseño para React + Vite

Tokens, estilos, componentes base y estilo de mapa (MapLibre + H3) para la PWA de Hexario.
Es código para copiar dentro de tu repo, no un paquete de npm: lo podés modificar sin restricciones.

## Qué trae

```
tokens/tokens.json          Tokens en formato W3C (DTCG), para Style Dictionary o Figma Tokens
src/
  theme/tokens.ts           Los mismos tokens tipados, para TS / mapa / canvas
  theme/useTheme.ts         Hook de tema claro / oscuro / sistema
  styles/tokens.css         Variables CSS (--hx-*), claro y oscuro
  styles/base.css           Reset, utilidades tipográficas (.hx-num, .hx-label…)
  styles/components.css     Estilos de todos los componentes
  components/               Componentes React (ver tabla)
  map/                      Estilo base de MapLibre + capas de hexágonos H3
  format.ts                 1.284 pts · 10,22 km · 02:14:37
  index.ts                  Exporta todo
examples/MapScreen.example.tsx   Pantalla de mapa completa armada con el sistema
```

## Instalación

1. Copiá `src/` dentro de tu proyecto, por ejemplo en `src/design-system/`.
2. Instalá dependencias:

```bash
npm i maplibre-gl h3-js @fontsource/geist @fontsource/geist-mono
npm i -D @types/geojson
# opcional, para el QR del cupón
npm i qrcode.react
```

3. En tu `main.tsx`, en este orden:

```ts
import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/600.css';
import '@fontsource/geist-mono/500.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './design-system/styles/tokens.css';
import './design-system/styles/base.css';
import './design-system/styles/components.css';
```

4. En `index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#FFFFFF">
```

`viewport-fit=cover` habilita las áreas seguras (`env(safe-area-inset-*)`) que usan la hoja inferior, la barra de navegación y el toast cuando la PWA está instalada.

En el manifest de la PWA (vite-plugin-pwa): `theme_color: '#FFFFFF'`, `background_color: '#F1F2F0'`.

Probado con React 18.3, Vite 5, TypeScript 5.6 (strict), maplibre-gl 5 y h3-js 4.

## Tema claro / oscuro

- Las variables CSS cambian solas con `prefers-color-scheme`.
- Para forzar un tema: `<html data-theme="dark">` o `data-theme="light"`.
- `useTheme()` maneja la preferencia (claro / oscuro / sistema), la guarda en localStorage, actualiza `theme-color` y devuelve el tema resuelto para pasárselo al mapa.

```tsx
const { theme, preference, setPreference } = useTheme();
```

## Componentes

| Componente | Uso |
|---|---|
| `Button` | Primario negro tipo píldora, alto 56, ancho completo (`variant="secondary"` para el de borde fino, alto 48). Con `icon` e `iconPosition`. |
| `IconButton` | Botón circular de solo ícono. `aria-label` obligatorio. `variant="float"` sobre el mapa. |
| `Chip` + `Num` | Chip de estado: `ok`, `alert`, `gold`, `protected`, `neutral`. `Num` pone las cifras en mono. |
| `HeroNumber` | Número héroe con etiqueta y unidad. Uno por pantalla. |
| `StatRow` | Bloque de 3 datos (o 2): etiqueta arriba, valor mono abajo. `tone: 'alert'` para "Robables". |
| `BottomSheet` | Hoja inferior con agarre y tres alturas (`min`, `mid`, `full`). Se arrastra o se cicla tocando el agarre. `footer` para la nav. |
| `HexCard` | Tarjeta de hexágono, una acción por estado: `free` → Reclamar, `stealable` → Robar, `mine` → Renovar, `protected` → deshabilitado con cuenta regresiva. |
| `Avatar` | Inicial sobre el color del jugador. Siempre acompañado del nombre. |
| `ToastProvider` / `useToast` | `toast('Hexágono reclamado')`. Arriba al centro, 3 s. |
| `TheftNotice` | "Juli te sacó la cuadra de Pichincha" + "Ir a recuperarla". |
| `Coupon` | Cupón de canje con QR (pasalo por `qr`), código y vencimiento. El QR va sobre blanco también en modo oscuro. |
| `RankingList` / `RankingRow` | Filas de 64 px; la tuya va resaltada (`isMe`). `sticky` para fijarla abajo. |
| `BottomNav` | Mapa, Canjes, Ranking, Perfil. Con react-router: `onSelect={(t) => navigate(rutas[t])}`. |
| `Segmented` | Semana / Mes / Siempre. |
| `Field` + `Input` + `PasswordField` | Campos de formulario con etiqueta, ayuda y error accesibles. `FormError` para el error de envío. |
| `EmptyState` | Invitación a la primera caminata. |
| `createLocationMarker`, `createPin`, `createCountdownTag` | Elementos DOM para `maplibregl.Marker` (ubicación con halo, pin de comercio o hito, cuenta regresiva). |
| Íconos | `IconPlay`, `IconPause`, `IconLock`, `IconHex`, `IconTicket`, `IconRanking`, `IconUser`, `IconStar`, `IconLocate`, `IconLayers`, `IconBell`… trazo 1.75 en 24 px, `HexarioMark` para la marca. |

## Mapa

El mapa usa **MapLibre GL** con teselas vectoriales en esquema **OpenMapTiles** (MapTiler, Stadia, OpenFreeMap o un servidor propio) y **H3 resolución 10** (~15.000 m², una manzana y media).

```ts
import maplibregl from 'maplibre-gl';
import { createBaseStyle, setupHexarioMap, createLocationMarker } from './design-system';

const opts = {
  tileJsonUrl: `https://api.maptiler.com/tiles/v3/tiles.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
  glyphsUrl: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${import.meta.env.VITE_MAPTILER_KEY}`,
};

const map = new maplibregl.Map({
  container: 'map',
  style: createBaseStyle({ ...opts, theme }),
  center: [-60.6393, -32.9468], // Rosario
  zoom: 15.5,
});

const hx = setupHexarioMap(map, { ...opts, theme });

hx.setHexes([
  { h3: '8ac2eba31457fff', owner: 'me' },
  { h3: '8ac2eba3145ffff', owner: 'coral', status: 'protected', countdown: '05:42:10' },
  { h3: '8ac2eba31447fff', owner: 'sky', status: 'stealable' },
  { h3: '8ac2eba3140ffff', owner: null, legendary: true },
]);

hx.setTrail(coordsDeLaCaminata);   // [lng, lat][]
await hx.capture(h3RecienCapturado); // animación "recién capturado"
hx.setTheme('dark');               // cambia el tema sin perder datos
map.on('click', (e) => abrirTarjeta(hx.hexAt(e.point)));

new maplibregl.Marker({ element: createLocationMarker() }).setLngLat(pos).addTo(map);
```

**Qué dibuja cada capa**

| Estado | Capa | Señal sin color |
|---|---|---|
| Libre | `hx-grid` (desde zoom 15) | Solo grilla al 7% |
| Tuyo | `hx-fill` + `hx-line` | Más opaco (42%) y borde de 1.5 |
| Rival | `hx-fill` + `hx-line` | 26%, borde de 1.25 |
| Protegido | `hx-countdown` (desde zoom 17) | Píldora con cuenta regresiva |
| Robable | `hx-hatch` + `hx-line-stealable` | Rayado diagonal y borde discontinuo |
| Legendario | `hx-line-legendary` + `hx-star` | Borde dorado punteado y estrella |
| Seleccionado | `hx-selected-halo` + `hx-selected` | Borde de tinta de 2.5 sobre halo |
| Recién capturado | `hx-capture-*` | Anillo que se expande, 900 ms |

**Cómo mapear tus datos a `owner`:** el color es relativo a quien mira. `'me'` para los tuyos; `'sky' | 'coral' | 'violet'` para los tres rivales más cercanos a tu territorio; `'neutral'` para el resto. La asignación tiene que ser estable durante la sesión, para que Juli no cambie de color al mover el mapa.

**Fuentes de las etiquetas del mapa:** los servidores de glifos comunes no tienen Geist. El estilo usa `Noto Sans` por defecto. Si querés Geist en el mapa, generá los glifos con [font-maker](https://github.com/maplibre/font-maker), hostealos y pasá `fontRegular` / `fontMedium`.

**Pines de comercios e hitos:** `createPin({ kind: 'commerce' | 'landmark', name, selected, onClick })`. El mapa base no muestra POIs: solo aparecen los comercios adheridos que agregás vos.

## Reglas de uso

**Color**
- La interfaz es blanco, negro y grises. El color aparece solo para jugadores, hitos y estados de territorio.
- Cada jugador tiene un color fijo: relleno translúcido más un borde un tono más intenso.
- Los jugadores se escalonan por claridad: celeste (0.67) > menta (0.58) > coral (0.43) > lavanda (0.20). Se distinguen en escala de grises.
- El dueño nunca se comunica solo con color: tarjeta, aviso y ranking muestran el nombre.
- El dorado es exclusivo de los hitos legendarios.
- El verde de los chips y confirmaciones (`--hx-ok-ink`) es una versión oscura de la menta, para que el texto pase 4.5:1.

**Tipografía**
- Geist para la interfaz y Geist Mono con `tabular-nums` para todo lo que se cuenta o se mide (`.hx-num`, `HeroNumber`, `StatRow`).
- Etiquetas de 10–11 px en mayúsculas con tracking de 0.12–0.14em, siempre arriba del valor.
- Formato rioplatense: `formatPoints(1284)` → 1.284; `formatKm(10220)` → 10,22; `formatCountdown(ms)` → 02:14:37.

**Layout**
- Grilla de 4 px. Margen lateral de 20 px (`--hx-gutter`). Separación entre bloques de 16–24 px.
- Radios: píldora para botones y chips, 22 para la hoja inferior, 14 para tarjetas, círculo para pines y avatares.
- Sombra solo para separar un panel del mapa. Sobre blanco, se separa con líneas de 1 px.
- Áreas táctiles de 44 px o más; el botón principal mide 56.

**Modo oscuro**
- Paneles `#121512`, el botón primario se invierte a píldora clara.
- Los colores de jugador no cambian; la lavanda sube a 34% de opacidad y aclara el borde.

**Voz**
- Rioplatense, con voseo, frases cortas y verbo primero: "Reclamar hexágono", "Te robaron la cuadra", "Volvé a pasar para renovar la protección", "Caminata terminada".

**Evitar**
- Degradados decorativos, emojis, ilustraciones infantiles, sombras pesadas, tarjetas con borde de color a la izquierda, íconos de negocios en el mapa base.

## Accesibilidad incluida

- Contraste ≥ 4.5:1 en todo el texto, en ambos temas (valores en `tokens.ts`).
- `prefers-reduced-motion` desactiva el pulso del marcador, el toast animado y la animación de captura.
- Botones reales (`<button>`), `aria-current` en la nav y en tu fila del ranking, `role="alert"` en el aviso de robo, toasts en región `aria-live`.
- Los íconos son decorativos (`aria-hidden`); los botones de solo ícono exigen `aria-label` por tipo.
