# Environment Variables Setup Guide

This guide explains all environment variables required for STRATIX AI to run in local development and production environments.

## File Location

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

## Environment Variables Reference

### Global Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Set to `production` for production deployments |

### Database Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/stratix_ai` | PostgreSQL connection string with pgvector support |

**Local Setup**:
```env
DATABASE_URL="postgresql://stratix_user:your_password@localhost:5432/stratix_ai"
```

**Railway Setup**:
Railway automatically provides this variable. Do not set it manually.

### Redis Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis server hostname |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | `` | Redis password (if required) |
| `REDIS_DB` | `0` | Redis database number |

**Local Setup**:
```env
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
```

**Alternative (Connection String)**:
```env
REDIS_URL="redis://localhost:6379"
```

### OpenAI API Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key (get from [OpenAI Dashboard](https://platform.openai.com/account/api-keys)) |
| `OPENAI_MODEL` | `gpt-4.1-mini` | Model for text generation (default uses gpt-4.1-mini for cost efficiency) |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Model for embeddings |

**Setup**:
```env
OPENAI_API_KEY="sk-your-actual-api-key-here"
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
```

### Backend API Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port for NestJS API server |
| `API_HOST` | `0.0.0.0` | Host to bind the API server to |
| `JWT_SECRET` | `` | Secret key for JWT token signing (generate a strong random string) |
| `JWT_EXPIRATION` | `7d` | JWT token expiration time |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS and redirects |

**Local Setup**:
```env
PORT=3001
API_HOST="0.0.0.0"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="7d"
FRONTEND_URL="http://localhost:3000"
```

**Production Setup**:
```env
PORT=3001
API_HOST="0.0.0.0"
JWT_SECRET="generate-a-strong-random-string-here"
JWT_EXPIRATION="7d"
FRONTEND_URL="https://your-production-domain.com"
```

### Frontend Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | API URL accessible from the browser |
| `NEXT_PUBLIC_APP_NAME` | `STRATIX AI` | Application name displayed in UI |

**Local Setup**:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="STRATIX AI"
```

**Production Setup**:
```env
NEXT_PUBLIC_API_URL="https://api.your-domain.com"
NEXT_PUBLIC_APP_NAME="STRATIX AI"
```

### Admin Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_EMAIL` | `admin@stratix.ai` | Initial admin email (used during bootstrap) |
| `ADMIN_PASSWORD` | `` | Initial admin password (used during bootstrap) |

**Note**: These are only used during the initial admin bootstrap process. After bootstrap, remove or change these values.

```env
ADMIN_EMAIL="admin@stratix.ai"
ADMIN_PASSWORD="initial-secure-password"
```

### Rate Limiting Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Time window for rate limiting (15 minutes in milliseconds) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Maximum requests per user per window |

**Local Setup** (permissive):
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**Production Setup** (strict):
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Logging Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `debug` | Logging level (debug, info, warn, error) |

```env
LOG_LEVEL="debug"
```

## Environment-Specific Examples

### Local Development

```env
NODE_ENV=development
DATABASE_URL="postgresql://stratix_user:password@localhost:5432/stratix_ai"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
OPENAI_API_KEY="sk-your-api-key"
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
PORT=3001
API_HOST="0.0.0.0"
JWT_SECRET="dev-secret-key-not-for-production"
JWT_EXPIRATION="7d"
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="STRATIX AI (Dev)"
ADMIN_EMAIL="admin@stratix.ai"
ADMIN_PASSWORD="dev-password"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL="debug"
```

### Production (Railway + Hostinger)

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@railway-db-host/stratix_ai"
REDIS_URL="redis://railway-redis-host:6379"
OPENAI_API_KEY="sk-your-production-api-key"
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
PORT=3001
API_HOST="0.0.0.0"
JWT_SECRET="your-production-jwt-secret-very-long-and-random"
JWT_EXPIRATION="7d"
FRONTEND_URL="https://your-production-domain.com"
NEXT_PUBLIC_API_URL="https://api.your-production-domain.com"
NEXT_PUBLIC_APP_NAME="STRATIX AI"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL="info"
```

## Generating Secure Secrets

### JWT Secret

Generate a strong JWT secret:

```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Admin Password

Use a strong password generator or create one manually:

```bash
# macOS/Linux
openssl rand -base64 16
```

## Validation

After setting up your `.env` file, verify the configuration:

```bash
# Check database connection
npm run db:generate

# Check API starts without errors
cd apps/api && npm run dev

# Check Redis connection (should see PONG)
redis-cli ping
```

## Security Best Practices

1. **Never commit `.env` to version control** - Only commit `.env.example`
2. **Use strong secrets** - Generate random strings for `JWT_SECRET`
3. **Rotate secrets regularly** - Change `JWT_SECRET` periodically in production
4. **Use environment-specific values** - Different secrets for dev, staging, and production
5. **Restrict file permissions** - `chmod 600 .env` to prevent unauthorized access
6. **Use a secrets manager** - Consider using Railway's native secrets or a dedicated secrets manager for production

## Troubleshooting

### "Cannot find module" errors

Ensure all required environment variables are set. Check `.env.example` for the complete list.

### Database connection errors

Verify `DATABASE_URL` format and that PostgreSQL is running:

```bash
psql -U stratix_user -d stratix_ai -c "SELECT 1;"
```

### Redis connection errors

Verify Redis is running and accessible:

```bash
redis-cli ping
```

### OpenAI API errors

Ensure your API key is valid and has sufficient credits. Check the OpenAI dashboard.
