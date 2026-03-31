# STRATIX AI - Railway Deployment Guide

This guide covers deploying STRATIX AI backend and worker to Railway.

## Prerequisites

- Railway account (https://railway.app)
- Railway CLI installed: `npm install -g @railway/cli`
- Git repository pushed to GitHub

## Step 1: Create Railway Project

```bash
# Login to Railway
railway login

# Create new project
railway init
```

## Step 2: Add PostgreSQL Database

```bash
# Add PostgreSQL plugin
railway add

# Select PostgreSQL
# This will create a PostgreSQL instance and set DATABASE_URL
```

## Step 3: Add Redis

```bash
# Add Redis plugin
railway add

# Select Redis
# This will create a Redis instance and set REDIS_URL
```

## Step 4: Configure Environment Variables

```bash
# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="your-production-secret"
railway variables set OPENAI_API_KEY="sk-..."
railway variables set FRONTEND_URL="https://your-frontend-domain.com"
railway variables set LOG_LEVEL="info"
```

## Step 5: Deploy Backend API

### Option A: Using Railway CLI

```bash
# From root directory
railway up

# Select "api" service
# Railway will build and deploy
```

### Option B: Using GitHub Integration

1. Connect GitHub repository to Railway
2. Select `apps/api` as the root directory
3. Set build command: `npm run build --workspace=@stratix/api`
4. Set start command: `npm run prod --workspace=@stratix/api`

## Step 6: Deploy Worker

```bash
# Create separate service for worker
railway service create

# Name it "worker"
# Set root directory: `apps/worker`
# Build command: `npm run build --workspace=@stratix/worker`
# Start command: `npm run prod --workspace=@stratix/worker`
```

## Step 7: Configure Database Migrations

```bash
# Run migrations on deployment
railway run npm run db:push --workspace=@stratix/database
```

## Step 8: Verify Deployment

```bash
# Get deployment URL
railway domains

# Test API endpoint
curl https://your-railway-domain.com/api/health

# Check logs
railway logs
```

## Environment Variables on Railway

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | |
| `DATABASE_URL` | Auto-set by PostgreSQL plugin | |
| `REDIS_URL` | Auto-set by Redis plugin | |
| `OPENAI_API_KEY` | Your API key | Keep secret |
| `JWT_SECRET` | Strong random string | Generate with `openssl rand -base64 32` |
| `FRONTEND_URL` | Your Hostinger domain | For CORS |
| `PORT` | `3001` | Default |
| `LOG_LEVEL` | `info` | Can be `debug`, `info`, `warn`, `error` |

## Monitoring & Logs

```bash
# View real-time logs
railway logs --follow

# View specific service logs
railway logs --service api
railway logs --service worker

# View deployment history
railway deployments
```

## Troubleshooting

### Deployment Failed

```bash
# Check build logs
railway logs --deployment <deployment-id>

# Verify environment variables
railway variables

# Check if services are running
railway status
```

### Database Connection Error

```bash
# Verify DATABASE_URL is set
railway variables | grep DATABASE_URL

# Test connection
railway run psql $DATABASE_URL -c "SELECT 1;"
```

### Worker Not Processing Jobs

```bash
# Check Redis connection
railway run redis-cli ping

# Check worker logs
railway logs --service worker

# Verify BullMQ configuration
railway run npm run test:worker
```

## Scaling

### Increase Resources

```bash
# Scale API service
railway service api
# Edit resources in dashboard

# Scale worker service
railway service worker
# Edit resources in dashboard
```

### Multiple Worker Instances

```bash
# Create additional worker instances
railway service create
# Name: "worker-2"
# Same configuration as first worker
```

## Backup & Recovery

### Database Backup

```bash
# Manual backup
railway run pg_dump $DATABASE_URL > backup.sql

# Automated backups (via Railway dashboard)
# Enable in PostgreSQL plugin settings
```

### Restore from Backup

```bash
# Restore database
railway run psql $DATABASE_URL < backup.sql
```

## Continuous Deployment

### GitHub Actions Integration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway-app/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## Cost Optimization

- **Database**: Use shared PostgreSQL for development
- **Redis**: Use shared Redis for development
- **Compute**: Start with 512MB RAM, scale as needed
- **Monitoring**: Enable Railway's built-in monitoring

## Next Steps

- Configure frontend deployment on Hostinger
- Set up monitoring and alerting
- Configure CI/CD pipeline
- Set up backup strategy
