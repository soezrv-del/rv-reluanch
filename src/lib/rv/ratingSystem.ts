// ─── RVFOX COMPUTED RATING SYSTEM ────────────────────────────────────────────
// Score = manufacturer base + model tier + year band [+ optional NHTSA recall adj]
//
// Real inputs that may change the number:
//   · Editorial tables in this file (brand base, model tier)
//   · Year band (shared build-era adj)
//   · Live NHTSA campaign count when the caller passes it (Facts after fetch)
//
// Not inputs: iRV2, Reddit, RVInsider, YouTube, Facebook, App Store stars,
// Grok ownerSentiment / ratingEstimate (show those labeled separately).

export type RVTier = "flagship" | "upper_mid" | "standard" | "entry";

export const MANUFACTURER_BASE_SCORES: Record<string, number> = {
  Newmar: 4.4,
  Tiffin: 4.3,
  Airstream: 4.2,
  Regency: 4.2,
  "Oliver Travel Trailers": 4.15,
  "American Coach": 4.1,
  "Outdoors RV": 4.1,
  "Northwood Manufacturing": 4.1,
  "Pleasure-Way": 4.1,
  "Renegade RV": 4.1,
  "Entegra Coach": 4.05,

  Lance: 4.0,
  "Leisure Travel Vans": 4.0,
  DRV: 4.0,
  "Grand Design": 3.9,
  "Monaco Coach": 3.9,
  Brinkley: 3.9,
  Dynamax: 3.8,
  "Alliance RV": 3.8,

  Winnebago: 3.6,
  "Nexus RV": 3.6,
  Jayco: 3.4,
  "Holiday Rambler": 3.5,
  Roadtrek: 3.5,
  Fleetwood: 3.3,
  Keystone: 3.2,
  Coachmen: 3.1,

  Crossroads: 2.9,
  "Forest River": 2.9,
  Thor: 2.9,
  Heartland: 2.8,
  Dutchmen: 2.8,
  Palomino: 2.8,

  // Catalog brands not in the original list — peer-matched, conservative
  "Coach House": 4.0,
  "Storyteller Overland": 4.0,
  "Midwest Automotive Designs": 3.9,
  ATC: 3.8,
  "Country Coach": 3.8,
  "Beaver Coach": 3.7,
  "Monaco Coach Classic": 3.7,
  "Highland Ridge": 3.3,
  "Winnebago Classic": 3.4,
  "Fleetwood Classic": 3.3,
  "Newmar Classic": 4.1,
  "Genesis Supreme": 3.1,
  "KZ RV": 3.0,
  "National RV": 3.1,
  "Gulf Stream Coach": 2.9,
  "Damon Motor Coach": 2.9,
  "Georgie Boy": 2.8,
};

const TIER_ADJUSTMENTS: Record<RVTier, number> = {
  flagship: 0.3,
  upper_mid: 0.15,
  standard: 0.0,
  entry: -0.2,
};

const TIER_LABELS: Record<RVTier, string> = {
  flagship: "Flagship / Luxury",
  upper_mid: "Upper Mid-Range",
  standard: "Standard",
  entry: "Entry Level",
};

