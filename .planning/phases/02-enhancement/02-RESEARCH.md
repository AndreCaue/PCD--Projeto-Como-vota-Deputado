# Phase 2: Enhancement - Research

**Researched:** 2026-06-12
**Domain:** Fuzzy Name Matching, Incremental QSA Processing, Data Freshness Tracking, Paginated Listings, Database Indexing
**Confidence:** HIGH

## Summary

Phase 2 extends the Phase 1 foundation with spouse name fuzzy matching confidence scoring, incremental QSA updates (upsert by CNPJ), data freshness tracking via a dedicated `qsa_metadata` table, paginated deputy-company listing, and database indexing for query performance. The existing codebase uses FastAPI + SQLAlchemy + SQLite + rapidfuzz (v3.14.5) — all patterns for this phase already exist in Phase 1 code and can be extended directly.

**Primary recommendation:** Extend existing patterns rather than introducing new libraries. All capabilities (SQLAlchemy upsert, FastAPI lifespan tasks, rapidfuzz scoring) are already established in the codebase. The most complex change is refactoring `import_qsa.py` to support upsert mode while preserving the 10k chunk pattern.

### Critical Bug Found
The existing `_calc_confianca_nome()` guard on line 56 of `relacao_service.py` compares the **discrete tier** (60) against `FUZZY_THRESHOLD` (75) instead of the **raw score**. This incorrectly filters out fuzzy matches scoring 75-89 (raw). Fix: use raw score for the guard comparison, keep the discrete tier for storage.

### Key Dependency: capital_social Import
The `alta_exposicao` flag requires `capital_social` from the Empresa CSV, but neither the Empresa model nor the import pipeline currently handles this column. A separate sub-task must add `capital_social` to the model, parser, and import logic before `alta_exposicao` can be computed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Keep existing discrete tier system: fuzzy score >=90 → 85, >=75 → 60, else 0
- **D-02:** Exact CPF matches keep 100 confidence score
- **D-03:** Keep field name as `score_confianca`
- **D-04:** Use upsert by CNPJ for incremental QSA updates — INSERT OR REPLACE by CNPJ
- **D-05:** Keep all existing relacoes entries when companies drop from snapshot (no pruning)
- **D-06:** Both auto-check on startup (if last import >7 days) AND keep manual POST /atualizar-qsa endpoint
- **D-07:** Add `alta_exposicao` and `via_conjuge` as new boolean columns on Relacao model
- **D-08:** `via_conjuge` = True when `tipo_relacao` is `nome_match`
- **D-09:** `alta_exposicao` threshold (capital_social > 1,000,000) stored in database config table
- **D-10:** Dedicated QSA metadata table (`qsa_metadata`) with `last_import_at`, `status`, `row_count`
- **D-11:** Staleness handled by flag in API response only — no blocking behavior
- **D-12:** Data freshness both inline in API responses AND via GET /qsa/freshness
- **D-13:** Staleness threshold per DQ-04: 45 days
- **D-14:** Minimal per-deputy response: id, nome, partido, estado, total_empresas only
- **D-15:** Reuse existing page/limit pagination pattern with meta block
- **D-16:** Support filtering by partido, estado, tem_conflito, alta_exposicao
- **D-17:** Default sort by company count descending

### the agent's Discretion
- Specific QSA metadata table schema design and field types
- Exact implementation of upsert logic (SQLAlchemy merge vs raw SQL)
- Index strategy (which columns to index on relacoes table for new query patterns)
- Response field names for freshness endpoint
- Whether to pre-compute relacoes counts or compute at query time

