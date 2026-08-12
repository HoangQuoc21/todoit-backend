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

```bash
bun install

bun start:dev
```

# Local Docker workflow

```bash
# Build and run locally with Docker Compose
docker compose up -d --build

# View running container logs
docker compose logs -f

# Stop container
docker compose down
```

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
