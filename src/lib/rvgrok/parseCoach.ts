/** Shared year / make / model parse — no storage, safe for Node tests. */

export const COACH_BRANDS = [
  "Leisure Travel Vans",
  "American Coach",
  "Entegra Coach",
  "Forest River",
  "Grand Design",
  "Newmar",
  "Tiffin",
  "Winnebago",
  "Airstream",
  "Fleetwood",
  "Jayco",
  "Thor",
  "Coachmen",
  "Holiday Rambler",
  "Heartland",
  "Keystone",
  "Lance",
  "Renegade",
  "Pleasure-Way",
  "Roadtrek",
  "Enova",
  "Brinkley",
  "Alliance",
  "Outdoors RV",
  "Northwood",
  "Oliver",
  "Nexus",
  "Dynamax",
  "Entegra",
].sort((a, b) => b.length - a.length);

export function parseCoachFromText(text: string): {
  year: string;
  make: string;
  model: string;
  floorplan: string;
} {
  const raw = text || "";
  const yearM = raw.match(/\b(19[89]\d|20[0-2]\d)\b/);
  const year = yearM?.[1] ?? "";
  const lower = raw.toLowerCase();
  let make = "";
  for (const b of COACH_BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      make = b;
      break;
    }
  }
  let model = "";
  let floorplan = "";
  if (make) {
    const after = raw.slice(lower.indexOf(make.toLowerCase()) + make.length);
    const fp = after.match(
      /\b(\d{2,3}\s?[A-Z]{1,4}|[A-Z]{1,3}\d{2,3}[A-Z]?)\b/,
    );
    if (fp) floorplan = fp[1]!.replace(/\s+/g, "");
    const chunk = after
      .replace(/[.,;:!?]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4);
    const skip = new Set([
      "the",
      "a",
      "an",
      "rv",
      "class",
      "diesel",
      "gas",
      "motorhome",
      "coach",
    ]);
    const words: string[] = [];
    for (const w of chunk) {
      if (fp && w.replace(/\s+/g, "") === floorplan) break;
      if (/^\d{4}$/.test(w)) continue;
      if (skip.has(w.toLowerCase())) continue;
      if (w.length < 2) continue;
      words.push(w);
      if (words.join(" ").length > 28) break;
    }
    model = words.join(" ").trim();
  }
  return { year, make, model, floorplan };
}
