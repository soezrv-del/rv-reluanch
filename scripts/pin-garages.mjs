#!/usr/bin/env node
/**
 * Pin garage length once per floorplan.
 *
 *   node scripts/pin-garages.mjs
 *   node scripts/pin-garages.mjs --dry-run
 *   node scripts/pin-garages.mjs --max 10
 *   node scripts/pin-garages.mjs --refresh-all
 *
 * Tiers, in order: spec-sheet Garage Length, other cargo-length fields,
 * brochure or window-sticker text already on the unit, floorplan vision,
 * then one manufacturer web lookup. Vision and web run only when a client
 * is passed in. A missing client skips that tier.
 *
 * Never calls inventory.coasttechnology.org or an rvcountry.com API.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_SNAPSHOT = join(ROOT, "public/inventory/own-lot-latest.json");
export const DEFAULT_OUT = join(ROOT, "public/inventory/garage-pins.json");
export const SPEC_FIELD = "Garage Length";
export const FEED_FIELDS = ["Cargo Area Length"];

const MM_PER_IN = 25.4;

export function normalizeToken(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Year + make + model + floorplan code. Blank when the floorplan cannot be named. */
export function floorplanKey(unit) {
  const year = String(unit?.year ?? "").replace(/\.0$/, "").trim();
  const make = normalizeToken(unit?.make);
  const model = normalizeToken(unit?.model);
  const plan = normalizeToken(unit?.trim);
  if (!year || !make || !plan) return "";
  return [year, make, model, plan].join("|");
}

export function isToyHauler(unit) {
  return /toy hauler/i.test(String(unit?.body_type || ""));
}

function attribute(unit, name) {
  const attrs = unit?.raw?.attributes;
  if (!attrs || typeof attrs !== "object") return "";
  const value = attrs[name];
  return value == null ? "" : String(value).trim();
}

