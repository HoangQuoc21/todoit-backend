# Create project

```bash
pnpm init -y

pnpm add express cors tsx

pnpm add @types/express @types/cors @types/node typescript -D
```

# Integrate lint & prettier

```bash
pnpm create @eslint/config@latest

pnpm add jiti -D

pnpm add eslint-config-prettier eslint-plugin-prettier -D
```

# Integrate swagger

```bash
pnpm add swagger-jsdoc swagger-ui-express

pnpm add @types/swagger-jsdoc @types/swagger-ui-express -D
```

# Run project

```bash
pnpm install

pnpm start:dev
```

# Push image to Docker Hub
```bash
docker login

docker compose up --d

docker images

# If the image in DockerFile is named "<dockerhub_username>/<repository_name>:<tag>" Then doesn't need to run this command
docker tag <local_image_name>:<local_tag> <dockerhub_username>/<repository_name>:<tag>

docker push <dockerhub_username>/<repository_name>:<tag>
```
