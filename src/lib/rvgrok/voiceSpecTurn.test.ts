import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCoachIdentity } from "./coachIdentity.ts";
import { resolveDeskSheet, type DeskSheetPayload } from "./deskSheet.ts";
import {
  classifyVoiceCoachDepth,
  formatVoiceQuickOverview,
  formatVoiceSpecEngineSpeech,
  isVoiceExtraNudge,
  looksLikeVoiceCoachOrSpecAsk,
  VOICE_COACH_CHOICE_LINE,
  voiceExtraPromptLine,
  voiceSpecSourcePhrase,
  withVoiceSpecExtras,
} from "./voiceSpecTurn.ts";

const root = dirname(fileURLToPath(import.meta.url));

const LINEAGE_Q =
  "2026 Grand Design Lineage Series F 31ZW UVW dry weight";

function lineageSheet(overrides?: Partial<DeskSheetPayload>): DeskSheetPayload {
  return {
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series F",
    floorplan: "31ZW",
    title: "2026 Grand Design Lineage Series F 31ZW",
    rows: [
      {
        label: "UVW",
        value: "18,186 lbs*",
        gap: false,
        asterisk: true,
        sourceUrl:
          "https://www.rvguide.com/specs/grand-design/class-c/2026/lineage-series-f/31zw.html",
      },
    ],
    gaps: [],
    presenceNote: "",
    ...overrides,
  };
}

