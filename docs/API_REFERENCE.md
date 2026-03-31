# STRATIX AI - API Reference

Complete API documentation for STRATIX AI. The API follows RESTful conventions and returns JSON responses with consistent error envelopes.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.your-domain.com/api`

## Authentication

All endpoints except `/auth/signup`, `/auth/signin`, and `/health` require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent envelope structure:

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "..."
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/projects"
}
```

## Endpoints

### System

#### GET /health

Check API health status.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "checks": {
    "database": true,
    "memory": {
      "used": 256,
      "total": 512,
      "percentage": 50
    }
  }
}
```

#### GET /health/ready

Check API readiness for requests.

**Response**:
```json
{
  "ready": true
}
```

### Authentication

#### POST /auth/signup

Create a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "workspaceName": "My Company"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "workspace": {
      "id": "workspace-id",
      "name": "My Company"
    },
    "token": "eyJhbGc..."
  }
}
```

#### POST /auth/signin

Sign in to an existing account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "token": "eyJhbGc..."
  }
}
```

#### POST /auth/signout

Sign out the current user.

**Response** (200):
```json
{
  "success": true,
  "data": null
}
```

#### POST /auth/refresh

Refresh JWT token.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc..."
  }
}
```

### Projects

#### GET /projects

List all projects in the current workspace.

**Query Parameters**:
- `page` (number, default: 1): Page number for pagination
- `limit` (number, default: 20): Items per page
- `sort` (string, default: "-createdAt"): Sort field

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "project-id",
      "name": "Project Name",
      "slug": "project-name",
      "description": "Project description",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

#### POST /projects

Create a new project.

**Request**:
```json
{
  "name": "Market Analysis 2024",
  "description": "Competitive analysis for Q1 2024"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "project-id",
    "name": "Market Analysis 2024",
    "slug": "market-analysis-2024",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /projects/:projectId

Get project details.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "project-id",
    "name": "Market Analysis 2024",
    "description": "...",
    "status": "active",
    "sources": [],
    "context": null,
    "competitors": [],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /projects/:projectId

Update project.

**Request**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "project-id",
    "name": "Updated Name",
    "description": "Updated description"
  }
}
```

#### DELETE /projects/:projectId

Delete project.

**Response** (200):
```json
{
  "success": true,
  "data": null
}
```

### Sources

#### POST /projects/:projectId/sources/url

Add a URL source to a project.

**Request**:
```json
{
  "url": "https://example.com",
  "title": "Example Website"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "source-id",
    "type": "url",
    "url": "https://example.com",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /projects/:projectId/sources/upload

Upload a file source.

**Request**: multipart/form-data
- `file`: File to upload (PDF, DOCX, TXT, or HTML)

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "source-id",
    "type": "file",
    "filename": "document.pdf",
    "mimeType": "application/pdf",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /projects/:projectId/sources

List all sources in a project.

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "source-id",
      "type": "url",
      "url": "https://example.com",
      "status": "completed",
      "chunks": 45,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Context

#### POST /projects/:projectId/context/generate

Generate business context from project sources.

**Request**:
```json
{
  "force": false
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "context-id",
    "version": 1,
    "company_overview": "...",
    "ideal_customer_profile": "...",
    "pain_points": [],
    "value_propositions": [],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /projects/:projectId/context

Get the latest context for a project.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "context-id",
    "version": 1,
    "company_overview": "...",
    "ideal_customer_profile": "...",
    "pain_points": [],
    "value_propositions": []
  }
}
```

### Competitors

#### POST /projects/:projectId/competitors/discover

Automatically discover competitors.

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "competitor-id",
      "name": "Competitor Name",
      "website": "https://competitor.com",
      "status": "discovered"
    }
  ]
}
```

#### POST /projects/:projectId/competitors

Manually add a competitor.

**Request**:
```json
{
  "name": "Competitor Name",
  "website": "https://competitor.com"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "competitor-id",
    "name": "Competitor Name",
    "website": "https://competitor.com",
    "status": "active"
  }
}
```

#### GET /projects/:projectId/competitors

List all competitors.

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "competitor-id",
      "name": "Competitor Name",
      "positioning": "...",
      "strengths": [],
      "weaknesses": []
    }
  ]
}
```

### Strategy

#### POST /projects/:projectId/strategy/positioning

Generate positioning statement.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "positioning_statement": "...",
    "differentiation_strategy": "...",
    "messaging_framework": "...",
    "confidence": 0.95
  }
}
```

#### POST /projects/:projectId/strategy/score

Generate strategy score.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "score": 18,
    "maxScore": 20,
    "dimensions": {
      "clarity": 19,
      "differentiation": 18,
      "market_viability": 17,
      "competitor_defense": 18
    },
    "justification": "..."
  }
}
```

#### POST /projects/:projectId/strategy/brief

Generate strategic brief.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "executive_summary": "...",
    "market_landscape": "...",
    "competitor_analysis": "...",
    "opportunity_mapping": "...",
    "positioning_strategy": "...",
    "strategic_recommendations": "..."
  }
}
```

### Reports

#### POST /projects/:projectId/reports

Publish a project as a public report.

**Request**:
```json
{
  "title": "Q1 2024 Market Analysis",
  "description": "Competitive intelligence report"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "report-id",
    "slug": "q1-2024-market-analysis",
    "title": "Q1 2024 Market Analysis",
    "published": true,
    "publicUrl": "https://stratix.ai/reports/q1-2024-market-analysis"
  }
}
```

#### GET /reports/:slug

Get a public report (no authentication required).

**Response** (200):
```json
{
  "success": true,
  "data": {
    "title": "Q1 2024 Market Analysis",
    "description": "...",
    "positioning": "...",
    "score": 18,
    "brief": "..."
  }
}
```

### Exports

#### GET /projects/:projectId/exports/json

Export project data as JSON.

**Response** (200):
```json
{
  "project": {...},
  "context": {...},
  "competitors": [...],
  "strategy": {...}
}
```

### Admin

#### POST /admin/bootstrap

Bootstrap the first super-admin user (only works if no admins exist).

**Request**:
```json
{
  "email": "admin@stratix.ai",
  "password": "secure-password"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "admin@stratix.ai",
    "role": "SUPERADMIN"
  }
}
```

#### GET /admin/users

List all users (admin only).

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "workspace": "Workspace Name",
      "signupDate": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T10:30:00Z",
      "isSuspended": false
    }
  ]
}
```

#### PUT /admin/users/:userId/suspend

Suspend a user (admin only).

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "isSuspended": true
  }
}
```

#### GET /admin/activity

Get system activity logs (admin only).

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "event-id",
      "userId": "user-id",
      "eventType": "PROJECT_CREATED",
      "metadata": {...},
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Rate Limiting

API requests are rate-limited per user:
- **Window**: 15 minutes
- **Limit**: 100 requests per window (configurable)

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

## Pagination

Endpoints that return lists support pagination:

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Webhooks (Future)

Webhooks will be available for:
- Project creation/deletion
- Source ingestion completion
- Strategy generation completion
- Report publication

## Support

For API support, contact api-support@stratix.ai or visit https://stratix.ai/docs.