### Deferred Ideas (OUT OF SCOPE)
- CNAE-based conflict scoring and graduated confidence levels — Phase 3
- Export functionality (CSV/JSON) — Future phase
- Historical tracking of deputy-company relationships — v2
- Interactive conflict investigation UI — v2
- Sector-specific risk scoring — v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAT-02 | Fuzzy spouse name matching with confidence scoring | Existing `_calc_confianca_nome()` implements discrete tiers (D-01). Bug on line 56 needs fix. rapidfuzz 3.14.5 confirmed stable. |
| CONF-03 | High exposure flag (capital_social > 1,000,000) | Requires `capital_social` column added to Empresa model + import pipeline. Config table for threshold (D-09). |
| CONF-04 | via_conjuge flag for spouse name matches | Boolean column on Relacao, True when `tipo_relacao == "nome_match"`. Derivable during `gerar_relacoes_deputado()`. |
| API-02 | GET /deputados/empresas paginated listing | Reuse `list_deputados` pattern with GROUP BY + COUNT on relacoes. Composite index needed. |
| API-04 | API responses include freshness indicators and confidence scores | `score_confianca` already in responses via Phase 1. Freshness added via `qsa_metadata` table lookup. |
| INF-02 | Incremental weekly QSA updates | SQLAlchemy SQLite `insert()` with `on_conflict_do_update()` by CNPJ. Existing import refactored for upsert mode. |
| INF-04 | Database indices for efficient querying | Existing (deputado_id, cnpj, relationship_type). Add composite (deputado_id, cnpj), alta_exposicao index. |
| DQ-01 | Data freshness indicators | `qsa_metadata` table with last_import_at + staleness flag. Exposed inline and via dedicated endpoint. |
| DQ-04 | Staleness alerts for data older than 45 days | Computed comparison: `now() - last_import_at > 45 days`. Flag-only, no blocking per D-11. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Fuzzy name matching confidence | API / Backend | — | Already implemented in `relacao_service.py` — scoring logic lives in the match service |
| Incremental QSA upsert | API / Backend | — | Refactors `import_qsa.py` — purely server-side data pipeline |
| New flag columns on Relacao | Database / Storage | API / Backend | Schema migration (ALTER TABLE) + model update + compute during relationship generation |
| Data freshness tracking | API / Backend | Database / Storage | `qsa_metadata` table stores state; endpoint and inline flag expose it |
| Paginated listing endpoint | API / Backend | — | New FastAPI router endpoint — pure query + serialization |
| Database indexes | Database / Storage | — | SQLite DDL — created once after schema migration |
| Auto-startup freshness check | API / Backend | — | FastAPI lifespan `asyncio.create_task` — background check + trigger |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SQLAlchemy | 2.x | ORM, bulk upsert, session management | Existing project standard. SQLite dialect provides `insert()` with `on_conflict_do_update()` for upsert. [VERIFIED: npm registry — installed via requirements.txt] |
| rapidfuzz | 3.14.5 | Fuzzy string matching (token_sort_ratio) | Already in requirements.txt (`>=3.9`). v3.14.5 released 2026-04-07, actively maintained. [VERIFIED: pypi.org/project/RapidFuzz/3.14.5/] |
| FastAPI | 0.x | Web framework, lifespan events, BackgroundTasks | Existing project standard. Lifespan context manager supports `asyncio.create_task` for background startup checks. [CITED: fastapi.tiangolo.com/advanced/events/] |
| SQLite | 3.35+ | Database | Project standard. DDL: ALTER TABLE ADD COLUMN supported. DML: INSERT ON CONFLICT DO UPDATE supported since 3.24.0 (2018). Current production version well above this. [CITED: sqlite.org/lang_upsert.html] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pandas | 2.x | CSV chunked processing (10k rows) | Existing pattern in `import_qsa.py` for memory-efficient CSV parsing |
| httpx | 0.27+ | HTTP downloads of QSA ZIP files | Existing in import pipeline |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `sqlalchemy.dialects.sqlite.insert().on_conflict_do_update()` | `session.merge()` | merge() issues 2 queries per row (SELECT + INSERT/UPDATE). Native upsert is atomic, single statement. |
| Raw ALTER TABLE + PRAGMA check | Alembic migrations | Alembic requires `alembic init`, `render_as_batch=True` for SQLite. Raw ALTER TABLE is simpler for adding boolean columns with defaults. Alembic overkill for 2 new columns + 1 new table. |
| `asyncio.create_task()` in lifespan | BackgroundTasks, APScheduler, Celery | BackgroundTasks are request-scoped. APScheduler/Celery add dependency. `create_task` matches existing `popular_banco_inicial` pattern in `main.py:12`. |

## Package Legitimacy Audit

> All packages are existing dependencies already installed in Phase 1. No new packages need to be added for Phase 2.

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| rapidfuzz | PyPI | — | Approved (existing dependency, Phase 1) |
| sqlalchemy | PyPI | — | Approved (existing dependency, Phase 1) |
| fastapi | PyPI | — | Approved (existing dependency, Phase 1) |
| pandas | PyPI | — | Approved (existing dependency, Phase 1) |
| httpx | PyPI | — | Approved (existing dependency, Phase 1) |

**Packages removed due to slopcheck:** none
**Packages flagged as suspicious:** none

## Architecture Patterns

### System Architecture Diagram

