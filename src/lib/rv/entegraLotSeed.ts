/**
 * Entegra Coach Anthem lot-record fills from the RV Country scrape
 * dated 2026-09-25 (public/inventory/own-lot-latest.json).
 *
 * Anthem only. One row per year + model + floorplan. Not an OEM brochure pin.
 * Unflagged numbers fill holes (empty cells, floorplan-digit lengths, and
 * the series lengthRange fallback). overridesCatalog is only for a lot
 * value that beats a non-OEM catalog number (series seed / range / estimate).
 * An OEM pin, OEM floorplan row, or in-repo brochure value is never flagged:
 * when the lot disagrees, the lot number stays in sourceNote as a cross-check.
 */

import type { LotCatalogSeedRow } from "./lotCatalogSeed.ts";

export type EntegraLotSeedRow = LotCatalogSeedRow & {
  sourceNote: string;
};

export const ENTEGRA_LOT_SEED: EntegraLotSeedRow[] = [
  {
    year: 2025,
    make: "Entegra Coach",
    model: "Anthem",
    trim: "37K",
    title: "2025 Entegra Coach Anthem 37K",
    stock_number: "44497",
    vehicle_body_length: 38.17,
    source: "RV Country lot unit record",
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Length (ft) · id 36556 / stock 44497 · Fills hole: Length 38.17 ft replaces series lengthRange fallback 43' 6\" (rvData Anthem lengthRange [42, 45] midpoint; no OEM length row). Cross-check only (OEM wins): lot GVWR 41,000 lb does not replace OEM pin 44,000 lb (OEM_GVWR_PINS, Entegra Anthem 37K, model years 2024–2025, dated RVUSA Anthem brochures).",
  },
  {
    year: 2017,
    make: "Entegra Coach",
    model: "Anthem",
    trim: "44DLQ",
    title: "2017 Entegra Coach Anthem 44DLQ",
    stock_number: "UPB9838",
    max_sleeping_count: 8,
    source: "RV Country lot unit record",
    overridesCatalog: {
      max_sleeping_count: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Sleeps · id 196779 / stock UPB9838 · Overrides catalog: Sleeps 8 replaces 6 (rvData series seed)",
  },
];
