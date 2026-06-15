# Roadmap: Fiscalização de Parlamentares (FdP) — QSA Integration

## Milestones

- ✅ **v1.0** — Phases 1-3 (shipped 2026-06-13)
- 🚧 **v1.1** — Phases 4-6 (Frontend QSA + Cleanup)

## Phases

- [x] **Phase 1: Foundation** — QSA data ingestion, matching, API — *shipped v1.0*
- [x] **Phase 2: Enhancement** — Matching refinement, incremental processing, freshness — *shipped v1.0*
- [x] **Phase 3: Intelligence** — Conflict detection, scoring, CNAE analysis — *shipped v1.0*
- [ ] **Phase 4: Cleanup & Foundation** — Fix blockers, tech debt cleanup, QSA service layer, VERIFICATION.md
- [x] **Phase 5: QSA Dashboard Core** — /fiscalizacao route, relationship cards, badges, filters, deputado profile section
- [ ] **Phase 6: Polish & Compliance** — Score viz, CNAE labels, mobile responsive, VALIDATION.md, Docker wiring

## Phase Details

### Phase 1: Foundation (v1.0 — shipped)

**Goal**: Establish foundational data pipeline for ingesting QSA data and matching deputies to companies via exact CPF and dual strategy matching.
**Depends on**: Nothing (first phase)
**Requirements**: ING-01, ING-02, ING-03, MAT-01, MAT-03, MAT-04, API-01, API-03, INF-01, INF-03, DQ-02, DQ-03
**Success Criteria** (what must be TRUE):

  1. User can trigger QSA data ingestion via API endpoint
  2. Ingestion processes Empresas.zip and Socios.zip with chunked CSV reading
  3. Deputy-company relationships are established via exact CPF matching
  4. CNPJ validation with checksum verification rejects invalid entries

**Plans**: 2/2 complete
**Completed**: 2026-06-11

### Phase 2: Enhancement (v1.0 — shipped)

**Goal**: Improve matching accuracy with spouse name fuzzy matching and enhance data quality with incremental processing and freshness tracking.
**Depends on**: Phase 1
**Requirements**: MAT-02, CONF-03, CONF-04, API-02, API-04, INF-02, INF-04, DQ-01, DQ-04
**Success Criteria** (what must be TRUE):

  1. Fuzzy name matching (rapidfuzz, threshold 75) catches spouse-linked companies
  2. Incremental upsert processes only new/changed records without duplicates
  3. Freshness tracking records last sync timestamp
  4. GET /qsa/freshness endpoint returns staleness data

**Plans**: 4/4 complete
**Completed**: 2026-06-12

### Phase 3: Intelligence (v1.0 — shipped)

**Goal**: Detect potential conflicts of interest through graduated conflict scoring and exposure flags.
**Depends on**: Phase 2
**Requirements**: CONF-01, CONF-02
**Success Criteria** (what must be TRUE):

  1. Each relationship receives a 3-factor graduated score (capital 50 + CNAE 30 + CPF 20)
  2. conflito_interesse flag set based on CNAE class match
  3. alta_exposicao flag set for relationships > 1M capital
  4. via_conjuge flag set for name-match relationships
  5. API returns score breakdown, conflict flags, and paginated results

**Plans**: 4/4 complete
**Completed**: 2026-06-13

---

### Phase 4: Cleanup & Foundation

**Goal**: Fix blocking bugs, eliminate tech debt, and establish QSA frontend data pipeline
**Depends on**: Phase 3 (v1.0)
**Requirements**: CLEANUP-01, CLEANUP-02, CLEANUP-03, CLEANUP-04, CLEANUP-05, CLEANUP-06
**Success Criteria** (what must be TRUE):

  1. QSA data ingestion completes without TypeError — `processar_csv_socios()` returns total, QsaMetadata rows created
  2. Frontend connects to backend on port 3001 — no fallback errors from hardcoded port 8000
  3. Backend runs without deprecation warnings — zero `datetime.utcnow()` calls remain
  4. QSA service layer exists in frontend — hooks use `qsaService` with axios, not raw `fetch()`
  5. VERIFICATION.md exists for all 3 v1.0 phases — Nyquist compliance artifact present

