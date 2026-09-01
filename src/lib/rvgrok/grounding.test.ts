import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  honestHorsepowerLabel,
  isAmbiguousCatalogValue,
} from "../rv/catalogHonesty.ts";
import { findPowertrainCorrection } from "../rv/powertrainCorrections.ts";
import { parseCoachFromText } from "./parseCoach.ts";
import {
  buildWebSearchRequest,
  extractResponsesText,
} from "./webSearch.ts";

const root = dirname(fileURLToPath(import.meta.url));
const rvRoot = join(root, "../rv");

function src(dir: string, name: string) {
  return readFileSync(join(dir, name), "utf8");
}

test("parses David’s test coach from a spec question", () => {
  const p = parseCoachFromText(
    "What engine and HP does a 2023 American Coach American Dream 45A have?",
  );
  assert.equal(p.year, "2023");
  assert.equal(p.make, "American Coach");
  assert.match(p.model, /american dream/i);
  assert.equal(p.floorplan, "45A");
});

test("2023 American Dream pin is an option band — not a single invented HP", () => {
  const pin = findPowertrainCorrection(
    "2023",
    "American Coach",
    "American Dream",
    "45A",
  );
  assert.ok(pin, "expected a brochure pin for American Dream");
  assert.equal(pin!.fuelType, "Diesel");
  assert.match(pin!.engine, /L9/);
  assert.match(pin!.engine, /X15|605|opt/i);
  assert.match(pin!.chassis || "", /Spartan/i);
  assert.doesNotMatch(pin!.engine, /Liberty Bridge|F-?53|Godzilla/i);
  assert.equal(isAmbiguousCatalogValue(pin!.engine), true);
  assert.ok(
    pin!.horsepower <= 0,
    "Dream pin must not lock horsepower at 450",
  );
  assert.equal(
    pin!.torqueLbFt == null || pin!.torqueLbFt <= 0,
    true,
    "Dream pin must not lock L9-only torque",
  );

  const hp = honestHorsepowerLabel({
    engine: pin!.engine,
    horsepower: 450,
  });
  assert.match(hp || "", /450/);
  assert.match(hp || "", /605|opt/i);
  assert.doesNotMatch(hp || "", /^450 HP$/);
});

test("sibling American Tradition pin is not applied to a Dream", () => {
  const dream = findPowertrainCorrection(
    "2023",
    "American Coach",
    "American Dream",
    "45B",
  );
  assert.doesNotMatch(dream?.chassis || "", /Liberty Bridge/i);
});

test("Entegra Vision pin stays gas F-53 Godzilla", () => {
  const pin = findPowertrainCorrection("2023", "Entegra Coach", "Vision", "");
  assert.ok(pin);
  assert.equal(pin!.fuelType, "Gas");
  assert.match(pin!.engine, /Godzilla|7\.3/i);
  assert.doesNotMatch(pin!.engine, /Cummins|L9/i);
});

test("chat must not write Facts cache; Live must not fill hard fields", () => {
  const grounding = src(root, "grounding.ts");
  const guard = src(rvRoot, "livePowertrainGuard.ts");
  const cache = src(rvRoot, "verifiedCatalogCache.ts");
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(grounding, /CHAT_MAY_WRITE_FACTS_CACHE = false/);
  assert.match(guard, /Live Grok never writes engine/);
  assert.match(cache, /Chat answers must never call saveVerifiedDossier/);
  assert.match(api, /catalogContext/);
  assert.match(api, /fetchWebSearchNotes/);
  assert.doesNotMatch(api, /search_parameters/);
});

test("Live Voice instructions are accuracy-first; gesture order untouched", () => {
  const voice = src(root, "voice.ts");
  const live = src(root, "liveVoice.ts");
  assert.match(voice, /ACCURACY FIRST/);
  assert.match(voice, /never invent/i);
  assert.match(voice, /American Dream ≠ Tradition/);
  assert.match(voice, /Comfort Drive/);
  assert.doesNotMatch(voice, /You do not have a separate research step/);
  assert.match(live, /liveVoiceStartOrder/);
  assert.match(live, /gesture-capture/);
  assert.match(live, /catalogContext/);
});

test("web search sidecar uses Responses web_search tool", () => {
  const body = buildWebSearchRequest({
    model: "grok-4.5",
    query: "2023 American Coach American Dream engine HP chassis",
    catalogBlock: "engine: Cummins L9 450 std / X15 605 opt",
  });
  assert.deepEqual(body.tools, [{ type: "web_search" }]);
  assert.equal("search_parameters" in body, false);
  const notes = extractResponsesText({
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: "UNKNOWN — confirm brochure" }],
      },
    ],
  });
  assert.match(notes, /UNKNOWN/);
});

test("RvGROK chat client injects catalog grounding", () => {
  const app = src(join(root, "../../components/rvgrok"), "RvGrokApp.tsx");
  const stream = src(root, "stream.ts");
  assert.match(app, /buildChatGrounding/);
  assert.match(app, /catalogContext/);
  assert.match(app, /buildVoiceGrounding/);
  assert.match(stream, /catalogContext/);
  assert.match(stream, /wantsWebFallback/);
});
