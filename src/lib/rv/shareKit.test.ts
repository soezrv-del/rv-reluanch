import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  brochureSalesPitch,
  customerFacingPitch,
  DEFAULT_SHARE_INCLUDE,
  DEFAULT_SHARE_MARKET_LINES,
  hasSelectedMarketLines,
  isCatalogHonestyProse,
  isSharePlaceholder,
  RATE_UPDATED_FLASH,
  RATE_UPDATED_FLASH_MS,
  resolveShareNotes,
  resolveShareSummary,
  SHARE_MARKET_LINE_DEFS,
  SHARE_MSRP_LINE_ID,
  sharePaymentAfterTermDown,
  sharePaymentPricePills,
  sharePowerLines,
} from "./shareCardPolicy.ts";
import {
  honestHorsepowerForCoach,
  honestTorqueForCoach,
} from "./catalogHonesty.ts";
import { hydrateShareCoachResult } from "./shareCoachHydrate.ts";
import type { RVSpec } from "./rvTypes.ts";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "shareKit.ts"),
  "utf8",
);

test("default include is all extras off", () => {
  for (const v of Object.values(DEFAULT_SHARE_INCLUDE)) {
    assert.equal(v, false);
  }
  assert.equal("video" in DEFAULT_SHARE_INCLUDE, false);
});

const SAMPLE_MARKET = {
  tradeIn: 140000,
  retailLow: 180000,
  retailHigh: 220000,
  msrpLo: 250000,
  msrpHi: 280000,
};
const money = (n: number) => `$${n}`;

test("market lines default to none selected", () => {
  assert.equal(hasSelectedMarketLines(DEFAULT_SHARE_MARKET_LINES), false);
  for (const v of Object.values(DEFAULT_SHARE_MARKET_LINES)) {
    assert.equal(v, false);
  }
});

test("share preview never auto-includes Payment", () => {
  const policy = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCardPolicy.ts"),
    "utf8",
  );
  const ui = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../components/rvshare/RvShareKit.tsx",
    ),
    "utf8",
  );
  assert.doesNotMatch(policy, /payment:\s*true/);
  assert.doesNotMatch(ui, /Payment included/);
  assert.doesNotMatch(ui, /fallbackExtras/);
  assert.match(ui, /buildFactsShareReport/);
  assert.match(ui, /include\.payment \? payment : undefined/);
  assert.equal(DEFAULT_SHARE_INCLUDE.payment, false);
});

test("shared rating is the score only — no breakdown, summary, or notes", () => {
  assert.doesNotMatch(src, /getRatingMetadata/);
  assert.doesNotMatch(src, /tierLabel/);
  assert.doesNotMatch(src, /yearNote/);
  assert.doesNotMatch(src, /confidence confidence/);
  assert.doesNotMatch(src, /RvFOX model:/);
  assert.doesNotMatch(src, /Brand\/tier tables are editorial/);
  assert.doesNotMatch(src, /NHTSA open campaigns/);
  const detail = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../components/rvfax/RvDetail.tsx",
    ),
    "utf8",
  );
  assert.doesNotMatch(detail, /out of 5/);
  assert.doesNotMatch(detail, /ratingMeta\.sources/);
  assert.doesNotMatch(detail, /label="BRAND"/);
});

test("summary uses curated description and never invents specs", () => {
  const pitch = customerFacingPitch(
    "Newmar Essex — limited-production flagship diesel. Do not invent 2028 plans. yearEnd 2027.",
  );
  assert.match(pitch, /limited-production flagship diesel/);
  assert.doesNotMatch(pitch, /Do not invent/);
  assert.doesNotMatch(pitch, /yearEnd/);
});

test("legacy catalog notes are not used as brochure pitch", () => {
  const pitch = customerFacingPitch(
    "Legacy search alias for Allegro Bus floorplan 45 OPP — yearEnd 2026. Prefer Allegro Bus + 45OPP.",
  );
  assert.equal(pitch, "");
});

test("Confirm brochure clauses are stripped from pitch", () => {
  const pitch = customerFacingPitch(
    "Hand-built residential interiors. Confirm brochure for solar.",
  );
  assert.equal(pitch, "Hand-built residential interiors.");
});

