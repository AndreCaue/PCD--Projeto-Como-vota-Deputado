# Phase 4: Cleanup & Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-13
**Phase:** 4-Cleanup & Foundation
**Areas discussed:** QSA Service Structure

---

## QSA Service Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Add to existing api.ts | Consistent with existing pattern — single file to import | ✓ |
| Separate services/qsa.ts | Cleaner separation but breaks single-file pattern | |
| All QSA endpoints now | Pre-build what Phase 5 needs | ✓ |
| Only Phase 4's scope | Just freshness endpoint, add more in Phase 5 | |
| Use existing api instance | Same axios instance — auto benefits from port fix | ✓ |
| Create separate axios instance | More control but duplicates config | |
| Migrate useFiscalizacao.ts to axios | Port fix covers everything; consistent pattern | ✓ |
| Leave useFiscalizacao.ts as-is | Works fine, inconsistency remains until Phase 5 | |

**User's choice:** Multiple selections — all recommended options
**Notes:** QSA service structure fully agreed. User chose consistency (existing api.ts, existing axios instance, migration to axios) and future-proofing (all endpoints now).

---

## Deferred Ideas

None — discussion stayed within phase scope.
