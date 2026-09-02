# Tiffin 2019-2020 Catalog Walk-Back: Completion Summary

## PR Created
**PR #31:** https://github.com/soezrv-del/rv-reluanch/pull/31
- Branch: `cursor/tiffin-catalog-2019-2020-7488`
- Status: Ready for review (not draft)
- Build status: ✅ TypeScript typecheck passed
- Build status: ✅ Production build passed

## Work Completed

### Scope
Updated Tiffin motorhome catalog data for **model years 2019 and 2020 ONLY**, per David's walk-back plan:
- PR #27: 2025–2027 (merged) ✅
- PR #28: 2023–2024 (merged) ✅  
- PR #29: 2021–2022 (merged) ✅
- **PR #31: 2019–2020 (THIS PR)** ⬅️
- Next: 2017–2018

### Data Source
All corrections from **official Tiffin OEM brochures only**:
- Source: tiffinmotorhomes.com/resources/brochures/
- Model years 2019 and 2020 PDF brochures
- No data invented or copied from other years

### Models Updated (8 lines)
1. **Allegro Bus** - Corrected 2019-2020 floorplans
2. **Phaeton** - Added missing QBH/QKH plans, removed incorrect 36GH/45OH
3. **Allegro RED 340** - Corrected to single model 2019; fixed 2020
4. **Allegro RED 360** - Removed incorrect 36UA
5. **Allegro Breeze** - Corrected to 31BR/33BR (not 28BR/32BR)
6. **Open Road (Open Road Allegro)** - Removed incorrect 34PR
7. **Wayfarer** - Corrected Mercedes Sprinter Class C plans
8. **Zephyr** - Corrected flagship diesel plans (45MZ/45PZ in 2019)

### Key Corrections

#### Major fixes:
- **RED 340 vs RED 360 distinction** maintained (340=AL/LL naming, 360=AA/BA naming)
- **Allegro Bus 45MP** restored for 2019-2020 (was incorrectly 45CP/45BQ)
- **Phaeton 40QBH/40QKH** added (were missing from 2019-2020)
- **Zephyr 2020** corrected to single floorplan 45PZ per OEM
- **Breeze** corrected: 28BR and 32BR never existed in 2019-2020
- **Wayfarer** corrected: 25JW/25PW didn't exist until later years

#### Honesty maintained:
- Year-first approach: only data from 2019-2020 brochures used
- Gas ≠ diesel: powertrain distinctions preserved  
- No invented specifications
- Comments added to floorplansByYear entries citing specific brochures

### Verification
- Allegro Bay confirmed: DID NOT exist in 2019-2020 (starts MY2022)
- 36GH, 45OH Phaeton: NOT in 2019-2020 OEM brochures
- 28BR, 32BR Breeze: NOT in 2019-2020 OEM brochures
- All powertrain bands checked: already correct for 2019-2020

### Files Changed
- `src/lib/rv/rvData.ts`: 56 lines updated
- `tiffin-2019-2020-corrections.md`: 83 lines (documentation)
- Total: 2 files, 119 insertions, 20 deletions

### Next Steps
1. ✅ PR #31 created and ready for review
2. ⏳ Await CI/green check
3. ⏳ Merge when approved
4. ⬜ Next slice: **Tiffin 2017–2018** walk-back

## Notes for Next Slice (2017-2018)
- Continue working backwards 2 model years at a time
- Stop at MY2010 (do not go earlier)
- Source: OEM brochures 2017-2018 from same tiffinmotorhomes.com archive
- Same Tiffin lines: Bus, Phaeton, RED series, Breeze, Open Road, Wayfarer (started 2016), Zephyr
- Do NOT start Entegra/Jayco/Newmar/Fleetwood/Thor until Tiffin complete
