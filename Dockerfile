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

# Default port if not provided by environment
ENV PORT=3000

# Expose the port that the application listens on.
EXPOSE ${PORT}

# Run the application.
ENTRYPOINT ["bun", "start:prod"]
