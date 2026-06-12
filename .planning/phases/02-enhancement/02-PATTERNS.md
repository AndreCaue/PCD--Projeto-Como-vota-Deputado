# Phase 2: Enhancement - Pattern Map

**Mapped:** 2026-06-12
**Files analyzed:** 16 (9 modified, 5 new, 2 test updates)
**Analogs found:** 16 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `Backend/app/models/empresa.py` | model | CRUD | `Backend/app/models/empresa.py` (self-modify) | exact |
| `Backend/app/models/qsa_metadata.py` | model | CRUD | `Backend/app/models/votacao.py` (SyncLog) | role-match |
| `Backend/app/models/config.py` | model | CRUD | `Backend/app/models/base.py` | role-match |
| `Backend/app/models/__init__.py` | config | — | `Backend/app/models/__init__.py` (self-modify) | exact |
| `Backend/app/services/relacao_service.py` | service | CRUD | `Backend/app/services/relacao_service.py` (self-modify) | exact |
| `Backend/app/api/deputados.py` | controller | request-response | `Backend/app/api/deputados.py` (self-modify) | exact |
| `Backend/app/api/qsa.py` | controller | request-response | `Backend/app/api/lookups.py` | role-match |
| `Backend/app/api/integracao.py` | controller | request-response | `Backend/app/api/integracao.py` (self-modify) | exact |
| `Backend/app/ingest/import_qsa.py` | utility | batch | `Backend/app/ingest/import_qsa.py` (self-modify) | exact |
| `Backend/app/ingest/migrate_schema.py` | utility | batch | `Backend/app/create_db.py` | role-match |
| `Backend/app/scheduler/sync_scheduler.py` | utility | event-driven | `Backend/app/scheduler/sync_scheduler.py` (self-modify) | exact |
| `Backend/app/main.py` | config | startup | `Backend/app/main.py` (self-modify) | exact |
| `Backend/conftest.py` | test-config | — | `Backend/conftest.py` (self-modify) | exact |
| `Backend/tests/test_qsa_matching.py` | test | — | `Backend/tests/test_qsa_matching.py` (self-modify) | exact |
| `Backend/tests/test_api_deputados.py` | test | — | `Backend/tests/test_api_deputados.py` (self-modify) | exact |
| `Backend/tests/test_qsa_ingest.py` | test | — | `Backend/tests/test_qsa_ingest.py` (self-modify) | exact |

## Pattern Assignments

---

### `Backend/app/models/empresa.py` (model, CRUD) — MODIFIED

**Analog:** `Backend/app/models/empresa.py` (self)

**Imports pattern** (lines 1-2):
```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, func
from .base import Base
```

**Existing Relacao model** (lines 26-36) — add new boolean columns:
```python
class Relacao(Base):
    __tablename__ = "relacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    deputado_id = Column(String, index=True)
    cnpj = Column(String, index=True)
    tipo_relacao = Column(String) # cpf_match, nome_match
    score_confianca = Column(Integer)
    relationship_type = Column(Boolean, index=True)
    origem = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())

    # Phase 2 additions: alta_exposicao, via_conjuge
```

**Existing Empresa model** (lines 4-14) — add capital_social:
```python
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

    # Phase 2 addition: capital_social = Column(Float, nullable=True)
```

**New column pattern** (consistent project style):
```python
# Use existing import pattern. Add Float if needed:
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, func
```

---

### `Backend/app/models/qsa_metadata.py` (model, CRUD) — NEW

**Analog:** `Backend/app/models/votacao.py` (SyncLog model at lines 55-63)

**SyncLog analog** (lines 55-63) — same metadata-tracking table pattern:
```python
class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tipo = Column(String)
    status = Column(String)
    mensagem = Column(String, nullable=True)
    registros = Column(Integer, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
```

**Imports pattern to use** (same as `empresa.py` lines 1-2 + votacao.py):
```python
from sqlalchemy import Column, Integer, String, DateTime, func
from .base import Base
```

**QsaMetadata model to create** (following SyncLog pattern):
```python
class QsaMetadata(Base):
    __tablename__ = "qsa_metadata"

    id = Column(Integer, primary_key=True, autoincrement=True)
    last_import_at = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)  # "success", "running", "failed"
    row_count = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
```

---

### `Backend/app/models/config.py` (model, CRUD) — NEW

**Analog:** `Backend/app/models/base.py` (base pattern)

**Base model pattern** (lines 1):
```python
from ..database import Base
```