export const MODEL_TIERS: Record<string, Record<string, RVTier>> = {
  Newmar: {
    "King Aire": "flagship",
    Essex: "flagship",
    "London Aire": "flagship",
    "Mountain Aire": "flagship",
    "Supreme Aire": "flagship",
    "Summit Aire": "flagship",
    "Dutch Star": "upper_mid",
    "New Aire": "upper_mid",
    Ventana: "upper_mid",
    "Ventana LE": "upper_mid",
    "Grand Star": "upper_mid",
    "Super Star": "upper_mid",
    "Northern Star": "upper_mid",
    "Kountry Star": "standard",
    "Canyon Star": "standard",
    "Bay Star": "standard",
    "Freedom Aire": "standard",
    "Bay Star Sport": "entry",
  },
  "Newmar Classic": {
    "King Aire": "flagship",
    "London Aire": "flagship",
    "Mountain Aire": "flagship",
    Essex: "flagship",
    "Dutch Star": "upper_mid",
    Ventana: "upper_mid",
    "Kountry Star": "standard",
    "Canyon Star": "standard",
    "Bay Star": "standard",
  },
  Tiffin: {
    Zephyr: "flagship",
    "Allegro 45OPP": "flagship",
    "Allegro Bus": "flagship",
    Phaeton: "upper_mid",
    "Allegro Red": "upper_mid",
    Wayfarer: "upper_mid",
    "Open Road": "standard",
    Allegro: "standard",
    "Allegro Breeze": "entry",
    "Allegro Bay": "upper_mid",
    "Open Trail": "upper_mid",
    Cahaba: "entry",
  },
  Thor: {
    Tuscany: "flagship",
    Mandalay: "flagship",
    Magnitude: "upper_mid",
    Seneca: "upper_mid",
    Palazzo: "upper_mid",
    Aria: "upper_mid",
    Sanctuary: "upper_mid",
    Windsport: "standard",
    Challenger: "standard",
    Gemini: "standard",
    ACE: "standard",
    Vegas: "standard",
    Axis: "standard",
    Hurricane: "standard",
    Sereno: "standard",
    "Four Winds": "entry",
    "Four Winds Majestic": "entry",
  },
  Coachmen: {
    Sportscoach: "upper_mid",
    Encore: "upper_mid",
    Prism: "upper_mid",
    Galleria: "upper_mid",
    "Sportscoach SRS Super C": "upper_mid",
    Freelander: "standard",
    Mirada: "standard",
    Leprechaun: "standard",
    Beyond: "standard",
    Concord: "standard",
    Apex: "entry",
    Pursuit: "entry",
    Catalina: "entry",
  },
  Winnebago: {
    "Grand Tour": "flagship",
    Revel: "flagship",
    View: "upper_mid",
    Journey: "upper_mid",
    EKKO: "upper_mid",
    Forza: "upper_mid",
    Horizon: "upper_mid",
    Navion: "upper_mid",
    Adventurer: "standard",
    "Itasca Sunstar": "standard",
    "Micro Minnie": "standard",
    Intent: "standard",
    "Minnie Winnie": "standard",
    Solis: "standard",
    Travato: "standard",
  },
  "Forest River": {
    Berkshire: "upper_mid",
    Cardinal: "upper_mid",
    "XLR Nitro": "upper_mid",
    "Georgetown 5 Series": "upper_mid",
    "Georgetown XL": "upper_mid",
    Columbus: "standard",
    "Rockwood Signature": "standard",
    Georgetown: "standard",
    Sunseeker: "standard",
    Forester: "standard",
  },
  Airstream: {
    Atlas: "flagship",
    Classic: "flagship",
    "Frank Lloyd Wright Usonian": "flagship",
    "Tommy Bahama": "flagship",
    Interstate: "upper_mid",
    Globetrotter: "upper_mid",
    "Flying Cloud": "upper_mid",
    International: "upper_mid",
    "Stetson 6666": "upper_mid",
    "Trade Wind": "upper_mid",
    Caravel: "standard",
    Bambi: "standard",
    Rangeline: "standard",
    "World Traveler": "standard",
    "Basecamp Xe": "entry",
    Basecamp: "entry",
    Nest: "entry",
  },
  Keystone: {
    Alpine: "flagship",
    Montana: "upper_mid",
    Fuzion: "upper_mid",
    "Cougar 5th Wheel": "standard",
    Cougar: "standard",
    Laredo: "standard",
    Sprinter: "standard",
    "Cougar Half-Ton": "standard",
    Passport: "entry",
  },
  "Grand Design": {
    Solitude: "flagship",
    Momentum: "flagship",
    Lineage: "flagship",
    Reflection: "upper_mid",
    Imagine: "upper_mid",
    Transcend: "standard",
    "Imagine XLS": "standard",
  },
  Fleetwood: {
    Palisade: "flagship",
    "Discovery LXE": "flagship",
    "Frontier GTX": "flagship",
    Frontier: "upper_mid",
    "Bounder Classic": "upper_mid",
    Discovery: "upper_mid",
    Fortis: "standard",
    Bounder: "standard",
    Flex: "standard",
    "Pace Arrow": "standard",
    Southwind: "standard",
    "Altitude FS600D": "upper_mid",
    "Altitude FS550": "standard",
    Altitude: "standard",
    Insight: "upper_mid",
    "Tioga Ranger": "entry",
    Storm: "entry",
    Flair: "entry",
  },
  Jayco: {
    Embark: "flagship",
    Seneca: "flagship",
    "Melbourne Prestige": "upper_mid",
    Eagle: "upper_mid",
    Precept: "standard",
    "Jay Feather": "standard",
  },
  "American Coach": {
    "American Tradition": "flagship",
    "American Eagle": "flagship",
    "American Dream": "upper_mid",
  },
  "Entegra Coach": {
    Cornerstone: "flagship",
    Anthem: "flagship",
    Centurion: "flagship",
    Aspire: "upper_mid",
    Accolade: "upper_mid",
    "Accolade XL": "upper_mid",
    Expanse: "upper_mid",
    Reatta: "standard",
    Esteem: "standard",
    Odyssey: "entry",
  },
  "Monaco Coach": {
    Dynasty: "flagship",
    Camelot: "upper_mid",
  },
  "Holiday Rambler": {
    Navigator: "flagship",
    Ambassador: "upper_mid",
    Invicta: "standard",
    Vacationer: "standard",
  },
  Heartland: {
    Cyclone: "upper_mid",
    Bighorn: "upper_mid",
    Sundance: "standard",
    Prowler: "entry",
  },
  Lance: {
    "Lance 2465": "upper_mid",
    "Lance 2375": "upper_mid",
    "Lance 1172": "standard",
  },
  "Pleasure-Way": {
    "Plateau TS": "flagship",
    "Ontour 2.0": "standard",
  },
  Roadtrek: {
    "CS Adventurous": "upper_mid",
    "Zion Slumber": "standard",
  },
  "Nexus RV": {
    Triumph: "upper_mid",
    Viper: "standard",
    Phantom: "entry",
  },
  Crossroads: {
    Cameo: "upper_mid",
    "Sunset Trail": "standard",
  },
  Palomino: {
    "Columbus Compass": "upper_mid",
    "Real-Lite": "standard",
  },
  Dutchmen: {
    Yukon: "upper_mid",
    Voltage: "upper_mid",
    Kodiak: "standard",
    Astoria: "standard",
    Aerolite: "entry",
    Coleman: "entry",
  },
  "Leisure Travel Vans": {
    "Wonder XL": "flagship",
    Unity: "upper_mid",
    Wonder: "upper_mid",
    Serenity: "standard",
    Free: "standard",
  },
  "Renegade RV": {
    Valencia: "flagship",
    Verona: "upper_mid",
    Villager: "upper_mid",
  },
  Dynamax: {
    Force: "flagship",
    "Isata 5": "upper_mid",
    Europa: "upper_mid",
    "Isata 3": "standard",
  },
  "Outdoors RV": {
    "Timber Ridge": "flagship",
    "Back Country": "upper_mid",
    "Wind River": "upper_mid",
  },
  "Northwood Manufacturing": {
    "Arctic Fox": "upper_mid",
    "Wolf Creek": "upper_mid",
    Nash: "standard",
  },
  "Oliver Travel Trailers": {
    "Legacy Elite II": "flagship",
    "Legacy Elite": "upper_mid",
  },
  Regency: {
    "Ultra Brougham": "flagship",
  },
  DRV: {
    "Mobile Suites": "flagship",
    Tradition: "upper_mid",
  },
  Brinkley: {
    "Model G": "flagship",
    "Model Z": "upper_mid",
    "Model T": "upper_mid",
    "Model Z Air": "standard",
    "Model T Air": "standard",
  },
};

