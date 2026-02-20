# Create project
```bash
pnpm init -y

pnpm add express cors

pnpm add @types/express @types/cors @types/node typescript tsx -D
```

# Integrate lint
```bash
pnpm create @eslint/config@latest

pnpm add jiti -D
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