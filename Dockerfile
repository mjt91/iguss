# iGuss - ONCE-compatible Docker image
# Requirements:
# - Serves HTTP on port 80
# - Healthcheck endpoint at /up
# - Persistent data in /storage

FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy application files
COPY server.js ./
COPY public/ ./public/

# Create storage directory for persistent data
# Use a setup script to ensure proper permissions on startup
RUN mkdir -p /storage

# Create startup script that sets permissions and runs the app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'chown -R node:node /storage 2>/dev/null || true' >> /app/start.sh && \
    echo 'exec su-exec node node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Install su-exec for running as non-root user
RUN apk add --no-cache su-exec

# Expose port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/up || exit 1

# Start the server with the startup script
CMD ["/app/start.sh"]