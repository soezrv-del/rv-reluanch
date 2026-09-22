/**
 * Structured coach report — Google AI Mode shape for an explicit
 * specs / report / CARFAX-style / year-make-model ask.
 *
 * Chat bubble is source of truth. Desk paints from that same block.
 * Live Voice speaks a short ear-friendly summary; the four sections
 * live in the transcript / desk. Never invent OEM numbers.
 */

import {
  chatSpecCoversPaintedFields,
  extractChatSpecFigures,
  type ChatSpecFigures,
} from "./chatSpecBlock.ts";
import { parseCoachFromText } from "./parseCoach.ts";
import { extractVerifiedPinsFromText } from "./estimatePolicy.ts";
import {
  looksLikeCatalogAnswerableCoachCompare,
  looksLikeCasualNonResearch,
  looksLikeInventoryOrCountQuestion,
  looksLikeMarketValueQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikeRepairQuestion,
  looksLikeSpecQuestion,
  normalizeAskText,
} from "./webIntent.ts";

export const COACH_REPORT_SECTION_HEADINGS = [
  "Overview",
  "Chassis & powertrain",
  "Weights & capacity",
  "Layout & amenities",
] as const;

export type CoachReportSectionHeading =
  (typeof COACH_REPORT_SECTION_HEADINGS)[number];

export type CoachReportSection = {
  heading: CoachReportSectionHeading;
  lines: string[];
};

export type CoachReport = {
  title: string;
  sections: CoachReportSection[];
  figures: ChatSpecFigures;
};

const REPORT_PHRASE_RE =
  /\b(spec(?:s|ification)?\s+report|full\s+specs?|spec\s*sheet|carfax|coach\s+report|rundown|brochure\s+spec)\b/i;

const EST_NEAR_RE = /\b(EST\.?|typical class range|low confidence)\b/i;

const FIGURE_KEYS = [
  "rvClass",
  "engine",
  "horsepower",
  "torque",
  "chassis",
  "transmission",
  "fuel",
  "gvwr",
  "uvw",
  "gcwr",
  "fuelCapacity",
  "towCapacity",
  "freshWater",
  "grayWater",
  "blackWater",
] as const satisfies ReadonlyArray<keyof ChatSpecFigures>;

const CATALOG_WINS: ReadonlySet<keyof ChatSpecFigures> = new Set([
  "engine",
  "horsepower",
  "torque",
  "chassis",
  "transmission",
  "fuel",
  "rvClass",
  "gvwr",
  "uvw",
  "gcwr",
]);

/**
 * Explicit coach report / full specs / CARFAX-style / named YMM ask.
 * Not inventory, not a pure compare, not lifestyle, not repair-only.
 */
export function looksLikeCoachReportAsk(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  if (looksLikeInventoryOrCountQuestion(t) && !looksLikeSpecQuestion(t)) {
    return false;
  }
  if (looksLikeRepairQuestion(t) && !REPORT_PHRASE_RE.test(t)) {
    return false;
  }
  if (
    looksLikeMarketValueQuestion(t) &&
    !looksLikeSpecQuestion(t) &&
    !REPORT_PHRASE_RE.test(t)
  ) {
    return false;
  }
  if (
    looksLikeCatalogAnswerableCoachCompare(t) &&
    !looksLikeSpecQuestion(t) &&
    !REPORT_PHRASE_RE.test(t)
  ) {
    return false;
  }
  if (REPORT_PHRASE_RE.test(t)) return true;
  if (looksLikeSpecQuestion(t)) return true;
  if (looksLikeNamedCoachProductQuestion(t)) return true;
  return false;
}

/** Research-note contract for a coach report — not 4–8 skinny bullets. */
export function coachReportResearchLengthRule(
  profile: "chat" | "voice",
): string {
  if (profile === "voice") {
    return "VOICE COACH REPORT notes: collect labeled facts under Overview · Chassis & powertrain · Weights & capacity · Layout & amenities (compact). The desk/transcript needs those facts. Spoken answer stays 2–4 ear-friendly sentences — do not read every heading aloud.";
  }
  return "CHAT COACH REPORT: labeled RESEARCH NOTES under Overview · Chassis & powertrain · Weights & capacity · Layout & amenities. Year-matched OEM / factory brochure / dealer facts only. No URLs unless they uniquely identify a bulletin. Never invent a number. Omit a heading when nothing was found.";
}

