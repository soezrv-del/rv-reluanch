import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHAT_WEB_SEARCH_TIMEOUT_MS,
  VOICE_WEB_SEARCH_MODELS,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
  WEB_SEARCH_MAX_TOOL_CALLS,
  WEB_SEARCH_MODELS,
  buildWebSearchRequest,
  clipCatalogBlock,
  clearWebSearchCache,
  fetchWebSearchNotes,
  formatWebSearchInjection,
  isAbortLikeError,
  researchCacheKey,
  seedWebSearchCache,
} from "./webSearch.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("fast research models never include grok-4.6", () => {
  assert.deepEqual([...WEB_SEARCH_MODELS], [
    "grok-4-1-fast-reasoning",
    "grok-4-1-fast-non-reasoning",
  ]);
  assert.deepEqual([...VOICE_WEB_SEARCH_MODELS], ["grok-4-1-fast-reasoning"]);
  assert.equal(VOICE_WEB_SEARCH_TIMEOUT_MS, 10_000);
  assert.equal(CHAT_WEB_SEARCH_TIMEOUT_MS, 12_000);
  assert.equal(WEB_SEARCH_MAX_TOOL_CALLS, 1);
});

test("speed knobs stay off the #113-forbidden fields", () => {
  const extras = buildWebSearchRequest({
    model: "grok-4-1-fast-reasoning",
    query: "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
    extras: true,
  });
  assert.equal(extras.max_tool_calls, 1);
  assert.equal(extras.tool_choice, "required");
  assert.equal("reasoning" in extras, false);
  assert.equal("temperature" in extras, false);
  assert.equal("max_output_tokens" in extras, false);
  assert.equal("search_parameters" in extras, false);
  const input = extras.input as Array<{ role: string }>;
  assert.equal(input[0]?.role, "user");
  assert.doesNotMatch(JSON.stringify(extras), /"role":"system"/);

  const minimal = buildWebSearchRequest({
    model: "grok-4-1-fast-reasoning",
    query: "generator won't start",
    extras: false,
  });
  assert.deepEqual(Object.keys(minimal).sort(), ["input", "model", "tools"]);

  const slow = buildWebSearchRequest({
    model: "grok-4.6",
    query: "water heater bypass",
  });
  assert.deepEqual(slow.reasoning, { effort: "low" });
});

test("voice prompt is 1-3 sentences; chat stays short notes", () => {
  const voice = buildWebSearchRequest({
    model: "grok-4-1-fast-reasoning",
    query: "check engine light reset Ford E450",
    profile: "voice",
  });
  const chat = buildWebSearchRequest({
    model: "grok-4-1-fast-reasoning",
    query: "check engine light reset Ford E450",
    profile: "chat",
  });
  const voiceText = JSON.stringify(voice);
  const chatText = JSON.stringify(chat);
  assert.match(voiceText, /1–3 spoken sentences|1-3 spoken sentences/);
  assert.match(chatText, /4–8 short bullets|4-8 short bullets/);
  assert.match(voiceText, /Search ONCE/);
});

test("catalog clip drops the long lock-rules essay", () => {
  const block = [
    "VERIFIED CATALOG / BROCHURE for 2005 Winnebago Adventurer:",
    "- engine: Triton V10  [catalog]",
    "VERIFIED CATALOG LOCK (non-negotiable):",
    "- The CATALOG / BROCHURE block in this request is source-of-truth for engine, horsepower, chassis, transmission, and fuel.",
    "x".repeat(2000),
  ].join("\n");
  const clipped = clipCatalogBlock(block);
  assert.match(clipped, /Triton V10/);
  assert.doesNotMatch(clipped, /non-negotiable/);
  assert.ok(clipped.length <= 700 || clipped.endsWith("…"));

  const body = buildWebSearchRequest({
    model: "grok-4-1-fast-reasoning",
    query: "battery disconnect",
    catalogBlock: block,
  });
  const packed = JSON.stringify(body);
  assert.match(packed, /Triton V10/);
  assert.doesNotMatch(packed, /non-negotiable/);
});

test("cache key normalizes the spoken/typed question", () => {
  const a = researchCacheKey(
    "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
  );
  const b = researchCacheKey(
    "where is the battery disconnect on a 2005 winnebago adventurer",
  );
  assert.equal(a, b);
});

test("successful notes cache; failures do not invent a lookup", async () => {
  clearWebSearchCache();
  const query = "Where is the battery disconnect on a 2005 Winnebago Adventurer?";
  const key = researchCacheKey(query);
  seedWebSearchCache(key, {
    ok: true,
    notes: "Owners often cite a labeled house-battery disconnect near the entry step or battery bay. Confirm on that coach — layouts vary.",
    model: "grok-4-1-fast-reasoning",
  });
  const hit = await fetchWebSearchNotes({
    apiKey: "not-used-when-cached",
    query,
  });
  assert.equal(hit.ok, true);
  if (hit.ok) {
    assert.match(hit.notes, /house-battery disconnect/i);
    assert.equal(hit.model, "grok-4-1-fast-reasoning");
  }

  const miss = await fetchWebSearchNotes({
    apiKey: undefined,
    query: "generator won't start troubleshooting",
  });
  assert.equal(miss.ok, false);
  if (!miss.ok) assert.match(miss.reason, /no XAI_API_KEY/);
  const injection = formatWebSearchInjection(miss);
  assert.match(injection, /WEB SEARCH NOT AVAILABLE/);
  assert.match(injection, /do not invent/i);
  clearWebSearchCache();
});

test("abort/timeout errors stop the model loop", () => {
  assert.equal(isAbortLikeError(new DOMException("The operation was aborted due to timeout", "TimeoutError")), true);
  assert.equal(
    isAbortLikeError(Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" })),
    true,
  );
  assert.equal(isAbortLikeError(new Error("web search HTTP 400")), false);
});

test("chat and voice routes pass the new timeout/profile", () => {
  const chat = readFileSync(join(root, "../../routes/api/rvgrok.ts"), "utf8");
  const voice = readFileSync(
    join(root, "../../routes/api/rvgrok.web-research.ts"),
    "utf8",
  );
  assert.match(chat, /CHAT_WEB_SEARCH_TIMEOUT_MS/);
  assert.match(chat, /profile: "chat"/);
  assert.match(voice, /executeWebResearch/);
  assert.match(voice, /webResearchJsonResponse/);
  assert.doesNotMatch(voice, /fetchWebSearchNotes/);
});
