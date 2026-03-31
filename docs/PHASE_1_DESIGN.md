# STRATIX AI - Phase 1 Design: Auth, Tenant Model, and Admin Foundation

## 1. Database Schema Additions

We will update the Prisma schema to include robust models for authentication, tenant isolation, and audit tracking.

### Models
- **`User`**: Represents a physical user.
  - Fields: `id`, `email`, `passwordHash`, `name`, `globalRole` (e.g., `SUPERADMIN`, `USER`), `createdAt`, `updatedAt`.
- **`Workspace` (Tenant)**: Represents an isolated tenant environment.
  - Fields: `id`, `name`, `slug`, `createdAt`, `updatedAt`.
- **`WorkspaceUser`**: Associates a user with a workspace and defines their role within it.
  - Fields: `id`, `userId`, `workspaceId`, `role` (e.g., `OWNER`, `ADMIN`, `MEMBER`), `createdAt`.
- **`Session`**: Tracks active user sessions for security and remote sign-out capabilities.
  - Fields: `id`, `userId`, `refreshToken`, `expiresAt`, `createdAt`.
- **`LoginEvent`**: Tracks login attempts.
  - Fields: `id`, `userId` (optional for failed attempts), `emailAttempted`, `ipAddress`, `userAgent`, `status` (`SUCCESS`, `FAILED`), `createdAt`.
- **`UserActivityEvent`**: Generic audit log for user actions.
  - Fields: `id`, `userId`, `workspaceId` (optional), `action`, `resource`, `metadata` (JSON), `createdAt`.

## 2. Backend Architecture (NestJS)

### Modules
- **`AuthModule`**: Handles authentication flows.
- **`UsersModule`**: Manages user records.
- **`WorkspacesModule`**: Manages tenant workspaces.
- **`AdminModule`**: Dedicated to global owner-admin operations.
- **`EventsModule`**: Service for recording `LoginEvent` and `UserActivityEvent`.

### API Endpoints
- `POST /api/auth/signup`: Create a new user and their default workspace.
- `POST /api/auth/signin`: Authenticate user, return short-lived JWT Access Token and HTTP-only cookie with Refresh Token.
- `POST /api/auth/signout`: Invalidate the current session.
- `POST /api/auth/refresh`: Issue a new Access Token using the Refresh Token.
- `GET /api/auth/me`: Get current user profile and workspaces.
- `POST /api/admin/bootstrap`: Special endpoint to create the first `SUPERADMIN` user if no users exist in the system.

### Guards & Middleware
- **`JwtAuthGuard`**: Validates the Access Token for protected routes.
- **`GlobalAdminGuard`**: Ensures the user has `globalRole === 'SUPERADMIN'`.
- **`WorkspaceRoleGuard`**: Ensures the user has the required role within the specified workspace context.

## 3. Frontend Architecture (Next.js)

### State Management
- **Zustand (`useAuthStore`)**: Stores current `user`, `activeWorkspace`, and `isAuthenticated` state.
- **Axios Interceptor**: Automatically attaches the JWT Access Token to outgoing requests and handles 401 Unauthorized responses by attempting a silent refresh via the `/api/auth/refresh` endpoint.

### Pages & Routes
- **Public Routes**:
  - `/signin`: Login page with email/password.
  - `/signup`: Registration page.
- **Protected Routes** (Wrapped in an `AuthGuard` component):
  - `/app`: Main application shell (Dashboard).
  - `/app/profile`: User profile and settings.

### UI Components
- **App Shell**: Premium layout with sidebar navigation, user dropdown, and workspace switcher.
- **Forms**: shadcn/ui forms with React Hook Form and Zod validation.

## 4. Testing Strategy

- **E2E Tests (`apps/api/test/auth.e2e-spec.ts`)**:
  - Test successful signup creates User and Workspace.
  - Test signin returns tokens and logs `LoginEvent`.
  - Test failed signin logs failed `LoginEvent`.
  - Test refresh token flow.
  - Test protected route access with and without tokens.
  - Test `/admin/bootstrap` flow and `GlobalAdminGuard`.
- **Unit Tests**:
  - Test `AuthService` password hashing and token generation.

## 5. Pass/Fail Checklist

- [ ] Prisma schema updated with User, Workspace, Session, LoginEvent, UserActivityEvent.
- [ ] `POST /api/auth/signup` implemented and tested.
- [ ] `POST /api/auth/signin` implemented and tested (with LoginEvent tracking).
- [ ] `POST /api/auth/signout` implemented.
- [ ] `POST /api/auth/refresh` implemented (Session tracking).
- [ ] `POST /api/admin/bootstrap` implemented.
- [ ] JWT Guards and Admin Guards implemented.
- [ ] Frontend `/signup` and `/signin` pages created.
- [ ] Frontend authenticated app shell created.
- [ ] Frontend profile page created.
- [ ] E2E tests passing for all auth flows.
