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
  WEB_SEARCH_TIMEOUT_RETRIES,
  WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS,
  CHAT_WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS,
  WEB_SEARCH_TOOL_CALLS_PER_ATTEMPT,
  retryReserveMs,
  buildWebSearchRequest,
  clipCatalogBlock,
  clearWebSearchCache,
  evaluateResearchQuality,
  fetchWebSearchNotes,
  formatWebSearchInjection,
  isAbortLikeError,
  isTimeoutFailureReason,
  notesConfirmQueriedField,
  perAttemptTimeoutMs,
  rephraseResearchQuery,
  researchCacheKey,
  seedWebSearchCache,
  normalizeCoachTyposInAsk,
  coachLabelFromResearchAsk,
  skipGeminiForResearchAsk,
} from "./webSearch.ts";
import { mayEmitLabeledEstimate } from "./estimatePolicy.ts";

const root = dirname(fileURLToPath(import.meta.url));

const prevGeminiKey = process.env.GEMINI_API_KEY;
const prevResearchProvider = process.env.RVGROK_RESEARCH_PROVIDER;
delete process.env.GEMINI_API_KEY;
delete process.env.RVGROK_RESEARCH_PROVIDER;

test.after(() => {
  if (prevGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = prevGeminiKey;
  if (prevResearchProvider === undefined) {
    delete process.env.RVGROK_RESEARCH_PROVIDER;
  } else {
    process.env.RVGROK_RESEARCH_PROVIDER = prevResearchProvider;
  }
});

test("fast research models use grok-4.7 and never include grok-4.6", () => {
  assert.deepEqual([...WEB_SEARCH_MODELS], ["grok-4.7"]);
  assert.equal((WEB_SEARCH_MODELS as readonly string[]).includes("grok-4.6"), false);
  assert.deepEqual([...VOICE_WEB_SEARCH_MODELS], ["grok-4.7"]);
  assert.equal(VOICE_WEB_SEARCH_TIMEOUT_MS, 24_000);
  assert.equal(CHAT_WEB_SEARCH_TIMEOUT_MS, 36_000);
  assert.equal(WEB_SEARCH_MAX_TOOL_CALLS, 2);
  assert.equal(WEB_SEARCH_TOOL_CALLS_PER_ATTEMPT, 1);
});

test("speed knobs stay off the #113-forbidden fields", () => {
  const extras = buildWebSearchRequest({
    model: "grok-4.7",
    query: "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
    extras: true,
  });
  assert.equal(extras.max_tool_calls, WEB_SEARCH_TOOL_CALLS_PER_ATTEMPT);
  assert.equal(extras.max_tool_calls, 1);
  assert.equal(extras.tool_choice, "required");
  assert.deepEqual(extras.reasoning, { effort: "low" });
  assert.equal("temperature" in extras, false);
  assert.equal("max_output_tokens" in extras, false);
  assert.equal("search_parameters" in extras, false);
  const input = extras.input as Array<{ role: string }>;
  assert.equal(input[0]?.role, "user");
  assert.doesNotMatch(JSON.stringify(extras), /"role":"system"/);

  const minimal = buildWebSearchRequest({
    model: "grok-4.7",
    query: "generator won't start",
    extras: false,
  });
  assert.deepEqual(Object.keys(minimal).sort(), ["input", "model", "tools"]);

  const priorLow = buildWebSearchRequest({
    model: "grok-4.6",
    query: "water heater bypass",
  });
  assert.deepEqual(priorLow.reasoning, { effort: "low" });
});

test("voice prompt is 1-3 sentences; chat stays short notes", () => {
  const voice = buildWebSearchRequest({
    model: "grok-4.7",
    query: "check engine light reset Ford E450",
    profile: "voice",
  });
  const chat = buildWebSearchRequest({
    model: "grok-4.7",
    query: "check engine light reset Ford E450",
    profile: "chat",
  });
  const voiceText = JSON.stringify(voice);
  const chatText = JSON.stringify(chat);
  assert.match(voiceText, /1–3 spoken sentences|1-3 spoken sentences/);
  assert.match(chatText, /4–8 short bullets|4-8 short bullets/);
  assert.match(voiceText, /Research loop/);
  assert.match(voiceText, /CONFIRMED: yes/);
  assert.match(chatText, /DIFFERENT query phrasing/);
  assert.doesNotMatch(voiceText, /Search ONCE, then write/);
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
    model: "grok-4.7",
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
    model: "grok-4.7",
  });
  const hit = await fetchWebSearchNotes({
    apiKey: "not-used-when-cached",
    query,
  });
  assert.equal(hit.ok, true);
  if (hit.ok) {
    assert.match(hit.notes, /house-battery disconnect/i);
    assert.equal(hit.model, "grok-4.7");
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

test("sidecar HTTP 403 injects WEB SEARCH NOT AVAILABLE — the spoken Live Voice line", () => {
  const injection = formatWebSearchInjection({
    ok: false,
    reason: "voice web research HTTP 403",
    confirmed: false,
    attempts: 2,
    exhausted: true,
    queries: ["2026 Lineage 31W Z"],
    query: "2026 Lineage 31W Z",
  });
  assert.match(injection, /WEB SEARCH NOT AVAILABLE this turn/);
  assert.match(injection, /voice web research HTTP 403/);
  assert.match(injection, /Search returned nothing after a retry/);
});

test("Lineage 31ZW spec asks skip Gemini and name Series F Super C", () => {
  const q = "2026 Grand Design Lineage 31ZW";
  assert.equal(skipGeminiForResearchAsk(q), true);
  assert.equal(skipGeminiForResearchAsk("2026 Lineage 31W Z"), true);
  assert.equal(
    skipGeminiForResearchAsk(
      "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
    ),
    false,
  );
  assert.match(coachLabelFromResearchAsk(q), /2026 Grand Design Lineage Series F 31ZW/i);
  assert.match(coachLabelFromResearchAsk(q), /Super C/i);
  const second = rephraseResearchQuery(q, 1, [q]);
  assert.match(second, /Lineage Series F/i);
  assert.match(second, /31ZW/);
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
  assert.match(chat, /maxAttempts: WEB_SEARCH_MAX_TOOL_CALLS/);
  assert.match(voice, /executeWebResearch/);
  assert.match(voice, /webResearchJsonResponse/);
  assert.match(voice, /maxAttempts: WEB_SEARCH_MAX_TOOL_CALLS/);
  assert.doesNotMatch(voice, /fetchWebSearchNotes/);
});

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function questionFromBody(init?: RequestInit): string {
  const raw = typeof init?.body === "string" ? init.body : "";
  try {
    const parsed = JSON.parse(raw) as {
      input?: Array<{ content?: string }>;
    };
    const content = parsed.input?.[0]?.content || "";
    const m = content.match(/Question:\s*([\s\S]+)$/);
    return (m?.[1] || content).trim();
  } catch {
    return raw;
  }
}

test("rephraseResearchQuery never repeats a prior phrasing", () => {
  const original = "What's the GVWR on a 2019 XYZ Phantom?";
  const first = rephraseResearchQuery(original, 1, [original]);
  const second = rephraseResearchQuery(original, 2, [original, first]);
  assert.notEqual(first.toLowerCase(), original.toLowerCase());
  assert.notEqual(second.toLowerCase(), original.toLowerCase());
  assert.notEqual(second.toLowerCase(), first.toLowerCase());
  assert.match(first, /OEM brochure|official manufacturer|RVUSA/i);
});

test("pheaton typo normalizes and first GVWR phrasing is OEM Phaeton", () => {
  assert.equal(normalizeCoachTyposInAsk("2020 pheaton 40ih"), "2020 Phaeton 40ih");
  assert.match(
    coachLabelFromResearchAsk("What's the gvwr of a 2020 pheaton 40ih"),
    /2020 Tiffin Phaeton 40ih/i,
  );
  const original = "What's the gvwr of a 2020 pheaton 40ih";
  const first = rephraseResearchQuery(original, 0, []);
  assert.match(first, /Phaeton/);
  assert.doesNotMatch(first, /pheaton/);
  assert.match(first, /gvwr of a 2020 Phaeton 40ih/i);
  const second = rephraseResearchQuery(original, 1, [first]);
  assert.notEqual(
    second.toLowerCase().replace(/\s+/g, " "),
    first.toLowerCase().replace(/\s+/g, " "),
  );
  assert.match(second, /Phaeton/);
  assert.match(second, /factory GVWR|OEM brochure/i);
});

test("notesConfirmQueriedField requires a real fact, not a miss or EST", () => {
  const q = "What's the GVWR on a 2019 XYZ Phantom?";
  assert.equal(
    notesConfirmQueriedField(
      "CONFIRMED: yes. OEM brochure lists GVWR 32,000 lb.",
      q,
    ),
    true,
  );
  assert.equal(notesConfirmQueriedField("", q), false);
  assert.equal(
    notesConfirmQueriedField("WEB SEARCH NOT AVAILABLE this turn", q),
    false,
  );
  assert.equal(
    notesConfirmQueriedField("Could not find a published GVWR for this coach.", q),
    false,
  );
  assert.equal(
    notesConfirmQueriedField("32,000 lb typical class range (EST)", q),
    false,
  );
});

test("confirming first search does not retry", async () => {
  clearWebSearchCache();
  let calls = 0;
  const prior = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    calls += 1;
    const q = questionFromBody(init);
    assert.match(q, /GVWR on a 2019 XYZ Phantom/i);
    return jsonResponse({
      output_text:
        "CONFIRMED: yes. OEM brochure lists GVWR 32,000 lb for the 2019 XYZ Phantom.",
    });
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "test-key",
      query: "What's the GVWR on a 2019 XYZ Phantom?",
      timeoutMs: 5_000,
      models: ["grok-4.7"],
    });
    assert.equal(result.ok, true);
    assert.equal(calls, 1);
    if (result.ok) {
      assert.equal(result.confirmed, true);
      assert.equal(result.attempts, 1);
      assert.equal(result.exhausted, false);
      assert.match(result.notes, /32,000/);
    }
    const injection = formatWebSearchInjection(result);
    assert.match(injection, /CONFIRM the queried field/i);
    assert.doesNotMatch(injection, /You MAY give a labeled EST/);
    assert.equal(
      mayEmitLabeledEstimate({ confirmed: true, exhausted: false }),
      false,
    );
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("empty first search then confirming rephrased retry", async () => {
  clearWebSearchCache();
  const questions: string[] = [];
  const prior = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    questions.push(questionFromBody(init));
    if (questions.length === 1) {
      return jsonResponse({ output_text: "" });
    }
    return jsonResponse({
      output_text:
        "CONFIRMED: yes. OEM brochure pin: GVWR 32,000 pounds for the 2019 XYZ Phantom.",
    });
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "test-key",
      query: "What's the GVWR on a 2019 XYZ Phantom?",
      timeoutMs: 5_000,
      models: ["grok-4.7"],
    });
    assert.equal(result.ok, true);
    assert.equal(questions.length, 2);
    assert.notEqual(
      questions[1]!.toLowerCase().replace(/\s+/g, " "),
      questions[0]!.toLowerCase().replace(/\s+/g, " "),
    );
    if (result.ok) {
      assert.equal(result.confirmed, true);
      assert.equal(result.attempts, 2);
      assert.equal(result.exhausted, false);
      assert.ok(result.queries && result.queries.length === 2);
    }
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("N failed attempts say so plainly — no EST from training", async () => {
  clearWebSearchCache();
  let calls = 0;
  const questions: string[] = [];
  const prior = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    calls += 1;
    questions.push(questionFromBody(init));
    return jsonResponse({
      output_text:
        "CONFIRMED: no. Could not find a published GVWR for this coach.",
    });
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "test-key",
      query: "What's the GVWR on a 2019 XYZ Phantom?",
      timeoutMs: 8_000,
      models: ["grok-4.7"],
    });
    assert.equal(result.ok, true);
    assert.equal(calls, WEB_SEARCH_MAX_TOOL_CALLS);
    assert.equal(new Set(questions.map((q) => q.toLowerCase())).size, calls);
    if (result.ok) {
      assert.equal(result.confirmed, false);
      assert.equal(result.exhausted, true);
      assert.equal(result.attempts, WEB_SEARCH_MAX_TOOL_CALLS);
    }
    const gate = evaluateResearchQuality({
      result,
      query: "What's the GVWR on a 2019 XYZ Phantom?",
    });
    assert.equal(gate.allowEstimate, false);
    assert.equal(
      mayEmitLabeledEstimate({ confirmed: false, exhausted: true }),
      true,
    );
    const injection = formatWebSearchInjection(result);
    assert.match(injection, /Research loop exhausted/);
    assert.match(injection, /do not invent brochure numbers from training/i);
    assert.doesNotMatch(injection, /You MAY give a labeled EST/);
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("quality gate blocks EST before the loop is exhausted", () => {
  const blocked = formatWebSearchInjection({
    ok: true,
    notes: "Could not find a published GVWR for this coach.",
    model: "grok-4.7",
    confirmed: false,
    attempts: 1,
    exhausted: false,
    query: "What's the GVWR on a 2019 XYZ Phantom?",
  });
  assert.match(blocked, /Do NOT give a labeled EST/);
  assert.doesNotMatch(blocked, /You MAY give a labeled EST/);
  assert.equal(
    mayEmitLabeledEstimate({ confirmed: false, exhausted: false }),
    false,
  );

  const emptyBlocked = formatWebSearchInjection({
    ok: false,
    reason: "web search returned empty notes",
    confirmed: false,
    attempts: 1,
    exhausted: false,
    query: "What's the hitch rating on a 2019 XYZ Phantom?",
  });
  assert.match(emptyBlocked, /WEB SEARCH NOT AVAILABLE/);
  assert.match(emptyBlocked, /Do NOT give a labeled EST/);
});

test("live OEM hit injection never labels EST / low confidence", () => {
  const injection = formatWebSearchInjection({
    ok: true,
    notes:
      "CONFIRMED: yes. Newmar Corp brochure for the 2022 Dutch Star 4369 lists GVWR 51,000 lb, Cummins, Allison, GCWR 67,000 lb.",
    model: "grok-4.7",
    confirmed: true,
    attempts: 1,
    exhausted: false,
    query: "what's the gvwr of A Newmar Dutch Star 4369",
  });
  assert.match(injection, /CONFIRM the queried field/i);
  assert.match(injection, /live OEM \/ brochure \/ dealer fact/i);
  assert.doesNotMatch(injection, /You MAY give a labeled EST/);
  assert.doesNotMatch(injection, /You MAY give a labeled EST \/ typical class range, low confidence/);
  assert.equal(
    notesConfirmQueriedField(
      "CONFIRMED: yes. Newmar Corp brochure GVWR 51,000 lb.",
      "what's the gvwr of A Newmar Dutch Star 4369",
    ),
    true,
  );
  const gate = evaluateResearchQuality({
    result: {
      ok: true,
      notes: "CONFIRMED: yes. Newmar Corp brochure GVWR 51,000 lb.",
      model: "grok-4.7",
      confirmed: true,
      exhausted: false,
    },
    query: "what's the gvwr of A Newmar Dutch Star 4369",
  });
  assert.equal(gate.confirmed, true);
  assert.equal(gate.allowEstimate, false);
});

test("per-attempt timeout reserves budget for one retry", () => {
  assert.equal(WEB_SEARCH_TIMEOUT_RETRIES, 1);
  assert.equal(WEB_SEARCH_MAX_TOOL_CALLS, 2);
  assert.equal(retryReserveMs("chat"), CHAT_WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS);
  assert.equal(retryReserveMs("voice"), WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS);
  assert.equal(CHAT_WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS, 8_000);
  assert.equal(WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS, 8_000);

  const chatFirst = perAttemptTimeoutMs(
    CHAT_WEB_SEARCH_TIMEOUT_MS,
    0,
    WEB_SEARCH_MAX_TOOL_CALLS,
    retryReserveMs("chat"),
  );
  assert.equal(chatFirst, 28_000, "chat attempt 1 gets ~28s, not a starved 16s");
  assert.ok(chatFirst < CHAT_WEB_SEARCH_TIMEOUT_MS);
  const chatRetry = perAttemptTimeoutMs(
    CHAT_WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS,
    1,
    WEB_SEARCH_MAX_TOOL_CALLS,
    retryReserveMs("chat"),
  );
  assert.equal(chatRetry, 8_000, "chat retry keeps a real OEM window");

  const voiceFirst = perAttemptTimeoutMs(
    VOICE_WEB_SEARCH_TIMEOUT_MS,
    0,
    WEB_SEARCH_MAX_TOOL_CALLS,
    retryReserveMs("voice"),
  );
  assert.equal(voiceFirst, 16_000, "voice attempt 1 gets the OEM 8–15s window");
  assert.ok(
    voiceFirst >= 16_000 && voiceFirst < 60_000,
    "voice covers OEM brochure latency — not the old 5.5s starve, not 60s dead air",
  );
  assert.equal(perAttemptTimeoutMs(4_000, 1, 2), 4_000);
  assert.equal(isTimeoutFailureReason("The operation was aborted due to timeout"), true);
  assert.equal(isTimeoutFailureReason("web search HTTP 400"), false);
});

test("first timeout retries once with a rephrased query then gives up without EST", async () => {
  clearWebSearchCache();
  const questions: string[] = [];
  const prior = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    questions.push(questionFromBody(init));
    throw Object.assign(new Error("The operation was aborted due to timeout"), {
      name: "TimeoutError",
    });
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "test-key",
      query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
      timeoutMs: 8_000,
      models: ["grok-4.7"],
    });
    assert.equal(result.ok, false);
    assert.equal(questions.length, 2);
    assert.notEqual(
      questions[1]!.toLowerCase().replace(/\s+/g, " "),
      questions[0]!.toLowerCase().replace(/\s+/g, " "),
    );
    if (!result.ok) {
      assert.equal(result.attempts, 2);
      assert.equal(result.exhausted, true);
      assert.match(result.reason, /timeout|aborted/i);
    }
    const locked = [
      "LOCKED WEIGHTS (OEM pin — speak these; never claim GAP for a VERIFIED field):",
      "- VERIFIED GVWR 39600 from OEM pin",
      "- VERIFIED UVW 33500 from OEM pin",
    ].join("\n");
    const injection = formatWebSearchInjection(result, {
      query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
      catalogBlock: locked,
    });
    assert.match(injection, /WEB SEARCH NOT AVAILABLE/);
    assert.match(injection, /Search returned nothing after a retry/);
    assert.match(injection, /VERIFIED pins still in context: GVWR 39600/);
    assert.match(injection, /Speak those OEM numbers now/);
    assert.match(injection, /won't invent that number/);
    assert.doesNotMatch(injection, /You MAY give a labeled EST/);
    const gate = evaluateResearchQuality({
      result,
      query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
    });
    assert.equal(gate.allowEstimate, false);
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("timeout then confirming retry uses the live hit — no EST", async () => {
  clearWebSearchCache();
  const questions: string[] = [];
  const prior = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    questions.push(questionFromBody(init));
    if (questions.length === 1) {
      throw Object.assign(new Error("The operation was aborted due to timeout"), {
        name: "TimeoutError",
      });
    }
    return jsonResponse({
      output_text:
        "CONFIRMED: yes. Tiffin OEM brochure for the 2022 Phaeton 40IH lists GVWR 39,600 lb.",
    });
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "test-key",
      query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
      timeoutMs: 8_000,
      models: ["grok-4.7"],
    });
    assert.equal(result.ok, true);
    assert.equal(questions.length, 2);
    if (result.ok) {
      assert.equal(result.confirmed, true);
      assert.equal(result.exhausted, false);
      assert.match(result.notes, /39,600/);
    }
    const injection = formatWebSearchInjection(result);
    assert.match(injection, /CONFIRM the queried field/i);
    assert.match(injection, /live OEM \/ brochure \/ dealer fact/i);
    assert.doesNotMatch(injection, /You MAY give a labeled EST/);
    assert.doesNotMatch(injection, /low confidence — never as an OEM pin/);
    assert.doesNotMatch(injection, /You MAY give a labeled EST \/ typical class range/);
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});
