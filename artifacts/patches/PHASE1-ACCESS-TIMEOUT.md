# Phase 1 — Access check timeout (no more black hang)

## What changed
`app/(tabs)/index.tsx` access gate:

- **2.5s hard timeout** on Supabase profile + allow-list calls
- On timeout / network failure → **fail-open to `allowed`** if the user is signed in (app paints instead of hanging black)
- Missing phone → open phone modal and set `denied` (no infinite spinner)
- Signed-out users still get `denied` as before

## Install
1. Keep using the working lean catalog:
   - `constants/rvData.ts` ← `artifacts/rvData.WORKING-july28.ts` (or your current working copy)
2. Replace your app file:
   - `app/(tabs)/index.tsx` ← `artifacts/patches/index.tsx`
3. Reload:
   ```bash
   npx expo start -c
   ```

## Do not
- Do not re-drop the 390KB rich-merged `rvData.ts` until Phase 2 (incremental catalog growth)

## Verify
- Cold open RvFACTS: loading text should clear within ~2.5s even offline
- Other tabs should still paint immediately
- Phone allow-list still works when Supabase responds
