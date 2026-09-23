import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildFollowUpChips,
  followUpChipsForThread,
  latestFinishedAssistantIndex,
} from "./followUpChips.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function labels(chips: { label: string }[]) {
  return chips.map((c) => c.label);
}

test("chassis turn yields sales-useful chips — not tell-me-more", () => {
  const chips = buildFollowUpChips({
    userText: "How does the chassis work on a 2021 Tiffin Phaeton diesel pusher?",
    assistantText:
      "Diesel pushers sit on a Freightliner or Spartan rail. Chassis specs — wheelbase, tag axle, GVWR — decide what the coach can carry. I am not inventing a brochure pin here.",
  });
  assert.ok(chips.length >= 2 && chips.length <= 4);
  const text = labels(chips).join(" | ");
  assert.match(text, /diesel pusher chassis/i);
  assert.match(text, /Freightliner vs Spartan/i);
  assert.match(text, /2021/);
  assert.doesNotMatch(text, /tell me more/i);
  assert.doesNotMatch(text, /I'm RvGrok/i);
  assert.doesNotMatch(text, /\b\d{2,4}\s*hp\b/i);
});

test("named coach without tanks/weights digs into tanks and a compare", () => {
  const chips = buildFollowUpChips({
    userText: "Tell me about the 2022 Newmar Dutch Star 4369",
    assistantText:
      "Dutch Star 4369 is a diesel pusher Class A. Overview covers the coach; I will not invent tank gallons or a listing.",
  });
  const text = labels(chips).join(" | ");
  assert.ok(chips.length >= 2 && chips.length <= 4);
  assert.match(text, /tanks and payload|real payload/i);
  assert.match(text, /similar class|cross-shop|Freightliner/i);
  assert.doesNotMatch(text, /tell me more/i);
  assert.doesNotMatch(text, /I'm RvGrok/);
});

test("empty or error assistant replies get no chips", () => {
  assert.deepEqual(buildFollowUpChips({ userText: "hi", assistantText: "" }), []);
  assert.deepEqual(
    buildFollowUpChips({
      userText: "hi",
      assistantText: "Error: upstream timeout",
    }),
    [],
  );
});

test("generic lifestyle turn still gets RV-research chips, never greeting", () => {
  const chips = buildFollowUpChips({
    userText: "We're full-timing and like to fish",
    assistantText:
      "Full-time plus fishing usually means tank capacity, a real kitchen, and a coach that can sit at a ramp lot. We'll figure this out.",
  });
  assert.ok(chips.length >= 2 && chips.length <= 4);
  for (const c of chips) {
    assert.doesNotMatch(c.label, /I'm RvGrok/);
    assert.doesNotMatch(c.label, /tell me more/i);
    assert.doesNotMatch(c.label, /ask me anything/i);
  }
});

test("latest finished assistant only — streaming and errors hide chips", () => {
  assert.equal(latestFinishedAssistantIndex([]), -1);
  assert.equal(
    latestFinishedAssistantIndex([
      { role: "user", content: "chassis?" },
      { role: "assistant", content: "", streaming: true },
    ]),
    -1,
  );
  assert.equal(
    latestFinishedAssistantIndex([
      { role: "user", content: "chassis?" },
      { role: "assistant", content: "Error: nope", streaming: false },
    ]),
    -1,
  );
  const thread = [
    { role: "user" as const, content: "How does a diesel pusher chassis work?" },
    {
      role: "assistant" as const,
      content: "Freightliner and Spartan rails carry the coach.",
      streaming: false,
    },
  ];
  assert.equal(latestFinishedAssistantIndex(thread), 1);
  const { index, chips } = followUpChipsForThread(thread);
  assert.equal(index, 1);
  assert.ok(chips.length >= 2);
  assert.match(labels(chips).join(" | "), /chassis/i);
});

test("MessageBubble renders chips under actions; tap sends the label", () => {
  const bubble = src("../../components/rvgrok/MessageBubble.tsx");
  const app = src("../../components/rvgrok/RvGrokApp.tsx");

  assert.match(bubble, /data-rvgrok-followups/);
  assert.match(bubble, /data-rvgrok-followup=/);
  assert.match(bubble, /CornerDownLeft/);
  assert.match(bubble, /onSuggestion/);
  assert.match(
    bubble,
    /onClick=\{\(\) => onSuggestion\?\.\(chip\.label\)\}/,
    "chip tap sends the visible string",
  );
  assert.match(bubble, /suggestions && suggestions\.length/);

  const actionsIdx = bubble.indexOf("Helpful?");
  const speakIdx = bubble.indexOf("Speak");
  const chipsIdx = bubble.indexOf("data-rvgrok-followups");
  assert.ok(chipsIdx > Math.max(actionsIdx, speakIdx), "chips sit below actions");

  assert.match(app, /followUpChipsForThread/);
  assert.match(app, /liveActive/);
  assert.match(app, /onSuggestion=/);
  assert.match(
    app,
    /onSuggestion=\{\(prompt\) => void sendMessage\(prompt\)\}/,
    "chip tap uses the same send path as typing",
  );
  assert.match(
    app,
    /liveActive\s*\?\s*\{ index: -1/,
    "Live Voice skips chips; typed thread shares the helper",
  );
});

test("chips stay UI-only — no spoken post-reply prompts; intro is one line", () => {
  const prompts = src("prompts.ts");
  const speech = src("speechPolicy.ts");
  const landing = src("../../components/rvgrok/GrokLanding.tsx");
  const helper = src("followUpChips.ts");
  const bubble = src("../../components/rvgrok/MessageBubble.tsx");
  const app = src("../../components/rvgrok/RvGrokApp.tsx");

  assert.match(speech, /RV_GROK_SESSION_INTRO = "I'm RvGrok"/);
  assert.match(speech, /sessionIntroLine/);
  assert.match(speech, /Hello, \$\{name\}/);
  assert.match(speech, /Never repeat this intro on later turns/);
  assert.match(landing, /RV_GROK_SESSION_INTRO/);
  assert.match(landing, /data-rvgrok-greeting/);
  assert.match(landing, /data-rvgrok-welcome/);
  assert.match(landing, /welcomeBack/);
  assert.match(app, /sessionIntroLine/);
  assert.match(app, /sessionGreeting/);

  assert.doesNotMatch(prompts, /then offer to go deeper/);
  assert.doesNotMatch(prompts, /want me to go deeper/);
  assert.doesNotMatch(
    prompts,
    /follow-up question/,
    "lean standing prompt does not teach spoken post-reply chips",
  );
  assert.doesNotMatch(helper, /streamChat|XAI_API|chat\.completions/);
  assert.doesNotMatch(bubble, /I'm RvGrok/);
  assert.doesNotMatch(
    app,
    /I'm RvGrok/,
    "thread app must not replay the greeting as a chip",
  );
});
