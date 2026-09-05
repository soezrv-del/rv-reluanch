# RVFAX / RvFOX — what’s broken (investigation, 2026-09-01)

Investigation only. No product fixes in this change. Verified against
`soezrv-del/rv-reluanch` at `bab0940` (plus this note).

Open GitHub issues: **none**. Open PRs at review time: **none**.

---

## Gate results (real commands)

| Command | Result | Summary |
|---|---|---|
| `npm install` | **Pass** | 438 packages. Warns `@zxing/library` wants Node ≥24 (this box is Node 22). |
| `npm run typecheck` | **Pass** | `tsc --noEmit` clean. |
| `npm run test` | **Fail** | 205 tests, **197 pass / 8 fail**. All 8 are `scripts/grok-pwa-plugin.test.mjs` — the live `src/lib/og/site.json` title (“RV Fox · Mark Class Premium”) is baked into the injector, so isolated tests still emit this app’s title instead of fixture titles (“Hello World”, “Wild Race”). Product tabs are not covered by these tests. |
| `npm run build` | **Pass** | Vite + Nitro succeed. `db:migrate` skips (`DATABASE_URL` unset). Warns several chunks **>500 kB** after minify — Facts catalog **528 kB** client / **797 kB** SSR; Tow **418 kB**; VIN scanner **486 kB**. |
| `npm run catalog:check` | **Fail** | 53 failures, 9 warnings. Checker only parses **quoted** make keys, so it reports “30 makes / 128 series” while the file actually has **50 makes / ~394 series**. Some “Grand Design has Bounder Classic / Pace Arrow / Jay Feather” lines are **checker false positives** (those series sit under unquoted `Fleetwood:` / `Jayco:`). Real data bugs remain (empty floorplans, missing brands, year-band overflow). |
| `npm run verify` | **Fail** | `typecheck` then `catalog:check` — blocked by catalog gate. |

Web **typecheck + production build work**. Native store rebuild and catalog-quality ship gates do **not**.

---

## Memory hunches (verified)

Notes in `.grok/project_memory.md` were treated as hunches.

### 1. Black / blank screens from oversized synchronous `rvData` — **confirmed (risk); launch-all-tabs black is mitigated**

- Live catalog `src/lib/rv/rvData.ts` is **774,836 bytes / 25,274 lines**. Memory said ~390 kB already caused a black content area. This file is **about 2× that**.
- Count: **50 makes, ~394 series**, years **2002–2027**.
- `src/lib/rv/catalog.ts` **statically imports** the whole object. Opening Facts parses that module on the main thread. Build emits `catalog-*.js` at **528 kB** minified.
- **Mitigation already in this export:** `AppShell` lazy-loads each tab. Launchpad does **not** import the catalog. Cold start should no longer parse 775 kB before the orange door. A 4s Capacitor splash safety hide exists.
- **Still broken for Facts:** first open of Facts / search / compare still pays the full sync parse. That can look like a black pane + pulse (`SuiteFallback`) on a phone.
- Phase 3 (`ensureCatalogLoaded`, thin `rvData.ts` + `rvDataFull.ts`) is **not** in `src/`.
- Recovery file `artifacts/rvData.WORKING-july28.ts` is **not** in this repo.

**Next fix:** lazy-load catalog only when Facts opens (dynamic `import()`), keep a tiny make/year index on the launch path.

### 2. RvFACTS access-gate spinner / timeout — **not confirmed in this export**

- No access-gate, phone-collect modal, 2.5s timeout, or `allowed` fail-open in `src/`.
- `MoreApp` copy: “Full suite is open … No in-app purchases in this version.”
- Phase 1 patch (`artifacts/patches/PHASE1-ACCESS-TIMEOUT.md`, `patches/index.tsx`) is **not** here. That was a July-28 / Supabase-era `index.tsx`, not this TanStack Start shell.
- A spinner you see today is more likely **catalog chunk load** or a search/NHTSA wait, not the old sign-in gate.

**Next fix:** do not port the old gate unless you want accounts again; if testers still see a stuck Facts spinner, treat it as catalog load (hunch 1).

### 3. Catalog sync / Edge / Supabase vs July-28 drop-ins — **confirmed incomplete**

Memory described daily `catalog-sync` (xAI + NHTSA), `rv_catalog` table, `services/catalogSync.ts`, and zips under `artifacts/`.

In this GitHub tree:

| Expected | Found |
|---|---|
| `supabase/functions/catalog-sync` | **Missing.** Only `supabase/functions/_shared/rv-market-prices.ts`. |
| `src/services/catalogSync.ts` / `refreshCatalogFromServer` | **Missing.** No `src/services/`. |
| `artifacts/rvfax-catalog-active-v4*.zip` and phase patches | **Missing.** `artifacts/` is only `imagine_images/`. |
| Client merge on Facts mount | **Missing.** Facts uses static `RV_DATA` only. |
| `exports/` snapshots | Present as **offline backups** (`exports/README.txt` says the app does not load them). |

