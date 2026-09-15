import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  DUMP_FEE_LABEL,
  DUMP_FEE_LEGEND,
  FREE_DUMP_STATIONS,
  curatedDumpFee,
  feeFromOsmTags,
  filterDumpStations,
  nearestCuratedDump,
} from "./dumpStations.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("feeFromOsmTags is honest — never invents a price", () => {
  assert.equal(feeFromOsmTags({}), "unknown");
  assert.equal(feeFromOsmTags({ name: "Rest area" }), "unknown");
  assert.equal(feeFromOsmTags({ fee: "" }), "unknown");
  assert.equal(feeFromOsmTags({ fee: "customers" }), "unknown");
  assert.equal(feeFromOsmTags({ fee: "donation" }), "unknown");
  assert.equal(feeFromOsmTags({ fee: "no" }), "free");
  assert.equal(feeFromOsmTags({ fee: "NO" }), "free");
  assert.equal(feeFromOsmTags({ fee: "yes" }), "paid");
  assert.equal(feeFromOsmTags({ fee: "5 USD" }), "paid");
  assert.equal(curatedDumpFee(), "free");
  assert.equal(DUMP_FEE_LABEL.unknown, "Fee unknown");
  assert.doesNotMatch(DUMP_FEE_LABEL.paid, /\$|\d/);
  assert.equal(DUMP_FEE_LEGEND.length, 3);
});

test("curated western list stays known-free and filterable", () => {
  assert.ok(FREE_DUMP_STATIONS.length >= 10);
  const or = filterDumpStations(FREE_DUMP_STATIONS, { state: "OR" });
  assert.ok(or.every((s) => s.state === "OR"));
  const near = filterDumpStations(FREE_DUMP_STATIONS, {
    near: { lat: 43.615, lng: -116.2023 },
  });
  assert.ok((near[0]!.miles ?? 99) <= (near[1]!.miles ?? 99));
});

test("nearestCuratedDump matches a known rest-area dump", () => {
  const blacks = FREE_DUMP_STATIONS.find((s) => s.id === "id-blacks-creek");
  assert.ok(blacks);
  const hit = nearestCuratedDump(blacks!.lat + 0.001, blacks!.lng);
  assert.equal(hit?.id, "id-blacks-creek");
  assert.equal(nearestCuratedDump(0, 0), null);
});

test("dumpStations helpers do not invent prices in source", () => {
  const src = readFileSync(join(root, "dumpStations.ts"), "utf8");
  assert.match(src, /never invent a price/i);
  assert.match(src, /fee=yes/);
  assert.doesNotMatch(src, /\$\d|priceUsd|invented fee/i);
});
