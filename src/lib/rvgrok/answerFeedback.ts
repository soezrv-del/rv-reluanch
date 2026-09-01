/**
 * RvGrok post-answer feedback.
 * Thumbs-down + correction is stored locally and re-injected on later
 * questions for the same year / make / model (and floorplan when known).
 */

import { saveLocalSpecOverride } from "../rv/localSpecOverrides";
import { parseCoachFromText } from "./parseCoach";

export { parseCoachFromText } from "./parseCoach";

const STORAGE_KEY = "rvgrok.answerFeedback.v1";
const MAX = 200;

export type AnswerFeedback = {
  id: string;
  rating: "up" | "down";
  query: string;
  answer: string;
  correction: string;
  year: string;
  make: string;
  model: string;
  floorplan: string;
  savedAt: string;
};

type Store = { version: 1; items: AnswerFeedback[] };

function canUseStorage() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function empty(): Store {
  return { version: 1, items: [] };
}

function readStore(): Store {
  if (!canUseStorage()) return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as Store;
    if (!p || p.version !== 1 || !Array.isArray(p.items)) return empty();
    return p;
  } catch {
    return empty();
  }
}

function writeStore(store: Store) {
  if (!canUseStorage()) return;
  try {
    store.items = store.items
      .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
      .slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function listAnswerFeedback(): AnswerFeedback[] {
  return readStore().items.slice();
}

export function findCorrectionsForCoach(sel: {
  year?: string;
  make?: string;
  model?: string;
  floorplan?: string;
}): AnswerFeedback[] {
  const y = String(sel.year || "").trim();
  const mk = norm(sel.make || "");
  const md = norm(sel.model || "");
  const fp = norm(sel.floorplan || "");
  if (!y || !mk) return [];
  return readStore().items.filter((it) => {
    if (it.rating !== "down") return false;
    if (!it.correction.trim()) return false;
    if (String(it.year) !== y) return false;
    if (norm(it.make) !== mk) return false;
    if (md && it.model && norm(it.model) !== md) return false;
    if (fp && it.floorplan && norm(it.floorplan) && norm(it.floorplan) !== fp)
      return false;
    return true;
  });
}

export function saveAnswerFeedback(
  input: Omit<AnswerFeedback, "id" | "savedAt"> & { id?: string },
): AnswerFeedback {
  const store = readStore();
  const coach = `${input.year}|${norm(input.make)}|${norm(input.model)}|${norm(input.floorplan || "")}`;
  const id = input.id || `${Date.now()}-${coach.slice(0, 48)}`;
  const entry: AnswerFeedback = {
    id,
    rating: input.rating,
    query: input.query.trim(),
    answer: input.answer.trim().slice(0, 4000),
    correction: input.correction.trim().slice(0, 2000),
    year: String(input.year || "").trim(),
    make: (input.make || "").trim(),
    model: (input.model || "").trim(),
    floorplan: (input.floorplan || "").trim(),
    savedAt: new Date().toISOString(),
  };
  store.items = store.items.filter((o) => o.id !== id);
  store.items.unshift(entry);
  writeStore(store);

  if (entry.rating === "down" && entry.year && entry.make && entry.model) {
    harvestSpecOverride(entry);
  }
  return entry;
}

function harvestSpecOverride(entry: AnswerFeedback) {
  const t = `${entry.correction} ${entry.query}`;
  const hpM = t.match(/\b(\d{2,3})\s*(?:hp|horse\s*power|horsepower)\b/i);
  const engineM = t.match(
    /\b((?:cummins|caterpillar|cat |detroit|ford|gm|chevy|chevrolet|mercedes|freightliner|powerglide|godzilla|triton|isis|isb|isl|isx|l9|b6\.7|x15|7\.3|6\.8|6\.7|5\.4)[^,.;\n]{0,48})/i,
  );
  const fuel: "Diesel" | "Gas" | undefined = /diesel/i.test(t)
    ? "Diesel"
    : /\bgas\b|gasoline|godzilla|triton/i.test(t)
      ? "Gas"
      : undefined;
  const hp = hpM ? parseInt(hpM[1]!, 10) : undefined;
  const engine = engineM?.[1]?.trim();
  if (!engine && !hp) {
    saveLocalSpecOverride({
      year: entry.year,
      make: entry.make,
      model: entry.model,
      floorplan: entry.floorplan,
      note: entry.correction,
    });
    return;
  }
  saveLocalSpecOverride({
    year: entry.year,
    make: entry.make,
    model: entry.model,
    floorplan: entry.floorplan,
    engine,
    horsepower: hp && hp > 50 && hp < 800 ? hp : undefined,
    fuelType: fuel,
    note: entry.correction,
  });
}

/** Text injected into the next Grok request for this coach. */
export function formatFeedbackContext(query: string): string {
  const parsed = parseCoachFromText(query);
  const hits = findCorrectionsForCoach(parsed);
  if (!hits.length && parsed.year && parsed.make) {
    // year+make only
    const store = readStore();
    hits.push(
      ...store.items.filter(
        (it) =>
          it.rating === "down" &&
          it.correction &&
          String(it.year) === parsed.year &&
          norm(it.make) === norm(parsed.make),
      ),
    );
  }
  const unique = hits.filter(
    (h, i, arr) => arr.findIndex((x) => x.id === h.id) === i,
  );
  if (!unique.length) return "";

  const lines = unique.slice(0, 6).map((h) => {
    const coach = [h.year, h.make, h.model, h.floorplan]
      .filter(Boolean)
      .join(" ");
    return `- ${coach}: ${h.correction}`;
  });
  return [
    "VERIFIED USER CORRECTIONS (treat as ground truth for these coaches; do not repeat the old wrong claim):",
    ...lines,
    "If the question is about one of these year/make/model combos, use the correction above.",
  ].join("\n");
}
