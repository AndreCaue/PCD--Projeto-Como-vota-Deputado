# Phase 7: Address Tech Debt — Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Close accumulated tech debt across all v1.1 phases: add `requirements-completed` + `verification` YAML frontmatter to Phase 5 SUMMARY files, create VERIFICATION.md for phases 4-6 (same format as v1.0), update REQUIREMENTS.md traceability checkboxes from `[ ]` to `[x]`, and fix STATE.md progress display (completed_phases: 3→6, percent: 50→100). Does NOT include Phase 4 VALIDATION.md, GrafoCanvas TS error, PaginationMeta refactor, or Docker testing.
</domain>

<decisions>
## Implementation Decisions

### Summary Frontmatter Schema (Phase 5)
- **D-01:** Add `requirements-completed` as a list of requirement IDs (e.g., `requirements-completed: [QSA-01, QSA-02, ...]`) to Phase 5 SUMMARY files — enables auto-verification of requirement coverage
- **D-02:** Add `verification` field pointing to the corresponding VERIFICATION.md file (e.g., `verification: 05-VERIFICATION.md`) for bidirectional traceability
- **D-03:** Apply to Phase 5 only (4 SUMMARY files: 05-01, 05-02, 05-03, 05-04) — Phase 4 and 6 already have `requirements-completed`
- **D-04:** Keep all existing frontmatter fields intact (plan, phase, status, commits, tasks) — additions only, no removals

### VERIFICATION.md Creation
- **D-05:** Create VERIFICATION.md for phases 4, 5, 6 — one file per phase (04-VERIFICATION.md, 05-VERIFICATION.md, 06-VERIFICATION.md)
- **D-06:** Use the same format as existing v1.0 VERIFICATION.md files: frontmatter → requirements summary → per-requirement detail (status, evidence, test verification, UAT verification) → test evidence → UAT evidence → requirement-by-requirement mapping table → known gaps
- **D-07:** Known gaps section documents all outstanding issues (e.g., Phase 4 missing VALIDATION.md, Phase 5 VALIDATION.md draft, Phase 6 Docker not tested) even if outside Phase 7's scope — honest disclosure for future planners

### Additional Tech Debt (in scope)
- **D-08:** Update REQUIREMENTS.md — change all 24 v1.1 traceability checkboxes from `[ ]` to `[x]`
- **D-09:** Fix STATE.md progress — set `completed_phases: 6` and `percent: 100`

### the agent's Discretion
- SUMMARY frontmatter field order (recommended: append `requirements-completed` and `verification` after existing `tasks` field)
- VERIFICATION.md phase-specific details (which tests to cite, how to format evidence URLs)

### Out of Scope for Phase 7
- Phase 4 VALIDATION.md (Nyquist gap — needs separate work)
- 05-VALIDATION.md draft → finalized (needs content verification)
- GrafoCanvas.tsx:635 TypeScript error (pre-existing code issue, blocks npm run build)
- PaginationMeta export from api.ts (minor code refactor)
- Docker end-to-end build test (Docker Desktop unavailable)
- Phase 1-3 SUMMARY.md generation (VERIFICATION.md already covers those phases)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Roadmap
- `.planning/ROADMAP.md` §Phase 7 — Goal, status, and dependency context
- `.planning/REQUIREMENTS.md` — v1.1 requirements traceability (needs checkbox update)
- `.planning/STATE.md` — Progress metadata (needs progress fix)

### Audit Findings (tech debt source)
- `.planning/v1.1-MILESTONE-AUDIT.md` — Comprehensive audit of all gaps, including SUMMARY frontmatter (lines 235, 272, 351, 447) and missing VERIFICATION.md (lines 258, 335-342)
- `.planning/v1.0-MILESTONE-AUDIT.md` — Prior summary frontmatter findings (lines 105, 180, 285, 295, 337)

### Existing VERIFICATION.md (format reference)
- `.planning/phases/01-foundation/01-VERIFICATION.md` — Reference format: frontmatter → req summary → per-req detail → test/UAT evidence → mapping table → known gaps
- `.planning/phases/02-enhancement/02-VERIFICATION.md` — Same format, Phase 2 requirements
- `.planning/phases/03-intelligence/03-VERIFICATION.md` — Same format, Phase 3 requirements

