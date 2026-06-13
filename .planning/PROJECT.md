# Fiscalização de Parlamentares (FdP)

## What This Is

Visualização de votações de deputados brasileiros com dados públicos da API da Câmara dos Deputados, expandido com módulo QSA para cruzar dados de Deputados Federais com o cadastro de empresas da Receita Federal. O projeto permite aos cidadãos acompanhar como seus representantes estão votando e identificar potenciais conflitos de interesse através de dados oficiais e verificáveis.

## Core Value

Transparência pública sobre a atividade parlamentar, permitindo que cidadãos fiscalizem seus representantes com base em dados oficiais e verificáveis.

## Requirements

### Validated

- ✓ Ingestão automática dos dados CNPJ da Receita Federal — v1.0
- ✓ Cruzamento CPF exato + fuzzy nome do cônjuge — v1.0
- ✓ Endpoints FastAPI para consulta das relações deputado-empresa — v1.0
- ✓ Detecção de conflitos de interesse (CNAE) e exposição financeira (>1M) — v1.0
- ✓ Freshness tracking e indicadores de atualização dos dados — v1.0
- ✓ Dockerfile + docker-compose.yml para deploy consistente — v1.0

### Active

<!-- Current scope for next milestone -->

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->
- Integração com sistemas de voto eletrônico em tempo real — Requer infraestrutura governamental indisponível
- Análise preditiva de comportamento parlamentar — Fora do escopo de transparência básica
- Aplicativo mobile nativo — Foco inicial na experiência web responsiva
- Frontend UI para dados QSA/conflict — Não implementado no v1.0 (backend-only)

## Context

**v1.0 shipped 2026-06-13.**
- Backend: FastAPI + SQLite + SQLAlchemy — 86 tests passing
- Frontend: Next.js + TypeScript (sem UI para dados QSA)
- Módulo QSA completo: ingestão, matching, detecção de conflitos, freshness tracking
- 23/23 v1 requirements satisfied
- Tech debt: VERIFICATION.md pendente para todas as fases, Phase 3 sem VALIDATION.md, deprecações datetime.utcnow()

## Constraints

- **[Performance]**: Processamento eficiente de grandes volumes de dados CNPJ (milhões de registros) — Limita recursos de processamento em ambiente de desenvolvimento
- **[Offline]**: Funcionamento 100% offline após ingestão inicial — Evita dependência de conexão contínua com APIs externas
- **[Atualização Semanal]**: Scripts projetados para execução agendada semanal — Manter dados relativamente atuais sem sobrecarga diária
- **[Simplicidade]**: Código limpo e fácil de manter — Facilita contribuições e reduz bugs

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar SQLAlchemy como ORM | Integração com estrutura existente do projeto | ✓ Good |
| Processar arquivos ZIP diretamente | Evitar extração desnecessária em disco | ✓ Good |
| Utilizar rapidfuzz para matching difuso | Biblioteca leve e eficiente para fuzzy matching | ✓ Good |
| Estruturar em micro-services lógicos | Manter baixo acoplamento entre componentes | ✓ Good |
| Boolean relationship_type (False=CPF, True=nome_match) | Simples, queryável | ✓ Good |
| Idempotent DDL migration via PRAGMA guards | Re-executável sem erros | ✓ Good |
| Incremental upsert via on_conflict_do_update | ORM-safe, injection-free | ✓ Good |
| 3-factor scoring: capital(50) + CNAE(30) + CPF(20) | Modelo graduado simples | ✓ Good |
| Inline freshness in API responses | Sem endpoint separado | ✓ Good |

## Next Milestone Goals

v1.0 delivered the complete QSA backend. The next milestone should focus on:
- Frontend UI for QSA data, conflict flags, and freshness indicators
- VERIFICATION.md and VALIDATION.md for all phases (Nyquist compliance)
- Fix datetime.utcnow() deprecation across 6 files
- Clean up dead code (import_qsa_completo)
- Fix Frontend/api.ts fallback URL port (8000 → 3001)

---

*Last updated: 2026-06-13 after v1.0 milestone*
