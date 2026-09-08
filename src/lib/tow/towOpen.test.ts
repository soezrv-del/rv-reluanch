import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getRating } from "./towVehicles.ts";
import { getTrimsForYear } from "./towYear.ts";
import {
  pickChipCatalogTrim,
  selFromTowExampleChip,
  TOW_EXAMPLE_CHIPS,
} from "./towOpen.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("landing chips are exactly the three locked trucks — no 2027 Sierra", () => {
  assert.deepEqual([...TOW_EXAMPLE_CHIPS], [
    "2024 Ford F-350 Super Duty",
    "2020 Ram 3500",
    "2026 GMC Sierra 2500HD",
  ]);
  assert.equal(TOW_EXAMPLE_CHIPS.length, 3);
  const joined = TOW_EXAMPLE_CHIPS.join(" | ");
  assert.doesNotMatch(joined, /2027/);
  assert.doesNotMatch(joined, /F-250/);
});

test("2027 GMC Sierra 2500HD is a catalog GAP — no invented row", () => {
  assert.equal(getTrimsForYear("GMC", "Sierra 2500HD", "2027").length, 0);
  assert.equal(pickChipCatalogTrim("GMC", "Sierra 2500HD", "2027"), "");
});

test("example chips resolve onto catalog year/make/model and a real trim", () => {
  const ford = selFromTowExampleChip("2024 Ford F-350 Super Duty");
  assert.equal(ford.year, "2024");
  assert.equal(ford.make, "Ford");
  assert.equal(ford.model, "F-350 Super Duty");
  assert.ok(ford.trim, "2024 F-350 must pick a catalog trim");
  assert.equal(
    getTrimsForYear(ford.make, ford.model, ford.year).some(
      (t) => t.label === ford.trim,
    ),
    true,
  );
  const fordRating = getRating(ford.make, ford.model, ford.trim);
  assert.ok(fordRating.maxTow > 5000, "chip uses a real catalog rating");
  assert.equal(fordRating.label, ford.trim);

  const ram = selFromTowExampleChip("2020 Ram 3500");
  assert.equal(ram.year, "2020");
  assert.equal(ram.make, "Ram");
  assert.equal(ram.model, "3500");
  assert.ok(ram.trim, "2020 Ram 3500 must pick a catalog trim");
  assert.equal(
    getTrimsForYear(ram.make, ram.model, ram.year).some(
      (t) => t.label === ram.trim,
    ),
    true,
  );
  const ramRating = getRating(ram.make, ram.model, ram.trim);
  assert.ok(ramRating.maxTow > 5000);

  const gmc = selFromTowExampleChip("2026 GMC Sierra 2500HD");
  assert.equal(gmc.year, "2026");
  assert.equal(gmc.make, "GMC");
  assert.equal(gmc.model, "Sierra 2500HD");
  assert.ok(gmc.trim, "2026 Sierra 2500HD must pick a catalog trim");
  assert.equal(
    getTrimsForYear(gmc.make, gmc.model, gmc.year).some(
      (t) => t.label === gmc.trim,
    ),
    true,
  );
  const gmcRating = getRating(gmc.make, gmc.model, gmc.trim);
  assert.ok(gmcRating.maxTow > 5000);
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
  assert.match(tow, /TOW_EXAMPLE_CHIPS/);
  assert.match(tow, /selFromTowExampleChip/);
  assert.match(tow, /runExampleChip/);
  assert.match(tow, /data-tow-example-chip/);
  assert.match(tow, /year → make → model/);
  assert.match(css, /data-tow-landing/);
  assert.match(css, /opacity: 0\.46/);
  assert.match(page, /data-tow-landing/);
  assert.doesNotMatch(tow, /facts-landing-motorhome/);
  assert.doesNotMatch(tow, /2027 GMC Sierra/);
  assert.ok(existsSync(asset), "tow-landing-beach.jpg is in public/assets");
});
