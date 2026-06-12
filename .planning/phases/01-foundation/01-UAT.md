---
status: complete
phase: 01-foundation
source: 01-SUMMARY.md, 02-SUMMARY.md
started: 2026-06-11T12:00:00Z
updated: 2026-06-11T12:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Start the backend server from scratch. Server boots without errors. Health check at GET / returns {"status": "ok"}.
result: pass

### 2. Trigger QSA Data Ingestion
expected: POST /atualizar-qsa returns 202 with {"message": "Importação QSA iniciada em segundo plano"} (background task starts).
result: pass

### 3. View Deputy Companies
expected: GET /deputados/{id}/empresas returns 200 with list of company matches. Each match includes relationship_type (boolean) and score_confianca (integer 0-100). Returns 404 for nonexistent deputy.
result: pass

### 4. View Deputy Relations (Backward Compat)
expected: GET /deputados/{id}/relacoes returns 200 with list of relations. Response includes existing "tipo" and "empresa" fields (unchanged).
result: pass

### 5. CPF Exact Matching
expected: A deputy with CPF matching a socio's cpf_socio gets linked via gerar_relacoes_deputado. Match has tipo_relacao="cpf_match" and relationship_type=false.
result: pass

### 6. Fuzzy Name Matching (Dual Strategy)
expected: After exact CPF matches, unmatched deputies get fuzzy name matches via rapidfuzz. nome_match entries have relationship_type=true and confidence score >= 75.
result: pass

### 7. CNPJ Validation Rejects Invalid
expected: System rejects CNPJ with invalid format (wrong length, all same digits, bad checksum). Rejection is logged via logging.warning. Valid CNPJ "11222333000181" passes.
result: pass

### 8. Database Stores Match Type
expected: Relacao records have relationship_type (Boolean) and score_confianca (Integer) columns populated. Queryable via SQLAlchemy.
result: pass

### 9. List and Filter Deputies
expected: GET /deputados returns paginated list with meta. Filters by partido and estado work. Empty filters return 200 with empty data array.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
