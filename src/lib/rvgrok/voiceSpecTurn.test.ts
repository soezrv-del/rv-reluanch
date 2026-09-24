import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCoachIdentity } from "./coachIdentity.ts";
import { resolveDeskSheet, type DeskSheetPayload } from "./deskSheet.ts";
import {
  classifyVoiceCoachDepth,
  classifyVoiceExtraPick,
  formatVoiceQuickOverview,
  formatVoiceSpecEngineSpeech,
  isVoiceExtraNudge,
  looksLikeExplicitVoiceReportAsk,
  looksLikeVoiceCoachOrSpecAsk,
  looksLikeVoiceTellMeAboutAsk,
  looksLikeVoiceFieldOrMetaAsk,
  shouldSpeakVoiceCoachChoice,
  VOICE_COACH_CHOICE_LINE,
  voiceDepthAlreadyChosen,
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
  assert.doesNotMatch(speech, /from the catalog|per the catalog|from RV Guide|from the OEM brochure|from dealer inventory/i);
  assert.match(speech, /dry weight/i);
  assert.doesNotMatch(speech, /I won't guess/);
  const tagged = withVoiceSpecExtras(sheet, LINEAGE_Q);
  assert.equal(tagged?.offerVoiceExtras, true);
  assert.equal(withVoiceSpecExtras(sheet, "hi")?.offerVoiceExtras, undefined);
});