**Config model to create** (following existing model convention):
```python
from sqlalchemy import Column, Integer, String
from .base import Base

class Config(Base):
    __tablename__ = "config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=False)
```

---

### `Backend/app/models/__init__.py` (config) — MODIFIED

**Analog:** `Backend/app/models/__init__.py` (self, lines 1-5)

**Existing barrel export pattern** (lines 1-5):
```python
from .partido import Partido
from .deputado import Deputado
from .tse_candidato import TSECandidato
from .patrimonio import PatrimonioTSE
from .votacao import Voto, Votacao
```

**Add to exports:**
```python
from .empresa import Empresa, Socio, Relacao  # already imported in create_db.py
from .qsa_metadata import QsaMetadata
from .config import Config
```

---

### `Backend/app/services/relacao_service.py` (service, CRUD) — MODIFIED

**Analog:** `Backend/app/services/relacao_service.py` (self)

**Imports pattern** (lines 1-6):
```python
from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from ..models.deputado import Deputado
from ..models.empresa import Socio, Empresa, Relacao
import logging

logger = logging.getLogger(__name__)
```

**Confidence scoring bug fix** (lines 22-28) — return tuple (raw, tier):
```python
def _calc_confianca_nome(self, nome_deputado: str, nome_socio: str) -> tuple:
    """Return raw fuzzy score + discrete tier in tuple."""
    score = fuzz.token_sort_ratio(nome_deputado.lower(), nome_socio.lower())
    if score >= 90:
        return score, 85  # (raw, tier)
    if score >= 75:
        return score, 60
    return score, 0
```

**Caller fix** (lines 55-56) — compare raw score, not tier:
```python
raw_score, confianca = self._calc_confianca_nome(deputado.nome, s.nome_socio)
if raw_score < FUZZY_THRESHOLD:
    continue
```

**Relationship generation loop pattern** (lines 66-80) — delete existing + re-insert:
```python
self.db.query(Relacao).filter(
    Relacao.deputado_id == deputado_id).delete()

for r in relacoes_encontradas:
    new_rel = Relacao(
        deputado_id=deputado_id,
        cnpj=r["cnpj"],
        tipo_relacao=r["tipo_relacao"],
        relationship_type=r.get("relationship_type"),
        score_confianca=r["score_confianca"],
        origem="import_socios"
    )
    self.db.add(new_rel)

self.db.commit()
```

**Phase 2 additions to `gerar_relacoes_deputado()`:**
- Add `alta_exposicao` by looking up `empresa.capital_social > threshold`
- Add `via_conjuge` = True when `tipo_relacao == "nome_match"`
- Pass these into the `Relacao(...)` constructor

**Detail response pattern** (lines 83-103) — extend with new flags:
```python
def get_relacoes_com_detalhes(self, deputado_id: str):
    relacoes = self.db.query(Relacao).filter(
        Relacao.deputado_id == deputado_id).all()
    resultado = []
    for r in relacoes:
        empresa = self.db.query(Empresa).filter(
            Empresa.cnpj == r.cnpj).first()
        resultado.append({
            "id": r.id,
            "cnpj": r.cnpj,
            "tipo": r.tipo_relacao,
            "tipo_relacao": r.tipo_relacao,
            "relationship_type": r.relationship_type,
            "score": r.score_confianca,
            "score_confianca": r.score_confianca,
            "empresa": {
                "razao_social": empresa.razao_social if empresa else "Não cadastrada",
                "municipio": empresa.municipio if empresa else None
            }
            # Phase 2: add alta_exposicao, via_conjuge
        })
    return resultado
```

---

### `Backend/app/api/deputados.py` (controller, request-response) — MODIFIED

**Analog:** `Backend/app/api/deputados.py` (self)

**Imports pattern** (lines 1-8):
```python
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, Query, HTTPException
from ..database import get_db
from ..models.deputado import Deputado
from ..models.partido import Partido
from ..models.votacao import Voto, Votacao
from ..services.relacao_service import RelacaoService
```

**Router registration pattern** (line 9):
```python
router = APIRouter(prefix="/deputados", tags=["Deputados"])
```

**Pagination pattern** (lines 12-38) — reuse for GET /deputados/empresas:
```python
@router.get("")
def list_deputados(
    partido: str = None,
    estado: str = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Deputado)
    if estado:
        query = query.filter(Deputado.estado == estado.upper())
    if partido:
        query = query.join(Partido).filter(Partido.sigla == partido.upper())

    total = query.count()
    deputados = query.order_by(Deputado.nome).offset(
        (page - 1) * limit).limit(limit).all()

    return {
        "data": deputados,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit
        }
    }
```

