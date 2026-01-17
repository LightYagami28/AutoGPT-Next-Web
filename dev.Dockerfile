FROM node:25-alpine

RUN apk update && apk add --no-cache openssl

WORKDIR /app

# Build arguments
ARG DATABASE_URL
ARG NEXTAUTH_URL
ARG SKIP_ENV_VALIDATION=1

# Environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV SKIP_ENV_VALIDATION=$SKIP_ENV_VALIDATION
ENV NODE_ENV=development

# Copy dependency files first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Prevent Husky errors, disable postinstall, install dependencies, and re-enable postinstall in a single RUN
RUN npm pkg set scripts.prepare="exit 0" && \
  npm pkg set scripts.postinstall="exit 0" && \
  npm ci --verbose && \
  npm pkg set scripts.postinstall="prisma generate"

# Copy application code
COPY . .

EXPOSE 3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001
USER nextjs

CMD ["sh", "entrypoint.sh"]
