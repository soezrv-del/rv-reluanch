import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyWebResearchFailure,
  executeWebResearch,
  researchResponseHeaders,
} from "./webResearchTelemetry.ts";
import { clearWebSearchCache, seedWebSearchCache, researchCacheKey } from "./webSearch.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("classifyWebResearchFailure distinguishes outage kinds", () => {
  assert.equal(
    classifyWebResearchFailure("The operation was aborted due to timeout"),
    "timeout",
  );
  assert.equal(
    classifyWebResearchFailure("no XAI_API_KEY on the server"),
    "missing_key",
  );
  assert.equal(
    classifyWebResearchFailure("web search HTTP 400: invalid request"),
    "upstream_error",
  );
  assert.equal(
    classifyWebResearchFailure("web search returned empty notes"),
    "empty_response",
  );
});

test("gated query returns kind=gated and is not classified as timeout", async () => {
  const logs: string[] = [];
  const origInfo = console.info;
  const origWarn = console.warn;
  console.info = (msg: string) => logs.push(String(msg));
  console.warn = (msg: string) => logs.push(String(msg));
  try {
    const body = await executeWebResearch({
      query: "hi how are you",
      apiKey: undefined,
      timeoutMs: 100,
      profile: "voice",
    });
    assert.equal(body.ok, false);
    assert.equal(body.kind, "gated");
    assert.equal(body.reason, "not a research question");
    assert.ok(body.durationMs >= 0);
    assert.equal(logs.some((l) => l.includes('"severity"')), false);
    const parsed = JSON.parse(logs[0]!);
    assert.equal(parsed.kind, "gated");
    assert.equal(parsed.ok, false);
    assert.ok(!logs.some((l) => /"kind":"timeout"/.test(l)));
  } finally {
    console.info = origInfo;
    console.warn = origWarn;
  }
});

test("missing key logs as missing_key not gated", async () => {
  const warns: string[] = [];
  const origWarn = console.warn;
  console.warn = (msg: string) => warns.push(String(msg));
  try {
    const body = await executeWebResearch({
      query: "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
      apiKey: undefined,
      timeoutMs: 100,
      profile: "voice",
    });
    assert.equal(body.ok, false);
    assert.equal(body.kind, "missing_key");
    assert.match(body.reason!, /no XAI_API_KEY/);
    const parsed = JSON.parse(warns[0]!);
    assert.equal(parsed.kind, "missing_key");
    assert.equal(parsed.profile, "voice");
    assert.ok(typeof parsed.durationMs === "number");
  } finally {
    console.warn = origWarn;
  }
});

test("cache hit returns kind=cache_hit with cached flag", async () => {
  clearWebSearchCache();
  const query = "Where is the battery disconnect on a 2005 Winnebago Adventurer?";
  seedWebSearchCache(researchCacheKey(query), {
    ok: true,
    notes: "Near the entry step on many Adventurer coaches.",
    model: "grok-4-1-fast-reasoning",
  });
  const body = await executeWebResearch({
    query,
    apiKey: "unused",
    timeoutMs: 100,
    profile: "voice",
  });
  assert.equal(body.ok, true);
  assert.equal(body.kind, "cache_hit");
  assert.equal(body.cached, true);
  assert.ok(body.durationMs < 50);
  clearWebSearchCache();
});

test("response headers expose kind and timing for monitors", () => {
  const headers = researchResponseHeaders({
    ok: false,
    reason: "The operation was aborted due to timeout",
    kind: "timeout",
    durationMs: 7234,
  });
  const h = headers as Record<string, string>;
  assert.equal(h["X-RvGrok-Research-Kind"], "timeout");
  assert.equal(h["X-RvGrok-Research-Ms"], "7234");
  assert.equal(h["X-RvGrok-Research-Ok"], "false");
});

test("voice route uses telemetry wrapper and monitor headers", () => {
  const api = readFileSync(
    join(root, "../../routes/api/rvgrok.web-research.ts"),
    "utf8",
  );
  assert.match(api, /executeWebResearch/);
  assert.match(api, /webResearchJsonResponse/);
  assert.doesNotMatch(api, /fetchWebSearchNotes/);
  const chat = readFileSync(join(root, "../../routes/api/rvgrok.ts"), "utf8");
  assert.match(chat, /executeWebResearch/);
});