**Second pagination pattern** (lines 77-113) — voto pagination with data transform:
```python
@router.get("/{id}/votos")
def get_votos_deputado(
    id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db)
):
    query = db.query(Voto).join(Votacao).filter(Voto.deputado_id == id)
    total = query.count()
    votos = query.order_by(Votacao.data.desc())\
        .offset((page - 1) * limit)\
        .limit(limit)\
        .all()
    data = []
    for v in votos:
        data.append({
            "id": str(v.id),
            "voto": v.voto,
            "votacaoId": v.votacao_id,
            "votacao": {
                "id": v.votacao.id,
                "descricao": v.votacao.descricao,
                "data": v.votacao.data.isoformat() if v.votacao.data else None
            }
        })
    return {
        "data": data,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit if total > 0 else 0
        }
    }
```

**New endpoint pattern** — GET /deputados/empresas (reuse list_deputados pagination + filter pattern):
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
    # Query with GROUP BY + COUNT
    from sqlalchemy import func, Integer
    query = (
        db.query(
            Deputado.id,
            Deputado.nome,
            Partido.sigla.label("partido"),
            Deputado.estado,
            func.count(Relacao.cnpj).label("total_empresas"),
        )
        .outerjoin(Relacao, Deputado.id == Relacao.deputado_id)
        .outerjoin(Partido, Deputado.partido_id == Partido.id)
    )
    # filters...
    query = query.group_by(Deputado.id).order_by(func.count(Relacao.cnpj).desc())
    total = query.count()
    rows = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "data": [...],
        "meta": {"total": total, "page": page, "limit": limit, "totalPages": ...}
    }
```

---

### `Backend/app/api/qsa.py` (controller, request-response) — NEW

**Analog:** `Backend/app/api/lookups.py` (simple read-only GET, lines 1-19)

**Lookup endpoint pattern** (lines 1-19):
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.votacao import Votacao

router = APIRouter(prefix="/lookups", tags=["Lookups"])

@router.get("/tipos-comissoes")
def get_tipos_votacao(db: Session = Depends(get_db)):
    tipos = (
        db.query(Votacao.sigla_tipo)
        .filter(Votacao.sigla_tipo != None)
        .distinct()
        .order_by(Votacao.sigla_tipo)
        .all()
    )
    return [sigla for (sigla,) in tipos]
```

**QSA freshness endpoint to create** (follow lookups pattern):
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models.qsa_metadata import QsaMetadata

router = APIRouter(prefix="/qsa", tags=["QSA"])

@router.get("/freshness")
def get_qsa_freshness(db: Session = Depends(get_db)):
    meta = db.query(QsaMetadata).order_by(
        QsaMetadata.last_import_at.desc()).first()
    if not meta:
        return {"qsa_data_disponivel": False}
    days_stale = (datetime.utcnow() - meta.last_import_at).days
    return {
        "qsa_data_disponivel": True,
        "ultima_atualizacao_qsa": meta.last_import_at.isoformat(),
        "dias_desde_atualizacao": days_stale,
        "dados_antigos": days_stale > 45,
    }
```

---

### `Backend/app/api/integracao.py` (controller, request-response) — MODIFIED

**Analog:** `Backend/app/api/integracao.py` (self)

**Imports + router pattern** (lines 1-12):
```python
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, Query, BackgroundTasks
from ..database import get_db
from ..services.integracao_service import IntegracaoService
from ..models.votacao import SyncLog
from ..ingest.import_qsa import importar_qsa_completo
from datetime import datetime

router = APIRouter(prefix="/integracao", tags=["Integração"])
qsa_router = APIRouter(tags=["QSA"])
```

**Existing QSA endpoint pattern** (lines 15-18):
```python
@qsa_router.post("/atualizar-qsa")
async def atualizar_qsa(background_tasks: BackgroundTasks):
    background_tasks.add_task(importar_qsa_completo)
    return {"message": "Importação QSA iniciada em segundo plano"}
```

**Phase 2 change:** Replace `importar_qsa_completo` with `importar_qsa_incremental` (signature change, but endpoint pattern stays the same).

---

### `Backend/app/ingest/import_qsa.py` (utility, batch) — MODIFIED

**Analog:** `Backend/app/ingest/import_qsa.py` (self)

**Imports pattern** (lines 1-9):
```python
import os
import zipfile
import tempfile
import logging
import pandas as pd
import httpx
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.empresa import Empresa, Socio