/** Catalog honesty ledger for 2023 Entegra Coach Launch 19Y — not brochure copy. */
const LAUNCH_19Y_CATALOG =
  "Entegra Launch — Class B on Sprinter 2500. OEM MY22–23: 19Y, 3.0 V6 188 / 325, 4x4. MY24: 19Y, 2.0 211 / 332, AWD, 9-speed. MY26–27: 19A / 19Y / 19AG / 19YG. No sourced MY21 / MY25 brochure — omit those years. Do not copy 19A/19AG/19YG onto MY22–24.";

test("missing brochure summary omits the SUMMARY block entirely", () => {
  const summary = resolveShareSummary({
    liveOverview: "",
    liveFeatures: [],
  });
  assert.equal(summary.pitch, "");
  assert.deepEqual(summary.features, []);
});

test("real brochure summary shows sales-pitch highlights", () => {
  const summary = resolveShareSummary({
    liveOverview:
      "Park anywhere. Sleep anywhere. The Sprinter van that turns every weekend into a trip.",
    liveFeatures: ["4x4 adventure package", "Wet bath with cassette toilet"],
  });
  assert.match(summary.pitch, /Park anywhere/);
  assert.equal(summary.features.includes("4x4 adventure package"), true);
  assert.doesNotMatch(summary.pitch, /omit those years/);
});

test("catalog GAP / year-matrix prose is never a SUMMARY", () => {
  assert.equal(isCatalogHonestyProse(LAUNCH_19Y_CATALOG), true);
  assert.equal(brochureSalesPitch(LAUNCH_19Y_CATALOG), "");
  const summary = resolveShareSummary({
    liveOverview: LAUNCH_19Y_CATALOG,
    liveFeatures: [
      "No sourced MY21 / MY25 brochure — omit those years.",
      "OEM MY22–23: 19Y, 3.0 V6 188 / 325",
    ],
  });
  assert.equal(summary.pitch, "");
  assert.deepEqual(summary.features, []);
});

test("catalog description leftover is not used as brochure pitch", () => {
  assert.equal(
    brochureSalesPitch("Entegra Launch — Class B on Sprinter 2500."),
    "",
  );
  assert.equal(
    resolveShareSummary({
      liveOverview: "Entegra Odyssey SE — Class C across Ford E-450.",
    }).pitch,
    "",
  );
});

test("missing options omit the notes list entirely", () => {
  assert.deepEqual(resolveShareNotes({ options: [], upgrades: [] }), []);
  assert.deepEqual(
    resolveShareNotes({
      options: [
        LAUNCH_19Y_CATALOG,
        "No sourced MY21 / MY25 brochure — omit those years.",
      ],
      upgrades: [],
    }),
    [],
  );
});

test("real options/upgrades become NOTES — never catalog honesty", () => {
  const notes = resolveShareNotes({
    options: ["200W solar + lithium house bank"],
    upgrades: ["Theater seating", LAUNCH_19Y_CATALOG],
  });
  assert.deepEqual(notes, [
    "200W solar + lithium house bank",
    "Theater seating",
  ]);
  assert.doesNotMatch(notes.join("\n"), /omit those years/);
  assert.doesNotMatch(notes.join("\n"), /OEM MY/);
  assert.doesNotMatch(notes.join("\n"), /Catalog/);
});

test("isSharePlaceholder catches typical confirm tags", () => {
  assert.equal(isSharePlaceholder("Confirm brochure"), true);
  assert.equal(isSharePlaceholder("Confirm brochure (van chassis tire)"), true);
  assert.equal(isSharePlaceholder("30,000 BTU (typ. — confirm brochure)"), true);
  assert.equal(isSharePlaceholder("Cummins X15 605"), false);
});

test("Share Market offers one MSRP — never an MSRP-low option or label", () => {
  assert.equal(SHARE_MSRP_LINE_ID, "msrpHi");
  assert.equal(
    SHARE_MARKET_LINE_DEFS.some((d) => d.id === "msrpLo"),
    false,
  );
  assert.equal(
    SHARE_MARKET_LINE_DEFS.filter((d) => d.id === "msrpHi").length,
    1,
  );
  assert.equal("msrpLo" in DEFAULT_SHARE_MARKET_LINES, false);
  for (const def of SHARE_MARKET_LINE_DEFS) {
    assert.doesNotMatch(def.id, /msrpLo/i);
    assert.doesNotMatch(def.shareLabel, /MSRP\s*(low|high)/i);
    assert.doesNotMatch(def.fieldLabel, /MSRP\s*(low|high)/i);
    assert.doesNotMatch(def.name, /MSRP\s*(low|high)/i);
  }
  const hi = SHARE_MARKET_LINE_DEFS.find((d) => d.id === "msrpHi");
  assert.equal(hi?.shareLabel, "MSRP");
  assert.equal(hi?.fieldLabel, "MSRP");
  assert.equal(hi?.name, "MSRP");
  assert.equal(
    hasSelectedMarketLines({ ...DEFAULT_SHARE_MARKET_LINES, msrpLo: true }),
    false,
  );
  assert.equal(
    hasSelectedMarketLines({ ...DEFAULT_SHARE_MARKET_LINES, msrpHi: true }),
    true,
  );
});

