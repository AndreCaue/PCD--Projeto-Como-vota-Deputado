# Requirements: Fiscalização de Parlamentares (FdP) - QSA Integration

**Defined:** 2026-05-29
**Core Value:** Transparência pública sobre a atividade parlamentar, permitindo que cidadãos fiscalizem seus representantes com base em dados oficiais e verificáveis.

## v1 Requirements

### Data Ingestion
- [ ] **ING-01**: System automatically downloads and processes Empresas.zip and Socios.zip from Receita Federal QSA dataset
- [ ] **ING-02**: System extracts and loads CNPJ data into SQLite database without intermediate disk storage
- [ ] **ING-03**: System handles ZIP file validation and error recovery during ingestion process

### Deputado-Company Matching
- [ ] **MAT-01**: System matches deputies to companies via exact CPF comparison (deputado CPF → socio CPF/CNPJ)
- [ ] **MAT-02**: System matches deputies' spouses to company partners using fuzzy name matching when CPF unavailable
- [ ] **MAT-03**: System combines exact CPF matching and fuzzy name matching in a dual strategy approach
- [ ] **MAT-04**: System validates CNPJ format and checksum digits during data processing

### Conflict Detection
- [ ] **CONF-01**: System flags companies with CNAE codes in consultoria, construção, publicidade, saúde sectors as potential conflicts
- [ ] **CONF-02**: System calculates graduated conflict confidence levels based on multiple factors (CNAE, capital, relationship type)
- [ ] **CONF-03**: System identifies high exposure relationships where capital_social > 1,000,000
- [ ] **CONF-04**: System tracks relationships found via spouse name matching (via_conjuge flag)

### API Endpoints
- [ ] **API-01**: GET /deputados/{deputado_id}/empresas returns list of companies for a specific deputy with match details
- [ ] **API-02**: GET /deputados/empresas returns paginated list of all deputies with company counts and conflict flags
- [ ] **API-03**: POST /atualizar-qsa triggers manual QSA data ingestion process
- [ ] **API-04**: API responses include data freshness indicators and match confidence scores

### Infrastructure
- [ ] **INF-01**: System provides Dockerfile and docker-compose.yml for consistent deployment
- [ ] **INF-02**: System implements incremental processing for weekly QSA updates
- [ ] **INF-03**: System maintains 100% offline operation after initial data ingestion
- [ ] **INF-04**: System creates appropriate database indices for efficient querying of large datasets

### Data Quality
- [ ] **DQ-01**: System tracks data vintage and provides freshness indicators in API responses
- [ ] **DQ-02**: System implements CNPJ normalization (stripping non-numeric characters) and validation
- [ ] **DQ-03**: System logs data quality issues and validation failures during ingestion
- [ ] **DQ-04**: System provides staleness alerts for data older than 45 days

## v2 Requirements

### Advanced Analytics
- [ ] **SECTOR-01**: Sector-specific risk scoring based on deputy committee assignments
- [ ] **HISTORY-01**: Historical tracking of deputy-company relationships for trend analysis
- [ ] **EXPORT-01**: Export functionality for reports in CSV/JSON formats
- [ ] **INVESTIGATE-01**: Interactive conflict investigation UI with detailed relationship tracing

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time API calls to Receita Federal | Would violate offline operation requirement and create dependency on external service |
| Manual file upload interface | Automatic ingestion is core to the milestone; manual upload would complicate UX |
| Machine learning prediction models | Would add complexity beyond scope of basic conflict detection |
| Mobile application native | Focus remains on web-responsive experience per existing constraints |
| OAuth/LDAP authentication systems | Email/password sufficient for initial scope; federated identity not required |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ING-01 | Phase 1 | Pending |
| ING-02 | Phase 1 | Pending |
| ING-03 | Phase 1 | Pending |
| MAT-01 | Phase 1 | Pending |
| MAT-02 | Phase 2 | Pending |
| MAT-03 | Phase 1 | Pending |
| MAT-04 | Phase 1 | Pending |
| CONF-01 | Phase 3 | Pending |
| CONF-02 | Phase 3 | Pending |
| CONF-03 | Phase 2 | Pending |
| CONF-04 | Phase 2 | Pending |
| API-01 | Phase 1 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 1 | Pending |
| API-04 | Phase 2 | Pending |
| INF-01 | Phase 1 | Pending |
| INF-02 | Phase 2 | Pending |
| INF-03 | Phase 1 | Pending |
| INF-04 | Phase 2 | Pending |
| DQ-01 | Phase 2 | Pending |
| DQ-02 | Phase 1 | Pending |
| DQ-03 | Phase 1 | Pending |
| DQ-04 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-29*
*Last updated: 2026-05-29 after initial definition*