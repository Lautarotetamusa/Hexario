# Deploy de producción

Arquitectura en un solo host, detrás de Cloudflare:

```text
https://hexario.thorque.com.ar/       -> landing
https://hexario.thorque.com.ar/app/   -> PWA (Vite base /app/)
https://hexario.thorque.com.ar/api/   -> API (nginx quita /api/)
```

Cloudflare termina el TLS público y habla con el nginx de este compose por
HTTPS. El compose sólo pullea imágenes de GHCR; no buildea nada en el server.

## Imágenes

GitHub Actions publica tres imágenes en GHCR:

| Imagen | Contenido |
|---|---|
| `ghcr.io/lautarotetamusa/hexario-back` | API Node/Express + migraciones |
| `ghcr.io/lautarotetamusa/hexario-app` | PWA estática servida por nginx |
| `ghcr.io/lautarotetamusa/hexario-landing` | Landing estática servida por nginx |

El workflow está en `.github/workflows/build-images.yml`. Corre en cada push a
`main`, en tags `v*` y manualmente. Publica `latest`, `main` y `sha-<corto>`.

## Requisitos del server

- Docker Engine + Docker Compose v2.
- El repo clonado, por ejemplo en `/opt/hexario`.
- Puertos 80 y 443 abiertos (Cloudflare proxied).
- Acceso a GHCR (paquetes públicos o `docker login ghcr.io` con un PAT que
  tenga `read:packages`).

## Primera puesta en marcha

### 1. DNS y Cloudflare

En Cloudflare, creá un registro `A`:

```text
hexario.thorque.com.ar -> <IP_DE_LA_VPS>   (Proxied / nube naranja)
```

En SSL/TLS → Overview:

- **Full (strict)** si usás un Cloudflare Origin Certificate.
- **Full** si usás un certificado self-signed.

No uses Flexible: el nginx del origen redirige HTTP a HTTPS.

### 2. Certificado del origen

Seguí `certs/README.md`. Como mínimo tienen que existir:

```text
infra/certs/origin.pem
infra/certs/origin.key
```

### 3. Variables de entorno

```bash
cd /opt/hexario/infra
cp .env.example .env
```

Editá `.env`:

- `DB_PASS`: password URL-safe (por ejemplo `openssl rand -hex 24`).
- `JWT_SECRET`: `openssl rand -hex 32`.
- `PUBLIC_URL=https://hexario.thorque.com.ar`.
- `IMAGE_TAG=latest` para el primer deploy.

No commitees `infra/.env`.

### 4. Login a GHCR

Si los paquetes son privados:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u <tu-usuario> --password-stdin
```

Si los hacés públicos desde GitHub Packages, este paso no hace falta.

### 5. Levantar

```bash
cd /opt/hexario/infra
docker compose pull
docker compose up -d
docker compose ps
```

La API corre las migraciones al arrancar (`node dist/src/db/migrate.js` antes
del server). No hay que correr migraciones a mano.

Ver logs:

```bash
docker compose logs -f api nginx
```

## Deploy automático desde GitHub Actions

El job `deploy` corre después del build sólo si:

- la rama es `main`, y
- la variable de repositorio `ENABLE_DEPLOY` vale `true`.

Hace SSH a la VPS, entra a `VPS_APP_DIR`, `git pull --ff-only`, y ejecuta
`docker compose pull && docker compose up -d` con el tag `sha-<corto>` recién
buildeado.

### Variables del repositorio

| Variable | Ejemplo | Para qué |
|---|---|---|
| `VPS_HOST` | `203.0.113.10` | IP o host de la VPS |
| `VPS_USER` | `deploy` | usuario SSH |
| `VPS_PORT` | `22` | puerto SSH |
| `VPS_APP_DIR` | `/opt/hexario` | carpeta del repo en la VPS |
| `ENABLE_DEPLOY` | `true` | habilita el job de deploy |
| `PUBLIC_APP_URL` | `https://hexario.thorque.com.ar/app` | URL que usa la landing para linkear a la PWA |
| `DOCKER_PLATFORMS` | `linux/amd64` | plataformas a buildear (podés usar `linux/amd64,linux/arm64`) |

### Secrets del repositorio

| Secret | Para qué |
|---|---|
| `VPS_SSH_KEY` | clave privada SSH del usuario de deploy |
| `GHCR_USER` | usuario de GitHub para `docker login` en la VPS (opcional si los paquetes son públicos) |
| `GHCR_TOKEN` | PAT con `read:packages` (opcional si los paquetes son públicos) |

El deploy asume que el repo ya está clonado en `VPS_APP_DIR` y que existe
`infra/.env` con los secretos de producción. `infra/.env` y `infra/certs/` no
se tocan con `git pull` porque están ignorados.

## Actualizar y volver atrás

Actualizar a la última imagen:

```bash
cd /opt/hexario/infra
docker compose pull
docker compose up -d --remove-orphans
```

Fijar una versión concreta (rollback):

```bash
cd /opt/hexario/infra
IMAGE_TAG=sha-abc1234 docker compose pull
IMAGE_TAG=sha-abc1234 docker compose up -d --remove-orphans
```

Los tags `sha-*` salen del workflow. También podés usar `latest`.

## Backups

```bash
cd /opt/hexario/infra
docker compose exec -T postgres pg_dump -U hexario hexario > backup-$(date +%F).sql
```

Restaurar:

```bash
cat backup.sql | docker compose exec -T postgres psql -U hexario -d hexario
```

## Notas

- Postgres no publica puerto al host: sólo lo ve la red de compose.
- El healthcheck de la API es `GET /health`; nginx expone `GET /healthz`.
- `/api/` se proxya a la API quitando el prefijo; el back sigue montando
  `/user`, `/territories`, etc.
- `/app/` se proxya a la imagen de la PWA quitando el prefijo. La PWA fue
  buildeada con `VITE_BASE_PATH=/app/` y `VITE_API_URL=/api`.
- Si cambiás de dominio, actualizá `PUBLIC_URL`, el `server_name` de
  `nginx/default.conf`, el certificado y el DNS.