The “ready to drop into July-28” packs never landed in this export. Catalog does not refresh itself.

**Next fix:** either ship one drop-in (Edge function + client merge + migration) or drop the daily-sync claim and treat `rvData.ts` as the only catalog.

### 4. Auth off vs routes that assume auth — **not confirmed as a product break**

- `.grok/app-env.json`: `VITE_AUTH_ENABLED: "false"`, `deploy.database: false`.
- No `src/routes/login.tsx`. Product API routes (`/api/rvgrok`, Facts, NHTSA, OSRM, …) do **not** use `authMiddleware` / `requireUserId`.
- Platform auth helpers exist (`src/lib/auth/*`). `SIGN_IN_PATH = "/login"` would 404 **only if** auth were turned on.
- Saved coaches / Grok history use **localStorage**, which matches auth-off.

**Next fix:** leave auth off until you want cross-device accounts; if you turn it on, add `/login` and wrap only the routes that must be per-user.

### 5. RvGrok prompt / XAI / web search / Gemini — **confirmed gaps (Gemini-as-fallback: not in this tree)**

What works on paper:

- `/api/rvgrok` tries **xAI first** (`XAI_API_KEY`), then Cloudflare worker `https://rv-assistant.soezrv.workers.dev`, then an **unverified demo** stream so the tab is not dead.
- Chat temperature is **0.2** (in the 0.1–0.2 band memory wanted). Floorplan-letter + several landmines are already in `src/lib/rvgrok/prompts.ts`.

What’s missing vs memory / mature-prompt pack:

- **No** `web_search` tool, **no** `/v1/responses` path, **no** `needsWebCrossReference`. Spec questions cannot silently look up OEM pages.
- Model list prefers **`grok-4.5` first**, then `grok-4-latest`. Memory asked for `grok-4-latest` / STANDARD.
- **No Gemini API fallback** in `src/` (“Gemini” here is a Thor coach name). The “Gemini ignores rules” hunch is **not confirmed** in this export.
- Founder / tab-walkthrough prompt pack (`artifacts/patches/rvgrok-story-and-guide/`) is **not** installed. More tab has no David origin paragraph.
- This review environment had **`XAI_API_KEY` unset**. Without the key *and* a live worker, Grok answers are the demo placeholder — not catalog truth.

**Next fix:** keep xAI as the only spec brain; add web search for technical lookups; do not add Gemini for numbers; set `XAI_API_KEY` on the hosted app.

### 6. Capacitor / iOS / Android packaging — **confirmed gaps**

Docs (`TESTFLIGHT.md`, `ANDROID.md`, `CAPACITOR.md`) tell you to run `npm run cap:prepare` / `cap:sync` / `cap:open`.

| Doc claim | Reality |
|---|---|
| Those npm scripts exist | **Not in `package.json`.** Helpers exist: `scripts/prepare-capacitor.mjs`, `scripts/cap-mac.sh`. |
| `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android` installed | **Not in dependencies.** Only `core`, `app`, `keyboard`, `splash-screen`, `status-bar`. |
| `cap-www/` webDir | **Folder missing.** Config `webDir` is `"cap-www"`. Sync without it is a blank/placeholder shell. |
| `android/` includes Capacitor Android project | Folder exists, but `capacitor.settings.gradle` points at `node_modules/@capacitor/android`, which **is not installed**. |
| `.env.example` for Android | **Missing.** |
| iOS Info.plist / AppDelegate | **Look correct** — launch storyboard only, `CAPBridgeViewController` created in code (the known LaunchScreen crash). Mic / camera / speech / location strings present. Bundle `com.markclass.rvfax`, version 1.0 / build 1. |
| Android permissions | **Internet only.** No camera, mic, or location — VIN scan, Grok voice, and Trips location will not prompt correctly on Play builds. |
| Phone app loads the live site | Still true: without `CAP_SERVER_URL` at sync time you get a **placeholder**, not Facts/Cal/Grok. |

**Next fix:** add `@capacitor/cli` + ios/android, add the npm scripts the docs already describe, generate `cap-www`, set `CAP_SERVER_URL` to the live HTTPS app, then `cap sync`. Add Android camera/mic/location permissions to match iOS.

---

## Prioritized findings

### Critical — blocks a store rebuild or a “catalog is trustworthy” ship

1. **Phone / tablet rebuild from this repo cannot follow the written steps.** Missing Capacitor CLI packages, npm scripts, and `cap-www/`. Android Gradle includes a package that is not installed.  
   *Verified:* `package.json` scripts list; `ls cap-www` missing; `node_modules/@capacitor` has no `cli` / `ios` / `android`.  
   *Next:* wire `cap:prepare` / `cap:sync` and install the three missing Capacitor packages.

