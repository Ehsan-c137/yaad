
# Self-Hosting Yaad with Docker

Yaad can be self-hosted on any server, homelab, VPS, or NAS that supports Docker.

---

## Architecture Overview

The self-hosted stack consists of 3 containerized services orchestrated by `docker-compose.yml`:

```
Client Browser / Desktop App
         │
         ▼ (Port 8080 or custom $PORT)
 ┌───────────────────────────────────────┐
 │               yaad_web                │
 │         (Nginx + Pre-built SPA)       │
 └───────────────────┬───────────────────┘
                     │
        ┌────────────┴────────────┐
        │ /api, /auth, /sync      │ /collab (WebSockets)
        ▼                         ▼
 ┌───────────────────────────────────────┐
 │               yaad_api                │
 │        (NestJS + Yjs Sync)            │
 └───────────────────┬───────────────────┘
                     │
                     ▼
 ┌───────────────────────────────────────┐
 │             yaad_postgres             │
 │          (PostgreSQL 16)              │
 └───────────────────────────────────────┘
                     │
                     ▼
            [Persistent Volume]
               yaad_pgdata
```

* **Single Port Exposure**: All HTTP traffic, static assets, and WebSocket connections are routed through `yaad_web` (port `8080` by default).
* **Automatic Migrations**: When `yaad_api` starts, Drizzle automatically synchronizes the database schema.
* **Persistent Data**: Database state is preserved in the Docker volume `yaad_pgdata`.

---

## Quickstart (Under 2 Minutes)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/yaad.git
cd yaad
```

### 2. Configure Environment Variables
Copy the template and modify the secrets:
```bash
cp .env.example .env
```
Edit `.env` and set:
* `POSTGRES_PASSWORD`: A strong database password
* `JWT_SECRET`: A secure random secret for authentication tokens
* `PORT`: The external port you want to access Yaad on (default `8080`)

### 3. Launch with Docker Compose
```bash
docker compose up -d
```

### 4. Access Yaad
Open your browser and navigate to:
```
http://localhost:8080
```
(or your server's IP / domain).

---

## Useful Commands

| Task | Command |
| :--- | :--- |
| **Check logs** | `docker compose logs -f` |
| **Check API logs specifically** | `docker compose logs -f api` |
| **Stop the services** | `docker compose down` |
| **Update to latest code** | `git pull && docker compose up -d --build` |
| **Backup PostgreSQL** | `docker compose exec postgres pg_dump -U postgres yaad > backup.sql` |
| **Restore PostgreSQL** | `docker compose exec -T postgres psql -U postgres yaad < backup.sql` |

---

## Production Setup with HTTPS (Reverse Proxy)

If exposing Yaad to the internet, put a reverse proxy with SSL (such as **Caddy** or **Nginx Proxy Manager**) in front of port `8080`.

### Example Caddyfile:
```caddy
notes.yourdomain.com {
    reverse_proxy localhost:8080
}
```
Caddy automatically provisions free Let's Encrypt SSL certificates and handles WebSocket upgrading without additional configuration.

---

## Deploying with Coolify / Portainer

* In **Coolify**, create a new resource, select **Docker Compose**, and point it to this repository or paste the contents of `docker-compose.yml`.
* Enter your environment variables (`POSTGRES_PASSWORD`, `JWT_SECRET`) in the Coolify UI.
* Set your public domain name. Coolify will manage HTTPS certificates and automated deployments on every Git push.
