# Pitfalls Research

**Domain:** Government transparency - QSA integration for conflict of interest detection  
**Researched:** 2026-05-29  
**Confidence:** MEDIUM  

## Critical Pitfalls

### Pitfall 1: Inadequate Fuzzy Matching Configuration for Spouse Names

**What goes wrong:**
Using default or inappropriate fuzzy matching thresholds leads to either excessive false positives (matching unrelated people with similar names) or false negatives (missing actual spouse matches), resulting in incorrect conflict of interest flags or missed detections.

**Why it happens:**
Developers often use generic fuzzy matching libraries (like rapidfuzz) without tuning parameters for Brazilian naming conventions, which include specific patterns like compound names, maternal/paternal surnames, and common name variations.

**How to avoid:**
1. Implement configurable fuzzy matching thresholds with separate settings for exact vs fuzzy matches
2. Use Brazilian name-specific preprocessing (standardize name order, handle common abbreviations like "José" vs "Jose")
3. Implement a scoring system that weights different name components (first name, last name, maternal name)
4. Validate matches against known deputy-spouse pairs from public disclosures

**Warning signs:**
- Very high match rates (>30%) suggesting over-matching
- Very low match rates (<1%) suggesting under-matching  
- Matches that ignore common Brazilian name variations (e.g., "Carlos" matching only to "Carlos" but not "Carlinhos")

**Phase to address:** Phase 1 - Data ingestion and matching foundation

### Pitfall 2: Ignoring QSA Data Timeliness and Staleness

**What goes wrong:**
Assuming QSA data is current when it may be weeks or months outdated, leading to missed recent business associations or false positives from resolved conflicts.

**Why it happens:**
The Receita Federal QSA dataset is updated monthly, but developers often treat it as real-time or fail to implement proper version tracking and staleness detection mechanisms.

**How to avoid:**
1. Track ingestion timestamps for all QSA datasets
2. Implement data freshness indicators in API responses
3. Create alerts when data exceeds acceptable staleness thresholds (e.g., >45 days)
4. Allow users to view data vintage when examining conflict reports

**Warning signs:**
- Conflict reports showing companies that were recently sold or transferred
- Missing recently formed companies that should appear in spouse matches
- Inconsistent matching results over time without apparent data changes

**Phase to address:** Phase 2 - Data quality and freshness monitoring

### Pitfall 3: Overlooking CNPJ Format Variations and Data Quality Issues

**What goes wrong:**
Failure to properly normalize CNPJ formats (handling punctuation, leading zeros) or dealing with malformed CNPJ data in either dataset, causing missed matches.

**Why it happens:**
CNPJs can appear with or without formatting (dots, slash, hyphen), and data entry errors occur in both deputy asset disclosures and Receita Federal datasets. Developers often assume clean, standardized input.

**How to avoid:**
1. Implement robust CNPJ normalization that strips all non-numeric characters
2. Validate CNPJ checksum digits to catch data entry errors
3. Handle edge cases like all-zero CNPJs or excessively long/short inputs
4. Log and monitor CNPJ validation failures for data quality tracking

**Warning signs:**
- Systematic failure to match known deputy-owned businesses
- High rates of CNPJ validation errors during ingestion
- Matches that succeed only with specific formatting variations

**Phase to address:** Phase 1 - Data ingestion and matching foundation

### Pitfall 4: Inadequate Conflict of Interest Classification Logic

**What goes wrong:**
Using simplistic or outdated CNAE-based rules to classify conflicts of interest, missing sector-specific nuances or over-flagging benign relationships.

**Why it happens:**
Conflict of interest determination requires nuanced understanding of both governmental functions and business sectors. Hardcoding CNAE lists fails to capture contextual appropriateness (e.g., a deputy on agriculture committee owning a farm may be appropriate, but owning a construction firm may not be).

**How to avoid:**
1. Implement contextual conflict checking that considers deputy committee assignments
2. Create graduated conflict levels (potential, likely, confirmed) based on multiple factors
3. Allow for exception handling and manual review of borderline cases
4. Regularly update conflict criteria based on ethics board guidelines and legal precedent

**Warning signs:**
- Similar business interests flagged inconsistently across deputies with similar committee roles
- High volume of low-risk conflicts overwhelming meaningful alerts
- Missing obvious conflicts that should be caught by basic sector analysis

**Phase to address:** Phase 3 - Conflict detection and classification refinement

### Pitfall 5: Performance Degradation with Dataset Growth

**What goes wrong:**
Initial implementation works well with sample data but becomes prohibitively slow as QSA datasets grow to full size (millions of companies and socios).

**Why it happens:**
Developers test with small subsets or fail to implement proper indexing, join optimization, or batch processing strategies for large-scale fuzzy matching operations.

**How to avoid:**
1. Implement proper database indexing on normalized CNPJ and name fields
2. Use blocking strategies to reduce fuzzy matching search space (e.g., by first letter, name length)
3. Consider approximate nearest neighbor techniques for large-scale name matching
4. Implement incremental processing to avoid reprocessing unchanged data

**Warning signs:**
- Query response times increasing non-linearly with data size
- Ingestion processes taking excessively long (>24 hours for weekly updates)
- Database connection pool exhaustion during matching operations

**Phase to address:** Phase 2 - Performance optimization and scaling

### Pitfall 6: Insufficient Error Handling for External Data Source Issues

**What goes wrong:**
Failure to gracefully handle Receita Federal data format changes, temporary service outages, or data corruption, leading to silent failures or corrupted local datasets.

**Why it happens:**
Assuming government data sources are stable and unchanging, or implementing brittle parsing that breaks with minor format variations.

