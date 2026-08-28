# RV Facts Catalog — Active Daily Update (v4)

**Goal:** Once per day the system  
1. Scans for **new models** in the current + previous model year,  
2. Runs a **gap fill** for every important production line from **2010 → present**,  
3. Upserts the results into `public.rv_catalog`,  
4. The mobile / web app merges those rows into the in-memory `RV_DATA` so users always see the latest catalog without an App Store release.

---

## 1. Database (one-time)

Run the migration on the OnSpace / Supabase project:

```bash
# or paste the contents of:
supabase/migrations/20260809_rv_catalog.sql
```

This creates:

- `public.rv_catalog` (unique on `make, model`)
- `public.catalog_sync_logs`
- helper RPC `ensure_rv_catalog_table`

## 2. Edge Function

Copy the entire folder:

```
supabase/functions/catalog-sync/   →  your project’s supabase/functions/catalog-sync/
```

Required secrets on the function (set in the OnSpace dashboard or `supabase secrets set`):

| Secret                    | Purpose                          |
|---------------------------|----------------------------------|
| `SUPABASE_URL`            | Project URL                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Write access to `rv_catalog`   |
| `XAI_API_KEY`             | Grok for model discovery         |

Deploy:

```bash
supabase functions deploy catalog-sync
```

### Daily schedule (06:00 UTC recommended)

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

You can also trigger it manually from any HTTP client with the service-role key.

## 3. App-side client merge

Copy:

```
services/catalogSync.ts  →  services/catalogSync.ts
```

Then in the main RvFax tab (`app/(tabs)/index.tsx`) add a one-time refresh on mount:

```tsx
import { refreshCatalogFromServer } from '@/services/catalogSync';

// inside the main component
useEffect(() => {
  refreshCatalogFromServer().catch(() => {});
}, []);
```

The call is throttled / de-duplicated, so it is safe to put on focus listeners as well.

## 4. Static seed (offline / first paint)

Replace the existing file with the updated seed:

```
constants/rvData.ts  →  constants/rvData.ts
```

Current seed (v4):

- **41 makes**
- **189 models (incl. Thor Vegas + Axis)**
- `YEARS` span **2000 – 2027**

Recent 2026 lines already present:

- Airstream World Traveler 17RB  
- Winnebago Elora 19DC, Thrive, EKKO, Alora  
- Keystone Walkabout  
- Jayco Comet  
- Coachmen Pixel  
- Newmar Grand Star / Freedom Aire / Summit Aire  
- Grand Design Lineage / Series E  
- Tiffin Open Trail / GH2 / GT2  
- Entegra Centurion Super C  
- Airstream Usonian Limited Edition  

Any newer models discovered by the daily Edge Function appear in the UI the next time the app refreshes the remote catalog.

## 5. How the daily scan works

**Phase 1 – New-model scan**  
For every priority manufacturer × {current year, previous year} the function asks Grok for every distinct model line in production. Results are normalized and queued for upsert.

**Phase 2 – 2010–present gap fill**  
For each priority make the function shows Grok the models we already know, then asks for important missing production lines from 2010 onward (max 12 per make). This steadily closes historical gaps without re-scanning the entire industry every day.

**Phase 3 – Upsert**  
All discoveries are written to `rv_catalog` with `ON CONFLICT (make, model)`. A summary is stored in `catalog_sync_logs`.

## 6. Verification

After deploying and running the function once:

```sql
SELECT make, model, type, year_start, source, updated_at
FROM rv_catalog
ORDER BY updated_at DESC
LIMIT 20;

SELECT * FROM catalog_sync_logs ORDER BY ran_at DESC LIMIT 3;
```

On the client you should see a console log similar to:

```
[catalogSync] Merged remote catalog — added 4, updated 12
```

---

**Files in this package**

```
rvfax-catalog-active-v4/
├── INTEGRATION.md
├── constants/rvData.ts
├── services/catalogSync.ts
└── supabase/
    ├── functions/catalog-sync/index.ts
    └── migrations/20260809_rv_catalog.sql
```

Drop these into the corresponding locations in the RVFAX Expo project, set the three secrets, schedule the daily job, and the catalog will stay continuously up to date.
