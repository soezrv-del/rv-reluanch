import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

function assertAnswerPolicy(prompt: string, label: string) {
  assert.match(
    prompt,
    /Answer immediately from catalog, injected notes, or already-known facts/,
    `${label} answers from known facts with no preamble`,
  );
  assert.match(
    prompt,
    /Let me check that/,
    `${label} names the search hold line`,
  );
  assert.match(
    prompt,
    /year, make, model, or class/,
    `${label} limits the hold line to unloaded year/make/model/class`,
  );
  assert.match(prompt, /Never stay silent/, `${label} forbids silence`);
  assert.doesNotMatch(
    prompt,
    /Never say "I'll search", "stand by", "let me look that up"/,
    `${label} no longer blanket-bans the check line`,
  );
}

test("chat, agent, and voice prompts share David's answer-now / Let me check that policy", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  const voiceWeb = src("voiceWeb.ts");

  assertAnswerPolicy(prompts, "prompts.ts");
  assertAnswerPolicy(voice, "voice.ts");

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
  assert.match(
    voiceWeb,
    /Let me check that/,
    "voice hold beat still speaks the same line when a search is actually running",
  );

  assert.match(prompts, /WEB RESEARCH notes/);
  assert.match(prompts, /OWN-LOT INVENTORY/);
  assert.match(prompts, /Class A Diesel/);
  assert.match(prompts, /Class Super C/);
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

  assert.match(prompts, /Let me check that/);
  assert.match(prompts, /Facts public-listing comps/);
  assert.match(voice, /Let me check that/);
  assert.match(voiceWeb, /Low \/ Average \/ High/);
  assert.match(voiceWeb, /competitor-latest/);
  assert.match(webIntent, /looksLikeMarketValueQuestion/);
  assert.match(webIntent, /year ±2/);
  assert.doesNotMatch(
    prompts,
    /treat.{0,40}competitor-latest.{0,40}as.{0,20}live/i,
  );
});
