/**
 * Client-safe labels for saved coach knowledge.
 * Brochure rows stay unlabeled. Promoted rows count as catalog, not web.
 */

export type KnowledgeDisplayField = {
  value: string;
  researchedAt?: string;
  sourceUrl?: string;
};

export type KnowledgeDisplayRecord = {
  promoted?: boolean;
  sources?: string[];
  fields: Record<string, KnowledgeDisplayField | undefined>;
};

export type KnowledgeDisplayRow = {
  field: string;
  label: string;
  value: string;
  verified: boolean;
  sourceUrl: string;
  foundAt: string;
};

const FIELD_LABELS: Record<string, string> = {
  gvwr: "GVWR",
  uvw: "UVW",
  gcwr: "GCWR",
  ncc: "NCC",
  ccc: "CCC",
  hitch: "Hitch",
  payload: "Payload",
  tow: "Tow",
  horsepower: "Horsepower",
  engine: "Engine",
  chassis: "Chassis",
  torque: "Torque",
  transmission: "Transmission",
  fuel: "Fuel",
  length: "Length",
  mpg: "MPG",
  tanks: "Tanks",
  price: "Price",
  dryWeight: "Dry weight",
  sleeps: "Sleeps",
  slides: "Slides",
  awning: "Awning",
  generator: "Generator",
  solar: "Solar",
  warranty: "Warranty",
  notes: "Notes",
};

export const VERIFIED_FROM_WEB_LABEL = "Verified from web";

export function formatKnowledgeFoundAt(iso: string | undefined): string {
  const at = Date.parse(iso || "");
  if (!Number.isFinite(at)) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(at));
}

export function knowledgeDisplayRows(
  record: KnowledgeDisplayRecord | null | undefined,
): KnowledgeDisplayRow[] {
  if (!record?.fields) return [];
  const fallbackUrl = (record.sources || []).find((source) =>
    /^https?:\/\//i.test(source),
  );
  const verified = record.promoted !== true;
  const rows: KnowledgeDisplayRow[] = [];
  for (const [field, saved] of Object.entries(record.fields)) {
    const value = saved?.value?.trim();
    if (!value) continue;
    rows.push({
      field,
      label: FIELD_LABELS[field] || field,
      value,
      verified,
      sourceUrl: saved?.sourceUrl || fallbackUrl || "",
      foundAt: formatKnowledgeFoundAt(saved?.researchedAt),
    });
  }
  return rows;
}
