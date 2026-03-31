# STRATIX AI - API Documentation

This document provides an overview of the STRATIX AI REST API.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.stratix.ai`

## Authentication

All API endpoints (except `/auth/*` and `/health`) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Endpoints

### Health Check

```
GET /health
```

Returns the API health status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Authentication

#### Sign Up

```
POST /auth/signup
```

Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

#### Sign In

```
POST /auth/signin
```

Authenticate and receive a JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": { /* user object */ }
  }
}
```

#### Sign Out

```
POST /auth/signout
```

Invalidate the current session.

**Response** (200):
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

### Projects

#### List Projects

```
GET /projects
```

Get all projects for the current tenant.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "name": "Project Name",
      "slug": "project-name",
      "description": "Project description",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Project

```
POST /projects
```

Create a new project.

**Request Body**:
```json
{
  "name": "My Project",
  "description": "Project description"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "proj_123",
    "name": "My Project",
    "slug": "my-project",
    "description": "Project description"
  }
}
```

#### Get Project

```
GET /projects/:id
```

Get a specific project.

**Response** (200):
```json
{
  "success": true,
  "data": { /* project object */ }
}
```

#### Update Project

```
PATCH /projects/:id
```

Update a project.

**Request Body**:
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
  "data": { /* updated project object */ }
}
```

#### Delete Project

```
DELETE /projects/:id
```

Delete a project.

**Response** (204): No content

### Sources

#### Add Source

```
POST /projects/:projectId/sources
```

Add a URL or file source to a project.

**Request Body**:
```json
{
  "url": "https://example.com",
  "type": "url"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "src_123",
    "url": "https://example.com",
    "type": "url",
    "status": "pending"
  }
}
```

#### List Sources

```
GET /projects/:projectId/sources
```

Get all sources for a project.

**Response** (200):
```json
{
  "success": true,
  "data": [ /* array of sources */ ]
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per user.

**Headers**:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Pagination

List endpoints support pagination with `page` and `limit` query parameters:

```
GET /projects?page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## OpenAPI Documentation

Full OpenAPI/Swagger documentation is available at:
- Development: `http://localhost:3001/api/docs`
- Production: `https://api.stratix.ai/docs`

## Webhooks (Future)

Webhook support will be added in Phase 3 for real-time event notifications.
