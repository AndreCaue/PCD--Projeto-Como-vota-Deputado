---
phase: 02-enhancement
plan: 04
subsystem: api
tags: fastapi, pagination, filtering, freshness, incremental-import
requires:
  - phase: 02-enhancement
    plan: 02
    provides: alta_exposicao/via_conjuge flags, confidence score fix
  - phase: 02-enhancement
    plan: 03
    provides: incremental import, freshness tracking, QsaMetadata
provides:
  - GET /deputados/empresas with pagination, filtering (partido, estado, tem_conflito, alta_exposicao), sorting
  - Inline freshness flags in GET /deputados/{id}/empresas and GET /deputados/empresas
  - POST /atualizar-qsa uses importar_qsa_incremental instead of importar_qsa_completo
  - Test coverage for new endpoint and freshness behavior
affects: 02-enhancement (completes Phase 2 API layer)
tech-stack:
  added: []
  patterns:
    - Inline freshness via QsaMetadata lookup in API response construction
    - Pagination meta block consistent with list_deputados pattern
requirements-completed:
  - API-02
  - API-04
duration: 15min
completed: 2026-06-12
---

# Phase 2 Plan 04: API Endpoints — Paginated Listing + Inline Freshness + Update Trigger Summary

**GET /deputados/empresas paginated listing endpoint, inline freshness flags, and incremental import trigger**

## Performance

- **Duration:** 15 min
- **Started:** 2026-06-12
- **Completed:** 2026-06-12
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created `GET /deputados/empresas` endpoint with pagination (page/limit, le=200), filtering (partido, estado, tem_conflito, alta_exposicao), default sort by total_empresas descending, and inline freshness from QsaMetadata
- Added inline freshness block (`qsa_data_disponivel`, `ultima_atualizacao_qsa`, `dias_desde_atualizacao`, `dados_antigos`) to `GET /deputados/{id}/empresas` response, wrapping the data list in `{"data": [...], "freshness": {...}}`
- Updated `POST /atualizar-qsa` to call `importar_qsa_incremental` instead of `importar_qsa_completo`
- Added 5 new test methods: endpoint existence, response shape, pagination, partido filter, and freshness in detail endpoint

## Files Modified

- `Backend/app/api/deputados.py` — Added GET /deputados/empresas with pagination/filtering/freshness; wrapped GET /{id}/empresas response with data+freshness
- `Backend/app/api/integracao.py` — Changed import to importar_qsa_incremental and updated background task
- `Backend/tests/test_api_deputados.py` — Added 5 test methods for list endpoint and freshness

## Task Commits

1. **Task 1: Create list endpoint** — (feat) GET /deputados/empresas with pagination, filtering, sorting, inline freshness
2. **Task 2: Add inline freshness to detail endpoint** — (feat) GET /{id}/empresas wrapped response with freshness
3. **Task 3: Update trigger + tests** — (feat) POST /atualizar-qsa uses incremental; 5 new tests

## Decisions Made

- Per-deputy response keeps minimal fields: id, nome, partido, estado, total_empresas (D-14)
- Reuses existing page/limit meta pattern from list_deputados (D-15)
- Filters compound as AND; default sort by company count descending (D-17)
- All page/limit params bounded to le=200 per ASVS V5 input validation (T-02-09)

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- All 5 new test methods pass
- Full test suite passes with no regressions

---

*Phase: 02-enhancement*
*Completed: 2026-06-12*