export const UNKNOWN_MAKE_BASE = 3.5;

const TIER_SUFFIX_TOKENS = [
  "super c",
  "class a",
  "class b",
  "class c",
  "prestige",
  "premier",
  "classic",
  "signature",
  "limited",
  "sport",
  "xl",
  "xls",
  "xe",
  "le",
  "gt",
  "xg",
];

function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatRatingAdj(n: number): string {
  const abs = Math.abs(n).toFixed(2);
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
  return "+0.00";
}

export function getYearAdjustment(yearStr: string): number {
  const yr = parseInt(yearStr, 10);
  if (isNaN(yr)) return 0;
  if (yr >= 2025) return 0.1;
  if (yr === 2024) return -0.1;
  if (yr >= 2020 && yr <= 2023) return -0.3;
  if (yr >= 2018 && yr <= 2019) return 0.15;
  if (yr >= 2015 && yr <= 2017) return -0.05;
  if (yr >= 2011 && yr <= 2014) return -0.1;
  return -0.15;
}

export type TierMatch = {
  tier: RVTier;
  matchedKey: string | null;
};

function lookupTierMap(make: string): Record<string, RVTier> | undefined {
  if (MODEL_TIERS[make]) return MODEL_TIERS[make];
  const want = normName(make);
  for (const [brand, map] of Object.entries(MODEL_TIERS)) {
    if (normName(brand) === want) return map;
  }
  // "Newmar Classic" can inherit Newmar line names
  if (want.endsWith(" classic")) {
    const parent = Object.entries(MODEL_TIERS).find(
      ([brand]) => normName(brand) === want.replace(/ classic$/, ""),
    );
    if (parent) return parent[1];
  }
  return undefined;
}

