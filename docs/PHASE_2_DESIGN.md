# STRATIX AI - Phase 2 Design: Projects, Source Management, URL Intake, and Uploads

## 1. Database Schema Updates

We will expand the Prisma schema to handle projects and sources effectively.

### Models
- **`Project`**: Represents a competitive intelligence project.
  - Fields: `id`, `workspaceId`, `userId`, `name`, `slug`, `description`, `status` (`ACTIVE`, `ARCHIVED`), `createdAt`, `updatedAt`.
  - Relations: Belongs to `Workspace` and `User`. Has many `SourceDocument`s.
- **`SourceDocument`**: A unified model for all ingested sources (URLs and files).
  - Fields: `id`, `projectId`, `type` (`URL`, `FILE`), `title`, `sourceUrl` (for URLs), `fileKey` (for local file paths since S3 is excluded), `mimeType`, `status` (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`), `metadata` (JSON), `createdAt`, `updatedAt`.
  - Relations: Belongs to `Project`. Has many `Chunk`s (from Phase 0).

*Note: The user requested `SourceUrl`, `UploadedFile`, and `SourceDocument`. A single unified `SourceDocument` model with a `type` discriminator is generally more robust for polymorphic relationships in Prisma, but we can also use specific models if strictly adhering to the prompt. We will use a unified `Source` model (as defined in Phase 0) but enhance it with specific fields for URLs and files.*

## 2. Backend Architecture (NestJS)

### Modules
- **`ProjectsModule`**: Handles project CRUD operations.
- **`SourcesModule`**: Handles URL intake and file uploads.
- **`UploadsModule`**: Manages the local file storage (since no S3 is allowed).

### API Endpoints
- **Projects**:
  - `GET /api/workspaces/:workspaceId/projects`: List projects.
  - `POST /api/workspaces/:workspaceId/projects`: Create project.
  - `GET /api/projects/:projectId`: Get project details.
  - `PATCH /api/projects/:projectId`: Update project.
  - `DELETE /api/projects/:projectId`: Delete project.
- **Sources**:
  - `GET /api/projects/:projectId/sources`: List sources for a project.
  - `POST /api/projects/:projectId/sources/url`: Add a URL source.
  - `POST /api/projects/:projectId/sources/upload`: Upload a file (multipart/form-data).
  - `DELETE /api/sources/:sourceId`: Remove a source.

### Guards & Middleware
- **`WorkspaceMemberGuard`**: Ensures the user is a member of the workspace.
- **`ProjectAccessGuard`**: Ensures the user has access to the project (via workspace membership).
- **File Validation**: Interceptors to validate file types (PDF, DOCX, TXT, HTML) and sizes.

## 3. Frontend Architecture (Next.js)

### Pages & Routes
- `/app/projects`: Dashboard/list of projects.
- `/app/projects/new`: Create project flow.
- `/app/projects/[id]`: Project detail screen (Overview).
- `/app/projects/[id]/sources`: Source management section.

### UI Components
- **ProjectCard**: Display project summary.
- **SourceList**: Data table for sources with status indicators.
- **UrlIntakeForm**: Form to add URLs.
- **FileUploadDropzone**: Drag-and-drop zone for file uploads.

### State Management
- **React Query**: For fetching and caching projects and sources.

## 4. Local File Storage Strategy
Since S3 is explicitly excluded, file uploads will be saved to a local directory (e.g., `uploads/`) within the backend server environment. The `SourcesModule` will serve these files securely if needed, or process them directly from the local disk during the crawling/parsing phase.

## 5. Testing Strategy
- **E2E Tests (`apps/api/test/projects.e2e-spec.ts`)**:
  - Test project creation, retrieval, update, and deletion.
  - Test access control (user from workspace A cannot access project in workspace B).
- **E2E Tests (`apps/api/test/sources.e2e-spec.ts`)**:
  - Test URL source intake.
  - Test file upload with valid and invalid MIME types.
  - Test source listing and deletion.

## 6. Pass/Fail Checklist
- [ ] Prisma schema updated with robust Project and Source models.
- [ ] `ProjectsModule` implemented with CRUD endpoints and ownership checks.
- [ ] `SourcesModule` implemented with URL intake and local file upload endpoints.
- [ ] File validation (PDF, DOCX, TXT, HTML) implemented.
- [ ] Activity logging integrated for project/source actions.
- [ ] Frontend `/app/projects` list and create flow implemented.
- [ ] Frontend `/app/projects/[id]` detail screen implemented.
- [ ] Frontend source management UI (URL form, File dropzone) implemented.
- [ ] E2E tests passing for projects, sources, and access control.
