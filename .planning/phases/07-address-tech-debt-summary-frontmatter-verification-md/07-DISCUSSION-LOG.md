# Phase 7: Address Tech Debt - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-15
**Phase:** 07-address-tech-debt
**Areas discussed:** Summary frontmatter schema, VERIFICATION.md scope & format, Additional tech debt items, Phase 1-3 SUMMARY generation

---

## Summary Frontmatter Schema

| Option | Description | Selected |
|--------|-------------|----------|
| List of REQ-IDs | Full array of requirement IDs enabling auto-verification | ✓ |
| Count only | Just a number (`requirements-completed: 4`) — simpler but not verifiable | |
| Both — list + count | Array of IDs plus a count field for quick scanning | |
| Phase 5 only | Add to 05-01 through 05-04 SUMMARYs — minimal change, closes known gap | ✓ |
| All existing SUMMARYs | Update Phase 4 and 6 as well for consistency | |
| Yes, add verification ref | Link each SUMMARY to its VERIFICATION.md — bidirectional traceability | ✓ |
| No, keep separate | Keep SUMMARY and VERIFICATION.md independent | |
| Keep all, add new fields | Preserve plan, phase, status, commits, tasks; add requirements-completed and verification | ✓ |
| Simplify — drop commits/tasks | Remove verbose commits/tasks arrays for cleaner frontmatter | |

**User's choice:** List of REQ-IDs + verification ref. Phase 5 only. Keep all existing fields.

---

## VERIFICATION.md Scope & Format

| Option | Description | Selected |
|--------|-------------|----------|
| All three: 4, 5, 6 | Create VERIFICATION.md for all v1.1 phases — closes all audit gaps | ✓ |
| Phase 5 & 6 only | Skip Phase 4 as it's a simpler cleanup phase | |
| One per phase | Single file per phase matching v1.0 convention | ✓ |
| One per plan | Individual files per plan matching SUMMARY granularity | |
| Same format as v1.0 | Frontmatter → req summary → per-req detail → test/UAT evidence → mapping → known gaps | ✓ |
| Refine — drop UAT evidence | Slimmer file by removing duplicative UAT evidence section | |
| Document all known gaps | Include every outstanding issue in known gaps section | ✓ |
| Only in-scope gaps | Only document gaps Phase 7 itself addresses | |

**User's choice:** All three phases (4, 5, 6). One per phase. Same v1.0 format. Document all known gaps.

---

## Additional Tech Debt Items

| Option | Description | Selected |
|--------|-------------|----------|
| REQUIREMENTS.md checkboxes | Update all 24 traceability [ ] to [x] | ✓ |
| STATE.md progress | Fix completed_phases: 3→6, percent: 50→100 | ✓ |
| Phase 4 VALIDATION.md | Create 04-VALIDATION.md — Nyquist gap | |
| 05-VALIDATION.md → finalized | Finalize draft to VALIDATED status | |
| GrafoCanvas TS error | Fix TypeScript error at GrafoCanvas.tsx:635 | |
| PaginationMeta export | Move type from FiscalizacaoDashboard.tsx to api.ts | |

**User's choice:** REQUIREMENTS.md checkboxes + STATE.md progress only. Others deferred.

---

## Phase 1-3 SUMMARY Generation

| Option | Description | Selected |
|--------|-------------|----------|
| No — leave as-is | VERIFICATION.md already covers these phases; retroactive SUMMARYs add overhead | ✓ |
| Yes — create SUMMARYs | One SUMMARY per phase reconstructed from git history | |

**User's choice:** No — leave as-is. VERIFICATION.md coverage is sufficient.

---

## Deferred Ideas

- Phase 4 VALIDATION.md — Nyquist gap, needs separate work
- 05-VALIDATION.md draft finalization — needs content verification
- GrafoCanvas.tsx:635 TS error — pre-existing code issue, blocks npm run build
- PaginationMeta type export — minor refactor from local to shared
- Docker end-to-end build test — requires Docker Desktop
- Phase 1-3 SUMMARY.md files — not worth the retroactive overhead
