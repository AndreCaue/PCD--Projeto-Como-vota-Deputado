# Phase 6: Polish & Compliance - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Final polish and compliance: score breakdown visualization, CNAE human-readable labels, mobile responsive audit across QSA pages, score interpretation disclaimers, VALIDATION.md for v1.0 phases, and Docker wiring verification with healthchecks.
</domain>

<decisions>
## Implementation Decisions

### Score Breakdown Bar (QSA-12)
- **D-01:** Inline placement inside expanded relationship detail row in QsaRelationshipCard — below capital value and existing badges
- **D-02:** Legend labels: "Capital (50pts) / CNAE (30pts) / CPF (20pts)" matching the scoring formula
- **D-03:** Segment colors: Capital=green, CNAE=amber, CPF=blue (distinct, colorblind-friendly palette)
- **D-04:** CSS-only segmented bar (no canvas, no JS animation) with percentage widths from the 50/30/20 score breakdown
- **D-05:** Zero-score relationships: show compact placeholder text "Sem fatores de conflito" instead of the bar

### CNAE Category Labels (QSA-13)
- **D-06:** Show both description and raw code — `cnae_descricao` as primary label, raw `cnae_principal` code in muted smaller text
- **D-07:** Conflict-class CNAEs (41204, 70204, 73190, 86101) get amber/red color treatment on the label
- **D-08:** No separate risk-category grouping beyond the existing conflict class check — conflict badge already handles that

### Mobile Responsive (QSA-14)
- **D-09:** Full responsive audit — check all QSA pages (fiscalizacao list, deputy profile inline section, filter bar, pagination, cards, score bar) at Tailwind sm(640) / md(768) breakpoints
- **D-10:** No custom breakpoints needed — existing sm/md/lg Tailwind breakpoints suffice

### Score Disclaimer (DOCS-03)
- **D-11:** Two-tier: page-level banner on /fiscalizacao + per-card info icon on each score display
- **D-12:** Disclaimer text — "Os scores são indicadores algorítmicos baseados em dados públicos da Receita Federal e não constituem determinação legal de conflito de interesses."

### VALIDATION.md (DOCS-01)
- **D-13:** One file per phase (01-VALIDATION.md, 02-VALIDATION.md, 03-VALIDATION.md) — matching VERIFICATION.md structure
- **D-14:** Requirements traceability matrix format — map each requirement to its test(s) with validation evidence

### Docker Wiring (DOCS-04)
- **D-15:** Add healthcheck configuration to both backend and frontend services in docker-compose.yml
- **D-16:** Run end-to-end build test (`docker-compose up --build`) to verify connectivity
- **D-17:** Verify QSA data persistence across restarts via volume mapping
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Roadmap
- `.planning/ROADMAP.md` §Phase 6 — Goal, success criteria, and dependency context
- `.planning/REQUIREMENTS.md` — QSA-12, QSA-13, QSA-14, DOCS-01, DOCS-03, DOCS-04 full definitions

### Prior Phase Decisions
- `.planning/phases/05-qsa-dashboard-core/05-CONTEXT.md` — Score shown as simple number (deferred bar to Phase 6), card expandable pattern, layout decisions
- `.planning/phases/04-cleanup-foundation/04-CONTEXT.md` — QSA service layer, VERIFICATION.md structure

### Existing Code
- `Frontend/components/fiscalizacao/QsaRelationshipCard.tsx` — Target component for score breakdown bar and CNAE labels; expanded detail section at lines 109-141
- `Frontend/components/fiscalizacao/ConflictBadge.tsx` — Score display component that needs disclaimer info icon
- `Frontend/components/fiscalizacao/ExposureIndicator.tsx` — Reference component for inline score display
- `Frontend/components/fiscalizacao/RiscoScore.tsx` — Canvas-based animated gauge (NOT to be reused — CSS-only bar preferred)
- `Frontend/app/fiscalizacao/FiscalizacaoDashboard.tsx` — Target for page-level disclaimer banner
- `Frontend/app/fiscalizacao/page.tsx` — Main fiscalizacao route
- `Frontend/app/deputados/[id]/page.tsx` — Deputy profile with QsaInlineSection
- `Frontend/components/fiscalizacao/QsaInlineSection.tsx` — Inline section display (needs score bar + disclaimer)
- `docker-compose.yml` — Target for healthcheck additions
- `Backend/Dockerfile` — Existing Dockerfile for backend
- `Frontend/Dockerfile` — Existing Dockerfile for frontend
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `QsaRelationshipCard.tsx` — Expandable card pattern with inline detail section ready to receive score bar and CNAE labels
- `ConflictBadge.tsx` — Existing badge component that can be extended with info icon for disclaimer
- `ExposureIndicator.tsx` — Pattern for inline color-coded indicators
- `Tailwind color classes` — Green(emerald), amber, blue palette already used across the app (ConflictBadge green/red, QsaFilterBar amber)

### Established Patterns
- **Dark-only theme:** `bg-gray-900 border border-gray-800 rounded-2xl p-6` card style
- **Inline expandable content:** Click-to-expand with ChevronDown/ChevronUp pattern
- **Data flow:** Service object in api.ts → component with `{data, loading, error}` pattern
- **Docker:** docker-compose.yml at project root with backend:3001, frontend:3000

### Integration Points
- `QsaRelationshipCard.tsx` expanded section — insert score breakdown bar and CNAE label display
- `FiscalizacaoDashboard.tsx` — Add page-level disclaimer banner below QsaFreshnessBanner
- `ConflictBadge.tsx` — Add tooltip/info icon for per-card score disclaimer
- `docker-compose.yml` — Add healthcheck sections to both services
- CNAE display uses `empresa.cnae_descricao` which already exists in `RelacaoDetalhada` type and API response

### Note on DOCS-02
The `/fiscalizacao` nav link is already present in `NavbarWithSearch.tsx:82-86` — this requirement is already fulfilled by Phase 5.
</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for implementation details.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 6-Polish & Compliance*
*Context gathered: 2026-06-15*
