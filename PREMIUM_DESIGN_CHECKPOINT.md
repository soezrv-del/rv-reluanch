# Premium design checkpoint — 2026-08-02

**Mark / restore point** before (and documenting after) the full “top designer apps” recommendation set.

## Restore code from this mark

```bash
cp /workspace/checkpoints/premium-pre-2026-08-02/shell/* /workspace/src/components/shell/
cp /workspace/checkpoints/premium-pre-2026-08-02/rvfax/* /workspace/src/components/rvfax/
cp /workspace/checkpoints/premium-pre-2026-08-02/styles/styles.css /workspace/src/styles.css
cp /workspace/checkpoints/premium-pre-2026-08-02/lib/liveDossier.ts /workspace/src/lib/rv/liveDossier.ts
```

## Snapshot location

`/workspace/checkpoints/premium-pre-2026-08-02/`  
Files: AppShell, Launchpad, SapphireHeader, BottomTabs, RvDetail, RvFaxApp, SelectSheet, styles.css, liveDossier.ts

## Recommendation set

### Already in at mark time
- Progressive catalog → live report (instant then update)
- Launchpad (orange front door, CSS highlight crawl)
- Page accent map (sapphire / gold Cal / ruby Grok)
- Token pass (muted emerald, cool gold, ice muted)
- Discovery floorplans brochure-aligned (36Q 38K 38N 38W)

### Implemented after mark (this session)
1. **Stronger form scrims** — `page-scrim-strong` on Facts / Cal / Tow / Trips / Detail  
2. **Report AT A GLANCE** — powertrain · safety · market summary hero  
3. **Live field flash** — engine/HP/chassis/length/GVWR/market flash when live lands + success haptic  
4. **Type scale + ice labels** — CSS utilities + SpecRow / market tiles  
5. **Haptics** — tabs, launchpad, select sheet, live complete (`src/lib/haptics.ts`)  
6. **Sheet polish** — `sheet-rise` on SelectSheet  
7. **Quieter status copy** — REFINING / ESTIMATE language  
8. **Coach photos** — still dual-face media until real assets (noted, not forced)

### Design north star
void + one light + perfect type + one action + trust that whispers  
Orange launchpad door · sapphire workshop inside · $1M coach sales floor feel

### Peer references
Apple HIG · Tesla app · Porsche configurator · private banking dark · Linear · CARFAX trust structure