logger = logging.getLogger(__name__)
```

**Chunked CSV processing pattern** (lines 44-55) — 10k row chunks:
```python
def processar_csv_empresas(csv_path: str, db: Session):
    total = 0
    for chunk in pd.read_csv(csv_path, chunksize=10000, dtype=str):
        for _, row in chunk.iterrows():
            record = {"cnpj": row.get("cnpj", ""), "razao_social": row.get("razao_social", ""), "nome_fantasia": row.get("nome_fantasia", ""), "municipio": row.get("municipio", ""), "estado": row.get("estado", ""), "situacao": row.get("situacao", "")}
            if not validate_qsa_data(record):
                continue
            empresa = Empresa(cnpj=record["cnpj"], razao_social=record["razao_social"], nome_fantasia=record["nome_fantasia"], municipio=record["municipio"], estado=record["estado"], situacao=record["situacao"])
            db.add(empresa)
        db.commit()
        total += len(chunk)
        logger.info("Empresas processadas: %d", total)
```

**Main orchestrator pattern** (lines 94-113) — SessionLocal + temp + try/except/finally:
```python
def importar_qsa_completo():
    db = SessionLocal()
    tmp = tempfile.TemporaryDirectory()
    try:
        logger.info("Iniciando importação QSA completa...")
        zips = baixar_qsa(tmp.name)
        for nome, zip_path in zips.items():
            csvs = extrair_csvs(zip_path, tmp.name)
            for csv_path in csvs:
                if "EMPRECSV" in csv_path.upper() or "empres" in nome.lower():
                    processar_csv_empresas(csv_path, db)
                elif "SOCIOCSV" in csv_path.upper() or "soci" in nome.lower():
                    processar_csv_socios(csv_path, db)
        logger.info("Importação QSA concluída com sucesso!")
    except Exception as e:
        logger.error("Erro na importação QSA: %s", e)
        db.rollback()
    finally:
        db.close()
        tmp.cleanup()
```

**Phase 2 additions:**
- Extract shared download/extract logic into reusable functions
- Add `processar_csv_empresas_incremental()` using `sqlalchemy.dialects.sqlite.insert().on_conflict_do_update()`
- Add `importar_qsa_incremental()` function (no full re-import, just upsert)
- Parse `capital_social` from CSV Brazilian format: `str.replace(".", "").replace(",", ".")`

**Upsert pattern** (new, from RESEARCH.md lines 462-510):
```python
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
                "capital_social": capital_value,
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

---

### `Backend/app/ingest/migrate_schema.py` (utility, batch) — NEW

**Analog:** `Backend/app/create_db.py` (idempotent schema setup, lines 1-17)

**Schema creation pattern** (lines 1-17):
```python
from .database import Base, engine
# Import all models so SQLAlchemy knows them
from .models.partido import Partido
from .models.deputado import Deputado
from .models.votacao import Votacao, Voto, OrientacaoBancada, SyncLog
from .models.empresa import Empresa, Socio, Relacao
from .models.patrimonio import PatrimonioTSE
from .models.tse_candidato import TSECandidato

def init_db():
    print("Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas com sucesso!")
```

**Migration pattern** (new, from RESEARCH.md lines 416-460) — raw SQL ALTER TABLE with PRAGMA guard:
```python
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

**Index creation** (new, from RESEARCH.md lines 549-554):
```sql
-- Run after schema migration
CREATE INDEX IF NOT EXISTS idx_relacoes_deputado_cnpj ON relacoes(deputado_id, cnpj);
CREATE INDEX IF NOT EXISTS idx_relacoes_alta_exposicao ON relacoes(alta_exposicao);
```

---

### `Backend/app/scheduler/sync_scheduler.py` (utility, event-driven) — MODIFIED

**Analog:** `Backend/app/scheduler/sync_scheduler.py` (self)

**Background task pattern** (lines 1-34):
```python
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..services.integracao_service import IntegracaoService

logger = logging.getLogger(__name__)

async def popular_banco_inicial():
    db: Session = SessionLocal()
    try:
        service = IntegracaoService(db)
        # ... logic ...
    except Exception as e:
        logger.error(f"Erro na população inicial: {e}")
    finally:
        db.close()
