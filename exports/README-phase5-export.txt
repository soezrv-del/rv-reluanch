RVFAX catalog export
Generated: 2026-08-10T04:16:39.695Z

Contents:
- rvfax-catalog-models.json / .csv / .txt — model catalog snapshot (if present)
- rvfax-catalog-powertrain-by-year.csv — year bands (if present)
- rvfax-catalog-powertrain-gaps.json / .csv — Phase 5.1 gap report
- rvfax-powertrain-pins.ts.txt — static brochure pins source
- rvfax-local-spec-overrides-template.json — import shape for dealer corrections

Gap summary:
- motorized: 210
- gaps: 0
- missing year-bands: 0
- null HP: 0

Truth stack:
1. Local correction (user)
2. Brochure pin
3. Year-band catalog
4. Validated Live (soft fields; hard only if empty+validated)
