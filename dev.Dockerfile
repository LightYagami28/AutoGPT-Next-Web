FROM node:20-alpine

RUN apk update && apk add --no-cache openssl dumb-init

WORKDIR /app

# Build arguments
ARG NEXTAUTH_SECRET
ARG DATABASE_URL
ARG NEXTAUTH_URL
ARG SKIP_ENV_VALIDATION=1

# Environment variables
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-"$(openssl rand -base64 32)"}
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV SKIP_ENV_VALIDATION=$SKIP_ENV_VALIDATION
ENV NODE_ENV=development

# Copy dependency files first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Prevent Husky errors by disabling the `prepare` script
RUN npm pkg set scripts.prepare="exit 0"

# Disable postinstall to avoid Prisma generation during Docker build
RUN npm pkg set scripts.postinstall="exit 0"

# Install dependencies with npm ci for reproducibility
RUN npm ci --verbose

# Re-enable postinstall for development (will run on container start)
RUN npm pkg set scripts.postinstall="prisma generate"

# Copy application code
COPY . .

EXPOSE 3000

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

CMD ["sh", "entrypoint.sh"]
