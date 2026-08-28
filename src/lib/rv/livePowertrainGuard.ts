/**
 * Phase 2 — Live cannot stomp hard facts.
 *
 * Validators decide whether Live Grok may set engine / HP / chassis / fuel /
 * transmission. Soft fields (overview, issues, market) stay unrestricted.
 */

import type { LiveDossier } from "./liveDossier";
import {
  findPowertrainCorrection,
  powertrainConflictsWithPin,
  type PowertrainCorrection,
} from "./powertrainCorrections";
import {
  findLocalSpecOverride,
  localOverrideAsPin,
} from "./localSpecOverrides";
import { engineConflictsWithChassis } from "./powertrainFamily";

export type PowertrainTrust =
  | "local"
  | "pinned"
  | "catalog"
  | "live-validated"
  | "live-unverified"
  | "empty";

export type HardPowertrain = {
  engine: string | null;
  horsepower: number | null;
  torqueLbFt: number | null;
  chassis: string | null;
  transmission: string | null;
  fuelType: string | null;
};

export type GuardResult = {
  /** Fields safe to show (catalog/pin base, optionally upgraded by validated Live) */
  hard: HardPowertrain;
  trust: PowertrainTrust;
  /** Why Live was rejected (for debug / subtle UI) */
  liveRejectedReasons: string[];
  /** Live offered powertrain and it passed validators */
  liveAccepted: boolean;
  pin: PowertrainCorrection | null;
};

const GAS_ENGINE_RE =
  /\b(godzilla|triton|v10|6\.8\s*l|7\.3\s*l|ecoboost|f-?53|gasoline|gas\s*v8)\b/i;
const DIESEL_ENGINE_RE =
  /\b(cummins|isb|isl|isx|b6\.7|l9|x15|x12|power\s*stroke|duramax|diesel|mercedes|sprinter|om\d+)\b/i;
const FLAGSHIP_DIESEL_RE =
  /\b(isl\s*8\.?9|l9\s*450|x15|x12\s*500|1[,.]?250\s*lb|450\s*hp)\b/i;
const MID_DIESEL_RE = /\b(isb|b6\.7|340\s*hp|360\s*hp)\b/i;

/** Sibling / model-family theft patterns (live claims wrong line's engine). */
const SIBLING_RULES: Array<{
  modelIncludes: string;
  reject: RegExp;
  reason: string;
}> = [
  {
    modelIncludes: "kountry star",
    reject: GAS_ENGINE_RE,
    reason: "Kountry Star is diesel pusher — rejected gas F53/Godzilla/V10",
  },
  {
    modelIncludes: "bay star",
    reject: /\b(cummins\s*l9|isl\s*8|x15)\b/i,
    reason: "Bay Star is gas Class A — rejected flagship diesel",
  },
  {
    modelIncludes: "allegro red",
    reject: /\b(triton|v10|f-?53|godzilla|isl\s*8|l9\s*450)\b/i,
    reason: "Allegro RED is mid-diesel ISB/B6.7 — rejected V10 or ISL/L9 flagship",
  },
  {
    modelIncludes: "vision",
    reject: /\b(cummins|l9|isl|diesel\s*pusher)\b/i,
    reason: "Entegra Vision is gas F53 — rejected diesel",
  },
  {
    modelIncludes: "fr3",
    reject: /\b(cummins|diesel\s*pusher|l9|isl)\b/i,
    reason: "FR3 is gas F53 — rejected diesel",
  },
  {
    modelIncludes: "via",
    reject: /\b(cummins|isl|l9|x15|freightliner\s*xc|spartan)\b/i,
    reason: "Via is Sprinter OM642 — rejected Cummins pusher",
  },
  {
    modelIncludes: "villagio",
    reject: /\b(cummins|isl|l9|x15|freightliner\s*xc)\b/i,
    reason: "Villagio is Sprinter cowl — rejected Cummins pusher",
  },
];

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function parseHpNum(v: string | number | null | undefined): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.round(v);
  const m = String(v).replace(/,/g, "").match(/(\d{2,4})/);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  return n > 0 ? n : null;
}

function isEmptyEngine(engine: string | null | undefined): boolean {
  if (!engine) return true;
  const e = engine.trim();
  if (!e || e === "—" || e === "N/A") return true;
  if (/^see chassis/i.test(e)) return true;
  if (/^updating/i.test(e)) return true;
  return e.length < 3;
}

function isEmptyHp(hp: string | number | null | undefined): boolean {
  if (hp == null || hp === "" || hp === "—") return true;
  if (typeof hp === "string" && /varies|confirm brochure|n\/a/i.test(hp))
    return true;
  const n = parseHpNum(hp);
  return n == null || n <= 0;
}

