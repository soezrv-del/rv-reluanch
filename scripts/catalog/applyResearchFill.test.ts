import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  applyResearchEntries,
  applyResearchFill,
  type ResearchEntry,
} from "./applyResearchFill.ts";

const FIXTURE = `
{
  makeIncludes: "jayco",
  modelIncludes: "seneca",
  yearMin: 2025,
  yearMax: 2025,
  floorplan: "37K",
  spec: {
    gvwrLbs: 31000,
    hitchLbs: 12000,
  },
},
...uvwPins(
  "jayco",
  "seneca",
  2025,
  2025,
  ["37K"],
  24820,
  "owner-reported weigh-in ~24,820 lb (web)",
),
{
  makeIncludes: "entegra",
  modelIncludes: "anthem",
  yearMin: 2025,
  yearMax: 2025,
  floorplan: "44R",
  spec: {
    gvwrLbs: 52000,
    hitchLbs: 1000,
  },
},
{
  makeIncludes: "jayco",
  modelIncludes: "precept",
  yearMin: 2025,
  yearMax: 2025,
  floorplan: "31UL",
  spec: {
    gvwrLbs: 22000,
    uvwLbs: 18000,
  },
},
{
  makeIncludes: "fleetwood",
  modelIncludes: "discovery",
  yearMin: 2023,
  yearMax: 2023,
  floorplan: "36Q",
  spec: {
    gvwrLbs: 33400,
  },
},
{
  makeIncludes: "thor",
  modelIncludes: "omni",
  yearMin: 2024,
  yearMax: 2024,
  floorplan: "X1",
  spec: {
    gvwrLbs: 18000,
  },
},
`;

const ENTRIES: ResearchEntry[] = [
  {
    year: 2025,
    make: "Entegra",
    model: "Anthem",
    floorplan: "44R",
    field: "uvw",
    value: 40000,
    unit: "lbs",
    sourceUrl: "https://example.com/anthem.pdf",
    sourceType: "oem",
    confidence: "high",
    note: "2025 brochure table",
  },
  {
    year: 2025,
    make: "Entegra",
    model: "Anthem",
    floorplan: "44R",
    field: "sleeps",
    value: 6,
    unit: "count",
    sourceUrl: "https://example.com/anthem.pdf",
    sourceType: "oem",
    confidence: "low",
    note: "floorplan card",
  },
  {
    year: 2025,
    make: "Jayco",
    model: "Precept",
    floorplan: "31UL",
    field: "uvwLbs",
    value: 19000,
    unit: "lbs",
    sourceUrl: "https://example.com/precept.pdf",
    sourceType: "dealer",
    confidence: "high",
  },
  {
    year: 2025,
    make: "Jayco",
    model: "Seneca",
    floorplan: "37K",
    field: "UVW",
    value: 25000,
    unit: "lbs",
    sourceUrl: "https://example.com/seneca.pdf",
    sourceType: "other",
    confidence: "high",
    note: "must not replace the owner-reported pin",
  },
  {
    year: 2023,
    make: "Fleetwood",
    model: "Discovery",
    floorplan: "36Q",
    field: "uvw",
    value: 34000,
    unit: "lbs",
    sourceUrl: "https://example.com/discovery.pdf",
    sourceType: "oem",
    confidence: "high",
  },
  {
    year: 2024,
    make: "Thor",
    model: "Omni",
    floorplan: "X1",
    field: "uvw",
    value: 5000,
    unit: "kg",
    sourceUrl: "https://example.com/omni.pdf",
    sourceType: "dealer",
    confidence: "high",
  },
];

test("blank UVW is filled, stored UVW is kept, Seneca 24820 stays, UVW >= GVWR is rejected", () => {
  const result = applyResearchEntries(FIXTURE, ENTRIES);
  assert.match(result.catalogSource, /uvwLbs: 40000,/);
  assert.match(result.catalogSource, /sourceLabel: "oem"/);
  assert.match(result.catalogSource, /https:\/\/example\.com\/anthem\.pdf/);
  assert.match(result.catalogSource, /2025 brochure table/);
  assert.match(result.catalogSource, /lowConfidence: true,/);
  assert.match(result.catalogSource, /sleeps: 6,/);
  assert.match(result.catalogSource, /uvwLbs: 18000,/);
  assert.doesNotMatch(result.catalogSource, /uvwLbs: 19000/);
  assert.match(result.catalogSource, /24820/);
  assert.doesNotMatch(result.catalogSource, /uvwLbs: 25000/);
  assert.doesNotMatch(result.catalogSource, /uvwLbs: 34000/);
  assert.match(result.catalogSource, /uvwLbs: 11023,/);

  const reasons = result.unresolved.map((row) => row.reason).sort();
  assert.deepEqual(reasons, [
    "overwrite",
    "protected-seneca-2025-uvw-24820",
    "uvw-gte-gvwr",
  ]);

  const filled = result.changelog.map((row) => `${row.floorplan}:${row.field}=${row.value}`);
  assert.deepEqual(filled.sort(), ["44R:sleeps=6", "44R:uvwLbs=40000", "X1:uvwLbs=11023"]);
  assert.equal(result.changelog.find((row) => row.floorplan === "44R" && row.field === "sleeps")?.lowConfidence, true);
  assert.equal(result.changelog.find((row) => row.field === "uvwLbs" && row.floorplan === "44R")?.lowConfidence, false);
});

test("applyResearchFill writes changelog and unresolved without touching a second catalog", () => {
  const dir = mkdtempSync(join(tmpdir(), "research-fill-"));
  const catalogPath = join(dir, "floorplanSpecs.ts");
  const researchPath = join(dir, "research-values.json");
  const changelogPath = join(dir, "changelog.json");
  const unresolvedPath = join(dir, "unresolved.json");
  writeFileSync(catalogPath, FIXTURE);
  writeFileSync(
    researchPath,
    JSON.stringify([
      ENTRIES[2],
    ]),
  );
  const out = applyResearchFill({
    researchPath,
    catalogPath,
    changelogPath,
    unresolvedPath,
  });
  assert.equal(out.changelog.length, 0);
  assert.equal(out.unresolved[0]?.reason, "overwrite");
  assert.equal(readFileSync(catalogPath, "utf8"), FIXTURE);
  assert.equal(JSON.parse(readFileSync(changelogPath, "utf8")).length, 0);
  assert.equal(JSON.parse(readFileSync(unresolvedPath, "utf8"))[0].reason, "overwrite");
});
