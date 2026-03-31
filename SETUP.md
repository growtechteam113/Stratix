# STRATIX AI - Complete Setup Guide

## Overview

STRATIX AI is a production-grade multi-tenant SaaS web application for competitive intelligence and strategic positioning. This guide covers local development setup, deployment, and operational procedures.

## System Requirements

### Local Development
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Redis**: 7.0 or higher
- **Git**: Latest version

### Deployment
- **Railway Account**: For backend and worker deployment
- **Hostinger Account**: For frontend deployment
- **OpenAI API Key**: For AI features

## Local Development Setup

### 1. Prerequisites Installation

#### macOS
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node postgresql redis git

# Start PostgreSQL and Redis
brew services start postgresql
brew services start redis
```

#### Ubuntu/Debian
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nodejs npm postgresql postgresql-contrib redis-server git

# Start services
sudo systemctl start postgresql
sudo systemctl start redis-server
```

#### Windows
- Download and install Node.js from https://nodejs.org/
- Download and install PostgreSQL from https://www.postgresql.org/download/windows/
- Download and install Redis from https://github.com/microsoftarchive/redis/releases
- Download and install Git from https://git-scm.com/

### 2. Environment Configuration

Create `.env.local` in the root directory:

```bash
# Core
NODE_ENV=development
APP_NAME=STRATIX_AI

# Frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend
PORT=4000
API_BASE_URL=http://localhost:4000
APP_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/stratix_ai

# Redis / Queue
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=your_long_random_string_here_min_32_chars
JWT_REFRESH_SECRET=your_long_random_string_here_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Owner Admin Bootstrap
ADMIN_BOOTSTRAP_EMAIL=owner@example.com
ADMIN_BOOTSTRAP_PASSWORD=SecurePassword123!

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Storage
STORAGE_PATH=./storage

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Usage Controls
MAX_ACTIVE_JOBS_PER_USER=3
MAX_DAILY_ANALYSES_PER_USER=20
```

### 3. Database Setup

```bash
# Create database
createdb stratix_ai

# Run migrations
cd /home/ubuntu/stratix-ai
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 4. Install Dependencies

```bash
cd /home/ubuntu/stratix-ai

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 5. Start Development Servers

Open separate terminal windows for each service:

**Terminal 1 - Backend API:**
```bash
cd /home/ubuntu/stratix-ai/apps/api
npm run dev
# API will be available at http://localhost:4000
# OpenAPI docs at http://localhost:4000/api/docs
```

**Terminal 2 - Worker:**
```bash
cd /home/ubuntu/stratix-ai/apps/worker
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd /home/ubuntu/stratix-ai/apps/web
npm run dev
# Frontend will be available at http://localhost:3000
```

**Terminal 4 - Redis (if not running as service):**
```bash
redis-server
```

## Build Commands

### Build All Packages
```bash
cd /home/ubuntu/stratix-ai
npm run build
```

### Build Specific Package
```bash
# Build API
npm run build --workspace=@stratix/api

# Build Frontend
npm run build --workspace=@stratix/web

# Build Worker
npm run build --workspace=@stratix/worker
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Testing

### Run Tests
```bash
npm run test
```

### Run Tests with Coverage
```bash
npm run test:cov
```

## Deployment

### Railway Deployment

#### Backend API Deployment

1. **Connect Railway to GitHub:**
   - Go to https://railway.app
   - Create new project
   - Connect your GitHub repository

2. **Configure Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   JWT_ACCESS_SECRET=...
   JWT_REFRESH_SECRET=...
   OPENAI_API_KEY=...
   PORT=4000
   NODE_ENV=production
   ```

3. **Deploy:**
   - Select `apps/api` as the service root
   - Railway will automatically build and deploy

#### Worker Deployment

1. **Create new service in Railway:**
   - Add new service
   - Connect same repository
   - Select `apps/worker` as service root

2. **Configure same environment variables as API**

#### Database Deployment

1. **Create PostgreSQL database in Railway:**
   - Add new service
   - Select PostgreSQL
   - Copy connection string to `DATABASE_URL`

2. **Create Redis in Railway:**
   - Add new service
   - Select Redis
   - Copy connection string to `REDIS_URL`

### Hostinger Frontend Deployment

1. **Build the frontend:**
   ```bash
   cd apps/web
   npm run build
   ```

2. **Upload to Hostinger:**
   - Connect via FTP or Git
   - Upload contents of `.next` folder
   - Configure Node.js runtime

3. **Configure Environment:**
   - Set `NEXT_PUBLIC_API_URL` to your Railway API domain
   - Restart application

## API Documentation

### OpenAPI/Swagger

Access the interactive API documentation at:
```
http://localhost:4000/api/docs
```

### Key Endpoints

#### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/signin` - Login
- `POST /auth/signout` - Logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

#### Projects
- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

#### Sources
- `POST /projects/:projectId/sources/url` - Add URL source
- `POST /projects/:projectId/sources/upload` - Upload file
- `GET /projects/:projectId/sources` - List sources
- `DELETE /projects/:projectId/sources/:sourceId` - Delete source

#### Context
- `POST /projects/:projectId/context/generate` - Generate context
- `GET /projects/:projectId/context` - Get context
- `PUT /projects/:projectId/context/:versionId/publish` - Publish version

#### Competitors
- `POST /projects/:projectId/competitors` - Add competitor
- `GET /projects/:projectId/competitors` - List competitors
- `POST /projects/:projectId/competitors/:competitorId/analyze` - Analyze competitor

#### Reports
- `POST /reports/projects/:projectId/create` - Create report
- `PUT /reports/projects/:projectId/publish` - Publish report
- `GET /reports/public/:slug` - Get public report

#### Admin
- `POST /admin/bootstrap` - Bootstrap admin user
- `GET /admin/dashboard/stats` - Get dashboard statistics
- `GET /admin/users` - List all users
- `PUT /admin/users/:id/suspend` - Suspend user
- `GET /admin/events/logins` - Get login history

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection string format
# postgresql://username:password@host:port/database
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### Build Errors
```bash
# Clear build cache
rm -rf apps/api/dist apps/web/.next apps/worker/dist

# Reinstall dependencies
rm -rf node_modules
npm install --workspaces

# Rebuild
npm run build
```

### Port Already in Use
```bash
# Find process using port 4000
lsof -i :4000

# Kill process
kill -9 <PID>
```

## Performance Optimization

### Database
- Enable query logging: `NEXT_PUBLIC_DEBUG_SQL=true`
- Use connection pooling (configured in Prisma)
- Create indexes on frequently queried fields

### Frontend
- Enable SWR caching for API responses
- Use React Query for data fetching
- Enable Next.js image optimization

### Backend
- Enable response caching for public endpoints
- Use database query optimization
- Implement rate limiting per user

## Monitoring

### Health Checks
```bash
# API health
curl http://localhost:4000/health

# Database health
npm run db:health

# Redis health
redis-cli ping
```

### Logs
```bash
# API logs
tail -f logs/api.log

# Worker logs
tail -f logs/worker.log

# Database logs
tail -f /var/log/postgresql/postgresql.log
```

## Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use strong JWT secrets
- [ ] Enable database encryption
- [ ] Set up regular backups
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review API documentation at `/api/docs`
3. Check logs for error messages
4. Contact support team

## License

STRATIX AI is proprietary software. All rights reserved.