```

**Phase 2 addition:** `check_qsa_freshness()` following same pattern:
```python
async def check_qsa_freshness():
    """Background check: if QSA data >7 days stale, auto-trigger incremental import."""
    db = SessionLocal()
    try:
        from ..models.qsa_metadata import QsaMetadata
        from ..ingest.import_qsa import importar_qsa_incremental
        metadata = db.query(QsaMetadata).order_by(
            QsaMetadata.last_import_at.desc()).first()
        if metadata:
            days_stale = (datetime.utcnow() - metadata.last_import_at).days
            if days_stale > 7:
                logger.info("QSA data %d days stale — triggering incremental update", days_stale)
                importar_qsa_incremental()  # sync; wrapped via to_thread in main.py
        else:
            logger.info("No QSA metadata found — triggering initial import")
            importar_qsa_incremental()
    except Exception as e:
        logger.error(f"Erro na verificação de frescor QSA: {e}")
    finally:
        db.close()
```

---

### `Backend/app/main.py` (config, startup) — MODIFIED

**Analog:** `Backend/app/main.py` (self)

**Lifespan + route registration pattern** (lines 1-46):
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import stats, deputados, integracao, votacoes, partidos, patrimonio, ceap, lookups
from .database import engine, Base
from contextlib import asynccontextmanager
from .scheduler.sync_scheduler import popular_banco_inicial
import asyncio


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(popular_banco_inicial())
    yield


app = FastAPI(
    title="PCD - Projeto Como Vota Deputado (Python Backend)",
    description="API para monitoramento de atividade parlamentar...",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(stats.router)
app.include_router(deputados.router)
app.include_router(integracao.router)
app.include_router(integracao.qsa_router)  # <-- note: qsa_router is on integracao module
app.include_router(votacoes.router)
app.include_router(partidos.router)
app.include_router(patrimonio.router, prefix='/api/v1')
app.include_router(ceap.router, prefix='/api/v1')
app.include_router(lookups.router, prefix='/api/v1')


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend Python (FastAPI) Rodando"}
```

**Phase 2 changes:**
- Add `from .api import qsa` to imports
- Add `from .scheduler.sync_scheduler import check_qsa_freshness` to imports
- Add `asyncio.create_task(check_qsa_freshness())` in lifespan alongside `popular_banco_inicial()`
- Add `app.include_router(qsa.router)` for the freshness endpoint
- Call `from .ingest.migrate_schema import ensure_schema; ensure_schema()` at startup in lifespan

---

### `Backend/conftest.py` (test-config) — MODIFIED

**Analog:** `Backend/conftest.py` (self)

**Test DB + fixtures pattern** (lines 1-109):
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models.empresa import Empresa, Socio, Relacao
from app.models.deputado import Deputado
from app.models.partido import Partido

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# Sample data fixtures - add for capital_social, qsa_metadata, config
```

**Phase 2 new fixtures to add** (follow existing sample_* pattern):
```python
@pytest.fixture
def sample_empresa_with_capital(db_session):
    empresa = Empresa(
        cnpj="11222333000181",
        razao_social="Empresa Exemplo Ltda",
        nome_fantasia="Exemplo",
        municipio="São Paulo",
        estado="SP",
        situacao="ATIVA",
        capital_social=2000000.00  # Alta exposição
    )
    db_session.add(empresa)
    db_session.commit()
    return empresa
```

---

### `Backend/tests/test_qsa_matching.py` (test) — MODIFIED

**Analog:** `Backend/tests/test_qsa_matching.py` (self)

**Test class pattern** (lines 1-70):
```python
import pytest
from fastapi.testclient import TestClient
from app.models.empresa import Relacao


class TestQSAMatching:
    def test_exact_cpf_match(self, client: TestClient, db_session, sample_deputado, sample_empresa, sample_socio):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        result = service.gerar_relacoes_deputado(sample_deputado.id)
        assert len(result) > 0
        match = result[0]
        assert match["tipo_relacao"] == "cpf_match"

    def test_confidence_score_range(self, db_session, sample_deputado, sample_empresa, sample_socio):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        result = service.gerar_relacoes_deputado(sample_deputado.id)
        if result:
            score = result[0].get("score_confianca", 0)
            assert 0 <= score <= 100
```

**Phase 2 test additions needed:**
- `test_alta_exposicao_flag` — verify flag True when capital_social > 1M
- `test_via_conjuge_flag` — verify flag True for nome_match rels
- `test_confidence_score_bug_fix` — verify raw score >= 75 returns tier 60 (not filtered out)

---

## Shared Patterns

### Authentication
**None required.** All Phase 2 endpoints are public, same as Phase 1.

### Database Session Management
**Source:** `Backend/app/database.py` (lines 1-20)

Apply to: All service and controller files — use `get_db` dependency injection for endpoints, `SessionLocal()` for background tasks.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..database import get_db  # for endpoints

# For background/scripts:
from ..database import SessionLocal
db = SessionLocal()
try:
    # ... work ...
    db.commit()
except Exception as e:
    db.rollback()
finally:
    db.close()
```

