/**
 * AI catalog research → structured patches.
 * Scale path: research many coaches → validate → accept high-confidence only.
 * Humans review medium/low; never paste brochures one-by-one forever.
 */

export type PatchConfidence = "high" | "medium" | "low";

export type CatalogPowertrainPatch = {
  id: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  /** null = model-wide default for those years */
  floorplan: string | null;
  engine: string;
  horsepower: number | null;
  torqueLbFt?: number | null;
  chassis?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  generator?: string | null;
  towingCapacity?: number | null;
  confidence: PatchConfidence;
  sources: string[];
  notes?: string | null;
  researchedAt: string;
  modelUsed?: string | null;
  /** Validation gate result */
  validation: {
    ok: boolean;
    reasons: string[];
  };
  status: "proposed" | "accepted" | "rejected";
};

export type CatalogResearchBatch = {
  version: 1;
  generatedAt: string;
  patches: CatalogPowertrainPatch[];
  summary: {
    total: number;
    highOk: number;
    mediumOk: number;
    rejected: number;
  };
};

const GAS_RE =
  /\b(godzilla|triton|v10|6\.8\s*l|7\.3\s*l|ecoboost|f-?53|gasoline)\b/i;
const DIESEL_RE =
  /\b(cummins|isb|isl|isx|b6\.7|l9|x15|x12|power\s*stroke|duramax|diesel|mercedes|sprinter|cat\b)\b/i;

export function validateCatalogPatch(
  p: Omit<CatalogPowertrainPatch, "validation" | "status" | "id" | "researchedAt"> & {
    id?: string;
    researchedAt?: string;
    status?: CatalogPowertrainPatch["status"];
  },
  catalogFuelHint?: string | null,
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const eng = p.engine || "";
  const fuel = p.fuelType || catalogFuelHint || "";
  const hp = p.horsepower;

  if (!eng || eng.trim().length < 4) reasons.push("engine missing");
  if (p.yearFrom > p.yearTo) reasons.push("year range inverted");
  if (p.yearFrom < 1985 || p.yearTo > 2030) reasons.push("year out of range");

  if (/diesel/i.test(fuel) && GAS_RE.test(eng) && !DIESEL_RE.test(eng)) {
    reasons.push("gas engine on diesel fuelType");
  }
  if (/^gas/i.test(fuel) && DIESEL_RE.test(eng) && !GAS_RE.test(eng)) {
    reasons.push("diesel engine on gas fuelType");
  }

  if (hp != null) {
    if (hp < 80 || hp > 700) reasons.push(`HP ${hp} out of range`);
    if (GAS_RE.test(eng) && !DIESEL_RE.test(eng) && (hp < 200 || hp > 420)) {
      reasons.push(`gas HP ${hp} outside 200–420`);
    }
    if (/isb|b6\.7/i.test(eng) && !/isl|l9|x15/i.test(eng) && (hp < 250 || hp > 400)) {
      reasons.push(`ISB/B6.7 HP ${hp} outside 250–400`);
    }
    // Invented flagship 450 on non-flagship language
    if (
      hp === 450 &&
      /380|360|340|isb|b6\.7|godzilla|v10|triton/i.test(eng) &&
      !/l9|isl|optional|option/i.test(eng)
    ) {
      reasons.push("suspicious 450 HP on non-flagship engine text");
    }
  }

  // Sources required for high confidence
  if (p.confidence === "high" && (!p.sources || p.sources.length === 0)) {
    reasons.push("high confidence requires sources");
  }
  if (
    p.confidence === "high" &&
    p.sources?.length &&
    !p.sources.some((s) =>
      /oem|brochure|chassis|tiffin|newmar|winnebago|ford|freightliner|cummins|pdf|http/i.test(
        s,
      ),
    )
  ) {
    reasons.push("high confidence sources look weak");
  }

  // Floorplan specificity: if notes claim "only" and engine has optional 450, ok
  // If floorplan is 37bh and engine mentions 450 optional as fact — soft warn
  const fp = (p.floorplan || "").toLowerCase().replace(/\s+/g, "");
  if (fp.includes("37bh") && /450/.test(eng) && !/not|no\s*450|was not/i.test(p.notes || "")) {
    reasons.push("37BH patch must not claim 450 without explicit brochure proof");
  }

  return { ok: reasons.length === 0, reasons };
}

