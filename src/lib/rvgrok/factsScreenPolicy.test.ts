import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GROUNDING_RULES } from "./grounding.ts";
import { VOICE_MIC_RULES, XAI_REALTIME_URL } from "./voice.ts";
import { buildRealtimeSessionUpdate } from "./liveVoice.ts";
import { buildWebSearchRequest } from "./webSearch.ts";
import { decideVoiceWebResearch } from "./voiceWeb.ts";
import { executeWebResearch } from "./webResearchTelemetry.ts";
import { snapshotFromJson } from "./ownLotInventory.ts";
import { RV_GROK_LEAN_CORE } from "./speechPolicy.ts";
import { factsSpecRequestsWebSearch } from "./factsScreenPolicy.ts";

const root = dirname(fileURLToPath(import.meta.url));

const SPEC = "What's the GVWR on a 2022 Newmar Dutch Star 4369?";
const STOCK = "do we have a 2025 Newmar Dutch Star in stock";
const SPEC_AND_STOCK =
  "What's the GVWR on a 2022 Newmar Dutch Star, and do we have one in stock?";
const INFO = "Tell me about a 2022 Newmar Dutch Star 4369";

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

test("Facts spec and info asks request a web search; a pure stock ask does not", () => {
  assert.equal(factsSpecRequestsWebSearch("Facts", SPEC), true);
  assert.equal(factsSpecRequestsWebSearch("Facts", INFO), true);
  assert.equal(factsSpecRequestsWebSearch("Facts", SPEC_AND_STOCK), true);
  assert.equal(factsSpecRequestsWebSearch("Facts", STOCK), false);
  assert.equal(factsSpecRequestsWebSearch("Facts", "yes"), false);
  assert.equal(factsSpecRequestsWebSearch("Lot", SPEC), false);
  assert.equal(factsSpecRequestsWebSearch("Lot", SPEC_AND_STOCK), false);
});

test("Facts spec path requests a real web_search tool", () => {
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

  const mixed = await executeWebResearch({
    query: SPEC_AND_STOCK,
    apiKey: undefined,
    timeoutMs: 50,
    profile: "chat",
    screen: "Facts",
    ownLotSnapshot: snap,
  });
  assert.equal(mixed.kind, "missing_key");
  assert.equal(mixed.ok, false);

  const stock = await executeWebResearch({
    query: STOCK,
    apiKey: undefined,
    timeoutMs: 50,
    profile: "chat",
    screen: "Facts",
    ownLotSnapshot: snap,
  });
  assert.equal(stock.ok, true);
  assert.match(stock.notes || "", /N2401/);
});

test("Facts voice searches for specs; the session prompt matches the other screens", () => {
  const facts = buildRealtimeSessionUpdate(
    "ara",
    1,
    "",
    "",
    "",
    "",
    "Facts",
  ).session as { instructions: string };
  const lot = buildRealtimeSessionUpdate(
    "ara",
    1,
    "",
    "",
    "",
    "",
    "Lot",
  ).session as { instructions: string };
  assert.match(facts.instructions, /not to override an injected lot snapshot/);
  assert.match(lot.instructions, /not to override an injected lot snapshot/);
  assert.match(facts.instructions, /If both are empty, say that field is unverified/);
  const decision = decideVoiceWebResearch({
    transcript: SPEC,
    screen: "Facts",
  });
  assert.equal(decision.action, "research");
  const mixed = decideVoiceWebResearch({
    transcript: SPEC_AND_STOCK,
    screen: "Facts",
  });
  assert.equal(mixed.action, "research");
  const stock = decideVoiceWebResearch({
    transcript: STOCK,
    screen: "Facts",
  });
  assert.equal(stock.action, "research");
  assert.equal(stock.speakHold, false);
  const yes = decideVoiceWebResearch({
    transcript: "yes",
    screen: "Facts",
  });
  assert.equal(yes.action, "pass");
});

test("Facts spec wiring searches and keeps the lot tool; core prompt and model ids stay", () => {
  assert.match(GROUNDING_RULES, /source-of-truth for engine/);
  assert.match(VOICE_MIC_RULES, /do not speak a weight/i);
  assert.match(RV_GROK_LEAN_CORE, /If both are empty, say that field is unverified/);
  const api = readFileSync(join(root, "../../routes/api/rvgrok.ts"), "utf8");
  assert.match(api, /factsSpecRequestsWebSearch/);
  assert.match(api, /skipWebForLot = factsSpec/);
  assert.match(api, /looksLikeOwnLotStockQuestion/);
  assert.match(api, /formatOwnLotBlock/);
  assert.match(
    api,
    /toolFn\(\s*"get_own_lot"/,
  );
  assert.doesNotMatch(api, /factsChatTools|factsRequiredTool|formatFactsStockBlock|factsStockCheckAllowed|classifyFactsTurn|FACTS STOCK CHECK/);
  assert.doesNotMatch(api, /factsDelivery|applyFactsDelivery|FACTS_SPEC_INSTRUCTION/);
  assert.match(
    api,
    /\["grok-4\.7", "grok-4\.6", "grok-4-latest", "grok-4\.5", "grok-3"\]/,
  );
  assert.doesNotMatch(api, /turn\?\.model/);
  assert.match(XAI_REALTIME_URL, /model=grok-voice-latest/);
  const live = readFileSync(join(root, "liveVoice.ts"), "utf8");
  assert.doesNotMatch(live, /applyFactsDelivery|voiceBrowseLine/);
  const speech = readFileSync(join(root, "speechPolicy.ts"), "utf8");
  assert.match(speech, /If both are empty, say that field is unverified/);
  const policy = readFileSync(join(root, "factsScreenPolicy.ts"), "utf8");
  assert.doesNotMatch(policy, /factsChatTools|factsStockCheckAllowed|classifyFactsTurn/);
});
