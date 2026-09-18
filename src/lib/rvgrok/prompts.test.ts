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
  assert.match(prompts, /Do not invent/);
  assert.match(prompts, /REPAIR \/ DIAGNOSE/);
  assert.match(voice, /WEB RESEARCH notes/);
  assert.match(voice, /REPAIR PLAYBOOK/);
});