function fuelLooksDiesel(fuel: string | null | undefined, type?: string): boolean {
  const blob = `${fuel || ""} ${type || ""}`;
  if (/diesel/i.test(blob) && !/gas\s*\/\s*diesel|or diesel|by plan/i.test(blob))
    return true;
  if (/class a diesel|diesel pusher/i.test(blob)) return true;
  return false;
}

function fuelLooksGas(fuel: string | null | undefined, type?: string): boolean {
  const blob = `${fuel || ""} ${type || ""}`;
  if (fuelLooksDiesel(fuel, type)) return false;
  return /\bgas\b|gasoline|class a gas/i.test(blob);
}

/**
 * Validate Live hard powertrain against catalog fuel + model + pin + HP family.
 * Returns rejection reasons (empty = acceptable).
 */
export function validateLivePowertrain(opts: {
  year: string | number;
  make: string;
  model: string;
  floorplan?: string;
  catalogFuelType?: string | null;
  catalogType?: string | null;
  catalogEngine?: string | null;
  catalogHp?: string | number | null;
  live: Pick<
    LiveDossier,
    "engine" | "horsepower" | "chassis" | "transmission" | "fuelType" | "torqueLbFt" | "confidence"
  >;
  pin?: PowertrainCorrection | null;
}): string[] {
  const reasons: string[] = [];
  const {
    make,
    model,
    catalogFuelType,
    catalogType,
    catalogEngine,
    catalogHp,
    live,
    pin,
  } = opts;

  const liveEngine = live.engine?.trim() || "";
  const liveHp = live.horsepower;
  const liveFuel = live.fuelType;

  if (!liveEngine && (liveHp == null || liveHp <= 0)) {
    // Nothing to validate — empty live powertrain
    return reasons;
  }

  // Pin conflict
  if (pin && liveEngine && powertrainConflictsWithPin(pin, liveEngine, liveHp)) {
    reasons.push(`Conflicts with brochure pin (${pin.engine})`);
  }
  if (pin?.fuelType === "Diesel" && liveEngine && GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) {
    reasons.push("Pin is diesel — Live offered gas-only engine");
  }
  if (pin?.fuelType === "Gas" && liveEngine && DIESEL_ENGINE_RE.test(liveEngine) && !GAS_ENGINE_RE.test(liveEngine)) {
    reasons.push("Pin is gas — Live offered diesel-only engine");
  }
  if (
    pin &&
    liveHp != null &&
    liveHp > 0 &&
    pin.horsepower > 0 &&
    Math.abs(liveHp - pin.horsepower) >= 40
  ) {
    reasons.push(
      `HP ${liveHp} too far from pin ${pin.horsepower}`,
    );
  }

  // Fuel vs engine
  const catDiesel = fuelLooksDiesel(catalogFuelType, catalogType || undefined);
  const catGas = fuelLooksGas(catalogFuelType, catalogType || undefined);
  if (catDiesel && liveEngine && GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) {
    reasons.push("Catalog fuel is diesel — rejected gas engine from Live");
  }
  if (catGas && liveEngine && DIESEL_ENGINE_RE.test(liveEngine) && !GAS_ENGINE_RE.test(liveEngine)) {
    reasons.push("Catalog fuel is gas — rejected diesel engine from Live");
  }
  if (liveFuel) {
    if (catDiesel && /^gas/i.test(liveFuel) && !/diesel/i.test(liveFuel)) {
      reasons.push("Live fuelType gas conflicts with catalog diesel");
    }
    if (catGas && /diesel/i.test(liveFuel) && !/gas/i.test(liveFuel)) {
      reasons.push("Live fuelType diesel conflicts with catalog gas");
    }
  }

  // Sibling blocklist
  const md = norm(model);
  for (const rule of SIBLING_RULES) {
    if (!md.includes(rule.modelIncludes)) continue;
    // discovery lxe is allowed flagship-ish — skip base discovery rule if lxe
    if (rule.modelIncludes === "discovery" && md.includes("lxe")) continue;
    if (rule.modelIncludes === "vision" && (md.includes("xl") || md.includes("diesel")))
      continue;
    if (liveEngine && rule.reject.test(liveEngine)) {
      reasons.push(rule.reason);
    }
  }

  // Catalog engine family vs Live family swap
  const catEng = catalogEngine || "";
  if (catEng && liveEngine) {
    const catIsMid = MID_DIESEL_RE.test(catEng) && !FLAGSHIP_DIESEL_RE.test(catEng);
    const liveIsFlag = FLAGSHIP_DIESEL_RE.test(liveEngine) || (liveHp != null && liveHp >= 450);
    if (catIsMid && liveIsFlag) {
      reasons.push("Live flagship diesel conflicts with catalog mid-diesel");
    }
    if (GAS_ENGINE_RE.test(catEng) && DIESEL_ENGINE_RE.test(liveEngine) && !GAS_ENGINE_RE.test(liveEngine)) {
      reasons.push("Live diesel conflicts with catalog gas engine family");
    }
    if (DIESEL_ENGINE_RE.test(catEng) && GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) {
      reasons.push("Live gas conflicts with catalog diesel engine family");
    }
  }

  // HP range for engine family
  if (liveHp != null && liveHp > 0 && liveEngine) {
    if (GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) {
      if (liveHp < 200 || liveHp > 420) {
        reasons.push(`Gas engine HP ${liveHp} outside 200–420 range`);
      }
    }
    if (/isb|b6\.7/i.test(liveEngine) && !/isl|l9|x15/i.test(liveEngine)) {
      if (liveHp < 250 || liveHp > 400) {
        reasons.push(`ISB/B6.7 HP ${liveHp} outside 250–400 range`);
      }
    }
    if (/l9|isl/i.test(liveEngine) && !/isb|b6\.7/i.test(liveEngine)) {
      if (liveHp < 350 || liveHp > 520) {
        reasons.push(`ISL/L9 HP ${liveHp} outside 350–520 range`);
      }
    }
    // Invented 450 on mid diesel / gas
    if (
      liveHp === 450 &&
      (GAS_ENGINE_RE.test(liveEngine) ||
        (MID_DIESEL_RE.test(liveEngine) && !FLAGSHIP_DIESEL_RE.test(liveEngine)))
    ) {
      reasons.push("Suspicious default 450 HP on non-flagship engine");
    }
  }

  // Big HP jump vs catalog without pin upgrade path
  const catHp = parseHpNum(catalogHp);
  if (
    catHp != null &&
    liveHp != null &&
    Math.abs(liveHp - catHp) >= 80 &&
    !pin
  ) {
    reasons.push(`Live HP ${liveHp} differs from catalog ${catHp} by ≥80`);
  }

  return [...new Set(reasons)];
}

