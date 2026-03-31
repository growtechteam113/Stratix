# STRATIX AI - Market Intelligence & Positioning Platform

STRATIX AI is a production-grade multi-tenant SaaS platform that leverages AI to analyze market landscapes, discover competitors, and generate strategic positioning recommendations. Built with Next.js, NestJS, PostgreSQL, and OpenAI.

## Features

- **Multi-tenant Architecture**: Secure workspace isolation for multiple organizations.
- **Project Management**: Create and manage strategic analysis projects.
- **Source Ingestion**: Ingest data from URLs and file uploads (PDF, DOCX, TXT, HTML).
- **Intelligent Processing**: Crawl websites, parse documents, chunk content semantically, and generate embeddings using OpenAI.
- **Business Context Engine**: Extract and structure business context from ingested sources.
- **Competitor Intelligence**: Automatic competitor discovery and detailed competitive analysis.
- **Market Segmentation**: AI-powered category mapping and opportunity detection.
- **Strategic Positioning**: Generate positioning statements, competitive scores, and strategic briefs.
- **Premium UI**: Elite, high-end Gen Z aesthetic with smooth animations and premium interactions.
- **Public Reports**: Publish and share strategic reports with public URLs.
- **Admin Control Center**: Global admin dashboard for user management, activity monitoring, and system health.
- **Production Hardening**: Rate limiting, abuse detection, health monitoring, and resilience features.

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS + Framer Motion + shadcn/ui + React Query + Zustand
- **Backend**: NestJS + TypeScript + Express
- **Database**: PostgreSQL + Prisma + pgvector
- **Queue**: Redis + BullMQ
- **AI**: OpenAI (GPT-4, embeddings)
- **Deployment**: Railway (backend), Hostinger (frontend)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: v22.13.0 or higher ([Download](https://nodejs.org/))
- **npm**: v10.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v14 or higher ([Download](https://www.postgresql.org/download/))
- **Redis**: v7 or higher ([Download](https://redis.io/download))
- **Git**: For version control

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/stratix-ai.git
cd stratix-ai
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set Up PostgreSQL

Create a new PostgreSQL database and user:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stratix_ai;

# Create user
CREATE USER stratix_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE stratix_ai TO stratix_user;

# Exit psql
\q
```

Enable pgvector extension:

```bash
psql -U postgres -d stratix_ai -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 4. Set Up Redis

Start Redis server (adjust based on your installation):

```bash
# macOS (if installed via Homebrew)
brew services start redis

# Linux
sudo systemctl start redis-server

# Windows (if installed)
redis-server.exe
```

Verify Redis is running:

```bash
redis-cli ping
# Should respond with: PONG
```

### 5. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and set the following critical variables:

```env
# Database
DATABASE_URL="postgresql://stratix_user:your_secure_password@localhost:5432/stratix_ai"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="7d"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Admin Bootstrap (set only for initial setup)
ADMIN_EMAIL="admin@stratix.ai"
ADMIN_PASSWORD="initial-admin-password"
```

### 6. Generate Prisma Client

```bash
npm run db:generate
```

### 7. Run Database Migrations

```bash
npm run db:migrate
```

### 8. Seed the Database (Optional)

```bash
npm run db:seed
```

## Development

### Start Backend API

In one terminal:

```bash
cd apps/api
npm run dev
```

The API will be available at `http://localhost:3001`.

### Start Worker Service

In another terminal:

```bash
cd apps/worker
npm run dev
```

### Start Frontend Application

In a third terminal:

```bash
cd apps/web
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Or Start All Services Concurrently

From the root directory:

```bash
npm run dev
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in watch mode |
| `npm run build` | Build all apps for production |
| `npm run typecheck` | Type-check all apps |
| `npm run test` | Run all tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create and apply database migrations |
| `npm run db:seed` | Seed the database with sample data |
| `npm run db:push` | Push schema changes to database (dev only) |

## Production Build

### Build All Applications

```bash
npm run build
```

### Build Backend Only

```bash
cd apps/api
npm run build
```

### Build Frontend Only

```bash
cd apps/web
npm run build
npm run export
```

### Build Worker Only

```bash
cd apps/worker
npm run build
```

## Admin Bootstrap

On first deployment, bootstrap the initial super-admin user:

```bash
curl -X POST http://localhost:3001/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stratix.ai",
    "password": "secure-password-here"
  }'
```

## Verification

### Health Check

```bash
curl http://localhost:3001/health
```

### Readiness Check

```bash
curl http://localhost:3001/health/ready
```

### API Documentation

OpenAPI docs are available at `http://localhost:3001/api/docs`.

## Project Structure

```
stratix-ai/
├── apps/
│   ├── web/              # Next.js frontend application
│   ├── api/              # NestJS backend API
│   └── worker/           # BullMQ worker process
├── packages/
│   ├── database/         # Prisma schema and migrations
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   ├── shared/           # Shared utilities
│   ├── config/           # Shared configuration
│   └── validation/       # Shared validation schemas
├── db/
│   ├── prisma/           # Prisma schema
│   └── seeds/            # Database seed scripts
├── docs/
│   ├── ARCHITECTURE.md   # System architecture
│   ├── API.md            # API documentation
│   ├── TESTING.md        # Testing guide
│   ├── deployment/       # Deployment guides
│   └── openapi/          # OpenAPI specification
├── scripts/              # Development and deployment scripts
└── README.md             # This file
```

## Architecture

### Multi-Tenant Isolation

Each tenant is isolated at the database level with:
- Tenant-scoped queries via workspace membership
- Audit logging per tenant
- Separate project and resource ownership

### Async Job Processing

Heavy workloads are processed via BullMQ:
- URL crawling and parsing
- Document processing (PDF, DOCX, TXT, HTML)
- OpenAI embeddings generation
- Strategic brief generation
- Competitor analysis

### Authentication & Authorization

JWT-based authentication with:
- Signup and signin with secure password hashing
- Multi-tenant workspace switching
- Admin panel access control (SUPERADMIN role)
- Login history tracking
- User activity event logging

## Deployment

### Railway (Backend & Worker)

See `docs/deployment/RAILWAY.md` for detailed instructions on deploying to Railway.

### Hostinger (Frontend)

See `docs/deployment/HOSTINGER.md` for detailed instructions on deploying to Hostinger.

## Documentation

- [Architecture & Diagrams](./docs/ARCHITECTURE.md)
- [Local Setup Guide](./docs/LOCAL_SETUP.md)
- [Railway Deployment](./docs/deployment/RAILWAY.md)
- [Hostinger Deployment](./docs/deployment/HOSTINGER.md)
- [API Documentation](./docs/API.md)
- [Testing Guide](./docs/TESTING.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and the `DATABASE_URL` is correct:

```bash
psql -U stratix_user -d stratix_ai -c "SELECT 1;"
```

### Redis Connection Issues

Ensure Redis is running:

```bash
redis-cli ping
```

### Port Already in Use

If ports 3000, 3001, or 6379 are already in use, either:
1. Stop the process using the port
2. Modify the port in the respective app's configuration

### OpenAI API Errors

Ensure your `OPENAI_API_KEY` is valid and has sufficient credits. Check the OpenAI dashboard for usage limits.

## License

STRATIX AI is proprietary software. All rights reserved.

## Support

For support, please contact support@stratix.ai or open an issue on GitHub.
