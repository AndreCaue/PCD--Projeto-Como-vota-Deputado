---
phase: 04-cleanup-foundation
plan: 02
subsystem: api, frontend
tags: [axios, qsa, port-fix, service-layer, typescript]

requires:
  - phase: 04-cleanup-foundation
    provides: Context for QSA endpoint paths and existing api.ts structure
provides:
  - Fixed API fallback URL (8000 -> 3001) across 3 frontend files
  - QsaFreshness, DeputadoEmpresa, RelacaoDetalhada interfaces
  - qsaService object with 5 endpoint methods (listar, freshness, relacoes, empresas, atualizar)
  - Axios-based useFiscalizacao hooks (no raw fetch, no API_BASE)
affects: [05-qsa-dashboard-core]

tech-stack:
  added: []
  patterns:
    - "Services in api.ts follow standardized pattern (api.get/post, .then(r => r.data))"
    - "All hooks use shared axios `api` instance instead of fetch() with hardcoded base URL"
    - "QSA service methods follow existing votacoesService / deputadosService convention"

key-files:
  created: []
  modified:
    - Frontend/services/api.ts - baseURL port fix + QSA interfaces + qsaService object (+52 lines)
    - Frontend/next.config.js - env.NEXT_PUBLIC_API_URL fallback port fix
    - Frontend/hooks/useFiscalizacao.ts - port fix + axios migration from fetch()

key-decisions:
  - "axios `api` baseURL uses `http://localhost:3001` (no trailing slash) matching next.config.js style"
  - "QSA hook paths use `/api/v1/` prefix explicitly (required because backend routes are mounted at `/api/v1`)"
  - "useCruzamento uses string-based params serialization instead of axios params array to avoid `anos_ceap[]` bracket notation mismatch"
  - "Pre-existing TypeScript error in GrafoCanvas.tsx:635 deferred — not introduced by this plan"

patterns-established:
  - "All QSA API consumers access endpoints through qsaService methods reusing the shared `api` axios instance"
  - "Hook structure matches usePatrimonio.ts pattern: async/await with try/catch/finally for loading/error/data state"
  - "Type exports are defined in useFiscalizacao.ts (source of truth for 4 downstream consumer components)"

requirements-completed: [CLEANUP-02, CLEANUP-05]

duration: 18 min
completed: 2026-06-14
---

# Phase 4 Plan 2: Port Fix, QSA Service Layer, Axios Migration Summary

**Fixed hardcoded port 8000 to 3001 in 3 frontend files, created QSA service layer (3 interfaces + 5-method qsaService), migrated useFiscalizacao.ts from raw fetch() to shared axios api instance**

## Performance

- **Duration:** 18 min
- **Started:** 2026-06-14T02:30:00Z
- **Completed:** 2026-06-14T02:48:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Port 8000 fallback eliminated from all 3 frontend source files (api.ts baseURL, next.config.js env, useFiscalizacao.ts) — no more connection failures when NEXT_PUBLIC_API_URL env var is not set
- QSA service layer pre-builds all backend QSA API consumers needed by Phase 5 Dashboard (listar, freshness, relacoes, empresas, atualizar)
- useFiscalizacao.ts migrated from raw fetch() with hardcoded API_BASE to shared axios `api` instance — consistent with usePatrimonio.ts pattern
- All 7 type exports and 5 hook signatures preserved — zero breaking changes for 4 downstream consumer components

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix fallback URL port from 8000 to 3001** - `bba0cd6` (fix)
2. **Task 2: Add QSA types and qsaService object** - `3fbc875` (feat)
3. **Task 3: Migrate useFiscalizacao.ts from fetch() to axios** - `ae58281` (feat)

**Plan metadata:** *(see plan's final docs commit)*

## Files Created/Modified

- `Frontend/services/api.ts` - Changed baseURL fallback from 127.0.0.1:8000 to localhost:3001; added QsaFreshness, DeputadoEmpresa, RelacaoDetalhada interfaces; added qsaService with 5 methods (listar, freshness, relacoes, empresas, atualizar)
- `Frontend/next.config.js` - Changed env.NEXT_PUBLIC_API_URL fallback from localhost:8000 to localhost:3001
- `Frontend/hooks/useFiscalizacao.ts` - Changed fallback to localhost:3001/api/v1 (Task 1); removed API_BASE constant and fetchJSON helper; added import { api } from services/api; migrated all 5 hooks to axios with explicit /api/v1 path prefixes (Task 3)

## Decisions Made

- **Axios baseURL format:** Used `http://localhost:3001` without trailing slash to match next.config.js style and ensure consistent path concatenation
- **Path prefix strategy:** Added explicit `/api/v1/` prefix to each hook path (matching the existing patrimonioService pattern) since the backend routes are mounted at `/api/v1/`
- **useCruzamento serialization:** Used string-based `anos_ceap=a&anos_ceap=b` params to avoid axios's default array serialization (`anos_ceap[]=a&anos_ceap[]=b`) which would mismatch the backend's expected format
- **Pre-existing build error deferred:** The GrafoCanvas.tsx:635 TypeScript error is pre-existing (confirmed via git stash) and out of scope for this plan. Logged to deferred-items.md.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Pre-existing GrafoCanvas.tsx TypeScript error** - `npx next build` fails with a type error in `Frontend/components/grafo/GrafoCanvas.tsx:635` (MiniMap nodeColor parameter implicitly 'any'). This was confirmed to exist before our changes (via `git stash` test). Our changes introduce no new type errors. Logged to `deferred-items.md` for resolution in a future cleanup plan.

## Next Phase Readiness

- Port fix complete — frontend correctly falls back to backend port 3001
- QSA service layer ready — Phase 5 Dashboard can import `qsaService` and `QsaFreshness`, `DeputadoEmpresa`, `RelacaoDetalhada` types from `@/services/api`
- useFiscalizacao hooks now consistent with usePatrimonio pattern — Phase 5 consumers unchanged

---

*Phase: 04-cleanup-foundation*
*Completed: 2026-06-14*