/**
 * Resolve hard powertrain: pin > catalog (if present) > Live only if empty or validated.
 */
export function resolveHardPowertrain(opts: {
  year: string | number;
  make: string;
  model: string;
  floorplan?: string;
  catalog: {
    engine?: string | null;
    horsepower?: string | number | null;
    torque?: string | null;
    chassis?: string | null;
    transmission?: string | null;
    fuelType?: string | null;
    type?: string | null;
  };
  live: LiveDossier | null;
}): GuardResult {
  // Phase 5.3 — local user correction wins over everything
  const local = findLocalSpecOverride(
    opts.year,
    opts.make,
    opts.model,
    opts.floorplan,
  );
  const localPin = local ? localOverrideAsPin(local) : null;
  if (localPin && local) {
    return {
      hard: {
        engine: local.engine || localPin.engine,
        horsepower:
          local.horsepower != null && local.horsepower > 0
            ? local.horsepower
            : localPin.horsepower > 0
              ? localPin.horsepower
              : null,
        torqueLbFt: local.torqueLbFt ?? localPin.torqueLbFt ?? null,
        chassis: local.chassis ?? localPin.chassis ?? null,
        transmission: local.transmission ?? localPin.transmission ?? null,
        fuelType: local.fuelType ?? localPin.fuelType ?? null,
      },
      trust: "local",
      liveRejectedReasons: [],
      liveAccepted: false,
      pin: localPin,
    };
  }

  const pin = findPowertrainCorrection(
    opts.year,
    opts.make,
    opts.model,
    opts.floorplan,
  );

  const catEngineRaw = opts.catalog.engine?.trim() || null;
  const catChassis = opts.catalog.chassis?.trim() || null;
  const catalogFamilyBroken = Boolean(
    engineConflictsWithChassis(catEngineRaw, catChassis, {
      fuelType: opts.catalog.fuelType,
      type: opts.catalog.type,
      modelEngine: catEngineRaw,
    }),
  );
  // Bad stamped band (Cummins on Sprinter, etc.) is not "catalog truth"
  const catEngine = catalogFamilyBroken ? null : catEngineRaw;
  const catHpNum = catalogFamilyBroken
    ? null
    : parseHpNum(opts.catalog.horsepower);
  const catTrans = opts.catalog.transmission?.trim() || null;
  const catFuel = opts.catalog.fuelType?.trim() || null;

  const base: HardPowertrain = {
    engine: !isEmptyEngine(catEngine) ? catEngine : null,
    horsepower: catHpNum,
    torqueLbFt: catalogFamilyBroken
      ? null
      : (() => {
          const t = opts.catalog.torque;
          if (!t || t === "—") return null;
          const m = String(t).replace(/,/g, "").match(/(\d{2,5})/);
          return m ? parseInt(m[1]!, 10) : null;
        })(),
    chassis: catChassis && catChassis !== "—" ? catChassis : null,
    transmission: catTrans && catTrans !== "—" ? catTrans : null,
    fuelType: catFuel,
  };

  // Pin always wins hard fields
  if (pin) {
    return {
      hard: {
        engine: pin.engine,
        horsepower: pin.horsepower > 0 ? pin.horsepower : base.horsepower,
        torqueLbFt: pin.torqueLbFt ?? base.torqueLbFt,
        chassis: pin.chassis ?? base.chassis,
        transmission: pin.transmission ?? base.transmission,
        fuelType: pin.fuelType ?? base.fuelType,
      },
      trust: "pinned",
      liveRejectedReasons: [],
      liveAccepted: false,
      pin,
    };
  }

  const live = opts.live?.live ? opts.live : null;
  if (!live) {
    const trust: PowertrainTrust = base.engine ? "catalog" : "empty";
    return {
      hard: base,
      trust,
      liveRejectedReasons: [],
      liveAccepted: false,
      pin: null,
    };
  }

  const reject = validateLivePowertrain({
    year: opts.year,
    make: opts.make,
    model: opts.model,
    floorplan: opts.floorplan,
    catalogFuelType: catFuel,
    catalogType: opts.catalog.type,
    catalogEngine: catEngine,
    catalogHp: catalogFamilyBroken ? null : opts.catalog.horsepower,
    live,
    pin: null,
  });

  const liveEngine = live.engine?.trim() || null;
  const liveHp =
    live.horsepower != null && live.horsepower > 0 ? live.horsepower : null;
  const liveOk =
    reject.length === 0 &&
    (live.confidence === "high" || live.confidence === "medium");

  // Catalog present → keep unless empty field and Live ok
  // Catalog empty → fill from Live only if validated
  // Family-broken catalog (Cummins on Sprinter) is treated as empty
  const hard: HardPowertrain = { ...base };
  let usedLive = false;

  const canReplaceCatalog =
    liveOk && (isEmptyEngine(hard.engine) || catalogFamilyBroken);

  if (canReplaceCatalog && liveEngine) {
    hard.engine = liveEngine;
    usedLive = true;
  }

  if (
    liveOk &&
    liveHp != null &&
    (hard.horsepower == null || hard.horsepower <= 0 || catalogFamilyBroken)
  ) {
    hard.horsepower = liveHp;
    usedLive = true;
  }

  if (!hard.chassis || hard.chassis === "—") {
    if (liveOk && live.chassis?.trim()) {
      hard.chassis = live.chassis.trim();
      usedLive = true;
    }
  }

  if (!hard.transmission || hard.transmission === "—") {
    if (liveOk && live.transmission?.trim()) {
      hard.transmission = live.transmission.trim();
      usedLive = true;
    }
  }

  if (!hard.fuelType) {
    if (liveOk && live.fuelType?.trim()) {
      hard.fuelType = live.fuelType.trim();
      usedLive = true;
    }
  } else if (!liveOk && live.fuelType) {
    // keep catalog fuel — ignore live
  }

  if (live.torqueLbFt != null && live.torqueLbFt > 0) {
    if (hard.torqueLbFt == null || hard.torqueLbFt <= 0 || catalogFamilyBroken) {
      if (liveOk) {
        hard.torqueLbFt = live.torqueLbFt;
        usedLive = true;
      }
    }
  }

  let trust: PowertrainTrust;
  if (usedLive && liveOk) {
    trust =
      live.confidence === "high" || live.confidence === "medium"
        ? "live-validated"
        : "live-unverified";
    // If we only filled empties with low confidence, still live-unverified
    if (live.confidence === "low") trust = "live-unverified";
  } else if (base.engine) {
    trust = "catalog";
  } else if (liveEngine && !liveOk) {
    trust = "empty"; // rejected live, no catalog
  } else {
    trust = base.engine ? "catalog" : "empty";
  }

  // If Live had powertrain but was rejected and we kept catalog
  if (!liveOk && base.engine) {
    trust = "catalog";
  }

  return {
    hard,
    trust,
    liveRejectedReasons: reject,
    liveAccepted: usedLive && liveOk,
    pin: null,
  };
}

export function trustBadgeLabel(trust: PowertrainTrust): string {
  switch (trust) {
    case "local":
      return "Your correction";
    case "pinned":
      return "Year/floorplan pin";
    case "catalog":
      return "Year/floorplan catalog";
    case "live-validated":
      return "Live (validated)";
    case "live-unverified":
      return "Live (unverified)";
    default:
      return "Unknown";
  }
}

export function formatHardHorsepower(hp: number | null): string | null {
  if (hp == null || hp <= 0) return null;
  return `${Math.round(hp)} HP`;
}

export function formatHardTorque(tq: number | null): string | null {
  if (tq == null || tq <= 0) return null;
  return `${tq.toLocaleString()} lb-ft`;
}
