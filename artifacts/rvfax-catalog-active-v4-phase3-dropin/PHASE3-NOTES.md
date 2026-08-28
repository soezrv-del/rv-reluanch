# Phase 3 — Lazy-load full catalog

## Goal
Cold start no longer parses the ~250 KB model database.  
Full catalog loads **only when RvFacts opens** (or when sync runs after that).

## What you get

| File | Size (approx) | Role |
| --- | --- | --- |
| `constants/rvData.ts` | ~5 KB | Facade: empty `RV_DATA` / `MAKES`, `ensureCatalogLoaded()` |
| `constants/rvDataFull.ts` | ~255 KB | Full 50 makes / ~368 models — **dynamic import only** |
| `constants/rvReviews.ts` | ~75 KB | Reviews (still separate, Phase 2) |
| `services/catalogSync.ts` | small | Awaits local load, then merges remote rows |
| `FACTS-WIRING.md` | — | Exact Facts screen hooks |

## Install order

1. **Copy constants**
   ```text
   constants/rvData.ts       ←  patches/phase3/constants/rvData.ts
   constants/rvDataFull.ts   ←  patches/phase3/constants/rvDataFull.ts
   constants/rvReviews.ts    ←  patches/phase3/constants/rvReviews.ts
   ```

2. **Copy sync client**
   ```text
   services/catalogSync.ts   ←  patches/phase3/services/catalogSync.ts
   ```

3. **Wire Facts** (required)
   Follow `FACTS-WIRING.md` in `app/(tabs)/index.tsx`:
   - `ensureCatalogLoaded()` on Facts mount
   - `catalogReady` gate before search pickers
   - optional `refreshCatalogFromServer()` after local load

4. **Keep Phase 1 access timeout** if not already applied  
   `patches/index.tsx` → `app/(tabs)/index.tsx` (2.5 s fail-open)

5. **Clean reload**
   ```bash
   npx expo start -c
   ```

## Behavior

```
App launch
  └─ thin rvData.ts only (~5 KB parse)
Home / Cal / Tow / Trips / Grok
  └─ no full catalog parse
Open RvFacts
  └─ await import('./rvDataFull')
  └─ fill RV_DATA + MAKES
  └─ optional remote merge
  └─ search UI enables
```

## Backward compatibility

- Existing `import { RV_DATA, MAKES, YEARS } from '@/constants/rvData'` still works.
- `RV_DATA` object identity is stable (mutated in place after load).
- `getMockReviews` still re-exported from `rvData.ts`.
- `getMaintenanceSchedule` stays on the facade (no need to load full catalog).

## Verify

- Cold start: no long black hang; other tabs open without catalog parse
- Open **RvFacts** → brief “Loading RV catalog…” then pickers populate
- Search **2025 → Jayco → Seneca** → Cummins / Freightliner
- Search **Thor → Vegas / Axis**
- Open a report → reviews still render
- Second visit to Facts → instant (already loaded)

## Do not

- Do not `import '@/constants/rvDataFull'` from app routes or services at top level
- Do not call `ensureCatalogLoaded()` from the root layout (defeats lazy load)
- Do not ship the old single 390 KB reviews+catalog file
