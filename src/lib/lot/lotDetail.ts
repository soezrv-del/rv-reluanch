import { buildBuyerUnitReport, type BuyerReportSection } from "../rv/reportFields.ts";
import { LOT_GAP, lotPriceOrGap, type LotUnit } from "./ownLotPage.ts";

/** Already on the photo, the name line, or the glance. Not repeated below. */
const ALREADY_ON_CARD = new Set(["Condition", "Location", "Type", "Sleeps"]);

function moneyDigits(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

/**
 * Open-card sections. Same keep list as the one-page RvFAX report.
 * The sticker is the Price row. MSRP stays only when it is a different number.
 */
export function lotOpenSections(unit: LotUnit): BuyerReportSection[] {
  const report = buildBuyerUnitReport(unit);
  const sticker = lotPriceOrGap(unit.price);
  return report.sections
    .map((part) => {
      let rows = part.rows.filter((row) => !ALREADY_ON_CARD.has(row.label));
      if (part.title === "Price") {
        const msrp = rows.find((row) => row.label === "MSRP");
        const next: { label: string; value: string }[] = [];
        if (sticker !== LOT_GAP) next.push({ label: "Price", value: sticker });
        if (msrp && moneyDigits(msrp.value) !== moneyDigits(sticker)) {
          next.push(msrp);
        }
        rows = next;
      }
      return { title: part.title, rows };
    })
    .filter((part) => part.rows.length > 0);
}
