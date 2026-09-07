/**
 * Repair-mode playbook for RvGROK chat + Live Voice.
 *
 * Detect a diagnose/fix ask, then inject coach-aware rails.
 * Catalog never stores OEM service procedures — browse when this
 * fires, and never invent torque, part numbers, wiring colors, or
 * a sensor bypass.
 */

import { coachTowRole } from "../rv/activeCoach.ts";

/** Curly quotes from phones — same fold as webIntent.normalizeAskText. */
export function normalizeRepairAsk(text: string): string {
  return (text || "").replace(/[\u2018\u2019\u201B\u2032]/g, "'");
}

/**
 * Strong repair / fault language — enough on its own.
 * Kept tighter than LIVE_RESEARCH_RE so "how many slides" / "propane
 * capacity" stay spec questions.
 */
const STRONG_REPAIR_RE =
  /\b(troubleshoot(?:ing)?|diagnos(?:e|is|ing)|repair(?:s|ing)?|fix(?:es|ing)?|leaking|leaks?|won'?t\s+start|will\s+not\s+start|doesn'?t\s+start|does\s+not\s+start|(?:error|fault|dtc)\s*codes?|check[- ]engine|what(?:'s|\s+is)\s+wrong|what\s+should\s+i\s+(?:check|do|try|inspect)|not\s+working|stopped\s+working|no\s+(?:heat|hot\s+water|ignition|spark)|clicks?\s+but|blown\s+fuse|bypass(?:ing)?\s+(?:the\s+)?sensor)\b/i;

const REPAIR_SYSTEM_RE =
  /\b(propane|lp\s?gas|lpg|slides?|slide[- ]outs?|aquahot|aqua[- ]hot|hydronic|furnace|water\s+heater|(?:air\s+)?cond(?:itioner)?|\bac\b|refrigerat(?:or|ion)|fridge|generator|genset|inverter|converter|awning|jacks?|level(?:ing|ers?)|(?:black|gray|grey|fresh)\s+tanks?|water\s+pump|toilet|batter(?:y|ies)|fuse|breaker|wiring|wires?|brakes?|tires?|carbon\s+monoxide|\bco\s+detect)\b/i;

const REPAIR_PROBLEM_RE =
  /\b(won'?t|will\s+not|doesn'?t|does\s+not|leak|broken|stuck|jammed|dead|failed|failing|(?:not|isn'?t|ain'?t)\s+(?:working|heating|cooling|lighting|charging|retracting|extending|igniting)|no\s+(?:heat|power|ignition|hot\s+water)|clicks?|hiss(?:ing)?|smell(?:s|ing)?|error|fault|alarm|code|dtc|diagnos|repair|fix|troubleshoot)\b/i;

const LIFESTYLE_OR_PAYMENT_RE =
  /\b(full[- ]?tim(?:e|ing)|snowbird|lifestyle|worth\s+it|vs\.?\s+hotels?|van\s+life|why\s+rv|weekend\s+warrior|retiring\s+on\s+the\s+road|second\s+home|monthly\s+payment|loan\s+payment|apr\b|interest\s+rate|amortiz|out[- ]the[- ]door|\botd\b|financing|payment\s+on\s+\$)\b/i;

export type RepairCoachLock = {
  year?: string;
  make?: string;
  model?: string;
  floorplan?: string;
  rvType?: string | null;
  chassis?: string | null;
  fuelType?: string | null;
  source?: string;
};

/**
 * Source-lock patterns the playbook must discourage.
 * Tests assert these strings stay in the rails — not that the model
 * cannot emit them (that's prompt process, not a regex filter).
 */
export const REPAIR_NO_INVENT_PATTERNS = [
  "torque spec",
  "part number",
  "wiring color",
  "bypass the sensor",
] as const;

export const REPAIR_PLAYBOOK = `REPAIR PLAYBOOK (this turn is a repair / diagnose ask):
You are a cautious coach — not a certified RV technician. Life-safety systems (LP / propane, 120V shore or inverter, carbon monoxide, brakes, tires, structure) are pro-only beyond a visual check or a published owner-manual step.

ORDER (do not skip):
1) Clarify symptoms — one short question if the failure mode is fuzzy (when it started, last change, smell, codes on a panel, LP valve / 120V state).
2) Likely causes — ranked, each labeled uncertain / common / less likely. Never one confident diagnosis.
3) Safety stops FIRST — LP leak / hiss / rotten-egg: leave, no sparks, shut supply only if safe, call a pro. 120V shock: unplug or kill the breaker before opening a box. CO alarm: get out, ventilate, pro. Brakes / tires / frame / axle / slide structure: do not drive or force; dealer or tech.
4) DIY-safe vs dealer/tech required — owner-manual visual checks, published resets, an obvious breaker / LP valve, and "check NHTSA for this year/make/model." Torque jobs, a part number, a wiring color, a sensor bypass, opening a sealed LP or high-voltage assembly, or a lift = dealer/tech.
5) The catalog is specs, not a service manual. Prefer WEB RESEARCH notes and NHTSA / recall lookup when the catalog has no procedure. If notes cannot support a step, say: "I don't have that OEM procedure — look it up in the coach or appliance manual, or call a tech." Empty / uncertain beats confident-wrong.

NO-INVENT RAILS (non-negotiable):
- Never invent a torque spec, part number, wiring color, or "just bypass the sensor."
- Never invent a TSB or campaign number.
- Do not give generic Class A engine / AquaHot / generator tips for a travel trailer, or trailer dump / hitch-only tips for a locked motorhome. Use LOCKED COACH below.
- Chat is not the Facts report. Do not write these answers into Facts cache.`;

export const REPAIR_VOICE_PLAYBOOK = `REPAIR this turn: clarify symptoms → ranked uncertain causes → safety stops (LP, 120V, CO, brakes, tires, structure) → DIY-safe vs dealer/tech. Not a certified RV tech; life-safety = pro. Never invent a torque spec, part number, wiring color, or "bypass the sensor." If you lack an OEM procedure, say so and point to the manual, a tech, or NHTSA. Ground to the locked coach class — no Class A tips on a trailer.`;

export const REPAIR_STANDING_VOICE = `If they ask to repair / diagnose / fix a leak, no-start, error code, propane, slide, AquaHot, furnace, or similar: follow symptoms → ranked uncertain causes → safety (LP, 120V, CO, brakes, tires, structure) → DIY-safe vs pro. Not a certified tech. Never invent a torque spec, part number, wiring color, or a sensor bypass. Catalog has no service procedure — prefer a web/NHTSA lookup over a guessed DIY.`;

export function looksLikeRepairQuestion(text: string): boolean {
  const t = normalizeRepairAsk(text).trim();
  if (!t) return false;
  if (LIFESTYLE_OR_PAYMENT_RE.test(t) && !STRONG_REPAIR_RE.test(t)) {
    return false;
  }
  if (STRONG_REPAIR_RE.test(t)) return true;
  return REPAIR_SYSTEM_RE.test(t) && REPAIR_PROBLEM_RE.test(t);
}

export function formatRepairCoachLock(lock?: RepairCoachLock | null): string {
  const year = (lock?.year || "").trim();
  const make = (lock?.make || "").trim();
  const model = (lock?.model || "").trim();
  const floorplan = (lock?.floorplan || "").trim();
  const coach = [year, make, model, floorplan].filter(Boolean).join(" ");
  const rvType = (lock?.rvType || "").trim();
  const chassis = (lock?.chassis || "").trim();
  const fuel = (lock?.fuelType || "").trim();
  const role = coachTowRole(rvType);

  if (!coach && !rvType) {
    return [
      "LOCKED COACH: none this turn.",
      "Ask year / make / model / class in one beat before class-specific steps. Do not assume a Class A diesel or a travel trailer.",
    ].join("\n");
  }

  const lines = [
    `LOCKED COACH${lock?.source ? ` (source: ${lock.source})` : ""}: ${coach || "class only"}.`,
    rvType ? `- class / type: ${rvType}` : "- class / type: unknown — ask before class-specific steps",
    chassis ? `- chassis: ${chassis}` : null,
    fuel ? `- fuel: ${fuel}` : null,
  ];

  if (role === "towable") {
    lines.push(
      "- Ground every step to this TOWABLE. Do not give Class A diesel, chassis-engine, AquaHot / hydronic, or onboard-generator start tips unless they clearly have that option. House 12V / 120V, LP bottles, fresh / gray / black, slide, and hitch / breakaway are the right family.",
    );
  } else if (role === "motorhome") {
    lines.push(
      "- Ground every step to this MOTORHOME. Do not give travel-trailer dump / hitch-only or 'bottle LP only' tips as the whole answer. Chassis engine, generator, house LP, and (if equipped) AquaHot / hydronic may apply. Still no invented procedures.",
    );
  } else {
    lines.push(
      "- Class is not locked. Ask class before engine / AquaHot / hitch-only steps.",
    );
  }

  return lines.filter(Boolean).join("\n");
}

export function formatRepairGroundingBlock(opts: {
  lock?: RepairCoachLock | null;
  /** This turn is a repair ask — inject the full playbook. */
  active: boolean;
  voice?: boolean;
}): string {
  if (!opts.active) {
    if (!opts.voice) return "";
    return [
      "REPAIR RAILS (only if they ask to diagnose / fix):",
      REPAIR_STANDING_VOICE,
      formatRepairCoachLock(opts.lock),
    ].join("\n");
  }
  const playbook = opts.voice ? REPAIR_VOICE_PLAYBOOK : REPAIR_PLAYBOOK;
  return `${playbook}\n\n${formatRepairCoachLock(opts.lock)}`;
}

export function repairCoachLockFromGrounded(opts: {
  identity?: {
    year: string;
    make: string;
    model: string;
    floorplan: string;
    source: string;
  } | null;
  specs?: {
    rvType?: { value: string | null };
    chassis?: { value: string | null };
    fuelType?: { value: string | null };
  } | null;
  facts?: {
    year?: string;
    make?: string;
    model?: string;
    floorplan?: string;
    rvType?: string;
  } | null;
}): RepairCoachLock | null {
  const id = opts.identity;
  const specs = opts.specs;
  const facts = opts.facts;
  const year = id?.year || facts?.year || "";
  const make = id?.make || facts?.make || "";
  const model = id?.model || facts?.model || "";
  if (!year && !make && !model && !specs?.rvType?.value && !facts?.rvType) {
    return null;
  }
  return {
    year,
    make,
    model,
    floorplan: id?.floorplan || facts?.floorplan || "",
    source: id?.source || (facts?.year ? "facts" : undefined),
    rvType: specs?.rvType?.value || facts?.rvType || null,
    chassis: specs?.chassis?.value ?? null,
    fuelType: specs?.fuelType?.value ?? null,
  };
}
