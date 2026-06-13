# Phase 3: Intelligence - Context

**Gathered:** 2026-06-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Detect potential conflicts of interest in deputy-company relationships by analyzing CNAE (economic activity) codes from the Receita Federal QSA dataset, compute graduated conflict confidence scores based on CNAE sector, capital social, and relationship type, and expose conflict flags/score in all relevant API endpoints.

</domain>

<decisions>
## Implementation Decisions

### CNAE Data Model & Ingestion
- **D-01:** Add `cnae_principal` (String) and `cnae_descricao` (String) columns directly to the `Empresa` model — no separate CNAE lookup table
- **D-02:** Create a separate `EmpresaCnaeSecundario` model/table with FK to Empresa for secondary CNAE codes (semicolon-separated list in CSV becomes normalized rows)
- **D-03:** Update both `processar_csv_empresas()` (full import) and `processar_csv_empresas_incremental()` (upsert) to capture CNAE columns from CSV — CNAE ingestion is part of this phase
- **D-04:** Incremental upsert (on_conflict_do_update) must include the new CNAE columns in the `set_` clause

### Conflict CNAE Codes
- **D-05:** Match at CNAE **class level (5 dígitos, sem dígito verificador)** — more precise than 2-digit division, broader than 7-digit full code
- **D-06:** Conflict CNAE classes stored as config via Config table (key: `conflito_cnae_classes`) with a hardcoded fallback list in Python — pattern follows `alta_exposicao_threshold` (D-09 from Phase 2)

### Graduated Confidence Scoring (CONF-02)
- **D-07:** Score scale 0-100 (integer), consistent with existing `score_confianca`
- **D-08:** Three factors weighted as: capital_social — 50 points, CNAE conflict sector — 30 points, relationship type (direct CPF) — 20 points
  - capital_social > threshold (1M): +50 (binary)
  - CNAE in conflict class list: +30 (binary)
  - tipo_relacao == "cpf_match" (direct): +20 (binary)
- **D-09:** Score 0 = no indicators, 100 = all three factors present

### Flag Storage Strategy
- **D-10:** Add `conflito_interesse` (Boolean) and `score_conflito` (Integer) columns to the `Relacao` model — computed during `gerar_relacoes_deputado()`, same pattern as `alta_exposicao` (D-07 from Phase 2)

### API Response Updates
- **D-11:** Include `conflito_interesse` and `score_conflito` in ALL endpoints:
  - `GET /deputados/{id}/empresas` — per-relationship in data array
  - `GET /deputados/empresas` — in per-deputy response with conflict flag
  - `GET /deputados/{id}/relacoes` — per-relationship in response dicts
- **D-12:** Redefine `tem_conflito` filter in `GET /deputados/empresas` — now checks `conflito_interesse = True` instead of only checking if any relationship exists

### UX Scope
- **D-13:** Backend-only phase — no frontend components. "UX" refers to API response shape and developer experience. Full conflict investigation UI deferred to v2 (INVESTIGATE-01)

