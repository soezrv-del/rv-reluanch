/**
 * Facts weight web-search step.
 *
 * Runs only after lot overrides and catalog / OEM pins. A real lot or
 * catalog number is never replaced. Empty / GAP cells may take the first
 * credible search hit. Nothing here writes rvData, floorplanSpecs, or any
 * catalog file.
 */

export type WebWeightField = "uvw" | "gvwr" | "gcwr" | "hitch" | "ccc";

export type WebWeightOrigin = "web search" | "owner-reported";

export type CoachWeightClass = "towable" | "motorhome";

export type WebWeightFill = {
  field: WebWeightField;
  lbs: number;
  origin: WebWeightOrigin;
  sourceUrl: string;
  sourceTitle?: string;
  /** True when UVW was taken from a dry-weight phrase, not the word UVW. */
  asDryWeight?: boolean;
};

export type WeightPin = {
  field: WebWeightField;
  lbs: number | null;
  /** Lot override or catalog / OEM pin. Web search must not replace these. */
  pinned: boolean;
};

export type SearchHit = {
  title: string;
  snippet: string;
  url: string;
};

export type WeightGapBrochure = {
  gvwrLbs?: number | null;
  gvwr?: string | null;
  uvwLbs?: number | null;
  uvw?: string | null;
  uvwEstimated?: boolean | null;
  cccLbs?: number | null;
  ccc?: string | null;
  hitchOrPin?: string | null;
  hitchLabel?: string | null;
};

export const WEB_WEIGHT_FIELDS: readonly WebWeightField[] = [
  "uvw",
  "gvwr",
  "gcwr",
  "hitch",
  "ccc",
];

/** Inclusive pounds. UVW bands are the standing rule; other fields stay sane. */
export const WEB_WEIGHT_RANGES: Record<
  CoachWeightClass,
  Record<WebWeightField, readonly [number, number]>
> = {
  towable: {
    uvw: [2_000, 20_000],
    gvwr: [2_500, 30_000],
    gcwr: [4_000, 45_000],
    hitch: [200, 6_000],
    ccc: [200, 10_000],
  },
  motorhome: {
    uvw: [8_000, 50_000],
    gvwr: [10_000, 60_000],
    gcwr: [12_000, 90_000],
    hitch: [200, 8_000],
    ccc: [500, 20_000],
  },
};

const GENERIC_NAME = new Set([
  "coach",
  "series",
  "the",
  "and",
  "class",
  "diesel",
  "gas",
  "rv",
]);

const FIELD_KEYWORDS: Record<WebWeightField, RegExp[]> = {
  uvw: [
    /\buvw\b/i,
    /unloaded(?:\s+vehicle)?\s+weight/i,
    /\bunloaded\b/i,
    /dry\s+weight/i,
    /\bdry\s+wt\b/i,
    /\bweighed\b/i,
    /cat\s*scale/i,
  ],
  gvwr: [/\bgvwr\b/i, /gross\s+vehicle\s+weight(?:\s+rating)?/i],
  gcwr: [/\bgcwr\b/i, /gross\s+combined(?:\s+weight(?:\s+rating)?)?/i],
  hitch: [
    /pin\s+weight/i,
    /hitch\s+weight/i,
    /tongue\s+weight/i,
    /\bpin\s+wt\b/i,
    /\bhitch\s+wt\b/i,
  ],
  ccc: [/\bccc\b/i, /cargo\s+carrying\s+capacity/i],
};

const DRY_KEYWORD = /dry\s+weight|dry\s+wt/i;
const OWNER_KEYWORD =
  /cat\s*scale|weigh(?:ed|-\s*in| in)|owner|forum|irv2|rv\.net|my (?:coach|rig|unit)|we weighed|actual weight/i;

const NUMBER_RE = /(\d{1,3}(?:,\d{3})+|\d{3,6})(?!\s*%)/g;