export const COACH_REPORT_CHAT_RULE = `EXPLICIT COACH REPORT / SPECS / CARFAX-STYLE / YEAR-MAKE-MODEL ASK: the written reply in the chat bubble is a structured four-section report — Overview · Chassis & powertrain · Weights & capacity · Layout & amenities. Salesman-readable. No markdown citation soup. Only facts from live WEB RESEARCH notes and catalog pins — never invent OEM numbers. Omit a heading when search+catalog did not name it. The desk card paints from this same chat block. Do not emit a second markdown Spec Sheet that re-GAPs a VERIFIED field.

LIVE VOICE: speak a short ear-friendly summary (class, power, one weight). The structured report lives in the transcript and on the desk.`;

export const COACH_REPORT_DRAFT_PREAMBLE =
  "COACH REPORT DRAFT (write this structure in chat; only these grounded facts — never invent; omit empty headings). The written chat reply IS this four-section report. The desk card paints from the same block. Live Voice: speak a short ear-friendly summary only.";

function cleanLine(raw: string): string {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/^[\s,:;–—\-•*]+/, "")
    .replace(/[.;,]+$/, "")
    .trim();
}

function titleFromQuery(query: string): string {
  const parsed = parseCoachFromText(query || "");
  return [parsed.year, parsed.make, parsed.model, parsed.floorplan]
    .filter(Boolean)
    .join(" ");
}

function figuresFromVerifiedPins(catalogBlock?: string): ChatSpecFigures {
  const out: ChatSpecFigures = {};
  for (const pin of extractVerifiedPinsFromText(catalogBlock || "")) {
    const [label, lbs] = pin.split(" ");
    const n = Number(lbs);
    if (!label || !Number.isFinite(n) || n < 1_000) continue;
    const formatted = `${Math.round(n).toLocaleString("en-US")} lb`;
    if (label === "GVWR") out.gvwr = formatted;
    if (label === "UVW") out.uvw = formatted;
    if (label === "GCWR") out.gcwr = formatted;
  }
  return out;
}

function mergeFigures(
  notes: ChatSpecFigures,
  catalog: ChatSpecFigures,
): ChatSpecFigures {
  const out: ChatSpecFigures = { ...notes };
  for (const key of FIGURE_KEYS) {
    const pin = (catalog[key] || "").trim();
    const live = (notes[key] || "").trim();
    if (pin && CATALOG_WINS.has(key)) {
      out[key] = pin;
      continue;
    }
    if (!live && pin) out[key] = pin;
  }
  return out;
}

function sentenceCandidates(text: string): string[] {
  return (text || "")
    .replace(/\bCONFIRMED:\s*(yes|no)\b/gi, " ")
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => cleanLine(s))
    .filter((s) => s.length >= 28 && !EST_NEAR_RE.test(s));
}

function firstMatchLine(text: string, re: RegExp): string | null {
  const m = text.match(re);
  if (!m?.[0]) return null;
  const around = text.slice(
    Math.max(0, (m.index ?? 0) - 12),
    Math.min(text.length, (m.index ?? 0) + m[0].length + 80),
  );
  if (EST_NEAR_RE.test(around)) return null;
  const line = cleanLine(around.split(/[.\n]/)[0] || m[0]);
  return line || null;
}

