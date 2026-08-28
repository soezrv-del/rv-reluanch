/** NHTSA vPIC + recalls client helpers (browser-safe). */

export type NhtsaRecall = {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportDate: string;
  manufacturer: string;
};

/** ISO-3779 VIN structure breakdown (positions 1–17). */
export type VinStructure = {
  wmi: string;
  vds: string;
  checkDigit: string;
  checkDigitValid: boolean | null;
  modelYearCode: string;
  modelYearHint: string | null;
  plantCode: string;
  serial: string;
  vis: string;
  vehicleDescriptor: string;
  positions: Array<{ pos: number; char: string; role: string }>;
};

export type NhtsaDecodeResult = {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  series: string;
  bodyClass: string;
  bodyCabType: string;
  vehicleType: string;
  engine: string;
  engineModel: string;
  engineManufacturer: string;
  engineConfiguration: string;
  displacementL: string;
  displacementCi: string;
  cylinders: string;
  horsepower: string;
  fuel: string;
  fuelSecondary: string;
  fuelInjection: string;
  driveType: string;
  transmission: string;
  transmissionSpeeds: string;
  gvwr: string;
  doors: string;
  brakeSystem: string;
  abs: string;
  electrification: string;
  batteryType: string;
  manufacturer: string;
  plantCity: string;
  plantState: string;
  plantCountry: string;
  assembly: string;
  vehicleDescriptor: string;
  /** Safety / equipment */
  airBagFront: string;
  airBagSide: string;
  airBagCurtain: string;
  seatBelts: string;
  tpms: string;
  /** VIN structure */
  structure: VinStructure;
  errorCode: string;
  errorText: string;
  additionalErrorText: string;
  verified: boolean;
  recalls: NhtsaRecall[];
  recallCount: number;
  source: "nhtsa";
  /** Sparse raw NHTSA fields worth showing when present */
  extra: Array<{ label: string; value: string }>;
};

export type NhtsaDecodeResponse =
  | { ok: true; data: NhtsaDecodeResult }
  | { ok: false; error: string; status?: number };

export function normalizeVin(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
}

export function isValidVinFormat(vin: string): boolean {
  return vin.length === 17 && !/[IOQ]/.test(vin);
}

/** NHTSA / ISO transliteration for check digit. */
const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
  "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
};

const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * ISO-3779 check digit (position 9). Returns null if VIN length ≠ 17.
 */
export function validateVinCheckDigit(vin: string): boolean | null {
  const v = normalizeVin(vin);
  if (v.length !== 17) return null;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const val = VIN_TRANSLITERATION[v[i]];
    if (val === undefined) return false;
    sum += val * VIN_WEIGHTS[i];
  }
  const mod = sum % 11;
  const expected = mod === 10 ? "X" : String(mod);
  return v[8] === expected;
}

/** Model year code map (position 10) — 30-year cycle; ambiguous after 2009. */
const YEAR_CODES: Record<string, number[]> = (() => {
  const map: Record<string, number[]> = {};
  const codes =
    "ABCDEFGHJKLMNPRSTVWXY123456789";
  // 1980–2009
  for (let i = 0; i < 30; i++) {
    const y = 1980 + i;
    const c = codes[i];
    if (!map[c]) map[c] = [];
    map[c].push(y);
  }
  // 2010–2039 reuse A–Y then 1–9
  for (let i = 0; i < 30; i++) {
    const y = 2010 + i;
    const c = codes[i];
    if (!map[c]) map[c] = [];
    map[c].push(y);
  }
  return map;
})();

export function modelYearHintFromCode(code: string): string | null {
  const years = YEAR_CODES[code];
  if (!years?.length) return null;
  // Prefer most recent ≤ current year + 1
  const now = new Date().getFullYear() + 1;
  const eligible = years.filter((y) => y <= now);
  if (!eligible.length) return String(years[0]);
  return String(Math.max(...eligible));
}

const POSITION_ROLES = [
  "WMI — World Manufacturer Identifier (region)",
  "WMI — World Manufacturer Identifier",
  "WMI — World Manufacturer Identifier (manufacturer)",
  "VDS — Vehicle Descriptor (attributes)",
  "VDS — Vehicle Descriptor (attributes)",
  "VDS — Vehicle Descriptor (attributes)",
  "VDS — Vehicle Descriptor (attributes)",
  "VDS — Vehicle Descriptor (attributes)",
  "Check digit (ISO 3779)",
  "Model year code",
  "Plant / assembly code",
  "Serial / sequential production",
  "Serial / sequential production",
  "Serial / sequential production",
  "Serial / sequential production",
  "Serial / sequential production",
  "Serial / sequential production",
] as const;

export function buildVinStructure(vin: string): VinStructure {
  const v = normalizeVin(vin).padEnd(17, "·").slice(0, 17);
  const chars = v.split("");
  const checkDigitValid =
    v.length === 17 && !v.includes("·") ? validateVinCheckDigit(v) : null;
  const yearCode = chars[9] || "";
  return {
    wmi: chars.slice(0, 3).join(""),
    vds: chars.slice(3, 8).join(""),
    checkDigit: chars[8] || "",
    checkDigitValid,
    modelYearCode: yearCode,
    modelYearHint: modelYearHintFromCode(yearCode),
    plantCode: chars[10] || "",
    serial: chars.slice(11, 17).join(""),
    vis: chars.slice(9, 17).join(""),
    vehicleDescriptor: `${chars.slice(0, 8).join("")}*${chars.slice(9, 11).join("")}`,
    positions: chars.map((char, i) => ({
      pos: i + 1,
      char,
      role: POSITION_ROLES[i] || "—",
    })),
  };
}

/** Client → our server proxy (avoids CORS, keeps one place for NHTSA). */
export async function decodeVinViaApi(
  raw: string,
  signal?: AbortSignal,
): Promise<NhtsaDecodeResponse> {
  const vin = normalizeVin(raw);
  if (!isValidVinFormat(vin)) {
    return {
      ok: false,
      error: "VIN must be 17 characters (letters I, O, Q are not used).",
    };
  }

  try {
    const resp = await fetch(`/api/nhtsa/vin?vin=${encodeURIComponent(vin)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
    const json = (await resp.json()) as
      | { data: NhtsaDecodeResult }
      | { error: string };

    if (!resp.ok || "error" in json) {
      return {
        ok: false,
        error:
          "error" in json && json.error
            ? json.error
            : `NHTSA request failed (${resp.status})`,
        status: resp.status,
      };
    }
    // Ensure structure is always present (older cached responses)
    const data = json.data;
    if (!data.structure) {
      data.structure = buildVinStructure(data.vin || vin);
    }
    return { ok: true, data };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { ok: false, error: "Request cancelled." };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error talking to NHTSA.",
    };
  }
}
