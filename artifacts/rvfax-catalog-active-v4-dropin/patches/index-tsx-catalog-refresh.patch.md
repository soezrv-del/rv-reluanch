# Minimal changes required in `app/(tabs)/index.tsx`

## 1. Import (near other `@/` imports, ~line 14–16)

```tsx
import { refreshCatalogFromServer } from '@/services/catalogSync';
```

## 2. Refresh on mount (inside `RvFaxScreen`, after the access-check useEffect ~line 1055)

```tsx
  // Keep the in-memory RV_DATA catalog fresh from the daily Edge Function
  // (new models from 2010–present + current/prior year intros).
  // Throttled + de-duplicated inside the service — safe to call on every focus too.
  useEffect(() => {
    refreshCatalogFromServer().catch(() => {});
  }, []);
```

## 3. Optional year-label polish

Search for the string `2000–2026` and change to `2000–2027`.

Search for the modern-era placeholder that shows `'2026'` and change to `'2027'` (or derive from `YEARS[0]`).
