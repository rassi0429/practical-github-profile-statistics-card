# Use official Node.js runtime as base image
FROM node:20-alpine

# Install required build dependencies and curl for health checks
RUN apk add --no-cache \
    curl \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create cache directory with proper permissions
RUN mkdir -p /app/cache && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/cache/stats || exit 1

# Start the application
CMD ["npm", "start"]