function roundInches(n) {
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

/**
 * Read a printed length. Bare numbers are not a length.
 * A feed pair "168 | 4267" is inches and millimeters.
 */
export function parseGarageInches(raw) {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const lower = text.toLowerCase().replace(/inches/g, "in").replace(/feet/g, "ft");

  const labeledIn = lower.match(/(\d+(?:\.\d+)?)\s*in\b/);
  if (labeledIn) return roundInches(Number(labeledIn[1]));

  const feet = lower.match(
    /(\d+(?:\.\d+)?)\s*(?:'|ft)\s*(?:-\s*|\s+)?(\d+(?:\.\d+)?)?\s*(?:"|in\b)?/,
  );
  if (feet) {
    const extra = feet[2] ? Number(feet[2]) : 0;
    return roundInches(Number(feet[1]) * 12 + extra);
  }

  const inchesMark = lower.match(/(\d+(?:\.\d+)?)\s*"/);
  if (inchesMark) return roundInches(Number(inchesMark[1]));

  const pair = lower.match(/(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)/);
  if (pair) {
    const a = Number(pair[1]);
    const b = Number(pair[2]);
    const small = Math.min(a, b);
    const big = Math.max(a, b);
    if (small > 0 && Math.abs(big / small - MM_PER_IN) <= 0.5) return roundInches(small);
  }
  return null;
}

/** A printed, labeled garage dimension. An unlabeled number is not a garage. */
export function extractLabeledGarageInches(text) {
  const raw = String(text || "");
  if (!/garage/i.test(raw)) return null;
  const feetThenWord =
    /(\d+(?:\.\d+)?)\s*(?:'|ft)\s*(?:-\s*)?(\d+(?:\.\d+)?)?\s*(?:"|in)?\s*garage/i;
  const wordThenFeet =
    /garage[^0-9]{0,24}(\d+(?:\.\d+)?)\s*(?:'|ft)\s*(?:-\s*)?(\d+(?:\.\d+)?)?\s*(?:"|in)?/i;
  const inchesThenWord = /(\d+(?:\.\d+)?)\s*(?:"|in)\s*garage/i;
  const feetHit = raw.match(feetThenWord) || raw.match(wordThenFeet);
  if (feetHit) {
    const extra = feetHit[2] ? Number(feetHit[2]) : 0;
    return roundInches(Number(feetHit[1]) * 12 + extra);
  }
  const inchesHit = raw.match(inchesThenWord);
  if (inchesHit) return roundInches(Number(inchesHit[1]));
  return null;
}

function pdfKind(key) {
  if (/window|sticker|monroney/i.test(key)) return "window_sticker_pdf";
  if (/brochure/i.test(key)) return "brochure_pdf";
  return "";
}

function collectPdfSources(unit, into, prefix = "") {
  if (!unit || typeof unit !== "object") return;
  for (const [key, value] of Object.entries(unit)) {
    if (key === "attributes" || key === "raw") {
      collectPdfSources(value, into, key);
      continue;
    }
    const kind = pdfKind(prefix ? `${prefix}.${key}` : key);
    if (!kind || value == null || typeof value === "object") continue;
    const text = String(value).trim();
    if (text) into.push({ kind, text });
  }
}

function firstUrl(unit) {
  const url = String(unit?.url || "").trim();
  return url;
}

function blankPin(extra) {
  return {
    garage_length_in: null,
    source: extra.source,
    source_url: extra.source_url || "",
    confidence: extra.confidence,
    notes: extra.notes || "",
    checked_at: extra.checked_at,
  };
}

function sameLength(values) {
  const nums = values.filter((n) => n != null);
  return nums.every((n) => n === nums[0]);
}

/**
 * @param {object[]} units
 * @param {{
 *   existing?: Record<string, object>,
 *   refreshAll?: boolean,
 *   max?: number,
 *   checkedAt?: string,
 *   vision?: Function|null,
 *   web?: Function|null,
 *   pdfText?: Function|null,
 * }} [opts]
 */
export async function pinFloorplans(units, opts = {}) {
  const existing = opts.existing || {};
  const refreshAll = Boolean(opts.refreshAll);
  const max = opts.max ?? Infinity;
  const checkedAt = opts.checkedAt || new Date().toISOString().slice(0, 10);
  const vision = opts.vision || null;
  const web = opts.web || null;
  const pdfText = opts.pdfText || null;

  const toys = units.filter(isToyHauler);
  const groups = new Map();
  for (const unit of toys) {
    const key = floorplanKey(unit);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(unit);
  }

  const pins = {};
  const byTier = {
    spec_field: { floorplans: 0, units: 0 },
    feed: { floorplans: 0, units: 0 },
    brochure_pdf: { floorplans: 0, units: 0 },
    window_sticker_pdf: { floorplans: 0, units: 0 },
    floorplan_label: { floorplans: 0, units: 0 },
    manufacturer_web: { floorplans: 0, units: 0 },
  };
  const conflicts = [];
  const needsVision = [];
  const needsWeb = [];
  const unknown = [];
  const unparsed = [];
  let remoteBudget = max;
  const fieldUnits = { [SPEC_FIELD]: 0, [FEED_FIELDS[0]]: 0 };

  for (const unit of toys) {
    if (attribute(unit, SPEC_FIELD)) fieldUnits[SPEC_FIELD] += 1;
    if (FEED_FIELDS.some((name) => attribute(unit, name))) fieldUnits[FEED_FIELDS[0]] += 1;
  }

  const keys = [...groups.keys()].filter(Boolean).sort();
  for (const blank of groups.get("") || []) {
    unknown.push({
      stock_number: blank.stock_number || "",
      reason: "floorplan cannot be named",
    });
  }

  for (const key of keys) {
    const group = groups.get(key);
    const prior = existing[key];
    if (prior && !refreshAll) {
      pins[key] = prior;
      const source = prior.source;
      if (byTier[source]) {
        byTier[source].floorplans += 1;
        byTier[source].units += group.length;
      }
      continue;
    }

    const specInches = group.map((unit) => parseGarageInches(attribute(unit, SPEC_FIELD)));
    const specHit = specInches.find((n) => n != null);
    const feedInches = group.flatMap((unit) =>
      FEED_FIELDS.map((name) => parseGarageInches(attribute(unit, name))),
    );
    const feedHit = feedInches.find((n) => n != null);
    const printedSpec = group.some((unit) => attribute(unit, SPEC_FIELD));
    const printedFeed = group.some((unit) => FEED_FIELDS.some((name) => attribute(unit, name)));
    if ((printedSpec && specHit == null) || (printedFeed && feedHit == null && specHit == null)) {
      unparsed.push(key);
    }

    const pdfNotes = [];
    let pdfPin = null;
    for (const unit of group) {
      const sources = [];
      collectPdfSources(unit, sources);
      for (const source of sources) {
        let text = source.text;
        if (/^https?:\/\//i.test(text)) {
          if (!pdfText) continue;
          text = (await pdfText(text)) || "";
        }
        const inches = extractLabeledGarageInches(text);
        if (inches == null) continue;
        pdfPin = {
          garage_length_in: inches,
          source: source.kind,
          source_url: /^https?:\/\//i.test(source.text) ? source.text : firstUrl(unit),
          confidence: "high",
          notes: "",
          checked_at: checkedAt,
        };
        pdfNotes.push(`${source.kind} ${inches}`);
        break;
      }
      if (pdfPin) break;
    }

    let pin = null;
    const notes = [];
    if (specHit != null) {
      pin = blankPin({
        source: "spec_field",
        source_url: firstUrl(group.find((unit) => parseGarageInches(attribute(unit, SPEC_FIELD)) != null) || group[0]),
        confidence: "high",
        checked_at: checkedAt,
      });
      pin.garage_length_in = specHit;
      const specValues = [...new Set(specInches.filter((n) => n != null))];
      if (specValues.length > 1) {
        pin.confidence = "low";
        notes.push(`spec field disagrees: ${specValues.join(" vs ")} in`);
      }
      if (feedHit != null && feedHit !== specHit) {
        pin.confidence = "low";
        notes.push(`feed says ${feedHit} in`);
      }
      if (pdfPin && pdfPin.garage_length_in !== specHit) {
        pin.confidence = "low";
        notes.push(`${pdfPin.source} says ${pdfPin.garage_length_in} in`);
      }
    } else if (feedHit != null) {
      pin = blankPin({
        source: "feed",
        source_url: firstUrl(group[0]),
        confidence: "high",
        checked_at: checkedAt,
      });
      pin.garage_length_in = feedHit;
      const feedValues = [...new Set(feedInches.filter((n) => n != null))];
      if (!sameLength(feedValues)) {
        pin.confidence = "low";
        notes.push(`feed disagrees: ${feedValues.join(" vs ")} in`);
      }
    } else if (pdfPin) {
      pin = pdfPin;
    }

    const image = group.map((unit) => String(unit.floorplan_image || "").trim()).find(Boolean) || "";

    if (!pin && image && vision && remoteBudget > 0) {
      remoteBudget -= 1;
      const seen = await vision({
        imageUrl: image,
        year: group[0].year,
        make: group[0].make,
        model: group[0].model,
        floorplan: group[0].trim,
      });
      if (seen && seen.labeled && seen.inches != null) {
        pin = blankPin({
          source: "floorplan_label",
          source_url: image,
          confidence: "high",
          notes: "",
          checked_at: checkedAt,
        });
        pin.garage_length_in = seen.inches;
      } else if (seen && !seen.labeled) {
        pin = blankPin({
          source: "floorplan_label",
          source_url: image,
          confidence: "low",
          notes: seen.note || "unlabeled dimension",
          checked_at: checkedAt,
        });
      }
    }

    if (!pin && !image && web && remoteBudget > 0) {
      remoteBudget -= 1;
      const found = await web({
        year: group[0].year,
        make: group[0].make,
        model: group[0].model,
        floorplan: group[0].trim,
      });
      if (found && found.inches != null && found.source_url) {
        pin = blankPin({
          source: "manufacturer_web",
          source_url: found.source_url,
          confidence: "high",
          notes: "",
          checked_at: checkedAt,
        });
        pin.garage_length_in = found.inches;
      }
    }

    if (pin) {
      pin.notes = [pin.notes, ...notes].filter(Boolean).join("; ");
      pins[key] = pin;
      if (byTier[pin.source]) {
        byTier[pin.source].floorplans += 1;
        byTier[pin.source].units += group.length;
      }
      if (pin.confidence === "low") conflicts.push({ key, notes: pin.notes });
      continue;
    }

    if (image) needsVision.push(key);
    else needsWeb.push(key);
  }

  const sample = [];
  for (const key of Object.keys(pins).sort()) {
    if (sample.length >= 10) break;
    const pin = pins[key];
    if (pin.garage_length_in == null) continue;
    sample.push({ key, ...pin });
  }

  return {
    pins,
    report: {
      toyUnits: toys.length,
      uniqueFloorplans: keys.length,
      fieldUnits,
      byTier,
      conflicts,
      needsVisionFloorplans: needsVision.length,
      needsVisionUnits: needsVision.reduce((sum, key) => sum + groups.get(key).length, 0),
      needsWebFloorplans: needsWeb.length,
      needsWebUnits: needsWeb.reduce((sum, key) => sum + groups.get(key).length, 0),
      unknownFloorplans: unknown.length + unparsed.length,
      unknown,
      unparsed,
      sample,
    },
  };
}

export function formatPinReport(report) {
  const lines = [
    `toy-hauler units: ${report.toyUnits}`,
    `unique floorplans: ${report.uniqueFloorplans}`,
    `field ${SPEC_FIELD}: ${report.fieldUnits[SPEC_FIELD]} units`,
    `field ${FEED_FIELDS[0]}: ${report.fieldUnits[FEED_FIELDS[0]]} units`,
  ];
  for (const [tier, count] of Object.entries(report.byTier)) {
    if (!count.floorplans) continue;
    lines.push(`${tier}: ${count.floorplans} floorplans, ${count.units} units`);
  }
  lines.push(`conflicts: ${report.conflicts.length}`);
  lines.push(
    `needs vision: ${report.needsVisionFloorplans} floorplans, ${report.needsVisionUnits} units`,
  );
  lines.push(`needs web: ${report.needsWebFloorplans} floorplans, ${report.needsWebUnits} units`);
  lines.push(`unknown: ${report.unknownFloorplans}`);
  return lines.join("\n");
}

export async function loadAndPin(opts = {}) {
  const snapshotPath = opts.snapshotPath || DEFAULT_SNAPSHOT;
  const units = JSON.parse(readFileSync(snapshotPath, "utf8"));
  let existing = {};
  if (!opts.refreshAll && opts.outPath) {
    try {
      existing = JSON.parse(readFileSync(opts.outPath, "utf8"));
    } catch {
      existing = {};
    }
  }
  const scraped = units.find((unit) => unit?.scraped_at)?.scraped_at || "";
  const checkedAt = opts.checkedAt || String(scraped).slice(0, 10) || undefined;
  return pinFloorplans(units, { ...opts, existing, checkedAt });
}

function argValue(argv, flag) {
  const index = argv.indexOf(flag);
  if (index < 0) return "";
  return argv[index + 1] || "";
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const refreshAll = argv.includes("--refresh-all");
  const maxRaw = argValue(argv, "--max");
  const max = maxRaw ? Number(maxRaw) : undefined;
  const outPath = argValue(argv, "--out") || DEFAULT_OUT;
  const snapshotPath = argValue(argv, "--snapshot") || DEFAULT_SNAPSHOT;
  const { pins, report } = await loadAndPin({
    snapshotPath,
    outPath: refreshAll ? "" : outPath,
    refreshAll,
    max,
    vision: null,
    web: null,
    pdfText: null,
  });
  console.log(formatPinReport(report));
  if (dryRun) return;
  const ordered = Object.fromEntries(Object.entries(pins).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(outPath, `${JSON.stringify(ordered, null, 2)}\n`);
  console.log(`wrote ${Object.keys(ordered).length} pins`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error(`[pin-garages] ${err?.message || err}`);
    process.exitCode = 1;
  });
}
