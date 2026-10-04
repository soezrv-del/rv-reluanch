import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chatHoldLine, chatReadsLot } from "./chatHold.ts";
import { looksLikeOwnLotSearchAsk } from "./ownLotAsk.ts";

const NAVION = "Can you check the lot to see if we have a Navion?";
const PAGE = "In the lot page it says we do have a Navion.";
const VIEWS = "How many Winnebago Views do we have in stock?";
const LIKE =
  "Does Winnebago build anything other than the View that's like the View?";

test("typed lot and spec asks use the same hold voice uses", () => {
  assert.equal(chatHoldLine(NAVION), "I'll check the lot.");
  assert.equal(chatHoldLine(VIEWS), "I'll check the lot.");
  assert.equal(chatHoldLine(PAGE), "I'll check the lot.");
  assert.equal(chatHoldLine("What's the GVWR on a 2024 Seneca?"), "Give me one second.");
  assert.equal(chatHoldLine("Can you hear me?"), "");
  assert.equal(chatHoldLine(LIKE), "Give me one second.");
  assert.equal(chatHoldLine("A Navion."), "");
  assert.equal(chatHoldLine("A Navion.", [NAVION]), "I'll check the lot.");
  assert.equal(chatHoldLine("Can you hear me?", [NAVION]), "");
  assert.equal(chatHoldLine("Yes.", [VIEWS]), "");
});

test("a lot sentence is searched whole, including a name the parser misses", () => {
  assert.equal(looksLikeOwnLotSearchAsk(NAVION), true);
  assert.equal(looksLikeOwnLotSearchAsk(PAGE), true);
  assert.equal(looksLikeOwnLotSearchAsk("tell me about the Entegra Vision"), false);
  assert.equal(looksLikeOwnLotSearchAsk(LIKE), false);
  assert.equal(chatReadsLot("A Navion.", [VIEWS]), true);
  assert.equal(chatReadsLot("Navion"), false);
});

test("text chat opens the reply before the lookup finishes", () => {
  const root = dirname(fileURLToPath(import.meta.url));
  const api = readFileSync(join(root, "../../routes/api/rvgrok.ts"), "utf8");
  assert.match(api, /chatHoldLine/);
  assert.match(api, /openChatSse/);
  assert.match(api, /stream:\s*true/);
  assert.match(api, /lotSummaryForSpeech/);
  const lotRead = api.indexOf("answerQueryLotFromSnapshot(");
  const memory = api.indexOf("phoneKey ? loadVisitorMemoryBlockFromRequest");
  assert.ok(lotRead > 0 && memory > lotRead);
});