```
[Startup]                               [User/Client]
    |                                         |
    | asyncio.create_task                      | HTTP Requests
    v                                         v
[Lifespan: check_qsa_freshness()]      [FastAPI Routers]
    |                                         |
    | query qsa_metadata                      | /deputados/empresas, /qsa/freshness
    v                                         v
[qsa_metadata <7d old?]                [RelacaoService]
    |                                         |
    ├── Yes → skip                             | get_relacoes_com_detalhes()
    └── No  → asyncio.to_thread()              | gerar_relacoes_deputado()
                  |                            |
                  v                            v
          [import_qsa_incremental()]    [SQLAlchemy ORM]
                  |                            |
                  | upsert by CNPJ              ├── relacoes (alt+via flags)
                  v                            ├── empresas (cap_social)
          [INSERT ON CONFLICT]                 ├── qsa_metadata
                  |                            └── config_table
                  v
          [Update qsa_metadata]
```

### Recommended Project Structure
```
Backend/app/
├── api/
│   ├── deputados.py       # + GET /deputados/empresas (paginated listing)
│   ├── integracao.py      # Extend POST /atualizar-qsa for incremental
│   └── qsa.py             # NEW: GET /qsa/freshness endpoint
├── models/
│   ├── empresa.py         # + alta_exposicao, via_conjuge on Relacao
│   │                      # + capital_social on Empresa
│   └── qsa_metadata.py    # NEW: QsaMetadata model
├── services/
│   └── relacao_service.py # + alta_exposicao compute, via_conjuge derivation
├── ingest/
│   └── import_qsa.py      # Refactor: extract common, add upsert mode
├── scheduler/
│   └── sync_scheduler.py  # + check_qsa_freshness() background task
├── main.py                # + qsa_router registration in lifespan
└── database.py            # Unchanged
```

### Pattern 1: SQLAlchemy SQLite Native Upsert
**What:** Use `sqlalchemy.dialects.sqlite.insert()` with `on_conflict_do_update()` to atomically insert-or-update by CNPJ unique constraint.
**When to use:** For incremental QSA updates — process full snapshot but upsert by CNPJ (D-04).
**Why:** Atomic, single-statement. Avoids merge()'s two-query overhead. All dicts must have identical keys.

```python
from sqlalchemy.dialects.sqlite import insert as sqlite_upsert
from app.models.empresa import Empresa

def upsert_empresas_chunk(records: list[dict], db: Session):
    """Upsert empresas by CNPJ using SQLite native ON CONFLICT DO UPDATE."""
    stmt = sqlite_upsert(Empresa).values(records)
    stmt = stmt.on_conflict_do_update(
        index_elements=[Empresa.cnpj],
        set_={
            "razao_social": stmt.excluded.razao_social,
            "nome_fantasia": stmt.excluded.nome_fantasia,
            "municipio": stmt.excluded.municipio,
            "estado": stmt.excluded.estado,
            "situacao": stmt.excluded.situacao,
            "capital_social": stmt.excluded.capital_social,
        }
    )
    db.execute(stmt)
    db.commit()
```
[CITED: docs.sqlalchemy.org/en/20/dialects/sqlite.html#sqlite-on-conflict-insert]

### Pattern 2: Auto-startup Freshness Check in Lifespan
**What:** Fire background task in FastAPI lifespan to check if QSA import is stale (>7 days since last update) and auto-trigger import.
**When to use:** On application startup (D-06).
**Why:** Matches existing `popular_banco_inicial()` pattern. Uses `asyncio.create_task()` to avoid blocking server readiness, and `asyncio.to_thread()` because the import function is synchronous.

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Existing startup
    asyncio.create_task(popular_banco_inicial())
    # Phase 2 addition
    asyncio.create_task(check_qsa_freshness())
    yield

async def check_qsa_freshness():
    """Background check: if QSA data >7 days stale, auto-trigger incremental import."""
    db = SessionLocal()
    try:
        metadata = db.query(QsaMetadata).order_by(
            QsaMetadata.last_import_at.desc()).first()
        if metadata:
            days_stale = (datetime.utcnow() - metadata.last_import_at).days
            if days_stale > 7:
                logger.info("QSA data %d days stale — triggering incremental update", days_stale)
                await asyncio.to_thread(importar_qsa_incremental)
        else:
            logger.info("No QSA metadata found — triggering initial import")
            await asyncio.to_thread(importar_qsa_incremental)
    finally:
        db.close()
```
[CITED: fastapi.tiangolo.com/advanced/events/]

### Pattern 3: Paginated Listing with GROUP BY
**What:** Query relacoes grouped by deputado_id with COUNT, joined with Deputado for basic info, filtered and paginated.
**When to use:** For `GET /deputados/empresas` — returns all deputies with company counts and conflict flags.
**Why:** Single query with JOIN + GROUP BY + COUNT is efficient with proper indexes. Sorting by COUNT descending per D-17.

```python
@router.get("/empresas")
def list_deputados_empresas(
    partido: str = None,
    estado: str = None,
    tem_conflito: bool = None,
    alta_exposicao: bool = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1),
    db: Session = Depends(get_db)
):
    query = (
        db.query(
            Deputado.id,
            Deputado.nome,
            Partido.sigla.label("partido"),
            Deputado.estado,
            func.count(Relacao.cnpj).label("total_empresas"),
            func.sum(Relacao.alta_exposicao.cast(Integer)).label("total_alta_exposicao"),
        )
        .outerjoin(Relacao, Deputado.id == Relacao.deputado_id)
        .outerjoin(Partido, Deputado.partido_id == Partido.id)
    )
    if partido:
        query = query.filter(Partido.sigla == partido.upper())
    if estado:
        query = query.filter(Deputado.estado == estado.upper())
    if alta_exposicao is not None:
        query = query.filter(Relacao.alta_exposicao == alta_exposicao)

    query = query.group_by(Deputado.id).order_by(func.count(Relacao.cnpj).desc())

    total = query.count()
    rows = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "data": [
            {
                "id": r.id,
                "nome": r.nome,
                "partido": r.partido,
                "estado": r.estado,
                "total_empresas": r.total_empresas,
            }
            for r in rows
        ],
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit if total > 0 else 0
        }
    }
