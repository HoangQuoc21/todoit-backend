# Create project

```bash
bun init -y

bun add express cors tsx

bun add @types/express @types/cors @types/node typescript -d
```

# Integrate lint & prettier

```bash
bun create @eslint/config@latest

bun add jiti -d

bun add eslint-config-prettier eslint-plugin-prettier -d
```

# Integrate swagger

```bash
bun add swagger-jsdoc swagger-ui-express

bun add @types/swagger-jsdoc @types/swagger-ui-express -d
```

# Run project locally

### Option A: Local Dev (Fast iteration with Dockerized DB) - Recommended
Run only MongoDB in Docker in the background, and run the backend server in your terminal with hot reload:

```bash
# 1. Start MongoDB in Docker (background)
docker compose up mongodb -d

# 2. Run backend in terminal with hot reload
bun install
bun start:dev
```
> **How it works:**
> - When run directly in terminal, `app.ts` connects to `127.0.0.1:27017` (which routes into the Docker MongoDB container via the exposed port).
> - Credentials are passed via Mongoose options (`auth: { username, password }`) rather than embedded in the URI to prevent parsing errors with special characters (`@`, `#`, `%`).

---

### Option B: Full Docker Stack (Simulate production / VPS)
Run both backend and MongoDB containerized with Docker Compose:

```bash
# Build and run all services in background
docker compose up -d --build

# View running container logs
docker compose logs -f

# Stop containers
docker compose down
```
> **How it works:**
> - Inside Docker, `backend-server` cannot reach MongoDB at `127.0.0.1` (which refers to itself).
> - Docker Compose sets `MONGO_HOST: mongodb` so the backend connects to the `mongodb` service directly over Docker's internal network on port `27017`.

---

# Optional: Publish Multi-Platform Image to Docker Hub

```bash
# 1. Login to Docker Hub
docker login

# 2. Setup buildx builder (only needed once)
docker buildx create --name my-builder --use || docker buildx use my-builder
docker buildx inspect --bootstrap

# 3. Build & push multi-arch image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t todoit-backend:latest \
  --push .
```

# VPS Deployment

```bash
# On your VPS (with repository cloned and .env configured), run:
chmod +x deploy.sh
./deploy.sh
```