export function coachWeightClass(
  rvType: string | null | undefined,
): CoachWeightClass {
  const t = (rvType || "").toLowerCase();
  if (
    /fifth|travel\s*trailer|toy\s*hauler|towable|popup|pop-up|folding|truck\s*camper|destination/.test(
      t,
    )
  ) {
    return "towable";
  }
  return "motorhome";
}

export function isWebWeightGapText(value: string | null | undefined): boolean {
  const t = String(value || "").trim();
  return (
    !t ||
    t === "GAP" ||
    t === "—" ||
    t === "–" ||
    t === "-" ||
    /^n\/?a\b/i.test(t) ||
    /confirm brochure/i.test(t) ||
    /set by tow vehicle/i.test(t)
  );
}

function parseDisplayLbs(value: string | null | undefined): number | null {
  if (isWebWeightGapText(value)) return null;
  const m = String(value).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

/**
 * Weight cells still empty after catalog pins and lot overrides.
 * Brochure GCWR is a formula (or "Set by tow vehicle"), not an OEM pin,
 * so GCWR stays eligible until a web hit fills it.
 */
export function weightGapsAfterLotAndCatalog(
  brochure: WeightGapBrochure,
): WebWeightField[] {
  const gaps: WebWeightField[] = [];
  const gvwrPinned =
    brochure.gvwrLbs != null &&
    brochure.gvwrLbs > 0 &&
    !isWebWeightGapText(brochure.gvwr);
  if (!gvwrPinned) gaps.push("gvwr");

  const uvwPinned =
    brochure.uvwEstimated !== true &&
    brochure.uvwLbs != null &&
    brochure.uvwLbs > 0 &&
    !isWebWeightGapText(brochure.uvw);
  if (!uvwPinned) gaps.push("uvw");

  gaps.push("gcwr");

  const hitchLbs = parseDisplayLbs(brochure.hitchOrPin);
  const hitchEstimated = /est\./i.test(brochure.hitchLabel || "");
  if (hitchLbs == null || hitchEstimated) gaps.push("hitch");

  const cccPinned =
    brochure.cccLbs != null &&
    brochure.cccLbs > 0 &&
    !isWebWeightGapText(brochure.ccc);
  if (!cccPinned) gaps.push("ccc");
  return gaps;
}

export function weightPinsFromBrochure(brochure: WeightGapBrochure): WeightPin[] {
  const gaps = new Set(weightGapsAfterLotAndCatalog(brochure));
  return WEB_WEIGHT_FIELDS.map((field) => {
    const pinned = !gaps.has(field);
    let lbs: number | null = null;
    if (pinned && field === "gvwr") lbs = brochure.gvwrLbs ?? null;
    if (pinned && field === "uvw") lbs = brochure.uvwLbs ?? null;
    if (pinned && field === "hitch") lbs = parseDisplayLbs(brochure.hitchOrPin);
    if (pinned && field === "ccc") lbs = brochure.cccLbs ?? null;
    return { field, lbs, pinned };
  });
}

/**
 * Named Facts step. Drops any hit whose field is already a lot or catalog pin.
 * Does not mutate the pin list or the candidate list.
 */
export function fillWeightGapsFromWebSearch(
  pins: readonly WeightPin[],
  fills: readonly WebWeightFill[],
): WebWeightFill[] {
  const pinned = new Set(pins.filter((pin) => pin.pinned).map((pin) => pin.field));
  const out: WebWeightFill[] = [];
  for (const fill of fills) {
    if (pinned.has(fill.field)) continue;
    if (out.some((row) => row.field === fill.field)) continue;
    if (!WEB_WEIGHT_FIELDS.includes(fill.field)) continue;
    if (!Number.isFinite(fill.lbs) || fill.lbs <= 0) continue;
    out.push(fill);
  }
  return out;
}

export function formatWebWeightLbs(lbs: number): string {
  return `${Math.round(lbs).toLocaleString("en-US")} lbs`;
}

function normToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function nameTokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !GENERIC_NAME.has(token));
}

