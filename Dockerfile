# ===================================================
# Dockerfile - Production Express Backend API
# ===================================================
FROM node:20-alpine AS base

# Install system dependencies needed for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy server application code
COPY server ./server
COPY public ./public

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Run as non-root user for cloud container security
USER node

# Start API service
CMD ["node", "server/index.js"]
