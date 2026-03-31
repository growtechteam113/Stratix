# STRATIX AI - Architecture Diagrams

Comprehensive system architecture visualizations for STRATIX AI.

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB["Next.js Frontend<br/>Port 3000"]
        BROWSER["Web Browser"]
    end
    
    subgraph "API Gateway"
        NGINX["Nginx Reverse Proxy<br/>SSL/TLS"]
    end
    
    subgraph "Backend Services"
        API["NestJS API<br/>Port 3001"]
        WORKER["BullMQ Worker<br/>Async Jobs"]
    end
    
    subgraph "Data Layer"
        DB["PostgreSQL<br/>+ pgvector"]
        REDIS["Redis<br/>Job Queue"]
    end
    
    subgraph "External Services"
        OPENAI["OpenAI API<br/>GPT-4 & Embeddings"]
    end
    
    BROWSER -->|HTTP/S| WEB
    WEB -->|REST API| NGINX
    NGINX -->|Forward| API
    API -->|Query/Mutate| DB
    API -->|Enqueue Jobs| REDIS
    WORKER -->|Poll Jobs| REDIS
    WORKER -->|Read/Write| DB
    WORKER -->|API Calls| OPENAI
    API -->|API Calls| OPENAI
```

## Data Flow - Project Ingestion

```mermaid
graph LR
    USER["User"]
    
    subgraph "Frontend"
        UI["Upload UI<br/>URL Input"]
    end
    
    subgraph "Backend API"
        CTRL["Sources Controller"]
        SVC["Sources Service"]
    end
    
    subgraph "Job Queue"
        QUEUE["BullMQ Queue"]
    end
    
    subgraph "Worker"
        CRAWLER["Crawler Service"]
        PARSER["Parser Service"]
        CHUNK["Chunking Service"]
        EMBED["Embeddings Service"]
    end
    
    subgraph "Database"
        DB["PostgreSQL"]
    end
    
    USER -->|Upload URL/File| UI
    UI -->|POST /sources| CTRL
    CTRL -->|Validate & Store| SVC
    SVC -->|Enqueue Job| QUEUE
    QUEUE -->|Dequeue| CRAWLER
    CRAWLER -->|Extract Text| PARSER
    PARSER -->|Segment Text| CHUNK
    CHUNK -->|Generate Vectors| EMBED
    EMBED -->|Store Records| DB
```

## Data Flow - Strategy Generation

```mermaid
graph LR
    USER["User"]
    
    subgraph "Frontend"
        UI["Generate Button"]
    end
    
    subgraph "Backend API"
        CTRL["Strategy Controller"]
        CONTEXT["Context Service"]
        COMP["Competitor Service"]
        POS["Positioning Service"]
        SCORE["Scoring Service"]
        BRIEF["Brief Service"]
    end
    
    subgraph "AI Engine"
        OPENAI["OpenAI API"]
    end
    
    subgraph "Database"
        DB["PostgreSQL"]
    end
    
    USER -->|Click Generate| UI
    UI -->|POST /strategy/generate| CTRL
    CTRL -->|Load Data| CONTEXT
    CONTEXT -->|Load Competitors| COMP
    COMP -->|Generate Positioning| POS
    POS -->|Call AI| OPENAI
    POS -->|Generate Score| SCORE
    SCORE -->|Call AI| OPENAI
    SCORE -->|Generate Brief| BRIEF
    BRIEF -->|Call AI| OPENAI
    BRIEF -->|Store Results| DB