function layoutLinesFromNotes(notes: string): string[] {
  const t = notes || "";
  const found: string[] = [];
  const add = (line: string | null) => {
    const next = cleanLine(line || "");
    if (!next || EST_NEAR_RE.test(next)) return;
    if (found.some((x) => x.toLowerCase() === next.toLowerCase())) return;
    found.push(next);
  };

  add(
    firstMatchLine(
      t,
      /\b(\d{1,2})\s*(?:full[- ]wall\s+)?slide(?:-?outs?)?\b/i,
    ),
  );
  add(firstMatchLine(t, /\bsleeps?\s+\d+\b/i));
  add(
    firstMatchLine(
      t,
      /\b(?:king|queen|bunks?|sofa\s+sleeper|sleeping)\b[^.\n]{0,60}/i,
    ),
  );
  add(
    firstMatchLine(
      t,
      /\b(?:bath[- ]and[- ]a[- ]half|private\s+(?:master\s+)?bath|half[- ]bath|full\s+bath)\b[^.\n]{0,50}/i,
    ),
  );
  add(
    firstMatchLine(
      t,
      /\b(?:gourmet\s+kitchen|residential\s+(?:refrigerator|fridge)|island\s+cooktop|kitchen)\b[^.\n]{0,70}/i,
    ),
  );
  add(
    firstMatchLine(
      t,
      /\b(?:rear\s+suite|master\s+suite|washer(?:\/|\s+and\s+)dryer|king\s+bed)\b[^.\n]{0,70}/i,
    ),
  );
  add(
    firstMatchLine(
      t,
      /\b(?:\d+(?:\.\d+)?\s*(?:ft|feet)|length)\b[^.\n]{0,40}/i,
    ),
  );
  add(
    firstMatchLine(
      t,
      /\b(?:awning|generator|outdoor\s+entertainment|leveling|full[- ]wall\s+slide)\b[^.\n]{0,60}/i,
    ),
  );
  return found.slice(0, 8);
}

function overviewLines(
  notes: string,
  title: string,
  figures: ChatSpecFigures,
): string[] {
  const lines: string[] = [];
  const identity = [title, figures.rvClass].filter(Boolean).join(" — ");
  const sentences = sentenceCandidates(notes).filter((s) => {
    if (/^[-*]/.test(s)) return false;
    if (/^(overview|chassis|weights?|layout)\b/i.test(s)) return false;
    return (
      /\b(class\s*[abc]|diesel|pusher|motorhome|coach|floorplan)\b/i.test(s) ||
      (identity && s.toLowerCase().includes(title.split(" ").slice(-1)[0]?.toLowerCase() || "___never___"))
    );
  });
  if (sentences[0]) {
    lines.push(sentences[0]);
  }
  return lines;
}

function powertrainLines(figures: ChatSpecFigures): string[] {
  const lines: string[] = [];
  if (figures.chassis) lines.push(`Chassis: ${figures.chassis}`);
  const power = [figures.engine, figures.horsepower, figures.torque]
    .filter(Boolean)
    .join(", ");
  if (power) lines.push(`Engine: ${power}`);
  if (figures.transmission) lines.push(`Transmission: ${figures.transmission}`);
  if (figures.fuel) lines.push(`Fuel: ${figures.fuel}`);
  return lines;
}

function weightLines(figures: ChatSpecFigures): string[] {
  const lines: string[] = [];
  if (figures.gvwr) lines.push(`GVWR: ${figures.gvwr}`);
  if (figures.uvw) lines.push(`UVW: ${figures.uvw}`);
  if (figures.gcwr) lines.push(`GCWR: ${figures.gcwr}`);
  if (figures.towCapacity) lines.push(`Tow / hitch: ${figures.towCapacity}`);
  if (figures.fuelCapacity) lines.push(`Fuel tank: ${figures.fuelCapacity}`);
  const tanks = [
    figures.freshWater ? `fresh ${figures.freshWater}` : "",
    figures.grayWater ? `gray ${figures.grayWater}` : "",
    figures.blackWater ? `black ${figures.blackWater}` : "",
  ].filter(Boolean);
  if (tanks.length) lines.push(`Holding tanks: ${tanks.join(", ")}`);
  return lines;
}

/**
 * Build a four-section report from live research notes + catalog pins.
 * Empty headings are omitted. Never invent a number or amenity.
 */