test("Lineage 31ZW UVW speech uses the painted engine number, not a guess", () => {
  const identity = resolveCoachIdentity(LINEAGE_Q, null, "");
  assert.ok(identity);
  assert.equal(identity!.floorplan, "31ZW");
  const sheet = resolveDeskSheet({
    query: LINEAGE_Q,
    identity,
    specs: null,
  });
  assert.ok(sheet);
  const uvw = sheet!.rows.find((r) => r.label === "UVW");
  assert.equal(uvw?.gap, false);
  assert.match(uvw?.value || "", /18,186/);
  const speech = formatVoiceSpecEngineSpeech(sheet, LINEAGE_Q);
  assert.match(speech, /18,186/);
  assert.match(speech, /from the catalog/);
  assert.match(speech, /dry weight/i);
  assert.doesNotMatch(speech, /I won't guess/);
  const tagged = withVoiceSpecExtras(sheet, LINEAGE_Q);
  assert.equal(tagged?.offerVoiceExtras, true);
  assert.equal(withVoiceSpecExtras(sheet, "hi")?.offerVoiceExtras, undefined);
});

test("fallback pin names RV Guide and a catalog miss does not invent", () => {
  const speech = formatVoiceSpecEngineSpeech(lineageSheet(), LINEAGE_Q);
  assert.match(speech, /18,186/);
  assert.match(speech, /from RV Guide/);
  assert.equal(
    voiceSpecSourcePhrase({
      sourceUrl: "https://www.rvusa.com/rv-guide/2026-lineage-31zw",
    }),
    "from RVUSA",
  );
  assert.equal(
    voiceSpecSourcePhrase({
      sourceUrl: "https://dealer.example/inventory/lineage-31zw",
    }),
    "from dealer inventory",
  );
  assert.equal(
    voiceSpecSourcePhrase({
      sourceUrl: "http://library.rvusa.com/brochure/2026-Grand-Design-Lineage-Series-F.pdf",
    }),
    "from the OEM brochure",
  );

  const missed = formatVoiceSpecEngineSpeech(
    lineageSheet({
      rows: [{ label: "UVW", value: "GAP", gap: true }],
      gaps: ["UVW"],
    }),
    LINEAGE_Q,
  );
  assert.match(missed, /I won't guess/);
  assert.doesNotMatch(missed, /18,186/);
  assert.match(
    formatVoiceSpecEngineSpeech(null, LINEAGE_Q),
    /both missed/,
  );
  assert.doesNotMatch(formatVoiceSpecEngineSpeech(null, LINEAGE_Q), /\d{4,}/);
});

test("spec speech says the ack first, then the catalog result, then extras", () => {
  const speech = formatVoiceSpecEngineSpeech(
    lineageSheet(),
    LINEAGE_Q,
    "asked",
    "On it.",
  );
  assert.match(speech, /^On it\. /);
  const ackAt = speech.indexOf("On it.");
  const numAt = speech.indexOf("18,186");
  const extrasAt = speech.indexOf("Spec sheet is on the desk");
  assert.ok(ackAt >= 0 && numAt > ackAt && extrasAt > numAt);
  const missed = formatVoiceSpecEngineSpeech(null, LINEAGE_Q, "asked", "Got it.");
  assert.match(missed, /^Got it\. Catalog and the fallback chain both missed/);
  assert.match(missed, /I won't guess/);
  const full = formatVoiceSpecEngineSpeech(lineageSheet(), LINEAGE_Q, "all", "Right away.");
  assert.match(full, /^Right away\. /);
  assert.match(full, /18,186/);
  assert.doesNotMatch(full, /You can pick recalls/);
});

test("coach or spec ask is a choice, not a synopsis or an auto full report", () => {
  assert.equal(
    VOICE_COACH_CHOICE_LINE,
    "Of course, right away — would you like a full report or a quick overview?",
  );
  assert.equal(classifyVoiceCoachDepth("full report"), "full");
  assert.equal(classifyVoiceCoachDepth("a quick overview please"), "quick");
  assert.equal(classifyVoiceCoachDepth("full report on the Lineage 31ZW"), null);
  assert.equal(looksLikeVoiceCoachOrSpecAsk(LINEAGE_Q), true);
  assert.equal(
    looksLikeVoiceCoachOrSpecAsk("tell me about the 2026 Lineage 31ZW"),
    true,
  );
  assert.equal(looksLikeVoiceCoachOrSpecAsk("hi"), false);
  assert.equal(isVoiceExtraNudge("next"), true);
  assert.equal(isVoiceExtraNudge(LINEAGE_Q), false);

  const full = formatVoiceSpecEngineSpeech(lineageSheet(), LINEAGE_Q, "all");
  assert.match(full, /18,186/);
  assert.doesNotMatch(full, /You can pick recalls/);
  assert.equal(voiceExtraPromptLine(lineageSheet(), 0), "Want NHTSA recalls?");
  assert.equal(voiceExtraPromptLine(lineageSheet(), 99), null);

  const quick = formatVoiceQuickOverview(lineageSheet());
  assert.match(quick, /31ZW/);
  assert.doesNotMatch(quick, /18,186/);
  assert.doesNotMatch(quick, /Want NHTSA/);
  assert.equal(withVoiceSpecExtras(lineageSheet(), "tell me about it", { force: true, step: 0 })?.voiceExtraStep, 0);
});

test("Live Voice spec turns go through the shared engine and skip the snippet reply", () => {
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  const fnStart = realtime.indexOf("private async maybeEnrichWithWebResearch");
  const fn = realtime.slice(fnStart);
  const specAt = fn.indexOf("if (looksLikeDeskSheetAsk(transcript))");
  const researchSpec = fn.indexOf(
    "if (looksLikeDeskSheetAsk(transcript))",
    specAt + 1,
  );
  const flushAt = fn.indexOf("this.flushResearchAnswer(injection)");
  assert.ok(specAt > 0 && researchSpec > specAt);
  assert.ok(researchSpec < flushAt, "spec engine returns before the snippet flush");
  assert.match(fn, /speakFromSpecEngine/);
  assert.match(fn, /resolveDeskSheetThenFallback/);
  assert.match(realtime, /formatVoiceSpecEngineSpeech/);
  assert.match(realtime, /VOICE_SPEC_ENGINE_INSTRUCTIONS/);
  assert.match(realtime, /offerVoiceExtras|withVoiceSpecExtras/);
  assert.match(realtime, /routeVoiceOpening/);
  assert.match(realtime, /VOICE_COACH_CHOICE_INSTRUCTIONS/);
  assert.match(realtime, /formatVoiceQuickOverview/);
  assert.match(realtime, /voiceExtraStep|voiceExtraPromptLine/);
  const choiceAt = realtime.indexOf("routeVoiceOpening");
  const speakAt = realtime.indexOf("speakFromSpecEngine");
  assert.ok(choiceAt > 0 && choiceAt < speakAt);
  assert.doesNotMatch(realtime, /Would you like a quick overview, or a full desk report/);
  assert.doesNotMatch(
    readFileSync(join(root, "voiceSpecTurn.ts"), "utf8"),
    /Would you like a quick overview, or a full desk report/,
  );
  assert.doesNotMatch(realtime, /[Dd]ialaBot/);
  assert.doesNotMatch(readFileSync(join(root, "voiceSpecTurn.ts"), "utf8"), /[Gg]emini/);
  assert.doesNotMatch(readFileSync(join(root, "grokExtras.ts"), "utf8"), /[Gg]emini/);
});
