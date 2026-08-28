# Phase 3 — Wire Facts to lazy catalog

`patches/index.tsx` already includes this wiring. Copy it over `app/(tabs)/index.tsx` and you do not need to hand-edit the hooks.

If you keep the stock July-28 `index.tsx`, apply the following:

## 1. Import

```tsx
import {
  RV_DATA,
  MAKES,
  YEARS,
  CLASSIC_BRANDS,
  ensureCatalogLoaded,
  isCatalogLoaded,
} from '@/constants/rvData';
import type { RVSpec } from '@/constants/rvData';
import { refreshCatalogFromServer } from '@/services/catalogSync';
```

## 2. Catalog-ready state

Near other `useState` hooks:

```tsx
const [catalogReady, setCatalogReady] = useState(isCatalogLoaded());
```

## 3. Load on Facts mount (not app launch)

```tsx
useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      await ensureCatalogLoaded();
      // Optional: merge daily remote rows after local seed is in memory
      await refreshCatalogFromServer().catch(() => {});
    } finally {
      if (!cancelled) setCatalogReady(true);
    }
  })();
  return () => {
    cancelled = true;
  };
}, []);
```

## 4. Gate the search UI

While `!catalogReady`, show a short status instead of empty make lists:

```tsx
{!catalogReady ? (
  <View style={{ padding: 24, alignItems: 'center' }}>
    <ActivityIndicator color="#4A86F0" />
    <Text style={{ marginTop: 12, color: '#fff', opacity: 0.8 }}>
      Loading RV catalog…
    </Text>
  </View>
) : (
  /* existing search / year / make / model UI */
  null
)}
```

## Rules

- Do **not** call `ensureCatalogLoaded()` from the root layout or other tabs.
- Cal / Tow / Trips / Grok should keep importing types only if needed; avoid reading `RV_DATA` until Facts has loaded it (or call `ensureCatalogLoaded` there too if a screen truly needs models).
- `MAKES` is the same array reference — after load it is filled in place, so a re-render after `setCatalogReady(true)` is enough.
