---
phase: 02-enhancement
plan: 01
subsystem: api, database
tags: sqlalchemy, sqlite, models, schema-migration, pytest
requires: []
provides:
  - Relacao model with alta_exposicao and via_conjuge boolean columns
  - Empresa model with capital_social Float column
  - QsaMetadata model (last_import_at, status, row_count, error_message)
  - Config model (key/value pair table)
  - Idempotent schema migration script (ensure_schema)
  - Test fixtures for QSA flag tests
  - test_qsa_flags.py with 5 model-column verification tests
affects: 02-enhancement (plans 02-05)
tech-stack:
  added: []
  patterns:
    - Idempotent DDL migration using inspect(engine).get_columns() for column existence checks
    - QsaMetadata follows SyncLog pattern from votacao.py
    - Config model as generic key/value configuration table
key-files:
  created:
    - Backend/app/models/qsa_metadata.py
    - Backend/app/models/config.py
    - Backend/app/ingest/migrate_schema.py
    - Backend/tests/test_qsa_flags.py
  modified:
    - Backend/app/models/empresa.py
    - Backend/app/models/__init__.py
    - Backend/conftest.py
key-decisions:
  - "QsaMetadata follows SyncLog pattern (id, last_import_at, status, row_count, error_message, criado_em)"
  - "Schema migration uses inspector.get_columns() PRAGMA guard for idempotent ALTER TABLE operations"
  - "Config model is simple key/value table with unique constraint on key"
  - "Test sample_empresa_with_capital uses CNPJ 99887766000199 (different from sample_empresa's 11222333000181) to allow coexistence"
patterns-established: []
requirements-completed:
  - CONF-03
  - CONF-04
  - INF-04
  - DQ-01
duration: 13min
completed: 2026-06-12
---

# Phase 2 Plan 01: Foundation — Data Model + Schema Migration + Test Infrastructure Summary

**Data model extensions, idempotent schema migration, and test infrastructure for QSA exposure flag computation**

## Performance

- **Duration:** 13 min
- **Started:** 2026-06-12T00:30:19Z
- **Completed:** 2026-06-12T00:43:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Extended Relacao model with `alta_exposicao` (Boolean, indexed) and `via_conjuge` (Boolean) columns
- Extended Empresa model with `capital_social` (Float, nullable) column
- Created QsaMetadata model with last_import_at, status, row_count, error_message columns
- Created Config model as generic key/value configuration table
- Created idempotent schema migration script (ensure_schema) with PRAGMA-based column guards and index creation
- Created test fixtures: sample_empresa_with_capital, sample_qsa_metadata, sample_config
- Created test_qsa_flags.py with 5 model-column verification tests
- Full test suite (55 tests) passes with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend models** — `df5cc59` (feat)
2. **Task 2: Create schema migration** — `f7a69df` (feat)
3. **Task 3: Add test fixtures and test file** — `494183a` (feat)

## Files Created/Modified

- `Backend/app/models/empresa.py` — Added Float import, capital_social to Empresa, alta_exposicao and via_conjuge to Relacao
- `Backend/app/models/qsa_metadata.py` — [NEW] QsaMetadata model with QSA import metadata columns
- `Backend/app/models/config.py` — [NEW] Config model with key/value configuration pairs
- `Backend/app/models/__init__.py` — Added exports for Empresa, Socio, Relacao, QsaMetadata, Config
- `Backend/app/ingest/migrate_schema.py` — [NEW] Idempotent schema migration with ensure_schema()
- `Backend/conftest.py` — Added datetime import, QsaMetadata/Config imports, 3 new fixtures
- `Backend/tests/test_qsa_flags.py` — [NEW] 5 tests for model column verification

## Decisions Made

- QsaMetadata follows the SyncLog pattern from votacao.py (id, last_import_at, status, row_count, error_message, criado_em) for consistency
- Schema migration uses `inspect(engine).get_columns()` as PRAGMA guard for idempotent ALTER TABLE operations — prevents errors on re-run
- Config model is a simple key/value table with unique constraint on `key` for runtime-configurable thresholds
- Test `sample_empresa_with_capital` uses CNPJ `99887766000199` (different from `sample_empresa`'s `11222333000181`) to allow both fixtures to coexist in the same test session

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Stale `test.db` from previous test runs caused duplicate table errors when running the full test suite. This is a pre-existing conftest issue (shared file-based test database, no unique temp db). Removing the stale file resolves it. Out of scope for this plan.

## Threat Surface Scan

No new threat surface was introduced beyond the analyzed threat model:
- T-02-01 (Tampering — raw SQL): Mitigated with PRAGMA-based column existence guards
- T-02-02 (Information Disclosure — financial data): Accepted (capital social is public Receita Federal data)
- T-02-SC (Tampering — package installs): Mitigated (no new packages added)

## Known Stubs

- `test_qsa_flags.py` contains placeholder/verification tests for model columns. These verify that the extended models have the expected columns. Real flag computation logic (alta_exposicao, via_conjuge business rules) will be implemented in downstream plans.

## Next Phase Readiness

- All data models are extended and importable without errors
- Schema migration script creates new columns and tables idempotently
- Test infrastructure is in place for downstream plan verification
- Ready for plans 02–05 of Phase 2 (matching refinement, exposure flags, data quality)

## Self-Check: PASSED

- All 7 created/modified files verified on disk
- All 3 commits verified in git log (`df5cc59`, `f7a69df`, `494183a`)
- Models import successfully without errors
- Schema migration script imports successfully
- All 5 QSA flag tests pass (`pytest tests/test_qsa_flags.py -x -q`)
- Full test suite passes with no regressions (55 tests, same as baseline)
- Threat model compliance: no new surface beyond analyzed threats

---

*Phase: 02-enhancement*
*Completed: 2026-06-12*
