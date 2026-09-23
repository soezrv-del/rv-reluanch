/**
 * Live Voice spec turns speak from the shared spec engine.
 * Catalog first, then empty-field fallback. Never a memory snippet.
 * Extras stay on-screen prompts — the script does not load them.
 */

import type { DeskSheetPayload, DeskSheetRow } from "./deskSheet.ts";
import { looksLikeDeskSheetAsk } from "./deskSheetPolicy.ts";

export const VOICE_SPEC_ENGINE_INSTRUCTIONS =
  "Say exactly the SPEC ENGINE SCRIPT and then stop. Those numbers are the catalog and fallback chain for this turn. Do not add, replace, or estimate any spec from memory. Do not load NHTSA recalls, market value, videos, owner reviews, or a maintenance schedule. Those are on-screen prompts the user picks. If the script says a field was missed, say that and do not guess a number.";

const EXTRAS_OFFER =
  "Spec sheet is on the desk. You can pick recalls, market value, videos, owner reviews, or maintenance. I won't load those until you choose.";

function coachLine(sheet: DeskSheetPayload): string {
  return [sheet.year, sheet.make, sheet.model, sheet.floorplan]
    .filter(Boolean)
    .join(" ");
}

function isEmptyValue(value: string): boolean {
  const s = (value || "").trim();
  return (
    !s ||
    s === "GAP" ||
    s === "—" ||
    s === "–" ||
    s === "-" ||
    /confirm brochure/i.test(s)
  );
}

/** Spoken source for a painted row. Catalog when the fallback chain did not fill it. */
export function voiceSpecSourcePhrase(row: Pick<DeskSheetRow, "sourceUrl">): string {
  const url = row.sourceUrl || "";
  if (!url) return "from the catalog";
  if (/brochure|\.pdf(?:\?|$)/i.test(url)) return "from the OEM brochure";
  if (/rvusa\.com/i.test(url)) return "from RVUSA";
  if (/rvguide\.com/i.test(url)) return "from RV Guide";
  return "from dealer inventory";
}

function speakValue(value: string): string {
  const v = value.replace(/\*+$/g, "").trim();
  if (/\blbs?\b/i.test(v)) return v.replace(/\blbs?\b/i, "pounds");
  if (/\bgal\b/i.test(v)) return v.replace(/\bgal\b/i, "gallons");
  return v;
}

function askedLabels(query: string): string[] {
  const labels: string[] = [];
  if (/\b(uvw|dry\s+weight|unloaded)\b/i.test(query)) labels.push("UVW");
  if (/\bgvwr\b/i.test(query)) labels.push("GVWR");
  if (/\bccc\b|\bncc\b|\bpayload\b/i.test(query)) labels.push("CCC");
  if (/\bfuel\b/i.test(query)) labels.push("Fuel capacity");
  if (/\bfresh\b/i.test(query)) labels.push("Fresh");
  if (/\bgr[ae]y\b/i.test(query)) labels.push("Gray");
  if (/\bblack\b/i.test(query)) labels.push("Black");
  if (!labels.length && /\bweight\b/i.test(query)) {
    labels.push("GVWR", "UVW");
  }
  return labels;
}

function rowSpeech(row: DeskSheetRow, query: string): string {
  const dry =
    row.label === "UVW" &&
    (row.asterisk || /\bdry\s+weight\b/i.test(query))
      ? " dry weight"
      : "";
  return `${row.label}${dry} is ${speakValue(row.value)}, ${voiceSpecSourcePhrase(row)}.`;
}

/**
 * Exact words for a Live Voice spec turn. Empty / GAP stays a miss.
 * Does not invent a number the painted sheet does not contain.
 */
export function formatVoiceSpecEngineSpeech(
  sheet: DeskSheetPayload | null,
  query: string,
): string {
  if (!sheet) {
    return "Catalog and the fallback chain both missed this coach. I won't guess a number.";
  }
  const lines: string[] = [];
  const coach = coachLine(sheet);
  if (coach) lines.push(`${coach}.`);
  const asked = askedLabels(query);
  if (asked.length) {
    for (const label of asked) {
      const row = sheet.rows.find((r) => r.label === label);
      if (!row || row.gap || isEmptyValue(row.value)) {
        lines.push(
          `${label} is still missing after the catalog and the fallback chain. I won't guess.`,
        );
        continue;
      }
      lines.push(rowSpeech(row, query));
    }
  } else {
    const painted = sheet.rows.filter(
      (r) => !r.gap && !isEmptyValue(r.value) && r.value !== "N/A",
    );
    if (!painted.length) {
      lines.push(
        "Catalog and the fallback chain both missed the spec fields. I won't guess.",
      );
    } else {
      for (const row of painted.slice(0, 8)) lines.push(rowSpeech(row, query));
      if (painted.length > 8) {
        lines.push("The rest of the spec sheet is on the desk.");
      }
    }
  }
  lines.push(EXTRAS_OFFER);
  return lines.join(" ");
}

/** Live Voice spec cards offer extras. Chat sheets stay keyword-gated. */
export function withVoiceSpecExtras<T extends DeskSheetPayload>(
  sheet: T | null,
  query: string,
): T | null {
  if (!sheet || !looksLikeDeskSheetAsk(query)) return sheet;
  return { ...sheet, offerVoiceExtras: true };
}
