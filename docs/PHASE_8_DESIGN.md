# STRATIX AI - Phase 8 Design Document

## Phase 8: Premium UI Polish, Public Reports, and Exports

### Goal
Upgrade the entire application into a premium elite visual product, implement public report publishing, and add comprehensive export functionality.

### 1. Database Schema Additions

To support public report publishing, we need to add new models to the Prisma schema:

```prisma
model PublicReport {
  id          String   @id @default(uuid())
  projectId   String   @unique
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  slug        String   @unique // For public URLs
  title       String
  description String?
  isPublished Boolean  @default(false)
  theme       String   @default("light") // Future-proofing
  views       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
}
```

### 2. Premium UI Design System

#### Visual Identity
- **Background**: Pure white (`#ffffff`) or very light off-white (`#fafafa`).
- **Typography**: Elegant, premium sans-serif (e.g., Inter, Geist, or SF Pro).
- **Accents**: Glowing text effects using background-clip text with subtle gradients (e.g., blue to indigo).
- **Motion**: Framer Motion for smooth, tasteful futuristic transitions (page loads, list stagger).
- **Interactions**: Refined 3D-like hover states with subtle box-shadow changes and slight Y-axis translations.

#### Key Components
1. **Glowing Heading**: A reusable component for primary titles with a gradient text clip.
2. **Premium Card**: A container with subtle borders, soft shadows, and hover elevation.
3. **Animated List**: A staggered list container using Framer Motion.
4. **Premium Button**: Buttons with subtle gradient backgrounds and hover glows.

### 3. Frontend Pages

#### Landing Page (`/`)
- Hero section with glowing headline and subtle animated background.
- Feature showcase with premium cards.
- Clear call-to-action to sign up or sign in.

#### Dashboard (`/app/projects`)
- Polished layout with a clean sidebar or top navigation.
- Animated project cards with quick actions.

#### Public Report Pages
- `/reports/[slug]`: The public-facing view of a project's strategic brief and scorecard. Read-only, highly polished, optimized for reading and printing.

### 4. Backend Services

#### Public Report Service
- Endpoints to create, update, publish, and unpublish a report.
- Endpoint to fetch a public report by slug (no auth required).
- View counter logic.

#### Export Service
- Endpoint to download the entire project context and strategy as a structured JSON file.
- Endpoint to download the raw AI context.
- Print-optimized CSS for the public report page to serve as a PDF export via the browser's print dialog.

### 5. Implementation Steps

1. **Schema Update**: Add `PublicReport` model.
2. **Backend**: Implement `PublicReportController` and `ExportController`.
3. **UI Foundation**: Setup Tailwind config with premium colors, install Framer Motion, create core UI components.
4. **Landing Page**: Build the premium public landing page.
5. **Dashboard Polish**: Refactor existing dashboard components with the new design system.
6. **Publishing Flow**: Add UI to the project settings to publish/unpublish and manage the public link.
7. **Public Report View**: Build the read-only, print-optimized public report page.
8. **Export Center**: Add UI to download JSON and Context files.
9. **Testing**: Verify access controls and UI consistency.
