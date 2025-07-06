#!/bin/bash

# GitHub Profile Statistics Card - Production Deployment Script
# Usage: ./deploy.sh [OPTIONS]

set -e

# Default values
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
PULL_LATEST=true
ENABLE_NGINX=false
ENABLE_MONITORING=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
GitHub Profile Statistics Card - Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -h, --help          Show this help message
    -f, --file FILE     Docker compose file (default: docker-compose.prod.yml)
    -e, --env FILE      Environment file (default: .env.production)
    --no-pull           Don't pull latest images before deployment
    --with-nginx        Enable nginx reverse proxy
    --with-monitoring   Enable prometheus/grafana monitoring
    --stop              Stop all services
    --logs              Show service logs
    --status            Show service status

EXAMPLES:
    $0                           # Basic deployment
    $0 --with-nginx             # Deploy with nginx proxy
    $0 --with-monitoring        # Deploy with monitoring stack
    $0 --stop                   # Stop all services
    $0 --logs                   # View logs

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        -e|--env)
            ENV_FILE="$2"
            shift 2
            ;;
        --no-pull)
            PULL_LATEST=false
            shift
            ;;
        --with-nginx)
            ENABLE_NGINX=true
            shift
            ;;
        --with-monitoring)
            ENABLE_MONITORING=true
            shift
            ;;
        --stop)
            print_header "Stopping all services..."
            docker-compose -f "$COMPOSE_FILE" down
            exit 0
            ;;
        --logs)
            docker-compose -f "$COMPOSE_FILE" logs -f
            exit 0
            ;;
        --status)
            docker-compose -f "$COMPOSE_FILE" ps
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Deployment start
print_header "Starting deployment of GitHub Profile Statistics Card"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
    print_error "Compose file '$COMPOSE_FILE' not found."
    exit 1
fi

# Check if environment file exists
if [[ ! -f "$ENV_FILE" ]]; then
    print_warning "Environment file '$ENV_FILE' not found."
    if [[ -f "$ENV_FILE.example" ]]; then
        print_status "Creating $ENV_FILE from $ENV_FILE.example"
        cp "$ENV_FILE.example" "$ENV_FILE"
        print_warning "Please edit $ENV_FILE with your configuration before continuing."
        exit 1
    else
        print_error "No environment file or example found. Please create $ENV_FILE"
        exit 1
    fi
fi

# Build profiles array
PROFILES=()
if [[ "$ENABLE_NGINX" == true ]]; then
    PROFILES+=("nginx")
fi
if [[ "$ENABLE_MONITORING" == true ]]; then
    PROFILES+=("monitoring")
fi

# Build docker-compose command
COMPOSE_CMD="docker-compose -f $COMPOSE_FILE"
if [[ ${#PROFILES[@]} -gt 0 ]]; then
    PROFILE_STRING=$(IFS=,; echo "${PROFILES[*]}")
    COMPOSE_CMD="$COMPOSE_CMD --profile $PROFILE_STRING"
fi

print_status "Using compose file: $COMPOSE_FILE"
print_status "Using environment file: $ENV_FILE"
if [[ ${#PROFILES[@]} -gt 0 ]]; then
    print_status "Enabled profiles: ${PROFILES[*]}"
fi

# Pull latest images
if [[ "$PULL_LATEST" == true ]]; then
    print_status "Pulling latest images..."
    $COMPOSE_CMD pull
fi

# Stop existing services
print_status "Stopping existing services..."
$COMPOSE_CMD down

# Start services
print_status "Starting services..."
$COMPOSE_CMD up -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 10

# Check service status
print_status "Checking service status..."
$COMPOSE_CMD ps

# Test the API
print_status "Testing API endpoints..."
if curl -s -f http://localhost:3000/api/cache/stats > /dev/null; then
    print_status "✓ API is responding correctly"
else
    print_warning "⚠ API might not be ready yet. Check logs with: $0 --logs"
fi

# Show success message
print_header "Deployment completed successfully!"
echo
print_status "Services are running. Available commands:"
echo "  View logs:    $0 --logs"
echo "  Check status: $0 --status"
echo "  Stop all:     $0 --stop"
echo
print_status "API endpoint: http://localhost:3000/api/languages?username=octocat"

if [[ "$ENABLE_NGINX" == true ]]; then
    print_status "Nginx proxy: http://localhost"
fi

if [[ "$ENABLE_MONITORING" == true ]]; then
    print_status "Prometheus: http://localhost:9090"
    print_status "Grafana: http://localhost:3001 (admin/admin)"
fi