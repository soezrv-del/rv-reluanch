import { createFileRoute } from "@tanstack/react-router";
import {
  buildVinStructure,
  type NhtsaDecodeResult,
  type NhtsaRecall,
} from "@/lib/nhtsa/decode";

/**
 * GET /api/nhtsa/vin?vin=XXXXXXXXXXXXXXXXX
 *
 * Proxies NHTSA vPIC DecodeVinValuesExtended + recallsByVehicle.
 * vPIC is free/public (no API key). Optional NHTSA_API_KEY is reserved
 * for future authenticated NHTSA endpoints and is attached when present.
 */

const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";
const RECALLS_BASE = "https://api.nhtsa.gov/recalls";

function normalizeVin(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
}

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "" && String(v).trim() !== "0") {
      const s = String(v).trim();
      if (/^not applicable$/i.test(s)) continue;
      return s;
    }
  }
  return "";
}

function buildEngine(row: Record<string, string>): string {
  const disp = pick(row, "DisplacementL", "DisplacementCC");
  const cyl = pick(row, "EngineCylinders");
  const hp = pick(row, "EngineHP", "EngineHP_to");
  const conf = pick(row, "EngineConfiguration", "EngineModel");
  const parts: string[] = [];
  if (disp) parts.push(disp.includes("L") ? disp : `${disp}L`);
  if (cyl) parts.push(`${cyl}-cyl`);
  if (hp) parts.push(`${hp} HP`);
  if (conf && parts.length < 3) parts.push(conf);
  return parts.join(" ") || "—";
}

function buildAssembly(row: Record<string, string>): string {
  const city = pick(row, "PlantCity");
  const state = pick(row, "PlantState");
  const country = pick(row, "PlantCountry");
  const bits = [city, state, country].filter(Boolean);
  return bits.length ? bits.join(", ") : country || "—";
}

function buildTransmission(row: Record<string, string>): string {
  const style = pick(row, "TransmissionStyle");
  const speeds = pick(row, "TransmissionSpeeds");
  if (style && speeds) return `${style} · ${speeds}-spd`;
  if (style) return style;
  if (speeds) return `${speeds}-speed`;
  return "—";
}

/** Extra NHTSA fields that add value when populated. */
const EXTRA_FIELDS: Array<[string, string[]]> = [
  ["Vehicle Descriptor", ["VehicleDescriptor"]],
  ["NCSA Body", ["NCSABodyType"]],
  ["NCSA Make", ["NCSAMake"]],
  ["NCSA Model", ["NCSAModel"]],
  ["Bed Type", ["BedType"]],
  ["Bed Length", ["BedLengthIN"]],
  ["Wheelbase", ["WheelBaseLong", "WheelBaseShort", "WheelBaseType"]],
  ["Axles", ["Axles"]],
  ["Axle Configuration", ["AxleConfiguration"]],
  ["Brake System", ["BrakeSystemType", "BrakeSystemDesc"]],
  ["Steering", ["SteeringLocation"]],
  ["Trailer Type", ["TrailerType"]],
  ["Trailer Body", ["TrailerBodyType"]],
  ["Trailer Length", ["TrailerLength"]],
  ["Bus Length", ["BusLength"]],
  ["Bus Floor Config", ["BusFloorConfigType"]],
  ["Custom Motorcycle", ["CustomMotorcycleType"]],
  ["Motorcycle Chassis", ["MotorcycleChassisType"]],
  ["EV Drive Unit", ["EVDriveUnit"]],
  ["Battery KWh", ["BatteryKWh", "BatteryKWh_to"]],
  ["Charger Level", ["ChargerLevel"]],
  ["Other Engine Info", ["OtherEngineInfo"]],
  ["Other Restraint", ["OtherRestraintSystemInfo"]],
  ["Destination Market", ["DestinationMarket"]],
];

function buildExtra(row: Record<string, string>): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = [];
  for (const [label, keys] of EXTRA_FIELDS) {
    const v = pick(row, ...keys);
    if (v) out.push({ label, value: v });
  }
  return out;
}

async function fetchJson(url: string, headers: HeadersInit = {}, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      headers: { Accept: "application/json", ...headers },
      signal: ctrl.signal,
    });
    const text = await resp.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
    return { ok: resp.ok, status: resp.status, json };
  } finally {
    clearTimeout(t);
  }
}

function nhtsaHeaders(): HeadersInit {
  const key = process.env.NHTSA_API_KEY?.trim();
  if (!key) return {};
  return {
    "X-Api-Key": key,
    Authorization: `Bearer ${key}`,
  };
}