2. **Catalog quality gate fails (53 errors).** Empty floorplans (Forest River Sunseeker 4X4/MBS/TS, Grand Design Lineage E/M/F), year keys past `yearEnd`, Grand Design Lineage VT starting in 2000 (company 2012), KZ missing Connect/Durango/Venom, **Prime Time** and **East to West** absent after a claimed expansion. Checker also mis-attributes Fleetwood/Jayco series to Grand Design because those makes are unquoted.  
   *Verified:* `npm run catalog:check` + line reads in `rvData.ts`.  
   *Next:* fix the checker to accept unquoted make keys, then fill or remove the empty/wrong series before calling reports “brochure-true.”

### High — core UX users will feel

3. **Facts can stall or go dark on first open** while the 775 kB catalog parses. Launchpad is safer; Facts is not.  
   *Verified:* file size, static import, 528 kB production chunk, lazy tabs in `AppShell`. Not re-timed on a device in this pass.  
   *Next:* dynamic-import the catalog when Facts mounts.

4. **Daily catalog update is not wired.** The app cannot pull new 2026/2027 models from a server. Testers only see whatever is frozen in `rvData.ts`.  
   *Verified:* no `catalog-sync`, no `catalogSync.ts`, empty `artifacts/` drop-ins.  
   *Next:* one Edge job + client merge, or stop promising “active daily catalog.”

5. **Grok cannot live-check the web; without keys it talks in demo mode.** Battery-disconnect / OEM-page questions will guess or say “unverified demo.”  
   *Verified:* `src/routes/api/rvgrok.ts` has image tool only; no `web_search`; demo fallback copy.  
   *Next:* add xAI web search for technical queries; keep demo clearly labeled.

6. **Android shell is permission-thin.** Camera VIN, Grok mic, and Trips location are specified on iOS and missing on Android.  
   *Verified:* `AndroidManifest.xml` vs `ios/App/App/Info.plist`.  
   *Next:* add the matching Android permissions before a Play beta.

### Medium — incomplete / risky

7. **Share-card unit tests fail** because the PWA injector always uses this app’s `site.json` title. CI that runs `npm test` will go red even though the site card itself exists (`public/og.jpg`, `card: "custom"`).  
   *Next:* make injector tests pass an explicit identity and ignore workspace `site.json`.

8. **RvGrok model order and founder/story prompts differ from the Aug-27 pack.** Prefers `grok-4.5`; no lot-founder / tab-guide block.  
   *Next:* pin `grok-4-latest` for spec chat if that’s still the house model; add the story block if you want Grok to teach the suite.

9. **Hard-coded Cloudflare worker URL** (`rv-assistant.soezrv.workers.dev`). If that worker is down, chat falls through to demo even when you meant to use xAI only.  
   *Next:* treat worker as optional; fail to xAI or a clear “chat offline” message.

10. **Brand / name drift.** Package `rvfax`, shell title “RV Fox · Mark Class Premium”, native name RVFAX, More tab labeled “Premium” on the launchpad. Confusing for TestFlight and share previews, not a crash.  
    *Next:* pick one public name and align `site.json`, Xcode, and the launchpad.

11. **Auth-off is consistent** (see hunch 4). Risk only if someone flips `VITE_AUTH_ENABLED` without adding `/login`.

### Low / debt

12. `@zxing/library` engine warning (Node 24 vs 22).  
13. Recharts 2.x deprecation warning on install.  
14. `exports/` and `checkpoints/` are large backups; easy to edit the wrong catalog file. Live file is only `src/lib/rv/rvData.ts`.  
15. No GitHub issues — bugs live in chat/memory, not the tracker.  
16. `npm run build` also runs migrate (no-ops without `DATABASE_URL`); fine for Vercel, confusing locally.  
17. More tab still has no founder paragraph (optional, noted 2026-08-20).

---

## What is *not* broken (so the next agent doesn’t re-litigate)

- TypeScript compiles. Production web build completes.
- Tabs are code-split; launchpad is a real front door.
- iOS launch-storyboard crash workaround is already in `AppDelegate` + `Info.plist`.
- Auth-off + localStorage matches “no accounts” for this export.
- Gemini-as-spec-fallback is **not** in this tree.
- The old Supabase access-gate spinner is **not** in this tree.

---

## Suggested order for the next implementation pass

1. Capacitor scripts + packages + `cap-www` so a Mac can sync TestFlight again.  
2. Lazy catalog load so Facts doesn’t freeze phones.  
3. Catalog data + checker (empty plans, missing Prime Time / East to West, quoted-key parser).  
4. Grok: `XAI_API_KEY` on host + web search; no Gemini for specs.  
5. Android permissions.  
6. Only then: daily Edge catalog sync, if you still want it.
