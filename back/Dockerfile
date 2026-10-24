# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# build: compila TypeScript. Necesita devDependencies (tsc, tsc-alias).
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

# ---------------------------------------------------------------------------
# deps: sólo dependencias de producción, sin devDependencies.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# ---------------------------------------------------------------------------
# runtime: imagen final sin toolchain: dist + prod deps.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=prod \
    TZ=America/Buenos_Aires

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends tzdata; \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime; \
    echo "$TZ" > /etc/timezone; \
    rm -rf /var/lib/apt/lists/*

COPY --from=deps  --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
# Migraciones versionadas: permiten correr `node dist/src/db/migrate.js` como
# job puntual de deploy sin volver a construir la imagen.
COPY --chown=node:node db/migrations ./db/migrations

USER node
EXPOSE 3001
CMD ["node", "dist/src/index.js"]
