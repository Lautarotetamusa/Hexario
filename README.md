# Hexario

MVP de conquista territorial en Rosario, armado con el stack y la
arquitectura con la que trabajamos en Thorque:

- **`back/`**: API con usuarios (registro, login JWT, perfil) y territorios
  (grilla H3 y reclamos).
- **`app/`**: PWA instalable con React + Vite; mapa, ranking, canjes y
  sistema de diseño propio.

El mapa muestra celdas H3 de **resolución 9**. Un usuario autenticado activa
su ubicación y reclama automáticamente una celda libre cuando entra en ella.
El servidor guarda al primer dueño en PostgreSQL.

Esta versión usa una cobertura rectangular **aproximada** de Rosario. Las
coordenadas y la precisión llegan del navegador y todavía no son una prueba
antifraude. La propiedad no vence ni se disputa; temporadas y renta del
[SRS](SRS_CONQUISTA_TERRITORIAL_ROSARIO.md) son etapas posteriores.
La geolocalización del navegador requiere `localhost` o HTTPS.

No incluye los módulos de negocio de Epublit (AFIP, facturación, libros,
clientes, etc.).

> **Documento de producto:** reglas de negocio, parámetros del juego,
> historias de usuario y decisiones del MVP en
> [`PRODUCT.md`](PRODUCT.md).

## Stack

- **Node + TypeScript** (CommonJS, ts-node en desarrollo)
- **Express 5**
- **PostgreSQL + Drizzle ORM** (`drizzle-kit` para migraciones)
- **Zod** + `drizzle-zod` para validación
- **bradb** para el CRUD base (`ServiceBuilder`) y los errores de servicio
- **JWT** (`jsonwebtoken`) + **bcrypt**
- **React 19 + Vite** para la app
- **PWA**: manifest, service worker, instalación y pantalla offline
- **MapLibre GL + h3-js** para la grilla de resolución 9
- **Vitest + Supertest** para tests del back

## Estructura del repo

```
.
├── back/                     API (Express + Drizzle + Postgres)
│   ├── src/
│   │   ├── modules/user/     usuarios y autenticación
│   │   ├── modules/territory/  grilla y reclamos
│   │   ├── lib/auth/         firma/verificación de JWT
│   │   ├── lib/http/         sobre de respuestas + manejo de errores
│   │   ├── db/               client de Drizzle, schema barrel y migrate
│   │   ├── container.ts      composition root (inyecta dependencias)
│   │   ├── app.ts            monta los routers
│   │   └── index.ts          entrypoint
│   ├── db/migrations/        migraciones versionadas
│   ├── docs/                 api.md + colección Bruno
│   ├── seeders/              usuarios de prueba
│   ├── test/                 tests de integración
│   └── ARCHITECTURE.md       detalle de la arquitectura por módulo
├── app/                      PWA React + Vite
│   ├── src/features/         auth, map, ranking, rewards, profile, pwa
│   ├── src/design-system/    tokens + componentes + readme
│   ├── public/               manifest, service worker e iconos
│   └── README.md
├── specs/                    planes/diseños del flujo de agentes
├── .opencode/                agentes y comandos para OpenCode
├── .claude/                  agentes, hooks y skills para Claude Code
├── CLAUDE.md                 reglas de estilo del código
├── AGENTS.md                 instrucciones rápidas para agentes
└── docker-compose.yml        Postgres + API + app
```

`app/` contiene la PWA que ve el jugador: mapa, ranking, canjes y perfil.
Consulta la API por HTTP. `back/` contiene la API, las reglas de reclamo, la
autenticación, las migraciones y las pruebas. PostgreSQL guarda los usuarios
y los reclamos. El contrato de territorios está en
[`back/docs/territories.md`](back/docs/territories.md).

## Levantarlo con Docker (recomendado)

Requisitos: Docker y Docker Compose.

```bash
cp back/.env.example back/.env
ln -sfn back/.env .env          # docker compose lee el .env de la raíz
docker compose up --build
```

Eso levanta:
- Postgres en `localhost:5433`
- API en `http://localhost:3001` (aplica migraciones al arrancar)
- PWA en `http://localhost:8080`

La primera vez puede tardar unos minutos porque compila las dos imágenes.
Si querés datos de prueba en Docker, corré el seed una vez:

```bash
docker compose exec api node dist/seeders/index.js
```

