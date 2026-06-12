# Docker

The production image builds the Vite app with pnpm and serves static assets from Nginx on port `8080`.

## Build

```bash
docker build -t smart-factory-sim:local .
```

## Run

```bash
docker run --rm -p 8080:8080 smart-factory-sim:local
```

Open `http://localhost:8080`.

## Compose

```bash
docker compose up --build
```

Stop the service:

```bash
docker compose down
```

## Runtime Layout

| File | Purpose |
|---|---|
| [Dockerfile](../Dockerfile) | Multi-stage pnpm build and Nginx runtime image. |
| [.dockerignore](../.dockerignore) | Keeps local build artifacts, dependencies, and media out of the Docker context. |
| [deploy/nginx/default.conf](../deploy/nginx/default.conf) | Nginx static SPA routing and cache headers. |
| [docker-compose.yml](../docker-compose.yml) | Local container orchestration and healthcheck. |

## Validation

```bash
pnpm build
docker build -t smart-factory-sim:local .
docker run --rm -p 8080:8080 smart-factory-sim:local
```

The container should return HTTP 200 at `http://localhost:8080`.
