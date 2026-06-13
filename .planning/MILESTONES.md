# Milestones

## ✅ v1.0 — Integração com QSA da Receita Federal (SHIPPED 2026-06-13)

**Goal:** Implementar um módulo completo para cruzar dados de Deputados Federais com o QSA da Receita Federal (100% offline), incluindo ingestão automática, cruzamento por CPF e nome do cônjuge, endpoints API e infraestrutura Docker.

**Delivered:**
- Ingestão automática dos dados CNPJ da Receita Federal (Empresas.zip e Socios.zip)
- Criação de tabelas empresas e socios com índices adequados
- Cruzamento por CPF do deputado (exato) e por nome da esposa (fuzzy) usando rapidfuzz
- Endpoints FastAPI: GET /deputados/{deputado_id}/empresas, GET /deputados/empresas, POST /atualizar-qsa, GET /qsa/freshness
- Flags: conflito_interesse (CNAE-based), alta_exposicao (>1M), via_conjuge, score_conflito (50/30/20)
- Estrutura completa de pastas, Models do SQLAlchemy, Routers, Scripts de ingestão
- Dockerfile + docker-compose.yml

**Stats:** 3 phases, 11 plans, 23 requirements satisfied, 86 tests passing

**Accomplishments:**
1. Created complete QSA data ingestion pipeline (Empresas.zip/Socios.zip download, CSV processing, schema migration)
2. Implemented dual-strategy deputy-company matching (exact CPF + rapidfuzz fuzzy spouse name)
3. Built graduated conflict of interest detection with 50/30/20 scoring (capital/CNAE/relationship type)
4. Exposed 4 API endpoints with pagination, filtering, inline freshness, and conflict flags
5. Achieved 86/86 tests passing across all 3 phases with zero regressions
6. All 23 v1 requirements satisfied

**Known deferred items at close:** 0 (all gaps closed prior to archival)

**Archived:** milestones/v1.0-ROADMAP.md, milestones/v1.0-REQUIREMENTS.md
**Tag:** v1.0
