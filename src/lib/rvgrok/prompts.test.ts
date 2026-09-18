import assert from "node:assert/strict";
import test from "node:test";
import { AGENT_SYSTEM_PROMPT, RV_SYSTEM_PROMPT } from "./prompts.ts";
import { RV_VOICE_INSTRUCTIONS } from "./voice.ts";
import { VOICE_RESEARCH_HOLD_INSTRUCTIONS } from "./voiceWeb.ts";

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
  assertAnswerPolicy(RV_SYSTEM_PROMPT, "RV_SYSTEM_PROMPT");
  assertAnswerPolicy(AGENT_SYSTEM_PROMPT, "AGENT_SYSTEM_PROMPT");
  assertAnswerPolicy(RV_VOICE_INSTRUCTIONS, "RV_VOICE_INSTRUCTIONS");

  assert.match(
    RV_SYSTEM_PROMPT,
    /first user-visible line/,
    "chat: hold line is first, then search, then answer in the same response",
  );
  assert.match(
    AGENT_SYSTEM_PROMPT,
    /same final response/,
    "agent: search then complete answer in the same final response",
  );
  assert.match(
    VOICE_RESEARCH_HOLD_INSTRUCTIONS,
    /Let me check that/,
    "voice hold beat still speaks the same line when a search is actually running",
  );

  for (const [label, prompt] of [
    ["RV_SYSTEM_PROMPT", RV_SYSTEM_PROMPT],
    ["AGENT_SYSTEM_PROMPT", AGENT_SYSTEM_PROMPT],
  ] as const) {
    assert.match(prompt, /WEB RESEARCH/, `${label} keeps WEB RESEARCH notes`);
    assert.match(prompt, /Do not invent/, `${label} still forbids invented specs`);
    assert.match(prompt, /REPAIR/, `${label} keeps the repair playbook`);
  }
});
