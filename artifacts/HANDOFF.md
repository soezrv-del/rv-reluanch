# RvFOX / RvFACTS — handoff for the next Grok

**Date:** 2026-08-28  
**Founder:** David Hansen (RvDesk) — 30 years RV retail, every seat including GM / Director of Operations at a large Southern California dealership. Not a developer. Lives the lot.  
**This zip is the live Build sandbox as of this date.** Unzip and treat `src/` as the app.

---

## What this product is

Premium RV decision suite on one phone:

| Tab | Job |
|---|---|
| **Facts** | Year → Type → Make → Model → Floorplan wizard. Specs, recalls, market, compare. |
| **Cal** | Payment / OTD from price, ZIP tax, term, credit band. Loan-origination path is the money. |
| **Tow** | Truck/SUV vs coach hitch / GVWR. |
| **Trips** | RV-friendly routing + dump locator. |
| **Grok** | Lot chat. Not catalog truth. |
| **More** | Support / legal / extras. |

**Shopper outcome:** decide on the coach (powertrain, recalls, payment shape, tow).  
**Dealer outcome:** close the unit in front of you without leaving the customer.  
**Not:** TrueRVs / MatchRV listings clone. Not Rapidious sold-comp. Not a lead-gen website.

Consumer revenue is not the thesis. **Banks pay for funded deals off Cal (B2B).** Other commercial pieces are withheld pending lock-down / NDA.

---

## Live catalog (source of truth)

**File:** `src/lib/rv/rvData.ts`  
~50 makes, ~400 model entries, `YEARS` 2027 → 2002.  
Wizard: **Year → Type → Make → Model → Floorplan**. Year change clears type.

Also in this zip:

- `catalog/rvfax-catalog-models.json` / `.csv` — snapshot (may lag the TS file)
- `catalog/rv_catalog.json` / `.csv` — older artifacts snapshot
- `src/lib/rv/powertrainCorrections.ts` — brochure pins (Vision gas, RED ISB, Kountry Star diesel, etc.)
- `src/lib/rv/floorplanSpecs.ts` — OEM layout notes when we have them
- `src/lib/rv/localSpecOverrides.ts` — dealer/user corrections on device

**Do not** load the giant rich-merge catalogs from old drop-ins as the boot module. A ~390KB `rvData.ts` black-screened the app. Stay on this lean seed; grow incrementally.

---

## Hard rules (do not regress)

1. **Never let any model (Grok, Gemini, demo) write engine / HP / chassis / transmission / fuel into cache.** Pin stamps brochure truth; otherwise strip hard fields on save and on read. Schema: `VERIFIED_CACHE_SCHEMA = 9`. Server dossier `CACHE_VER = v22-catalog-hard-lock`.
2. **If live research fails, keep catalog year-band on the report and say live failed.** Do not treat a cache peek as a successful live refresh.
3. **Chat may fall back so the tab is not dead, but label it unverified.** Demo / `X-Upstream: demo` never merges into Facts.
4. **No invented 450 HP.** No sibling-model powertrain steal. No floorplan-letter decoding (37BH is not “bunkhouse”).
5. **Catalog / pin wins over live narrative.** `lockPowertrainFromCatalog: true`. Live fills *empty* hard fields only if validated **and** confidence is medium/high — display only, not cache.
6. **Gemini is not a spec writer in this tree.** GitHub RVFAX (`lookup-motorhome`, `motorhome-ai-chat`) still has Gemini/OnSpace — that is a different codebase. Do not port it in.

Truth stack for a coach:

1. Local correction  
2. Brochure pin  
3. Year-band + floorplan band in `rvData.ts`  
4. Live Grok — overview, issues, market only  

---

## Key files

```
src/lib/rv/rvData.ts                 catalog
src/lib/rv/catalog.ts                wizard cascade
src/lib/rv/powertrainCorrections.ts  pins
src/lib/rv/livePowertrainGuard.ts    live vs catalog
src/lib/rv/verifiedCatalogCache.ts   local cache (strip hard fields)
src/lib/rv/liveDossier.ts            fetch + merge
src/routes/api/rvfax.dossier.ts      live research API
src/routes/api/rvgrok.ts             chat (xAI / worker / demo)
src/lib/rvgrok/prompts.ts            chat rules
src/lib/marketcheck/                 local inventory (asking comps)
src/components/rvfax/RvDetail.tsx    report
src/components/rvfax/RvCompare.tsx   compare (no black label overlay)
src/components/rvfax/RvFaxApp.tsx    wizard
```

Stack: React 19, TanStack Start, Vite, Tailwind v4, Capacitor 8 (iOS + Android). Preview: `npm run dev` → `0.0.0.0:8080`. Keep `/workspace/startup.sh`.

---

## Market values (Rapidious)

Do **not** scrape dealer sites / RV Trader. Rapidious infers “sold” from public listings disappearing — they do not read DMS.

This app already has **Marketcheck** (`/api/marketcheck/search`) for ZIP comps + median **asking**. That is the consumer mini-version. Label it asking / EST., not sold tape. Expand `stats=price` + first-seen before building a crawler.

---

## App Store / web

- Capacitor iOS under `ios/`. See `TESTFLIGHT.md`, `UPDATE-XCODE.md`.
- Legal pages: `public/privacy.html`, `public/support.html`. Domain `rvfox.app` was still DNS-pending; live legal was on Vercel `rvfox-legal`.
- Website = front door. App = lot tool. Same numbers.

---

## How to start in a new Grok Build

1. Unzip into `/workspace` (or copy `src/`, `public/`, `package.json`, configs).
2. `npm install` if `node_modules` is missing.
3. Write `/workspace/startup.sh` to run `npm run dev` on `0.0.0.0:8080` if it is not already there.
4. Do not ask David to run terminal. He is the operator, not the developer.
5. Speak salesman language. Do not invent HP. Do not gold-plate MatchRV.

Secrets stay out of this zip: `XAI_API_KEY`, `MARKETCHECK_API_KEY`, `CLOUDFLARE_WORKER_URL`, `DATABASE_URL`.
