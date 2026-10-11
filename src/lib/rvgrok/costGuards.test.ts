import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CHAT_DAILY_TOKEN_BUDGET,
  DEFAULT_VOICE_DAILY_SESSION_CAP,
  VOICE_IDLE_LIMIT_MS,
  VOICE_MAX_SESSION_MS,
  createDailyCounter,
  envCap,
  pacificDay,
  voiceLimitMessage,
  voiceSessionLimitReason,
} from "./usageCaps.ts";
import {
  CHAT_WEB_SEARCHES_PER_REPLY,
  chatTurnStore,
  createChatTokenLedger,
  estimateTokens,
  newChatTurnState,
  takeChatWebSearch,
  addChatTokens,
} from "./chatBudget.ts";

const here = dirname(fileURLToPath(import.meta.url));
const read = (p: string) => readFileSync(join(here, p), "utf8");

test("defaults and env overrides", () => {
  assert.equal(DEFAULT_VOICE_DAILY_SESSION_CAP, 20);
  assert.equal(DEFAULT_CHAT_DAILY_TOKEN_BUDGET, 1_000_000);
  assert.equal(envCap("50", 20), 50);
  assert.equal(envCap("2_000_000", 1), 2_000_000);
  assert.equal(envCap("", 20), 20);
  assert.equal(envCap("-3", 20), 20);
  assert.equal(envCap("abc", 20), 20);
});

test("daily counter rolls over at midnight Pacific, not UTC", () => {
  // 4:59 PM PDT Oct 10 = 23:59 UTC; 5:01 PM = 00:01 UTC Oct 11 — same PT day.
  let t = Date.UTC(2026, 9, 10, 23, 59);
  const c = createDailyCounter({ now: () => t });
  c.add("5551234567", 19);
  t = Date.UTC(2026, 9, 11, 0, 1);
  assert.equal(pacificDay(t), "2026-10-10");
  assert.equal(c.get("5551234567"), 19);
  t = Date.UTC(2026, 9, 11, 7, 1); // 12:01 AM PDT Oct 11
  assert.equal(c.get("5551234567"), 0);
});

test("voice session ends after 2 min silence or 15 min total", () => {
  const s = 1_000_000;
  assert.equal(voiceSessionLimitReason({ startedAt: s, lastActivityAt: s, now: s + 60_000 }), null);
  assert.equal(voiceSessionLimitReason({ startedAt: s, lastActivityAt: s, now: s + VOICE_IDLE_LIMIT_MS }), "idle");
  assert.equal(
    voiceSessionLimitReason({ startedAt: s, lastActivityAt: s + VOICE_MAX_SESSION_MS - 1000, now: s + VOICE_MAX_SESSION_MS }),
    "max",
  );
  assert.match(voiceLimitMessage("idle"), /2 minutes of silence/);
  assert.match(voiceLimitMessage("max"), /15 minutes/);
});

