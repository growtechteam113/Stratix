# Phase 9: Owner-Admin Control Center Design

## Overview
Phase 9 introduces the global owner-admin dashboard, providing super-admins with comprehensive visibility and control over the STRATIX AI platform. This includes user management, activity monitoring, job tracking, and system health overviews.

## Data Models
We will leverage existing models (`User`, `LoginEvent`, `UserActivityEvent`, `AuditLog`, `Project`, `Source`, `PublicReport`) and add any necessary fields or models for:
- `User.isSuspended` (Boolean) - to handle user suspension.
- `RateLimitEvent` - to track abuse.

### Prisma Schema Updates
```prisma
model User {
  // existing fields...
  isSuspended Boolean @default(false)
  suspendedAt DateTime?
  suspendedReason String?
}

model RateLimitEvent {
  id          String   @id @default(cuid())
  ipAddress   String?
  userId      String?
  endpoint    String
  limit       Int
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([ipAddress])
  @@map("rate_limit_events")
}
```

## Backend Architecture

### 1. Admin Analytics Service
- **System Health**: Aggregated metrics (total users, active projects, published reports, total sources).
- **Activity Metrics**: Recent signups, login success/failure rates.

### 2. Admin Controllers & Endpoints
- `GET /admin/dashboard/stats`: Overview metrics.
- `GET /admin/users`: Paginated list of users with suspension status.
- `PUT /admin/users/:id/suspend`: Suspend a user.
- `PUT /admin/users/:id/restore`: Restore a user.
- `GET /admin/events/logins`: Paginated login history.
- `GET /admin/events/activity`: Paginated user activity history.
- `GET /admin/events/audit`: Paginated audit logs.
- `GET /admin/jobs`: BullMQ job monitor (pending, active, completed, failed).
- `POST /admin/jobs/:id/retry`: Retry a failed job.

## Frontend Architecture

### Layout
A dedicated `/app/admin` layout, protected by a `GlobalAdminGuard` equivalent on the frontend (checking `user.isGlobalAdmin`).

### Pages
1. **Dashboard Overview (`/app/admin`)**:
   - KPI Cards (Total Users, Active Projects, Jobs in Queue, Failed Jobs).
   - System Health Summary.
2. **Users Management (`/app/admin/users`)**:
   - Table of users (email, signup date, status).
   - Action menu: Suspend/Restore, View Details.
3. **Activity Logs (`/app/admin/activity`)**:
   - Tabs for: Login History, User Activity, Audit Logs, Rate Limits.
   - Rich filtering (by user, by date, by status).
4. **Job Monitor (`/app/admin/jobs`)**:
   - Table of BullMQ jobs.
   - Status indicators.
   - Retry actions for failed jobs.

## Security & Access Control
- All endpoints must be protected by `JwtAuthGuard` and `GlobalAdminGuard`.
- Every admin action (suspension, retry) must be recorded in the `AuditLog` table.

## Testing Strategy
- Unit tests for the Admin Service ensuring only global admins can access data.
- E2E tests for the suspension flow and job retry logic.
- UI consistency checks.