**How to avoid:**
1. Implement schema validation for incoming QSA data
2. Create fallback mechanisms to use last known good data when ingestion fails
3. Monitor and alert on data volume anomalies (sudden drops/increases)
4. Maintain detailed ingestion logs with checksums for change detection

**Warning signs:**
- Sudden drops in matched conflicts without corresponding deputy changes
- Ingestion processes failing silently without alerts
- Data quality metrics degrading over time without explanation

**Phase to address:** Phase 1 - Robust data ingestion pipeline

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using string similarity without semantic name understanding | Quick implementation | Poor match quality requiring later rewrite | Never for production matching |
| Hardcoding CNAE conflict lists | Simple initial deployment | Requires code updates for regulation changes | Only for proof-of-concept |
| Skipping CNPJ validation | Faster ingestion | Increased false matches from data errors | Never - data integrity critical |
| In-memory matching for all datasets | Simpler architecture | Doesn't scale beyond small datasets | Only for initial testing (<10k records) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Receita Federal QSA data | Assuming consistent monthly format | Implement format version detection and adaptive parsing |
| Deputy asset disclosure data | Ignoring variations in spouse name formatting | Normalize names using Brazilian onomastic rules |
| Internal deputy/votacao data | Forgetting to handle deputy ID changes over time | Implement deputy entity resolution with historical tracking |
| API consumers | Not providing data freshness indicators | Include ingestion timestamps and data version in all responses |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Sequential fuzzy matching | Response time grows O(n²) with dataset size | Use blocking/indexing to reduce comparison space | >50k records |
| Full table scans for name matching | High CPU usage, slow queries | Index on preprocessed name fields (soundex, n-grams) | >100k records |
| Re-processing unchanged data weekly | Ingestion time increases linearly with retention | Implement incremental processing with checksums | After 4-5 ingestions |
| Unbounded result sets | Memory exhaustion, timeouts | Implement pagination and reasonable limits | >1k matches per query |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing raw deputy asset data | Privacy violations, potential misuse | Implement proper access controls and data minimization |
| Storing uncleaned CNPJ data | Injection risks if used in OS commands | Validate and sanitize all CNPJ inputs |
| Inadequate audit trails | Inability to trace conflict determination logic | Log matching decisions with scores and reasoning |
| Real-time matching without rate limiting | Potential for abuse/scraping | Implement API rate limiting and query complexity limits |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Overwhelming users with low-conflict matches | Alert fatigue, ignoring real conflicts | Implement confidence scoring and filtering by conflict level |
| Poor explanation of match reasoning | Users unable to verify or trust results | Show match details: names used, score, components matched |
| No way to dispute or correct false matches | Persistent errors in conflict reporting | Provide mechanism for users to flag and correct matches |
| Confusing conflict terminology | Misunderstanding of risk levels | Use clear language: "Potential", "Likely", "Confirmed" conflicts with tooltips |

## "Looks Done But Isn't" Checklist

- [ ] CNPJ normalization: Verify all CNPJs stored as digits-only with proper validation
- [ ] Name matching: Test with Brazilian name variants (compound names, common nicknames)
- [ ] Conflict classification: Verify logic considers deputy committee assignments
- [ ] Data freshness: Confirm ingestion timestamps are tracked and exposed
- [ ] Performance: Test matching performance with full dataset sizes (>1M records)
- [ ] Error handling: Validate graceful degradation when QSA data is unavailable
- [ ] Security: Ensure proper authorization for accessing deputy financial relationships
- [ ] Audit trail: Confirm matching decisions are logged with sufficient detail

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Poor matching quality | HIGH | 1. Analyze false positives/negatives<br>2. Tune matching parameters<br>3. Implement improved name preprocessing<br>4. Re-run matching with updated logic |
| Stale data issues | MEDIUM | 1. Implement data version tracking<br>2. Add staleness alerts<br>3. Allow manual refresh triggers<br>4. Gradually update dependent calculations |
| Performance degradation | HIGH | 1. Profile matching bottlenecks<br>2. Add required database indexes<br>3. Implement blocking strategies<br>4. Consider approximate matching for first pass |
| Incorrect conflict classification | MEDIUM | 1. Review classification logic with ethics experts<br>2. Add contextual factors (committee assignments)<br>3. Implement graduated confidence scoring<br>4. Re-classify existing matches |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Inadequate Fuzzy Matching Configuration | Phase 1 | Test with known deputy-spouse pairs; measure precision/recall |
| Ignoring QSA Data Timeliness | Phase 2 | Verify data freshness indicators; test staleness alerts |
| Overlooking CNPJ Format Variations | Phase 1 | Confirm 100% CNPJ normalization; test with malformed inputs |
| Inadequate Conflict Classification Logic | Phase 3 | Validate with ethics board guidelines; test edge cases |
| Performance Degradation | Phase 2 | Benchmark with full dataset; verify response time SLAs |
| Insufficient Error Handling | Phase 1 | Test with corrupted/missing data; verify fallback behavior |

## Sources

- WinPure: Common Mistakes in Fuzzy Data Matching (2025) - Fuzzy matching configuration pitfalls
- Advisicon: Overcome Data Integration Challenges in Government Agencies (2024) - Government-specific integration challenges
- Brazilian Corporate Governance Code - Conflict of interest principles and disclosure requirements
- Receita Federal QSA documentation - Data format and update frequency specifications
- Netrin Blog: Consultas de CNPJ e QSA: automatize via API (2026) - Practical QSA integration experiences
- Contabilidade.com: QSA (Quadro de Sócios e Administradores): o que é, como ... (2026) - QSA fundamentals
- Various government transparency implementations - Lessons learned from similar deputy-business matching projects