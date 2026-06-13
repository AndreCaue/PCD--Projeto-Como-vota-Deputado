# Plan 03-02: CNAE Import Pipeline — Summary

## Objective
Updated both QSA import paths (full and incremental) to capture CNAE columns from CSV, parse semicolon-separated secondary CNAE codes into normalized EmpresaCnaeSecundario rows, and seeded conflito_cnae_classes config with default conflict sector codes.

## Tasks Executed

1. **Task 1** — Updated `processar_csv_empresas()` to capture cnae_principal/cnae_descricao, parse secondary CNAE codes (semicolon-split), and use db.flush() + chunk-level commit pattern
2. **Task 2** — Updated `processar_csv_empresas_incremental()` with CNAE fields in upsert records, set_ clause, and delete+re-insert pattern for secondary CNAE codes
3. **Task 3** — Seeded `conflito_cnae_classes` (41204,70204,73190,86101) in Config table during schema migration (idempotent)

## Files Modified

- `Backend/app/ingest/import_qsa.py` — CNAE field capture and secondary CNAE parsing in both import paths
- `Backend/app/ingest/migrate_schema.py` — Config seed for default conflict CNAE classes

## Verification

- All 80 tests pass (no regressions)
- Import functions verified via source inspection
