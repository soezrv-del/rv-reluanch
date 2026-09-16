import type { FuelStop } from "./corridorFuel.ts";
import type { CampStop } from "./corridorCamps.ts";
import type { DumpStop } from "./corridorDumps.ts";

export type MapPoiStop = FuelStop | CampStop | DumpStop;

export type MapPoiDetail = {
  id: string;
  layer: "fuel" | "camp" | "dump";
  typeLabel: string;
  name: string;
  meta: string;
  stop: MapPoiStop;
};

function placeBit(stop: { city?: string; state?: string }): string {
  if (stop.city && stop.state) return `${stop.city}, ${stop.state}`;
  return stop.city || stop.state || "";
}

/** Name + type for a selected map pin — never a silent highlight. */
export function resolveMapPoi(opts: {
  fuelStops?: FuelStop[];
  campStops?: CampStop[];
  dumpStops?: DumpStop[];
  selectedFuelId?: string | null;
  selectedCampId?: string | null;
  selectedDumpId?: string | null;
}): MapPoiDetail | null {
  const dumpId = opts.selectedDumpId;
  if (dumpId) {
    const s = (opts.dumpStops ?? []).find((d) => d.id === dumpId);
    if (s) {
      const place = placeBit(s);
      return {
        id: s.id,
        layer: "dump",
        typeLabel: "Dump",
        name: s.name,
        meta: [place, s.feeLabel].filter(Boolean).join(" · "),
        stop: s,
      };
    }
  }
  const campId = opts.selectedCampId;
  if (campId) {
    const s = (opts.campStops ?? []).find((c) => c.id === campId);
    if (s) {
      const kind = s.kind === "rv-park" ? "RV park" : "Campground";
      const place = placeBit(s);
      return {
        id: s.id,
        layer: "camp",
        typeLabel: kind,
        name: s.name,
        meta: [place, s.nearDest ? "near dest" : ""].filter(Boolean).join(" · "),
        stop: s,
      };
    }
  }
  const fuelId = opts.selectedFuelId;
  if (fuelId) {
    const s = (opts.fuelStops ?? []).find((f) => f.id === fuelId);
    if (s) {
      const kind = s.kind === "truck-stop" ? "Truck stop" : "Fuel";
      return {
        id: s.id,
        layer: "fuel",
        typeLabel: kind,
        name: s.name,
        meta: placeBit(s),
        stop: s,
      };
    }
  }
  return null;
}
