# Phase 3: Intelligence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-12
**Phase:** 3-Intelligence
**Areas discussed:** Modelo de dados CNAE, CNAE de conflito, Scoring graduado, Flag + API, UX / Frontend

---

## Modelo de dados CNAE

| Option | Description | Selected |
|--------|-------------|----------|
| Coluna direta no Empresa | Adicionar cnae_principal e cnae_descricao no model Empresa | ✓ |
| Tabela separada Cnae | Tabela cnaes com codigo (PK) e descricao, FK em Empresa | |

**User's choice:** Coluna direta no Empresa
**Notes:** Prefere simplicidade — campos diretamente no model Empresa

| Option | Description | Selected |
|--------|-------------|----------|
| Ignorar secundários | Só capturar cnae_principal | |
| Guardar como texto | cnae_secundaria (Text) no Empresa, raw string | |
| Tabela separada | Tabela empresa_cnae_secundario com FK para empresa | ✓ |

**User's choice:** Tabela separada
**Notes:** Dados normalizados para permitir queries por CNAE secundário

| Option | Description | Selected |
|--------|-------------|----------|
| Descrição inline | Descrição como string no Empresa (do próprio CSV) | ✓ |
| Tabela lookup separada | Tabela cnae_lookup com codigo (PK) e descricao | |

**User's choice:** Descrição inline
**Notes:** Dados vindos do CSV da Receita — sem necessidade de lookup table extra

| Option | Description | Selected |
|--------|-------------|----------|
| Inclui na Fase 3 | Ingestão de CNAE junto com detecção de conflitos | ✓ |
| Já deveria estar pronto | Adicionar retroativamente ou ignorar | |

**User's choice:** Inclui na Fase 3
**Notes:** Atualização do import CSV (cnae_principal + tabela secundários) faz parte desta fase

---

## CNAE de conflito

| Option | Description | Selected |
|--------|-------------|----------|
| Divisão (2 dígitos) | Match pelos primeiros 2 dígitos (ex: 41-43 = construção) | |
| Classe (5 dígitos) | Match pela classe (sem dígito verificador) | ✓ |
| Código completo (7 dígitos) | Match exato pelo código completo | |

**User's choice:** Classe (5 dígitos)
**Notes:** Equilíbrio entre precisão e abrangência

| Option | Description | Selected |
|--------|-------------|----------|
| Config table (ajustável) | Config table com chave conflito_cnae_classes | |
| Fixa no código | Lista fixa como constante Python | |
| Config + fallback | Config table com fallback para lista padrão | ✓ |

**User's choice:** Config + fallback
**Notes:** Mesmo padrão de alta_exposicao_threshold — flexibilidade sem perder segurança

---

## Scoring graduado

| Option | Description | Selected |
|--------|-------------|----------|
| Todos (CNAE + capital + relação) | CNAE, capital_social, e tipo_relação | ✓ |
| CNAE + capital | Só CNAE e capital_social | |
| CNAE + relação | Só CNAE e tipo_relação | |

**User's choice:** Todos
**Notes:** Usa todos os três fatores disponíveis

| Option | Description | Selected |
|--------|-------------|----------|
| 0-100 numérico | Mesma escala de score_confiança | ✓ |
| Níveis textuais | baixo/médio/alto/crítico | |

**User's choice:** 0-100 numérico
**Notes:** Consistente com sistema existente

| Option | Description | Selected |
|--------|-------------|----------|
| Peso igual (33/33/33) | Cada fator vale 1/3 | |
| CNAE dominante (50/30/20) | CNAE pesa mais | |
| Capital dominante (50/30/20) | Capital pesa mais | ✓ |

**User's choice:** Capital dominante (50/30/20)
**Notes:** 50 capital, 30 CNAE, 20 relação

| Option | Description | Selected |
|--------|-------------|----------|
| Binário (50 ou 0) | > threshold = 50, <= = 0 | ✓ |
| Faixas graduadas | Faixas progressivas de capital | |
| Escala logarítmica | Log(capital/threshold) normalizado | |

**User's choice:** Binário (50 ou 0)
**Notes:** Consistente com alta_exposicao existente

| Option | Description | Selected |
|--------|-------------|----------|
| Binário (30 ou 0) | Setor conflito = 30, outros = 0 | ✓ |
| Pesos por setor | Cada setor com peso diferente | |

**User's choice:** Binário (30 ou 0)
**Notes:** Simples e direto

| Option | Description | Selected |
|--------|-------------|----------|
| via_conjuge = 20 | Cônjuge = mais suspeito | |
| CPF direto = 20 | Deputado no próprio CPF = mais grave | ✓ |

**User's choice:** CPF direto = 20
**Notes:** Envolvimento direto do deputado pesa mais que via cônjuge

---

## Flag + API

| Option | Description | Selected |
|--------|-------------|----------|
| Colunas no Relacao | Armazenado no banco, computado em gerar_relacoes_deputado | ✓ |
| Query-time (derivado) | Calculado a cada requisição | |

**User's choice:** Colunas no Relacao
**Notes:** Mesmo padrão de alta_exposicao

| Option | Description | Selected |
|--------|-------------|----------|
| Endpoints de empresas | Só GET /{id}/empresas e GET /empresas | |
| Todos os endpoints | List, detalhe, e relacoes | ✓ |
| List + detalhe | Só list e detalhe | |

**User's choice:** Todos os endpoints
**Notes:** Consistência máxima entre endpoints

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, verificar flag | tem_conflito = conflito_interesse True | ✓ |
| Manter + novo filtro | Manter atual + adicionar tem_conflito_interesse | |

**User's choice:** Sim, verificar flag
**Notes:** Reflete o nome do filtro corretamente agora que conflito_interesse existe

---

## UX / Frontend

| Option | Description | Selected |
|--------|-------------|----------|
| Só backend/API | Resposta inclui flags e score, frontend consome | ✓ |
| API + indicadores básicos | Badge de conflito, tooltip no frontend | |
| Página completa de conflitos | INVESTIGATE-01 (v2) | |

**User's choice:** Só backend/API
**Notes:** UX = developer experience da API. Frontend fica pra v2.

---

## the agent's Discretion

- Schema e implementação da tabela `EmpresaCnaeSecundario`
- Estratégia de migration (follow migrate_schema.py pattern)
- Lista padrão de classes CNAE no fallback
- Nomes exatos dos campos de resposta (convenção portuguesa)

## Deferred Ideas

- Interactive conflict investigation UI (INVESTIGATE-01) — v2
- Sector-specific risk scoring based on committee assignments (SECTOR-01) — v2
- Historical tracking of deputy-company relationships (HISTORY-01) — v2
- Export functionality (CSV/JSON) — Future phase
