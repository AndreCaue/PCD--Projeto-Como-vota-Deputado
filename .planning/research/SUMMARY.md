# Project Research Summary

**Project:** Fiscalização de Parlamentares (FdP) - QSA Integration  
**Domain:** Government transparency - Deputy conflict of interest detection through Receita Federal QSA data integration  
**Researched:** 2026-05-29  
**Confidence:** HIGH  

## Executive Summary

This research examines the integration of Receita Federal's QSA (Quadro de Sócios e Administradores) data into the existing Fiscalização de Parlamentares project to detect potential conflicts of interest for federal deputies. The recommended approach extends the existing FastAPI + SQLAlchemy + SQLite stack with specialized utilities for CNPJ processing and enhanced data types, maintaining the proven core technologies while adding necessary capabilities for handling Brazilian corporate data.

The system will process monthly QSA datasets (Empresas.zip and Socios.zip) to identify deputies' spouses as company partners through both exact CPF matching and fuzzy name matching, applying conflict of interest flags based on CNAE classifications and exposure levels based on capital social. Key risks include fuzzy matching inaccuracies for Brazilian names, data staleness from monthly QSA updates, and performance challenges with large datasets—all mitigated through configurable matching parameters, data freshness tracking, proper indexing, and incremental processing strategies.

## Key Findings

### Recommended Stack

The research confirms keeping the existing validated core stack while adding targeted enhancements for QSA data handling:
- **FastAPI 0.104.1**: Web framework - Already validated, high performance, excellent docs
- **SQLAlchemy 2.0.23**: ORM - Already integrated, matches existing patterns  
- **Pandas 2.2.1**: Data processing - Efficient CSV handling for large CNPJ files
- **RapidFuzz 3.9.0**: Fuzzy matching - Already selected for spouse name matching
- **SQLAlchemy-utils 0.41.1**: Enhanced SQLAlchemy types - Provides specialized column types for better data integrity
- **Optional CNPJ Processor**: Specialized library for Receita Federal CNPJ data - Improves performance over raw pandas for large datasets
- **SQLite 3.42.0**: Primary database - Already validated, suitable for current scale, zero-configuration
- **Docker 26.0.0 & Docker Compose v2.24.0**: Containerization - Consistent deployment, easy setup for ingestion scripts

### Expected Features

**Must have (table stakes):**
- Automatic QSA data ingestion - Core requirement for offline operation
- Exact CPF matching - Primary identification method for deputies
- Fuzzy name matching for spouses - Secondary identification when CPF unavailable
- Conflict of interest flags - Main value proposition - detecting potential conflicts
- High exposure flags - Identifying significant financial involvement
- API endpoints for querying results - Frontend needs to access processed data
- Data persistence - Must work 100% offline after initial ingest

**Should have (competitive):**
- Weekly automated updates - Keeps data current without manual intervention
- Dual matching strategy (CPF + fuzzy name) - Increases match rate beyond exact CPF only
- Sector-based conflict detection - More nuanced than simple black/white lists
- Exposure level classification - Helps prioritize investigation efforts
- Transparent data sourcing - Builds trust in results
- Performance optimization for large datasets - Handles millions of records efficiently

**Defer (v2+):**
- Sector-specific risk scoring - More nuanced conflict assessment
- Historical tracking of relationships - Trend analysis capabilities
- Export functionality for reports - External analysis integration
- Interactive conflict investigation UI - Enhanced user experience

### Architecture Approach

The QSA integration follows a modular extension of the existing monorepo architecture with clear separation between backend API, data ingestion layer, database, frontend UI, and optional scheduler. Data flows from scheduled ingestion of Receita Federal ZIP files into SQLite storage, then queried via REST endpoints that join deputy and socio data (by CPF) and socio to empresa data (by CNPJ), applying fuzzy matching for spouse names and calculating conflict/exposure flags. The system operates 100% offline after initial ingestion, with all processing happening locally.

**Major components:**
1. **Backend API** (FastAPI) - REST endpoints for deputy-company relationships, conflict flags, exposure metrics
2. **Data Ingestion Layer** - Processing Receita Federal ZIP files, extracting and loading into SQLite
3. **Database** (SQLite) - Storage for existing Câmara data + new QSA tables (empresas, socios)
4. **Frontend UI** (Next.js) - Displaying deputy profiles with company relationships, conflict indicators
5. **Scheduler** (Optional) - Weekly execution of ingestion scripts via cron or similar

### Critical Pitfalls

1. **Inadequate Fuzzy Matching Configuration for Spouse Names** - Using inappropriate thresholds leads to false positives/negatives. Avoid by implementing configurable thresholds, Brazilian name-specific preprocessing, component-weighted scoring, and validation against known deputy-spouse pairs. Address in Phase 1.

2. **Ignoring QSA Data Timeliness and Staleness** - Assuming data is current when it may be outdated. Avoid by tracking ingestion timestamps, implementing freshness indicators, creating staleness alerts (>45 days), and allowing users to view data vintage. Address in Phase 2.