function textHasToken(text: string, token: string): boolean {
  if (!token) return false;
  const re = new RegExp(`(?:^|[^a-z0-9])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[^a-z0-9]|$)`, "i");
  return re.test(text);
}

function floorplanTokens(text: string): string[] {
  const found = new Set<string>();
  const lettered = /\b(\d{2,4}[a-z]{1,4})\b/gi;
  let match: RegExpExecArray | null;
  while ((match = lettered.exec(text))) {
    found.add(match[1]!.toUpperCase());
  }
  // Bare 4-digit plans (4369). Skip years and numbers that are weights ("8500 lbs").
  const numeric = /\b(\d{4})\b(?!\s*(?:lbs?|pounds?)\b)/gi;
  while ((match = numeric.exec(text))) {
    if (!/^(19|20)\d{2}$/.test(match[1]!)) found.add(match[1]!);
  }
  return [...found];
}

function inRange(field: WebWeightField, coach: CoachWeightClass, lbs: number): boolean {
  const [min, max] = WEB_WEIGHT_RANGES[coach][field];
  return lbs >= min && lbs <= max;
}

type NumberHit = { lbs: number; index: number };

function numbersIn(text: string): NumberHit[] {
  const out: NumberHit[] = [];
  const re = new RegExp(NUMBER_RE.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const raw = match[1]!.replace(/,/g, "");
    if (/^(19|20)\d{2}$/.test(raw)) continue;
    const lbs = Number(raw);
    if (!Number.isFinite(lbs)) continue;
    out.push({ lbs, index: match.index });
  }
  return out;
}

function nearestFloorplan(
  text: string,
  index: number,
  tokens: readonly string[],
): string | null {
  const lower = text.toLowerCase();
  let best: { token: string; dist: number } | null = null;
  for (const token of tokens) {
    const needle = token.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const at = lower.indexOf(needle, from);
      if (at < 0) break;
      const dist = Math.abs(at - index);
      if (!best || dist < best.dist) best = { token: token.toUpperCase(), dist };
      from = at + needle.length;
    }
  }
  return best?.token ?? null;
}

export type WeightParseContext = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  field: WebWeightField;
  coachType: CoachWeightClass;
  gvwrLbs?: number | null;
};

function identityOk(text: string, ctx: WeightParseContext): boolean {
  const year = String(ctx.year || "").trim();
  if (!year || !textHasToken(text, year)) return false;
  const makeTokens = nameTokens(ctx.make);
  if (makeTokens.length && !makeTokens.some((token) => textHasToken(text, token))) {
    return false;
  }
  const modelTokens = nameTokens(ctx.model);
  if (modelTokens.length && !modelTokens.every((token) => textHasToken(text, token))) {
    return false;
  }
  const fp = normToken(ctx.floorplan).toUpperCase();
  if (!fp || !text.toUpperCase().includes(fp)) return false;
  return true;
}