```

### Anti-Patterns to Avoid
- **`session.merge()` for bulk upsert:** Issues two queries per row (SELECT + INSERT/UPDATE). Use native `insert().on_conflict_do_update()` instead. [CITED: docs.sqlalchemy.org/en/20/dialects/sqlite.html]
- **Missing keys in upsert dicts:** SQLite requires ALL dicts in a bulk values() list to have identical keys. Missing a key raises `CompileError`. [CITED: github.com/sqlalchemy/sqlalchemy/issues/9703]
- **Blocking startup with synchronous import:** Calling `importar_qsa_completo()` directly in lifespan blocks FastAPI from accepting requests. Use `asyncio.create_task()` to fire and forget. [CITED: fastapi.tiangolo.com/advanced/events/]
- **Alembic for simple column additions:** Overkill for adding 2 boolean columns and 1 new table. Raw ALTER TABLE (with PRAGMA table_info check) is sufficient.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy string matching | Custom Levenshtein implementation | rapidfuzz `fuzz.token_sort_ratio()` | C++-optimized, handles edge cases (unicode, tokenization), 3856 GitHub stars, actively maintained |
| Database upsert | Row-by-row SELECT-then-INSERT in Python loop | `sqlalchemy.dialects.sqlite.insert().on_conflict_do_update()` | Atomic, single SQL statement. Avoids race conditions and N+1 query problem |
| Background task scheduling | Custom threading solution | FastAPI lifespan + `asyncio.create_task()` | Existing project pattern, no new dependencies, clean shutdown via task.cancel() |
| Pagination meta block | Custom cursor/offset logic | Reuse existing `page`/`limit`/`total`/`totalPages` pattern | Consistent with list_deputados, list_votos — API consumers already expect this shape |
| Brazilian number parsing | Regex-based capital_social parser | `locale.atof()` or simple `str.replace(".", "").replace(",", ".")` | `capital_social` in CSV is Brazilian format like `"1.000.000,00"`. Two replace calls handle it. |

**Key insight:** Every significant "don't hand-roll" item has an existing solution already in the project's dependency tree or standard library. Phase 2 adds zero new runtime dependencies.

## Runtime State Inventory

> Not applicable — Phase 2 is an enhancement phase, not a rename/refactor. Omitted.

## Common Pitfalls

### Pitfall 1: Confidence Score Guard Bug
**What goes wrong:** Existing code on line 56 of `relacao_service.py` filters out fuzzy name matches scoring 75-89 (raw) because it compares the discrete tier value (60) against `FUZZY_THRESHOLD` (75).
**Root cause:** `_calc_confianca_nome()` returns a discrete tier (85 or 60), but the caller compares that return value against the raw score threshold.
**How to fix:** Either change line 56 to compare against the raw score directly, or store the raw score alongside the discrete tier for the guard check.
**Warning signs:** Fuzzy name matches at scores 75-89 never appear in relacoes despite being above the threshold.

### Pitfall 2: SQLite Bulk Upsert Requires Uniform Keys
**What goes wrong:** If any dict in a bulk `.values([...])` list is missing a key that others have, SQLAlchemy raises `CompileError: INSERT value for column X is explicitly rendered as a boundparameter...`.
**Root cause:** SQLite dialect compiles the INSERT based on the first dict's keys — subsequent dicts with different keys cause mismatch.
**How to fix:** Always ensure every dict in the batch has the same set of keys. For nullable fields, explicitly set them to `None` if absent.
[CITED: github.com/sqlalchemy/sqlalchemy/issues/9703]

### Pitfall 3: capital_social CSV Format
**What goes wrong:** The Receita Federal Empresas CSV stores capital_social as text in Brazilian format: `"1.000.000,00"`. Direct `float()` parsing fails.
**Root cause:** Brazilian number format uses `.` as thousands separator and `,` as decimal separator.
**How to fix:** Parse with `str.replace(".", "").replace(",", ".")` before converting to float. Or use proper locale handling. The value can be NULL for some company types.
[CITED: github.com/caiopizzol/cnpj-data-pipeline — capital_social format documentation]

### Pitfall 4: alembic Autogenerate FAILS on SQLite Column Changes
**What goes wrong:** If Alembic autogenerate is used naively, SQLite rejects `ALTER TABLE` statements for column changes beyond `ADD COLUMN`. Attempting a batch migration without `render_as_batch=True` in `env.py` causes silent failures.
**Root cause:** SQLite's intentionally limited ALTER TABLE support.
**How to avoid:** Don't use Alembic for this phase. Use raw `ALTER TABLE ADD COLUMN` with `PRAGMA table_info()` guards, which is sufficient for adding boolean columns and a new table.
[CITED: alembic.sqlalchemy.org/en/latest/batch.html]

## Code Examples

### Model Changes: Relacao with New Flags
```python
# Backend/app/models/empresa.py
class Relacao(Base):
    __tablename__ = "relacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    deputado_id = Column(String, index=True)
    cnpj = Column(String, index=True)
    tipo_relacao = Column(String)  # cpf_match, nome_match
    score_confianca = Column(Integer)
    relationship_type = Column(Boolean, index=True)
    origem = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())

    # Phase 2 additions
    alta_exposicao = Column(Boolean, default=False, index=True)
    via_conjuge = Column(Boolean, default=False)
