FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy workspace configuration and lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy required workspace packages
COPY packages/config ./packages/config
COPY packages/core ./packages/core
COPY packages/ui ./packages/ui
COPY apps/web ./apps/web

# Install dependencies across workspace packages
RUN pnpm install --frozen-lockfile --trust-lockfile

# Build Vite web bundle
RUN pnpm --filter @yaad/web build

# Runner stage using lightweight Nginx
FROM nginx:alpine AS runner

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration with reverse proxy and SPA routing
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
