# Production Deployment Guide

This guide covers deploying the GitHub Profile Statistics Card service to production environments.

## Quick Start

### 1. Basic Deployment

```bash
# Clone the repository
git clone https://github.com/rassi0429/practical-github-profile-statistics-card.git
cd practical-github-profile-statistics-card

# Create environment file
cp .env.production.example .env.production
# Edit .env.production with your settings

# Deploy
./deploy.sh
```

### 2. Deployment with Nginx Proxy

```bash
./deploy.sh --with-nginx
```

### 3. Deployment with Monitoring

```bash
./deploy.sh --with-monitoring
```

## Configuration

### Environment Variables

Create `.env.production` file:

```env
# Required: GitHub API token for higher rate limits
GITHUB_TOKEN=ghp_your_token_here

# Optional: Server configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `public_repo` scope
3. Add the token to `.env.production`

## Deployment Options

### Using Docker Compose

```bash
# Basic deployment
docker-compose -f docker-compose.prod.yml up -d

# With nginx proxy
docker-compose -f docker-compose.prod.yml --profile nginx up -d

# With monitoring stack
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# All services
docker-compose -f docker-compose.prod.yml --profile nginx --profile monitoring up -d
```

### Using Deployment Script

The `deploy.sh` script provides a convenient way to manage deployments:

```bash
# Show help
./deploy.sh --help

# Basic deployment
./deploy.sh

# Full deployment with all services
./deploy.sh --with-nginx --with-monitoring

# Stop services
./deploy.sh --stop

# View logs
./deploy.sh --logs

# Check status
./deploy.sh --status
```

## Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Client      │    │      Nginx      │    │   Node.js App   │
│   (Browser)     │◄──►│  Reverse Proxy  │◄──►│   (Port 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       ▼
                                │               ┌─────────────────┐
                                │               │  SQLite Cache   │
                                │               │   (3-day TTL)   │
                                │               └─────────────────┘
                                ▼
                       ┌─────────────────┐
                       │   Monitoring    │
                       │ Prometheus +    │
                       │    Grafana      │
                       └─────────────────┘
```

## Service Details

### Main Application (`app`)

- **Image:** `ghcr.io/rassi0429/practical-github-profile-statistics-card:latest`
- **Port:** 3000
- **Health Check:** `/api/cache/stats`
- **Resource Limits:** 512M memory, 0.5 CPU cores

### Nginx Proxy (`nginx`)

- **Ports:** 80 (HTTP), 443 (HTTPS)
- **Features:**
  - Rate limiting (10 req/s for API)
  - GZIP compression
  - Security headers
  - CORS headers for SVG embedding
  - SSL termination (when configured)

### Monitoring Stack (`monitoring`)

#### Prometheus
- **Port:** 9090
- **Data Retention:** 30 days
- **Metrics:** Application and system metrics

#### Grafana
- **Port:** 3001
- **Default Login:** admin/admin
- **Dashboards:** Pre-configured for the application

## SSL/HTTPS Setup

### 1. Obtain SSL Certificate

```bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
sudo chown $(whoami):$(whoami) ./ssl/*.pem
```

### 2. Update Nginx Configuration

Edit `nginx/conf.d/default.conf` and uncomment the HTTPS server block:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of SSL configuration
}
```

### 3. Deploy with HTTPS

```bash
./deploy.sh --with-nginx
```

## Monitoring and Maintenance

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/cache/stats

# Nginx health
curl http://localhost/health

# Container status
docker-compose -f docker-compose.prod.yml ps
```

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs app -f

# View nginx logs
docker-compose -f docker-compose.prod.yml logs nginx -f

# View all logs
./deploy.sh --logs
```

### Cache Management

```bash
# View cache statistics
curl http://localhost:3000/api/cache/stats

# Manual cache cleanup
curl -X POST http://localhost:3000/api/cache/cleanup

# Reset cache (remove volume)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Performance Monitoring

Access Grafana at `http://localhost:3001`:
- Username: `admin`
- Password: `admin` (change on first login)

Key metrics to monitor:
- Response times
- Request rates
- Cache hit rates
- Memory usage
- CPU usage

## Scaling and High Availability

### Load Balancing

For high traffic, deploy multiple instances:

```yaml
# docker-compose.scale.yml
services:
  app:
    # ... existing configuration
    deploy:
      replicas: 3
  
  nginx:
    # Update upstream configuration for load balancing
```

### Database Considerations

The SQLite cache is local to each instance. For shared caching:

1. **Redis Cache** (recommended for multi-instance):
   ```yaml
   redis:
     image: redis:alpine
     volumes:
       - redis_data:/data
   ```

2. **Shared Volume** (for single-host scaling):
   ```yaml
   volumes:
     cache_data:
       driver: local
       driver_opts:
         type: nfs
         o: addr=nfs-server,rw
   ```

## Backup and Recovery

### Database Backup

```bash
# Backup SQLite cache
docker run --rm \
  -v github-profile-statistics-card_cache_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/cache-$(date +%Y%m%d).tar.gz -C /data .
```

### Configuration Backup

```bash
# Backup all configuration
tar czf config-backup-$(date +%Y%m%d).tar.gz \
  .env.production \
  nginx/ \
  monitoring/ \
  docker-compose.prod.yml
```

### Recovery

```bash
# Restore cache
docker run --rm \
  -v github-profile-statistics-card_cache_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/cache-backup.tar.gz -C /data
```

## Troubleshooting

### Common Issues

1. **Container fails to start:**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs app
   
   # Check environment file
   cat .env.production
   ```

2. **API returns errors:**
   ```bash
   # Check GitHub token
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
   
   # Check cache status
   curl http://localhost:3000/api/cache/stats
   ```

3. **High memory usage:**
   ```bash
   # Check resource usage
   docker stats
   
   # Clear cache
   curl -X POST http://localhost:3000/api/cache/cleanup
   ```

### Resource Requirements

**Minimum Requirements:**
- RAM: 1GB
- CPU: 1 core
- Disk: 5GB
- Network: 100Mbps

**Recommended for Production:**
- RAM: 2GB
- CPU: 2 cores
- Disk: 20GB SSD
- Network: 1Gbps

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env.production` to version control
   - Use Docker secrets for sensitive data in production

2. **Network Security:**
   - Use HTTPS in production
   - Configure firewall rules
   - Regular security updates

3. **Container Security:**
   - Non-root user execution
   - Read-only filesystem where possible
   - Regular image updates

4. **API Security:**
   - Rate limiting enabled
   - CORS configured appropriately
   - Security headers set

## Updates and Maintenance

### Updating the Application

```bash
# Pull latest image
docker-compose -f docker-compose.prod.yml pull

# Restart with new image
./deploy.sh

# Or manual update
docker-compose -f docker-compose.prod.yml up -d
```

### Automated Updates

Set up a cron job for automatic updates:

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * cd /path/to/app && ./deploy.sh --no-pull > /var/log/deploy.log 2>&1
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/rassi0429/practical-github-profile-statistics-card/issues
- Documentation: See README.md and README.docker.md

---

*Last updated: $(date)*