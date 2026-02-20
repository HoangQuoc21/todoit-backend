# Create project

```bash
pnpm init -y

pnpm add express cors

pnpm add @types/express @types/cors @types/node typescript tsx -D
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