### the agent's Discretion
- Exact schema/implementation of `EmpresaCnaeSecundario` model
- Migration strategy for idempotent schema changes (follow `migrate_schema.py` pattern from Phase 2)
- Specific CNAE class codes in the default fallback list
- Response field names for conflict score (should follow Portuguese convention: `conflito_interesse`, `score_conflito`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Documentation
- `.planning/PROJECT.md` — Project overview, core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — CONF-01, CONF-02 (Phase 3 requirements)
- `.planning/ROADMAP.md` — Phase 3 definition: Goal, dependencies, requirements, success criteria
- `.planning/STATE.md` — Current project state and prior phase decisions
- `.planning/phases/02-enhancement/02-CONTEXT.md` — Phase 2 decisions (D-07 through D-09 patterns reused here)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions (flag and naming patterns)

### Existing Code Patterns (must read for implementation)
- `Backend/app/models/empresa.py` — Relacao model (target for new conflito_interesse, score_conflito columns); Empresa model (target for cnae_principal, cnae_descricao columns)
- `Backend/app/services/relacao_service.py` — `gerar_relacoes_deputado()` (compute flags during relationship generation), `get_relacoes_com_detalhes()` (include flags in response)
- `Backend/app/api/deputados.py` — All endpoints that need conflict flag updates; `list_deputados_empresas()` with tem_conflito filter
- `Backend/app/ingest/import_qsa.py` — `processar_csv_empresas()` and `processar_csv_empresas_incremental()` (need CNAE column capture)
- `Backend/app/ingest/migrate_schema.py` — Idempotent schema migration pattern (inspect + PRAGMA guard)
- `Backend/app/models/config.py` — Config table pattern for runtime-adjustable settings (D-06)
- `Backend/app/models/qsa_metadata.py` — QsaMetadata model pattern for auxiliary tables

### Data Sources
- Receita Federal QSA dataset (Empresas.zip) — Official source with CNAE columns (cnae_principal, cnae_secundaria, cnae_descricao)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Backend/app/services/relacao_service.py:73-84` — Flag computation loop in `gerar_relacoes_deputado()` — pattern to extend for conflito_interesse and score_conflito
- `Backend/app/services/relacao_service.py:105-128` — `get_relacoes_com_detalhes()` — response dict builder to extend with new fields
- `Backend/app/api/deputados.py:41-47` — `tem_conflito`/`alta_exposicao` filter pattern in list endpoint — to be refined for conflito_interesse
- `Backend/app/ingest/import_qsa.py:71-112` — `processar_csv_empresas_incremental()` — upsert pattern to extend for CNAE columns
- `Backend/app/ingest/migrate_schema.py` — Idempotent column addition pattern (inspect + ALTER TABLE guard)

### Established Patterns
- Boolean flags on Relacao model (alta_exposicao, via_conjuge) — extend to conflito_interesse
- Config table for runtime-adjustable thresholds — extend for conflito_cnae_classes
- Chunked CSV processing with pandas (10k rows) — extend for CNAE column capture
- Portuguese field names (score_confianca, alta_exposicao, via_conjuge) — continue with conflito_interesse, score_conflito

### Integration Points
- `Backend/app/models/empresa.py:14` — Empresa model: add cnae_principal, cnae_descricao columns
- `Backend/app/models/empresa.py:27-38` — Relacao model: add conflito_interesse, score_conflito columns; add EmpresaCnaeSecundario model
- `Backend/app/services/relacao_service.py:72-84` — Flag computation step: add conflito_interesse and score_conflito computation
- `Backend/app/services/relacao_service.py:105-128` — Response serialization: add conflito_interesse, score_conflito to dict
- `Backend/app/api/deputados.py:14-89` — list endpoint: refine tem_conflito filter; add conflict fields to response
- `Backend/app/api/deputados.py:129-168` — Detail endpoints: add conflict fields to response
- `Backend/app/ingest/import_qsa.py:46-57` — Full import: add CNAE column mapping
- `Backend/app/ingest/import_qsa.py:71-112` — Incremental import: add CNAE column mapping
- `Backend/app/ingest/migrate_schema.py` — Add idempotent migration for new columns and EmpresaCnaeSecundario table

</code_context>

<specifics>
## Specific Ideas

- `score_conflito` computed during `gerar_relacoes_deputado()` alongside existing alta_exposicao and via_conjuge — single pass over relacoes_encontradas
- Default fallback CNAE classes for conflito_cnae_classes stored as comma-separated string in Config table (same as alta_exposicao_threshold pattern)
- tem_conflito=False should filter to deputies where no relationship has conflito_interesse = True
- Follow existing response shape: `{"data": [...], "meta": {...}, "freshness": {...}}` — add conflict fields to data items

</specifics>

<deferred>
## Deferred Ideas

- Interactive conflict investigation UI with detailed relationship tracing — v2 requirement (INVESTIGATE-01)
- Sector-specific risk scoring based on deputy committee assignments — v2 requirement (SECTOR-01)
- Historical tracking of deputy-company relationships for trend analysis — v2 requirement (HISTORY-01)
- Export functionality (CSV/JSON) — Future phase

</deferred>

---

*Phase: 3-Intelligence*
*Context gathered: 2026-06-12*
