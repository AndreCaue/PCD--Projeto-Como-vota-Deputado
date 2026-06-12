---
status: complete
phase: 02-enhancement
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md
started: 2026-06-12T10:00:00Z
updated: 2026-06-12T10:25:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server. Start the backend from scratch. Server boots without errors, schema migration runs, and GET / returns {"status": "ok"}.
result: pass

### 2. Schema Migration Idempotency
expected: Running ensure_schema() multiple times does not raise errors. New columns (alta_exposicao, via_conjuge on Relacao; capital_social on Empresa) and new tables (qsa_metadata, config) exist after migration.
result: pass

### 3. GET /deputados/empresas - Paginated Listing of Deputies with Company Counts
expected: GET /deputados/empresas returns 200 with {"data": [...], "meta": {...}, "freshness": {...}}. Each data item has id, nome, partido, estado, total_empresas. Supports filtering by partido, estado, tem_conflito, alta_exposicao. Default sort by total_empresas descending.
result: pass

### 4. GET /deputados/{id}/empresas - Inline Freshness in Response
expected: GET /deputados/{id}/empresas returns {"data": [...], "freshness": {...}} instead of bare list. Freshness block includes qsa_data_disponivel, ultima_atualizacao_qsa, dias_desde_atualizacao, dados_antigos.
result: pass

### 5. GET /qsa/freshness - Dedicated Freshness Endpoint
expected: GET /qsa/freshness returns freshness metadata with dados_antigos flag (True when >45 days stale).
result: pass

### 6. POST /atualizar-qsa - Triggers Incremental Import
expected: POST /atualizar-qsa triggers importar_qsa_incremental (not importar_qsa_completo). Returns 202 with {"message": "Importação QSA iniciada em segundo plano"}.
result: pass

### 7. alta_exposicao Flag in API Response
expected: GET /deputados/{id}/empresas response items include alta_exposicao (Boolean) field. Flag is True when linked empresa's capital_social > 1,000,000 (default threshold).
result: pass

### 8. via_conjuge Flag in API Response
expected: GET /deputados/{id}/empresas response items include via_conjuge (Boolean) field. Flag is True when relationship was found via fuzzy spouse name matching.
result: pass

### 9. capital_social in Nested Empresa Dict
expected: GET /deputados/{id}/empresas response items include empresa dict with capital_social (Float) field.
result: pass

### 10. Confidence Score Fix - Fuzzy Matches at 75-89 Raw
expected: Fuzzy name matches with raw confidence scores between 75-89 are included in results (not filtered out). Stored score_confianca remains as discrete tier (85/60/0).
result: pass

### 11. QsaMetadata Created After Import
expected: After QSA import, qsa_metadata table has a row with status, row_count, last_import_at populated.
result: pass

## Summary

total: 11
passed: 11
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
