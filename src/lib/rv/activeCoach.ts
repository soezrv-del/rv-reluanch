/**
 * Last Facts (RvFACTS) coach the user actually selected.
 * Chat / Live Voice read this so “what’s the HP?” uses the open report
 * instead of inventing a sibling powertrain.
 *
 * Cal / Tow also read price, GVWR, and class so Finance and tow matching
 * follow the open report — not a leftover F-350 + fifth-wheel demo.
 *
 * Not a Facts cache. Chat answers never write here.
 */

export type ActiveCoach = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  rvType?: string;
  /** Best available purchase price (retail low, else retail high, else MSRP mid). */
  price?: number;
  gvwrLbs?: number;
  uvwLbs?: number;
  towingCapacityLbs?: number;
  updatedAt: string;
};

export type ActiveCoachInput = {
  year?: string;
  make?: string;
  model?: string;
  floorplan?: string;
  rvType?: string;
  price?: number;
  gvwrLbs?: number;
  uvwLbs?: number;
  towingCapacityLbs?: number;
};

const STORAGE_KEY = "rvfax.activeCoach.v1";

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function cleanText(v?: string | null): string {
  return String(v ?? "").trim();
}

function cleanLbs(v?: number | null): number | undefined {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return undefined;
  return Math.round(v);
}

function identitiesMatch(
  a: { year?: string; make?: string; model?: string; floorplan?: string },
  b: { year?: string; make?: string; model?: string; floorplan?: string },
): boolean {
  return (
    cleanText(a.year) === cleanText(b.year) &&
    cleanText(a.make).toLowerCase() === cleanText(b.make).toLowerCase() &&
    cleanText(a.model).toLowerCase() === cleanText(b.model).toLowerCase() &&
    cleanText(a.floorplan).toLowerCase() === cleanText(b.floorplan).toLowerCase()
  );
}

export function readActiveCoach(): ActiveCoach | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeActiveCoach(JSON.parse(raw) as ActiveCoach);
  } catch {
    return null;
  }
}

export function normalizeActiveCoach(
  p: Partial<ActiveCoach> | null | undefined,
): ActiveCoach | null {
  if (!p?.year?.toString().trim() || !p?.make?.toString().trim() || !p?.model?.toString().trim()) {
    return null;
  }
  return {
    year: String(p.year).trim(),
    make: String(p.make).trim(),
    model: String(p.model).trim(),
    floorplan: String(p.floorplan || "").trim(),
    rvType: p.rvType ? String(p.rvType).trim() : undefined,
    price: cleanLbs(p.price),
    gvwrLbs: cleanLbs(p.gvwrLbs),
    uvwLbs: cleanLbs(p.uvwLbs),
    towingCapacityLbs: cleanLbs(p.towingCapacityLbs),
    updatedAt: p.updatedAt || "",
  };
}

/**
 * Persist the desk’s active coach. Same year/make/model/floorplan keeps
 * price / GVWR from the last report so the wizard doesn’t wipe Cal/Tow.
 */
