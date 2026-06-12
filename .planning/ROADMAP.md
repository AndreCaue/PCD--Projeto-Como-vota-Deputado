# Roadmap: Fiscalização de Parlamentares (FdP) - QSA Integration

## Phases

- [x] **Phase 1: Foundation** - Data Ingestion and Matching
- [x] **Phase 2: Enhancement** - Matching Refinement and Data Quality
- [ ] **Phase 3: Intelligence** - Conflict Detection and UX

## Phase Details

### Phase 1: Foundation

**Goal**: Establish foundational data pipeline for ingesting QSA data and matching deputies to companies via exact CPF and dual strategy matching.
**Depends on**: Nothing (first phase)
**Requirements**: ING-01, ING-02, ING-03, MAT-01, MAT-03, MAT-04, API-01, API-03, INF-01, INF-03, DQ-02, DQ-03
**Success Criteria** (what must be TRUE):

  1. User can trigger QSA data ingestion via POST /atualizar-qsa and observe successful processing of Empresas.zip and Socios.zip
  2. System correctly matches deputies to companies using exact CPF comparison (deputado CPF → socio CPF/CNPJ) and returns matches via GET /deputados/{deputado_id}/empresas
  3. System applies dual strategy matching (exact CPF + fuzzy name matching for spouses) and stores match type in database
  4. System validates CNPJ format and checksum during ingestion, logging validation failures

**Plans**: 01 (Test Suite), 02 (Data Ingestion & Matching) — COMPLETE

### Phase 2: Enhancement

**Goal**: Improve matching accuracy with spouse name fuzzy matching and enhance data quality with incremental processing and freshness tracking.
**Depends on**: Phase 1
**Requirements**: MAT-02, CONF-03, CONF-04, API-02, API-04, INF-02, INF-04, DQ-01, DQ-04
**Success Criteria** (what must be TRUE):

   1. User can view company matches found via spouse name (fuzzy matching) with confidence scores in API responses
   2. System provides data freshness indicators in API responses showing QSA data last update timestamp
   3. System supports incremental weekly QSA updates without full reprocessing
   4. System maintains appropriate database indices for efficient querying of large deputy-company datasets

**Plans**: 4 plans

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Foundation: Data Model + Schema Migration + Test Infrastructure

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — Service Layer: Confidence Score Bug Fix + Flag Computation
- [x] 02-03-PLAN.md — Data Pipeline: Incremental Import + Freshness Tracking + Startup Wiring

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-04-PLAN.md — API Endpoints: Paginated Listing + Inline Freshness + Update Trigger

### Phase 3: Intelligence

**Goal**: Detect potential conflicts of interest and provide meaningful insights through graduated conflict scoring and exposure flags.
**Depends on**: Phase 2
**Requirements**: CONF-01, CONF-02
**Success Criteria** (what must be TRUE):

  1. System flags companies with CNAE codes in consultoria, construção, publicidade, saúde sectors as potential conflicts in API responses
  2. System calculates and returns graduated conflict confidence levels based on CNAE, capital socio, and relationship type
  3. System identifies high exposure relationships where capital_social > 1,000,000 and marks them in API responses
  4. System tracks and returns whether deputy-company relationship was found via spouse name matching (via_conjuge flag)

**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | ✅ Complete | 2026-06-11 |
| 2. Enhancement | 4/4 | ✅ Complete | 2026-06-12 |
| 3. Intelligence | 0/4 | Not started | - |