### SUMMARY Files Needing Update
- `.planning/phases/05-qsa-dashboard-core/05-01-SUMMARY.md` — Add requirements-completed + verification frontmatter
- `.planning/phases/05-qsa-dashboard-core/05-02-SUMMARY.md` — Add requirements-completed + verification frontmatter
- `.planning/phases/05-qsa-dashboard-core/05-03-SUMMARY.md` — Add requirements-completed + verification frontmatter
- `.planning/phases/05-qsa-dashboard-core/05-04-SUMMARY.md` — Add requirements-completed + verification frontmatter

### Reference SUMMARY (already has frontmatter)
- `.planning/phases/04-cleanup-foundation/04-03-SUMMARY.md` — Reference for existing frontmatter structure and `requirements-completed` format

### Phase Contexts (decision traceability)
- `.planning/phases/06-polish-compliance/06-CONTEXT.md` — Prior phase decisions, D-13/D-14 for VALIDATION.md format
- `.planning/phases/05-qsa-dashboard-core/05-CONTEXT.md` — Phase 5 decisions, deferred score bar to Phase 6
- `.planning/phases/04-cleanup-foundation/04-CONTEXT.md` — Phase 4 decisions, VERIFICATION.md created for v1.0

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `01-VERIFICATION.md`, `02-VERIFICATION.md`, `03-VERIFICATION.md` — Established VERIFICATION.md format with frontmatter → req summary → per-req detail → test/UAT evidence → mapping table → known gaps
- `04-03-SUMMARY.md` — Reference for frontmatter pattern already including requirements-completed
- All Phase 5 SUMMARY files (05-01 through 05-04) — Target for frontmatter additions

### Established Patterns
- **VERIFICATION.md format:** YAML frontmatter (phase, phase_name, milestone, verification_date, status) + markdown body with requirements summary table, per-requirement detail sections, test evidence, UAT evidence, requirement mapping table, known gaps
- **SUMMARY.md frontmatter:** YAML with plan, phase, status, commits, tasks fields — now adding requirements-completed and verification

### Integration Points
- `.planning/phases/05-qsa-dashboard-core/05-01-SUMMARY.md` — Add `requirements-completed` and `verification` to frontmatter
- `.planning/phases/05-qsa-dashboard-core/05-02-SUMMARY.md` — Same
- `.planning/phases/05-qsa-dashboard-core/05-03-SUMMARY.md` — Same
- `.planning/phases/05-qsa-dashboard-core/05-04-SUMMARY.md` — Same
- `.planning/phases/04-cleanup-foundation/` — Create 04-VERIFICATION.md
- `.planning/phases/05-qsa-dashboard-core/` — Create 05-VERIFICATION.md
- `.planning/phases/06-polish-compliance/` — Create 06-VERIFICATION.md
- `.planning/REQUIREMENTS.md` — Update traceability checkboxes
- `.planning/STATE.md` — Fix progress metrics

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for frontmatter field ordering, VERIFICATION.md evidence citations, and STATE.md format.
</specifics>

<deferred>
## Deferred Ideas

### Out of Scope (noted for future work)
- **Phase 4 VALIDATION.md** — Nyquist gap. Phase 4 has no VALIDATION.md; needs to be created. Not addressed in Phase 7.
- **05-VALIDATION.md draft** — Currently draft status; needs content verification and finalization. Not addressed in Phase 7.
- **GrafoCanvas.tsx:635 TypeScript error** — Pre-existing code issue that blocks `npm run build`. Not related to documentation.
- **PaginationMeta type export** — Defined locally in FiscalizacaoDashboard.tsx; should be exported from api.ts. Minor refactor, not essential.
- **Docker end-to-end build test** — `docker-compose.yml` verified syntactically but not actually run. Requires Docker Desktop.
- **Phase 1-3 SUMMARY.md generation** — VERIFICATION.md already covers these phases; retroactive SUMMARYs not worth the overhead.
</deferred>

---

*Phase: 7-Address Tech Debt*
*Context gathered: 2026-06-15*
