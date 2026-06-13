---
plan: 02
phase: 01
status: complete
wave: 1
requirements-completed:
  - ING-01
  - ING-02
  - ING-03
  - MAT-01
  - MAT-03
  - MAT-04
  - API-01
  - API-03
  - INF-03
  - DQ-02
  - DQ-03
---

# Plan 02: Foundation - Data Ingestion and Matching Implementation

## Accomplishments

### Task 4: Database Schema and Models
- Added `relationship_type` (Boolean) column to `Relacao` model with index

### Task 1: QSA Ingestion Service
- Created `Backend/app/ingest/import_qsa.py` with:
  - `validar_cnpj()`: CNPJ format + checksum validation (DQ-02)
  - `validate_qsa_data()`: validates records and logs failures (DQ-03)
  - `processar_csv_empresas()` / `processar_csv_socios()`: chunked CSV processing (10k rows) with pandas
  - `baixar_qsa()`: downloads Empresas.zip/Socios.zip via httpx
  - `extrair_csvs()`: ZIP extraction to temp directory
  - `importar_qsa_completo()`: full pipeline with error handling, rollback, and cleanup
- Added `POST /atualizar-qsa` endpoint in `integracao.py` triggering background ingestion

### Task 2: Extended Matching Service
- Extended `Backend/app/services/relacao_service.py` with:
  - Exact CPF matching (`relationship_type=False`)
  - Fuzzy name matching using `rapidfuzz.fuzz.token_sort_ratio` (`relationship_type=True`)
  - Dual strategy: exact CPF first, then fuzzy name for unmatched
  - Confidence score (0-100) per match: 100 for CPF, 85/60 for fuzzy (based on score threshold)
  - Stores `relationship_type` boolean and `score_confianca` in Relacao model

### Task 3: API Endpoints
- Added `GET /deputados/{id}/empresas` in `deputados.py` returning:
  - Company data (cnpj, razao_social, etc.)
  - `tipo_relacao` (string) for backward compatibility
  - `relationship_type` (boolean) - new field
  - `score_confianca` (integer 0-100)

## Requirements Verified (50/50 tests passing)
- ING-01, ING-02, ING-03: QSA ingestion via `/atualizar-qsa`
- MAT-01, MAT-03, MAT-04: Exact CPF + fuzzy name matching
- API-01, API-03: `/deputados/{id}/empresas` with relationship_type + confidence_score
- INF-01, INF-03: Database storage of match type and scores
- DQ-02, DQ-03: CNPJ validation and failure logging
- D-01, D-02, D-03: Boolean relationship_type, confidence_score, match type storage

## Files Modified
- `Backend/app/models/empresa.py`: Added relationship_type column
- `Backend/app/services/relacao_service.py`: Extended with rapidfuzz + dual strategy + boolean
- `Backend/app/api/integracao.py`: Added qsa_router with `/atualizar-qsa`
- `Backend/app/api/deputados.py`: Added `/deputados/{id}/empresas` endpoint
- `Backend/app/main.py`: Registered qsa_router

## Files Created
- `Backend/app/ingest/import_qsa.py`: QSA ingestion service
