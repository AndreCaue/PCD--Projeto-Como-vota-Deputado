# Plan 03-01: Data Model Extensions — Summary

## Objective
Extended the data model with CNAE columns on Empresa, created EmpresaCnaeSecundario normalized table, added conflito_interesse and score_conflito to Relacao, and provided idempotent schema migration + test infrastructure.

## Tasks Executed

1. **Task 1** — Extended Empresa model with `cnae_principal` and `cnae_descricao` columns; created `EmpresaCnaeSecundario` model
2. **Task 2** — Added `conflito_interesse` (Boolean, indexed) and `score_conflito` (Integer) columns to Relacao model
3. **Task 3** — Updated `__init__.py` to export `EmpresaCnaeSecundario`
4. **Task 4** — Updated `migrate_schema.py` with Phase 3 column additions, table creation, and indices (all idempotent)
5. **Task 5** — Added test fixtures (`sample_empresa_with_cnae`, `sample_empresa_cnae_secundario`, `sample_cnae_config`) and created `test_conflito.py` with 6 model tests

## Files Modified

- `Backend/app/models/empresa.py` — CNAE columns on Empresa, conflict columns on Relacao, EmpresaCnaeSecundario model
- `Backend/app/models/__init__.py` — Export EmpresaCnaeSecundario
- `Backend/app/ingest/migrate_schema.py` — Idempotent migration for all Phase 3 schema changes

## Files Created

- `Backend/tests/test_conflito.py` — 6 tests for conflict detection models

## Verification

- All 6 conflict model tests pass
- All 80 existing tests pass (no regressions)
- Model imports verified without ImportError
