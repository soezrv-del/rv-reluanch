# RV Facts Catalog — Active Daily Sync (v3 — 2026-08-08)

## What runs once a day

Edge Function: `supabase/functions/catalog-sync`

1. Scans priority manufacturers for **new models** in the current and previous model year.
2. Runs a **gap fill** for 2010–present: asks Grok which important production lines are still missing from `rv_catalog` and upserts them.
3. Writes results into `public.rv_catalog` and a summary into `catalog_sync_logs`.

Schedule (example pg_cron / Supabase scheduled function):

```sql
-- 06:00 UTC daily
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

Required secrets on the function: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `XAI_API_KEY`.

## App-side sync

File: `services/catalogSync.ts` (copy from this folder)

On RvFax tab mount / app focus:

```ts
import { refreshCatalogFromServer } from '@/services/catalogSync';

useEffect(() => {
  refreshCatalogFromServer().catch(() => {});
}, []);
```

This merges any newly discovered remote rows into the in-memory `RV_DATA` so the UI reflects the latest catalog without waiting for an app-store release.

## Static seed (this refresh)

`constants/rvData.ts` (this folder) is the offline / first-paint source of truth.

**41 makes · 187 models · YEARS 2000–2027**

Newly added in this active update (2026-08-08):
- Airstream **World Traveler** 17RB (most affordable silver bullet, ~$64k)
- Winnebago **Elora** 19DC (narrow-body ProMaster Class C + EcoFlow)
- Keystone **Walkabout** (atrium-style 22MAX / 26MAX)
- Jayco **Comet** (compact ProMaster Class B)
- Coachmen **Pixel** (sub-18 ft Class B)

Previously retained 2026 introductions:
- Newmar Grand Star / Freedom Aire / Summit Aire
- Grand Design Lineage / Lineage Series E
- Winnebago Thrive / EKKO / Alora
- Tiffin Open Trail / GH2 / GT2
- Airstream Usonian Limited Edition
- Entegra Centurion Super C

Copy `rvData.ts` → `constants/rvData.ts` and `catalogSync.ts` → `services/catalogSync.ts`, then deploy the Edge Function + migration SQL.
