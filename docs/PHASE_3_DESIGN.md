# STRATIX AI - Phase 3 Design Document

## Goal
Build the ingestion processing engine: crawling, parsing, chunking, and embeddings pipeline.

## Architecture Overview

The ingestion pipeline will be an asynchronous, event-driven architecture powered by BullMQ and Redis. When a user adds a source (URL or File), a job is enqueued. The worker service picks up the job and processes it through a series of steps:

1. **Extraction/Crawling**:
   - **URLs**: A secure crawler (with SSRF protection) fetches the HTML, extracts main content (using a library like `cheerio` or `mozilla/readability`), and cleans it.
   - **Files**: Parsers handle PDF (`pdf-parse` or similar), DOCX (`mammoth`), TXT, and HTML files to extract raw text.
2. **Chunking**:
   - The raw text is passed to a semantic chunking service.
   - Text is split into manageable chunks (e.g., 500-1000 tokens) with overlap to preserve context.
   - Deduplication is performed by hashing chunks and checking against existing records in the database.
3. **Embeddings**:
   - Unique chunks are sent to the OpenAI API (`text-embedding-3-small` or `text-embedding-ada-002`) to generate vector embeddings.
   - The embeddings are persisted in PostgreSQL using `pgvector`.
4. **Progress Tracking**:
   - Job progress is tracked via BullMQ events and persisted to the database.
   - The UI polls or uses SSE/WebSockets (polling for now) to display processing status to the user.

## Database Schema Updates (Prisma)

We will add the following models to the Prisma schema:

- `CrawlRun`: Tracks the status of a specific URL crawl.
- `ChunkRecord` (or `Chunk`): Stores the text chunk, metadata, and a relation to the `Source`.
- `EmbeddingRecord`: Stores the vector data for a chunk using `pgvector`.
- `JobProgress`: Tracks the status of BullMQ jobs for UI display.

*Note: In Prisma, we'll need to use raw queries or Prisma's vector support for pgvector operations.*

## Backend Modules

1. **CrawlerModule**:
   - Service: `CrawlerService`
   - Responsibilities: Fetch URLs, SSRF protection (validate IP/domain), extract text.
2. **ParserModule**:
   - Service: `ParserService`
   - Responsibilities: Parse PDF, DOCX, TXT, HTML.
3. **ChunkingModule**:
   - Service: `ChunkingService`
   - Responsibilities: Split text, hash chunks, deduplicate.
4. **EmbeddingsModule**:
   - Service: `EmbeddingsService`
   - Responsibilities: Call OpenAI API, save vectors to DB.
5. **WorkerModule** (in `apps/worker`):
   - Responsibilities: Process BullMQ jobs, orchestrate the pipeline, update job status.

## Security Considerations

- **SSRF Protection**: The crawler must resolve the hostname to an IP address and ensure it is not a private or reserved IP (e.g., `127.0.0.1`, `10.0.0.0/8`, `169.254.0.0/16`) before making the HTTP request.
- **Safe File Handling**: Enforce file size limits and MIME type validation.
- **Ingestion Rate Limits**: Limit the number of concurrent ingestion jobs per user/workspace.

## Frontend Updates

- Update the Source Management UI to display the processing status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).
- Show a progress bar or percentage if available.
- Display extracted chunks or a summary of the extraction results.

## Testing Strategy

- **Unit Tests**:
  - `CrawlerService`: Mock HTTP requests, test SSRF rejection.
  - `ParserService`: Test with sample PDF, DOCX, TXT files.
  - `ChunkingService`: Test semantic splitting and overlap.
  - `EmbeddingsService`: Mock OpenAI API.
- **Integration Tests**:
  - E2E ingestion flow using a mock worker or synchronous execution.
