import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

function assertAnswerPolicy(file: string, label: string) {
  assert.match(
    file,
    /ANSWER_NOW_POLICY/,
    `${label} interpolates the shared answer-now policy`,
  );
  assert.match(
    file,
    /SESSION_INTRO_POLICY/,
    `${label} interpolates the one-time session intro`,
  );
  assert.match(
    file,
    /VOICE_RESEARCH_HOLD_PHRASE/,
    `${label} uses the shared hold phrase`,
  );
  assert.doesNotMatch(
    file,
    /Only say "Let me check that"/,
    `${label} must not instruct the old stall`,
  );
}

test("chat, agent, and voice prompts share David's answer-now / give me one second policy", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  const voiceWeb = src("voiceWeb.ts");
  const speech = src("speechPolicy.ts");

  assertAnswerPolicy(prompts, "prompts.ts");
  assertAnswerPolicy(voice, "voice.ts");
  assert.match(
    speech,
    /Answer immediately from catalog, injected notes, or already-known facts/,
  );
  assert.match(speech, /VOICE_RESEARCH_HOLD_PHRASE = "give me one second"/);
  assert.match(speech, /Web search is last resort/);
  assert.match(
    speech,
    /I'm RV Grok — ask me anything\. Name a year, make, and model for the spec report/,
  );
  assert.match(speech, /Verified & True \/ Know before you buy/);
  assert.match(src("originStory.ts"), /David Hansen/);
  assert.match(src("originStory.ts"), /buyer-first/);
  assert.match(prompts, /ABOUT_RVFOX/);
  assert.match(voice, /ABOUT_RVFOX/);
  assert.match(prompts, /RV_GROK_ATTITUDE/);
  assert.match(voice, /RV_GROK_ATTITUDE/);
  assert.match(speech, /Never stay silent/);
  assert.match(speech, /Never say \$\{FORBIDDEN_STALLS\}/);
  assert.doesNotMatch(speech, /Only say "Let me check that"/);

  assert.match(
    prompts,
    /first user-visible line/,
    "chat/agent: hold line is first, then search, then answer in the same response",
  );
  assert.match(
    prompts,
    /same final response/,
    "agent: search then complete answer in the same final response",
  );
  assert.match(speech, /VOICE_RESEARCH_HOLD_PHRASE = "give me one second"/);
  assert.doesNotMatch(
    voiceWeb,
    /Let me check that/,
    "voice hold must not teach the old stall",
  );
  assert.match(
    voiceWeb,
    /give me one second/,
    "voice hold beat speaks the new line when a search is actually running",
  );

  assert.match(prompts, /WEB RESEARCH notes/);
  assert.match(prompts, /OWN-LOT INVENTORY/);
  assert.match(prompts, /UNAVAILABLE/);
  assert.match(prompts, /Never report 0 diesels or 0 units/);
  assert.match(prompts, /Class A Diesel/);
  assert.match(prompts, /Class Super C/);
  assert.match(voice, /never speak 0 as a stock count/);
  assert.match(prompts, /UNKNOWN \/ CATALOG GAP/);
  assert.match(prompts, /I don't know/);
  assert.match(prompts, /Do not invent/);
  assert.match(prompts, /REPAIR \/ DIAGNOSE/);
  assert.match(voice, /WEB RESEARCH notes/);
  assert.match(voice, /REPAIR PLAYBOOK/);

  // #294 deflection ban stays unconditional — #278 must not re-qualify it.
  assert.match(prompts, /UNCONDITIONAL/);
  assert.match(prompts, /check the website/);
  assert.match(prompts, /look it up yourself/);
  assert.match(prompts, /ask the dealer/);
  assert.match(voice, /UNCONDITIONAL/);
  assert.doesNotMatch(
    prompts,
    /as the primary answer when WEB RESEARCH notes are present/,
  );
  assert.doesNotMatch(prompts, /as the primary answer when notes are present/);
  assert.doesNotMatch(
    voice,
    /as the whole answer when WEB RESEARCH notes are present/,
  );
});