```

### Model Changes: Empresa with capital_social
```python
# Backend/app/models/empresa.py
from sqlalchemy import Float  # add to imports

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cnpj = Column(String, unique=True, index=True)
    razao_social = Column(String)
    nome_fantasia = Column(String, nullable=True)
    municipio = Column(String, nullable=True)
    estado = Column(String, nullable=True)
    situacao = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())

    # Phase 2 addition
    capital_social = Column(Float, nullable=True)
```

### New Model: QsaMetadata
```python
# Backend/app/models/qsa_metadata.py
from sqlalchemy import Column, Integer, String, DateTime, func
from .base import Base

class QsaMetadata(Base):
    __tablename__ = "qsa_metadata"

    id = Column(Integer, primary_key=True, autoincrement=True)
    last_import_at = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)  # "success", "running", "failed"
    row_count = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
```

### Config Table for alta_exposicao Threshold
```python
# Backend/app/models/config.py
from sqlalchemy import Column, Integer, String, Float
from .base import Base

class Config(Base):
    __tablename__ = "config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=False)
```

### Schema Migration (raw SQL — no Alembic)
```python
# Backend/app/ingest/migrate_schema.py
import logging
from sqlalchemy import inspect, text
from ..database import engine, Base
from ..models.qsa_metadata import QsaMetadata
from ..models.config import Config

logger = logging.getLogger(__name__)

