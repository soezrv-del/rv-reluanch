import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  looksLikeCasualNonResearch,
  looksLikeLiveResearchQuestion,
  needsWebFallback,
} from "./webIntent.ts";
import {
  VOICE_WEB_SEARCH_MODELS,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
} from "./webSearch.ts";
import {
  decideVoiceWebResearch,
  fetchVoiceWebResearchNotes,
  formatVoiceWebSearchInjection,
  stripNotesForSpeech,
  voiceInjectionClaimsLookedUp,
  VOICE_RESEARCH_ANSWER_INSTRUCTIONS,
  VOICE_RESEARCH_HOLD_INSTRUCTIONS,
  VOICE_WEB_SEARCH_CLIENT_BUDGET_MS,
} from "./voiceWeb.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

const ADVENTURER_Q =
  "I have a 2005 Winnebago Adventurer. I'm looking for the battery disconnect. Can you look into it and see if you can tell me where it is?";

test("locked spec question matches chat: skip web when hard fields are present", () => {
  const q = "What engine and HP does a 2023 Entegra Vision have?";
  assert.equal(
    decideVoiceWebResearch({ transcript: q, specs: { missingHard: false } })
      .action,
    "pass",
  );
  assert.equal(
    decideVoiceWebResearch({ transcript: q, specs: null }).action,
    "research",
  );
});

test("spoken troubleshooting uses the same detector as chat and wants research", () => {
  assert.equal(looksLikeLiveResearchQuestion(ADVENTURER_Q), true);
  assert.equal(needsWebFallback(null, ADVENTURER_Q), true);
  const decision = decideVoiceWebResearch({ transcript: ADVENTURER_Q });
  assert.equal(decision.action, "research");
  if (decision.action === "research") {
    assert.match(decision.query, /battery disconnect/i);
  }
});

test("spoken greeting and lifestyle questions do not fire voice web research", () => {
  const casual = [
    "hi",
    "thanks",
    "Is full-timing worth it?",
    "Sell me the RV lifestyle vs hotels",
    "What's the monthly payment on $80000 at 7% for 15 years?",
  ];
  for (const q of casual) {
    assert.equal(looksLikeCasualNonResearch(q), true, q);
    assert.equal(needsWebFallback(null, q), false, q);
    assert.equal(
      decideVoiceWebResearch({ transcript: q }).action,
      "pass",
      q,
    );
  }
  assert.equal(
    decideVoiceWebResearch({ transcript: "Good morning" }).action,
    "pass",
  );
});

test("voice timeout and failure injection never claims a lookup", () => {
  const timedOut = formatVoiceWebSearchInjection({
    ok: false,
    reason: "web search timed out",
  });
  assert.equal(voiceInjectionClaimsLookedUp(timedOut), false);
  assert.match(timedOut, /WEB SEARCH NOT AVAILABLE/);
  assert.match(timedOut, /do not claim you looked this up/i);
  assert.match(timedOut, /do not assert a specific part location/i);
  assert.doesNotMatch(timedOut, /I looked it up/i);
  assert.doesNotMatch(timedOut, /inside the entry door/i);

  const failed = formatVoiceWebSearchInjection({
    ok: false,
    reason: "no XAI_API_KEY on the server",
  });
  assert.equal(voiceInjectionClaimsLookedUp(failed), false);
  assert.match(failed, /do not invent/i);
});

test("successful voice notes stay spoken-shaped and forbid no-internet claims", () => {
  const ok = formatVoiceWebSearchInjection({
    ok: true,
    notes:
      "Owners often mention a labeled switch. See https://example.com/manual and [forum](https://irv2.example/thread).",
    model: "grok-4.6",
  });
  assert.equal(voiceInjectionClaimsLookedUp(ok), true);
  assert.match(ok, /WEB RESEARCH NOTES/);
  assert.match(ok, /do not claim you have no internet/i);
  assert.doesNotMatch(ok, /https?:\/\//);
  assert.doesNotMatch(ok, /\[forum\]/);
  assert.match(VOICE_RESEARCH_ANSWER_INSTRUCTIONS, /WEB SEARCH NOT AVAILABLE/);
  assert.match(VOICE_RESEARCH_HOLD_INSTRUCTIONS, /Let me check that/);
});

test("stripNotesForSpeech drops URLs and markdown without adding facts", () => {
  const spoken = stripNotesForSpeech(
    "## Check the label\nSee https://oem.example/doc **first**.",
  );
  assert.match(spoken, /Check the label/);
  assert.doesNotMatch(spoken, /https?:\/\//);
  assert.doesNotMatch(spoken, /\*\*/);
  assert.doesNotMatch(spoken, /#/);
});

test("voice web search is bounded to 7s and a single fast model", () => {
  assert.equal(VOICE_WEB_SEARCH_TIMEOUT_MS, 7_000);
  assert.equal(VOICE_WEB_SEARCH_CLIENT_BUDGET_MS, 8_000);
  assert.deepEqual([...VOICE_WEB_SEARCH_MODELS], ["grok-4-1-fast-reasoning"]);
});

test("client fetch timeout/abort falls back without claiming a lookup", async () => {
  const result = await fetchVoiceWebResearchNotes({
    query: ADVENTURER_Q,
    signal: AbortSignal.abort(),
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.reason, /timed out|abort/i);
  }
  const injection = formatVoiceWebSearchInjection(result);
  assert.equal(voiceInjectionClaimsLookedUp(injection), false);
});

test("voice research reuses webIntent — no second detector", () => {
  const voiceWeb = src("voiceWeb.ts");
  assert.match(voiceWeb, /needsWebFallback/);
  assert.doesNotMatch(voiceWeb, /LIVE_RESEARCH_RE/);
  const api = readFileSync(
    join(root, "../../routes/api/rvgrok.web-research.ts"),
    "utf8",
  );
  assert.match(api, /needsWebFallback/);
  assert.match(api, /fetchWebSearchNotes/);
  assert.match(api, /VOICE_WEB_SEARCH_TIMEOUT_MS/);
  assert.doesNotMatch(api, /search_parameters/);
  const realtime = src("realtime.ts");
  assert.match(realtime, /buildChatGrounding/);
  assert.match(realtime, /decideVoiceWebResearch/);
  assert.doesNotMatch(realtime, /LIVE_RESEARCH_RE/);
});