**Plans**: 3/3 complete
**Completed**: 2026-06-14
Plans:

- [x] 04-01-PLAN.md — Backend bugfix & dead code cleanup (datetime.utcnow, regression test, dead code removal)
- [x] 04-02-PLAN.md — Frontend port fix & QSA service layer (qsaService, axios migration)
- [x] 04-03-PLAN.md — VERIFICATION.md creation for phases 1-3 (Nyquist compliance)

### Phase 5: QSA Dashboard Core

**Goal**: Users can visualize, inspect, and filter deputy-company relationships with full context
**Depends on**: Phase 4
**Requirements**: QSA-01, QSA-02, QSA-03, QSA-04, QSA-05, QSA-06, QSA-07, QSA-08, QSA-09, QSA-10, QSA-11
**Success Criteria** (what must be TRUE):

  1. User can navigate to `/fiscalizacao` and see a paginated list of deputy-company relationships
  2. User sees colored conflict-of-interest badges (red/green) with tooltips explaining scores
  3. User sees a freshness banner at page top showing data staleness (green/amber/red)
  4. User can filter relationships by conflict status, exposure, and spouse match; sort by score/capital/name
  5. User sees aggregate stats cards (total, conflito, exposicao, conjuge) at page top
  6. User can view QSA relationships inline on any deputy's profile page
   7. User sees appropriate empty states ("Nenhuma relação encontrada") and error states with retry button

**Plans**: 4 plans (2 waves)
**UI hint**: yes
Plans:

- [x] 05-01-PLAN.md — Backend API enhancements (sort, spouse filter, aggregate counts) + types update
- [x] 05-02-PLAN.md — Core display components (badges, indicators, states, tooltip, barrel)
- [x] 05-03-PLAN.md — Main /fiscalizacao dashboard page (cards, summary, filter, pagination)
- [x] 05-04-PLAN.md — QSA inline section on deputy profile + nav link

**Completed**: 2026-06-15

### Phase 6: Polish & Compliance

**Goal**: Polish edge cases, add compliance documentation, ensure mobile readiness and score transparency
**Depends on**: Phase 5
**Requirements**: QSA-12, QSA-13, QSA-14, DOCS-01, DOCS-02, DOCS-03, DOCS-04
**Success Criteria** (what must be TRUE):

  1. User sees CSS-only 50/30/20 score breakdown bar with legend on each relationship card
  2. User sees human-readable CNAE category labels instead of raw codes
  3. QSA pages render correctly on mobile viewports (<768px) with responsive layout
  4. User sees score interpretation disclaimer on all score displays
  5. User can navigate to `/fiscalizacao` from the app's main navigation
  6. VALIDATION.md exists for all 3 v1.0 phases — Nyquist compliance artifact present
  7. Docker compose correctly wires backend service

**Plans**: 3 plans (2 waves)
**UI hint**: yes
Plans:
**Wave 1**

- [ ] 06-01-PLAN.md — Score viz + CNAE labels: CSS 50/30/20 bar, legend, CnaeLabel with conflict-class coloring (QSA-12, QSA-13)
- [ ] 06-03-PLAN.md — Compliance + Docker: VALIDATION.md x3, healthchecks, build test, DOCS-02 verify (DOCS-01, DOCS-04, DOCS-02)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 06-02-PLAN.md — Disclaimer + Mobile responsive: page-level banner, per-card info icon, responsive audit at sm/md (DOCS-03, QSA-14)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|---------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | ✅ Complete | 2026-06-11 |
| 2. Enhancement | v1.0 | 4/4 | ✅ Complete | 2026-06-12 |
| 3. Intelligence | v1.0 | 4/4 | ✅ Complete | 2026-06-13 |
| 4. Cleanup & Foundation | v1.1 | 3/3 | ✅ Complete | 2026-06-14 |
| 5. QSA Dashboard Core | v1.1 | 4/4 | ✅ Complete | 2026-06-15 |
| 6. Polish & Compliance | v1.1 | 0/0 | Not started | - |
