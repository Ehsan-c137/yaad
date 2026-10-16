FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate

# Builder stage
FROM base AS builder
WORKDIR /app

# Native compilation dependencies if required by native modules
RUN apk add --no-cache python3 make g++

# Copy workspace configuration and lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy required workspace packages
COPY packages/config ./packages/config
COPY packages/core ./packages/core
COPY apps/api ./apps/api

# Install dependencies across the workspace packages needed by api
RUN pnpm install --frozen-lockfile --trust-lockfile

# Build NestJS API
RUN pnpm --filter @yaad/api build

# Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy workspace root metadata and node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules

# Copy workspace dependencies and built api
COPY --from=builder /app/packages/config ./packages/config
COPY --from=builder /app/packages/core ./packages/core
COPY --from=builder /app/apps/api ./apps/api

WORKDIR /app/apps/api

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]
