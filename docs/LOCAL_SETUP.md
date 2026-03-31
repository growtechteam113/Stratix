# STRATIX AI - Local Development Setup

This guide covers setting up STRATIX AI for local development on macOS, Linux, or Windows (WSL2).

## Prerequisites

### Required Software

1. **Node.js** (v20 or higher)
   ```bash
   node --version  # Should be v20.0.0 or higher
   npm --version   # Should be v10.0.0 or higher
   ```

2. **PostgreSQL** (v14 or higher)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download from https://www.postgresql.org/download/windows/

3. **PostgreSQL pgvector Extension**
   ```bash
   # macOS
   brew install pgvector

   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql-14-pgvector

   # Or compile from source
   git clone https://github.com/pgvector/pgvector.git
   cd pgvector
   make
   make install
   ```

4. **Redis** (v6 or higher)
   - macOS: `brew install redis`
   - Linux: `sudo apt-get install redis-server`
   - Windows: Use WSL2 or Docker Desktop

### Optional Tools

- **pgAdmin**: PostgreSQL GUI (macOS/Linux: `brew install pgadmin4`)
- **Redis Commander**: Redis GUI (`npm install -g redis-commander`)
- **Postman/Insomnia**: API testing

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd stratix-ai
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (web, api, worker, packages).

## Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/stratix?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# OpenAI
OPENAI_API_KEY="sk-your-key-here"

# JWT
JWT_SECRET="dev-secret-key-change-in-production"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Step 4: Setup PostgreSQL

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stratix;

# Connect to the new database
\c stratix

# Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

# Exit
\q
```

### Initialize Schema

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Optional: seed initial data
```

## Step 5: Setup Redis

### Start Redis Server

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Manual start
redis-server
```

Verify Redis is running:
```bash
redis-cli ping
# Should output: PONG
```

## Step 6: Start Development Servers

```bash
npm run dev
```

This will concurrently start:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Worker**: Background job processor

### Individual Development

If you prefer to run apps separately:

```bash
# Terminal 1: Frontend
cd apps/web && npm run dev

# Terminal 2: Backend API
cd apps/api && npm run dev

# Terminal 3: Worker
cd apps/worker && npm run dev
```

## Step 7: Verify Setup

### Frontend
- Open http://localhost:3000 in your browser
- Should see STRATIX AI homepage

### Backend API
- Visit http://localhost:3001/api/health
- Should return 200 OK

### Database
```bash
psql -U postgres -d stratix -c "SELECT * FROM users;"
```

## Common Issues & Solutions

### Issue: `DATABASE_URL` not found

**Solution**: Ensure `.env` file exists in the root directory and contains `DATABASE_URL`.

### Issue: PostgreSQL connection refused

**Solution**: 
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Issue: pgvector extension not found

**Solution**:
```bash
# Install pgvector
brew install pgvector  # macOS

# Or compile from source
git clone https://github.com/pgvector/pgvector.git
cd pgvector && make && make install
```

### Issue: Redis connection refused

**Solution**:
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis-server # Linux
```

### Issue: Port 3000 or 3001 already in use

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Issue: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Development Workflow

### Making Changes

1. **Frontend**: Changes in `apps/web/src` auto-reload via Next.js
2. **Backend**: Changes in `apps/api/src` auto-reload via NestJS watch mode
3. **Worker**: Changes in `apps/worker/src` auto-reload via NestJS watch mode

### Database Migrations

```bash
# Create a new migration
npm run db:migrate

# Push schema changes without migration
npm run db:push

# View database with Prisma Studio
npm run db:studio
```

### Running Tests

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
```

### Type Checking

```bash
npm run typecheck  # Check all apps for TypeScript errors
```

### Linting

```bash
npm run lint  # Lint all apps
```

## Debugging

### Backend API Debugging

```bash
npm run debug  # Starts with --inspect-brk
```

Then open `chrome://inspect` in Chrome DevTools.

### Database Debugging

```bash
npm run db:studio  # Opens Prisma Studio at http://localhost:5555
```

### Redis Debugging

```bash
redis-cli  # Interactive Redis CLI
redis-cli MONITOR  # Watch all commands
```

## Stopping Development

```bash
# Stop all processes
Ctrl+C

# Or individually
pkill -f "next dev"
pkill -f "nest start"
pkill -f "node.*worker"
```

## Next Steps

- Read [Architecture Documentation](./ARCHITECTURE.md)
- Read [API Documentation](./API.md)
- Start with Phase 1: Auth + Tenant + Admin Base
