---
phase: 02-enhancement
plan: 02
subsystem: api, service
tags: sqlalchemy, rapidfuzz, confidence-scoring, alta-exposicao, via-conjuge, flag-computation
requires:
  - phase: 02-enhancement
    plan: 01
    provides: Relacao model with alta_exposicao/via_conjuge columns, Empresa.capital_social, Config model
provides:
  - Confidence score bug fix: _calc_confianca_nome returns (raw, tier) tuple, caller guards on raw score
  - alta_exposicao flag computed from empresa.capital_social > config threshold during relationship generation
  - via_conjuge flag computed from tipo_relacao == nome_match during relationship generation
  - Both flags stored as Relacao columns on insert, included in API response dicts
  - capital_social in nested empresa dict of get_relacoes_com_detalhes response
affects: 02-enhancement (plans 03-05 API layer and UI)
tech-stack:
  added: []
  patterns:
    - Config model as runtime-adjustable threshold source for flag computation
    - Tuple unpacking for (raw_score, tier) from confidence calculator
key-files:
  created: []
  modified:
    - Backend/app/services/relacao_service.py
key-decisions:
  - "Confidence score keeps discrete tier system (85/60/0) but raw score is used for guard comparison"
  - "alta_exposicao threshold defaults to 1000000.0 when Config table has no matching row"
  - "via_conjuge is computed inline via tipo_relacao comparison, not stored separately"
patterns-established:
  - "Flag computation: compute flags on relacoes_encontradas before DB insert loop"
  - "Config lookup: lazy import inside method for circular import avoidance"
requirements-completed:
  - MAT-02
  - CONF-03
  - CONF-04
  - API-04
duration: 8min
completed: 2026-06-12
---

# Phase 2 Plan 02: Service Layer — Confidence Score Bug Fix + Flag Computation Summary

**Confidence score bug fix (tuple return + raw-score guard) and alta_exposicao/via_conjuge flag computation during relationship generation and response serialization**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-12T00:36:36Z
- **Completed:** 2026-06-12T00:44:14Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Fixed `_calc_confianca_nome` to return `(raw_score, tier)` tuple instead of single int — raw score is now used for the `FUZZY_THRESHOLD` guard, fixing the bug where fuzzy matches scoring 75-89 raw were incorrectly filtered out
- Added `_get_alta_threshold()` helper that reads threshold from Config table with 1,000,000 fallback
- Added `alta_exposicao` flag computation: `True` when `empresa.capital_social > threshold`
- Added `via_conjuge` flag computation: `True` when `tipo_relacao == "nome_match"`
- Both flags are stored as Relacao ORM columns on insert and included in both `gerar_relacoes_deputado()` and `get_relacoes_com_detalhes()` response dicts
- Added `capital_social` to the nested `empresa` dict in `get_relacoes_com_detalhes()` response
- All 14 flag and matching tests pass; 47 related tests pass with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix _calc_confianca_nome return type and caller guard comparison** — `8c0762d` (fix)
2. **Task 2: Compute alta_exposicao and via_conjuge flags during relationship generation and response serialization** — `0137bee` (feat)

**Plan metadata:** (committed below)

## Files Modified

- `Backend/app/services/relacao_service.py` — Fixed `_calc_confianca_nome` return type, caller tuple unpacking and guard comparison; added `_get_alta_threshold()`, flag computation in `gerar_relacoes_deputado()`, flag fields in `get_relacoes_com_detalhes()` response

## Decisions Made

- Confidence score keeps the existing discrete tier system (85/60/0) in the stored `score_confianca` value — only the internal guard comparison changed to use raw score
- `_get_alta_threshold()` uses a lazy import of Config model inside the method body to avoid circular import issues
- The threshold defaults to 1,000,000.0 if no Config row exists — safe default that prevents false-positive alta_exposicao flags
- `via_conjuge` is computed directly from `tipo_relacao == "nome_match"` — no separate lookup needed

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Pre-existing conftest.py issue: `test_qsa_ingest.py::test_validation_failures_logged` fails due to shared `test.db` and `remuneracao_deputados` table not being in SQLAlchemy metadata. Out of scope for this plan. All other 47 tests (flags, matching, database, CNPJ validation, API deputados) pass.

## Threat Surface Scan

No new threat surface introduced:
- T-02-03 (Tampering — float cast): Mitigated — `float(config.value)` with `None`/invalid config falling back to `1000000.0`
- T-02-04 (Tampering — Config table): Accepted — Config populated only by app itself via schema migration
- T-02-SC (Tampering — package installs): Mitigated — no new packages added

## Next Phase Readiness

- Service layer confidence scoring and flag computation complete
- `RelacaoService.gerar_relacoes_deputado()` now produces relationships with correct confidence scores and alta_exposicao/via_conjuge flags
- Ready for Plan 03 (data pipeline) and Plan 04 (API endpoints)

## Self-Check: PASSED

- Both commits verified in git log (`8c0762d`, `0137bee`)
- Service imports successfully (`from app.services.relacao_service import RelacaoService`)
- All 8 acceptance criteria verified for Task 1 (tuple return, caller unpack/guard, tier storage)
- All 8 acceptance criteria verified for Task 2 (threshold method, flag computation, ORM storage, response fields)
- All 14 flag + matching tests pass (`pytest tests/test_qsa_flags.py tests/test_qsa_matching.py -x -q`)
- All 47 non-ingestion tests pass with zero regressions
- Threat model compliance: all T-02-XX mitigations verified

---

*Phase: 02-enhancement*
*Completed: 2026-06-12*
