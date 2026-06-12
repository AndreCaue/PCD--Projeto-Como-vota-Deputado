# Phase 2: Enhancement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-12
**Phase:** 2-enhancement
**Areas discussed:** Confidence Scoring, Incremental Updates, Flag Storage Strategy, Freshness Tracking, Paginated List Endpoint

---

## Confidence Scoring

| Option | Description | Selected |
|--------|-------------|----------|
| Discrete tiers (current) | Keep existing 3-tier system (85/60/0) | ✓ |
| Continuous scale | Map rapidfuzz ratio 0-100 directly | |
| Graduated tiers 4-5 | Add more tiers for granularity | |

**User's choice:** Discrete tiers (current)
**Notes:** Keep as-is 85/60/0 thresholds. CPF matches stay at 100. Field name stays `score_confianca`.

---

## Incremental Updates

| Option | Description | Selected |
|--------|-------------|----------|
| Delete-and-reimport | Truncate and reimport full snapshot | |
| Upsert by CNPJ | INSERT OR REPLACE by CNPJ | ✓ |
| Track last import timestamp | Compare file modification dates | |

**User's choice:** Upsert by CNPJ

### Follow-up: Orphaned relationships

| Option | Description | Selected |
|--------|-------------|----------|
| Keep all relacoes | Preserve existing relationships | ✓ |
| Prune orphaned relacoes | Remove stale relationship entries | |
| Soft-delete orphaned | Mark as inactive rather than deleting | |

**User's choice:** Keep all relacoes

### Follow-up: Scheduling

| Option | Description | Selected |
|--------|-------------|----------|
| Auto on startup | Check staleness on startup, auto-trigger if >7 days | |
| Keep manual trigger | Only via POST /atualizar-qsa | |
| Both | Auto-check on startup AND manual endpoint | ✓ |

**User's choice:** Both

---

## Flag Storage Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| New columns on Relacao | Add alta_exposicao and via_conjuge booleans | ✓ |
| Computed on-the-fly | Calculate from empresa data at query time | |
| Separate flags table | Dedicated DeputadoEmpresaFlags table | |

**User's choice:** New columns on Relacao

### Follow-up: via_conjuge determination

| Option | Description | Selected |
|--------|-------------|----------|
| Relate to nome_match | via_conjuge = True when tipo_relacao is nome_match | ✓ |
| Separate spouse dataset | Require separate spouse data source | |
| Heuristic via name similarity | Only when high fuzzy match without CPF match | |

**User's choice:** Relate to nome_match

### Follow-up: alta_exposicao threshold

| Option | Description | Selected |
|--------|-------------|----------|
| Hard-coded constant | Define ALTA_EXPOSICAO_THRESHOLD as module constant | |
| Configurable via env var | Override via environment variable | |
| Database config table | Store in key-value config table | ✓ |

**User's choice:** Database config table

---

## Freshness Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated QSA metadata table | New qsa_metadata table | ✓ |
| Extend SyncLog pattern | Reuse existing SyncLog model | |
| Simple env or file marker | Store timestamp as file or env var | |

**User's choice:** Dedicated QSA metadata table

### Follow-up: Staleness behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Flag in API response only | Include stale flag, no blocking | ✓ |
| Flag + warning log | Flag in API AND log warning | |
| Block matching until refresh | Prevent matching on stale data | |

**User's choice:** Flag in API response only

### Follow-up: Freshness exposure

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in every response | Add ultima_atualizacao_qsa to all empresa responses | |
| Separate endpoint | New GET /qsa/freshness | |
| Both | Inline flags + dedicated endpoint | ✓ |

**User's choice:** Both

---

## Paginated List Endpoint

| Option | Description | Selected |
|--------|-------------|----------|
| Deputy summary + counts | id, nome, partido, total_empresas, flags | |
| Minimal + expandable | id, nome, total_empresas — details via /{id}/empresas | ✓ |
| Full detail | Includes first 5 companies with cnpj, flags | |

**User's choice:** Minimal + expandable

### Follow-up: Pagination style

| Option | Description | Selected |
|--------|-------------|----------|
| Page/limit (same as list) | Reuse existing page+limit+meta pattern | ✓ |
| Cursor-based | Use cursor pagination | |

**User's choice:** Page/limit (same as list)

### Follow-up: Filtering

| Option | Description | Selected |
|--------|-------------|----------|
| Same as list_deputados | Support partido and estado filters | |
| Plus conflict filters | Add tem_conflito and alta_exposicao filters | ✓ |
| No filters, just pagination | Simple list with page/limit only | |

**User's choice:** Plus conflict filters

### Follow-up: Default sort

| Option | Description | Selected |
|--------|-------------|----------|
| By deputy name A-Z | Alphabetical by nome | |
| By company count desc | Most companies first | ✓ |
| Configurable sort | sort_by and sort_order query params | |

**User's choice:** By company count desc

---

## the agent's Discretion

- Exact QSA metadata table schema design and field types
- Implementation approach for upsert (SQLAlchemy merge vs raw SQL)
- Index strategy for new query patterns on relacoes table
- Response field names for freshness endpoint
- Whether to pre-compute relacoes counts or compute at query time

## Deferred Ideas

- CNAE-based conflict scoring and graduated confidence levels — Phase 3
- Export functionality (CSV/JSON) — Future phase
- Historical deputy-company relationship tracking — v2 requirement
- Interactive conflict investigation UI — v2 requirement
- Sector-specific risk scoring — v2 requirement
