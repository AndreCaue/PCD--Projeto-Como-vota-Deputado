# Architecture Patterns

**Domain:** QSA Integration for Conflict of Interest Analysis  
**Researched:** 2026-05-29  

## Recommended Architecture

The QSA integration follows a modular extension of the existing monorepo architecture, maintaining clear separation between backend and frontend while adding new data processing and storage components for Receita Federal data.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Backend API** (FastAPI) | REST endpoints for deputy-company relationships, conflict flags, exposure metrics | Frontend, Database, Ingestion Scripts |
| **Data Ingestion Layer** | Processing Receita Federal ZIP files (Empresas.zip, Socios.zip), extracting and loading into SQLite | Receita Federal (periodic), Database |
| **Database** (SQLite) | Storage for existing Câmara data (deputados, votações, partidos, patrimônio) + new QSA tables (empresas, socios) | Backend API, Ingestion Layer |
| **Frontend UI** (Next.js) | Displaying deputy profiles with company relationships, conflict indicators, search/filter capabilities | Backend API |
| **Scheduler** (Optional) | Weekly execution of ingestion scripts via cron or similar | Ingestion Layer, System |

### Data Flow

1. **Initial Setup & Weekly Updates:**
   - Scheduler triggers ingestion scripts (or manual execution via POST /atualizar-qsa)
   - Ingestion scripts download latest Empresas.zip and Socios.zip from Receita Federal (if online) or process local files
   - Extract and process CSV data from ZIP files without unnecessary disk extraction
   - Load processed data into SQLite tables: `empresas` and `socios`
   - Create/update indexes for efficient querying (CPF, name, CNAE)

2. **Runtime Query Flow:**
   - Frontend requests deputy data via existing endpoints (deputados, votações)
   - Frontend requests company relationships via new endpoints:
     - GET /deputados/{deputado_id}/empresas
     - GET /deputados/empresas (with pagination/filtering)
   - Backend queries SQLite JOINs between deputies and socios tables (by CPF) and socios to empresas (by CNPJ)
   - Applies fuzzy matching for spouse names using rapidfuzz
   - Calculates flags: conflito_interesse (based on CNAE), alta_exposicao (capital_social > 1M), via_conjuge
   - Returns structured JSON with company details and flags

3. **Offline Operation:**
   - After initial ingestion, all data resides in SQLite
   - No external API calls required during runtime
   - Frontend and backend operate 100% offline using local database

## Patterns to Follow

### Pattern 1: Modular Data Ingestion
**What:** Separate ingestion scripts that handle downloading, extracting, parsing, and loading Receita Federal data  
**When:** During initial setup and weekly updates  
**Example:**
```python
# ingest/qsa_processor.py
def process_empresas_zip(zip_path: str) -> List[Dict]:
    # Process Empresas.csv from ZIP without extracting to disk
    with zipfile.ZipFile(zip_path) as zf:
        with zf.open('Empresas.csv') as csvfile:
            # Parse CSV with pandas or csv module
            pass

def process_socios_zip(zip_path: str) -> List[Dict]:
    # Process Socios.csv from ZIP
    pass

def load_to_database(empresas: List[Dict], socios: List[Dict]):
    # Use SQLAlchemy to insert/update records
    pass
```

### Pattern 2: Extension of Existing Models
**What:** Following existing SQLAlchemy model patterns for new QSA entities  
**When:** Defining database schema for empresas and socios  
**Example:**
```python
# Backend/app/models/qsa.py
from sqlalchemy import Column, Integer, String, Float, Date, Boolean, Index
from app.models.base import Base

class Empresa(Base):
    __tablename__ = 'empresas'
    
    id = Column(Integer, primary_key=True, index=True)
    cnpj = Column(String(14), unique=True, index=True, nullable=False)
    razao_social = Column(String(255), nullable=False, index=True)
    data_entrada = Column(Date)
    qualificacao_socio = Column(String(100))
    capital_social = Column(Float)
    cnae_principal = Column(String(10))
    cnae_descricao = Column(String(255))
    
    # Indexes for frequent queries
    __table_args__ = (
        Index('idx_empresas_cnae', 'cnae_principal'),
        Index('idx_empresas_capital', 'capital_social'),
    )

class Socio(Base):
    __tablename__ = 'socios'
    
    id = Column(Integer, primary_key=True, index=True)
    cnpj = Column(String(14), ForeignKey('empresas.cnpj'), index=True)
    cpf_socio = Column(String(11), index=True)  # For deputy matching
    nome_socio = Column(String(255), index=True)
    qualificacao = Column(String(100))
    data_entrada = Column(Date)
    
    # Relationship
    empresa = relationship("Empresa", back_populates="socios")
    
    __table_args__ = (
        Index('idx_socios_cpf', 'cpf_socio'),
        Index('idx_socios_nome', 'nome_socio'),
    )
```

