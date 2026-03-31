# STRATIX AI - Phase 4 Design Document

## Goal
Build the reusable structured business context layer. This context engine will extract, structure, and version the core business intelligence from the ingested sources, serving as the foundational truth for all downstream AI analysis.

## Context Schema
The context will be strictly structured as a JSON object. We will define a Zod schema to enforce this structure and generate TypeScript types.

The required schema fields are:
- `company_overview`: General description of the company.
- `product_summary`: Summary of the main products/services.
- `ideal_customer_profile`: Description of the target audience (ICP).
- `pain_points`: Key problems the product solves.
- `jobs_to_be_done`: The core "jobs" customers hire the product for.
- `value_propositions`: Primary value props.
- `messaging_pillars`: Key themes in their messaging.
- `tone_of_voice`: Brand voice description.
- `features`: List of key features.
- `use_cases`: Common use cases.
- `proof_points`: Case studies, metrics, or social proof.
- `market_category`: The category they operate in.
- `competitors`: Known competitors.
- `positioning_signals`: How they position themselves in the market.
- `confidence_notes`: AI's confidence in the extracted data and missing gaps.

## Database Schema (Prisma)
We will introduce a versioned context model to ensure we do not blindly regenerate data and can track changes over time.

- `ContextFile`: The root entity linking a project to its context.
- `ContextVersion`: A specific version of the context (e.g., v1, v2). Contains the full structured JSON.
- `ContextAtom`: (Optional/Future-proofing) Granular pieces of context linked to specific source chunks for traceability. For this phase, we will focus on storing the full JSON in `ContextVersion`.

## Backend Architecture

1. **ContextModule**:
   - `ContextController`: Endpoints for retrieving, triggering generation, and updating context.
   - `ContextService`: Manages CRUD operations, versioning, and persistence.
   - `ContextGenerationService`: Interacts with OpenAI to generate the structured context from the ingested source chunks.

2. **Generation Pipeline**:
   - **Retrieve Sources**: Fetch the top relevant chunks from the `EmbeddingsService` or aggregate all text if the project is small enough.
   - **Prompt Engineering**: Use OpenAI's JSON mode or function calling to strictly enforce the context schema.
   - **Validation**: Validate the OpenAI response against the Zod schema.
   - **Persistence**: Save as a new `ContextVersion`. If a version already exists, prompt the user before regenerating, or generate a draft version.

## Frontend Architecture

1. **Context Viewer UI**:
   - A new tab/page under the Project view: `/app/projects/[id]/context`.
   - Displays the structured context in a readable, card-based layout.
   - Allows users to switch between versions.
   - Provides a "Generate Context" button (disabled or warning if context already exists).
   - Allows manual editing of the context fields (creating a new manual version).

## Testing Strategy
- **Schema Validation**: Unit tests for the Zod schema.
- **Context Generation**: Mock OpenAI responses and test the pipeline.
- **Versioning**: Test that creating/updating context properly increments versions.
- **Retrieval**: Test API endpoints for fetching the latest context.

## Rules & Constraints
- **Structured JSON First**: All context must conform to the defined schema.
- **Reusability**: The context must be easily accessible by future modules (Competitor Engine, Positioning Engine).
- **No Blind Regeneration**: If a `ContextFile` already has a `ContextVersion`, do not overwrite it automatically. Require explicit user action or create a new version.
