# STRATIX AI - Phase 6 Design Document

## Goal
Build the Category Mapping and Opportunity Engine to provide market segmentation and whitespace detection based on the analyzed competitors and the user's business context.

## Architecture Overview

This phase leverages the structured data generated in Phase 4 (Context) and Phase 5 (Competitor Insights) to synthesize a macro-level view of the market. It groups competitors into logical segments and identifies areas of high saturation, narrative overlap, and potential whitespace opportunities.

1. **Category Clustering (Segmentation)**:
   - Takes all analyzed competitors for a project and the project's own context.
   - Uses OpenAI to analyze the positioning, target audiences, and value propositions to group players into distinct market segments.
   - Outputs a structured map of the category, including segment names, descriptions, and which players belong where.

2. **Opportunity Detection**:
   - Analyzes the clustered market map to identify:
     - **Saturated Areas**: Segments with many competitors or highly overlapping messaging.
     - **Whitespace Opportunities**: Unmet needs, underserved audiences, or novel positioning angles.
     - **Emerging Trends**: Common themes or new features appearing across multiple competitors.
     - **Narrative Overlap**: Areas where multiple companies are saying the exact same thing, making it hard to differentiate.

## Database Schema Updates (Prisma)

We will add the following models:

- `CategoryCluster`: Represents a snapshot of the market segmentation.
  - `projectId`
  - `segments` (JSON: array of segments with names, descriptions, and competitor IDs)
  - `generatedAt`
- `OpportunityZone`: Represents the whitespace and saturation analysis.
  - `projectId`
  - `saturatedAreas` (JSON array)
  - `whitespaceOpportunities` (JSON array)
  - `emergingTrends` (JSON array)
  - `narrativeOverlap` (JSON array)
  - `generatedAt`

## Backend Modules

1. **MarketModule** (or CategoryModule):
   - `MarketController`: Endpoints to trigger generation and retrieve category maps and opportunities.
   - `CategoryClusteringService`: Uses OpenAI to group competitors and define segments.
   - `OpportunityDetectionService`: Uses OpenAI to analyze the clusters and identify whitespaces/saturation.

## Frontend Updates

- **Category Map UI**: `/app/projects/[id]/market/category-map`
  - Visual representation of market segments (e.g., card grids grouped by segment).
  - Displays which competitors fall into which segment, along with the user's own projected segment.
- **Opportunity UI**: `/app/projects/[id]/market/opportunities`
  - Displays visual insight cards for Saturated Areas, Whitespace Opportunities, Emerging Trends, and Narrative Overlaps.

## Testing Strategy
- Unit tests for the Clustering and Opportunity services (mocking OpenAI).
- Integration tests for the API endpoints.
- Verification that the generated JSON structures match the required schema.

## Rules & Constraints
- Structured JSON first for all AI outputs.
- Ensure the analysis is grounded in the previously generated `CompetitorInsight` and `ContextVersion` data.
- Do not blindly regenerate if data already exists, provide a "Refresh" option instead.
