# Contributing to STRATIX AI

This document outlines the development workflow and guidelines for contributing to STRATIX AI.

## Development Setup

### Quick Start

```bash
# 1. Check environment
npm run check-env

# 2. Install dependencies
npm run install:all

# 3. Bootstrap local development
npm run bootstrap

# 4. Start development servers
npm run dev
```

### Manual Setup

If you prefer to set up manually:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to local database
npm run db:push

# Start all apps
npm run dev
```

## Folder Structure

The monorepo is organized into three main areas:

### Apps
- **`apps/web`**: Next.js frontend application
- **`apps/api`**: NestJS backend API
- **`apps/worker`**: BullMQ worker for background jobs

### Packages
- **`packages/ui`**: Shared React components
- **`packages/shared`**: Shared utilities and helpers
- **`packages/types`**: Shared TypeScript interfaces
- **`packages/validation`**: Zod validation schemas
- **`packages/config`**: Shared configurations

### Database
- **`db/prisma`**: Prisma schema and migrations
- **`db/seeds`**: Database seed scripts

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in watch mode |
| `npm run build` | Build all apps |
| `npm run typecheck` | Type-check all apps |
| `npm run lint` | Lint all apps |
| `npm run test` | Run tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:studio` | Open Prisma Studio |

## Code Style

We use ESLint and Prettier for code formatting. All code should follow these standards:

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (2-space indentation)
- **Linting**: ESLint with recommended rules

Before committing, run:

```bash
npm run lint
npm run typecheck
```

## Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests and linting: `npm run test && npm run lint`
4. Commit with descriptive messages
5. Push and create a pull request

## Phase-Based Development

STRATIX AI is built in phases. Each phase has specific deliverables:

- **Phase 0**: Foundation (current)
- **Phase 1**: Auth + Tenant + Admin
- **Phase 2**: Projects + Sources + Uploads
- **Phase 3**: Crawl + Parse + Chunk + Embed
- ... and more

Always work within the current phase scope.

## Testing

Run tests with:

```bash
npm run test
npm run test:watch  # Watch mode
npm run test:cov    # Coverage report
```

## Database Migrations

To create a new migration:

```bash
npm run db:migrate
```

This will prompt you to name the migration and create the migration file.

## Deployment

### Backend (Railway)
See `docs/deployment/RAILWAY.md`

### Frontend (Hostinger)
See `docs/deployment/HOSTINGER.md`

## Questions?

Refer to the documentation in `docs/` or check the README.md for more information.
