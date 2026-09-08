import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getTrimsForYear } from "./towYear.ts";
import { inferTowKind, towCascadeReveal } from "./towOpen.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("2027 GMC Sierra 2500HD is a catalog GAP — no invented row", () => {
  assert.equal(getTrimsForYear("GMC", "Sierra 2500HD", "2027").length, 0);
});

test("toggle-first cascade: each parent unlocks the next; trim gates the numbers", () => {
  assert.deepEqual(
    towCascadeReveal({ kind: "", year: "", make: "", model: "", trim: "" }),
    { year: false, make: false, model: false, trim: false, answer: false },
  );
  assert.deepEqual(
    towCascadeReveal({
      kind: "truck",
      year: "",
      make: "",
      model: "",
      trim: "",
    }),
    { year: true, make: false, model: false, trim: false, answer: false },
  );
  assert.deepEqual(
    towCascadeReveal({
      kind: "suv",
      year: "2024",
      make: "",
      model: "",
      trim: "",
    }),
    { year: true, make: true, model: false, trim: false, answer: false },
  );
  assert.deepEqual(
    towCascadeReveal({
      kind: "truck",
      year: "2024",
      make: "Ford",
      model: "",
      trim: "",
    }),
    { year: true, make: true, model: true, trim: false, answer: false },
  );
  assert.deepEqual(
    towCascadeReveal({
      kind: "truck",
      year: "2024",
      make: "Ford",
      model: "F-350 Super Duty",
      trim: "",
    }),
    { year: true, make: true, model: true, trim: true, answer: false },
  );
  const withTrim = towCascadeReveal({
    kind: "truck",
    year: "2024",
    make: "Ford",
    model: "F-350 Super Duty",
    trim: "Lariat SRW — 6.7L Power Stroke Diesel (2023–2026)",
  });
  assert.equal(withTrim.trim, true);
  assert.equal(withTrim.answer, true);

  assert.equal(inferTowKind(undefined), "");
  assert.equal(inferTowKind("all"), "");
  assert.equal(inferTowKind("truck"), "truck");
  assert.equal(inferTowKind("suv"), "suv");
  assert.equal(inferTowKind("all", "Ford", "F-350 Super Duty"), "truck");
  assert.equal(inferTowKind("all", "Jeep", "Grand Cherokee"), "suv");
});

test("Tow landing uses the beach fifth-wheel still behind glass", () => {
  const tow = readFileSync(
    join(root, "../../components/rvtow/RvTowApp.tsx"),
    "utf8",
  );
  const prestige = readFileSync(join(root, "../../assets/prestige.ts"), "utf8");
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  const page = readFileSync(
    join(root, "../../components/shell/SuitePage.tsx"),
    "utf8",
  );
  const asset = join(root, "../../../public/assets/tow-landing-beach.jpg");
  assert.match(prestige, /TOW_LANDING_BACKDROP/);
  assert.match(prestige, /\/assets\/tow-landing-beach\.jpg/);
  assert.match(tow, /TOW_LANDING_BACKDROP/);
  assert.match(tow, /landing="tow"/);
  assert.match(tow, /tow-hero-panel/);
  assert.match(tow, /Know before you hitch,/);
  assert.match(css, /data-tow-landing/);
  assert.match(css, /opacity: 0\.46/);
  assert.match(page, /data-tow-landing/);
  assert.doesNotMatch(tow, /facts-landing-motorhome/);
  assert.doesNotMatch(tow, /2027 GMC Sierra/);
  assert.ok(existsSync(asset), "tow-landing-beach.jpg is in public/assets");
});

test("Tow landing source-lock: no preset chips; toggle-first; trim-gated AnswerHero", () => {
  const tow = readFileSync(
    join(root, "../../components/rvtow/RvTowApp.tsx"),
    "utf8",
  );
  const open = readFileSync(join(root, "towOpen.ts"), "utf8");

  assert.doesNotMatch(tow, /TOW_EXAMPLE_CHIPS/);
  assert.doesNotMatch(tow, /runExampleChip/);
  assert.doesNotMatch(tow, /selFromTowExampleChip/);
  assert.doesNotMatch(tow, /data-tow-example-chip/);
  assert.doesNotMatch(tow, /2024 Ford F-350 Super Duty/);
  assert.doesNotMatch(tow, /2020 Ram 3500/);
  assert.doesNotMatch(tow, /2026 GMC Sierra 2500HD/);
  assert.doesNotMatch(open, /TOW_EXAMPLE_CHIPS/);
  assert.doesNotMatch(open, /pickChipCatalogTrim/);

  assert.match(tow, /towCascadeReveal/);
  assert.match(tow, /inferTowKind/);
  assert.match(tow, /data-tow-kind-toggle/);
  assert.match(tow, /makesForKindYear/);
  assert.match(tow, /getModelsForYear/);
  assert.match(tow, /reveal\.year/);
  assert.match(tow, /reveal\.make/);
  assert.match(tow, /reveal\.model/);
  assert.match(tow, /reveal\.trim/);
  assert.match(tow, /reveal\.answer/);
  assert.match(tow, /Toggle → year → make → model → trim/);
  assert.doesNotMatch(tow, /disabled=\{!make\}/);
  assert.doesNotMatch(tow, /disabled=\{!model\}/);
  assert.doesNotMatch(tow, /Make first/);
  assert.doesNotMatch(tow, /Model first/);

  const toggle = tow.indexOf("data-tow-kind-toggle");
  const yearField = tow.indexOf('label="YEAR"');
  const makeField = tow.indexOf('label="MAKE"');
  const modelField = tow.indexOf('label="MODEL"');
  const trimField = tow.indexOf("TRIM / ENGINE / CONFIGURATION");
  const details = tow.indexOf(">More details<");
  assert.ok(toggle >= 0 && toggle < yearField, "toggle sits above year");
  assert.ok(yearField >= 0 && yearField < makeField);
  assert.ok(makeField >= 0 && makeField < modelField);
  assert.ok(modelField >= 0 && modelField < trimField);
  assert.ok(trimField >= 0 && trimField < details);
});
