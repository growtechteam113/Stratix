# STRATIX AI - Phase 5 Design Document

## Goal
Build the competitor intelligence engine, enabling automatic discovery, manual addition, source intake, and AI-powered analysis of market competitors.

## Architecture Overview

The Competitor Intelligence Engine builds upon the Context Engine (Phase 4) and Ingestion Pipeline (Phase 3). It uses the project's structured context to discover potential competitors, allows users to manually add competitors, and then crawls/analyzes those competitors to generate structured intelligence.

1. **Competitor Discovery**:
   - **Automatic**: Uses the project's `ContextVersion` (specifically `market_category`, `product_summary`, `ideal_customer_profile`) to prompt OpenAI or a search API to suggest potential competitors.
   - **Manual**: Users can input a competitor's name and website URL.

2. **Competitor Ingestion**:
   - When a competitor is added, their primary website (and potentially other provided URLs) is sent to the existing Ingestion Pipeline (or a specialized lightweight crawler) to extract text.
   - This data is stored in `CompetitorSource` and processed.

3. **Competitor Analysis**:
   - The extracted text from the competitor's sources is passed to OpenAI to generate a structured `CompetitorInsight`.
   - The prompt uses the project's own context to compare and identify differentiation clues and threat indicators.

## Database Schema Updates (Prisma)

We will add the following models:

- `Competitor`: Represents a competitor company (name, website, project relation).
- `CompetitorSource`: Sources (URLs/files) associated with the competitor for analysis.
- `CompetitorInsight`: The structured JSON output of the AI analysis.

## Competitor Schema (Zod)

The `CompetitorInsight` will be strictly structured with the following fields:
- `company`: string
- `positioning`: string
- `value_propositions`: string[]
- `target_audience`: string
- `messaging_style`: string
- `key_claims`: string[]
- `strengths`: string[]
- `weaknesses`: string[]
- `differentiation_clues`: string[]
- `threat_indicators`: string[]
- `confidence_notes`: string

## Backend Modules

1. **CompetitorsModule**:
   - `CompetitorsController`: Endpoints for CRUD, triggering discovery, and triggering analysis.
   - `CompetitorsService`: Manages DB operations.
   - `CompetitorDiscoveryService`: Uses OpenAI to suggest competitors based on project context.
   - `CompetitorAnalysisService`: Uses OpenAI to analyze competitor sources and generate the structured insight.

## Frontend Updates

- **Competitor List UI**: `/app/projects/[id]/competitors`
  - Displays a grid/list of competitors.
  - Buttons for "Auto-Discover Competitors" and "Add Competitor Manually".
- **Competitor Detail UI**: `/app/projects/[id]/competitors/[competitorId]`
  - Displays the structured `CompetitorInsight` in a card-based layout.
  - Shows the sources used for the analysis.
  - Button to "Re-analyze".

## Testing Strategy
- Unit tests for the Zod schema validation.
- Unit tests for the Discovery and Analysis services (mocking OpenAI).
- Integration tests for the CRUD endpoints.

## Rules & Constraints
- Structured JSON first for insights.
- Do not blindly re-analyze if an insight already exists, unless requested.
- Re-use the existing crawler logic where possible.
