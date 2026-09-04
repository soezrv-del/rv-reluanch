# RvFOX / rv-reluanch — Project Summary

Read this first in any new chat before scanning the codebase.

## What the app does

**RvFOX** (package name `rvfax`) is a premium RV decision suite for buyers and dealership pros: Facts reports, Cal (loan/payment), Tow, Trips, and **RV Grok** (chat + live voice). Mission: help find the right RV and arm pros with accurate knowledge — not pushy sales tactics.

- Live web app: `https://rvmax.app` / `https://www.rvmax.app` (title: **RvFOX · Know before you buy.**)
- Promo site: `rvfox.app` (Framer)
- Monetization intent: loan origination off Cal (B2B), not consumer SaaS
- iOS priority: Capacitor shell → Apple TestFlight (Android exists; not the focus)

## Tech stack

- **Frontend:** React 19, Vite, TanStack Router / Start / Query, Tailwind CSS 4, Radix UI
- **Mobile:** Capacitor 8 (iOS + Android)
- **Auth / data:** better-auth, Kysely, Postgres / PGlite
- **RV Grok:** xAI API (`XAI_API_KEY` on Vercel); chat via `/api/rvgrok`; voice web research via `/api/rvgrok/web-research`
- **Ship path:** GitHub `soezrv-del/rv-reluanch` → Vercel team `rvfox`, project `rv-reluanch` (also duplicate `rv-reluanch-blef`)
- **DNS:** `rvmax.app` at GoDaddy → Vercel

## Main files and folders

| Path | Role |
|------|------|
| `src/lib/rv/rvData.ts` | Catalog source of truth (models, floorplans, years) |
| `src/lib/rv/rvCatalogIndex.ts` | Generated/index years + `MAKES` (rebuild with `npm run catalog:index`) |
| `src/lib/rv/catalog.ts` | Year/floorplan helpers (`modelAvailableInYear`, `getFloorplansForYear`, …) |
| `src/lib/rv/brochureSpecs.ts` | Powertrain / brochure year snapshots |
| `src/components/rvfax/` | Facts UI (e.g. `RvDetail.tsx`) |
| `src/components/rvgrok/` | RV Grok chat UI (`RvGrokApp.tsx`) |
| `src/lib/rvgrok/` | Grounding, web search, voice, telemetry, prompts |
| `src/routes/api/rvgrok.ts` | Chat API proxy (xAI direct → worker → demo) |
| `src/routes/api/rvgrok.web-research.ts` | Voice web-research sidecar |
| `scripts/catalog-integrity.mjs` | Catalog honesty assertions (`npm run catalog:check`) |
| `ios/` / `android/` | Capacitor native shells |
| `package.json` | Scripts: `dev`, `build`, `test`, `catalog:check`, `cap:sync`, … |

**Hard rule:** only **one make** may edit `rvData` at a time (coding lock). Research/prep for other makes can run in parallel.

## Catalog sourcing rules (critical)

1. A **dated** brochure PDF / year-labeled RVUSA page **outranks** an undated OEM web/print card.
2. Undated OEM current pages often show **next** model year with no year label — they may **cross-check** a year, never **establish** one.
3. Prefer RVUSA library PDFs: `https://library.rvusa.com/brochure/{Year}-{Make}-{Family}.pdf` (curl + `pdftotext`; Cloudflare often blocks OEM sites).
4. Empty / shorter year rows beat writing the wrong year's codes.
5. Preserve exact brochure characters (hyphens, trailing letters).

## What we were working on last (as of 2026-09-03)

### Shipped / live on production (`main` tip includes `#117`)

- RV Grok live web for troubleshooting (`#112`–`#114`)
- Web research speed (`#116`) + Live Voice **10s** budget (`#119`) — cold research ~5–10s
- Empty-year floorplan honesty UI (`#117`) — no more historical floorplan dump labeled this year
- `rvmax.app` domain fixed on `rv-reluanch`; Vercel Pro on team `rvfox`
- Coachmen towables MY2026–27 invent scrub (`#115`) merged

### Open / paused (billing hold + investor meeting 2026-09-04)

- **PR `#118`:** Forest River fifth wheels MY2026–27 — ready-ish; Cardinal MY2026 2027-leak codes already scrubbed in the branch; **do not merge until coding lock / resume**
- **Queued Coachmen corrections** (behind Forest River lock): drop MY2026 contamination `271BHE` / `249SE` / `30SE` / `283RNR`; hyphenate Catalina Destination `40BHTS-2Q` / `40BHTS-DEN`; remove Trail Blazer garage block copied from Adrenaline; Sportscoach SRS Super C wrong class/drivetrain (urgent)
- Related-series suggester in `#117` honesty review: token matching FAIL — harden separately
- Shop bots on hold except production red alerts

### Demo readiness note

Production check (2026-09-03 PM): `www.rvmax.app` title correct; `/api/rvgrok` `xai-direct` streaming; web-research returning notes. Prefer demoing **RV Grok troubleshooting + Facts year honesty**, not unfinished Forest River / Coachmen correction PRs.

## Team lanes (Grok Bot shop)

- **Ez** — lead: catalog lock, GitHub + Vercel ship path, coordination
- **EzMe** — research / invent skims
- **Ez assist** — honesty PR comments
- **Ship** — CI / Vercel / TestFlight GO–NO-GO
- **Cap** — Vercel env / deploy caps
- Others: Director (promo), Scribe (copy), compliance, asist

## Do not

- Clone the repo onto the Grok Bot machine for coding; use Cursor cloud agents + PRs
- Invent floorplans or drivetrains to fill gaps
- Treat undated OEM pages as model-year authority
- Merge catalog PRs while the one-make coding lock is held by another open catalog PR
