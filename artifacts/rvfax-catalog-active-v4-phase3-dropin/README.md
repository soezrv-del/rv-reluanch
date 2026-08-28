# RV Facts — Active Daily Catalog Update (v5 + Phase 3)

**Target codebase:** July-28 RVFAX (`code 8:28.zip`)  
**Refreshed:** 2026-08-27 (v6)  
**Purpose:** Once a day, scan for missing RV models from **2010 → present**, check the **next / current / prior model year** for new lines, pull the latest data, and sync it across the app without an App Store release.

## How the daily job works

1. **New-model scan** — Grok lists every distinct model line in active production for **next year, this year, and last year** (priority manufacturers). Next year is first because RV model years launch mid-calendar-year (2027 lines were already shipping in summer 2026).
2. **Gap fill (2010–present)** — For each priority make, Grok sees the models already in `rv_catalog` and returns important missing production lines (capped ~12 per make per run). This steadily closes historical gaps.
3. **Upsert** into `public.rv_catalog` (unique on `make, model`).
4. On the device, `refreshCatalogFromServer()` (called when RvFacts opens) merges remote rows into the live in-memory catalog so users see new models immediately.

## Cold-start safety (Phase 3)

- `constants/rvData.ts` is a **thin facade** (~5 KB). Full model data lives in `rvDataFull.ts` and is loaded **only when RvFacts opens**.
- Review pools stay in `rvReviews.ts` (off the boot path).
- Phase 1 access-gate timeout (2.5 s fail-open) is included so the Facts tab never hangs black while waiting on Supabase.

Static seed (2026-08-27): **50 makes / ~410 models**, `YEARS` = 2000–2027.  
Pins include Thor Vegas/Axis, Jayco Seneca (Cummins/Freightliner), plus 2026–2027 intros below.

v6 job change: Edge Function now uses **grok-4-latest**. `patches/index.tsx` now lazy-loads the catalog and calls `refreshCatalogFromServer()` on RvFacts mount.

### Seed additions in this refresh

| Make | New / restored lines |
| --- | --- |
| Airstream | World Traveler (17RB/22RB), Usonian Limited Edition 28RB |
| Grand Design | Lineage, Lineage Series E (Ford E-450 Class C), Foundation 42GD |
| Winnebago | Thrive, Elora/Resa, Alora, Sunflyer 28MB |
| Newmar | Grand Star, Freedom Aire, Summit Aire, Super Star, Supreme Aire |
| Keystone | Walkabout |
| Jayco | Comet |
| Coachmen | Pixel, Teleos |
| Forest River | Surveyor fifth wheels (2027 27MK/32RL/36MB), Ibex |
| Tiffin | Open Trail 25AO, GH2 Adventure Van |
| Storyteller Overland | Tour MODE, GXV WILD, Grand Bohemian (2027) |
| Renegade RV | Explorer TS twin-screw Super C (2027) |
| Thor | Outlaw Wild West, Eddie Bauer 19EB |
| Forest River | Teleos (new brand, Hershey 2026), Pause, Campsite Reserve |
| Jayco | Embark EV (THL 2026 / retail 3Q 2027, specs preliminary) |
| Coachmen | Concord Type C return (summer 2026) |

Active production `yearEnd` values in the seed now track **2027** (Usonian LE stays 2026 — limited run).

---

## Install order

### 1. Database (one-time)

Run the migration on the OnSpace / Supabase project:

```text
supabase/migrations/20260809_rv_catalog.sql
```

Creates `public.rv_catalog`, `public.catalog_sync_logs`, and the helper RPC.

### 2. Edge Function + secrets

```text
supabase/functions/catalog-sync/   →  your project’s supabase/functions/catalog-sync/
```

(Your codebase already has `supabase/functions/_shared/cors.ts` — the function imports it.)

Required secrets:

| Secret                      | Purpose                      |
|-----------------------------|------------------------------|
| `SUPABASE_URL`              | Project URL                  |
| `SUPABASE_SERVICE_ROLE_KEY` | Write access to `rv_catalog` |
| `XAI_API_KEY`               | Grok for model discovery     |

```bash
supabase functions deploy catalog-sync
```

### 3. Daily schedule (recommended 06:00 UTC)

```sql
SELECT cron.schedule(
  'rvfax-catalog-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rtlqkunyokumxrdwrtlq.backend.onspace.ai/functions/v1/catalog-sync',
    headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

You can also POST to the function manually any time with the service-role key.

### 4. App files (copy into the July-28 tree)

```text
constants/rvData.ts        ←  thin facade
constants/rvDataFull.ts    ←  full ~404 models (lazy)
constants/rvReviews.ts     ←  review pools (off boot path)
services/catalogSync.ts    ←  throttled merge (awaits local load)
```

Optional but recommended (prevents black-screen hang on access check):

```text
app/(tabs)/index.tsx       ←  patches/index.tsx
```

### 5. Wire RvFacts (required)

Follow **FACTS-WIRING.md** exactly:

- Import `ensureCatalogLoaded`, `isCatalogLoaded`, `refreshCatalogFromServer`
- `catalogReady` state
- `useEffect` on Facts mount that calls `ensureCatalogLoaded()` then `refreshCatalogFromServer()`
- Gate the search UI with a short “Loading RV catalog…” while `!catalogReady`

Do **not** call `ensureCatalogLoaded()` from the root layout or other tabs.

### 6. Clean reload

```bash
npx expo start -c
```

---

## Verification

**Server**

```sql
SELECT make, model, type, year_start, source, updated_at
FROM rv_catalog
ORDER BY updated_at DESC
LIMIT 20;

SELECT * FROM catalog_sync_logs ORDER BY ran_at DESC LIMIT 3;
```

**Client console**

```
[catalogSync] Merged remote catalog — added N, updated M
```

**UI**

- Cold open other tabs → instant (no full catalog parse)
- Open **RvFacts** → brief “Loading RV catalog…” then pickers fill
- Search **2026 → Grand Design → Lineage Series E** → Ford E-450 / 7.3L Godzilla
- Search **2026 → Winnebago → Thrive / Elora**
- Search **2027 → Forest River → Surveyor**
- Search **Thor → Vegas / Axis** and **Jayco → Seneca** (Cummins / Freightliner)
- Models discovered overnight appear after the next refresh (or app restart)

---

## Files in this package

```
README.md
INTEGRATION.md          (install notes)
FACTS-WIRING.md         (exact Facts screen hooks)
PHASE3-NOTES.md
constants/
  rvData.ts             # ~5 KB facade
  rvDataFull.ts         # full seed (dynamic import)
  rvReviews.ts
services/
  catalogSync.ts
patches/
  index.tsx             # Phase 1 2.5 s access timeout
supabase/
  functions/catalog-sync/index.ts   # v6 daily job (grok-4-latest)
  migrations/20260809_rv_catalog.sql
```

## Design notes

- The Edge Function is conservative (priority makes, ~12 gap models per make) so a daily run stays fast and inexpensive while still closing the 2010–present catalog over weeks.
- New **makes** discovered by the job are merged into the live `RV_DATA` object. A soft restart surfaces brand-new manufacturers in the make picker.
- Cal / Tow / Trips / Grok were left untouched for stability.
- Never re-introduce a single 390 KB+ `rvData.ts` that glues reviews + catalog together — that caused the earlier black-screen regression.
