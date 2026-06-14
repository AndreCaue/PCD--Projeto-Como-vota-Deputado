---
phase: 04-cleanup-foundation
plan: 01
subsystem: backend
tags: [python, datetime, deprecation, dead-code, pytest]
requires: []
provides: [clean datetime usage, cleaned codebase, regression test for processar_csv_socios]
affects: [05-qsa-dashboard-core]

tech-stack:
  added: []
  patterns: [datetime.now(timezone.utc) instead of datetime.utcnow()]

key-files:
  created: []
  modified:
    - Backend/app/api/qsa.py
    - Backend/app/api/deputados.py
    - Backend/app/ingest/import_qsa.py
    - Backend/app/scheduler/sync_scheduler.py
    - Backend/tests/test_qsa_ingest.py
    - Backend/tests/test_cnpj_validation.py
  deleted:
    - Backend/app/ingest/import_empresas.py
    - Backend/app/ingest/import_socios.py

key-decisions:
  - "Used datetime.now(timezone.utc) with .replace(tzinfo=timezone.utc) for timezone-aware freshness comparisons"
  - "Deleted dead-code tests rather than rewriting them — no value in testing deleted code paths"

patterns-established: []

requirements-completed: [CLEANUP-01, CLEANUP-03, CLEANUP-04]

duration: 8min
completed: 2026-06-14
---

# Phase 4: Cleanup & Foundation — Plan 04-01 Summary

**Replaced 6 datetime.utcnow() calls with timezone-aware datetime.now(timezone.utc), removed dead code (import_empresas.py, import_socios.py, importar_qsa_completo()), added regression test for processar_csv_socios return value**

## Performance

- **Duration:** 8 min
- **Tasks:** 2
- **Files modified:** 6 (plus 2 deleted)

## Accomplishments

- All 6 `datetime.utcnow()` occurrences in 4 backend files replaced with `datetime.now(timezone.utc)` — zero deprecation warnings
- Added `test_processar_csv_socios_returns_total` regression test confirming `processar_csv_socios()` returns an int equal to row count
- Deleted `Backend/app/ingest/import_empresas.py` and `Backend/app/ingest/import_socios.py` — dead code superseded by `import_qsa.py`
- Removed `importar_qsa_completo()` function from `import_qsa.py`
- Deleted 4 dead-code-dependent tests (2 from test_qsa_ingest.py, 2 from test_cnpj_validation.py)
- Full test suite: 83/83 passing

## Task Commits

1. **Task 1: Fix datetime.utcnow() + regression test** — `191302e` (fix)
2. **Task 2: Remove dead code** — `79d1af9` (refactor)

## Decisions Made

- Used `datetime.now(timezone.utc)` with `.replace(tzinfo=timezone.utc)` when comparing against naive datetime from DB — preserves timezone awareness for freshness calculations
- Deleted dead-code tests rather than rewriting — testing deleted code paths adds no value

## Deviations from Plan

None — plan executed exactly as written.

## Next Phase Readiness

- DQ-01 blocker permanently fixed with regression test guard
- Backend ready for Phase 5 (QSA Dashboard Core) with clean, warning-free codebase

---
*Phase: 04-cleanup-foundation*
*Completed: 2026-06-14*
