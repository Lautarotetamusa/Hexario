# Hexario — app (PWA)

Aplicación web instalable (PWA) construida con **React + Vite + TypeScript**.
Incluye sesión contra el backend (`/user/login`, `/user/register`, `/user`),
layout responsive, sistema de diseño y soporte offline.

## Requisitos

- Node 22+
- Backend de `../back` corriendo en `http://localhost:3001` (ver README raíz)

## Levantarla

```bash
cp .env.example .env
npm install
npm run dev
```

Abre `http://localhost:5173`.

Variables:

| Variable | Default | Para qué |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001` | URL del backend. Se hornea en build time. |

## Scripts

```bash
npm run dev        # Vite en desarrollo
npm run build      # tsc -b + build de producción
npm run preview    # sirve el build
npm run lint       # oxlint
npm run typecheck  # sólo TypeScript
```

## Rutas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/login` | Ingreso | sólo sin sesión |
| `/registro` | Alta de cuenta | sólo sin sesión |
| `/` | Mapa (pantalla principal) | con sesión |
| `/canjes` | Promociones y cupones | con sesión |
| `/ranking` | Ranking semanal, mensual e histórico | con sesión |
| `/perfil` | Datos de cuenta + edición de email | con sesión |
| `/instalar` | Instrucciones de instalación | con sesión |

El token JWT se guarda en `localStorage` (`hexario.session`) y se limpia solo
si está vencido o corrupto. `src/api/client.ts` es el único lugar que arma
requests y traduce errores de la API.

## Estructura

```
src/
├── api/                 cliente HTTP + endpoints (auth, user, territories, businesses)
├── auth/                AuthContext (login/register/logout + sesión)
├── components/          piezas compartidas que no son del design system
├── design-system/       sistema de diseño (tokens + componentes + readme)
├── features/
│   ├── auth/            login, registro y guards de ruta
│   ├── map/             mapa MapLibre/H3, territorios y locales adheridos
│   ├── rewards/         promociones reales de la API (canje pendiente)
│   ├── ranking/         ranking por período y mock
│   ├── profile/         perfil y edición de email
│   └── pwa/             instalación, offline y service worker helpers
├── hooks/               useSubmit (estado pending/error de un formulario)
├── layout/              shell de contenido + nav inferior
├── lib/                 helpers de errores/formato y validaciones
├── App.tsx              rutas
└── main.tsx             entrypoint + estilos del sistema + service worker
```

## PWA

- `public/manifest.webmanifest`: identidad, colores, iconos y shortcuts.
- `public/sw.js`: precachea el shell (HTML/JS/CSS/fuentes/iconos) y sirve el
  `index.html` cacheado cuando no hay red. **No** cachea respuestas de la API.
- `src/features/pwa/`: `useInstallPrompt` (prompt nativo + iOS), `useOnlineStatus`
  y `OfflineGate` (pantalla de sin conexión).
- El service worker se registra sólo en producción (`import.meta.env.PROD`) para
  no cachear el shell de desarrollo de Vite.
- Los iconos salen de `public/icons/`; el isotipo es el de `HexarioMark`.

Para probar la instalación:

```bash
npm run build
npm run preview
```

Abrí la URL que imprime Vite en Chrome/Edge y usá el ícono de instalar de la
barra de direcciones (o `Instalar app` dentro de la app).

## Sistema de diseño

Está en `src/design-system/` y se importa siempre desde el barrel:

```tsx
import { Button, Field, HeroNumber, Input } from "../design-system";
```

Reglas y catálogo completo: [`src/design-system/readme.md`](src/design-system/readme.md).
Reglas de estilo React: [`CLAUDE.md`](CLAUDE.md).

## Mapa

`src/features/map/mapConfig.ts` centraliza el proveedor de teselas
(OpenFreeMap, sin API key), los glifos y el centro inicial en Rosario. El
worker de MapLibre se emite como asset de Vite para que funcione en el build.

Los locales se piden a `GET /businesses` y se dibujan como pins
(`createPin` del design system) usando su `latitude`/`longitude`. Al tocar un
pin se abre la hoja con el local y sus promos disponibles.

## Docker

El `Dockerfile` buildea el SPA y lo sirve con nginx. `VITE_API_URL` entra como
build-arg porque Vite la resuelve en build time:

```bash
docker build --build-arg VITE_API_URL=http://localhost:3001 -t hexario-app .
docker run --rm -p 8080:80 hexario-app
```

En el compose de la raíz, la app se sirve en `http://localhost:8080`.
