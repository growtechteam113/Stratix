# STRATIX AI - Project TODO

## Phase 1: Foundation
- [x] Database schema (projects, competitors, territories, briefs, analysisJobs)
- [x] Design system (light/white theme, glowing effects, CSS variables)
- [x] Global layout and navigation

## Phase 2: Landing Page
- [x] Hero section with glowing text and animations
- [x] How it works (3-step Define → Discover → Brief)
- [x] Feature showcase sections
- [x] CTA and footer

## Phase 3: Auth & Dashboard
- [x] Auth flow (login/logout via Manus OAuth)
- [x] Dashboard with project listing
- [x] Create project dialog

## Phase 4: Define Step
- [x] Create project form (name, URL, region, description)
- [x] Project detail page with Define section
- [x] Context summary display

## Phase 5: Discover Step
- [x] AI competitor discovery backend
- [x] Competitive Threat Map UI with scored cards (X/20 CRITICAL)
- [x] Competitor detail profiles (funding, employees, HQ, strengths)
- [x] Threat level categorization (Critical, High, Moderate, Low)
- [x] Manual competitor addition

## Phase 6: Brief Step
- [x] Positioning territories (Owned, Unoccupied, Contested, Indefensible)
- [x] Strategic brief generation
- [x] Tabbed territory interface
- [x] Score card with competitive position score

## Phase 7: AI Backend
- [x] LLM integration for competitor analysis
- [x] Context extraction prompts
- [x] Competitor discovery prompts
- [x] Territory analysis prompts
- [x] Strategic brief generation prompts
- [x] Background job pipeline (context → competitors → territories → brief)

## Phase 8: Exports & Reports
- [x] Public report sharing with unique URLs
- [x] Toggle public/private
- [x] Public report page

## Phase 9: Testing
- [x] Auth logout test
- [x] Project CRUD tests (create, list, get, update, delete)
- [x] Competitor tests (add, remove)
- [x] Analysis tests (discover, full, jobs)
- [x] Brief tests (get, public)
- [x] Auth tests (me authenticated, me unauthenticated)
- [x] All 15 tests passing

## Phase 10: Polish & Delivery
- [x] Framer Motion animations throughout
- [x] Responsive design
- [x] Premium theme with glowing effects
- [x] Checkpoint and delivery

## Bug Fixes
- [x] Fix brief.get returning undefined instead of null (React Query error)

## Redesign - THEO Growth Inspired Report
- [x] Redesign ProjectDetail with numbered sections (01, 02, 03...)
- [x] Competitor threat map with grouped threat levels and score cards grid
- [x] Convergence zones / overlap areas section (shown in competitor card details)
- [x] Tabbed territory interface (Owned/Unoccupied/Contested/Indefensible)
- [x] North Star positioning card with glow effect
- [x] Strategic brief with executive summary, recommendations, risks
- [x] Score bars and visual threat indicators
- [x] Clean section headers with monospace numbering
- [x] Premium card hover effects and animations
- [x] Make report understandable by anyone globally

## Bug Fixes - Analysis Flow
- [x] Fix "Run Full Analysis" stopping/failing without producing results (truncate long fields before insertion)