function parseHitForField(
  hit: SearchHit,
  ctx: WeightParseContext,
): WebWeightFill | null {
  const text = `${hit.title || ""} ${hit.snippet || ""}`.replace(/\s+/g, " ").trim();
  if (!text || !identityOk(text, ctx)) return null;

  const fp = normToken(ctx.floorplan).toUpperCase();
  const plans = floorplanTokens(text);
  const keywords = FIELD_KEYWORDS[ctx.field];
  const weak =
    ctx.field === "uvw"
      ? keywords.filter((keyword) => keyword.source === "\\bweighed\\b" || keyword.source === "cat\\s*scale")
      : [];
  const strong = keywords.filter((keyword) => !weak.includes(keyword));

  const nearestNumber = (list: RegExp[]) => {
    let best: { lbs: number; index: number; keyword: string; dist: number } | null = null;
    const nums = numbersIn(text);
    for (const keyword of list) {
      const flags = keyword.flags.includes("g") ? keyword.flags : `${keyword.flags}g`;
      const re = new RegExp(keyword.source, flags);
      let match: RegExpExecArray | null;
      while ((match = re.exec(text))) {
        const at = match.index;
        const word = match[0]!;
        const afterEnd = at + word.length;
        const after = nums.filter(
          (num) => num.index >= at && num.index - afterEnd <= 40,
        );
        const before = nums.filter(
          (num) => num.index < at && at - num.index <= 24,
        );
        const picked = after[0] ?? before[before.length - 1];
        if (!picked) continue;
        const dist = Math.abs(picked.index - at);
        if (!best || dist < best.dist) {
          best = { lbs: picked.lbs, index: picked.index, keyword: word, dist };
        }
      }
    }
    return best;
  };

  const best = nearestNumber(strong) ?? nearestNumber(weak);
  if (!best) return null;

  const nearest = nearestFloorplan(text, best.index, plans);
  if (nearest && nearest !== fp) return null;

  if (!inRange(ctx.field, ctx.coachType, best.lbs)) return null;
  if (
    ctx.field === "uvw" &&
    ctx.gvwrLbs != null &&
    ctx.gvwrLbs > 0 &&
    best.lbs > ctx.gvwrLbs
  ) {
    return null;
  }

  const url = (hit.url || "").trim();
  if (!/^https?:\/\//i.test(url)) return null;

  const owner = OWNER_KEYWORD.test(text);
  return {
    field: ctx.field,
    lbs: Math.round(best.lbs),
    origin: owner ? "owner-reported" : "web search",
    sourceUrl: url,
    sourceTitle: (hit.title || "").trim() || undefined,
    asDryWeight: ctx.field === "uvw" && DRY_KEYWORD.test(best.keyword) ? true : undefined,
  };
}

/** First hit in search order that passes the credibility filter. */
export function firstCredibleWeight(
  hits: readonly SearchHit[],
  ctx: WeightParseContext,
): WebWeightFill | null {
  for (const hit of hits) {
    const fill = parseHitForField(hit, ctx);
    if (fill) return fill;
  }
  return null;
}

export function credibleWeightsFromHits(
  hits: readonly SearchHit[],
  ctx: Omit<WeightParseContext, "field"> & { fields: readonly WebWeightField[] },
): WebWeightFill[] {
  const out: WebWeightFill[] = [];
  for (const field of ctx.fields) {
    const fill = firstCredibleWeight(hits, { ...ctx, field });
    if (fill) out.push(fill);
  }
  return out;
}

/** Recorded search document for the dev fixture. Parser still has to accept it. */
export const RECORDED_ASPIRE_44R_HITS: readonly SearchHit[] = [
  {
    title: "2025 Entegra Aspire 44B dry weight",
    snippet:
      "2025 Entegra Coach Aspire 44B dry weight is 36,100 lbs on a CAT scale weigh-in.",
    url: "https://www.irv2.com/forums/f278/2025-entegra-aspire-44b-weigh-in.html",
  },
  {
    title: "2025 Entegra Aspire 44R CAT scale weigh-in",
    snippet:
      "Owner weighed our 2025 Entegra Coach Aspire 44R unloaded at a CAT scale. UVW 38,420 lbs. GVWR sticker is 49,000.",
    url: "https://www.irv2.com/forums/f278/2025-entegra-aspire-44r-cat-scale-weigh-in.html",
  },
];

export function isRecordedAspire44R(identity: {
  year?: string | null;
  make?: string | null;
  model?: string | null;
  floorplan?: string | null;
}): boolean {
  const year = String(identity.year ?? "").trim();
  const make = (identity.make || "").toLowerCase();
  const model = (identity.model || "").toLowerCase();
  const fp = normToken(identity.floorplan || "");
  return (
    year === "2025" &&
    make.includes("entegra") &&
    model.includes("aspire") &&
    fp === "44r"
  );
}