export function buildCoachReportFromNotes(opts: {
  notes: string;
  catalogBlock?: string;
  query?: string;
}): CoachReport {
  const notes = (opts.notes || "").trim();
  const catalog = (opts.catalogBlock || "").trim();
  const title = titleFromQuery(opts.query || "") || "";
  const fromNotes = extractChatSpecFigures(notes);
  const fromCatalog = mergeFigures(
    extractChatSpecFigures(catalog),
    figuresFromVerifiedPins(catalog),
  );
  const figures = mergeFigures(fromNotes, fromCatalog);

  const sections: CoachReportSection[] = [];
  const overview = overviewLines(notes, title, figures);
  if (overview.length) {
    sections.push({ heading: "Overview", lines: overview });
  }
  const power = powertrainLines(figures);
  if (power.length) {
    sections.push({ heading: "Chassis & powertrain", lines: power });
  }
  const weights = weightLines(figures);
  if (weights.length) {
    sections.push({ heading: "Weights & capacity", lines: weights });
  }
  const layout = layoutLinesFromNotes(notes);
  if (layout.length) {
    sections.push({ heading: "Layout & amenities", lines: layout });
  }

  return { title, sections, figures };
}

/** Salesman-readable chat block — not markdown citation soup. */
export function formatCoachReportChat(report: CoachReport): string {
  if (!report.sections.length) return "";
  const parts: string[] = [];
  if (report.title) parts.push(report.title, "");
  for (const section of report.sections) {
    parts.push(section.heading);
    for (const line of section.lines) {
      parts.push(`• ${line}`);
    }
    parts.push("");
  }
  return parts.join("\n").trim();
}

/** 2–4 spoken sentences. Numbers only when the report named them. */
export function formatCoachReportVoiceCue(report: CoachReport): string {
  const f = report.figures;
  const bits: string[] = [];
  if (report.title) {
    const klass = f.rvClass ? `, ${f.rvClass}` : "";
    bits.push(`${report.title}${klass}.`);
  }
  const power = [f.engine, f.horsepower, f.torque].filter(Boolean).join(", ");
  if (power) {
    const trans = f.transmission ? ` and a ${f.transmission}` : "";
    bits.push(`${power}${trans}.`);
  }
  if (f.gvwr) bits.push(`GVWR ${f.gvwr}.`);
  else if (f.uvw) bits.push(`UVW ${f.uvw}.`);
  const amenity = report.sections.find((s) => s.heading === "Layout & amenities")
    ?.lines[0];
  if (amenity) bits.push(`${amenity}.`);
  return bits.join(" ").replace(/\s+/g, " ").trim();
}

export function coachReportHasPaintedFigures(report: CoachReport): boolean {
  return chatSpecCoversPaintedFields(report.figures);
}

export function formatCoachReportDraftInjection(
  notes: string,
  opts?: { catalogBlock?: string; query?: string },
): string {
  const report = buildCoachReportFromNotes({
    notes,
    catalogBlock: opts?.catalogBlock,
    query: opts?.query,
  });
  const body = formatCoachReportChat(report);
  if (!body) return "";
  return `${COACH_REPORT_DRAFT_PREAMBLE}\n${body}`;
}

/**
 * Timeout / empty browse: still write the four-section report from
 * whatever live notes + catalog pins exist. GVWR pin wins. Never invent.
 */
export function formatCoachReportTimeoutReply(opts: {
  notes?: string;
  catalogBlock?: string;
  query?: string;
}): string {
  return formatCoachReportChat(
    buildCoachReportFromNotes({
      notes: opts.notes || "",
      catalogBlock: opts.catalogBlock,
      query: opts.query,
    }),
  );
}

/** Catalog-pin notes when live search timed out — honest, no invented OEM. */
export function formatCatalogPinTimeoutNotes(opts: {
  catalogBlock?: string;
  query?: string;
}): string {
  const body = formatCoachReportTimeoutReply({
    notes: "",
    catalogBlock: opts.catalogBlock,
    query: opts.query,
  });
  if (!body) return "";
  return `CONFIRMED: yes (catalog pin).\n${body}`;
}
