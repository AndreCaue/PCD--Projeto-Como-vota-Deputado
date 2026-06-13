# Plan 03-04: API Updates + Tests — Summary

## Objective
Exposed `conflito_interesse` and `score_conflito` in all deputado-company API endpoints, refined the `tem_conflito` filter to check the actual conflict flag, added `conflito_interesse` query filter, and included CNAE fields in response data.

## Tasks Executed

1. **Task 1** — Verified detail endpoints (`GET /deputados/{id}/empresas`, `GET /deputados/{id}/relacoes`) pass through conflict fields via `get_relacoes_com_detalhes()` — no code changes needed
2. **Task 2** — Refined `tem_conflito` filter to check `Relacao.conflito_interesse == True` (not just relationship existence); added `total_conflito` via `func.sum(case(...))` to list endpoint
3. **Task 3** — Added `conflito_interesse` query param to `GET /deputados/empresas`; added 4 API tests + 2 integration tests

## Files Modified

- `Backend/app/api/deputados.py` — Refined tem_conflito filter, conflito_interesse query param, total_conflito in response
- `Backend/tests/test_api_deputados.py` — 4 new conflict field tests
- `Backend/tests/test_conflito.py` — 2 new integration tests (flag computation, score range)

## Verification

- All 86 tests pass (no regressions)
- All plan acceptance criteria met
