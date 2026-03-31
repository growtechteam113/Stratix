# STRATIX AI - System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB["Next.js Frontend<br/>Port 3000"]
    end

    subgraph "API Layer"
        API["NestJS REST API<br/>Port 3001"]
    end

    subgraph "Data Layer"
        DB["PostgreSQL<br/>+ pgvector"]
        REDIS["Redis<br/>Job Queue"]
    end

    subgraph "Worker Layer"
        WORKER["BullMQ Worker<br/>Background Jobs"]
    end

    subgraph "External Services"
        OPENAI["OpenAI API<br/>GPT-4, Embeddings"]
    end

    WEB -->|HTTP/REST| API
    API -->|Query/Mutation| DB
    API -->|Enqueue Job| REDIS
    WORKER -->|Dequeue Job| REDIS
    WORKER -->|Read/Write| DB
    WORKER -->|API Call| OPENAI
    WEB -->|WebSocket/Polling| API
```

## Multi-Tenant Architecture

```mermaid
graph LR
    subgraph "Tenant A"
        TA_USER["Users"]
        TA_PROJ["Projects"]
        TA_DATA["Data"]
    end

    subgraph "Tenant B"
        TB_USER["Users"]
        TB_PROJ["Projects"]
        TB_DATA["Data"]
    end

    subgraph "Shared"
        DB["PostgreSQL<br/>tenant_id isolation"]
    end

    TA_USER --> DB
    TA_PROJ --> DB
    TA_DATA --> DB
    TB_USER --> DB
    TB_PROJ --> DB
    TB_DATA --> DB
```

## Data Flow: URL Ingestion & Embedding

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Queue
    participant Worker
    participant OpenAI
    participant DB

    User->>API: Submit URL
    API->>DB: Create Source record
    API->>Queue: Enqueue crawl job
    API-->>User: Job ID + progress endpoint

    Queue->>Worker: Dequeue crawl job
    Worker->>Worker: Crawl URL
    Worker->>Worker: Parse HTML
    Worker->>Worker: Chunk content
    Worker->>OpenAI: Generate embeddings
    OpenAI-->>Worker: Embeddings vector
    Worker->>DB: Store chunks + embeddings
    Worker->>Queue: Mark job complete
```

## Database Schema (Phase 0 Foundation)

```mermaid
erDiagram
    USER ||--o{ TENANT : "belongs_to"
    TENANT ||--o{ PROJECT : "owns"
    PROJECT ||--o{ SOURCE : "has"
    SOURCE ||--o{ CHUNK : "contains"
    CHUNK ||--o{ EMBEDDING : "has"

    USER {
        string id PK
        string email UK
        string name
        string password_hash
        timestamp created_at
        timestamp updated_at
    }

    TENANT {
        string id PK
        string name
        timestamp created_at
        timestamp updated_at
    }

    PROJECT {
        string id PK
        string tenant_id FK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }

    SOURCE {
        string id PK
        string project_id FK
        string url
        string type
        timestamp created_at
        timestamp updated_at
    }

    CHUNK {
        string id PK
        string source_id FK
        string content
        int order
        timestamp created_at
    }

    EMBEDDING {
        string id PK
        string chunk_id FK
        vector vector
        timestamp created_at
    }
```

## Deployment Architecture

### Backend (Railway)

```
Railway Project
├── PostgreSQL Database
├── Redis Instance
└── NestJS API + Worker
    ├── /api/* routes
    └── Background job processor
```

### Frontend (Hostinger)

```
Hostinger Hosting
├── Next.js Static/SSR Build
├── CDN Distribution
└── Environment: NEXT_PUBLIC_API_URL=https://api.railway.app
```

## Security & Isolation

1. **Multi-Tenant Isolation**: All queries filtered by `tenant_id`
2. **JWT Authentication**: Stateless token-based auth
3. **CORS**: Frontend origin whitelist
4. **Rate Limiting**: Per-user request throttling
5. **Audit Logging**: All mutations logged with user/tenant context
6. **Data Encryption**: Passwords hashed with bcrypt

## Performance Considerations

- **Database Indexing**: Indexes on `tenant_id`, `user_id`, `project_id`
- **Pagination**: All list endpoints paginated (default 20 items)
- **Caching**: Redis for job queue and future session caching
- **Async Processing**: Heavy workloads via BullMQ
- **Vector Search**: pgvector for semantic similarity queries

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|-----------|
| Database | Local PostgreSQL | Railway PostgreSQL |
| Redis | Local Redis | Railway Redis |
| API URL | http://localhost:3001 | https://api.railway.app |
| Frontend URL | http://localhost:3000 | https://stratix.ai |
| Logging | Console | Structured JSON logs |
| Error Handling | Verbose | User-friendly messages |