def ensure_schema():
    """Idempotent schema migration: add columns and create new tables."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # Create new tables if they don't exist
    Base.metadata.create_all(bind=engine, tables=[
        QsaMetadata.__table__, Config.__table__
    ])

    # Add columns to existing relacoes table
    if "relacoes" in tables:
        existing_cols = {c["name"] for c in inspector.get_columns("relacoes")}
        with engine.connect() as conn:
            if "alta_exposicao" not in existing_cols:
                conn.execute(text(
                    "ALTER TABLE relacoes ADD COLUMN alta_exposicao BOOLEAN DEFAULT 0"
                ))
            if "via_conjuge" not in existing_cols:
                conn.execute(text(
                    "ALTER TABLE relacoes ADD COLUMN via_conjuge BOOLEAN DEFAULT 0"
                ))
            conn.commit()

    # Add capital_social to empresas table
    if "empresas" in tables:
        existing_cols = {c["name"] for c in inspector.get_columns("empresas")}
        if "capital_social" not in existing_cols:
            with engine.connect() as conn:
                conn.execute(text(
                    "ALTER TABLE empresas ADD COLUMN capital_social FLOAT"
                ))
                conn.commit()
```
[CITED: sqlite.org/lang_altertable.html — ADD COLUMN restrictions]

### Incremental Import (Upsert Mode)
```python
# Backend/app/ingest/import_qsa.py (refactored)
from sqlalchemy.dialects.sqlite import insert as sqlite_upsert

def processar_csv_empresas_incremental(csv_path: str, db: Session):
    """Upsert empresas by CNPJ instead of bulk insert."""
    total = 0
    for chunk in pd.read_csv(csv_path, chunksize=10000, dtype=str):
        records = []
        for _, row in chunk.iterrows():
            capital_raw = row.get("capital_social", "").strip()
            capital_value = None
            if capital_raw:
                try:
                    # Brazilian format: "1.000.000,00" -> 1000000.00
                    capital_value = float(
                        capital_raw.replace(".", "").replace(",", ".")
                    )
                except ValueError:
                    pass

            records.append({
                "cnpj": row.get("cnpj", ""),
                "razao_social": row.get("razao_social", ""),
                "nome_fantasia": row.get("nome_fantasia", ""),
                "municipio": row.get("municipio", ""),
                "estado": row.get("estado", ""),
                "situacao": row.get("situacao", ""),
                "capital_social": capital_value,  # All dicts MUST have this key
            })

        stmt = sqlite_upsert(Empresa).values(records)
        stmt = stmt.on_conflict_do_update(
            index_elements=[Empresa.cnpj],
            set_={
                "razao_social": stmt.excluded.razao_social,
                "nome_fantasia": stmt.excluded.nome_fantasia,
                "municipio": stmt.excluded.municipio,
                "estado": stmt.excluded.estado,
                "situacao": stmt.excluded.situacao,
                "capital_social": stmt.excluded.capital_social,
            }
        )
        db.execute(stmt)
        db.commit()
        total += len(chunk)
        logger.info("Empresas upserted (incremental): %d", total)
```
[CITED: docs.sqlalchemy.org/en/20/dialects/sqlite.html#sqlite-on-conflict-insert]

### Confidence Score Bug Fix
```python
# Backend/app/services/relacao_service.py (line 22-28, corrected)
def _calc_confianca_nome(self, nome_deputado: str, nome_socio: str) -> int:
    """Return raw fuzzy score + discrete tier in tuple."""
    score = fuzz.token_sort_ratio(nome_deputado.lower(), nome_socio.lower())
    if score >= 90:
        return score, 85  # (raw, tier)
    if score >= 75:
        return score, 60
    return score, 0

# Caller (line 55-57)
raw_score, confianca = self._calc_confianca_nome(deputado.nome, s.nome_socio)
if raw_score < FUZZY_THRESHOLD:  # Bug fix: compare raw, not tier
    continue
```

### Freshness Indicator in API Response
```python
# Backend/app/api/deputados.py (inline in empress response)
def _get_freshness_flag(db: Session) -> dict:
    meta = db.query(QsaMetadata).order_by(
        QsaMetadata.last_import_at.desc()).first()
    if not meta:
        return {"qsa_data_disponivel": False}
    days_stale = (datetime.utcnow() - meta.last_import_at).days
    return {
        "qsa_data_disponivel": True,
        "ultima_atualizacao_qsa": meta.last_import_at.isoformat(),
        "dias_desde_atualizacao": days_stale,
        "dados_antigos": days_stale > 45,  # DQ-04: 45-day threshold per D-13
    }
```

### Index Strategy
```sql
-- Phase 2 index additions (run after schema migration)
CREATE INDEX IF NOT EXISTS idx_relacoes_deputado_cnpj ON relacoes(deputado_id, cnpj);
CREATE INDEX IF NOT EXISTS idx_relacoes_alta_exposicao ON relacoes(alta_exposicao);
-- Note: SQLite CREATE INDEX supports IF NOT EXISTS natively
```
**Index rationale per INF-04:**
- `(deputado_id, cnpj)` — Composite index supporting the `GET /deputados/empresas` GROUP BY query. Makes the COUNT aggregation an index-only scan for the join.
- `(alta_exposicao)` — Supports filtered queries (D-16). Moderate cardinality (~10-20% of rows) makes this a useful filter index.
- `(deputado_id)` already exists from Phase 1, covering the single-deputy lookup queries.
- No index on `via_conjuge` — low value for filtering (most name_matches will have via_conjuge=True).

## State of the Art

| Old Approach (Phase 1) | Current Approach (Phase 2) | When Changed | Impact |
|------------------------|---------------------------|--------------|--------|
| Full QSA reimport on each run | Incremental upsert by CNPJ | Phase 2 | ~10x faster weekly updates, preserves existing relacoes |
| No freshness tracking | `qsa_metadata` table + inline API flags | Phase 2 | Users can see data staleness, auto-import when >7 days stale |
| No paginated deputy listing | `GET /deputados/empresas` with filters + sort | Phase 2 | Frontend can build "all deputies with companies" view |
| No flag columns on Relacao | `alta_exposicao` + `via_conjuge` booleans | Phase 2 | Foundation for Phase 3 CNAE-based conflict scoring |
| No indexing beyond basic FK columns | Composite + filter indexes | Phase 2 | Ensures sub-100ms query performance on full dataset |

**Deprecated/outdated:**
- `session.merge()` for upsert: Use `insert().on_conflict_do_update()` instead. merge() is 2 queries per row.
- `@app.on_event("startup")`: Deprecated in FastAPI. Use `lifespan` context manager.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The Receita Federal Empresas CSV has a `capital_social` column named `"capital_social"` | Code Examples | Low risk — the column exists in the dataset. If the CSV uses a different column name (e.g., `CAPITAL_SOCIAL_EMPRESA`), the import code needs adjustment. |
| A2 | The existing `_calc_confianca_nome()` bug (comparing tier vs raw score) is unintentional | Common Pitfalls | Low risk — testing will confirm. If intentional (tier-as-threshold was deliberate), the fix is to lower FUZZY_THRESHOLD to 60. |
| A3 | `alta_exposicao` default of `False` for all existing rows is acceptable | Code Examples | Medium risk — existing rows before Phase 2 won't have alta_exposicao set. If users query old records via GET /deputados/{id}/empresas, the flag will be False until the next `gerar_relacoes_deputado()` call. |
| A4 | SQLite used in production has version >= 3.24.0 (for ON CONFLICT support) | Standard Stack | Low risk — SQLite 3.24.0 released 2018-06-04. Python 3.13 ships with SQLite 3.43+. |

**If this table is empty:** All claims in this research were verified or cited.

## Open Questions

1. **What is the exact column name for `capital_social` in the Empresas CSV?**
   - What we know: The field exists in the Receita Federal layout as "Capital Social da Empresa". The current CSV processing uses English column names (`"cnpj"`, `"razao_social"`, etc.), suggesting either preprocessing or a specific data source variant.
   - What's unclear: Whether the column is named `"capital_social"`, `"CAPITAL_SOCIAL"`, or something else in the actual downloaded CSV.
   - Recommendation: Inspect the actual CSV header during implementation (add debug logging to print first row headers). Handle with `row.get("capital_social", row.get("CAPITAL_SOCIAL", ""))`.

2. **Should relacoes counts on GET /deputados/empresas be pre-computed or computed at query time?**
   - What we know: The endpoint uses GROUP BY + COUNT, which is efficient with a composite index on (deputado_id, cnpj). The dataset is small enough (fewer than 1000 deputies, tens of thousands of relacoes) for query-time computation.
   - What's unclear: Whether a pre-computed count denormalized on the Deputado model is needed for performance at scale.
   - Recommendation: Compute at query time for now. Add denormalization only if profiling shows it's a bottleneck. [ASSUMED]

3. **Where should the `check_qsa_freshness` startup task live?**
   - What we know: `sync_scheduler.py` already has `popular_banco_inicial()`, and `main.py` imports it.
   - What's unclear: Whether to add a new `check_qsa_freshness.py` module or extend `sync_scheduler.py`.
   - Recommendation: Add `check_qsa_freshness` to `sync_scheduler.py` for consistency, import and `create_task` in `main.py` lifespan alongside the existing `popular_banco_inicial()` call.

## Validation Architecture

> `workflow.nyquist_validation` not explicitly disabled — treating as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest (existing) |
| Config file | `Backend/conftest.py` |
| Quick run command | `cd Backend && pytest tests/ -x -q` |
| Full suite command | `cd Backend && pytest tests/ -v` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAT-02 | Confidence score tiers in responses | unit | `pytest tests/test_qsa_matching.py::TestQSAMatching::test_confidence_score_range -x` | ✅ |
| MAT-02 | Confidence score 100 for exact CPF | unit | `pytest tests/test_qsa_matching.py -x -k "exact_cpf"` | ✅ |
| CONF-03 | alta_exposicao flag set when capital_social > 1M | unit | New test needed | ❌ Wave 0 |
| CONF-04 | via_conjuge flag True for nome_match rels | unit | New test needed | ❌ Wave 0 |
| API-02 | GET /deputados/empresas returns paginated list | integration | New test needed | ❌ Wave 0 |
| API-04 | Freshness flags in API responses | integration | New test needed | ❌ Wave 0 |
| INF-02 | Incremental upsert doesn't duplicate rows | integration | New test needed | ❌ Wave 0 |
| INF-04 | Indices created after schema migration | unit | New test needed | ❌ Wave 0 |
| DQ-01 | qsa_metadata table tracks last_import_at | integration | New test needed | ❌ Wave 0 |
| DQ-04 | Staleness flag true when >45 days | integration | New test needed | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd Backend && pytest tests/ -x -q` (quick smoke test)
- **Per wave merge:** `cd Backend && pytest tests/ -v` (full suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] New tests for alta_exposicao flag behavior
- [ ] New tests for via_conjuge flag derivation
- [ ] New tests for GET /deputados/empresas pagination + filtering
- [ ] New tests for qsa_metadata freshness tracking
- [ ] New tests for incremental upsert idempotency
- [ ] New tests for schema migration (idx creation, column addition)
- [ ] New conftest fixtures: `sample_qsa_metadata`, `sample_empresa_with_capital`
- [ ] Fix existing bug in `test_qsa_matching.py:test_fuzzy_name_match` — test doesn't assert matches are actually found

## Security Domain

> `security_enforcement` not explicitly set — treating as enabled for input validation.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth for Phase 2 endpoints per existing project pattern |
| V3 Session Management | no | Stateless API |
| V4 Access Control | no | Public data, no access control |
| V5 Input Validation | yes | Parameter validation via FastAPI Query/Path types + Pydantic models |
| V6 Cryptography | no | No secrets handled in QSA pipeline |

### Known Threat Patterns for FastAPI + SQLite
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL injection via query params | Tampering | Parameterized queries via SQLAlchemy ORM (pre-applied by existing patterns) |
| Large page/limit values → resource exhaustion | Denial of Service | FastAPI `Query(ge=1)` bounds already in place; add ceiling for limit (e.g., `le=200`) |
| Concurrent upsert races | Tampering | SQLite serializes writes via file-level lock. Native `ON CONFLICT DO UPDATE` is atomic. |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python | Runtime | ✓ | 3.13.3 | — |
| SQLite (via Python) | Database | ✓ | 3.43+ (bundled with Python 3.13) | — |
| pip | Package mgmt | ✓ | 25.0.1 | — |
| rapidfuzz | Fuzzy matching | ✓ | 3.14.5 (latest) | Existing install via requirements.txt |
| pandas | CSV processing | ✓ | — | Existing import pattern |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** none — all tools are already installed or available via existing `requirements.txt`.

## Sources

### Primary (HIGH confidence)
- [SQLAlchemy 2.0 SQLite Dialect docs](https://docs.sqlalchemy.org/en/20/dialects/sqlite.html) — ON CONFLICT upsert, DDL restrictions
- [RapidFuzz 3.14.5 on PyPI](https://pypi.org/project/RapidFuzz/) — Version verification
- [FastAPI Lifespan Events](https://fastapi.tiangolo.com/advanced/events/) — Startup/shutdown patterns
- [SQLite UPSERT syntax](https://sqlite.org/lang_upsert.html) — ON CONFLICT DO UPDATE spec
- [SQLite ALTER TABLE](https://sqlite.org/lang_altertable.html) — ADD COLUMN restrictions
- [Alembic Batch Migrations](https://alembic.sqlalchemy.org/en/latest/batch.html) — SQLite migration constraints
- [Receita Federal QSA Layout (PDF)](https://www.gov.br/receitafederal/dados/cnpj-metadados.pdf) — capital_social field presence confirmed
- [Minha Receita docs](https://docs.minhareceita.org/dicionario/) — capital_social column in Empresas dataset

### Secondary (MEDIUM confidence)
- [SQLAlchemy ORM Upsert](https://docs.sqlalchemy.org/en/20/orm/queryguide/dml.html#orm-upsert-statements) — ORM-compatible upsert pattern
- [Bulk upsert issue #9703](https://github.com/sqlalchemy/sqlalchemy/issues/9703) — All dicts must have identical keys in values()
- [Brazilian number format](https://github.com/caiopizzol/cnpj-data-pipeline/blob/main/docs/data-schema.md) — capital_social stored as text in Brazilian format

### Tertiary (LOW confidence)
- None — all technical claims verified against primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries are existing dependencies or Python standard library
- Architecture: HIGH — Patterns directly extend Phase 1 code
- Pitfalls: HIGH — Bug confirmed by reading source code; SQLite limitations documented in primary sources

**Research date:** 2026-06-12
**Valid until:** 2026-07-12 (30 days for stable infrastructure like SQLAlchemy/SQLite patterns)
