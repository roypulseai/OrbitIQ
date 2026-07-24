FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api-gateway/package.json ./apps/api-gateway/
RUN npm ci --workspace=@orbitiq/api-gateway --workspace=@orbitiq/design-system --workspace=@orbitiq/shared

# Copy source
COPY packages/design-system/ ./packages/design-system/
COPY packages/shared/ ./packages/shared/
COPY apps/api-gateway/ ./apps/api-gateway/

# Build
RUN npx turbo build --filter=@orbitiq/api-gateway

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/apps/api-gateway/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api-gateway/package.json ./

ENV NODE_ENV=production
ENV PORT=4001

EXPOSE 4001

CMD ["node", "dist/main"]
