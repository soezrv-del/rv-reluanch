RvFOX / RvFACTS catalog — READ THIS FIRST
========================================

THE LIVE CATALOG (what the app and preview use)
  src/lib/rv/rvData.ts

Nothing in this folder is loaded by the app.
These JSON/CSV/ZIP files are backup snapshots only.

If two files both say “catalog”, ignore the copies.
Open RvFACTS in the preview — that is the real data.

archive/
  Old dated dumps (Aug 8–10 snapshots, corrected JSON copies, old zips).
  Safe to ignore.

Current snapshot files (optional backup, not live)
  rvfax-catalog-models.json / .csv / .txt
  rvfax-catalog-powertrain-by-year.csv
  rvfax-catalog-powertrain-gaps.json / .csv
  rvfax-catalog-export.zip

How a coach gets its engine/HP
  1. Dealer pin / local correction
  2. Brochure pin (src/lib/rv/powertrainCorrections.ts)
  3. Year + floorplan band inside rvData.ts
  4. Live Grok (narrative only unless catalog is empty)

2022 Newmar Ventana 4369 (your lot)
  Cummins L9 400 HP / 1,250 lb-ft · Freightliner XC tag · ~43' 10"
  4331 is not a real Newmar floorplan — use 4369.

Ventana LE (2012–2019)
  Separate model in the wizard. Cummins ISB 6.7 · 340 HP (short) / 360 HP (40').
