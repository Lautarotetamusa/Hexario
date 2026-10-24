# Deploy de producción

Hexario corre en la VPS compartida de Thorque, detrás del Traefik que ya
existe en esa máquina (Coolify y los demás stacks usan el mismo).

```text
Cloudflare (opcional)
        |
        v
Traefik :80/:443  (LE, red edge)
        |
        v
nginx interno de Hexario  (este compose)
        |
        +-- /       -> landing
        +-- /app/   -> PWA
        +-- /api/   -> API
```

El nginx de este compose **no publica 80/443**: Traefik ya los ocupa. Nginx
se conecta a la red externa `edge`, Traefik lo descubre por labels y le manda
`hexario.thorque.com.ar`. El certificado lo emite Traefik con Let's Encrypt
(HTTP-01), igual que el resto de los dominios de Thorque.

## Imágenes

GitHub Actions publica tres imágenes en GHCR:

| Imagen | Contenido |
|---|---|
| `ghcr.io/lautarotetamusa/hexario-back` | API Node/Express + migraciones |
| `ghcr.io/lautarotetamusa/hexario-app` | PWA estática servida por nginx |
| `ghcr.io/lautarotetamusa/hexario-landing` | Landing estática servida por nginx |

El workflow está en `.github/workflows/build-images.yml`. Corre en cada push a
`main`, en tags `v*` y manualmente. Publica `latest`, `main` y `sha-<corto>`.
Los paquetes quedaron públicos; si los pasás a privados, configurá
`GHCR_USER` y `GHCR_TOKEN` (ver abajo).

## Primera puesta en marcha

### 1. Clonar el repo

```bash
git clone https://github.com/Lautarotetamusa/Hexario.git /home/deploy/hexario
```

El deploy automático asume que el repo está en `VPS_APP_DIR`
(`/home/deploy/hexario` por defecto) y que existe `infra/.env`.

### 2. Variables de entorno

```bash
cd /home/deploy/hexario/infra
cp .env.example .env
```

Editá `.env`:

- `DB_PASS`: password URL-safe (por ejemplo `openssl rand -hex 24`).
- `JWT_SECRET`: `openssl rand -hex 32`.
- `PUBLIC_URL=https://hexario.thorque.com.ar`.
- `IMAGE_TAG=latest` para el primer deploy.

No commitees `infra/.env`.

### 3. Levantar

```bash
cd /home/deploy/hexario/infra
docker compose pull
docker compose up -d
docker compose ps
```

La API corre las migraciones al arrancar. Traefik detecta el router por los
labels del servicio `nginx` y pide el certificado la primera vez.

Ver logs:

```bash
docker compose logs -f api nginx
docker logs -f traefik-traefik-1
```

### 4. Cloudflare

El registro DNS puede estar directo (gris) o proxied (naranja). Para que
Cloudflare quede delante:

1. Asegurate de que Traefik ya emitió el certificado (probá
   `https://hexario.thorque.com.ar` directo primero).
2. En Cloudflare, poné el registro `A` de `hexario` apuntando a la IP de la
   VPS y activá el proxy (nube naranja).
3. SSL/TLS → Overview: **Full (strict)**. Traefik ya tiene un certificado
   válido de Let's Encrypt; no hace falta Origin Certificate.
4. Si Cloudflare estaba en Flexible, cambialo a Full (strict) después de que
   el certificado de Traefik esté emitido.

No se usa `infra/certs/`: el TLS lo maneja Traefik.

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
| `VPS_HOST` | `2.25.198.60` | IP o host de la VPS |
| `VPS_USER` | `deploy` | usuario SSH |
| `VPS_PORT` | `22` | puerto SSH |
| `VPS_APP_DIR` | `/home/deploy/hexario` | carpeta del repo en la VPS |
| `ENABLE_DEPLOY` | `true` | habilita el job de deploy |
| `PUBLIC_APP_URL` | `https://hexario.thorque.com.ar/app` | URL que usa la landing para linkear a la PWA |
| `DOCKER_PLATFORMS` | `linux/amd64` | plataformas a buildear |

### Secrets del repositorio

| Secret | Para qué |
|---|---|
| `VPS_SSH_KEY` | clave privada SSH del usuario de deploy (sin passphrase para el runner) |
| `GHCR_USER` | usuario de GitHub para `docker login` en la VPS (opcional si los paquetes son públicos) |
| `GHCR_TOKEN` | PAT con `read:packages` (opcional si los paquetes son públicos) |

El deploy asume que el repo ya está clonado en `VPS_APP_DIR` y que existe
`infra/.env`. `infra/.env` no se toca con `git pull` porque está ignorado.

## Actualizar y volver atrás

Actualizar a la última imagen:

```bash
cd /home/deploy/hexario/infra
docker compose pull
docker compose up -d --remove-orphans
```

Fijar una versión concreta (rollback):

```bash
cd /home/deploy/hexario/infra
IMAGE_TAG=sha-abc1234 docker compose pull
IMAGE_TAG=sha-abc1234 docker compose up -d --remove-orphans
```

Los tags `sha-*` salen del workflow. También podés usar `latest`.

## Backups

```bash
cd /home/deploy/hexario/infra
docker compose exec -T postgres pg_dump -U hexario hexario > backup-$(date +%F).sql
```

Restaurar:

```bash
cat backup.sql | docker compose exec -T postgres psql -U hexario -d hexario
```

## Notas

- El compose no publica 80/443; si lo movés a otra VPS sin Traefik, hay que
  agregar un proxy y el label de Traefik correspondiente.
- Postgres no publica puerto al host: sólo lo ve la red de compose.
- El healthcheck de la API es `GET /health`; nginx expone `GET /healthz`.
- `/api/` se proxya a la API quitando el prefijo; el back sigue montando
  `/user`, `/territories`, etc.
- `/app/` se proxya a la imagen de la PWA quitando el prefijo. La PWA fue
  buildeada con `VITE_BASE_PATH=/app/` y `VITE_API_URL=/api`.
- Si cambiás de dominio, actualizá `PUBLIC_URL`, el label de Traefik en
  `docker-compose.yml`, el DNS y el certificado de Traefik.