3. **Overlooking CNPJ Format Variations and Data Quality Issues** - Failure to normalize CNPJ formats or handle malformed data causes missed matches. Avoid by implementing robust CNPJ normalization (stripping non-numeric), validating checksum digits, handling edge cases, and logging validation failures. Address in Phase 1.

4. **Inadequate Conflict of Interest Classification Logic** - Using simplistic CNAE-based rules misses sector nuances or over-flags benign relationships. Avoid by implementing contextual conflict checking (considering committee assignments), graduated conflict levels, exception handling, and regular updates based on ethics guidelines. Address in Phase 3.

5. **Performance Degradation with Dataset Growth** - Initial implementation works with sample data but becomes slow with full QSA datasets. Avoid by implementing proper database indexing, blocking strategies for fuzzy matching, approximate nearest neighbor techniques, and incremental processing. Address in Phase 2.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation - Data Ingestion and Matching
**Rationale:** Establishes core data pipeline and matching capabilities before adding complexity
**Delivers:** Functional QSA ingestion scripts, enhanced database schema for empresas/socios tables, exact CPF matching, basic API endpoints, Dockerized deployment
**Addresses:** Automatic QSA ingestion, exact CPF matching, basic deputy-company API endpoint, database schema for QSA data, Dockerfile
**Avoids:** Inadequate fuzzy matching configuration (through proper setup), overlooking CNPJ format variations (through normalization), insufficient error handling (through robust pipeline design)

### Phase 2: Enhancement - Matching Refinement and Data Quality
**Rationale:** Builds on foundation to improve matching accuracy and add data quality features
**Delivers:** Fuzzy name matching for spouses, high exposure flags, data freshness tracking, performance optimizations, weekly update capability
**Addresses:** Fuzzy spouse name matching, high exposure flag, bulk API endpoint, manual refresh endpoint, via_conjuge tracking flag
**Uses:** RapidFuzz library, SQLAlchemy-utils for enhanced types, optional CNPJ Processor
**Implements:** Data ingestion layer with incremental processing, indexed database queries
**Avoids:** Ignoring QSA data timeliness (through freshness tracking), performance degradation (through indexing and blocking strategies)

### Phase 3: Intelligence - Conflict Detection and UX
**Rationale:** Adds sophisticated conflict classification and user-facing features after data pipeline is stable
**Delivers:** Sector-based conflict detection, exposure level classification, transparent data sourcing, performance optimizations for large datasets
**Addresses:** Conflict of interest flags (CNAE-based), exposure level classification, transparent data sourcing
**Implements:** Contextual conflict checking logic, graduated confidence scoring, API response enhancements with data vintage
**Avoids:** Inadequate conflict classification logic (through contextual rules), overwhelming users with low-confidence matches (through filtering)

### Phase Ordering Rationale
- **Dependency-driven:** Phase 1 must come first as all subsequent phases depend on functional data ingestion and storage
- **Risk mitigation:** Early phases address foundational pitfalls (matching accuracy, data quality) before adding business logic
- **Value delivery:** Each phase delivers independently valuable functionality while building toward complete solution
- **Performance consideration:** Heavy processing optimizations deferred until after core functionality validated

### Research Flags
**Phases likely needing deeper research during planning:**
- **Phase 2:** Fuzzy matching optimization for Brazilian names requires linguistic research and validation with real deputy-spouse data
- **Phase 3:** Contextual conflict classification needs input from ethics experts and legal researchers to define appropriate rules

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Well-documented patterns for data ingestion, database modeling, and basic API development
- **Phase 3:** Standard API response patterns and UI component integration follow established practices

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based on existing validated stack and official documentation for additions |
| Features | HIGH | Based on clear requirements, competitor analysis, and prioritization matrix |
| Architecture | HIGH | Based on existing project architecture and established patterns |
| Pitfalls | MEDIUM | Based on multiple sources but some pitfalls may vary in real-world impact |

**Overall confidence:** HIGH

### Gaps to Address
- **Brazilian name matching specifics:** Need to validate fuzzy matching thresholds with actual deputy-spouse name pairs from public disclosures
- **CNAE conflict classification:** Requires research into which specific CNAE codes represent genuine conflicts for different deputy committee assignments
- **Performance at scale:** While scaling strategies are identified, actual performance with full QSA dataset (>5M companies) should be validated during implementation

## Sources

### Primary (HIGH confidence)
- Existing project requirements.txt and validated stack - Core technology validation
- Receita Federal CNPJ data layout documentation - Official format specifications
- SQLAlchemy 2.0 Documentation - Official ORM guidance
- RapidFuzz Documentation - Fuzzy matching library guidance

### Secondary (MEDIUM confidence)
- CNPJ Processor library documentation and performance benchmarks - Optional performance enhancement
- Receita Federal QSA Layout Documentation - Data format and update frequency
- Brazilian Corporate Governance Code - Conflict of interest principles

### Tertiary (LOW confidence)
- Netrin Blog: Consultas de CNPJ e QSA: automatize via API (2026) - Practical integration experiences
- Contabilidade.com: QSA fundamentals - Background knowledge
- Various government transparency implementations - Lessons learned (may not directly apply)

---
*Research completed: 2026-05-29*
*Ready for roadmap: yes*