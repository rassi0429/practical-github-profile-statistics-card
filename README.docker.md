# Docker Deployment Guide

This guide explains how to run the GitHub Profile Statistics Card service using Docker.

## Quick Start

### Using Docker Compose (Recommended)

1. **Production deployment:**
   ```bash
   docker-compose up -d
   ```

2. **Development mode:**
   ```bash
   docker-compose --profile dev up -d app-dev
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Using Docker Commands

1. **Build the image:**
   ```bash
   npm run docker:build
   ```

2. **Run the container:**
   ```bash
   npm run docker:run
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build production Docker image |
| `npm run docker:build-dev` | Build development Docker image |
| `npm run docker:run` | Run production container |
| `npm run docker:run-dev` | Run development container with volume mounting |
| `npm run compose:up` | Start with docker-compose |
| `npm run compose:down` | Stop docker-compose services |
| `npm run compose:dev` | Start development profile |
| `npm run compose:logs` | View container logs |

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# GitHub API token (optional but recommended)
GITHUB_TOKEN=your_github_token_here

# Server port (default: 3000)
PORT=3000

# Node environment
NODE_ENV=production
```

### Docker Compose Services

#### Production Service (`app`)
- **Image:** Built from main Dockerfile
- **Port:** 3000:3000
- **Features:** 
  - Optimized for production
  - Health checks enabled
  - Persistent cache volume
  - Log rotation

#### Development Service (`app-dev`)
- **Image:** Built from Dockerfile.dev
- **Port:** 3000:3000
- **Features:**
  - Hot reload with volume mounting
  - All dependencies included
  - Development mode

## Health Checks

The container includes built-in health checks:

```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost:3000/api/cache/stats
```

## Persistent Data

SQLite cache database is persisted using Docker volumes:

- **Volume:** `cache_data`
- **Mount point:** `/app/cache`
- **Contents:** SQLite database files

## GitHub Actions CI/CD

### Automated Builds

The repository includes GitHub Actions workflows:

1. **`docker-build.yml`** - Builds and pushes Docker images
2. **`ci.yml`** - Runs tests and security scans

### Container Registry

Images are automatically built and pushed to GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/your-username/github-profile-statistics-card:latest

# Run from registry
docker run -p 3000:3000 --env-file .env \
  ghcr.io/your-username/github-profile-statistics-card:latest
```

## Production Deployment

### Docker Swarm

```yaml
# docker-stack.yml
version: '3.8'
services:
  app:
    image: ghcr.io/your-username/github-profile-statistics-card:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    secrets:
      - github_token
    volumes:
      - cache_data:/app/cache
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

volumes:
  cache_data:

secrets:
  github_token:
    external: true
```

### Kubernetes

```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: github-stats-card
spec:
  replicas: 3
  selector:
    matchLabels:
      app: github-stats-card
  template:
    metadata:
      labels:
        app: github-stats-card
    spec:
      containers:
      - name: app
        image: ghcr.io/your-username/github-profile-statistics-card:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: GITHUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: github-token
              key: token
        volumeMounts:
        - name: cache-storage
          mountPath: /app/cache
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /api/cache/stats
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/cache/stats
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: cache-storage
        persistentVolumeClaim:
          claimName: cache-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: github-stats-card-service
spec:
  selector:
    app: github-stats-card
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Monitoring

### Container Metrics

```bash
# Resource usage
docker stats github-stats-card

# Logs
docker-compose logs -f --tail=100

# Health status
curl http://localhost:3000/api/cache/stats
```

### Cache Management

```bash
# View cache statistics
curl http://localhost:3000/api/cache/stats

# Manual cache cleanup
curl -X POST http://localhost:3000/api/cache/cleanup
```

## Troubleshooting

### Common Issues

1. **Build failures:**
   ```bash
   # Clean build cache
   docker builder prune
   
   # Rebuild without cache
   docker build --no-cache -t github-stats-card .
   ```

2. **Permission issues:**
   ```bash
   # Check container logs
   docker-compose logs app
   
   # Exec into container
   docker-compose exec app sh
   ```

3. **Cache database issues:**
   ```bash
   # Reset cache volume
   docker-compose down -v
   docker-compose up -d
   ```

## Security

- Container runs as non-root user (`node`)
- Regular security scans with Trivy
- Multi-stage builds for minimal attack surface
- No sensitive data in images
- Environment-based configuration

## Performance

- **Image size:** ~150MB (Alpine-based)
- **Memory usage:** ~50-100MB at runtime
- **CPU usage:** Minimal (Node.js event loop)
- **Cache performance:** SQLite with 3-day TTL