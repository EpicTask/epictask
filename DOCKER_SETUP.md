# EpicTask Docker Setup Guide

This guide explains how to run the entire EpicTask application stack using Docker Compose.

## Overview

The Docker setup includes the following services:

- **user-management**: Node.js service for user authentication and management
- **task-management**: Python service for task operations
- **pubsub**: Node.js service for pub/sub messaging
- **xrpl**: Python service for XRPL blockchain operations
- **xrpl-management**: TypeScript/Node.js service for XRPL management
- **epictask-react**: React Native/Expo frontend application
- **nginx**: Reverse proxy and load balancer
- **redis**: Caching and session storage
- **postgres**: Database (optional, for future use)

## Prerequisites

- Docker (version 20.0 or higher)
- Docker Compose (version 2.0 or higher)
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

1. **Clone the repository and navigate to the project root**
   ```bash
   git clone <repository-url>
   cd epictask
   ```

2. **Copy and configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

3. **Start all services (development mode)**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:19006 (Expo development server)
   - User Management API: http://localhost:8080
   - Task Management API: http://localhost:8081
   - PubSub Service: http://localhost:8082
   - XRPL Service: http://localhost:8083
   - XRPL Management: http://localhost:8084
   - Nginx Proxy: http://localhost:80

## Service Profiles

### Development Profile (Default)
Runs all services in development mode with hot reloading and debugging enabled.

```bash
docker-compose up -d
```

### Production Profile
Runs optimized production builds with nginx reverse proxy.

```bash
docker-compose --profile production up -d
```

### Database Profile
Includes PostgreSQL database for services that need persistent storage.

```bash
docker-compose --profile database up -d
```

## Individual Service Management

### Start specific services
```bash
# Start only core services
docker-compose up -d user-management task-management redis

# Start frontend development
docker-compose up -d epictask-react

# Start with database
docker-compose --profile database up -d postgres
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-management

# Last 100 lines
docker-compose logs --tail=100 -f epictask-react
```

### Restart services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart user-management
```

### Stop services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following key variables:

#### Required Configuration
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=task-coin-384722
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-service-account-email"

# API Keys
OPENAI_API_KEY=your_openai_api_key
XRPL_WALLET_SEED=your_xrpl_wallet_seed
```

#### Optional Configuration
```bash
# Database
POSTGRES_PASSWORD=your_secure_password

# External Service URLs
EXTERNAL_USER_MANAGEMENT_URL=https://your-production-url.com
```

### Service-Specific Configuration

#### User Management Service
- Uses Firebase Admin SDK for authentication
- Requires Firebase service account credentials
- Connects to Firestore for user data

#### Task Management Service
- Python Flask application
- Can connect to PostgreSQL if database profile is enabled

#### XRPL Services
- Requires XRPL network configuration (testnet/mainnet)
- Needs wallet seed for transaction signing

#### Frontend (EpicTask React)
- Expo/React Native application
- Development mode runs Metro bundler
- Production mode builds static web assets

## Networking

All services run on a custom Docker network (`epictask-network`) with the following subnet:
- Network: `172.20.0.0/16`
- Services can communicate using service names as hostnames

### Port Mapping

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| user-management | 8080 | 8080 | User Management API |
| task-management | 8080 | 8081 | Task Management API |
| pubsub | 8080 | 8082 | PubSub Service |
| xrpl | 8080 | 8083 | XRPL Service |
| xrpl-management | 3000 | 8084 | XRPL Management |
| epictask-react | 19006 | 19006 | Expo Dev Server |
| nginx | 80 | 80 | Reverse Proxy |
| redis | 6379 | 6379 | Redis Cache |
| postgres | 5432 | 5432 | PostgreSQL DB |

## Data Persistence

### Volumes
- `redis-data`: Redis data persistence
- `postgres-data`: PostgreSQL data persistence

### Backup Data
```bash
# Backup Redis data
docker-compose exec redis redis-cli BGSAVE

# Backup PostgreSQL data
docker-compose exec postgres pg_dump -U epictask epictask > backup.sql
```

## Development Workflow

### Frontend Development
1. Start the development stack:
   ```bash
   docker-compose up -d user-management task-management redis
   docker-compose up epictask-react
   ```

2. The Expo development server will be available at http://localhost:19006

3. Use Expo Go app on your mobile device to scan the QR code

### Backend Development
1. Start individual services for testing:
   ```bash
   docker-compose up -d redis postgres
   docker-compose up user-management
   ```

2. Services support hot reloading in development mode

### API Testing
Use the nginx reverse proxy to test API endpoints:
```bash
# Test user management
curl http://localhost/api/users/

# Test task management
curl http://localhost/api/tasks/
```

## Troubleshooting

### Common Issues

#### Port Conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8090:8080"  # Change external port
```

#### Memory Issues
Increase Docker memory allocation:
- Docker Desktop: Settings > Resources > Memory (recommend 4GB+)

#### Build Failures
Clear Docker cache and rebuild:
```bash
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

#### Service Connection Issues
Check service logs and network connectivity:
```bash
docker-compose logs service-name
docker-compose exec service-name ping other-service
```

### Health Checks

Most services include health checks. Check service status:
```bash
docker-compose ps
```

Healthy services will show "healthy" status.

### Debugging

#### Access service containers
```bash
# Access running container
docker-compose exec user-management sh

# Run commands in container
docker-compose exec postgres psql -U epictask -d epictask
```

#### View service metrics
```bash
# Container stats
docker stats

# Service-specific stats
docker-compose top user-management
```

## Production Deployment

### Production Build
```bash
# Build production images
docker-compose -f docker-compose.yml --profile production build

# Start production stack
docker-compose --profile production up -d
```

### SSL/HTTPS Setup
1. Place SSL certificates in `./ssl/` directory
2. Uncomment HTTPS server block in `nginx.conf`
3. Update environment variables for HTTPS URLs

### Monitoring
- Service logs: `docker-compose logs -f`
- Health endpoints: `http://localhost/health`
- Redis monitoring: `docker-compose exec redis redis-cli monitor`

## Security Considerations

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Network Security**: Services are isolated in Docker network
3. **Rate Limiting**: Nginx includes rate limiting for API endpoints
4. **CORS**: Configure CORS origins in environment variables
5. **SSL**: Use HTTPS in production with valid certificates

## Scaling

### Horizontal Scaling
Scale individual services:
```bash
# Scale user management service
docker-compose up -d --scale user-management=3

# Scale with load balancer
docker-compose --profile production up -d --scale user-management=3
```

### Resource Limits
Add resource limits to `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

## Maintenance

### Updates
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Cleanup
```bash
# Remove unused containers and images
docker system prune

# Remove all project containers and volumes
docker-compose down -v --rmi all
```

## Support

For issues and questions:
1. Check service logs: `docker-compose logs service-name`
2. Verify configuration in `.env` file
3. Ensure all required ports are available
4. Check Docker and Docker Compose versions