export function makePatchId(p: {
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  floorplan?: string | null;
}): string {
  return [
    p.make,
    p.model,
    p.yearFrom,
    p.yearTo,
    p.floorplan || "model",
  ]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function finalizePatch(
  raw: Omit<
    CatalogPowertrainPatch,
    "id" | "researchedAt" | "validation" | "status"
  > &
    Partial<Pick<CatalogPowertrainPatch, "id" | "researchedAt" | "status">>,
  catalogFuelHint?: string | null,
): CatalogPowertrainPatch {
  const validation = validateCatalogPatch(raw, catalogFuelHint);
  // Downgrade confidence if validation fails
  let confidence = raw.confidence;
  if (!validation.ok && confidence === "high") confidence = "medium";
  if (!validation.ok && validation.reasons.some((r) => /gas engine on diesel|diesel engine on gas|37BH/.test(r))) {
    confidence = "low";
  }
  return {
    ...raw,
    id: raw.id || makePatchId(raw),
    researchedAt: raw.researchedAt || new Date().toISOString(),
    confidence,
    validation,
    status: raw.status || (validation.ok && confidence === "high" ? "proposed" : "proposed"),
  };
}

/** Convert accepted patch → powertrain correction pin shape (for export / pin file) */
export function patchToPinSource(p: CatalogPowertrainPatch): string {
  const fp = p.floorplan
    ? `\n    floorplanIncludes: "${p.floorplan.toLowerCase().replace(/\s+/g, "")}",`
    : "";
  return `  {
    yearMin: ${p.yearFrom},
    yearEnd: ${p.yearTo},
    makeIncludes: "${p.make.toLowerCase()}",
    modelIncludes: "${p.model.toLowerCase()}",${fp}
    engine: ${JSON.stringify(p.engine)},
    horsepower: ${p.horsepower ?? 0},
    torqueLbFt: ${p.torqueLbFt ?? "undefined"},
    chassis: ${p.chassis ? JSON.stringify(p.chassis) : "undefined"},
    transmission: ${p.transmission ? JSON.stringify(p.transmission) : "undefined"},
    fuelType: ${p.fuelType === "Diesel" || p.fuelType === "Gas" ? JSON.stringify(p.fuelType) : "undefined"},
    note: ${JSON.stringify(
      [p.notes, p.sources?.join("; ")].filter(Boolean).join(" · ") ||
        "AI catalog research",
    )},
  },`;
}

/** Convert patch → powertrainByYear band JSON fragment */
export function patchToYearBand(p: CatalogPowertrainPatch): Record<string, unknown> {
  const band: Record<string, unknown> = {
    from: p.yearFrom,
    to: p.yearTo,
    engine: p.engine,
  };
  if (p.horsepower != null) band.horsepower = p.horsepower;
  if (p.torqueLbFt != null) band.torqueLbFt = p.torqueLbFt;
  if (p.chassis) band.chassis = p.chassis;
  if (p.transmission) band.transmission = p.transmission;
  if (p.generator) band.generator = p.generator;
  if (p.towingCapacity != null) band.towingCapacity = p.towingCapacity;
  if (p.floorplan) {
    band.floorplans = [p.floorplan, p.floorplan.replace(/\s+/g, "")];
  }
  if (p.notes || p.sources?.length) {
    band.notes = [p.notes, p.sources?.join("; ")].filter(Boolean).join(" · ");
  }
  return band;
}

// ── local proposed-patch store (browser) ──────────────────────────────────

const STORE_KEY = "rvfax.proposedCatalogPatches.v1";

type Store = { version: 1; patches: CatalogPowertrainPatch[] };

function canStore() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function readStore(): Store {
  if (!canStore()) return { version: 1, patches: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { version: 1, patches: [] };
    const p = JSON.parse(raw) as Store;
    if (!p?.patches) return { version: 1, patches: [] };
    return p;
  } catch {
    return { version: 1, patches: [] };
  }
}

function writeStore(s: Store) {
  if (!canStore()) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* */
  }
}

export function listProposedPatches(): CatalogPowertrainPatch[] {
  return readStore().patches.slice();
}

export function upsertProposedPatch(p: CatalogPowertrainPatch): void {
  const s = readStore();
  s.patches = [p, ...s.patches.filter((x) => x.id !== p.id)].slice(0, 500);
  writeStore(s);
}

export function setPatchStatus(
  id: string,
  status: CatalogPowertrainPatch["status"],
): void {
  const s = readStore();
  s.patches = s.patches.map((p) => (p.id === id ? { ...p, status } : p));
  writeStore(s);
}

export function exportProposedPatchesJson(): string {
  const patches = readStore().patches;
  const batch: CatalogResearchBatch = {
    version: 1,
    generatedAt: new Date().toISOString(),
    patches,
    summary: {
      total: patches.length,
      highOk: patches.filter((p) => p.confidence === "high" && p.validation.ok)
        .length,
      mediumOk: patches.filter(
        (p) => p.confidence === "medium" && p.validation.ok,
      ).length,
      rejected: patches.filter((p) => !p.validation.ok || p.status === "rejected")
        .length,
    },
  };
  return JSON.stringify(batch, null, 2);
}

export function exportAcceptedPinsTs(): string {
  const accepted = readStore().patches.filter(
    (p) => p.status === "accepted" && p.validation.ok,
  );
  return (
    `// Auto-exported accepted AI catalog pins — ${new Date().toISOString()}\n` +
    `// Paste into POWERTRAIN_CORRECTIONS or merge via apply script\n` +
    accepted.map(patchToPinSource).join("\n")
  );
}
