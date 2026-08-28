# RV Facts Catalog — Active Daily Update (v4)  
**Target codebase:** July-28 RVFAX Expo drop (`code 8:28.zip`)

## What this does

Once per day the system:

1. **New-model scan** — asks Grok for every distinct model line in active production for the **current year + prior year** across all priority manufacturers.
2. **Gap fill** — for each priority make, shows Grok the models already known and asks for important missing production lines from **2010 → present** (max ~12 per make per run). This steadily closes historical gaps without a full industry re-scan every day.
3. **Upsert** into `public.rv_catalog` (unique on `make, model`).
4. The mobile/web app calls `refreshCatalogFromServer()` on RvFax mount (throttled). New rows are merged into the in-memory `RV_DATA` so users see the latest catalog **without an App Store release**.

Static seed in this package: **50+ makes / 366+ models (rich merge 2026-08-12), `YEARS` = **2000–2027**.

---

## 1. Database (one-time)

Run the migration on the OnSpace / Supabase project:

```
supabase/migrations/20260809_rv_catalog.sql
```

Creates:

- `public.rv_catalog` (unique on `make, model`)
- `public.catalog_sync_logs`
- helper RPC `ensure_rv_catalog_table`

## 2. Edge Function

Copy the entire folder into the project:

```
supabase/functions/catalog-sync/   →  your project’s supabase/functions/catalog-sync/
```

Required secrets (OnSpace dashboard or `supabase secrets set`):

| Secret                      | Purpose                        |
|-----------------------------|--------------------------------|
| `SUPABASE_URL`              | Project URL                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Write access to `rv_catalog`   |
| `XAI_API_KEY`               | Grok for model discovery       |

Deploy:

```bash
supabase functions deploy catalog-sync
```

### Daily schedule (recommended 06:00 UTC)

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

You can also trigger it manually with the service-role key.

## 3. App-side client merge

Copy:

```
services/catalogSync.ts  →  services/catalogSync.ts
```

Then in `app/(tabs)/index.tsx` (main `RvFaxScreen`):

**A. Add the import** near the other `@/` imports:

```tsx
import { refreshCatalogFromServer } from '@/services/catalogSync';
```

**B. Add a one-time refresh on mount** (right after the existing access-check `useEffect` is fine):

```tsx
// Keep the in-memory RV_DATA catalog fresh from the daily Edge Function
useEffect(() => {
  refreshCatalogFromServer().catch(() => {});
}, []);
```

The call is de-duplicated / throttled, so it is also safe on focus listeners if you prefer.

## 4. Static seed (offline / first paint)

Replace the existing file:

```
constants/rvData.ts  →  constants/rvData.ts
```

This updates:

- Model count 169 → **189**
- YEARS span to **2027**
- Adds 2026 intros already known (Airstream World Traveler 17RB, Winnebago Elora / Thrive / EKKO, Keystone Walkabout, Jayco Comet, Coachmen Pixel, Newmar Grand Star / Freedom Aire / Summit Aire, Grand Design Lineage / Series E, etc.)

**Optional UI polish** (so the era labels stay accurate):

In `app/(tabs)/index.tsx` change the two hardcoded year strings:

- `'2000–2026'` → `'2000–2027'`
- the modern-era placeholder `'2026'` → `'2027'` (or just leave it; YEARS drives the actual picker)

## 5. Verification

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

---

## Files in this drop-in

```
rvfax-catalog-active-v4-dropin/
├── INTEGRATION.md
├── constants/rvData.ts          # 50+ makes / 366+ models (rich merge 2026-08-12), YEARS 2000–2027
├── services/catalogSync.ts      # client merge (throttled)
└── supabase/
    ├── functions/catalog-sync/index.ts
    └── migrations/20260809_rv_catalog.sql
```

Drop these into the corresponding locations in the July-28 RVFAX project, set the three secrets, schedule the daily job, and the catalog stays continuously up to date.
