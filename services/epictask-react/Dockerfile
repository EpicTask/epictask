# Multi-stage Dockerfile for epictask-react (Expo + Expo Router)
# Targets:
#  - development: runs Expo dev server inside container
#  - production: builds static web and serves on port 3000

# Use Debian-based Node to ensure prebuilt native binaries work (e.g. sharp)
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Helpful env for CI/containers and file watching over bind mounts
ENV CI=true \
    EXPO_NO_TELEMETRY=1 \
    EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
    HOST=0.0.0.0 \
    CHOKIDAR_USEPOLLING=1 \
    WATCHPACK_POLLING=true

# Minimal toolchain often needed by Expo/React Native deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 g++ make git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ============================
# Development target
# ============================
FROM base AS development

# In docker-compose, the source is bind-mounted to /app
# and /app/node_modules is an anonymous volume to preserve container deps.
# So we don't need to copy the source here.

# Common Expo/Metro ports (compose maps 19006/19001/19002)
EXPOSE 19006 19001 19002 8081

# Start Expo dev server (uses package.json "start": "expo start")
CMD ["npm", "start"]

# ============================
# Build target (web export)
# ============================
FROM base AS build
ENV NODE_ENV=production

# Copy full source for production export
COPY . .

# Expo SDK 53: export static web bundle (app.json web.output=static)
# Output defaults to ./dist when using --platform web; keep explicit for clarity
RUN npx expo export --platform web --output-dir dist

# ============================
# Production target (runtime)
# ============================
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Lightweight static file server that binds to 3000 (matches docker-compose)
RUN npm i -g serve@14

# Copy exported static assets
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
