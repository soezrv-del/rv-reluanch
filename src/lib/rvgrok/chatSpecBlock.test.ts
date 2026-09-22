import assert from "node:assert/strict";
import test from "node:test";
import {
  extractChatSpecFigures,
  paintChatSpecOntoRows,
} from "./chatSpecBlock.ts";

const DUTCH_STAR_CHAT = `2019 Newmar Dutch Star 4369 — Class A diesel. Cummins L9, 450 horsepower, 1,250 pound-feet of torque, Allison 3000 MH. Chassis is Freightliner XCR or Spartan K2 tagged by length. Live notes put GVWR at 51,000 pounds, UVW around 40,000 to 40,700, length about 43 feet 9 inches, 150-gallon fuel tank, 15,000-pound tow, three slides. Layout details unconfirmed on the 4369.`;

test("extracts labeled GVWR / UVW / fuel / tow from the assistant spec block", () => {
  const figs = extractChatSpecFigures(DUTCH_STAR_CHAT);
  assert.match(figs.gvwr || "", /51,000/);
  assert.match(figs.uvw || "", /40,000/);
  assert.match(figs.uvw || "", /40,700/);
  assert.equal(figs.fuelCapacity, "150 gal");
});

test("does not invent when the reply has no labeled specs", () => {
  assert.deepEqual(extractChatSpecFigures(""), {});
  assert.deepEqual(
    extractChatSpecFigures("Nice coach. What do you want to know next?"),
    {},
  );
  const est = extractChatSpecFigures("GVWR 32,000 typical class range (EST)");
  assert.equal(est.gvwr, undefined);
});

test("chat numbers overwrite Confirm brochure; untouched rows stay", () => {
  const rows = paintChatSpecOntoRows(
    [
      { label: "GVWR", value: "Confirm brochure", gap: true },
      { label: "UVW", value: "Confirm brochure", gap: true },
      { label: "Fuel capacity", value: "100 gal", gap: false },
      { label: "CCC", value: "Confirm brochure", gap: true },
      { label: "Class", value: "Class A Diesel", gap: false },
    ],
    extractChatSpecFigures(DUTCH_STAR_CHAT),
  );
  assert.equal(rows.find((r) => r.label === "GVWR")?.gap, false);
  assert.match(rows.find((r) => r.label === "GVWR")?.value || "", /51,000/);
  assert.match(rows.find((r) => r.label === "UVW")?.value || "", /40,000/);
  assert.equal(rows.find((r) => r.label === "Fuel capacity")?.value, "150 gal");
  assert.equal(rows.find((r) => r.label === "CCC")?.value, "Confirm brochure");
  assert.equal(rows.find((r) => r.label === "Class")?.value, "Class A Diesel");
});
