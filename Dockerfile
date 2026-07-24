# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine

# Use production environment by default.
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker caching.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy the rest of the source files into the image.
COPY --chown=bun:bun . .

# Run the application as a non-root user.
USER bun

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
ENTRYPOINT ["bun", "start:prod"]
