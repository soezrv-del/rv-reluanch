import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildGeminiResearchRequest,
  extractGeminiText,
  GEMINI_CHAT_RESEARCH_TIMEOUT_MS,
  GEMINI_RESEARCH_MODEL,
  GEMINI_VOICE_RESEARCH_TIMEOUT_MS,
  isGeminiResearchUrl,
  readGeminiApiKey,
  readResearchProviderPref,
  resolveResearchProvider,
  researchNotesSourceLabel,
} from "./geminiResearch.ts";
import {
  clearWebSearchCache,
  evaluateResearchQuality,
  fetchWebSearchNotes,
  formatWebSearchInjection,
} from "./webSearch.ts";
import { executeWebResearch } from "./webResearchTelemetry.ts";
import { formatCatalogPinWinsSearchMiss } from "./estimatePolicy.ts";

const root = dirname(fileURLToPath(import.meta.url));

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function fetchUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return String(input);
  return String((input as Request).url || "");
}

function geminiNotes(text: string) {
  return {
    candidates: [{ content: { parts: [{ text }] } }],
  };
}

function xaiNotes(text: string) {
  return { output_text: text };
}

test("resolveResearchProvider: auto/gemini/xai and missing key", () => {
  assert.equal(readResearchProviderPref(undefined), "auto");
  assert.equal(readResearchProviderPref("AUTO"), "auto");
  assert.equal(readResearchProviderPref("gemini"), "gemini");
  assert.equal(readResearchProviderPref("xai"), "xai");
  assert.equal(readGeminiApiKey(""), "");

  assert.equal(
    resolveResearchProvider({ provider: "auto", geminiApiKey: "AIza-test" }),
    "gemini",
  );
  assert.equal(
    resolveResearchProvider({ provider: "auto", geminiApiKey: "" }),
    "xai",
  );
  assert.equal(
    resolveResearchProvider({ provider: "gemini", geminiApiKey: "AIza-test" }),
    "gemini",
  );
  assert.equal(
    resolveResearchProvider({ provider: "gemini", geminiApiKey: "" }),
    "xai",
    "missing Gemini key must not crash — behave as xAI only",
  );
  assert.equal(
    resolveResearchProvider({ provider: "xai", geminiApiKey: "AIza-test" }),
    "xai",
  );
  assert.equal(GEMINI_CHAT_RESEARCH_TIMEOUT_MS, 10_000);
  assert.equal(GEMINI_VOICE_RESEARCH_TIMEOUT_MS, 4_500);
  assert.equal(GEMINI_RESEARCH_MODEL, "gemini-2.5-flash");
});

test("Gemini request prefers OEM / factory brochure / dealer, not PDF-only", () => {
  const body = buildGeminiResearchRequest({
    query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
    profile: "chat",
    catalogBlock: "VERIFIED CATALOG / BROCHURE: GVWR 39600",
  });
  const packed = JSON.stringify(body);
  assert.match(packed, /google_search/);
  assert.match(packed, /OEM \/ factory brochure \/ dealer/);
  assert.match(packed, /Open-web hits are allowed/);
  assert.match(packed, /not factory-PDF-only/);
  assert.match(packed, /CONFIRMED: yes/);
  assert.match(packed, /Phaeton 40IH|GVWR 39600/);
  assert.equal(researchNotesSourceLabel("gemini-2.5-flash"), "Gemini Google Search grounding");
  assert.equal(researchNotesSourceLabel("grok-4-1-fast-reasoning"), "xAI web_search");
  assert.equal(
    extractGeminiText(geminiNotes("CONFIRMED: yes. GVWR 39,600 lb.")),
    "CONFIRMED: yes. GVWR 39,600 lb.",
  );
});