Para bajarlo:

```bash
docker compose down          # conserva los datos
docker compose down -v       # borra también el volumen de Postgres
```

## Levantarlo en local (sin la imagen de la API)

```bash
cp back/.env.example back/.env
docker compose up -d postgresdb

cd back
npm install
npm run db:migrate:run       # aplica db/migrations
npm run seed                 # crea usuario_uno y usuario_dos
npm run dev                  # http://localhost:3001
```

En otra terminal:

```bash
cd app
cp .env.example .env
npm install
npm run dev                  # http://localhost:5173
```

Si ya tenés un Postgres local, creá la base `hexario` con el usuario/clave
que pongas en `back/.env` y ajustá `DB_PORT` (por defecto el ejemplo usa
`5433` para no chocar con otros Postgres).

### Usuarios del seed

| Username | Password |
|---|---|
| `usuario_uno` | `seed12345` |
| `usuario_dos` | `seed12345` |

## Endpoints

| Método | Ruta | Auth | Body |
|---|---|---|---|
| `POST` | `/user/register` | no | `{ username, password, email }` |
| `POST` | `/user/login` | no | `{ username, password }` |
| `GET` | `/user` | sí (Bearer) | — |
| `PUT` | `/user` | sí (Bearer) | `{ email }` (parcial) |
| `GET` | `/territories?bbox=sur,oeste,norte,este` | no | — |
| `GET` | `/territories/mine` | sí (Bearer) | — |
| `POST` | `/territories/claim` | sí (Bearer) | `{ latitude, longitude, accuracy, recordedAt }` |

El login devuelve `{ success, message, token }`; el resto de las respuestas
usa el sobre `{ success, message?, data }` o
`{ success: false, errors: [...] }`.

Ejemplo rápido:

```bash
# Registro
curl -X POST http://localhost:3001/user/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"Demo1234.","email":"demo@example.com"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3001/user/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"usuario_uno","password":"seed12345"}' | jq -r .token)

# Perfil
curl http://localhost:3001/user -H "Authorization: Bearer $TOKEN"

# Editar email
curl -X PUT http://localhost:3001/user \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"email":"nuevo@example.com"}'
```

La colección de Bruno está en `back/docs/` (`Auth/Register`, `Auth/Login`,
`Auth/Get me`, `Auth/Update`). El contrato generado de rutas está en
`back/docs/api.md`.

## App PWA (`app/`)

La app consume el back en `VITE_API_URL` (default `http://localhost:3001`).
Incluye:

- Login, registro y guards de sesión (`RequireAuth`, `PublicOnlyRoute`).
- Mapa a pantalla completa con MapLibre + h3-js y reclamo de celdas por
  ubicación.
- Ranking, canjes y perfil con edición de email.
- PWA: manifest, service worker, prompt de instalación, modo offline y
  barra de navegación inferior en mobile.
- Sistema de diseño propio en `app/src/design-system/` (tokens + componentes).

Rutas:

| Ruta | Pantalla |
|---|---|
| `/login` | Ingreso |
| `/registro` | Alta de cuenta |
| `/` | Mapa |
| `/canjes` | Recompensas |
| `/ranking` | Ranking |
| `/perfil` | Datos de cuenta + edición de email |
| `/instalar` | Cómo instalar la PWA |

Para desarrollo:

```bash
cd app
cp .env.example .env
npm install
npm run dev
```

Para probar el build de producción y la instalación:

```bash
npm run build
npm run preview
```

Detalle de la app y del sistema de diseño en
[`app/README.md`](app/README.md) y
[`app/src/design-system/readme.md`](app/src/design-system/readme.md).

El mapa consulta sólo el área visible. Si supera 1200 celdas, el backend
pide acercar el zoom. Un reclamo exige una muestra de hasta 50 m de error
informado y 30 segundos de antigüedad. Devuelve `201` al conquistar, `200`
si la celda ya era propia y `409` si la tomó otro usuario. El ID H3 es clave
primaria: dos solicitudes concurrentes no pueden crear dos dueños.

## Variables de entorno

Están documentadas y con valores locales en `back/.env.example`. Las
principales:

| Variable | Default local | Para qué |
|---|---|---|
| `DB_HOST` | `localhost` | host de Postgres |
| `DB_PORT` | `5433` | puerto del host (dentro de compose la API usa `5432`) |
| `DB_USER` / `DB_PASS` / `DB_NAME` | `hexario` | credenciales/base |
| `PORT` | `3001` | puerto de la API |
| `HOST` | `http://localhost:3001` | URL pública de la API |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:8080` | orígenes permitidos (coma-separados) |
| `JWT_SECRET` | placeholder | **cambialo fuera de local** |
| `JWT_EXPIRES_IN` | `7d` | vigencia del token |
| `APP_PORT` | `8080` | puerto donde compose publica la app |
| `VITE_API_URL` (app) | `http://localhost:3001` | URL del back, horneada en build |

`back/.env` no se versiona. Si agregás una variable nueva, actualizá
`src/env.ts` (el esquema de Zod) y `back/.env.example`.

## Arquitectura por módulo

Cada entidad vive en `back/src/modules/<nombre>/` y se separa en:

`schema` → `validator` → `filter` → `repository` → `service` → `controller` → `routes`

- **repository**: sólo queries.
- **service**: reglas de negocio y transacciones.
- **controller**: adapta HTTP (parsea con Zod, elige el helper de respuesta).
- **index.ts**: puerta pública del módulo (`createXModule`), lo único que se
  importa desde afuera (junto con `*.schema.ts`).

El detalle completo, con ejemplos y los pasos para agregar un módulo, está
en [`back/ARCHITECTURE.md`](back/ARCHITECTURE.md).

### Agregar un módulo (resumen)

1. Crear `back/src/modules/<nombre>/` siguiendo el módulo `user`.
2. Exportar la tabla en `back/src/db/schema.ts`.
3. `npm run db:generate` y `npm run db:migrate`.
4. Cablear el módulo en `back/src/container.ts`.
5. Montarlo en `back/src/app.ts`.
6. `npm run docs:api` y agregar tests en `back/test/`.

## Tests

```bash
cd back
npm test
```

El script `scripts/reset-test-db.sh` recrea `hexario_test`, la migra y la
seedea antes de correr Vitest. Necesita los binarios de Postgres
(`psql`, `createdb`, `dropdb`) en el PATH. Para cobertura:

```bash
npm run test:coverage
```

## Verificación de calidad

```bash
cd back
npx tsc --noEmit -p tsconfig.json
npm run lint
npm run lint:cycles
npm run lint:duplicates

cd ../app
npm run typecheck
npm run lint
npm run build
```

## Flujo de agentes

Este repo trae el flujo de trabajo que usamos en Epublit, adaptado a
Hexario. Está duplicado para los dos harness:

- **OpenCode**: `.opencode/agents/`, `.opencode/commands/` y
  `.opencode/plugins/hexario-hooks/`.
- **Claude Code**: `.claude/agents/`, `.claude/skills/`,
  `.claude/hooks/` y `.claude/settings.json`.

Pasos:

1. `/design-frontend <historia>` → `front-designer` (diseño exploratorio en
   `/app`, con el sistema de diseño de `app/src/design-system/`).
2. `/plan-backend <historia o NNN-slug>` → `planner` (plan backend en
   `specs/<NNN>-<slug>/plan.md`).
3. `/implement-backend <NNN-slug>` → `back-implementer` (implementa el plan
   aprobado en `/back`).

El flujo y el formato de `design.md` / `plan.md` están explicados en
[`specs/README.md`](specs/README.md). Las reglas de estilo que siguen todos
los agentes están en [`CLAUDE.md`](CLAUDE.md) y, para React,
[`app/CLAUDE.md`](app/CLAUDE.md).

> Los hooks de Claude Code usan `jq`; si no lo tenés, instalalo
> (`sudo apt install jq`) antes de usar ese harness. La skill `impeccable`
> no se versiona (pesa ~18 MB); el hook la copia desde
> `~/.claude/skills/impeccable` la primera vez que se usa `front-designer`.

## Alcance de esta base

Incluido:

- Back: alta, login, perfil y edición de usuario; territorios (grilla H3 y
  reclamos); JWT; migraciones; seed; tests de integración.
- App: PWA instalable con React + Vite; login/registro; mapa; ranking;
  canjes; perfil; modo offline; sistema de diseño; layout responsive.
- Dockerfile + compose para Postgres, API y app.
- Tooling: ESLint/madge/jscpd en back, oxlint en app, Drizzle Studio.
- Agentes/comandos de OpenCode y Claude Code.