export function writeActiveCoach(sel: ActiveCoachInput | null): ActiveCoach | null {
  if (!canUseStorage()) return normalizeActiveCoach(sel as ActiveCoach);
  try {
    if (!sel?.year?.trim() || !sel.make?.trim() || !sel.model?.trim()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const prev = readActiveCoach();
    const keep = prev && identitiesMatch(prev, sel) ? prev : null;
    const next: ActiveCoach = {
      year: sel.year.trim(),
      make: sel.make.trim(),
      model: sel.model.trim(),
      floorplan: (sel.floorplan || "").trim(),
      rvType: sel.rvType?.trim() || keep?.rvType,
      price: cleanLbs(sel.price) ?? keep?.price,
      gvwrLbs: cleanLbs(sel.gvwrLbs) ?? keep?.gvwrLbs,
      uvwLbs: cleanLbs(sel.uvwLbs) ?? keep?.uvwLbs,
      towingCapacityLbs: cleanLbs(sel.towingCapacityLbs) ?? keep?.towingCapacityLbs,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return normalizeActiveCoach(sel as ActiveCoach);
  }
}

export function clearActiveCoach(): void {
  writeActiveCoach(null);
}

export function activeCoachKey(c: ActiveCoach | null | undefined): string {
  if (!c) return "";
  return [
    c.year,
    c.make,
    c.model,
    c.floorplan,
    c.price ?? "",
    c.gvwrLbs ?? "",
    c.rvType ?? "",
  ].join("|");
}

/** Short sticky-bar name: "American Dream · 45A" */
export function formatActiveCoachShort(c: Pick<ActiveCoach, "model" | "floorplan" | "year" | "make">): string {
  const name = [c.model, c.floorplan].filter((x) => cleanText(x)).join(" · ");
  return name || `${c.year} ${c.make}`.trim();
}

/** Chip: "2023 American Coach American Dream · 45A" */
export function formatActiveCoachChip(
  c: Pick<ActiveCoach, "year" | "make" | "model" | "floorplan">,
): string {
  const core = [c.year, c.make, c.model].filter((x) => cleanText(x)).join(" ");
  return c.floorplan ? `${core} · ${c.floorplan}` : core;
}

export function parseWeightLbs(value?: string | number | null): number | undefined {
  if (typeof value === "number") return cleanLbs(value);
  if (!value) return undefined;
  const nums = String(value)
    .replace(/,/g, "")
    .match(/\d+/g);
  if (!nums?.length) return undefined;
  if (nums.length >= 2) {
    const a = parseInt(nums[0]!, 10);
    const b = parseInt(nums[1]!, 10);
    if (a > 0 && b > 0) return Math.round((a + b) / 2);
  }
  return cleanLbs(parseInt(nums[0]!, 10));
}

export function bestCalPrice(input: {
  price?: number | null;
  retailLow?: number | null;
  retailHigh?: number | null;
  msrpLo?: number | null;
  msrpHi?: number | null;
} | null | undefined): number {
  if (!input) return 0;
  const midMsrp =
    typeof input.msrpLo === "number" &&
    input.msrpLo > 0 &&
    typeof input.msrpHi === "number" &&
    input.msrpHi > 0
      ? Math.round((input.msrpLo + input.msrpHi) / 2)
      : null;
  const candidates = [
    input.price,
    input.retailLow,
    input.retailHigh,
    midMsrp,
    input.msrpLo,
    input.msrpHi,
  ];
  for (const n of candidates) {
    if (typeof n === "number" && Number.isFinite(n) && n > 0) {
      return Math.round(n);
    }
  }
  return 0;
}

export type CoachTowRole = "motorhome" | "towable" | "unknown";

/** Class A/B/C / Super C tows a toad. Fifth wheels / trailers are the RV side. */
export function coachTowRole(type?: string | null): CoachTowRole {
  const t = (type || "").toLowerCase();
  if (!t) return "unknown";
  if (
    /fifth\s*wheel|travel\s*trailer|toy\s*hauler|pop-?up|teardrop|truck\s*camper|hybrid|towable/.test(
      t,
    )
  ) {
    return "towable";
  }
  if (/class\s*[abc]|super\s*c|motorhome|diesel\s*pusher/.test(t)) {
    return "motorhome";
  }
  return "unknown";
}

export function towableRvType(
  type?: string | null,
): "Fifth Wheel" | "Travel Trailer" {
  return /fifth/i.test(type || "") ? "Fifth Wheel" : "Travel Trailer";
}

export type TowPrefill =
  | { kind: "motorhome"; coach: ActiveCoach }
  | {
      kind: "towable";
      coach: ActiveCoach;
      rvType: "Fifth Wheel" | "Travel Trailer";
      gvwrLbs: number;
    }
  | { kind: "none" };

export function towPrefillFromCoach(coach: ActiveCoach | null): TowPrefill {
  if (!coach) return { kind: "none" };
  const role = coachTowRole(coach.rvType);
  if (role === "motorhome") return { kind: "motorhome", coach };
  if (role === "towable") {
    return {
      kind: "towable",
      coach,
      rvType: towableRvType(coach.rvType),
      gvwrLbs: coach.gvwrLbs && coach.gvwrLbs > 0 ? coach.gvwrLbs : 0,
    };
  }
  return { kind: "none" };
}

export function snapshotActiveCoach(input: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  rvType?: string;
  price?: number | null;
  gvwr?: string | number | null;
  uvw?: string | number | null;
  towingCapacityLbs?: number | null;
}): ActiveCoachInput {
  return {
    year: input.year,
    make: input.make,
    model: input.model,
    floorplan: input.floorplan,
    rvType: input.rvType,
    price: bestCalPrice({ price: input.price }),
    gvwrLbs: parseWeightLbs(input.gvwr),
    uvwLbs: parseWeightLbs(input.uvw),
    towingCapacityLbs: cleanLbs(input.towingCapacityLbs ?? undefined),
  };
}