test("calculator pills use one MSRP from the high/asking figure", () => {
  const pills = sharePaymentPricePills(SAMPLE_MARKET, money);
  const msrp = pills.filter((p) => /^MSRP\b/.test(p.label));
  assert.equal(msrp.length, 1);
  assert.equal(msrp[0]?.value, SAMPLE_MARKET.msrpHi);
  assert.doesNotMatch(msrp[0]!.label, /low|high/i);
  assert.equal(
    pills.some((p) => p.value === SAMPLE_MARKET.msrpLo),
    false,
  );
  for (const p of pills) {
    assert.doesNotMatch(p.label, /MSRP\s*(low|high)/i);
  }
  const noHigh = sharePaymentPricePills({ ...SAMPLE_MARKET, msrpHi: 0 }, money);
  assert.equal(
    noHigh.some((p) => p.value === SAMPLE_MARKET.msrpLo),
    false,
  );
  assert.equal(noHigh.filter((p) => /^MSRP\b/.test(p.label)).length, 0);
});

const scheduleApr = (termMonths: number) => (termMonths <= 180 ? 7.99 : 8.49);

test("auto rate flash only when term/down actually changes the schedule APR", () => {
  const base = { price: 220000, downPct: 10, termMonths: 180, apr: 7.99 };
  const sameDown = sharePaymentAfterTermDown(base, { downPct: 20 }, scheduleApr);
  assert.equal(sameDown.next.downPct, 20);
  assert.equal(sameDown.next.apr, 7.99);
  assert.equal(sameDown.autoRateChanged, false);

  const bump = sharePaymentAfterTermDown(base, { termMonths: 240 }, scheduleApr);
  assert.equal(bump.next.apr, 8.49);
  assert.equal(bump.next.termMonths, 240);
  assert.equal(bump.autoRateChanged, true);

  const sameTerm = sharePaymentAfterTermDown(
    base,
    { termMonths: 180 },
    scheduleApr,
  );
  assert.equal(sameTerm.autoRateChanged, false);

  const customThenDown = sharePaymentAfterTermDown(
    { ...base, apr: 6.5 },
    { downPct: 15 },
    scheduleApr,
  );
  assert.equal(customThenDown.next.apr, 7.99);
  assert.equal(customThenDown.autoRateChanged, true);

  assert.equal(RATE_UPDATED_FLASH_MS, 1000);
  assert.equal(RATE_UPDATED_FLASH, "rate updated");
});

test("catalog HP and torque become POWER lines; missing torque is omitted", () => {
  assert.deepEqual(sharePowerLines("350 HP", "468 lb-ft"), [
    "POWER",
    "350 HP",
    "468 lb-ft",
  ]);
  assert.deepEqual(sharePowerLines("350 HP", "—"), ["POWER", "350 HP"]);
  assert.deepEqual(sharePowerLines("350 HP", "N/A"), ["POWER", "350 HP"]);
  assert.deepEqual(sharePowerLines("Confirm brochure", "468 lb-ft"), [
    "POWER",
    "468 lb-ft",
  ]);
  assert.deepEqual(sharePowerLines("HP varies / confirm brochure", null), []);
  assert.deepEqual(sharePowerLines("", ""), []);
});

test("Georgetown-shaped by-year dual family is GAP — not a lone 350 painted as this coach", () => {
  const hp = honestHorsepowerForCoach({
    engine: "Ford 7.3L / V10 (by year)",
    horsepower: 350,
    chassis: "Ford F53",
    type: "Class A Gas",
  });
  const tq = honestTorqueForCoach({
    engine: "Ford 7.3L / V10 (by year)",
    chassis: "Ford F53",
    type: "Class A Gas",
    torqueLbFt: null,
    horsepower: 350,
  });
  const lines = sharePowerLines(hp, tq);
  assert.equal(hp, "—");
  assert.equal(tq, "—");
  assert.deepEqual(lines, []);
  assert.doesNotMatch(lines.join("\n"), /350\s*HP/);
  assert.doesNotMatch(lines.join("\n"), /lb-?ft/i);
  assert.doesNotMatch(lines.join("\n"), /do not invent/i);
});

