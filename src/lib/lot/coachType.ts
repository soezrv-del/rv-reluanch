/**
 * Coach type from the sheet's chassis and GVWR.
 * The sheet label stands until the chassis or GVWR contradicts it.
 * A blank chassis is not a guess.
 */

export const GVWR_SUPER_C_LB = 14500;

export const GVWR_SUPER_C_SENTENCE =
  "The sheet lists this as a Class C, but its GVWR is over fourteen thousand five hundred, so it's really a heavy-duty Super C.";

export type CoachTypeOverride = "chassis" | "gvwr" | null;

export type CoachTypeCall = {
  sheet: string;
  resolved: string;
  override: CoachTypeOverride;
  sentence: string;
};

type ChassisKind = "cutaway" | "heavy" | "blank" | "other";
type SheetFamily = "c" | "super" | "blank" | "other";

export type CoachTypeUnit = {
  body_type?: string;
  chassis?: string;
  chassis_brand?: string;
  printed?: Record<string, string>;
};

function sheetFamily(sheet: string): SheetFamily {
  const n = sheet.trim().toLowerCase();
  if (!n) return "blank";
  if (n === "class super c") return "super";
  if (n === "class c") return "c";
  return "other";
}

export function coachChassisLine(unit: CoachTypeUnit): string {
  const printed = unit.printed || {};
  return [unit.chassis_brand, unit.chassis, printed.chassis_brand, printed.chassis_model, printed.chassis]
    .map((part) => (part || "").trim())
    .filter((part) => part && !/^none$/i.test(part))
    .join(" ");
}

export function coachGvwrPounds(unit: CoachTypeUnit): number | undefined {
  const raw = unit.printed?.gvwr || "";
  const match = String(raw).replace(/,/g, "").match(/\d{4,6}/);
  if (!match) return undefined;
  const n = Number(match[0]);
  return n >= 4000 && n <= 80000 ? n : undefined;
}

function chassisKind(raw: string): ChassisKind {
  const s = raw.toLowerCase();
  if (!s.trim()) return "blank";
  if (/freightliner|international|spartan|hino|kodiak|s2rv|\bm2\b/.test(s)) return "heavy";
  if (/f-?\s?550|f-?\s?600|\b5500\b|\b550\b|\b600\b/.test(s)) return "heavy";
  if (/sprinter|transit|e-?\s?350|e-?\s?450|f-?\s?350|f-?\s?450|\b350\b|\b450\b|\b3500\b/.test(s)) {
    return "cutaway";
  }
  return "other";
}

function chassisLabel(raw: string): string {
  const s = raw.toLowerCase();
  if (/freightliner/.test(s)) return "Freightliner";
  if (/international/.test(s)) return "International";
  if (/kodiak/.test(s)) return "Kodiak";
  if (/ram/.test(s) && /5500/.test(s)) return "Ram 5500";
  if (/f-?\s?550|\b550\b/.test(s)) return "F-550";
  if (/f-?\s?600|\b600\b/.test(s)) return "F-600";
  if (/f-?\s?350|\b350\b/.test(s)) return "F-350";
  if (/f-?\s?450|\b450\b/.test(s)) return "F-450";
  if (/sprinter/.test(s)) return "Sprinter";
  if (/transit/.test(s)) return "Transit";
  if (/3500/.test(s)) return "3500";
  const words = raw.trim().split(/\s+/).slice(0, 3);
  return words.join(" ") || "truck";
}

export function classifyCoach(unit: CoachTypeUnit): CoachTypeCall {
  const sheet = (unit.body_type || "").trim();
  const family = sheetFamily(sheet);
  const kept: CoachTypeCall = { sheet, resolved: sheet, override: null, sentence: "" };
  if (family === "other") return kept;

  const chassis = coachChassisLine(unit);
  const kind = chassisKind(chassis);
  const gvwr = coachGvwrPounds(unit);

  if (kind === "cutaway") {
    if (family === "super") {
      const label = chassisLabel(chassis);
      return {
        sheet,
        resolved: "Class C",
        override: "chassis",
        sentence: `The sheet lists this as a Class Super C, but it's on a ${label} chassis, so it's really a Class C.`,
      };
    }
    return { ...kept, resolved: family === "blank" ? "Class C" : sheet };
  }

  if (kind === "heavy") {
    if (family === "c") {
      const label = chassisLabel(chassis);
      return {
        sheet,
        resolved: "Class Super C",
        override: "chassis",
        sentence: `The sheet lists this as a Class C, but it's on a ${label} chassis, so it's really a heavy-duty Super C.`,
      };
    }
    if (family === "blank") return { ...kept, resolved: "Class Super C" };
    return kept;
  }

  if (gvwr != null && gvwr > GVWR_SUPER_C_LB && family === "c") {
    return {
      sheet,
      resolved: "Class Super C",
      override: "gvwr",
      sentence: GVWR_SUPER_C_SENTENCE,
    };
  }
  if (gvwr != null && gvwr > GVWR_SUPER_C_LB && family === "blank") {
    return { ...kept, resolved: "Class Super C" };
  }

  return kept;
}

export function coachTypeLabel(unit: CoachTypeUnit): string {
  return classifyCoach(unit).resolved || unit.body_type || "";
}