test("realtime: limit timer uses stop() (no auto-reconnect) and clears on stop/close", () => {
  const rt = read("realtime.ts");
  assert.match(rt, /voiceSessionLimitReason\(/);
  assert.match(rt, /this\.stop\(\);\s*const message = voiceLimitMessage\(reason\);\s*this\.handlers\.onStatus\("idle", message\);/);
  assert.match(rt, /stop\(opts\?: \{ keepCapture\?: boolean \}\) \{\s*this\.clearLimitTimer\(\);/);
  assert.match(rt, /this\.ws = null;\s*this\.clearLimitTimer\(\);/);
});

test("token route caps sessions per phone; client never falls back to worker on 429", () => {
  const route = read("../../routes/api/rvgrok.token.ts");
  assert.match(route, /voiceCapResponse\(phone\)/);
  assert.match(route, /status: 429/);
  assert.match(route, /if \(minted\.ok && phone\) voiceSessions\.add\(phone, 1\)/);
  assert.match(route, /isHardAdminPhone\(phone\)/);
  const voice = read("voice.ts");
  assert.match(voice, /res\.status === 429 && attempt\.url\.startsWith\("\/api\/"\)/);
  assert.match(voice, /if \(e instanceof VoiceDailyCapError\) throw e;/);
});

test("one web search per reply: second take is refused inside a turn", async () => {
  assert.equal(CHAT_WEB_SEARCHES_PER_REPLY, 1);
  const state = newChatTurnState();
  const results = await chatTurnStore.run(state, async () => {
    const a = takeChatWebSearch();
    await Promise.resolve();
    const b = takeChatWebSearch();
    return [a, b];
  });
  assert.deepEqual(results, [true, false]);
  // Separate replies get their own allowance.
  assert.equal(await chatTurnStore.run(newChatTurnState(), async () => takeChatWebSearch()), true);
});

test("chat route: web_search tool and both prefetch paths share the per-reply allowance", () => {
  const route = read("../../routes/api/rvgrok.ts");
  assert.equal((route.match(/takeChatWebSearch\(\)/g) || []).length, 3);
  assert.doesNotMatch(route, /maxAttempts: WEB_SEARCH_MAX_TOOL_CALLS/);
  assert.match(route, /chatTurnStore\s*\.run\(turnState, run\)/);
  assert.match(route, /chatTokenLedger\.exceeded\(phoneKey\)/);
  assert.match(route, /chatTokenLedger\.charge\(phoneKey, turnState\.tokens\)/);
  assert.match(route, /addChatTokens\(/);
});

test("token estimate ignores base64 images; ledger enforces daily budget", async () => {
  const img = "data:image/jpeg;base64," + "A".repeat(400_000);
  assert.ok(estimateTokens(`hello ${img}`) < 10);
  assert.equal(estimateTokens("x".repeat(400)), 100);
  const s = newChatTurnState();
  await chatTurnStore.run(s, async () => addChatTokens(1234));
  assert.equal(s.tokens, 1234);
  const t = Date.UTC(2026, 9, 10, 20);
  const ledger = createChatTokenLedger({ now: () => t });
  assert.equal(ledger.exceeded("555", 1000), false);
  ledger.charge("555", 999);
  assert.equal(ledger.exceeded("555", 1000), false);
  ledger.charge("555", 1);
  assert.equal(ledger.exceeded("555", 1000), true);
  assert.equal(ledger.exceeded(null, 1), false);
});

test("compare, spec-fallback, catalog-research are whitelisted; compare/catalog bounded", () => {
  for (const f of ["rvfax.compare.ts", "rvfax.spec-fallback.ts", "rvfax.catalog-research.ts"]) {
    const src = read(`../../routes/api/${f}`);
    assert.match(src, /const denied = await denyUnlessWhitelisted\(request\);\s*if \(denied\) return denied;/, f);
  }
  const cmp = read("../../routes/api/rvfax.compare.ts");
  assert.match(cmp, /COMPARE_CALL_TIMEOUT_MS = 30_000/);
  assert.match(cmp, /signal: AbortSignal\.timeout\(budget\)/);
  assert.match(cmp, /if \(budget <= 0\) return null;/);
  assert.match(cmp, /compareCache\.get\(key\)/);
  assert.match(cmp, /compareInflight\.run\(key/);
  const cr = read("../../routes/api/rvfax.catalog-research.ts");
  assert.equal((cr.match(/signal: AbortSignal\.timeout\(budget\)/g) || []).length, 2);
  // Clients send the access phone so the new gates don't 403 real users.
  assert.match(read("../../components/rvfax/RvCompare.tsx"), /headers: researchAccessHeaders\(/);
  assert.match(read("../rv/specEngine.ts"), /headers: researchAccessHeaders\(/);
});

test("Facts spec fallback effect keys on empty-field values, not the brochure object", () => {
  const d = read("../../components/rvfax/RvDetail.tsx");
  assert.match(d, /\[year, make, model, floorplan, data\.type, specFallbackKey\]\);/);
  assert.doesNotMatch(d, /floorplan, brochure, data\.type, specIdentity\]\);/);
});

test("specEngine loads researchUnlock dynamically (static import made a circular SSR chunk: __exportAll is not a function)", () => {
  const src = read("../rv/specEngine.ts");
  assert.doesNotMatch(src, /^import[^;]*researchUnlock/m);
  assert.match(src, /await import\("\.\.\/access\/researchUnlock\.ts"\)/);
});

test("voice auto-stop disarms the app so the next mic tap starts a new session", () => {
  const rt = read("realtime.ts");
  assert.match(rt, /onAutoStop\?: \(reason: "idle" \| "max", message: string\) => void;/);
  assert.match(rt, /this\.handlers\.onAutoStop\?\.\(reason, message\)/);
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  assert.match(app, /onAutoStop: \(_reason, message\) => \{\s*stopLiveSessionRef\.current\(\{ disarm: true \}\);/);
  // A stopped (closed) session must not swallow the next arm.
  assert.match(app, /if \(on && realtimeRef\.current\?\.isActive\) return;/);
  assert.doesNotMatch(app, /if \(on && realtimeRef\.current\) return;/);
});