test("Georgetown / Pursuit SoT 350 + 468 becomes Share POWER HP · torque", () => {
  const hp = honestHorsepowerForCoach({
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 350,
    chassis: "Ford F53",
    type: "Class A Gas",
  });
  const tq = honestTorqueForCoach({
    engine: "Ford 7.3L V8 Godzilla",
    chassis: "Ford F53",
    type: "Class A Gas",
    torqueLbFt: 468,
    horsepower: 350,
  });
  assert.equal(hp, "350 HP");
  assert.equal(tq, "468 lb-ft");
  const lines = sharePowerLines(hp, tq);
  assert.deepEqual(lines, ["POWER", "350 HP", "468 lb-ft"]);
  assert.equal(lines.filter((l) => l !== "POWER").join(" · "), "350 HP · 468 lb-ft");
});

test("motorhome catalog torque rides with HP when SoT has both", () => {
  const hp = honestHorsepowerForCoach({
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 335,
    chassis: "Ford F53",
    type: "Class A Gas",
  });
  const tq = honestTorqueForCoach({
    engine: "Ford 7.3L V8 Godzilla",
    chassis: "Ford F53",
    type: "Class A Gas",
    torqueLbFt: 468,
    horsepower: 335,
  });
  const lines = sharePowerLines(hp, tq);
  assert.match(lines.join("\n"), /335\s*HP/);
  assert.match(lines.join("\n"), /468/);
  assert.match(lines.join("\n"), /lb-?ft/i);
});

function georgetownShapedSpec(opts: { torqueOnBand: boolean }): RVSpec {
  return {
    type: "Class A Gas",
    floorplans: ["328DS"],
    lengthRange: [32, 37],
    weightRange: [16000, 22000],
    slideouts: 2,
    sleeps: 8,
    msrpRange: [139000, 229000],
    engine: "Ford 7.3L / V10 (by year)",
    horsepower: 350,
    chassis: "Ford F53",
    fuelType: "Gas",
    recalls: 0,
    rating: 4.3,
    image: "",
    powertrainByYear: [
      {
        from: 2020,
        to: 2026,
        engine: "Ford 7.3L V8 Godzilla",
        horsepower: 350,
        chassis: "Ford F53",
        ...(opts.torqueOnBand ? { torqueLbFt: 468 } : {}),
      },
    ],
  };
}

function kitPowerFromCoach(result: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  data: RVSpec;
}) {
  const y = parseInt(result.year, 10);
  const band = (result.data.powertrainByYear || []).find(
    (b) => y >= b.from && y <= b.to,
  );
  const engine = band?.engine ?? result.data.engine;
  const horsepower = band?.horsepower ?? result.data.horsepower;
  const chassis = band?.chassis ?? result.data.chassis;
  const torqueLbFt = band?.torqueLbFt ?? result.data.torqueLbFt ?? null;
  const hp = honestHorsepowerForCoach({
    engine,
    horsepower,
    chassis,
    type: result.data.type,
  });
  const tq = honestTorqueForCoach({
    engine,
    chassis,
    type: result.data.type,
    torqueLbFt,
    horsepower,
  });
  return sharePowerLines(hp, tq);
}

test("stale saved Georgetown data rehydrates live catalog torque into kit POWER", () => {
  const stale = georgetownShapedSpec({ torqueOnBand: false });
  const live = georgetownShapedSpec({ torqueOnBand: true });
  const saved = {
    year: "2022",
    make: "Forest River",
    model: "Georgetown",
    floorplan: "328DS",
    data: stale,
  };

  const stalePower = kitPowerFromCoach(saved);
  assert.match(stalePower.join("\n"), /350\s*HP/);
  assert.doesNotMatch(stalePower.join("\n"), /468/);
  assert.doesNotMatch(stalePower.join("\n"), /lb-?ft/i);

  const hydrated = hydrateShareCoachResult(
    saved,
    (make, model) =>
      make === "Forest River" && model === "Georgetown" ? live : null,
  );
  assert.equal(hydrated.year, "2022");
  assert.equal(hydrated.make, "Forest River");
  assert.equal(hydrated.model, "Georgetown");
  assert.equal(hydrated.floorplan, "328DS");
  assert.equal(hydrated.data, live);
  assert.notEqual(hydrated.data, stale);

  const power = kitPowerFromCoach(hydrated);
  assert.deepEqual(power, ["POWER", "350 HP", "468 lb-ft"]);
});