function longestPrefixTier(
  map: Record<string, RVTier>,
  modelNorm: string,
): { key: string; tier: RVTier } | null {
  let best: { key: string; tier: RVTier; len: number } | null = null;
  for (const [key, tier] of Object.entries(map)) {
    const kn = normName(key);
    if (!kn) continue;
    const hit = modelNorm === kn || modelNorm.startsWith(`${kn} `);
    if (!hit) continue;
    if (!best || kn.length > best.len) best = { key, tier, len: kn.length };
  }
  return best ? { key: best.key, tier: best.tier } : null;
}

function stripTrailingTierTokens(modelNorm: string): string {
  let cur = modelNorm;
  let changed = true;
  while (changed && cur) {
    changed = false;
    const hpTail = cur.match(/^(.*?)(?:\s+\d{2,4}[a-z]{0,4})$/);
    if (hpTail?.[1] && hpTail[1].length >= 3) {
      cur = hpTail[1].trim();
      changed = true;
      continue;
    }
    for (const tok of TIER_SUFFIX_TOKENS) {
      if (cur.endsWith(` ${tok}`)) {
        cur = cur.slice(0, -(tok.length + 1)).trim();
        changed = true;
        break;
      }
    }
  }
  return cur;
}

/** Resolve catalog model names (Allegro Red 340 → Allegro Red) to a tier. */
export function resolveModelTier(make: string, model: string): TierMatch {
  const map = lookupTierMap(make);
  if (!map) return { tier: "standard", matchedKey: null };

  const modelNorm = normName(model);
  if (!modelNorm) return { tier: "standard", matchedKey: null };

  const exact = Object.entries(map).find(([key]) => normName(key) === modelNorm);
  if (exact) return { tier: exact[1], matchedKey: exact[0] };

  const prefixed = longestPrefixTier(map, modelNorm);
  if (prefixed) return { tier: prefixed.tier, matchedKey: prefixed.key };

  const stripped = stripTrailingTierTokens(modelNorm);
  if (stripped && stripped !== modelNorm) {
    const again = longestPrefixTier(map, stripped);
    if (again) return { tier: again.tier, matchedKey: again.key };
  }

  return { tier: "standard", matchedKey: null };
}

export function getModelTier(make: string, model: string): RVTier {
  return resolveModelTier(make, model).tier;
}

export function isKnownManufacturer(make: string): boolean {
  if (MANUFACTURER_BASE_SCORES[make] != null) return true;
  const want = normName(make);
  return Object.keys(MANUFACTURER_BASE_SCORES).some((k) => normName(k) === want);
}

function manufacturerBase(make: string): number {
  if (MANUFACTURER_BASE_SCORES[make] != null) return MANUFACTURER_BASE_SCORES[make]!;
  const want = normName(make);
  for (const [brand, score] of Object.entries(MANUFACTURER_BASE_SCORES)) {
    if (normName(brand) === want) return score;
  }
  return UNKNOWN_MAKE_BASE;
}

export type RatingSignals = {
  /**
   * Live NHTSA campaign count from the Facts fetch.
   * Omit / null when unknown — do not pass catalog stub 0 as “proven clean.”
   */
  recallCount?: number | null;
};

/** −0.05 per campaign, floor −0.25. Unknown / 0 → 0. One recall cannot collapse a 4.x coach. */
export function recallAdjustment(recallCount?: number | null): number {
  if (recallCount == null || !Number.isFinite(recallCount)) return 0;
  const n = Math.max(0, Math.floor(recallCount));
  if (n <= 0) return 0;
  return Math.round(-Math.min(0.25, 0.05 * n) * 100) / 100;
}

function clampScore(raw: number): number {
  return Math.round(Math.min(5.0, Math.max(1.0, raw)) * 10) / 10;
}

/**
 * RvFOX rating. Optional `signals.recallCount` is the only live numeric input.
 * Cards / Compare call this without signals (editorial base).
 */
export function computeRating(
  make: string,
  model: string,
  year: string,
  signals?: RatingSignals,
): number {
  const base = manufacturerBase(make);
  const tier = getModelTier(make, model);
  const raw =
    base +
    TIER_ADJUSTMENTS[tier] +
    getYearAdjustment(year) +
    recallAdjustment(signals?.recallCount);
  return clampScore(raw);
}

export interface RatingMetadata {
  score: number;
  tier: RVTier;
  tierLabel: string;
  base: number;
  tierAdj: number;
  yearAdj: number;
  recallAdj: number;
  recallCount: number | null;
  yearNote: string;
  confidence: "High" | "Medium" | "Low";
  knownMake: boolean;
  tierMatched: boolean;
  matchedModelKey: string | null;
  sources: string[];
}