```

## Async Job Processing

```mermaid
graph TB
    subgraph "API Layer"
        ENDPOINT["POST /sources/ingest"]
        VALIDATOR["Validate Input"]
        STORE["Store Source Record"]
        ENQUEUE["Enqueue Job"]
    end
    
    subgraph "Queue"
        QUEUE["BullMQ Queue<br/>Redis"]
        PENDING["Pending Jobs"]
        ACTIVE["Active Jobs"]
        COMPLETED["Completed Jobs"]
        FAILED["Failed Jobs"]
    end
    
    subgraph "Worker Layer"
        CONSUMER["Job Consumer"]
        PROCESSOR["Process Job"]
        RETRY["Retry Logic<br/>Exponential Backoff"]
        ERROR["Error Handler"]
    end
    
    subgraph "Persistence"
        DB["PostgreSQL"]
        LOGS["Job Logs"]
    end
    
    ENDPOINT -->|Validate| VALIDATOR
    VALIDATOR -->|Store| STORE
    STORE -->|Enqueue| ENQUEUE
    ENQUEUE -->|Add| PENDING
    PENDING -->|Consume| CONSUMER
    CONSUMER -->|Move to| ACTIVE
    ACTIVE -->|Execute| PROCESSOR
    PROCESSOR -->|Success| COMPLETED
    PROCESSOR -->|Failure| FAILED
    FAILED -->|Retry| RETRY
    RETRY -->|Re-enqueue| PENDING
    RETRY -->|Max Retries| ERROR
    ERROR -->|Log| LOGS
    COMPLETED -->|Persist| DB
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ WORKSPACE : owns
    USER ||--o{ LOGIN_EVENT : generates
    USER ||--o{ USER_ACTIVITY_EVENT : generates
    USER ||--o{ RATE_LIMIT_EVENT : triggers
    USER ||--o{ ABUSE_EVENT : triggers
    
    WORKSPACE ||--o{ PROJECT : contains
    WORKSPACE ||--o{ USER : "has members"
    
    PROJECT ||--o{ SOURCE_URL : contains
    PROJECT ||--o{ UPLOADED_FILE : contains
    PROJECT ||--o{ CRAWL_RUN : has
    PROJECT ||--o{ CONTEXT_FILE : has
    PROJECT ||--o{ COMPETITOR : has
    PROJECT ||--o{ CATEGORY_CLUSTER : has
    PROJECT ||--o{ OPPORTUNITY_ZONE : has
    PROJECT ||--o{ POSITIONING_STATEMENT : has
    PROJECT ||--o{ SCORE_CARD : has
    PROJECT ||--o{ STRATEGIC_BRIEF : has
    PROJECT ||--o{ PUBLIC_REPORT : has
    
    SOURCE_URL ||--o{ CRAWL_RUN : "triggers"
    UPLOADED_FILE ||--o{ CRAWL_RUN : "triggers"
    
    CRAWL_RUN ||--o{ CHUNK_RECORD : produces
    CHUNK_RECORD ||--o{ EMBEDDING_RECORD : has
    
    CONTEXT_FILE ||--o{ CONTEXT_VERSION : versions
    
    COMPETITOR ||--o{ COMPETITOR_SOURCE : has
    COMPETITOR ||--o{ COMPETITOR_INSIGHT : has
    
    POSITIONING_STATEMENT ||--o{ CONTEXT_VERSION : references
    POSITIONING_STATEMENT ||--o{ COMPETITOR : references
    
    SCORE_CARD ||--o{ POSITIONING_STATEMENT : scores
    
    STRATEGIC_BRIEF ||--o{ SCORE_CARD : includes
    STRATEGIC_BRIEF ||--o{ COMPETITOR : analyzes
    
    PUBLIC_REPORT ||--o{ POSITIONING_STATEMENT : publishes
    PUBLIC_REPORT ||--o{ SCORE_CARD : publishes
    PUBLIC_REPORT ||--o{ STRATEGIC_BRIEF : publishes
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>API: POST /auth/signin
    API->>Database: Verify user & password
    Database-->>API: User found & verified
    API->>API: Generate JWT token
    API-->>Frontend: Return token + refresh token
    Frontend->>Frontend: Store token in memory<br/>refresh token in httpOnly cookie
    Frontend->>API: GET /profile<br/>Authorization: Bearer {token}
    API->>API: Verify JWT signature
    API->>Database: Fetch user data
    Database-->>API: User data
    API-->>Frontend: Return user profile
    Frontend->>Frontend: Update app state
```

## Multi-Tenant Isolation

```mermaid
graph TB
    subgraph "Workspace A"
        USER_A["User A"]
        PROJECT_A["Project A"]
        DATA_A["Data A"]
    end
    
    subgraph "Workspace B"
        USER_B["User B"]
        PROJECT_B["Project B"]
        DATA_B["Data B"]
    end
    
    subgraph "API Layer"
        AUTH["JWT Auth"]
        GUARD["Workspace Guard"]
        FILTER["Data Filter"]
    end
    
    subgraph "Database"
        DB["PostgreSQL<br/>workspace_id in all tables"]
    end
    
    USER_A -->|Token| AUTH
    AUTH -->|Extract workspace_id| GUARD
    GUARD -->|Verify access| FILTER
    FILTER -->|Query with workspace_id| DB
    DB -->|Return only Workspace A data| FILTER
    
    USER_B -->|Token| AUTH
    AUTH -->|Extract workspace_id| GUARD
    GUARD -->|Verify access| FILTER
    FILTER -->|Query with workspace_id| DB
    DB -->|Return only Workspace B data| FILTER
```

## Rate Limiting & Abuse Control

```mermaid
graph TB
    subgraph "Request"
        REQ["Incoming Request"]
    end
    
    subgraph "Middleware"
        QUOTA["Quota Check"]
        ABUSE["Abuse Detection"]
    end
    
    subgraph "Decision"
        ALLOW["Allow Request"]
        THROTTLE["Throttle Response"]
        SUSPEND["Suspend User"]
    end
    
    subgraph "Logging"
        LOG["Log Event"]
    end
    
    subgraph "Database"
        QUOTA_DB["UserQuota"]
        ABUSE_DB["AbuseEvent"]
    end
    
    REQ -->|Check limits| QUOTA
    QUOTA -->|Query| QUOTA_DB
    QUOTA_DB -->|Within limit| ALLOW
    QUOTA_DB -->|Approaching limit| THROTTLE
    
    REQ -->|Analyze patterns| ABUSE
    ABUSE -->|Query| ABUSE_DB
    ABUSE_DB -->|Normal behavior| ALLOW
    ABUSE_DB -->|Suspicious| SUSPEND
    
    ALLOW -->|Record| LOG
    THROTTLE -->|Record| LOG
    SUSPEND -->|Record| LOG
    LOG -->|Store| ABUSE_DB
```

## Context Engine Pipeline

```mermaid
graph LR
    subgraph "Input"
        SOURCES["Project Sources<br/>URLs & Files"]
        CHUNKS["Chunk Records<br/>with Embeddings"]
    end
    
    subgraph "Processing"
        RETRIEVE["Semantic Retrieval<br/>Top-K Chunks"]
        PROMPT["Build Prompt<br/>with Context"]
        GENERATE["Generate Context<br/>via OpenAI"]
        VALIDATE["Validate Schema<br/>Zod"]
    end
    
    subgraph "Output"
        CONTEXT["Structured Context<br/>JSON"]
        VERSION["Store Version<br/>in Database"]
    end
    
    SOURCES -->|Retrieve| RETRIEVE
    CHUNKS -->|Search| RETRIEVE
    RETRIEVE -->|Combine| PROMPT
    PROMPT -->|Call API| GENERATE
    GENERATE -->|Parse Response| VALIDATE
    VALIDATE -->|Valid| CONTEXT
    CONTEXT -->|Persist| VERSION
```

## Competitor Discovery Pipeline

```mermaid
graph LR
    subgraph "Input"
        CONTEXT["Business Context<br/>Market Category<br/>ICP"]
    end
    
    subgraph "Discovery"
        ANALYZE["Analyze Context<br/>Extract Keywords"]
        GENERATE["Generate Competitors<br/>via OpenAI"]
        VALIDATE["Validate Names<br/>& Websites"]
    end
    
    subgraph "Processing"
        CRAWL["Crawl Competitor<br/>Websites"]
        CHUNK["Chunk Content"]
        EMBED["Generate Embeddings"]
    end
    
    subgraph "Analysis"
        ANALYZE_COMP["Analyze Positioning<br/>vs Your Context"]
        EXTRACT["Extract Insights<br/>Strengths/Weaknesses"]
        STORE["Store Intelligence<br/>in Database"]
    end
    
    CONTEXT -->|Extract| ANALYZE
    ANALYZE -->|Call AI| GENERATE
    GENERATE -->|Validate| VALIDATE
    VALIDATE -->|Crawl| CRAWL
    CRAWL -->|Process| CHUNK
    CHUNK -->|Vectorize| EMBED
    EMBED -->|Compare| ANALYZE_COMP
    ANALYZE_COMP -->|Extract| EXTRACT
    EXTRACT -->|Persist| STORE
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client"
        BROWSER["Web Browser"]
    end
    
    subgraph "Hostinger CDN"
        CDN["Cloudflare CDN<br/>Static Assets"]
    end
    
    subgraph "Hostinger Frontend"
        FE["Next.js App<br/>Port 3000"]
        NGINX_FE["Nginx<br/>SSL/TLS"]
    end
    
    subgraph "Railway Backend"
        NGINX_API["Nginx<br/>SSL/TLS"]
        API["NestJS API<br/>Port 3001"]
        WORKER["BullMQ Worker"]
    end
    
    subgraph "Railway Data"
        POSTGRES["PostgreSQL<br/>+ pgvector"]
        REDIS["Redis"]
    end
    
    subgraph "External"
        OPENAI["OpenAI API"]
    end
    
    BROWSER -->|HTTPS| CDN
    CDN -->|Serve Static| NGINX_FE
    NGINX_FE -->|Forward| FE
    FE -->|HTTPS| NGINX_API
    NGINX_API -->|Forward| API
    API -->|Query| POSTGRES
    API -->|Enqueue| REDIS
    WORKER -->|Poll| REDIS
    WORKER -->|Query| POSTGRES
    API -->|Call| OPENAI
    WORKER -->|Call| OPENAI
```

## Error Handling & Resilience

```mermaid
graph TB
    subgraph "Request"
        REQ["Incoming Request"]
    end
    
    subgraph "Processing"
        HANDLER["Request Handler"]
        SERVICE["Service Layer"]
    end
    
    subgraph "Error Handling"
        TRY["Try Block"]
        CATCH["Catch Exception"]
        TRANSFORM["Transform to<br/>Error Envelope"]
        LOG["Log Error"]
    end
    
    subgraph "Response"
        FILTER["Global Exception Filter"]
        RESPONSE["JSON Response<br/>with Error Code"]
    end
    
    REQ -->|Process| HANDLER
    HANDLER -->|Call| SERVICE
    SERVICE -->|Execute| TRY
    TRY -->|Error| CATCH
    CATCH -->|Transform| TRANSFORM
    TRANSFORM -->|Log| LOG
    LOG -->|Filter| FILTER
    FILTER -->|Return| RESPONSE
```

## Performance Optimization

```mermaid
graph TB
    subgraph "Frontend"
        CACHE["Browser Cache<br/>Service Worker"]
        LAZY["Lazy Loading<br/>Code Splitting"]
        COMPRESS["Gzip Compression"]
    end
    
    subgraph "Backend"
        QUERY["Query Optimization<br/>Indexes"]
        BATCH["Batch Processing<br/>BullMQ"]
        REDIS_CACHE["Redis Cache<br/>Hot Data"]
    end
    
    subgraph "Database"
        INDEX["PostgreSQL Indexes<br/>on workspace_id"]
        PARTITION["Partition Large Tables"]
        VACUUM["Periodic VACUUM"]
    end
    
    subgraph "Monitoring"
        METRICS["Prometheus Metrics"]
        LOGS["Structured Logs"]
        ALERTS["Alert Rules"]
    end
    
    CACHE -->|Reduce Requests| LAZY
    LAZY -->|Faster Load| COMPRESS
    QUERY -->|Reduce Latency| BATCH
    BATCH -->|Improve Throughput| REDIS_CACHE
    INDEX -->|Faster Queries| PARTITION
    PARTITION -->|Better Performance| VACUUM
    METRICS -->|Track Performance| LOGS
    LOGS -->|Trigger| ALERTS
```

These diagrams provide a comprehensive view of STRATIX AI's architecture, data flows, and deployment strategy.