### Pattern 3: Consistent API Response Structure
**What:** Following existing API patterns for new endpoints  
**When:** Creating FastAPI routers for QSA endpoints  
**Example:**
```python
# Backend/app/api/qsa.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.services.qsa_service import get_deputado_empresas
from app.database import get_db

router = APIRouter(prefix="/deputados", tags=["deputados-empresas"])

@router.get("/{deputado_id}/empresas")
def get_deputado_empresas_endpoint(
    deputado_id: int,
    db: Session = Depends(get_db)
):
    empresas = get_deputado_empresas(db, deputado_id)
    if not empresas:
        raise HTTPException(status_code=404, detail="Deputado not found or no companies")
    return {
        "deputado_id": deputado_id,
        "empresas": empresas,
        "total": len(empresas)
    }

@router.get("/empresas")
def list_all_deputado_empresas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    # Implementation for listing all deputies with company counts
    pass
```

### Pattern 4: Fuzzy Matching for Spouse Names
**What:** Using rapidfuzz for approximate matching of spouse names  
**When:** Matching deputy spouse names against socio names in QSA data  
**Example:**
```python
# Backend/app/services/qsa_service.py
from rapidfuzz import fuzz, process
from typing import List, Tuple

def find_spouse_matches(deputy_name: str, socio_names: List[str], threshold: int = 80) -> List[Tuple[str, int]]:
    """
    Find socio names that likely match the deputy's spouse name
    Returns list of (matched_name, score) tuples above threshold
    """
    # Assuming deputy_name format: "First Last" and we want to match against spouse
    # In practice, would need to extract spouse name from deputy data or use partner registry
    # For now, matching against full name as placeholder
    matches = process.extract(deputy_name, socio_names, scorer=fuzz.WRatio, limit=5)
    return [match for match in matches if match[1] >= threshold]
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Tight Coupling Between Ingestion and API
**What:** Having ingestion scripts directly call API endpoints or share database sessions improperly  
**Why bad:** Creates dependency cycles, makes testing difficult, risks data corruption during ingestion  
**Instead:** Keep ingestion completely separate - it only writes to database. API only reads. Use separate database connections or transactions.

### Anti-Pattern 2: Extracting ZIP Files to Disk Unnecessarily
**What:** Unzipping large Receita Federal files to temporary directories before processing  
**Why bad:** Wastes disk I/O and space, especially problematic given millions of records  
**Instead:** Process ZIP files in-memory using zipfile module to stream CSV content directly.

### Anti-Pattern 3: Blocking API Requests During Ingestion
**What:** Long-running ingestion processes that lock database tables or make API unresponsive  
**Why bad:** Degrades user experience, appears as system downtime  
**Instead:** Use database transactions with appropriate isolation levels, or run ingestion in background process separate from API server.

### Anti-Pattern 4: Over-Fetching Data in API Responses
**What:** Returning entire empresa and socio records when only specific fields are needed  
**Why bad:** Wastes bandwidth, slows frontend rendering  
**Instead:** Select only required fields in SQL queries: cnpj, razao_social, data_entrada, qualificacao_socio, capital_social, cnae_principal, cnae_descricao, plus calculated flags.

## Scalability Considerations

| Concern | At 1,000 Deputados | At 10,000 Deputados | At 100,000+ Deputados (Future) |
|---------|-------------------|---------------------|--------------------------------|
| **Database Size** | ~50MB for QSA tables | ~500MB for QSA tables | ~5GB+ for QSA tables - Consider partitioning or migration to PostgreSQL |
| **Query Performance** | <100ms for deputy-company lookup | 100-500ms with proper indexes | May require read replicas or caching layer |
| **Ingestion Time** | 2-5 minutes for ZIP processing | 15-30 minutes | May need incremental updates or distributed processing |
| **Memory Usage** | Minimal during ingest (<500MB) | Moderate during ingest (1-2GB) | High during ingest - Consider streaming processing |
| **Frontend Payload** | Small company lists per deputy | Larger lists but still manageable | May require virtualization or server-side filtering |

### Scaling Strategies:
1. **Database:** Monitor SQLite performance; if write-heavy ingestion becomes bottleneck, consider WAL mode or migration to PostgreSQL for concurrent read/write
2. **Ingestion:** Implement incremental updates (only process changed records) using file timestamps or checksums
3. **Caching:** Cache frequently accessed deputy-company relationships in Redis or similar
4. **Frontend:** Implement pagination and infinite scrolling for company lists; debounce search inputs
5. **Deployment:** Use Docker Compose to scale ingestion worker separately from API server if needed

## Sources

- PROJECT.md (existing architecture and requirements)
- SQLAlchemy 2.0 Documentation (official)
- RapidFuzz Documentation (github.com/rapidfuzz/RapidFuzz)
- Receita Federal QSA Layout Documentation (receita.economia.gov.br)
- FastAPI Best Practices (fastapi.tiangolo.com)
- SQLite Performance Optimization (sqlite.org/performance.html)