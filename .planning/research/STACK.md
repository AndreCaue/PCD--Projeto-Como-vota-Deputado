# Technology Stack

**Project:** Fiscalização de Parlamentares (FdP) - QSA Integration
**Researched:** 2026-05-29

## Recommended Stack

### Core Framework (Existing)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| FastAPI | 0.104.1 | Web framework | Already validated, high performance, excellent docs |
| SQLAlchemy | 2.0.23 | ORM | Already integrated, matches existing patterns |
| Uvicorn | 0.24.0 | ASGI server | Production-ready, works well with FastAPI |
| Pandas | 2.2.1 | Data processing | Efficient CSV handling for large CNPJ files |
| Python-dotenv | 1.0.0 | Environment management | Secure configuration handling |
| Pydantic | 2.6.1 | Data validation | Works seamlessly with FastAPI |
| RapidFuzz | 3.9.0 | Fuzzy matching | Already selected for spouse name matching |

### New Additions for QSA Integration
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| SQLAlchemy-utils | 0.41.1 | Enhanced SQLAlchemy types | Provides specialized column types for better data integrity |
| CNPJ Processor (optional) | Latest | CNPJ data processing | Specialized library for Receita Federal CNPJ data - improves performance over raw pandas for large datasets |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| SQLite | 3.42.0 | Primary database | Already validated, suitable for current scale, zero-configuration |
| *(Future consideration: PostgreSQL)* | *(N/A)* | Production scaling | For handling full CNPJ dataset (>50M companies) |

### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Docker | 26.0.0 | Containerization | Consistent deployment, easy setup for ingestion scripts |
| Docker Compose | v2.24.0 | Multi-container orchestration | Manage backend, database, and potential future services |

## Enhanced Models Required

Based on QSA requirements from Receita Federal layout, the existing models need enhancement:

### Empresa Model Enhancements
New fields to add:
- `natureza_juridica` (Integer) - Legal nature code
- `qualificacao_responsavel` (Integer) - Responsible person qualification
- `capital_social` (Numeric) - Company capital
- `porte_empresa` (String) - Company size classification
- `ente_federativo` (String) - Government entity responsibility
- `cnpj_basico` (String, 8 chars) - For efficient joins with socio/estabelecimento

### Socio Model Enhancements
New fields to add:
- `identificador_socio` (Integer) - Partner type (PF/PJ/Estrangeiro)
- `cnpj_cpf_socio` (String) - Partner's CNPJ/CPF
- `data_entrada_socio` (Date) - Entry date into company
- `pais` (String) - Country code for foreign partners
- Fields for legal representative (when applicable):
  - `repr_legal_cpf` (String)
  - `repr_legal_nome` (String)
  - `repr_legal_qualificacao` (Integer)
- `faixa_etaria` (Integer) - Age bracket

## Installation

```bash
# Core dependencies (already in requirements.txt)
pip install fastapi uvicorn sqlalchemy pandas python-dotenv pydantic rapidfuzz>=3.9 sqlalchemy-utils

# Optional: Specialized CNPJ processing for better performance
pip install cnpj-processor
```

## Rationale for Choices

1. **Keep Existing Core Stack**: The current FastAPI + SQLAlchemy + Pandas stack is proven working for the project's existing features (deputados, votações, patrimonio). Changing core technologies would introduce unnecessary risk.

2. **SQLAlchemy-utils Addition**: Provides specialized column types (like CountryType, Enhanced types) that improve data integrity for international fields like 'pais' in socio records.

3. **CNPJ Processor (Optional)**: While not strictly required, this specialized library offers:
   - Parallel downloading and processing
   - Automatic column name standardization
   - Memory-efficient chunked processing
   - Built-in handling of CNPJ data peculiarities
   - Significant performance improvements over raw pandas for large datasets

4. **SQLite Continuation**: For the initial QSA integration focusing on federal deputies (~513 officials and their immediate associations), SQLite provides adequate performance with zero operational overhead. Migration to PostgreSQL can be considered later if processing full CNPJ dataset becomes necessary.

5. **Docker for Consistency**: Ensures the ingestion process runs identically across development and production environments, critical for reliable weekly automated updates.

## Sources

- Receita Federal CNPJ data layout documentation (official format specifications)
- Existing project requirements.txt and validated stack
- CNPJ Processor library documentation and performance benchmarks
- SQLAlchemy-utils documentation for enhanced data types