async function decodeVinServer(vin: string): Promise<NhtsaDecodeResult> {
  const headers = nhtsaHeaders();
  const decodeUrl = `${VPIC_BASE}/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;
  const { ok, status, json } = await fetchJson(decodeUrl, headers);

  if (!ok || !json || typeof json !== "object") {
    throw new Error(`NHTSA vPIC decode failed (${status})`);
  }

  const results = (json as { Results?: Record<string, string>[] }).Results;
  const row = results?.[0];
  if (!row) throw new Error("NHTSA returned no decode results for this VIN.");

  const errorCode = pick(row, "ErrorCode");
  const errorText = pick(row, "ErrorText");
  const additionalErrorText = pick(row, "AdditionalErrorText");
  const fatal =
    !pick(row, "Make") &&
    !pick(row, "Model") &&
    (errorCode === "8" || errorCode === "7" || errorCode.startsWith("8"));

  if (fatal) {
    throw new Error(errorText || "VIN could not be decoded by NHTSA.");
  }

  const make = pick(row, "Make");
  const model = pick(row, "Model");
  const year = pick(row, "ModelYear");

  let recalls: NhtsaRecall[] = [];
  if (make && model && year) {
    try {
      const recallUrl =
        `${RECALLS_BASE}/recallsByVehicle?` +
        `make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`;
      const r = await fetchJson(recallUrl, headers, 10000);
      if (r.ok && r.json && typeof r.json === "object") {
        const list =
          (r.json as { results?: Record<string, string>[] }).results ??
          (r.json as { Results?: Record<string, string>[] }).Results ??
          [];
        recalls = list.slice(0, 25).map((item) => ({
          campaignNumber: String(
            item.NHTSACampaignNumber || item.CampaignNumber || "",
          ),
          component: String(item.Component || "EQUIPMENT"),
          summary: String(item.Summary || "").trim(),
          consequence: String(item.Consequence || "").trim(),
          remedy: String(item.Remedy || "").trim(),
          reportDate: String(item.ReportReceivedDate || item.ReportDate || ""),
          manufacturer: String(item.Manufacturer || make),
        }));
      }
    } catch {
      // recalls are best-effort — still return decode
    }
  }

  const plantCity = pick(row, "PlantCity");
  const plantState = pick(row, "PlantState");
  const plantCountry = pick(row, "PlantCountry");
  const structure = buildVinStructure(vin);
  const vehicleDescriptor =
    pick(row, "VehicleDescriptor") || structure.vehicleDescriptor;

  return {
    vin,
    year: year || "—",
    make: make || "—",
    model: model || "—",
    trim: pick(row, "Trim", "Trim2") || "—",
    series: pick(row, "Series", "Series2") || "—",
    bodyClass: pick(row, "BodyClass") || "—",
    bodyCabType: pick(row, "BodyCabType") || "—",
    vehicleType: pick(row, "VehicleType") || "—",
    engine: buildEngine(row),
    engineModel: pick(row, "EngineModel") || "—",
    engineManufacturer: pick(row, "EngineManufacturer") || "—",
    engineConfiguration: pick(row, "EngineConfiguration") || "—",
    displacementL: pick(row, "DisplacementL") || "—",
    displacementCi: pick(row, "DisplacementCI") || "—",
    cylinders: pick(row, "EngineCylinders") || "—",
    horsepower: pick(row, "EngineHP", "EngineHP_to") || "—",
    fuel: pick(row, "FuelTypePrimary") || "—",
    fuelSecondary: pick(row, "FuelTypeSecondary") || "—",
    fuelInjection: pick(row, "FuelInjectionType") || "—",
    driveType: pick(row, "DriveType") || "—",
    transmission: buildTransmission(row),
    transmissionSpeeds: pick(row, "TransmissionSpeeds") || "—",
    gvwr: pick(row, "GVWR", "GVWR_to") || "—",
    doors: pick(row, "Doors") || "—",
    brakeSystem: pick(row, "BrakeSystemType", "BrakeSystemDesc") || "—",
    abs: pick(row, "ABS") || "—",
    electrification: pick(row, "ElectrificationLevel") || "—",
    batteryType: pick(row, "BatteryType") || "—",
    manufacturer: pick(row, "Manufacturer") || "—",
    plantCity,
    plantState,
    plantCountry,
    assembly: buildAssembly(row),
    vehicleDescriptor,
    airBagFront: pick(row, "AirBagLocFront") || "—",
    airBagSide: pick(row, "AirBagLocSide") || "—",
    airBagCurtain: pick(row, "AirBagLocCurtain") || "—",
    seatBelts: pick(row, "SeatBeltsAll") || "—",
    tpms: pick(row, "TPMS") || "—",
    structure,
    errorCode,
    errorText,
    additionalErrorText,
    verified: Boolean(make && model && year),
    recalls,
    recallCount: recalls.length,
    source: "nhtsa",
    extra: buildExtra(row),
  };
}

export const Route = createFileRoute("/api/nhtsa/vin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = url.searchParams.get("vin") ?? "";
        const vin = normalizeVin(raw);

        if (vin.length !== 17) {
          return Response.json(
            {
              error:
                "VIN must be 17 characters (letters I, O, Q are not used).",
            },
            { status: 400 },
          );
        }

        try {
          const data = await decodeVinServer(vin);
          return Response.json(
            { data },
            {
              headers: {
                "Cache-Control": "public, max-age=3600",
              },
            },
          );
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "Failed to decode VIN via NHTSA";
          const status = /abort/i.test(msg) ? 504 : 502;
          return Response.json({ error: msg }, { status });
        }
      },
    },
  },
});
