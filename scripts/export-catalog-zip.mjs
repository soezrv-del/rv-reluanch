#!/usr/bin/env node
/**
 * Phase 5.4 — export zip of catalog + pins + gap report for ops backup/share.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportsDir = path.join(root, "exports");
fs.mkdirSync(exportsDir, { recursive: true });

// Gap report
execSync("python3 scripts/gap-report-powertrain.py", {
  cwd: root,
  stdio: "inherit",
});

// Pins export from TS source (static corrections)
const pinsSrc = fs.readFileSync(
  path.join(root, "src/lib/rv/powertrainCorrections.ts"),
  "utf8",
);
fs.writeFileSync(path.join(exportsDir, "rvfax-powertrain-pins.ts.txt"), pinsSrc);

const localTemplate = {
  version: 1,
  exportedAt: new Date().toISOString(),
  count: 0,
  overrides: [],
  note: "Import dealer corrections via app Export pins / importLocalSpecOverridesJson",
};
fs.writeFileSync(
  path.join(exportsDir, "rvfax-local-spec-overrides-template.json"),
  JSON.stringify(localTemplate, null, 2),
);

const gap = JSON.parse(
  fs.readFileSync(
    path.join(exportsDir, "rvfax-catalog-powertrain-gaps.json"),
    "utf8",
  ),
);
const readme = `RVFAX catalog export
Generated: ${new Date().toISOString()}

Contents:
- rvfax-catalog-models.json / .csv / .txt — model catalog snapshot (if present)
- rvfax-catalog-powertrain-by-year.csv — year bands (if present)
- rvfax-catalog-powertrain-gaps.json / .csv — Phase 5.1 gap report
- rvfax-powertrain-pins.ts.txt — static brochure pins source
- rvfax-local-spec-overrides-template.json — import shape for dealer corrections

Gap summary:
- motorized: ${gap.motorizedTotal}
- gaps: ${gap.gapCount}
- missing year-bands: ${gap.missingYearBands}
- null HP: ${gap.nullHorsepower}

Truth stack:
1. Local correction (user)
2. Brochure pin
3. Year-band catalog
4. Validated Live (soft fields; hard only if empty+validated)
`;
fs.writeFileSync(path.join(exportsDir, "README-phase5-export.txt"), readme);

const stamp = new Date().toISOString().slice(0, 10);
const zipName = `rvfax-catalog-export-${stamp}.zip`;
const zipPath = path.join(exportsDir, zipName);

const files = [
  "rvfax-catalog-models.json",
  "rvfax-catalog-models.csv",
  "rvfax-catalog-models.txt",
  "rvfax-catalog-powertrain-by-year.csv",
  "rvfax-catalog-powertrain-gaps.json",
  "rvfax-catalog-powertrain-gaps.csv",
  "rvfax-powertrain-pins.ts.txt",
  "rvfax-local-spec-overrides-template.json",
  "README-phase5-export.txt",
  "README.txt",
].filter((f) => fs.existsSync(path.join(exportsDir, f)));

// Prefer system zip; fall back to Python zipfile helper
function makeZip() {
  try {
    execSync("which zip", { stdio: "ignore" });
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    execSync(
      `zip -q "${zipPath}" ${files.map((f) => `"${f}"`).join(" ")}`,
      { cwd: exportsDir, stdio: "inherit" },
    );
    return;
  } catch {
    /* python fallback */
  }
  execSync(
    `python3 scripts/_make_export_zip.py ${JSON.stringify(exportsDir)} ${JSON.stringify(zipPath)} ${JSON.stringify(JSON.stringify(files))}`,
    { cwd: root, stdio: "inherit" },
  );
}

makeZip();
const stable = path.join(exportsDir, "rvfax-catalog-export.zip");
fs.copyFileSync(zipPath, stable);

console.log(`wrote ${zipPath}`);
console.log(`wrote ${stable}`);
console.log(`included ${files.length} files · gaps=${gap.gapCount}`);
