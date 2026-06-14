# Phase 4: Cleanup & Foundation - Context

**Gathered:** 2026-06-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix blocking bugs (processar_csv_socios TypeError, hardcoded port 8000), eliminate tech debt (datetime.utcnow() deprecation, dead code removal), create QSA service layer in the frontend, and add VERIFICATION.md for all 3 v1.0 phases. Establishes the foundation Phase 5 needs to build the QSA dashboard.
</domain>

<decisions>
## Implementation Decisions

### QSA Service Structure
- **D-01:** Add `qsaService` to existing `Frontend/services/api.ts` — consistent with all other services (votacoesService, deputadosService, etc.)
- **D-02:** Include all QSA backend endpoints (listar, freshness, relacoes de deputado) — pre-built for Phase 5 so qsaService won't need changes later
- **D-03:** Reuse the existing `api` axios instance from `api.ts` — baseURL is already configured via env, automatically benefits from the CLEANUP-02 port fix
- **D-04:** Migrate `Frontend/hooks/useFiscalizacao.ts` from raw `fetch()` to use the same axios instance — ensures the port fix covers all QSA-related requests; consistent with usePatrimonio.ts pattern

### the agent's Discretion
- CLEANUP-04 (dead code removal): the agent may decide whether to update or delete tests that depend on `import_empresas.py` and `import_socios.py`
- CLEANUP-06 (VERIFICATION.md): the agent may choose format (one file per phase vs. combined) and content structure
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, and dependency context
- `.planning/REQUIREMENTS.md` — CLEANUP-01 through CLEANUP-06 full definitions

### Backend — Existing Code
- `Backend/app/ingest/import_qsa.py` — Contains the `processar_csv_socios()` bug (missing `return total`, line ~92) and dead `importar_qsa_completo()` (line ~239)
- `Backend/app/api/qsa.py` — QSA freshness endpoint, uses `datetime.utcnow()` at line 16
- `Backend/app/api/deputados.py` — Deputados endpoints including QSA-filtered routes (`/deputados/empresas`, `/deputados/{id}/relacoes`); uses `datetime.utcnow()` at lines 72, 173
- `Backend/app/api/integracao.py` — Integration sync endpoints; qsa_router for `/atualizar-qsa`
- `Backend/app/main.py` — Router registration with prefix inconsistency
- `Backend/app/scheduler/sync_scheduler.py` — Uses `datetime.utcnow()` at line 46
- `Backend/.env` and `Backend/.env.example` — Confirms PORT=3001

### Frontend — Existing Code
- `Frontend/services/api.ts` — Target file for qsaService; contains all existing service objects and the `api` axios instance
- `Frontend/hooks/useFiscalizacao.ts` — Existing QSA-related hook using raw `fetch()` — target for axios migration
- `Frontend/hooks/usePatrimonio.ts` — Reference pattern (axios-based hook) for the migration
- `Frontend/next.config.js` — Hardcoded port at line 14
- `Frontend/.env` and `Frontend/.env.example` — Env config for API URL

### Test Files
- `Backend/tests/test_qsa_ingest.py` — Tests that depend on dead import_empresas/socios code
- `Backend/tests/test_cnpj_validation.py` — Tests that depend on dead import_empresas code
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Frontend/services/api.ts` — Established axios-based service pattern (import axios, create instance, export named service object with methods)
- `Frontend/hooks/usePatrimonio.ts` — Reference hook pattern for axios-based data fetching (useState for data/loading/error, useEffect, try/catch)
- `Frontend/components/ui/` — shadcn/ui components available for any Phase 5 prep work

### Established Patterns
- **Service pattern:** Named service objects in a single `api.ts` file, each with async methods returning axios responses
- **Hook pattern:** Custom hooks return `{ data, loading, error }` triplet
- **Backend router pattern:** `app.include_router(router)` in `main.py` — note prefix inconsistency (/api/v1 vs. root-level)

### Integration Points
- `Frontend/services/api.ts` — Add `qsaService` object here
- `Frontend/hooks/useFiscalizacao.ts` — Replace raw fetch calls with `qsaService` methods
- `Backend/app/ingest/import_qsa.py:92-101` — Add `return total` to fix DQ-01 blocker
- `Frontend/next.config.js:14`, `Frontend/hooks/useFiscalizacao.ts:6`, `Frontend/services/api.ts:17` — Fix port defaults from 8000 to 3001
- `Backend/app/api/qsa.py:16`, `Backend/app/api/deputados.py:72,173`, `Backend/app/ingest/import_qsa.py:187,200`, `Backend/app/scheduler/sync_scheduler.py:46` — Fix datetime.utcnow() → datetime.now(timezone.utc)
- `Backend/app/ingest/import_qsa.py:239-258` — Remove dead `importar_qsa_completo()`
- `Backend/app/ingest/import_empresas.py` — Remove dead file (update/delete dependent tests)
- `Backend/app/ingest/import_socios.py` — Remove dead file (update/delete dependent tests)
</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for VERIFICATION.md format, dead code test strategy, and qsaService method signatures.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 4-Cleanup & Foundation*
*Context gathered: 2026-06-13*
