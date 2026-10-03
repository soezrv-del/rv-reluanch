/**
 * Floorplan garage pins. The book is passed in. This file does not read disk.
 */

export type GaragePin = {
  garage_length_in: number | null;
  source: string;
  source_url: string;
  confidence: string;
  notes: string;
  checked_at: string;
};

export type GaragePinBook = Record<string, GaragePin>;

type Named = {
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  body_type?: string;
};

function normalizeToken(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Same key as scripts/pin-garages.mjs. */
export function floorplanPinKey(unit: Named): string {
  const year = String(unit.year ?? "").replace(/\.0$/, "").trim();
  const make = normalizeToken(unit.make);
  const model = normalizeToken(unit.model);
  const plan = normalizeToken(unit.trim);
  if (!year || !make || !plan) return "";
  return [year, make, model, plan].join("|");
}

export function isToyHaulerBody(body: string | undefined): boolean {
  return /toy hauler/i.test(body || "");
}

/** "16-foot garage" is stored as a 15–17 band. The ask is 16, not 15. */
export function garageAskFeet(min?: number, max?: number): number | undefined {
  if (min == null && max == null) return undefined;
  if (min != null && max != null && Math.abs(max - min - 2) < 0.01) return min + 1;
  return min ?? max;
}

export function highGaragePin(book: GaragePinBook, unit: Named): GaragePin | null {
  const pin = book[floorplanPinKey(unit)];
  if (!pin || pin.confidence !== "high" || pin.garage_length_in == null) return null;
  return pin;
}

export function garagePinConfirmed(book: GaragePinBook, unit: Named): boolean {
  return highGaragePin(book, unit) != null;
}

export function splitPinnedGarages<T extends Named>(
  units: T[],
  book: GaragePinBook,
  askFeet: number,
): { pinned: T[]; unpinned: number; sources: string[] } {
  const need = askFeet * 12;
  const pinned: T[] = [];
  const sources: string[] = [];
  let unpinned = 0;
  for (const unit of units) {
    if (!isToyHaulerBody(unit.body_type)) continue;
    const pin = highGaragePin(book, unit);
    if (pin && (pin.garage_length_in as number) >= need) {
      pinned.push(unit);
      sources.push(pin.source);
      continue;
    }
    if (!pin) unpinned += 1;
  }
  return { pinned, unpinned, sources };
}

export function garageSourceSentence(sources: string[]): string {
  const unique = [...new Set(sources)];
  const one = unique.length === 1 ? unique[0] : "";
  const from =
    one === "spec_field"
      ? "the spec sheet"
      : one === "feed"
        ? "the sheet's cargo length"
        : one === "floorplan_label"
          ? "a printed floorplan label"
          : one === "manufacturer_web"
            ? "the manufacturer page"
            : one === "brochure_pdf" || one === "window_sticker_pdf"
              ? "the brochure"
              : "the pinned sheet";
  return `Garage length is from ${from}. Confirm the fit with the dealer or manufacturer before quoting it.`;
}

/** One sentence. Not a guess about a coach that has no pin. */
export function garageFitSentence(askFeet: number | undefined): string {
  if (askFeet == null) return "";
  if (askFeet >= 16) {
    return "A four-seat UTV generally wants about 16 feet, measured with the bumper and spare on.";
  }
  if (askFeet >= 14) {
    return "A 14-foot garage is the usual fit for a two-seat side-by-side with a little tie-down room.";
  }
  return "";
}

export function unpinnedGarageLine(count: number): string {
  if (!count) return "";
  return `Another ${count} toy haulers don't have a pinned garage length; check the floorplan.`;
}
