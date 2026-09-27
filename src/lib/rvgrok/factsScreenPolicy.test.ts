import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GROUNDING_RULES } from "./grounding.ts";
import { VOICE_MIC_RULES } from "./voice.ts";
import { buildRealtimeSessionUpdate } from "./liveVoice.ts";
import { buildWebSearchRequest } from "./webSearch.ts";
import { decideVoiceWebResearch } from "./voiceWeb.ts";
import { executeWebResearch } from "./webResearchTelemetry.ts";
import {
  formatFactsStockBlock,
  snapshotFromJson,
} from "./ownLotInventory.ts";
import {
  FACTS_SPEC_INSTRUCTION,
  classifyFactsTurn,
  factsChatTools,
  factsSpecRequestsWebSearch,
  factsStockCheckAllowed,
} from "./factsScreenPolicy.ts";

const root = dirname(fileURLToPath(import.meta.url));

const SPEC = "What's the GVWR on a 2022 Newmar Dutch Star 4369?";
const STOCK = "do we have a 2025 Newmar Dutch Star in stock";
const SPEC_AND_STOCK =
  "What's the GVWR on a 2022 Newmar Dutch Star, and do we have one in stock?";

const snap = snapshotFromJson({
  source: "own",
  dealer: "RV Country",
  units: [
    {
      year: "2025",
      make: "Newmar",
      model: "Dutch Star",
      trim: "4369",
      body_type: "Class A Diesel",
      location: "Wilsonville",
      stock_number: "N2401",
      price: 389000,
      length_ft: 43,
    },
  ],
});

test("Facts spec tools omit the lot tool; Lot and stock checks keep it", () => {
  const tools = [
    { function: { name: "get_own_lot" } },
    { function: { name: "get_coach_facts" } },
  ];
  assert.deepEqual(
    factsChatTools(tools, "Facts", "spec").map((tool) => tool.function.name),
    ["get_coach_facts"],
  );
  assert.equal(factsChatTools(tools, "Facts", "passthrough").length, 1);
  assert.equal(factsChatTools(tools, "Facts", "stock").length, 2);
  assert.equal(factsChatTools(tools, "Lot", "spec").length, 2);
  assert.doesNotMatch(FACTS_SPEC_INSTRUCTION, /OWN-LOT INVENTORY/);
  assert.match(FACTS_SPEC_INSTRUCTION, /live web research/);
  assert.match(FACTS_SPEC_INSTRUCTION, /exact pinned Facts value wins/i);
});

test("stock check waits for yes or an explicit stock ask", () => {
  assert.equal(factsStockCheckAllowed(SPEC, []), false);
  assert.equal(factsStockCheckAllowed("yes", []), false);
  assert.equal(factsStockCheckAllowed("yes", [SPEC]), true);
  assert.equal(classifyFactsTurn("Facts", SPEC, []), "spec");
  assert.equal(classifyFactsTurn("Facts", "yes", [SPEC]), "stock");
  assert.equal(classifyFactsTurn("Facts", STOCK, []), "stock");
  assert.equal(classifyFactsTurn("Facts", SPEC_AND_STOCK, []), "spec");
  assert.equal(classifyFactsTurn("Lot", SPEC, []), "passthrough");
  assert.equal(factsSpecRequestsWebSearch("Facts", SPEC, []), true);
  assert.equal(factsSpecRequestsWebSearch("Lot", SPEC, []), false);
  assert.equal(factsSpecRequestsWebSearch("Facts", "yes", [SPEC]), false);
});

test("Facts spec path requests a real web_search tool", () => {
  assert.equal(factsSpecRequestsWebSearch("Facts", SPEC, []), true);
  const body = buildWebSearchRequest({
    model: "grok-4.7",
    query: SPEC,
    profile: "chat",
  });
  assert.deepEqual(body.tools, [{ type: "web_search" }]);
});

test("Facts spec research is not replaced by the lot snapshot", async () => {
  const body = await executeWebResearch({
    query: SPEC,
    apiKey: undefined,
    timeoutMs: 50,
    profile: "chat",
    screen: "Facts",
    ownLotSnapshot: snap,
  });
  assert.equal(body.kind, "missing_key");
  assert.equal(body.ok, false);
});

test("Facts stock check reports stock only", () => {
  const notes = formatFactsStockBlock(snap, STOCK);
  assert.match(notes, /FACTS STOCK CHECK/);
  assert.match(notes, /N2401/);
  assert.match(notes, /Wilsonville/);
  assert.match(notes, /\$389,000/);
  assert.doesNotMatch(notes, /length_ft|SCRAPE ROW|OWN-LOT inventory|43 ft/i);
});

test("Facts voice session searches; Lot still speaks an injected snapshot", () => {
  const facts = buildRealtimeSessionUpdate(
    "ara",
    1,
    "",
    "",
    "",
    "",
    "Facts",
  ).session as { instructions: string };
  assert.match(facts.instructions, /native web_search/);
  assert.match(facts.instructions, /exact pin wins/i);
  assert.doesNotMatch(
    facts.instructions,
    /not to override an injected lot snapshot/,
  );
  const lot = buildRealtimeSessionUpdate(
    "ara",
    1,
    "",
    "",
    "",
    "",
    "Lot",
  ).session as { instructions: string };
  assert.match(lot.instructions, /not to override an injected lot snapshot/);
  const decision = decideVoiceWebResearch({
    transcript: SPEC,
    screen: "Facts",
  });
  assert.equal(decision.action, "research");
});

test("catalog is not the only spec source, and a web number is not a pin", () => {
  assert.doesNotMatch(GROUNDING_RULES, /source-of-truth for engine/);
  assert.match(GROUNDING_RULES, /Specs always get a live web search/);
  assert.match(GROUNDING_RULES, /exact pinned Facts value wins/i);
  assert.match(GROUNDING_RULES, /never used for payment, CCC, hitch, or tow math/);
  assert.doesNotMatch(VOICE_MIC_RULES, /do not speak a weight/i);
  assert.match(VOICE_MIC_RULES, /web-found number/);
  const api = readFileSync(join(root, "../../routes/api/rvgrok.ts"), "utf8");
  assert.match(api, /factsTurn !== "spec"/);
  assert.match(api, /formatFactsStockBlock/);
  assert.match(api, /skipOwnLot: factsTurn === "spec"/);
  assert.match(api, /looksLikeOwnLotStockQuestion/);
});