### Error Handling
**Source:** `Backend/app/services/integracao_service.py` (lines 50-51) and `Backend/app/ingest/import_qsa.py` (lines 108-110)

Apply to: All service and ingest files — use try/except with logging and rollback.

```python
# Service pattern:
try:
    # ... work ...
    db.commit()
except Exception as e:
    db.rollback()
    logger.error(f"Error: {e}")

# Ingest pattern:
try:
    # ... work ...
except Exception as e:
    logger.error("Error: %s", e)
    db.rollback()
finally:
    db.close()
```

### Import CSV Chunked Processing
**Source:** `Backend/app/ingest/import_qsa.py` (lines 44-55)

Apply to: All CSV processing — use pandas `chunksize=10000` for memory efficiency.

```python
for chunk in pd.read_csv(csv_path, chunksize=10000, dtype=str):
    for _, row in chunk.iterrows():
        # process each row
    db.commit()  # commit per chunk
```

### Brazilian Number Parsing
**Source:** RESEARCH.md (lines 329-333)

Apply to: `capital_social` CSV field parsing in `import_qsa.py`.

```python
capital_raw = row.get("capital_social", "").strip()
capital_value = None
if capital_raw:
    try:
        capital_value = float(capital_raw.replace(".", "").replace(",", "."))
    except ValueError:
        pass
```

### Route Registration
**Source:** `Backend/app/main.py` (lines 33-41)

Apply to: New `qsa.py` router — register with `app.include_router()`.

```python
app.include_router(qsa.router)
```

### Lifespan Background Tasks
**Source:** `Backend/app/main.py` (lines 10-13)

Apply to: Auto-startup freshness check — use `asyncio.create_task()` for fire-and-forget.

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(popular_banco_inicial())
    asyncio.create_task(check_qsa_freshness())
    yield
```

### Incremental QSA Upsert (SQLite Native)
**Source:** RESEARCH.md (lines 462-510)

Apply to: `import_qsa.py` refactoring for upsert mode.

```python
from sqlalchemy.dialects.sqlite import insert as sqlite_upsert

stmt = sqlite_upsert(Empresa).values(records)
stmt = stmt.on_conflict_do_update(
    index_elements=[Empresa.cnpj],
    set_={
        "razao_social": stmt.excluded.razao_social,
        "capital_social": stmt.excluded.capital_social,
    }
)
db.execute(stmt)
db.commit()
```

### Background Endpoint Pattern (POST with BackgroundTasks)
**Source:** `Backend/app/api/integracao.py` (lines 15-18)

Apply to: Incremental QSA trigger endpoint.

```python
@qsa_router.post("/atualizar-qsa")
async def atualizar_qsa(background_tasks: BackgroundTasks):
    background_tasks.add_task(importar_qsa_completo)
    return {"message": "Importação QSA iniciada em segundo plano"}
```

### Paginated API Response Shape
**Source:** `Backend/app/api/deputados.py` (lines 30-38)

Apply to: GET /deputados/empresas response.

```python
{
    "data": [...],
    "meta": {
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }
}
```

### New Model Fixture Pattern (Tests)
**Source:** `Backend/conftest.py` (lines 70-82)

Apply to: Test fixtures for `QsaMetadata`, `Config`, and `Empresa` with `capital_social`.

```python
@pytest.fixture
def sample_empresa_with_capital(db_session):
    empresa = Empresa(
        cnpj="11222333000181",
        razao_social="Empresa Exemplo Ltda",
        capital_social=2000000.00
    )
    db_session.add(empresa)
    db_session.commit()
    return empresa
```

### New Model Import Pattern
**Source:** `Backend/app/models/__init__.py` (lines 1-5)

Apply to: Register new `QsaMetadata` and `Config` models in the package init.

```python
from .qsa_metadata import QsaMetadata
from .config import Config
```

## No Analog Found

All files have close analogs in the existing codebase. No files require using RESEARCH.md patterns as a fallback.

## Metadata

**Analog search scope:** `Backend/app/` (models, api, services, ingest, scheduler), `Backend/tests/`, `Backend/conftest.py`
**Files scanned:** 12 existing analogs + 6 test/config files
**Pattern extraction date:** 2026-06-12
