# OMoney Platform

Production-oriented monorepo for a Persian-first manual remittance and exchange service.

## Architecture

- `apps/web`: bilingual public website and user dashboard, Next.js App Router
- `apps/admin`: internal operations dashboard, Next.js App Router
- `apps/api`: NestJS API, Prisma ORM, JWT auth, RBAC, upload abstraction
- Media CMS: centralized image/video library with placement-driven rendering for public sections
- `infra/caddy`: reverse proxy routing for `omoney.online`, `www`, `admin`, and `api`
- `storage/uploads`: local upload backend for MVP
- `storage/logs`: application log mount

## Local setup

1. Copy `.env.example` to `.env` and replace all secrets.
2. Install Node.js 22+ and enable Corepack.
3. Run `pnpm install`.
4. Run `pnpm db:generate`.
5. Start infrastructure with `docker compose up -d postgres redis`.
6. Run `pnpm --filter @omoney/api prisma:migrate`.
7. Run `pnpm db:seed`.
8. Run `pnpm dev`.

## Production deployment on Ubuntu 24.04

Target host: `147.90.13.11`
Actual observed OS on the current VPS: `Ubuntu 22.04.5 LTS`, not Ubuntu 24.04.

### 1. Install Docker Engine and Compose plugin

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git make
sudo systemctl enable --now docker
docker --version
docker compose version
```

These commands follow Docker's current Ubuntu installation path and install the Compose plugin rather than the legacy standalone binary. 

### 2. Prepare application directory

```bash
sudo mkdir -p /opt/omoney
sudo chown "$USER":"$USER" /opt/omoney
cd /opt/omoney
git clone <your-repository-url> .
cp .env.production.example .env.production
chmod 600 .env.production
```

Edit `.env.production` and replace every placeholder secret:

```bash
nano .env.production
```

Required first-boot changes:

- `POSTGRES_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `DEFAULT_ADMIN_PASSWORD`
- `WHATSAPP_NUMBER`
- `MEDIA_ALLOWED_UPLOAD_MIME_TYPES`

### 3. Confirm Cloudflare DNS and SSL mode

- `A omoney.online -> 147.90.13.11`
- `A www.omoney.online -> 147.90.13.11`
- `A admin.omoney.online -> 147.90.13.11`
- `A api.omoney.online -> 147.90.13.11`
- Proxy status: enabled
- SSL/TLS mode: `Full (strict)` when an origin certificate is installed; otherwise do not claim strict origin validation.

### 4. Start the production stack

```bash
cd /opt/omoney
chmod +x scripts/*.sh
make up
make seed
make health
```

The API container runs `prisma generate` and `prisma migrate deploy` during startup with bounded retries. Seeding is intentionally explicit through `make seed` so a restart cannot unexpectedly recreate or mutate bootstrap data.

### 5. Day-1 operating commands

```bash
make logs
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml exec api wget -qO- http://localhost:4000/health
curl -I http://omoney.online
curl -I http://www.omoney.online
curl -I http://admin.omoney.online
curl -I http://api.omoney.online/health
make backup
```

Use the public HTTPS URLs for end-user verification after Cloudflare DNS has propagated:

```bash
curl -I https://omoney.online
curl -I https://www.omoney.online
curl -I https://admin.omoney.online
curl -I https://api.omoney.online/health
```

### Runtime verification checklist

1. `docker compose ... ps` shows `healthy` for `postgres`, `redis`, `api`, `web`, and `admin`.
2. `/health` returns `status: ok` and a current timestamp.
3. `omoney.online` and `www.omoney.online` render the public site.
4. `admin.omoney.online` renders the admin UI.
5. `api.omoney.online/health` returns through Caddy and Cloudflare.
6. Uploaded files survive `docker compose restart api`.
7. Media uploaded in `/media` can be published, assigned to a placement, replaced, and reflected on the public site without rebuilding web containers.
8. `make backup` creates a new file under `backups/`.
9. PostgreSQL and Redis volumes persist after `docker compose down` followed by `make up`.
10. Caddy returns security headers such as `Strict-Transport-Security`, `X-Content-Type-Options`, and `X-Frame-Options`.
11. `.env.production` remains mode `600` and is not tracked by Git.

## Security notes

- Argon2 password hashing
- JWT access and refresh token structure
- RBAC guard for admin-only routes
- Helmet headers and request validation
- Upload type and size restrictions
- Internal Docker network for data services
- Cloudflare-terminated TLS with Caddy reverse proxy on the private edge
- refresh-token session persistence for user auth
- non-root app containers
- read-only application filesystems with explicit writable mounts
- named volumes for PostgreSQL, Redis, uploads, and logs
- reverse-proxy security headers and forwarded client metadata
- public media URLs are versioned with `updatedAt` query parameters so replacements invalidate browser/CDN caches without redeploys

## Media CMS

- Public placements are resolved from `GET /media/placements` and cached for 60 seconds.
- Public files are served through versioned URLs under `/media/files/:id/:variant`.
- Supported variants: desktop source, thumbnail/poster, and mobile fallback.
- Images receive generated WebP thumbnail and mobile variants when the admin does not upload dedicated alternatives.
- Video delivery supports poster images, muted autoplay metadata, mobile fallbacks, and byte-range streaming for efficient playback.
- Admin UI: `https://admin.omoney.online/media`
- Current placements:
  - `HOME_HERO`
  - `HOME_SECURITY`
  - `HOME_KYC`
  - `HOME_CORRIDORS`
  - `HOME_FAQ`
  - `ABOUT_HERO`
  - `CONTACT_HERO`
  - `LOGIN_HERO`
  - `REGISTER_HERO`
  - `DASHBOARD_EMPTY`
  - `TRANSFER_EMPTY`
  - `KYC_EMPTY`
  - `SECURITY_SECTION`
  - `FOOTER_BACKGROUND`

## Exchange-rate engine phase 1

- Public endpoint: `GET /exchange-rates/homepage`
- Provider chain: `navasan` primary, `manual` fallback
- Navasan credentials are backend-only through `NAVASAN_API_KEY`
- Public responses expose Toman only; provider IRR values are normalized by dividing by 10
- Redis holds the latest homepage response, PostgreSQL stores immutable snapshots, and unavailable provider fields are returned calmly as `unavailable: true`

## Required environment hardening

- Use randomly generated 64+ character JWT secrets.
- Replace the seeded admin password before first login.
- Restrict SSH to key-based auth and disable password login on the VPS.
- Configure encrypted offsite database backups and retention.
- Put Cloudflare in `Full (strict)` mode when an origin certificate is installed.

For a real launch, add:

- refresh-token rotation persistence
- CSRF double-submit token for cookie-authenticated browser endpoints
- object storage adapter for R2/S3
- antivirus scanning for uploaded files
- structured audit log middleware around all admin mutations
- observability stack, alerting, and encrypted offsite backups

## Logging strategy

- Application containers write structured process logs to stdout/stderr for collection by the Docker logging driver.
- API writable log storage is mounted at `/app/storage/logs` for future file-based sinks or sidecar shipping.
- PostgreSQL slow statements are logged with `log_min_duration_statement=500`.
- `make logs` is the first-response command; production should later add centralized log shipping and retention.

## Deployment notes

- The API image uses `node:22-bookworm-slim`. An earlier Alpine-based runtime failed with Prisma engine resolution issues during deployment, so the API image was moved to Debian Bookworm slim and must not be switched back to Alpine without retesting the full Prisma migration path.
