import { test } from "node:test";
import assert from "node:assert/strict";
import { CHAT_CRITICAL, chatCoreFor } from "./chatCore.ts";
import { hasLotClaim, lotClaimSentences, stripLotClaims } from "./lotNumberCheck.ts";

test("chat core uses the five xAI sections plus a 4-line CRITICAL block", () => {
  const core = chatCoreFor("shopper");
  for (const h of ["## Role & Persona", "## Objective", "## Conversation Flow", "## Guardrails & Escalation", "## Voice & Communication Style", "## CRITICAL"]) {
    assert.ok(core.includes(h), h);
  }
  assert.equal(CHAT_CRITICAL.split("\n").filter((l) => l.startsWith("- ")).length, 4);
});

test("chat core drops the stacked stop rules", () => {
  const core = chatCoreFor("owner");
  for (const gone of ["EXIT SPENT", "EXIT OPEN", "Then stop", "Do not ballpark", "SHOPPER RETRIEVAL", "OWNER RETRIEVAL"]) {
    assert.ok(!core.includes(gone), gone);
  }
  for (const tool of ["search_lot", "get_coach_specs", "web_search"]) assert.ok(core.includes(tool), tool);
});

test("lot-number check flags inventory numbers, not years or specs", () => {
  assert.ok(hasLotClaim("We have 12 Class Cs on the lot."));
  assert.ok(hasLotClaim("I found 3 units, stock number 47407 at $163,648."));
  assert.ok(!hasLotClaim("The 2023 Vision has a 7.3L V8 with 350 hp."));
  assert.equal(lotClaimSentences("GVWR is 31,000 lb. We have 4 in stock.").length, 1);
});

test("strip keeps the rest of the reply and never leaves it empty", () => {
  const out = stripLotClaims("Great coach for a family. We have 4 in stock.");
  assert.ok(out.startsWith("Great coach for a family."));
  assert.ok(!/4 in stock/.test(out));
  assert.ok(stripLotClaims("We have 4 in stock.").length > 0);
});
