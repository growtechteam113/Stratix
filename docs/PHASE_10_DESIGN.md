# Phase 10: Hardening, Monitoring, Rate Limits, Abuse Controls, and Reliability

## Overview
Phase 10 focuses on making STRATIX AI production-ready by introducing robust security, reliability, and observability mechanisms. This includes per-user rate limiting, active job caps, structured logging, consistent error handling, and health monitoring.

## 1. Rate Limiting & Abuse Controls

### 1.1. Per-User Quotas
We will implement a `UserQuota` model to track usage limits for resource-intensive operations (e.g., AI analysis, source ingestion).
- **Daily Analysis Caps**: Limit the number of AI analyses a user can perform per day.
- **Active Job Caps**: Prevent a single user from overwhelming the BullMQ worker queue by limiting concurrent active jobs.

### 1.2. Rate Limiting Middleware
We will use `@nestjs/throttler` backed by Redis to implement standard API rate limiting:
- Global limit: 100 requests / 1 minute per IP.
- Auth endpoints: 5 requests / 5 minutes per IP.
- AI generation endpoints: 10 requests / 1 hour per User.

### 1.3. Abuse Event Logging
We will expand the existing `RateLimitEvent` model (created in Phase 9) and introduce an `AbuseEvent` concept to track malicious behavior, which can automatically trigger user suspension if thresholds are crossed.

## 2. Reliability & Resilience

### 2.1. BullMQ Retry & Backoff
All worker jobs (Ingestion, Analysis) will be configured with:
- `attempts`: 3
- `backoff`: Exponential strategy (e.g., 5s, 25s, 125s)
- Failure logging to capture stack traces for the admin dashboard.

### 2.2. Consistent API Error Envelopes
We will implement a global `AllExceptionsFilter` in NestJS to ensure all API responses follow a strict envelope:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional validation errors
  },
  "timestamp": "2023-10-27T10:00:00Z",
  "path": "/api/resource"
}
```

## 3. Monitoring & Health

### 3.1. Health Endpoints
We will use `@nestjs/terminus` to expose a `/health` endpoint that checks:
- Database connectivity (Prisma)
- Redis connectivity (BullMQ)
- Memory usage

### 3.2. Structured Logging
We will implement a custom `LoggerService` (potentially wrapping `pino` or `winston`) to output structured JSON logs, making it easier to parse in production log aggregators (like Datadog or CloudWatch).

## Database Schema Updates
```prisma
model UserQuota {
  id              String   @id @default(cuid())
  userId          String   @unique
  analysesUsed    Int      @default(0)
  analysesLimit   Int      @default(50) // Per day
  activeJobsCount Int      @default(0)
  activeJobsLimit Int      @default(5)  // Concurrent
  lastResetAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_quotas")
}

model AbuseEvent {
  id          String   @id @default(cuid())
  userId      String?
  ipAddress   String?
  eventType   String   // e.g., 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_PAYLOAD'
  details     Json?
  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([ipAddress])
  @@map("abuse_events")
}
```

## Testing Strategy
- Unit tests for the Rate Limiting logic and Quota resets.
- Integration tests for the Global Exception Filter to ensure the error envelope is always consistent.
- BullMQ worker tests to verify retry logic and backoff delays.
