# STRATIX AI - Phase 7 Design Document

## Goal
Build the main strategic output system, consisting of the Positioning Engine, Score Engine, and Strategic Brief Generator. This phase synthesizes all previous context, competitor data, and market mapping into actionable, consultant-grade strategic outputs.

## Architecture Overview

### 1. Positioning Engine
Generates the core strategic positioning for the user's product/company.
- **Inputs**: `ContextVersion` (user's business context), `CategoryCluster` (market segments), `OpportunityZone` (whitespace/saturation).
- **Outputs** (Structured JSON):
  - `positioning_statement`: The core elevator pitch.
  - `differentiation_strategy`: How to stand out.
  - `messaging_framework`: Key pillars and supporting messages.
  - `target_icp_alignment`: Why this positioning works for the ICP.
  - `brand_narrative`: The broader story.
  - `go_to_market_strategy`: High-level GTM approach.
  - `positioning_rationale`: Why this positioning was chosen over alternatives.

### 2. Score Engine
Evaluates the current state of the user's strategy and market position, outputting a score from 0-20.
- **Inputs**: `ContextVersion`, `CompetitorInsights`, `OpportunityZone`.
- **Outputs** (Structured JSON):
  - `score`: Integer 0-20.
  - `dimension_breakdown`: Scores across dimensions (e.g., Clarity, Differentiation, Market Viability, Competitor Defense).
  - `overall_justification`: Why this score was given.
  - `biggest_strengths`: Array of strengths.
  - `biggest_weaknesses`: Array of weaknesses/risks.
  - `priority_improvements`: Actionable steps to increase the score.

### 3. Strategic Brief Generator
A comprehensive, narrative document that combines all the above into a premium, readable format.
- **Inputs**: `ContextVersion`, `CategoryCluster`, `OpportunityZone`, `PositioningStatement`, `ScoreCard`.
- **Outputs** (Structured JSON mapping to document sections):
  - `executive_summary`
  - `market_landscape`
  - `competitor_analysis`
  - `opportunity_mapping`
  - `positioning_strategy`
  - `strategic_recommendations`

## Database Schema Updates (Prisma)

- `PositioningStatement`: Stores the structured positioning output.
- `ScoreCard`: Stores the 0-20 score and breakdown.
- `StrategicBrief`: Stores the final synthesized brief.

All models will relate to `Project` and include a `generatedAt` timestamp to support versioning/regeneration without blind overwriting.

## Backend Modules
- **StrategyModule**:
  - `PositioningService`: Handles OpenAI prompt generation and schema validation for positioning.
  - `ScoringService`: Handles the 0-20 evaluation logic.
  - `BriefService`: Synthesizes all data into the final brief structure.
  - `StrategyController`: Exposes endpoints to trigger generation and fetch saved artifacts.

## Frontend Updates
- **Scorecard UI**: `/app/projects/[id]/strategy/scorecard`
  - Visual gauge/dial for the 0-20 score.
  - Radar chart or bar charts for dimension breakdown.
  - Cards for strengths, weaknesses, and improvements.
- **Strategic Brief UI**: `/app/projects/[id]/strategy/brief`
  - A clean, notion-like or premium PDF-style reading view for the final brief.
  - Export capabilities (stubbed for Phase 9).

## Testing Strategy
- Unit tests for each generation service to ensure prompt structure and schema validation work.
- Integration tests for the API endpoints.
- UI tests for rendering the complex structured data.
