# Deferred Items (06-02 execution)

## Pre-existing Issues (Out of Scope)

### TypeScript error in GrafoCanvas.tsx:635
- **File:** Frontend/components/grafo/GrafoCanvas.tsx:635
- **Error:** Parameter 'n' implicitly has an 'any' type
- **Detected during:** Task 1 npm build verification
- **Impact on plan:** Blocks `npm run build` from completing successfully, but build compilation step passes. Our changes compile correctly with zero new type errors.
- **Recommendation:** Fix the implicit `any` type in the MiniMap `nodeColor` callback, or adjust `next.config.js` with appropriate TypeScript settings.
