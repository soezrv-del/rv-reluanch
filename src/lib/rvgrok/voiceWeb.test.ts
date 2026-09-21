import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  looksLikeCasualNonResearch,
  looksLikeCatalogAnswerableCoachCompare,
  looksLikeCoachCompareQuestion,
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
  shouldSpeakVoiceResearchHold,
  stripNotesForSpeech,
  voiceInjectionClaimsLookedUp,
  VOICE_RESEARCH_ANSWER_INSTRUCTIONS,
  VOICE_RESEARCH_HOLD_INSTRUCTIONS,
  VOICE_RESEARCH_HOLD_PHRASE,
  VOICE_WEB_SEARCH_CLIENT_BUDGET_MS,
} from "./voiceWeb.ts";
import {
  isForbiddenResearchHold,
  RV_GROK_SESSION_INTRO,
  VOICE_SESSION_INTRO_INSTRUCTIONS,
} from "./speechPolicy.ts";

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
    assert.equal(decision.speakHold, true);
  }
  assert.equal(shouldSpeakVoiceResearchHold(ADVENTURER_Q), true);
});

test("named coach about-ask researches when catalog is missing", () => {
  const q = "I'd like to know about the 2027 Grand Design Lineage M series.";
  assert.equal(
    decideVoiceWebResearch({ transcript: q, specs: null }).action,
    "research",
  );
  assert.equal(
    decideVoiceWebResearch({
      transcript: q,
      specs: { missingHard: false },
    }).action,
    "pass",
  );
});

test("catalog miss and fishing browse without about-phrasing", () => {
  assert.equal(
    decideVoiceWebResearch({
      transcript: "What's the tow rating on a 2019 XYZ Phantom?",
      specs: null,
    }).action,
    "research",
  );
  assert.equal(
    decideVoiceWebResearch({
      transcript: "Best fishing spots near Moab for an RV",
      specs: { missingHard: false },
    }).action,
    "research",
  );
});

test("spoken market-value questions research even when the catalog is locked", () => {
  assert.equal(
    decideVoiceWebResearch({
      transcript: "What's the market value of a 2019 Newmar Dutch Star?",
      specs: { missingHard: false },
    }).action,
    "research",
  );
  assert.match(VOICE_RESEARCH_ANSWER_INSTRUCTIONS, /Low \/ Average \/ High/);
  assert.match(VOICE_RESEARCH_ANSWER_INSTRUCTIONS, /competitor-latest/);
});

const COMPARE_Q = "Compare the Allegro Bus to the American Dream.";

test("catalog-answerable coach compare skips research hold — answer from catalog now", () => {
  assert.equal(looksLikeCoachCompareQuestion(COMPARE_Q), true);
  assert.equal(looksLikeCatalogAnswerableCoachCompare(COMPARE_Q), true);
  assert.equal(looksLikeLiveResearchQuestion(COMPARE_Q), false);
  assert.equal(needsWebFallback(null, COMPARE_Q), false);
  assert.equal(
    decideVoiceWebResearch({ transcript: COMPARE_Q, specs: null }).action,
    "pass",
  );
  assert.equal(
    decideVoiceWebResearch({
      transcript: "Allegro Bus vs American Dream",
      specs: { missingHard: true },
    }).action,
    "pass",
  );
  assert.equal(VOICE_RESEARCH_HOLD_PHRASE, "give me one second");
  assert.match(VOICE_RESEARCH_HOLD_INSTRUCTIONS, /give me one second/);
  assert.equal(isForbiddenResearchHold(VOICE_RESEARCH_HOLD_INSTRUCTIONS), false);
  assert.equal(isForbiddenResearchHold("Let me check that"), true);
  const voiceWeb = src("voiceWeb.ts");
  assert.match(voiceWeb, /needsWebFallback/);
  assert.match(voiceWeb, /shouldSpeakVoiceResearchHold/);
});