test("spec speech does not narrate a source tag, and a miss does not invent", () => {
  const speech = formatVoiceSpecEngineSpeech(lineageSheet(), LINEAGE_Q);
  assert.match(speech, /18,186/);
  assert.doesNotMatch(speech, /from the catalog|per the catalog|from RV Guide/i);
  assert.equal(
    voiceSpecSourcePhrase({
      sourceUrl: "https://www.rvusa.com/rv-guide/2026-lineage-31zw",
    }),
    "",
  );
  assert.equal(
    voiceSpecSourcePhrase({
      sourceUrl: "https://dealer.example/inventory/lineage-31zw",
    }),
    "",
  );
  assert.equal(
    voiceSpecSourcePhrase({
      sourceUrl: "http://library.rvusa.com/brochure/2026-Grand-Design-Lineage-Series-F.pdf",
    }),
    "",
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
  const extrasAt = speech.indexOf("ratings, market value");
  assert.ok(ackAt >= 0 && numAt > ackAt && extrasAt > numAt);
  const missed = formatVoiceSpecEngineSpeech(null, LINEAGE_Q, "asked", "Got it.");
  assert.match(missed, /^Got it\. Catalog and the fallback chain both missed/);
  assert.match(missed, /I won't guess/);
  const full = formatVoiceSpecEngineSpeech(lineageSheet(), LINEAGE_Q, "all", "Right away.");
  assert.match(full, /^Right away\. /);
  assert.match(full, /18,186/);
  assert.match(full, /ratings, market value, a video, NHTSA safety, or maintenance/);
  assert.doesNotMatch(full, /You can pick recalls/);
});

test("coach or spec ask is a choice, not a synopsis or an auto full report", () => {
  assert.equal(
    VOICE_COACH_CHOICE_LINE,
    "Of course, right away — would you like a full report or a quick overview?",
  );
  assert.equal(classifyVoiceCoachDepth("full report"), "full");
  assert.equal(classifyVoiceCoachDepth("a quick overview please"), "quick");
  assert.equal(classifyVoiceCoachDepth("short"), "quick");
  assert.equal(classifyVoiceCoachDepth("report"), "full");
  assert.equal(classifyVoiceCoachDepth("full report on the Lineage 31ZW"), null);
  assert.equal(
    voiceDepthAlreadyChosen("full report on the Lineage 31ZW"),
    "full",
  );
  assert.equal(
    voiceDepthAlreadyChosen("quick overview of the 2026 Lineage"),
    "quick",
  );
  assert.equal(voiceDepthAlreadyChosen("short version of the 31ZW"), "quick");
  assert.equal(voiceDepthAlreadyChosen("tell me about the 2026 Lineage 31ZW"), null);
  assert.equal(classifyVoiceExtraPick("ratings"), "ratings");
  assert.equal(classifyVoiceExtraPick("market value"), "market");
  assert.equal(classifyVoiceExtraPick("NHTSA"), "nhtsa");
  assert.equal(classifyVoiceExtraPick("maintenance"), "maintenance");
  assert.equal(classifyVoiceExtraPick("video"), "video");
  assert.equal(classifyVoiceExtraPick("ratings and market value"), null);
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
  assert.match(full, /Which one do you want/);
  const benefit = formatVoiceSpecEngineSpeech(
    lineageSheet({
      rows: [
        { label: "Torque", value: "1,850 lb-ft", gap: false },
        { label: "Horsepower", value: "605 hp", gap: false },
        { label: "GVWR", value: "Confirm brochure", gap: true },
        { label: "UVW", value: "GAP", gap: true },
      ],
    }),
    "2026 Entegra Coach Cornerstone 45B",
    "all",
  );
  assert.match(benefit, /hill power/);
  assert.match(benefit, /passing power/);
  assert.match(benefit, /Still missing: GVWR and UVW/);
  assert.equal((benefit.match(/I won't guess/g) || []).length, 1);
  assert.doesNotMatch(benefit, /from the catalog|per the catalog|Confirm brochure|\bGAP\b/i);
  assert.doesNotMatch(full, /You can pick recalls/);
  assert.equal(voiceExtraPromptLine(lineageSheet(), 0), "Want ratings?");
  assert.equal(voiceExtraPromptLine(lineageSheet(), 99), null);

  const quick = formatVoiceQuickOverview(lineageSheet());
  assert.match(quick, /31ZW/);
  assert.doesNotMatch(quick, /18,186/);
  assert.doesNotMatch(quick, /ratings, market value/);
  const quickReport = formatVoiceQuickOverview(lineageSheet(), {
    offerExtras: true,
  });
  assert.match(
    quickReport,
    /ratings, market value, a video, NHTSA safety, or maintenance/,
  );
  const picked = withVoiceSpecExtras(lineageSheet(), "tell me about it", {
    force: true,
    pick: "market",
  });
  assert.equal(picked?.voiceExtraPick, "market");
  assert.equal(picked?.offerVoiceExtras, true);
});

test("tell me about a coach is a short line and does not offer the five extras", () => {
  const q = "tell me about the Cornerstone";
  assert.equal(looksLikeVoiceTellMeAboutAsk(q), true);
  assert.equal(looksLikeExplicitVoiceReportAsk(q), false);
  assert.equal(looksLikeVoiceTellMeAboutAsk("tell me everything about the Cornerstone"), false);
  assert.equal(looksLikeExplicitVoiceReportAsk("tell me everything about the Cornerstone"), true);
  const short = formatVoiceQuickOverview(
    lineageSheet({
      year: "2026",
      make: "Entegra Coach",
      model: "Cornerstone",
      floorplan: "45B",
      title: "2026 Entegra Coach Cornerstone 45B",
    }),
  );
  assert.match(short, /Cornerstone 45B/);
  assert.doesNotMatch(short, /ratings|market value|NHTSA|maintenance|video/i);
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  const fn = realtime.slice(
    realtime.indexOf("private async maybeEnrichWithWebResearch"),
  );
  assert.match(fn, /looksLikeVoiceTellMeAboutAsk\(transcript\)/);
  assert.match(fn, /deliverVoiceQuick\(specSeq, transcript\);/);
  assert.match(
    fn,
    /deliverVoiceQuick\(specSeq, transcript, \{ reportDelivery: true \}\)/,
  );
  const quickFn = realtime.slice(
    realtime.indexOf("private async deliverVoiceQuick"),
    realtime.indexOf("private offerVoiceExtras"),
  );
  assert.match(quickFn, /if \(reportDelivery\) this\.offerVoiceExtras/);
  assert.match(quickFn, /offerExtras: reportDelivery/);
  const catalogFirst = realtime.slice(
    realtime.indexOf("private speakCatalogThenFallback"),
    realtime.indexOf("private async deliverVoiceQuick"),
  );
  assert.match(catalogFirst, /resolveDeskSheetThenFallback/);
  assert.match(catalogFirst, /offerExtras/);
  assert.match(quickFn, /speakCatalogThenFallback\(/);
  assert.match(quickFn, /reportDelivery,/);
});

test("choice line only for an explicit report ask with ambiguous length", () => {
  for (const q of [
    "just the GVWR",
    "why didn't you pull the GVWR",
    "why didn't you pull UVW",
    "what's the GVWR",
    "the UVW",
    "what about the Cornerstone",
    "tell me about the 2026 Lineage 31ZW",
  ]) {
    assert.equal(looksLikeExplicitVoiceReportAsk(q), false, q);
    assert.equal(
      shouldSpeakVoiceCoachChoice({ transcript: q, coachLocked: true }),
      false,
      q,
    );
    assert.equal(
      shouldSpeakVoiceCoachChoice({ transcript: q, coachLocked: false }),
      false,
      q,
    );
  }
  for (const q of [
    "just the GVWR",
    "why didn't you pull the GVWR",
    "what's the GVWR",
    "the UVW",
    "2026 Entegra Coach Cornerstone 45B GVWR",
  ]) {
    assert.equal(looksLikeVoiceFieldOrMetaAsk(q), true, q);
  }
  assert.equal(looksLikeExplicitVoiceReportAsk("tell me everything about the Cornerstone"), true);
  assert.equal(looksLikeExplicitVoiceReportAsk("specs on the 45B"), true);
  assert.equal(looksLikeExplicitVoiceReportAsk("CARFAX on the Cornerstone"), true);
  assert.equal(looksLikeExplicitVoiceReportAsk("full report"), true);
  assert.equal(
    shouldSpeakVoiceCoachChoice({
      transcript: "tell me everything about the 2026 Lineage 31ZW",
      coachLocked: false,
    }),
    true,
  );
  assert.equal(
    shouldSpeakVoiceCoachChoice({
      transcript: "specs on the Cornerstone 45B",
      coachLocked: true,
    }),
    true,
  );
  assert.equal(
    shouldSpeakVoiceCoachChoice({
      transcript: "full report",
      coachLocked: true,
    }),
    false,
  );
});

test("speech refuses an unpainted GVWR and keeps benefit on painted facts", () => {
  const corner = lineageSheet({
    year: "2026",
    make: "Entegra Coach",
    model: "Cornerstone",
    floorplan: "45B",
    title: "2026 Entegra Coach Cornerstone 45B",
    rows: [
      { label: "GVWR", value: "Confirm brochure", gap: true },
      { label: "UVW", value: "GAP", gap: true },
      { label: "Fuel capacity", value: "GAP", gap: true },
    ],
    gaps: ["GVWR", "UVW", "Fuel capacity"],
  });
  const speech = formatVoiceSpecEngineSpeech(corner, "just the GVWR");
  assert.match(speech, /GVWR is still missing/);
  assert.match(speech, /checking live sources/);
  assert.match(speech, /I won't guess/);
  assert.doesNotMatch(speech, /54,?000/);
  assert.doesNotMatch(speech, /\bpounds\b/);
  assert.doesNotMatch(speech, /fewer stops|hill power|passing power/);

  const painted = formatVoiceSpecEngineSpeech(
    lineageSheet({
      rows: [
        { label: "GVWR", value: "54,000 lbs", gap: false },
        { label: "Fuel capacity", value: "150 gal", gap: false },
      ],
    }),
    "2026 Entegra Coach Cornerstone 45B",
    "all",
  );
  assert.match(painted, /54,000/);
  assert.match(painted, /fewer stops/);
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
  assert.match(realtime, /voiceExtraPick|classifyVoiceExtraPick|VOICE_EXTRAS_OFFER_LINE|offerVoiceExtras/);
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

test("overview sheet is reused for full report and voice fallback pins knowledge", () => {
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  const knowledge = readFileSync(join(root, "specFallbackKnowledge.ts"), "utf8");
  const route = readFileSync(
    join(root, "../../routes/api/rvfax.spec-fallback.ts"),
    "utf8",
  );
  assert.match(realtime, /voiceCachedSheet/);
  assert.match(realtime, /rememberVoiceCachedSheet/);
  assert.match(realtime, /matchingVoiceCachedSheet/);
  assert.match(realtime, /pinCoachKnowledge:\s*true/);
  const fullAt = realtime.indexOf('if (this.voiceDeliver === "full")');
  const reuseAt = realtime.indexOf("matchingVoiceCachedSheet", fullAt);
  const armAt = realtime.indexOf("this.armSpecEngineTurn", fullAt);
  assert.ok(fullAt > 0 && reuseAt > fullAt && armAt > reuseAt);
  assert.match(
    realtime.slice(fullAt, armAt),
    /paintDesk:\s*!cached/,
  );
  const routeFn = realtime.slice(
    realtime.indexOf("private routeVoiceOpening"),
    realtime.indexOf("private async deliverVoiceQuick"),
  );
  const cachedDeliver = routeFn.indexOf("this.voiceCachedSheet?.query");
  const choiceOpen = routeFn.indexOf("this.voiceChoiceTranscript = transcript");
  assert.ok(cachedDeliver > 0 && choiceOpen > cachedDeliver);
  assert.match(routeFn, /VOICE_COACH_CHOICE_INSTRUCTIONS/);
  assert.match(routeFn, /shouldSpeakVoiceCoachChoice/);
  assert.match(routeFn, /looksLikeExplicitVoiceReportAsk/);
  const fieldSkip = routeFn.indexOf("shouldSpeakVoiceCoachChoice");
  const choiceSpeak = routeFn.indexOf("VOICE_COACH_CHOICE_INSTRUCTIONS");
  assert.ok(fieldSkip > 0 && fieldSkip < choiceSpeak);
  assert.match(routeFn.slice(fieldSkip, choiceSpeak), /return false/);
  const fieldRun = realtime.indexOf(
    "!looksLikeExplicitVoiceReportAsk(transcript)",
  );
  assert.ok(fieldRun > 0);
  assert.match(realtime.slice(fieldRun, fieldRun + 900), /armSpecEngineTurn/);
  assert.match(
    realtime.slice(fieldRun, fieldRun + 900),
    /looksLikeVoiceFieldOrMetaAsk/,
  );
  const arm = realtime.slice(
    realtime.indexOf("private armSpecEngineTurn"),
    realtime.indexOf("private async speakFromSpecEngine"),
  );
  assert.match(arm, /resolveDeskSheetThenFallback/);
  assert.match(arm, /pinCoachKnowledge:\s*true/);
  assert.match(arm, /looksLikeVoiceFieldOrMetaAsk/);
  const knowledgeCode = knowledge.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.match(knowledgeCode, /planSpecFallbackKnowledgeWrite/);
  assert.match(knowledgeCode, /planCoachKnowledgeWrite/);
  assert.match(knowledgeCode, /upsertCoachKnowledgePlan/);
  assert.doesNotMatch(knowledgeCode, /webResearchTelemetry/);
  assert.match(route, /persistSpecFallbackKnowledge/);
  assert.match(route, /specFallbackKnowledge/);
  assert.match(route, /pinCoachKnowledge === true/);
  assert.doesNotMatch(route, /webResearchTelemetry/);
  assert.doesNotMatch(realtime, /from ["']\.\/coachKnowledge["']/);
  assert.match(realtime, /from ["']\.\/coachKnowledgeKey["']/);
  assert.doesNotMatch(realtime, /[Gg]emini/);
  assert.doesNotMatch(route, /[Dd]ialaBot/);
});
