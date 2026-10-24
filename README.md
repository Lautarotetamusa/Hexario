# Hexario

Base de backend para la hackathon, armada con el stack y la arquitectura con
la que trabajamos en Thorque. Está recortada a **usuarios**: registro, login
con JWT, perfil y edición de email. No incluye los módulos de negocio de
Epublit (AFIP, facturación, libros, clientes, etc.).

## Stack

- **Node + TypeScript** (CommonJS, ts-node en desarrollo)
- **Express 5**
- **PostgreSQL + Drizzle ORM** (`drizzle-kit` para migraciones)
- **Zod** + `drizzle-zod` para validación
- **bradb** para el CRUD base (`ServiceBuilder`) y los errores de servicio
- **JWT** (`jsonwebtoken`) + **bcrypt**
- **Vitest + Supertest** para tests

## Estructura del repo

```
.
├── back/                     API (Express + Drizzle + Postgres)
│   ├── src/
│   │   ├── modules/user/     único módulo de negocio
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
├── specs/                    planes/diseños del flujo de agentes
├── .opencode/                agentes y comandos para OpenCode
├── .claude/                  agentes, hooks y skills para Claude Code
├── CLAUDE.md                 reglas de estilo del código
├── AGENTS.md                 instrucciones rápidas para agentes
└── docker-compose.yml        Postgres + API
```

## Levantarlo con Docker (recomendado)

Requisitos: Docker y Docker Compose.

```bash
cp back/.env.example back/.env
ln -sfn back/.env .env          # docker compose lee el .env de la raíz
docker compose up --build
```

Eso levanta Postgres en `localhost:5433`, corre las migraciones y arranca la
API en `http://localhost:3001`. La primera vez puede tardar unos minutos
porque compila la imagen.

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
| `CORS_ORIGIN` | `http://localhost:5173` | orígenes permitidos (coma-separados) |
| `JWT_SECRET` | placeholder | **cambialo fuera de local** |
| `JWT_EXPIRES_IN` | `7d` | vigencia del token |

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
   `/front`; requiere que exista el front y su design system).
2. `/plan-backend <historia o NNN-slug>` → `planner` (plan backend en
   `specs/<NNN>-<slug>/plan.md`).
3. `/implement-backend <NNN-slug>` → `back-implementer` (implementa el plan
   aprobado en `/back`).

El flujo y el formato de `design.md` / `plan.md` están explicados en
[`specs/README.md`](specs/README.md). Las reglas de estilo que siguen todos
los agentes están en [`CLAUDE.md`](CLAUDE.md).

> La base actual es **solo backend**. Los agentes de front están incluidos
> para cuando agreguen `/front`, pero hasta que exista
> `front/src/design-system/` los hooks van a bloquear su ejecución (es
> intencional). Los hooks de Claude Code usan `jq`; si no lo tenés,
> instalalo (`sudo apt install jq`) antes de usar ese harness.

## Alcance de esta base

Incluido:

- Alta, login, perfil y edición de usuario.
- JWT con middleware `auth`.
- Migración inicial de `users`.
- Seed de usuarios de prueba.
- Tests de integración del flujo completo.
- Dockerfile + compose para Postgres y API.
- Tooling: ESLint con reglas locales, madge, jscpd, Drizzle Studio.
- Agentes/comandos de OpenCode y Claude Code.
