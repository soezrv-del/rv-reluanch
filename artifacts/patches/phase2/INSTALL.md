# Phase 2 — Review split + rich catalog (safe)

## What you get

| File | Purpose |
|---|---|
| `constants/rvReviews.ts` | Review pools + `getMockReviews` (~73 KB) — **not** on search boot path |
| `constants/rvData.ts` | Lean full catalog **50 makes / 368 models** (~263 KB), no review pools |
| This INSTALL | Drop-in steps |

Also keep Phase 1 access timeout:
- `artifacts/patches/index.tsx` → `app/(tabs)/index.tsx`

## Install order

1. **Copy constants**
   ```text
   constants/rvReviews.ts  ←  artifacts/patches/phase2/constants/rvReviews.ts
   constants/rvData.ts     ←  artifacts/patches/phase2/constants/rvData.ts
   ```

2. **Keep Phase 1 Facts patch** (if not already applied)
   ```text
   app/(tabs)/index.tsx    ←  artifacts/patches/index.tsx
   ```

3. **Reload clean**
   ```bash
   npx expo start -c
   ```

## Backward compatibility
`rvData.ts` re-exports:
```ts
export { getMockReviews, type RVReview, type ReviewTemplate } from './rvReviews';
```
So `pdfService.ts` and `rv-detail.tsx` keep working without edits.

## Pins included
- Thor Vegas / Axis (Ford E-Series + 7.3 Godzilla)
- Jayco Seneca → **Cummins ISB 6.7 / Freightliner S2RV** (not Ford Power Stroke)
- Roadtrek 2000s (Popular / 190 / 210)
- Pleasure-Way, Leisure Travel Vans
- Forest River FR3

## Cal / Tow / Trips — audit only (no broad rewrite)

| Screen | Size | Note |
|---|---|---|
| rvcal.tsx | ~112 KB | Large; leave stable unless a bug is filed |
| rvtow.tsx | ~89 KB | Same |
| rvtrips.tsx | ~118 KB | Same |
| rvgrok.tsx | ~108 KB | Same |

**Why no broad refactor this pass:** those screens work; a rewrite risks the same black-screen regression we just fixed. Next cleanup pass should extract shared UI (headers, result cards, style tokens) only after catalog is proven on device for a day.

## Verify
- Cold start: no long black hang (Phase 1 timeout still active)
- Search **2025 → Jayco → Seneca** → diesel Cummins, not 7.3 gas
- Search **2005 → Roadtrek → Popular**
- Search **Pleasure-Way / Leisure Travel Vans**
- Open a report → reviews still appear (from rvReviews)

## Do not
- Do not replace with the old 390 KB single-file merge (reviews + catalog glued together)
- Do not broad-rewrite Cal/Tow/Trips in the same deploy as this catalog swap