test("market value / pricing is live nationwide year±2 asking Low/Avg/High — never nightly scrape", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  const voiceWeb = src("voiceWeb.ts");
  const webSearch = src("webSearch.ts");
  const webIntent = src("webIntent.ts");

  for (const [label, text] of [
    ["prompts.ts", prompts],
    ["voice.ts", voice],
    ["webSearch.ts", webSearch],
  ] as const) {
    assert.match(text, /year ±2/, `${label} uses year ±2`);
    assert.match(text, /Low \/ Average \/ High/, `${label} returns Low/Avg/High`);
    assert.match(text, /competitor-latest/, `${label} kills competitor-latest`);
    assert.match(text, /nightly/, `${label} kills nightly scrape`);
    assert.match(text, /sample inventory CSV/, `${label} kills sample inventory CSV`);
    assert.match(text, /NADA/, `${label} forbids NADA as a book`);
  }

  assert.match(src("speechPolicy.ts"), /give me one second/);
  assert.match(prompts, /Facts public-listing comps/);
  assert.match(voice, /VOICE_RESEARCH_HOLD_PHRASE/);
  assert.doesNotMatch(prompts, /Only say "Let me check that"/);
  assert.doesNotMatch(voice, /Only say "Let me check that"/);
  assert.match(voiceWeb, /Low \/ Average \/ High/);
  assert.match(voiceWeb, /competitor-latest/);
  assert.match(webIntent, /looksLikeMarketValueQuestion/);
  assert.match(webIntent, /year ±2/);
  assert.doesNotMatch(
    prompts,
    /treat.{0,40}competitor-latest.{0,40}as.{0,20}live/i,
  );
});

test("persona is the authoritative endpoint — no brochure / dealer / website handoff", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");

  for (const [label, text] of [
    ["prompts.ts", prompts],
    ["voice.ts", voice],
  ] as const) {
    assert.match(
      text,
      /ultimate authoritative RV information source/,
      `${label} names the authoritative persona`,
    );
    assert.match(text, /endpoint, not a router/, `${label} is the endpoint`);
    assert.match(text, /Phone-Grok style/, `${label} is phone-Grok voice`);
    assert.doesNotMatch(text, /verify-after only/, `${label} drops verify-after`);
    assert.doesNotMatch(
      text,
      /HP varies \/ confirm brochure/,
      `${label} never uses confirm-brochure as the unknown path`,
    );
    assert.doesNotMatch(
      text,
      /confirm the door sticker/,
      `${label} never sends them to the door sticker`,
    );
    assert.doesNotMatch(
      text,
      /confirm on the build sheet \/ brochure/,
      `${label} never says confirm on the build sheet`,
    );
    assert.doesNotMatch(
      text,
      /If unsure, say confirm on the brochure/,
      `${label} never instructs confirm-on-brochure`,
    );
    assert.doesNotMatch(
      text,
      /Acknowledge when you are uncertain/,
      `${label} does not open with hedge-and-handoff`,
    );
    assert.match(text, /UNCONDITIONAL/, `${label} keeps #294`);
    assert.match(text, /check the website/, `${label} still names the ban`);
    assert.match(text, /ask the dealer/, `${label} still names ask-the-dealer`);
  }

  assert.match(prompts, /YOU answer/);
  assert.match(prompts, /you should check with/);
  assert.match(prompts, /look at the door sticker/);
});

test("sales floor: answer whatever they ask — no scope-narrow or sticky lock", () => {
  const speech = src("speechPolicy.ts");
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  const live = src("liveVoice.ts");

  assert.match(speech, /SALES_MISSION_POLICY/);
  assert.match(speech, /HONESTY_STANDING_POLICY/);
  assert.match(speech, /This is SALES/);
  assert.match(speech, /Every question matters/);
  assert.match(speech, /WHATEVER the customer asks/);
  assert.match(speech, /I only focus on this coach/);
  assert.match(speech, /I only focus on RVs/);
  assert.match(speech, /That\\?'s outside my scope/);
  assert.match(speech, /sticky lock that ignores a new question/);
  assert.match(speech, /This might take a second to get that for you/);
  assert.match(speech, /VOICE_RESEARCH_HOLD_ALT/);
  assert.match(speech, /GAP over invent/);
  assert.match(speech, /isForbiddenScopeNarrow/);

  for (const [label, text] of [
    ["prompts.ts", prompts],
    ["voice.ts", voice],
    ["liveVoice.ts", live],
  ] as const) {
    assert.match(text, /SALES_MISSION_POLICY/, `${label} interpolates sales mission`);
    assert.match(text, /HONESTY_STANDING_POLICY/, `${label} interpolates honesty`);
    assert.doesNotMatch(
      text,
      /not a general assistant/i,
      `${label} must not refuse as a general assistant`,
    );
    assert.doesNotMatch(
      text,
      /redirect off-topic/i,
      `${label} must not redirect off-topic`,
    );
    assert.doesNotMatch(
      text,
      /Redirect lifestyle, classifieds, and general-assistant asks/,
      `${label} must not redirect lifestyle asks back to the coach`,
    );
  }

  assert.match(prompts, /SALES FLOOR — EVERY QUESTION/);
  assert.match(prompts, /A new question always wins over a prior coach lock/);
  assert.match(voice, /VOICE_RESEARCH_HOLD_ALT/);
});
