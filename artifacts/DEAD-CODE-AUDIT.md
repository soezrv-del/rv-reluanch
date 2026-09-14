# RvFOX dead-code audit (read-only)

**Repo:** [soezrv-del/rv-reluanch](https://github.com/soezrv-del/rv-reluanch)  
**Tip:** `4f129a5` — `Merge pull request #252 from soezrv-del/cursor/sold-comps-market-value-95d1` (`main`)  
**Auditor:** read-only pass. No source deleted, no product files edited.  
**Method:** import-graph of `src/` + `scripts/`; named-export mention counts; targeted greps for splash / Ask Grok / MarketCheck / catalog / backups. `node_modules` out of scope.

**Live product surfaces treated as in-use:** Facts, Cal, Tow, Trips, Grok (LIVE! dock tab), dock, David-book splash, catalog (`src/lib/rv/rvData.ts` via `catalogLoad` / `rvCatalogIndex`). Plus More, Sold book (pro), inline Share kit, VIN, Compare.

Actions:

| Action | Meaning |
|---|---|
| **REMOVE** | Nothing live imports it. Safe to delete after a backup if you want the bytes gone. |
| **TRIM** | File is live; unused export / leftover CSS / unused prop. Cut the remnant, keep the file. |
| **MERGE-DUPLICATE** | Two copies of the same idea. Keep one. |
| **KEEP-BUT-NOTE** | Serves a real feature, a removal guard, or a platform contract. Do not delete blindly. |

---

## 1. Archives, backups, pre-import dumps

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `exports/` (whole tree) | **REMOVE** | `exports/README.txt` says nothing here is loaded by the app. Live catalog is `src/lib/rv/rvData.ts`. No `src/` import of `exports/`. | high |
| `exports/archive/` | **REMOVE** | Dated Aug 8–10 catalog dumps, corrected JSON copies, old zips, Xcode export notes. Archive-only. | high |
| `exports/archive/rvData.pre-import-corrected.ts.bak` | **REMOVE** | Only `*.bak` in the tree. Pre-import dump. Unreferenced. | high |
| `exports/rvData.live-backup.ts` | **REMOVE** | Stale catalog snapshot (25,077 lines vs live `rvData.ts` 38,290). Imports `@/assets/backdrops` which live `src/` no longer uses. | high |
| `exports/rvfax-catalog-models.{json,csv,txt}` | **REMOVE** | Offline catalog dumps. Used only by optional ops scripts (`ai-catalog-research.mjs`, `export-catalog-zip.mjs`), not the running app. | high |
| `exports/rvfax-catalog-powertrain-*.{csv,json}` | **REMOVE** | Gap/year dumps for homework scripts, not runtime. | high |
| `exports/rvfax-powertrain-pins.ts.txt` | **REMOVE** | Generated pin paste-file. Not imported. | high |
| `exports/rvfax-local-spec-overrides-template.json` | **REMOVE** | Template only. App writes overrides to `localStorage`. | high |
| `exports/rvfax-catalog-export.zip` | **REMOVE** | Packaged snapshot. Not loaded. | high |
| `exports/rvfax-xcode-export.zip` | **REMOVE** | ~3.1 MB old Xcode tree. `exports/archive/README-XCODE-EXPORT.txt` is the only mention. | high |
| `exports/rvfox-grok-handoff-2026-08-28.zip` | **REMOVE** | ~7.3 MB dated handoff pack. Unreferenced. | high |
| `checkpoints/premium-pre-2026-08-02/` | **REMOVE** | Frozen Aug 2 copies of AppShell / Facts / tabs / CSS. Not imported. Superseded by live `src/`. | high |
| `supabase/functions/_shared/rv-market-prices.ts` | **REMOVE** | Orphan shared module. No `supabase/functions/catalog-sync` (or any other function) exists. Comments cite NADA / 2024 listings. Live value path is sold-comps + `marketEstimate`, not this table. | high |
| `tiffin-2019-2020-corrections.md` | **KEEP-BUT-NOTE** | Research notes, not code. Not a runtime dependency. Keep if you still use it as a pin checklist. | medium |
| Root docs (`COMPLETION-SUMMARY.md`, `PROJECT_SUMMARY.md`, `PREMIUM_DESIGN_CHECKPOINT.md`, `docs/BROKEN.md`) | **KEEP-BUT-NOTE** | Not product code. `docs/BROKEN.md` is a 2026-09-01 investigation and is **stale** (claims Capacitor scripts/packages missing; `package.json` now has them; catalog is lazy-loaded). Do not treat it as a live map. | high |

---

## 2. Splash / Ask Grok remnants (after overlay removal)

Ask Grok **as a Facts button** that seeds the Grok **tab** is live. The **floating badge + overlay** is gone (`AskGrokOverlay.tsx` does not exist; `askGrokChrome.test.ts` asserts that). These leftovers did not get cut with it.

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `src/styles.css` lines ~65–67 and ~1798–1969 (`.ask-grok-*`, `--z-ask-grok-*`, `--shadow-ask-grok`) | **TRIM** | Overlay chrome CSS. Zero TSX class names. Comment still says “badge + slide-over”. | high |
| `src/components/rvgrok/RvGrokApp.tsx` — `RvGrokVariant` / `variant?: "page" \| "embedded"` | **TRIM** | Comment: “`embedded` — Ask Grok overlay mount”. `AppShell` never passes `variant=`. Only `embeddedMode.test.ts` keeps the branch alive. | high |
| `src/components/rvgrok/RvGrokApp.tsx` — `onSplashPlayingChange` / `onNavigate` (bound as `_onSplashPlayingChange`, `_onNavigate`) | **TRIM** | Props accepted and ignored. Grok opening-splash video is gone; camera `<video>` is unrelated. | high |
| `src/components/shell/AppShell.tsx` — `grokSplashPlaying` / `setGrokSplashPlaying` / `onSplashPlayingChange={setGrokSplashPlaying}` | **TRIM** | State can never become `true` because Grok never calls the callback. Still used to hide the dock (`hideDock`) and `splashPlaying` in nav context. Dead wire. | high |
| `src/assets/launchMedia.ts` — `RVFOX_LAUNCH_SEAL`, `_LITE`, `_ULTRA` | **TRIM** | Live splash is `DAVID_BOOK_SPLASH` + poster only. Seal constants are unused except the `backdrops.ts` barrel. `launchpad.magazine.test.ts` asserts Launchpad does **not** use `rvfox-cover-seal` / `rvfox-launch-seal-poster`. | high |
| `src/assets/backdrops.ts` | **REMOVE** | Compatibility barrel. Live `src/` imports `prestige` / `typeMedia` / `tripMedia` / `launchMedia` directly. Only `exports/` and `checkpoints/` import this file. | high |
| `public/assets/splash/rvfox-launch-seal.mp4` | **REMOVE** | Superseded by David-book splash. No live reference. | high |
| `public/assets/splash/rvfox-launch-seal-lite.mp4` | **REMOVE** | Same. | high |
| `public/assets/splash/rvfox-launch-seal-ultra.mp4` | **REMOVE** | Same. | high |
| `public/assets/splash/rvfox-launch-seal-poster.jpg` | **REMOVE** | Removal-guard test forbids it on Launchpad. | high |
| `public/assets/splash/rvfox-cover-seal.jpg` | **REMOVE** | Same. | high |
| `public/assets/splash/david-book-splash.mp4` | **KEEP-BUT-NOTE** | Live cold-open video. | high |
| `public/assets/splash/david-book-splash-poster.jpg` | **KEEP-BUT-NOTE** | Live poster. | high |
| `src/assets/tripMedia.ts` — `RVTRIPS_MAP_PANEL` | **TRIM** | Exported; Trips UI does not use it (`basemap.test.ts` / `routeResults.test.ts` assert that). Image import still pulls `rvtrips-map-panel.jpg` into the bundle if anything imports `tripMedia` for `RVTRIPS_AMERICA_BACKDROP` (same module). | high |

---

## 3. Unused components / dead UI

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `src/components/rvshare/RvShareApp.tsx` | **REMOVE** | Standalone Share pane. `shareInline.test.ts` asserts `AppShell` does **not** mount `<RvShareApp`. Dock has no `id: "rvshare"`. More / launch `"rvshare"` is redirected to Facts (`openFactsShare`). Kit is inline on the report (`RvShareKit`). | high |
| `public/assets/brand/icon-rvshare.png` | **REMOVE** | Only referenced from `checkpoints/…/BottomTabs.tsx`. Live dock is text, not these PNGs. | high |
| `public/assets/brand/icon-premium.png` | **REMOVE** | Same — old “more” icon in the checkpoint only. | high |
| `public/assets/brand/icon-rvcal.png` | **REMOVE** | Same — Cal icon unused in live `src/`. | medium |
| `src/lib/rv/soldDeals.ts` — `formatSoldDockMoney` | **TRIM** | Dock money figure was removed. `shareInline.test.ts` / `proEntitlement.test.ts` assert the dock does **not** call it. Only `soldDeals.test.ts` still exercises the helper. `formatSoldDockAria` **is** live (screen-reader on the dock). | high |

---

## 4. Unused exports on live modules (trim, don’t delete the file)

These functions/constants have **no callers** outside their definition (including tests), unless noted.

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `src/lib/rv/zipTax.ts` — `zipTaxCoverage` | **TRIM** | Unreferenced export. `stateFromZip` / tax lookup are live in Cal. | high |
| `src/lib/rv/catalog.ts` — `countCatalogMatches`, `getMakesForYearCount` | **TRIM** | Unreferenced. Wizard uses other catalog helpers. | high |
| `src/lib/rv/activeCoach.ts` — `clearActiveCoach` | **TRIM** | Write/read/format are live; clear is never called. | high |
| `src/lib/rv/factsOpen.ts` — `isFactsTypeId` | **TRIM** | Type-guard export unused. | high |
| `src/lib/rv/livePowertrainGuard.ts` — `trustBadgeLabel` | **TRIM** | Label helper never rendered. Guard itself is live on Facts. | high |
| `src/lib/rv/verifiedCatalogCache.ts` — `hasVerifiedDossier` | **TRIM** | Cache get/set are live; this predicate is unused. | high |
| `src/lib/rv/proEntitlement.ts` — `PRO_TIER_CHANGED_EVENT` | **TRIM** | Constant never dispatched or listened. Tier read is live. | high |
| `src/lib/rv/reportMeta.ts` — `BUYER_TIPS`, `formatLengthRange`, `formatWeightRange` | **TRIM** | `buildReportId` / `valueFactors` are live on the report. These three are leftover copy/formatters. | high |
| `src/lib/rv/reportContact.ts` — `REPORT_CONTACT_LINE` | **TRIM** | Name / phone / tel / monogram / kicker are live. Concat line unused. | high |
| `src/lib/rv/shareKit.ts` — `SAVED_UNITS_EVENT` | **MERGE-DUPLICATE** | Facts dispatches the raw string `"rvfax-saved-changed"` in `RvFaxApp`. Constant is unused. Canonical storage key already lives in `savedUnits.ts`. | high |
| `src/lib/rv/rvCal.ts` — `paymentAtDownPct`, `amortize`, `computeOwnership`, `residualCurve`, `PRICE_CHIPS`, `creditHint` | **TRIM** | Cal UI uses `computeLoan`, `priceForTargetPayment`, presets, ZIP tax. `rvCalUi.test.ts` asserts `creditHint(` is **not** in the UI. Ownership / amortize / price chips have no callers. | high |
| `src/lib/rv/localSpecOverrides.ts` — `listLocalSpecOverrides`, `clearLocalSpecOverrides`, `exportLocalSpecOverridesJson`, `importLocalSpecOverridesJson` | **TRIM** | Facts uses find/save/remove for “Correct this spec”. Bulk list/clear/import/export never wired to UI. | high |
| `src/lib/rv/catalogPatch.ts` — `listProposedPatches`, `upsertProposedPatch`, `setPatchStatus`, `exportProposedPatchesJson`, `exportAcceptedPinsTs`, `patchToYearBand` | **TRIM** | API route only imports `finalizePatch`. Browser `localStorage` proposed-patch store has no UI. Ops script writes `exports/` JSON instead. | high |
| `src/lib/rv/rateApiLenders.ts` — `rateApiCacheStats`, `seedRateApiCache` | **TRIM** | Cache internals unused outside the module. `/api/lenders` is live. | high |
| `src/lib/rvgrok/answerFeedback.ts` — `listAnswerFeedback`, `saveAnswerFeedback` | **TRIM** | Persist helpers unused. `parseCoachFromText` / `formatFeedbackContext` are live. | high |
| `src/lib/rvgrok/grounding.ts` — `HARD_POWERTRAIN_FIELDS` | **TRIM** | Exported array unused. Grounding rules string is live. | high |
| `src/lib/rvgrok/vision.ts` — `isDataUrl`, `contentToPlainText`, `messagesHaveVision` | **TRIM** | Camera path uses `compressImageToDataUrl` / `captureVideoFrame` / `startVideoFramePump`. These three have no callers. | high |
| `src/lib/haptics.ts` — `preloadHaptics`, `setHapticsEnabled`, `isHapticsEnabled`, `hapticMedium`, `hapticHeavy`, `hapticSnap`, `hapticDetent`, `hapticSnapStart`, `hapticSnapEnd` | **TRIM** | Live callers use `hapticLight` / `hapticSuccess` / `hapticWarn` only. Extra variants never imported. | high |
| `src/lib/hooks/iosTapPoint.ts` — `isCapacitorIos` | **TRIM** | Unused export. Tap-point helpers are live on sheets. | high |
| `src/lib/tow/towYear.ts` — `defaultTowRating` | **TRIM** | Unused. Year/rating match path is live. | high |
| `src/lib/trips/osrmCache.ts` — `cacheStats` | **TRIM** | Debug helper unused. Cache itself is live. | high |
| `src/lib/trips/savedTrip.ts` — `savedTripSummary` | **TRIM** | Unused formatter. Save/load is live. | high |
| `src/lib/trips/mapbox.ts` — `fillMapboxRasterTile` | **TRIM** | Unused. Token / geocode path is live. | high |
| `src/lib/trips/tripData.ts` — `DEFAULT_COACH` | **TRIM** | No live or test importer. Trips builds coach from catalog. | high |
| `src/lib/trips/tripData.ts` — `DEMO_ROUTE`, `DEMO_ALERTS`, `DEMO_CAMPS`, `DEMO_DIRECTIONS`, `DEMO_PACK` | **KEEP-BUT-NOTE** | Live UI uses `SAMPLE_CAMPS` / `SAMPLE_PACK` with an explicit sample disclosure. `DEMO_*` are `@deprecated` aliases + anti-regression fixtures (tests forbid using them as the default path). Do not wire them back. Safe to delete the aliases once tests stop naming them. | medium |

---

## 5. MarketCheck vs sold-comps ladder

**Not dead. Do not merge.**

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `src/lib/rv/publicListingComps.ts` + `researchPublicComps.ts` + `/api/rvfax/public-comps` | **KEEP-BUT-NOTE** | Primary Facts market ladder: public sold comps (year ±2). File header forbids importing MarketCheck. Wired from `RvDetail` on every report. | high |
| `src/lib/rv/marketEstimate.ts` + `marketClamp.ts` | **KEEP-BUT-NOTE** | Catalog fallback ladder when sold sample is too small. Shared by Facts, Compare, Share, Cal handoff. Intentionally not MarketCheck. | high |
| `src/lib/marketcheck/*` + `/api/marketcheck/search` + Facts “Local inventory” panel in `RvDetail.tsx` | **KEEP-BUT-NOTE** | Paid inventory search, ZIP + radius, side panel only. `publicListingComps.test.ts` asserts valuation modules never import the MarketCheck client. Independent of sold-comps. Degrades to “MarketCheck not configured” if the key is missing. | high |
| `supabase/functions/_shared/rv-market-prices.ts` | **REMOVE** | See §1. This is the **old** static NADA-ish table, not either live ladder. | high |

No unused MarketCheck route. No unused sold-comps route.

---

## 6. Catalog helpers — split vs duplicate

The live catalog is **not** duplicated in a way that should be merged:

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `src/lib/rv/rvData.ts` | **KEEP-BUT-NOTE** | Full spec catalog. Dynamic-imported by `catalogLoad`. | high |
| `src/lib/rv/rvCatalogIndex.ts` | **KEEP-BUT-NOTE** | Thin wizard index. Generated by `scripts/build-catalog-index.mjs`. | high |
| `src/lib/rv/catalogLoad.ts` + `useCatalogReady.ts` | **KEEP-BUT-NOTE** | Lazy load so splash / Launchpad do not parse the full catalog. | high |
| `src/lib/rv/catalog.ts` | **KEEP-BUT-NOTE** | Query API over index-then-full. Not a second catalog. | high |
| `src/lib/rv/shareKit.ts` `loadSavedUnits` vs `src/lib/rv/savedUnits.ts` | **KEEP-BUT-NOTE** | Complementary: identity/toggle vs hydrated `RVResult[]` for the Facts list + Share. Same `localStorage` key. Not a merge unless you want one module to own both. | medium |
| `src/components/more/MoreApp.tsx` — local `SAVED_KEY = "rvfax_saved_v1"` + `countSaved()` | **MERGE-DUPLICATE** | Re-reads the same key instead of `savedUnits`. Low risk; small cleanup. | high |

---

## 7. Routes

No dead **product** API route. All of these have a live client caller:

`/api/rvfax/dossier`, `/public-comps`, `/compare`, `/api/marketcheck/search`, `/api/rv-videos`, `/api/lenders`, `/api/nhtsa/vin`, `/api/nhtsa/recalls`, `/api/rvgrok`, `/api/rvgrok/token`, `/api/rvgrok/web-research`, `/api/osrm`, `/api/route`, `/api/geocode`, `/api/map-tiles`, `/api/fuel`, `/api/camps`.

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `src/routes/api/rvfax.catalog-research.ts` | **KEEP-BUT-NOTE** | Not a user-facing tab. Called by `scripts/ai-catalog-research.mjs` for operator homework. Not dead. | high |
| Extra page routes (`login`, old Share route, etc.) | — | None found. Auth-off; no `src/routes/login.tsx`. | high |

---

## 8. Scripts

Prioritized. Platform / npm-script / Capacitor / catalog-index tools are **in use**. One-off phase smokes are operator tools, not runtime.

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `scripts/with-app-env.mjs`, `preview.mjs`, `migrate.mjs`, `grok-pwa-*`, `browser-smoke*`, `brand-check.mjs`, `check-auth-invariant.mjs`, `prepare-capacitor.mjs`, `app-env-plugin.mjs`, `write-atomic.mjs`, `catalog-integrity.mjs`, `build-catalog-index.mjs`, `load-live-catalog.mjs` | **KEEP-BUT-NOTE** | Wired from `package.json` or Vite. | high |
| `scripts/ai-catalog-research.mjs`, `export-catalog-zip.mjs`, `gap-report-powertrain.py`, `import-corrected-catalog.py`, `fix-catalog-powertrain.py`, `fix-era-*.py`, `fill-missing-year-bands.py`, `_make_export_zip.py` | **KEEP-BUT-NOTE** | Catalog homework / export. Only needed if you still update `rvData.ts` this way. They write `exports/` (see §1). | medium |
| `scripts/smoke-phase1-year-powertrain.mjs`, `smoke-phase2-live-guard.mjs`, `smoke-phase4-cache.mjs`, `acceptance-phase6.mjs` | **KEEP-BUT-NOTE** | Phase acceptance CLIs, not in `npm test`. Still parse live `rvData.ts`. Keep until you retire the phase checklist. | medium |
| `scripts/qa-accolade.mjs` | **KEEP-BUT-NOTE** | Playwright one-shot. Still looks for **Dismiss / Verify later / Skip** access-modal buttons that `docs/BROKEN.md` says are gone from `src/`. Script is stale vs current UI; not a live feature. | high |
| `scripts/qa-rvcal.mjs`, `share-kit-qa-shots.mjs`, `benchmark-*.mjs`, `optimize-ios-launch.*`, `debug-port.sh`, `cap-mac.sh` | **KEEP-BUT-NOTE** | Manual QA / native helpers. Not dead code. | medium |

No script was found that only targets a deleted UI file except `qa-accolade.mjs`’s access-modal clicks (harmless no-ops).

---

## 9. Tests / fixtures that mention removed UI

These are **removal guards**, not dead fixtures. Keep them.

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `src/lib/rvgrok/askGrokChrome.test.ts` | **KEEP-BUT-NOTE** | Asserts overlay file is gone and dock still opens the Grok **page**. | high |
| `src/lib/rvgrok/embeddedMode.test.ts` | **KEEP-BUT-NOTE** | Pins the unused `embedded` variant. If you TRIM the variant, update or drop this test in the same change. | high |
| `src/lib/rv/shareInline.test.ts` | **KEEP-BUT-NOTE** | Asserts no `<RvShareApp`, no dock Share tab, no etch/frost dock CSS. | high |
| `src/lib/rv/launchpad.magazine.test.ts` | **KEEP-BUT-NOTE** | Asserts magazine/cover-seal splash is gone; David-book splash stays. | high |
| `src/lib/rv/proEntitlement.test.ts` / `soldDeals.test.ts` | **KEEP-BUT-NOTE** | `formatSoldDockMoney` tests can go when you TRIM that helper. | high |

No test file imports a missing component (would fail `npm test`). Empty “broken fixture” list.

---

## 10. Platform leftovers (do not delete)

Pre-wired Grok App Builder / TanStack Start helpers. Unused by RvFOX product code because auth/db/connectors/P2P are **off**. Deleting them breaks the platform contract.

| Path | Action | Reason | Confidence |
|---|---|---|---|
| `src/lib/auth/*` (except `__root` `AuthProvider`) | **KEEP-BUT-NOTE** | Auth off. `gates.tsx` (`SignedIn`/`SignedOut`), `middleware.ts` (`listTodos` example), `popup.server.ts` unreferenced by product. Vite still serves `/auth/popup`. | high |
| `src/lib/db.ts` | **KEEP-BUT-NOTE** | No product `getSql()` caller. Auth comments only. | high |
| `src/lib/app-data/*` | **KEEP-BUT-NOTE** | Connector client unused by Facts/Cal/Tow/Trips/Grok. Tests exist for the helper itself. | high |
| `src/lib/multiplayer/*` | **KEEP-BUT-NOTE** | `P2PRoom` never imported by product. Skill leftover. | high |

---

## 11. Clean (verified, no invent)

- **No unused Facts/Cal/Tow/Trips/Grok tab components.** `RvFaxApp`, `RvDetail`, `RvCalApp`, `RvTowApp`, `RvTripsApp`, `RvGrokApp`, `BottomTabs`, `Launchpad`, `AppShell` are live.
- **No unused catalog query module** once backups are ignored. `catalog.ts` / `catalogLoad` / `rvCatalogIndex` / `rvData` is one pipeline.
- **No dead user-facing route** besides the unused Share **component** (Share is a redirect, not a route file).
- **No leftover `AskGrokOverlay.tsx` file.** CSS + embedded variant + splash callback are the remnants.
- **Unused-import sweep** on More / Launchpad / vision consumers did not find unused lucide imports worth listing. Skip inventing unused-import noise.

---

## Suggested cut order (for a later change, not this audit)

1. **Safe bytes:** `exports/archive/`, the two big zips, `exports/rvData.live-backup.ts`, `*.bak`, `checkpoints/`, `supabase/functions/_shared/rv-market-prices.ts`.
2. **Splash leftovers:** unused seal mp4/jpg + `RVFOX_LAUNCH_SEAL*` + `backdrops.ts` + Ask Grok CSS block.
3. **Dead Share pane:** `RvShareApp.tsx` + unused brand PNGs.
4. **Grok overlay wire:** `embedded` variant, ignored splash/nav props, `grokSplashPlaying` in `AppShell`.
5. **TRIM pass** on unused exports in §4 if you want a thinner API surface.

Do not merge MarketCheck into sold-comps. Do not delete `src/lib/auth`, `db`, `app-data`, or `multiplayer` as “dead product code.”