test("custom / missing catalog coach keeps saved data for kit POWER", () => {
  const customData = georgetownShapedSpec({ torqueOnBand: false });
  const saved = {
    year: "2021",
    make: "Homebuilt",
    model: "One-Off",
    floorplan: "Custom",
    data: customData,
  };
  const hydrated = hydrateShareCoachResult(saved, () => null);
  assert.equal(hydrated.data, customData);
  assert.equal(hydrated.year, "2021");
  assert.equal(hydrated.floorplan, "Custom");

  const power = kitPowerFromCoach(hydrated);
  assert.match(power.join("\n"), /350\s*HP/);
  assert.doesNotMatch(power.join("\n"), /468/);
  assert.doesNotMatch(power.join("\n"), /lb-?ft/i);
});

test("Share kit offers a report link and a one-page PDF", () => {
  const ui = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../components/rvshare/RvShareKit.tsx",
    ),
    "utf8",
  );
  assert.match(ui, /hydrateShareCoachResult\(result\)/);
  assert.match(ui, /buildFactsShareReport/);
  assert.match(ui, /shareReportLink\(factsReport\)/);
  assert.match(ui, /shareReportPdfFile\(factsReport\)/);
  assert.match(ui, /data-share-link/);
  assert.match(ui, /data-share-pdf/);
  assert.match(ui, /data-report-signature="1"/);
  const send = ui.slice(ui.indexOf("const sendKit"), ui.indexOf("const shareFactsLink"));
  assert.doesNotMatch(send, /video\/|youtube.*File|new File\([^\)]*mp4/i);
  assert.match(ui, /data-share-video-toggle/);
  assert.match(ui, /onClick=\{\(\) => void sendKit\(\)\}/);
});

test("payment calculator field order is price → down → term → rate → est", () => {
  const ui = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../components/rvshare/RvShareKit.tsx",
    ),
    "utf8",
  );
  const pay = ui.slice(ui.indexOf('title="PAYMENT"'));
  const price = pay.indexOf('label="PRICE"');
  const down = pay.indexOf("DOWN");
  const term = pay.indexOf("TERM (YEARS)");
  const rate = pay.indexOf('label="INTEREST RATE"');
  const est = pay.indexOf("EST. / MO");
  assert.ok(price >= 0 && down >= 0 && term >= 0 && rate >= 0 && est >= 0);
  assert.ok(price < down);
  assert.ok(down < term);
  assert.ok(term < rate);
  assert.ok(rate < est);
  assert.match(pay, /Rate never above down\/term/);
  assert.match(pay, /RATE_UPDATED_FLASH/);
  assert.match(ui, /sharePaymentPricePills/);
  assert.doesNotMatch(
    pay.slice(down, rate),
    /grid grid-cols-2/,
  );
  assert.doesNotMatch(ui, /MSRP\s*(LOW|low|HIGH|high)/);
  const market = ui.slice(ui.indexOf('title="MARKET PRICES"'), ui.indexOf('title="PAYMENT"'));
  assert.match(market, /SHARE_MARKET_LINE_DEFS\.map/);
  assert.doesNotMatch(market, /MSRP LOW/);
  assert.doesNotMatch(market, /id === "msrpLo"/);
  assert.doesNotMatch(ui, /No summary on file/);
  assert.match(ui, /summary\.pitch \|\| summary\.features\.length/);
});

test("2023 Entegra Launch 19Y brochure copy omits the catalog ledger", () => {
  const summary = resolveShareSummary({
    liveOverview: LAUNCH_19Y_CATALOG,
    liveFeatures: [],
  });
  const notes = resolveShareNotes({
    options: [LAUNCH_19Y_CATALOG],
    upgrades: [],
  });
  assert.equal(summary.pitch, "");
  assert.deepEqual(summary.features, []);
  assert.deepEqual(notes, []);
  assert.match(src, /resolveShareSummary/);
  assert.match(src, /brochureNotes\(r\)/);
});
