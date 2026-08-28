# RV Facts Catalog — Active Daily Update (v4-stable)

**Target:** July-28 RVFAX codebase (`code 8:28.zip`)  
**Date:** 2026-08-12 / 13  

## What “actively update” means

Once per day the system:

1. **New-model scan** — asks Grok for every distinct model line in active production for the **current year + prior year** across priority manufacturers.
2. **Gap fill (2010 → present)** — for each priority make, shows Grok the models already known and asks for important missing production lines from **2010 to present** (capped ~12 per make per run). This steadily closes historical gaps without a full industry re-scan every day.
3. **Upsert** into `public.rv_catalog` (unique on `make, model`).
4. The app calls `refreshCatalogFromServer()` on RvFax mount (throttled). New rows are merged into the live in-memory `RV_DATA` so users see the latest catalog **without an App Store release**.

Static seed in this package (Phase 2 lean):

- **50 makes / ~368 models**
- `YEARS` = **2000–2027**
- Review pools split into `rvReviews.ts` (~73 KB) so they stay off the cold-start path
- Pins: Thor Vegas/Axis, Jayco Seneca (Cummins/Freightliner), Roadtrek 2000s, Pleasure-Way, Leisure Travel Vans, etc.

This package also includes the Phase 1 **2.5 s access-gate timeout** so the Facts tab never hangs black while waiting on Supabase.

---

## Install order (recommended)

### 1. Database (one-time)

```bash
# Apply migration on the OnSpace / Supabase project
supabase db push   # or run the SQL file manually in the SQL editor
```

File: `supabase/migrations/20260809_rv_catalog.sql`

Creates:

- `public.rv_catalog` (unique on `make, model`)
- `public.catalog_sync_logs`
- helper RPC `ensure_rv_catalog_table`

### 2. Edge Function

```text
supabase/functions/catalog-sync/   →  your project’s supabase/functions/catalog-sync/
```

Required secrets (OnSpace dashboard or `supabase secrets set`):

| Secret                        | Purpose                        |
|-------------------------------|--------------------------------|
| `SUPABASE_URL`                | Project URL                    |
| `SUPABASE_SERVICE_ROLE_KEY`   | Write access to `rv_catalog`   |
| `XAI_API_KEY`                 | Grok for model discovery       |

Deploy:

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

You can also POST to the function manually with the service-role key any time.

### 4. App-side files

```text
constants/rvData.ts      ←  constants/rvData.ts          (lean 50/368)
constants/rvReviews.ts   ←  constants/rvReviews.ts       (new file)
services/catalogSync.ts  ←  services/catalogSync.ts      (new file)
```

Optional but strongly recommended (prevents black-screen hang on access check):

```text
app/(tabs)/index.tsx     ←  patches/index.tsx
```

### 5. Wire the client refresh in RvFax

In `app/(tabs)/index.tsx` (or the patched version above):

**A. Import**

```tsx
import { refreshCatalogFromServer } from '@/services/catalogSync';
```

**B. One-time call on mount** (safe with the existing access-check `useEffect`)

```tsx
// Keep the in-memory RV_DATA catalog fresh from the daily Edge Function
useEffect(() => {
  refreshCatalogFromServer().catch(() => {});
}, []);
```

The call is de-duplicated / throttled, so it is also safe on focus listeners if you prefer.

### 6. Clean reload

```bash
npx expo start -c
```

---

## Verification

After deploy + one manual run of the function:

```sql
SELECT make, model, type, year_start, source, updated_at
FROM rv_catalog
ORDER BY updated_at DESC
LIMIT 20;

SELECT * FROM catalog_sync_logs ORDER BY ran_at DESC LIMIT 3;
```

On the client console you should see:

```
[catalogSync] Merged remote catalog — added N, updated M
```

UI checks:

- Cold open RvFACTS → content appears within ~2.5 s even offline (Phase 1 timeout)
- Search **2025 / 2026 → Jayco → Seneca** → diesel Cummins / Freightliner
- Search **Thor → Vegas / Axis**
- New models discovered overnight appear after the next `refreshCatalogFromServer` (or app restart)

---

## Files in this package

```
rvfax-catalog-active-v4-stable/
├── INTEGRATION.md
├── constants/
│   ├── rvData.ts          # lean 50 makes / ~368 models, YEARS 2000–2027
│   └── rvReviews.ts       # review pools (off boot path)
├── services/
│   └── catalogSync.ts     # throttled client merge
├── patches/
│   └── index.tsx          # Phase 1 access-gate 2.5 s fail-open
└── supabase/
    ├── functions/catalog-sync/index.ts
    └── migrations/20260809_rv_catalog.sql
```

---

## Notes / future

- New **makes** discovered by the daily job are merged into the live `RV_DATA` object. The static `MAKES` export is computed at module load; a soft restart surfaces brand-new manufacturers in the make picker.
- Do **not** re-drop a single 390 KB+ `rvData.ts` that glues reviews + catalog together — that caused the original black-screen regression.
- Cal / Tow / Trips screens were left untouched in this pass for stability.
- The Edge Function is intentionally conservative (priority makes only, max ~12 gap models per make) so a daily run stays fast and cheap while still closing the 2010–present catalog over time.
