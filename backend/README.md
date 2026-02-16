# Create project
```bash
bun init -y

bun add express

bun add -d @types/express @types/node typescript
```

# Integrate lint
```bash
bun create @eslint/config@latest

bun add jiti -d
```

# Run project
```bash
bun install

bun start
```