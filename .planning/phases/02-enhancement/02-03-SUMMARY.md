---
phase: 02-enhancement
plan: 03
subsystem: api, database, pipeline
tags: sqlalchemy, sqlite, upsert, qsa, data-freshness, schema-migration
requires:
  - phase: 02-enhancement
    plan: 01
    provides: QsaMetadata model, Empresa model with capital_social, schema migration script
provides:
  - Incremental QSA import with upsert by CNPJ (importar_qsa_incremental)
  - Brazilian capital_social parsing (1.000.000,00 -> float)
  - QsaMetadata row created on each import (status, row_count, error_message)
  - Background freshness check (check_qsa_freshness) auto-triggering import when >7 days stale
  - GET /qsa/freshness endpoint with dados_antigos flag at 45-day threshold
  - Lifespan wiring: ensure_schema, check_qsa_freshness task, qsa router registration
affects: 02-enhancement (plan 04 — exposure flag computation)
tech-stack:
  added: []
  patterns:
    - Upsert by CNPJ using sqlalchemy.dialects.sqlite.insert().on_conflict_do_update()
    - QsaMetadata row created after each import for audit/freshness tracking
    - Freshness check as asyncio background task in FastAPI lifespan
key-files:
  created:
    - Backend/app/api/qsa.py
  modified:
    - Backend/app/ingest/import_qsa.py
    - Backend/app/scheduler/sync_scheduler.py
    - Backend/app/main.py
key-decisions:
  - "Incremental upsert uses sqlalchemy.dialects.sqlite.insert with on_conflict_do_update by CNPJ (D-04)"
  - "Socios processing uses existing processar_csv_socios() — no upsert needed per D-05"
  - "freshness check auto-triggers import if last_import >7 days stale or no metadata exists (D-06)"
  - "dados_antigos flag becomes True at >45 days per DQ-04/D-13"
  - "ensure_schema() called synchronously before background tasks start to guarantee schema readiness"
patterns-established: []
requirements-completed:
  - INF-02
  - DQ-01
  - DQ-04
  - API-04
duration: 12min
completed: 2026-06-12
---

# Phase 2 Plan 03: Data Pipeline — Incremental Import + Freshness Tracking + Startup Wiring Summary

**Incremental QSA import with CNPJ upsert, background freshness auto-check, GET /qsa/freshness endpoint, and schema/startup wiring in main.py**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-12T03:30:00Z
- **Completed:** 2026-06-12T03:42:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added `processar_csv_empresas_incremental()` with upsert by CNPJ using `sqlalchemy.dialects.sqlite.insert().on_conflict_do_update()`
- Added `importar_qsa_incremental()` function that downloads, extracts, upserts empresas, processes socios, and records QsaMetadata
- Brazilian capital_social parsing from format "1.000.000,00" → 1000000.0
- On success: QsaMetadata row with status="success", row_count, last_import_at
- On error: QsaMetadata row with status="failed", error_message, rollback
- Added `check_qsa_freshness()` async function in sync_scheduler: auto-triggers incremental import when >7 days stale or no metadata found
- Created `Backend/app/api/qsa.py` with `GET /qsa/freshness` endpoint returning freshness metadata and `dados_antigos` boolean (>45 days)
- Wired main.py: `ensure_schema()` before background tasks, `check_qsa_freshness` as create_task, `qsa.router` registration

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor import_qsa.py** — `ce84f7d` (feat)
2. **Task 2: Add check_qsa_freshness + qsa.py endpoint** — `5a1a89d` (feat)
3. **Task 3: Wire main.py lifespan** — `0918d9c` (feat)

## Files Created/Modified

- `Backend/app/ingest/import_qsa.py` — Added datetime and sqlite_upsert imports, processar_csv_empresas_incremental() with upsert by CNPJ (7 columns), importar_qsa_incremental() with QsaMetadata creation
- `Backend/app/scheduler/sync_scheduler.py` — Added check_qsa_freshness() async function with 7-day staleness check and auto-import trigger
- `Backend/app/api/qsa.py` — [NEW] GET /qsa/freshness endpoint with dados_antigos flag at 45-day threshold
- `Backend/app/main.py` — Added imports, ensure_schema() call, check_qsa_freshness task, qsa.router registration

## Decisions Made

- Upsert by CNPJ uses `sqlalchemy.dialects.sqlite.insert` with `on_conflict_do_update` (not raw SQL) — ORM-parameterized, injection-safe per T-02-05 mitigation
- Socios processing reuses existing `processar_csv_socios()` — socios are not upserted per D-05 (keep all existing entries)
- Freshness check auto-triggers on startup if metadata shows >7 days stale OR no metadata exists — mirrors the POST /atualizar-qsa endpoint per D-06
- `ensure_schema()` called synchronously before any `create_task` calls to guarantee schema is ready before background sessions open

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Pre-existing test suite conftest issue (table creation order for deputados) prevents full suite run. QSA-specific tests (test_qsa_flags.py) pass with 5/5.
- After git stash pop during verification, CRLF normalization temporarily lost main.py edits. Restored from plan specification and re-verified.

## Threat Surface Scan

No new threat surface introduced beyond the analyzed threat model:
- T-02-05 (Tampering — SQL injection via CSV): Mitigated — all CSV column values are ORM parameters in on_conflict_do_update
- T-02-06 (Tampering — concurrent upsert races): Mitigated — SQLite serializes writes, ON CONFLICT DO UPDATE is atomic per-statement
- T-02-07 (Denial of Service — large CSV memory): Mitigated — 10k-row chunksize preserved from Phase 1
- T-02-08 (Tampering — config threshold casting): Accepted — float() ValueError propagates as exception
- T-02-SC (Package installs): Mitigated — No new packages added

## Next Phase Readiness

- Incremental import pipeline with upsert ready for weekly QSA updates
- Freshness tracking provides metadata for data quality monitoring
- Startup wiring (ensure_schema + freshness check + qsa router) complete
- Ready for Plan 04: Alta Exposicao flag computation business logic

---

*Phase: 02-enhancement*
*Completed: 2026-06-12*
