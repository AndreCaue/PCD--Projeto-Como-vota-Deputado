# Phase 2: Enhancement - Context

**Gathered:** 2026-06-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Refine deputy-company matching with spouse name fuzzy matching confidence scoring, add data freshness tracking for incremental QSA updates, create paginated listing endpoint for all deputies with company counts and conflict flags, add appropriate database indices, and expose high-exposure and via_conjuge flags in API responses.

</domain>

<decisions>
## Implementation Decisions

### Confidence Scoring
- **D-01:** Keep existing discrete tier system for fuzzy match confidence: fuzzy score >=90 → 85, >=75 → 60, else 0
- **D-02:** Exact CPF matches keep 100 confidence score (deterministic government ID)
- **D-03:** Keep field name as `score_confianca` (Portuguese, matching codebase convention)

### Incremental Updates
- **D-04:** Use upsert by CNPJ for incremental QSA updates — process full snapshot but INSERT OR REPLACE by CNPJ
- **D-05:** Keep all existing relacoes entries when companies drop from snapshot (no pruning)
- **D-06:** Both auto-check on startup (if last import >7 days) AND keep manual POST /atualizar-qsa endpoint

### Flag Storage Strategy
- **D-07:** Add `alta_exposicao` and `via_conjuge` as new boolean columns on the existing Relacao model
- **D-08:** `via_conjuge` = True when `tipo_relacao` is `nome_match`
- **D-09:** `alta_exposicao` threshold (capital_social > 1,000,000) stored in database config table for runtime adjustability

### Freshness Tracking
- **D-10:** Dedicated QSA metadata table (`qsa_metadata`) with `last_import_at`, `status`, `row_count` columns
- **D-11:** Staleness handled by flag in API response only — no blocking behavior
- **D-12:** Data freshness exposed both inline in API responses AND via a dedicated `GET /qsa/freshness` endpoint
- **D-13:** Staleness threshold per DQ-04: 45 days

### Paginated List Endpoint (GET /deputados/empresas)
- **D-14:** Minimal per-deputy response: id, nome, partido, estado, total_empresas only — client expands details via existing GET /deputados/{id}/empresas
- **D-15:** Reuse existing page/limit pagination pattern with meta block (consistent with list_deputados)
- **D-16:** Support filtering by partido, estado, AND conflict flags (tem_conflito, alta_exposicao)
- **D-17:** Default sort by company count descending (highest exposure first)

### the agent's Discretion
- Specific QSA metadata table schema design and field types
- Exact implementation of upsert logic (SQLAlchemy merge vs raw SQL)
- Index strategy (which columns to index on relacoes table for new query patterns)
- Response field names for freshness endpoint
- Whether to pre-compute relacoes counts or compute at query time

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Documentation
- `.planning/PROJECT.md` — Project overview, core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — Detailed requirements: MAT-02, CONF-03, CONF-04, API-02, API-04, INF-02, INF-04, DQ-01, DQ-04
- `.planning/ROADMAP.md` — Phase 2 definition: Goal, dependencies, requirements, success criteria
- `.planning/STATE.md` — Current project state and Phase 1 key decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions, deferred ideas feeding into Phase 2

### Existing Code Patterns
- `Backend/app/models/empresa.py` — Relacao model (target for new alta_exposicao and via_conjuge columns)
- `Backend/app/services/relacao_service.py` — Existing matching logic with confidence scoring, relationship_type handling
- `Backend/app/api/deputados.py` — Pagination pattern (page/limit/meta) to reuse for GET /deputados/empresas
- `Backend/app/api/integracao.py` — Existing QSA endpoint pattern (POST /atualizar-qsa)
- `Backend/app/ingest/import_qsa.py` — Current full-import logic to refactor for incremental upsert
- `Backend/app/services/matching_service.py` — Existing fuzzy matching algorithm patterns
- `Backend/app/database.py` — SQLAlchemy session management pattern

### Data Sources
- Receita Federal QSA dataset (Empresas.zip and Socios.zip) — Official source for company and partner data

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Backend/app/services/relacao_service.py:22` — `_calc_confianca_nome()` method — existing confidence scoring logic to keep/refine
- `Backend/app/models/empresa.py:26` — `Relacao` model — target for new flag columns (alta_exposicao, via_conjuge)
- `Backend/app/api/deputados.py:12` — `list_deputados()` — pagination pattern (page/limit/meta) to reuse
- `Backend/app/api/integracao.py:15` — `atualizar_qsa()` — existing trigger endpoint to extend for incremental
- `Backend/app/ingest/import_qsa.py` — Full import pipeline to refactor for upsert-based incremental

### Established Patterns
- Chunked CSV processing with pandas (10k row chunks) — Used in existing imports for memory efficiency
- Boolean flags for match types — `relationship_type` (false=cpf_match, true=nome_match) — pattern extends to alta_exposicao and via_conjuge
- Page/limit pagination with meta block (total, page, limit, totalPages) — Consistent across deputados and votos endpoints
- Background task processing — QSA ingestion runs via FastAPI BackgroundTasks (POST /atualizar-qsa)
- SQLAlchemy models with explicit `__tablename__` and server_default for timestamps

### Integration Points
- `Backend/app/models/empresa.py` — Add new columns to Relacao model
- `Backend/app/services/relacao_service.py` — Extend matching logic to set new flags during relationship generation
- `Backend/app/api/deputados.py` — Add new GET /deputados/empresas endpoint following existing patterns
- `Backend/app/api/integracao.py` — Extend for auto-startup freshness check
- `Backend/app/ingest/import_qsa.py` — Refactor import function to support upsert mode
- `Backend/app/main.py` — Register new routes if needed

</code_context>

<specifics>
## Specific Ideas

- Pre-compute `alta_exposicao` during relationship generation by looking up capital_social from empresas table
- Store `via_conjuge` as boolean: True when tipo_relacao is `nome_match`, derived during gerar_relacoes_deputado
- Freshness metadata response should include `ultima_atualizacao_qsa` (ISO timestamp) and `dias_desde_atualizacao` (integer)
- Follow existing pattern of returning arrays of objects with metadata — consistent with list_deputados response shape

</specifics>

<deferred>
## Deferred Ideas

- CNAE-based conflict scoring and graduated confidence levels — Phase 3 (CONF-01, CONF-02)
- Export functionality (CSV/JSON) — Future phase
- Historical tracking of deputy-company relationships for trend analysis — v2 requirement (HISTORY-01)
- Interactive conflict investigation UI — v2 requirement (INVESTIGATE-01)
- Sector-specific risk scoring based on deputy committee assignments — v2 requirement (SECTOR-01)

</deferred>

---

*Phase: 2-Enhancement*
*Context gathered: 2026-06-12*