const HIGH_CONF = new Set([
  "Newmar",
  "Tiffin",
  "Airstream",
  "Winnebago",
  "Grand Design",
  "Keystone",
  "Thor",
  "Forest River",
  "Jayco",
  "Coachmen",
  "Fleetwood",
  "Heartland",
  "Lance",
  "Leisure Travel Vans",
]);
const LOW_CONF = new Set(["Regency", "Brinkley", "Alliance RV"]);

function getYearNote(yearStr: string): string {
  const yr = parseInt(yearStr, 10);
  const adj = getYearAdjustment(yearStr);
  const delta = formatRatingAdj(adj);
  if (isNaN(yr)) return `Unknown year (${delta})`;
  if (yr >= 2025) return `${yr} — current model, quality recovery (${delta})`;
  if (yr === 2024) return `${yr} — transition year (${delta})`;
  if (yr >= 2020 && yr <= 2023) return `${yr} — COVID-era supply chain impact (${delta})`;
  if (yr >= 2018 && yr <= 2019) return `${yr} — pre-COVID peak quality (${delta})`;
  if (yr >= 2015 && yr <= 2017) return `${yr} — mid-2010s build (${delta})`;
  if (yr >= 2011 && yr <= 2014) return `${yr} — early-2010s build (${delta})`;
  return `${yr} — older model year (${delta})`;
}

function brandConfidence(make: string): "High" | "Medium" | "Low" | null {
  if (HIGH_CONF.has(make)) return "High";
  if (LOW_CONF.has(make)) return "Low";
  const want = normName(make);
  for (const name of HIGH_CONF) {
    if (normName(name) === want) return "High";
  }
  for (const name of LOW_CONF) {
    if (normName(name) === want) return "Low";
  }
  return null;
}

export function getRatingMetadata(
  make: string,
  model: string,
  year: string,
  signals?: RatingSignals,
): RatingMetadata {
  const knownMake = isKnownManufacturer(make);
  const resolved = resolveModelTier(make, model);
  const base = manufacturerBase(make);
  const tier = resolved.tier;
  const tierAdj = TIER_ADJUSTMENTS[tier];
  const yearAdj = getYearAdjustment(year);
  const recallCount =
    signals && "recallCount" in signals && signals.recallCount != null
      ? Math.max(0, Math.floor(signals.recallCount))
      : null;
  const recallAdj = recallAdjustment(recallCount);
  const score = clampScore(base + tierAdj + yearAdj + recallAdj);

  let confidence: "High" | "Medium" | "Low";
  if (!knownMake) {
    confidence = "Low";
  } else {
    const brand = brandConfidence(make) ?? "Medium";
    if (brand === "Low") confidence = "Low";
    else if (brand === "High" && resolved.matchedKey) confidence = "High";
    else if (brand === "High") confidence = "Medium";
    else confidence = "Medium";
  }

  const modelBit = resolved.matchedKey
    ? `model ${resolved.matchedKey} (${TIER_LABELS[tier]}, ${formatRatingAdj(tierAdj)})`
    : `model ${model || "unlisted"} (default ${TIER_LABELS[tier]}, ${formatRatingAdj(tierAdj)})`;

  const sources = [
    `RvFOX model: manufacturer base ${base.toFixed(1)} + ${modelBit} + year ${formatRatingAdj(yearAdj)}`,
  ];
  if (recallCount != null) {
    sources.push(
      `NHTSA open campaigns: ${recallCount} (${formatRatingAdj(recallAdj)}; −0.05 each, cap −0.25)`,
    );
  } else {
    sources.push("NHTSA campaigns: not applied — count unknown on this surface");
  }
  sources.push(
    "Brand/tier tables are editorial. Not a live owner survey, forum scrape, or App Store rating.",
  );

  return {
    score,
    tier,
    tierLabel: TIER_LABELS[tier],
    base,
    tierAdj,
    yearAdj,
    recallAdj,
    recallCount,
    yearNote: getYearNote(year),
    confidence,
    knownMake,
    tierMatched: Boolean(resolved.matchedKey),
    matchedModelKey: resolved.matchedKey,
    sources,
  };
}

/** Nearest half-star so 4.4 → ★★★★½ and 3.5 → ★★★½☆, not both four full stars. */
export function ratingStars(score: number): string {
  const clamped = Math.max(0, Math.min(5, score));
  const halves = Math.round(clamped * 2) / 2;
  const full = Math.floor(halves);
  const half = halves - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(Math.max(0, empty));
}