test("repair / forum / manual compares still research — hold may speak", () => {
  const repair =
    "Compare the Allegro Bus to the American Dream — the slide won't retract, what should I check?";
  assert.equal(looksLikeLiveResearchQuestion(repair), true);
  assert.equal(needsWebFallback(null, repair), true);
  assert.equal(
    decideVoiceWebResearch({ transcript: repair, specs: null }).action,
    "research",
  );

  const forum =
    "What do owners say when they compare the Allegro Bus to the American Dream?";
  assert.equal(needsWebFallback(null, forum), true);
  assert.equal(decideVoiceWebResearch({ transcript: forum }).action, "research");

  const manual =
    "Look up the service manual differences between the Allegro Bus and the American Dream";
  assert.equal(needsWebFallback(null, manual), true);
  assert.equal(
    decideVoiceWebResearch({ transcript: manual }).action,
    "research",
  );
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
  assert.equal(VOICE_RESEARCH_HOLD_PHRASE, "give me one second");
  assert.doesNotMatch(VOICE_RESEARCH_HOLD_INSTRUCTIONS, /let me check that/i);
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

test("voice research budget is 10s server / 11s client — conversational hold, not 60s dead air", () => {
  const webSearch = src("webSearch.ts");
  assert.equal(VOICE_WEB_SEARCH_TIMEOUT_MS, 10_000);
  assert.equal(VOICE_WEB_SEARCH_CLIENT_BUDGET_MS, 11_000);
  assert.equal(VOICE_WEB_SEARCH_CLIENT_BUDGET_MS, VOICE_WEB_SEARCH_TIMEOUT_MS + 1_000);
  assert.deepEqual([...VOICE_WEB_SEARCH_MODELS], ["grok-4-1-fast-reasoning"]);
  assert.match(webSearch, /NOT the old "raise timeout to fake a pass"/);
  assert.match(webSearch, /60s of dead air/);
  assert.match(webSearch, /give me one second/);
  assert.doesNotMatch(webSearch, /let me check that/i);
  assert.doesNotMatch(webSearch, /VOICE_WEB_SEARCH_TIMEOUT_MS = 7_000/);
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

test("origin / who-built asks answer now — no research hold", () => {
  const q = "Who built this app and what's the mission?";
  assert.equal(
    decideVoiceWebResearch({ transcript: q, specs: null }).action,
    "pass",
  );
  assert.equal(shouldSpeakVoiceResearchHold(q), false);
  assert.equal(VOICE_RESEARCH_HOLD_PHRASE, "give me one second");
});

test("generic asks and catalog compares do not speak a research hold", () => {
  const casualAsk = "What's a good Class A diesel for weekends?";
  assert.equal(shouldSpeakVoiceResearchHold(casualAsk), false);
  assert.equal(
    decideVoiceWebResearch({ transcript: casualAsk, specs: null }).action,
    "pass",
  );

  const inventory = "How many diesels do we have on the lot?";
  assert.equal(shouldSpeakVoiceResearchHold(inventory), false);
  const lot = decideVoiceWebResearch({ transcript: inventory, specs: null });
  assert.equal(lot.action, "research");
  if (lot.action === "research") assert.equal(lot.speakHold, false);

  for (const q of [
    "stock number 45282",
    "45282",
    "How many Entegra coaches do we have in Fresno?",
    "Can you look in my inventory for a 27A Vision?",
    "I need to know if we have any Integras with a E Vision 27As in our inventory.",
  ]) {
    assert.equal(shouldSpeakVoiceResearchHold(q), false, q);
    const decided = decideVoiceWebResearch({ transcript: q, specs: null });
    assert.equal(decided.action, "research", q);
    if (decided.action === "research") assert.equal(decided.speakHold, false, q);
  }

  const gapSpecs = { missingHard: true };
  for (const q of [
    "Can you look in my inventory for a 27A Vision?",
    "I need to know if we have any Integras with a E Vision 27As in our inventory.",
  ]) {
    assert.equal(shouldSpeakVoiceResearchHold(q, gapSpecs), false, q);
    const decided = decideVoiceWebResearch({
      transcript: q,
      specs: gapSpecs,
    });
    assert.equal(decided.action, "research", q);
    if (decided.action === "research") assert.equal(decided.speakHold, false, q);
  }

  assert.equal(shouldSpeakVoiceResearchHold(COMPARE_Q), false);
});

test("hold string is exactly give me one second — never Let me check that", () => {
  assert.equal(VOICE_RESEARCH_HOLD_PHRASE, "give me one second");
  assert.match(VOICE_RESEARCH_HOLD_INSTRUCTIONS, /give me one second/);
  assert.doesNotMatch(VOICE_RESEARCH_HOLD_INSTRUCTIONS, /let me check that/i);
  assert.doesNotMatch(VOICE_RESEARCH_HOLD_INSTRUCTIONS, /i'?ll look that up/i);
  assert.doesNotMatch(VOICE_RESEARCH_HOLD_INSTRUCTIONS, /stand by/i);
  assert.doesNotMatch(VOICE_RESEARCH_HOLD_INSTRUCTIONS, /let me search/i);
  assert.equal(isForbiddenResearchHold(VOICE_RESEARCH_HOLD_INSTRUCTIONS), false);
  assert.equal(isForbiddenResearchHold("Let me check that"), true);
  assert.equal(isForbiddenResearchHold("I'll look that up"), true);

  const realtime = src("realtime.ts");
  assert.match(realtime, /buildSessionIntroResponse/);
  assert.match(realtime, /maybeSpeakSessionIntro/);
  assert.match(realtime, /decision\.speakHold/);
  assert.doesNotMatch(realtime, /Let me check that/);

  const live = src("liveVoice.ts");
  assert.match(live, /buildSessionIntroResponse/);
  assert.match(live, /RV_GROK_SESSION_INTRO/);
  assert.match(VOICE_SESSION_INTRO_INSTRUCTIONS, new RegExp(
    RV_GROK_SESSION_INTRO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ));
  assert.match(
    VOICE_SESSION_INTRO_INSTRUCTIONS,
    /I'm RV Grok, here to help you with all your RV needs/,
  );
});

test("voice research reuses webIntent — no second detector", () => {
  const voiceWeb = src("voiceWeb.ts");
  assert.match(voiceWeb, /needsWebFallback/);
  assert.doesNotMatch(voiceWeb, /LIVE_RESEARCH_RE/);
  const api = readFileSync(
    join(root, "../../routes/api/rvgrok.web-research.ts"),
    "utf8",
  );
  assert.match(api, /executeWebResearch/);
  assert.match(api, /webResearchJsonResponse/);
  assert.doesNotMatch(api, /search_parameters/);
  const realtime = src("realtime.ts");
  assert.match(realtime, /buildChatGrounding/);
  assert.match(realtime, /decideVoiceWebResearch/);
  assert.doesNotMatch(realtime, /LIVE_RESEARCH_RE/);
});
