# Feature Research

**Domain:** QSA Integration for Deputy Conflict of Interest Detection
**Researched:** 2026-05-29
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Automatic QSA data ingestion | Core requirement for offline operation | HIGH | Must process Empresas.zip and Socios.zip from Receita Federal |
| Exact CPF matching | Primary identification method for deputies | MEDIUM | Direct lookup using deputy CPF |
| Fuzzy name matching for spouses | Secondary identification when CPF unavailable | MEDIUM | Using rapidfuzz for nome da esposa matching |
| Conflict of interest flags | Main value proposition - detecting potential conflicts | MEDIUM | Based on CNAE codes indicating high-risk sectors |
| High exposure flags | Identifying significant financial involvement | LOW | Based on capital_social thresholds |
| API endpoints for querying results | Frontend needs to access processed data | MEDIUM | REST endpoints for deputy-company relationships |
| Data persistence | Must work 100% offline after initial ingest | LOW | SQLite/SQLAlchemy storage of processed QSA data |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Weekly automated updates | Keeps data current without manual intervention | MEDIUM | Scheduled jobs for Receita Federal data refresh |
| Dual matching strategy (CPF + fuzzy name) | Increases match rate beyond exact CPF only | MEDIUM | Captures deputies' spouses who may not share exact CPF |
| Sector-based conflict detection | More nuanced than simple black/white lists | MEDIUM | Using CNAE classifications to identify risky sectors |
| Exposure level classification | Helps prioritize investigation efforts | LOW | Tiered approach based on capital_social values |
| Transparent data sourcing | Builds trust in results | LOW | Clear attribution to Receita Federal as source |
| Performance optimization for large datasets | Handles millions of records efficiently | HIGH | Processing ZIP files directly without extraction |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time QSA API calls | Always current data | Violates offline requirement, rate limits, costs | Weekly batch processing with local storage |
| Manual data upload interface | Flexibility for ad-hoc updates | Complexity, error-prone, inconsistent data | Automated scheduled ingestion only |
| Advanced ML conflict prediction | More sophisticated detection | Over-engineering for transparency project | Rule-based flags with clear criteria |
| Real-time dashboard updates | Immediate feedback | Complexity, performance impact | Periodic refresh aligned with data updates |
| Multi-source data enrichment | More comprehensive analysis | Scope creep, data quality issues | Focus exclusively on QSA + existing deputy data |

## Feature Dependencies

```
Automatic QSA ingestion
    └──requires──> Database schema design
                        └──requires──> Understanding of QSA data structure
                                
Exact CPF matching
    └──requires──> Deputy CPF data availability
                        └──requires──> Existing deputy data pipeline

Fuzzy name matching
    └──requires──> Spouse name data from deputy records
                        └──requires──> rapidfuzz library integration
                        └──requires→ Exact CPF matching (fallback)

Conflict of interest flags
    └──requires→ Processed QSA data with CNAE codes
                        └──requires→ Sector risk classification definitions

API endpoints
    └──requires→ Processed and stored QSA-deputy relationships
                        └──requires→ Data ingestion completion

Weekly automated updates
    └──requires→ Reliable ingestion process
                        └──requires→ Error handling and logging
                        └──requires→ Scheduling mechanism (cron/Docker)
```

### Dependency Notes

- **[Automatic QSA ingestion] requires [Database schema design]:** Need to define empresas and socios tables before processing data
- **[Exact CPF matching] requires [Deputy CPF data availability]:** Depends on existing deputy data pipeline being functional
- **[Fuzzy name matching] requires [Spouse name data]:** Deputy records must include spouse names for matching
- **[Conflict of interest flags] requires [Processed QSA data]:** Can only apply flags after data is ingested and linked
- **[API endpoints] requires [Processed relationships]:** Endpoints need linked data to return meaningful results
- **[Weekly automated updates] requires [Reliable ingestion process]:** Must validate single-run process before automating

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [x] Database schema for empresas and socios tables — Essential for data storage
- [x] QSA ingestion scripts (Empresas.zip and Socios.zip) — Core data acquisition
- [x] Exact CPF matching between deputies and socios — Primary identification method
- [x] Basic API endpoint: GET /deputados/{deputado_id}/empresas — Fundamental access point
- [x] Conflict of interest flag based on CNAE — Main value proposition
- [x] Dockerfile for containerized deployment — Deployment consistency

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Fuzzy name matching for spouses — Increases match rate after core validation
- [ ] High exposure flag (capital_social > 1M) — Additional risk dimension
- [ ] GET /deputados/empresas endpoint — Bulk access for overview pages
- [ ] POST /atualizar-qsa endpoint — Manual trigger for data refresh
- [ ] Via_conjuge flag — Track matches found through spouse names

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Weekly automated updates via cron — Operational convenience after manual validation
- [ ] Sector-specific risk scoring — More nuanced conflict assessment
- [ ] Historical tracking of relationships — Trend analysis capabilities
- [ ] Export functionality for reports — External analysis integration
- [ ] Interactive conflict investigation UI — Enhanced user experience

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| QSA data ingestion | HIGH | HIGH | P1 |
| Exact CPF matching | HIGH | MEDIUM | P1 |
| Conflict of interest flags (CNAE-based) | HIGH | MEDIUM | P1 |
| Basic deputy-company API endpoint | HIGH | MEDIUM | P1 |
| Database schema for QSA data | HIGH | LOW | P1 |
| Fuzzy spouse name matching | MEDIUM | MEDIUM | P2 |
| High exposure flag | MEDIUM | LOW | P2 |
| Bulk deputy-company API endpoint | MEDIUM | LOW | P2 |
| Manual refresh endpoint | LOW | LOW | P2 |
| Via_conjuge tracking flag | LOW | LOW | P2 |
| Weekly automated updates | MEDIUM | MEDIUM | P3 |
| Docker-compose for orchestration | LOW | LOW | P3 |
| Advanced sector risk scoring | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

Since this is a specialized transparency tool, direct competitors are limited. Analysis based on similar public accountability platforms:

| Feature | Transparency Brasil | Congresso em Foco | Our Approach |
|---------|---------------------|-------------------|--------------|
| Deputy asset declarations | Basic asset listing | Detailed asset tracking | QSA-based business relationship detection |
| Conflict of interest detection | Manual reporting | Limited to public offices | Automated QSA + CNAE analysis |
| Data freshness | Quarterly updates | Monthly updates | Weekly automated QSA refresh |
| Matching methodology | Exact name/CPF only | Exact matching only | Dual CPF + fuzzy spouse matching |
| Offline capability | Requires live API | Requires live API | 100% offline after initial ingest |
| Open data sources | Mixed sources | Primarily Câmara data | Exclusively Receita Federal QSA |
| Technical transparency | Limited docs | Some documentation | Clear schema, flags, and logic |

## Sources

- Receita Federal QSA dataset structure documentation
- RapidFuzz library for fuzzy string matching
- Existing deputy data pipeline from Proyecto FdP
- Conflict of interest detection best practices from government transparency initiatives
- Analysis of QSA data fields: cnpj, razao_social, data_entrada, qualificacao_socio, capital_social, cnae_principal, cnae_descricao
- Docker containerization patterns for data processing applications