---
phase: 03-intelligence
phase_name: Intelligence
milestone: v1.0
validation_date: "2026-06-15"
status: VALIDATED
---

# Phase 3: Intelligence — Validation

## Validation Scope

Each deputy-company relationship receives a graduated conflict score based on three objective factors: capital exposure (50pts), CNAE class conflict (30pts), and CPF match (20pts). CNAE conflict flags identify potential conflicts of interest in high-risk sectors (construction, consulting, publicity, social organizations). The scoring system gives citizens a transparent, graduated view of relationship risk.

## Requirements Traceability Matrix

| REQ-ID | Description | Status | Validation Evidence | Automated Test | Validated |
|--------|-------------|--------|---------------------|----------------|-----------|
| CONF-01 | CNAE conflict flagging (consultoria, construção, etc.) | ✅ | UAT test 1/8: conflito_interesse flag present in API responses. CNAE conflict classes seeded in Config: 41204 (construção), 70204 (consultoria), 73190 (publicidade), 86101 (atividades de organizações associativas). | Conflict detection integration tests | ✅ |
| CONF-02 | Graduated conflict scoring (50/30/20 weighting) | ✅ | UAT tests 5,6,7: Score breakdown correct for each factor — capital (50pts) via alta_exposicao, CNAE (30pts) via conflito_interesse, CPF (20pts) via relationship_type=False. Max score 100. | Scoring computation tests | ✅ |

## Validation Evidence

**User-facing validation:** A citizen can assess deputy-company relationships through:
- A conflict score (score_conflito) from 0-100 that quantifies relationship risk (CONF-02)
- Capital exposure contribution: up to 50 points when alta_exposicao is true (capital > R$1M)
- CNAE conflict contribution: up to 30 points when the company's CNAE class matches a high-risk sector (construction, consulting, publicity, social organizations)
- CPF match contribution: up to 20 points when the deputy is a direct partner (CPF match)
- Clear conflito_interesse flag indicating CNAE-based conflict of interest (CONF-01)

**Automated test evidence:** Full test suite passes (86+ tests). Key test areas cover conflict detection scoring, CNAE matching, and high exposure computation. Integration tests confirm conflito_interesse and score_conflito appear correctly in GET /deputados/{id}/empresas responses.

**UAT evidence:** Phase 3 UAT: 8/8 tests passing. All scoring factors verified independently:
- Test 1: conflito_interesse flag present and correct
- Test 5: score_conflito computed via 50/30/20 weighting
- Test 6: Capital factor (50pts) contributes correctly
- Test 7: CNAE factor (30pts) contributes correctly
- Test 8: CPF factor (20pts) contributes correctly

## Known Limitations

1. **No Summary frontmatter:** All 4 Phase 3 SUMMARY files lack `requirements-completed` YAML frontmatter — cannot auto-verify requirement coverage from SUMMARYs.
2. **No formal requirements traceability in SUMMARY frontmatter:** 03-SUMMARY.md files don't reference CONF-01 or CONF-02 in YAML frontmatter.
3. **No UI for scores:** Conflict scores are only accessible via API — frontend visualization is implemented in v1.1 (Phase 5/6).
4. **CNAE conflict classes are static (4 codes):** New conflict classes require backend Config table updates — no mechanism exists for dynamic discovery.

## Validation Conclusion

**Both requirements fully validated.** The conflict scoring system is verified correct across all three factors (capital, CNAE, CPF) with the graduated 50/30/20 weighting producing scores from 0-100. UAT confirms each factor independently contributes the correct amount. The system provides citizens with objective, data-driven conflict of interest indicators based on public Receita Federal data.
