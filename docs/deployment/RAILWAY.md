# Railway Deployment Guide

This guide provides step-by-step instructions for deploying STRATIX AI backend (API and Worker) to Railway.

## Prerequisites

- Railway account ([Sign up](https://railway.app))
- Railway CLI installed (`npm install -g @railway/cli`)
- Git repository with STRATIX AI code
- OpenAI API key

## Architecture Overview

We will deploy the following services to Railway:
1. **PostgreSQL Database** - With pgvector extension
2. **Redis** - For BullMQ job queue
3. **NestJS API** - Main backend service
4. **BullMQ Worker** - Async job processor

## Step 1: Create a Railway Project

```bash
# Login to Railway
railway login

# Create a new project
railway init

# Select "Create a new project"
# Enter project name: "stratix-ai"
```

## Step 2: Set Up PostgreSQL

### Add PostgreSQL Plugin

```bash
# In your Railway project directory
railway add

# Select "PostgreSQL"
```

Railway will automatically create a PostgreSQL database and set the `DATABASE_URL` environment variable.

### Enable pgvector Extension

Connect to the Railway PostgreSQL database and enable pgvector:

```bash
# Get the database connection string from Railway dashboard
# Then connect and run:
psql <DATABASE_URL> -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Alternatively, add a migration file to enable pgvector automatically:

```sql
-- db/prisma/migrations/001_enable_pgvector/migration.sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Step 3: Set Up Redis

### Add Redis Plugin

```bash
railway add

# Select "Redis"
```

Railway will automatically set the `REDIS_URL` environment variable.

## Step 4: Deploy the API Service

### Create Dockerfile for API

Create `apps/api/Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy monorepo files
COPY package*.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY db ./db

# Install dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma client
RUN npm run db:generate

# Build API
RUN cd apps/api && npm run build

# Expose port
EXPOSE 3001

# Start API
CMD ["node", "apps/api/dist/main.js"]
```

### Configure Railway Service

```bash
# Add API service
railway add

# Select "Docker"
# Enter service name: "api"
```

### Set Environment Variables for API

In the Railway dashboard, go to the API service and add:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-a-strong-random-string>
JWT_EXPIRATION=7d
FRONTEND_URL=https://your-frontend-domain.com
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**Note**: `DATABASE_URL` and `REDIS_URL` are automatically set by Railway.

### Deploy API

```bash
# Deploy to Railway
railway up

# View logs
railway logs
```

## Step 5: Deploy the Worker Service

### Create Dockerfile for Worker

Create `apps/worker/Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy monorepo files
COPY package*.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker
COPY db ./db

# Install dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma client
RUN npm run db:generate

# Build Worker
RUN cd apps/worker && npm run build

# Start Worker
CMD ["node", "apps/worker/dist/main.js"]
```

### Add Worker Service

```bash
railway add

# Select "Docker"
# Enter service name: "worker"
```

### Set Environment Variables for Worker

Add the same environment variables as the API service.

### Deploy Worker

```bash
railway up
```

## Step 6: Run Database Migrations

After deploying the API, run migrations:

```bash
# SSH into the API container
railway shell

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Exit
exit
```

## Step 7: Bootstrap Admin User

```bash
# Get the API URL from Railway dashboard
# Then bootstrap admin:
curl -X POST https://<api-url>/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stratix.ai",
    "password": "your-secure-password"
  }'
```

## Step 8: Verify Deployment

### Check API Health

```bash
curl https://<api-url>/health
```

### Check Worker Status

Monitor worker logs in the Railway dashboard.

### Test Authentication

```bash
curl -X POST https://<api-url>/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stratix.ai",
    "password": "your-secure-password"
  }'
```

## Step 9: Configure Frontend

Update your frontend `.env` with the Railway API URL:

```env
NEXT_PUBLIC_API_URL=https://<api-url>/api
```

## Troubleshooting

### Database Connection Issues

Ensure pgvector extension is enabled:

```bash
railway shell
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Worker Not Processing Jobs

Check worker logs:

```bash
railway logs --service worker
```

Ensure Redis is running and accessible:

```bash
railway shell
redis-cli -u $REDIS_URL ping
```

### Memory Issues

Increase container memory in Railway dashboard:
- API: 512MB minimum
- Worker: 512MB minimum

### Build Failures

Check build logs in Railway dashboard. Common issues:
- Missing dependencies: Run `npm install --legacy-peer-deps`
- TypeScript errors: Run `npm run typecheck`
- Missing environment variables: Verify all required vars are set

## Monitoring

### Enable Application Insights

In Railway dashboard:
1. Go to your project
2. Enable "Observability"
3. View metrics and logs

### Set Up Alerts

Configure alerts for:
- High CPU usage
- High memory usage
- Failed deployments
- API errors

## Scaling

### Increase Worker Instances

In Railway dashboard:
1. Go to Worker service
2. Set "Replica Count" to desired number
3. Save

### Increase Database Resources

In Railway dashboard:
1. Go to PostgreSQL service
2. Increase "Memory" and "CPU"
3. Apply changes

## Cost Optimization

- Use `gpt-4.1-mini` instead of `gpt-4` for cost efficiency
- Configure job retention policies in BullMQ
- Monitor API usage and set rate limits appropriately

## Continuous Deployment

### Set Up GitHub Integration

```bash
# Link Railway to GitHub
railway link --service api

# Select your GitHub repository
# Choose branch to deploy (e.g., main)
```

Railway will automatically deploy on every push to the selected branch.

## Rollback

To rollback to a previous deployment:

1. Go to Railway dashboard
2. Select the service
3. Go to "Deployments"
4. Click "Rollback" on the desired deployment

## Support

For Railway support, visit [Railway Docs](https://docs.railway.app).

For STRATIX AI support, contact support@stratix.ai.
