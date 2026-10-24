# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# build: la landing consume el design system real de app/ vía alias @ds. Por
# eso el contexto es la raíz del repo (ver workflow/infra), no landing/.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /repo

COPY landing/package*.json ./landing/
RUN --mount=type=cache,target=/root/.npm \
    cd landing && npm ci

COPY app/src/design-system ./app/src/design-system
COPY landing ./landing

WORKDIR /repo/landing

# URL pública de la PWA; se hornea en build time (Vite).
ARG VITE_APP_URL
ENV VITE_APP_URL=$VITE_APP_URL
RUN npm run build

# ---------------------------------------------------------------------------
# runtime: nginx sirviendo estáticos en la raíz del dominio.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY landing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/landing/dist /usr/share/nginx/html

EXPOSE 80