test("Gemini success → notes used (xAI not called)", async () => {
  clearWebSearchCache();
  const urls: string[] = [];
  const prior = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = fetchUrl(input);
    urls.push(url);
    assert.equal(isGeminiResearchUrl(url), true);
    return jsonResponse(
      geminiNotes(
        "CONFIRMED: yes. The battery disconnect is typically near the steps on a 2005 Adventurer — check the OEM owners manual.",
      ),
    );
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "xai-should-not-run",
      geminiApiKey: "AIza-test",
      researchProvider: "auto",
      query: "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
      timeoutMs: 5_000,
      models: ["grok-4-1-fast-reasoning"],
    });
    assert.equal(result.ok, true);
    assert.equal(urls.length, 1);
    assert.equal(urls.every(isGeminiResearchUrl), true);
    if (result.ok) {
      assert.match(result.model, /gemini/);
      assert.equal(result.confirmed, true);
      assert.match(result.notes, /battery disconnect/i);
    }
    const injection = formatWebSearchInjection(result);
    assert.match(injection, /Gemini Google Search grounding/);
    assert.match(injection, /CONFIRM the queried field/i);
    assert.doesNotMatch(injection, /You MAY give a labeled EST/);
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("Gemini fail/timeout → xAI fallback notes used", async () => {
  clearWebSearchCache();
  const urls: string[] = [];
  const prior = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = fetchUrl(input);
    urls.push(url);
    if (isGeminiResearchUrl(url)) {
      throw Object.assign(new Error("The operation was aborted due to timeout"), {
        name: "TimeoutError",
      });
    }
    return jsonResponse(
      xaiNotes(
        "CONFIRMED: yes. Tiffin OEM brochure lists GVWR 39,600 lb for the 2022 Phaeton 40IH.",
      ),
    );
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "xai-test-key",
      geminiApiKey: "AIza-test",
      researchProvider: "gemini",
      query: "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
      timeoutMs: 8_000,
      models: ["grok-4-1-fast-reasoning"],
    });
    assert.equal(result.ok, true);
    assert.ok(urls.some(isGeminiResearchUrl));
    assert.ok(urls.some((u) => /api\.x\.ai/.test(u)));
    if (result.ok) {
      assert.match(result.model, /grok/);
      assert.equal(result.confirmed, true);
      assert.match(result.notes, /39,600/);
    }
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("no Gemini key → xAI only (today's path)", async () => {
  clearWebSearchCache();
  const urls: string[] = [];
  const prior = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = fetchUrl(input);
    urls.push(url);
    return jsonResponse(
      xaiNotes(
        "CONFIRMED: yes. OEM brochure lists GVWR 32,000 lb for the 2019 XYZ Phantom.",
      ),
    );
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "xai-test-key",
      geminiApiKey: "",
      researchProvider: "auto",
      query: "What's the GVWR on a 2019 XYZ Phantom?",
      timeoutMs: 5_000,
      models: ["grok-4-1-fast-reasoning"],
    });
    assert.equal(result.ok, true);
    assert.equal(urls.length, 1);
    assert.equal(urls.some(isGeminiResearchUrl), false);
    assert.match(urls[0] || "", /api\.x\.ai/);
    if (result.ok) {
      assert.match(result.model, /grok/);
    }
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("catalog pin-wins still spoken when Gemini + xAI both miss", async () => {
  clearWebSearchCache();
  const prior = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    if (isGeminiResearchUrl(fetchUrl(input))) {
      throw Object.assign(new Error("The operation was aborted due to timeout"), {
        name: "TimeoutError",
      });
    }
    throw Object.assign(new Error("The operation was aborted due to timeout"), {
      name: "TimeoutError",
    });
  }) as typeof fetch;
  try {
    const result = await fetchWebSearchNotes({
      apiKey: "xai-test-key",
      geminiApiKey: "AIza-test",
      researchProvider: "auto",
      query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
      timeoutMs: 8_000,
      models: ["grok-4-1-fast-reasoning"],
    });
    assert.equal(result.ok, false);
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
    assert.match(injection, /VERIFIED pins still in context: GVWR 39600/);
    assert.match(injection, /Speak those OEM numbers now/);
    assert.doesNotMatch(injection, /You MAY give a labeled EST/);
    assert.match(formatCatalogPinWinsSearchMiss(locked), /GVWR 39600/);
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

test("greetings do not spend Gemini credits", async () => {
  let calls = 0;
  const prior = globalThis.fetch;
  globalThis.fetch = (async () => {
    calls += 1;
    return jsonResponse(geminiNotes("should not run"));
  }) as typeof fetch;
  try {
    const body = await executeWebResearch({
      query: "hi how are you",
      apiKey: "xai-unused",
      geminiApiKey: "AIza-test",
      researchProvider: "auto",
      timeoutMs: 100,
      profile: "chat",
    });
    assert.equal(body.ok, false);
    assert.equal(body.kind, "gated");
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = prior;
  }
});

test("chat and voice routes still call executeWebResearch (not Gemini chat)", () => {
  const chat = readFileSync(join(root, "../../routes/api/rvgrok.ts"), "utf8");
  const voice = readFileSync(
    join(root, "../../routes/api/rvgrok.web-research.ts"),
    "utf8",
  );
  const live = readFileSync(join(root, "liveVoice.ts"), "utf8");
  assert.match(chat, /executeWebResearch/);
  assert.match(voice, /executeWebResearch/);
  assert.doesNotMatch(chat, /gemini-2\.5-flash/);
  assert.doesNotMatch(voice, /gemini-2\.5-flash/);
  assert.doesNotMatch(
    live,
    /gemini-2\.5-flash/,
    "Live Voice Realtime stays on xAI — do not swap the socket",
  );
  assert.match(live, /web_search/);
});
