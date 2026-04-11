# Stage 1: Base image
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# IMPORTANT: You are using Puppeteer for PDF generation. Pure Alpine linux struggles with Chromium.
# Bookworm-slim (Debian) is much safer and stable for running puppeteer headless!
RUN apt-get update && apt-get install -y \
    openssl \
    chromium \
    libnss3 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the system Chromium and not download its own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Stage 2: Builder
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
# Install ALL dependencies (including devDependencies needed for typescript build)
RUN pnpm install --frozen-lockfile

COPY . .

# Generate Prisma Client
RUN pnpm run db:generate

# Build TypeScript code to /dist
RUN pnpm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
# We copy src because db:generate script looks for it inside src/prisma
COPY --from=builder /app/src ./src

# Install ONLY production dependencies to keep the image small
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma Client again (because the previous node_modules was ignored in this stage)
RUN pnpm run db:generate

# Expose typical backend port (adjust if your production port differs)
EXPOSE 4001

# Add a robust native Node.js healthcheck (Checks if port 4001 accepts TCP connections)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001', () => process.exit(0)).on('error', () => process.exit(1));" || exit 1

# Start the Node.js application
CMD ["pnpm", "start"]
