import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCoachReportFromNotes,
  coachReportHasPaintedFigures,
  coachReportResearchLengthRule,
  COACH_REPORT_CHAT_RULE,
  COACH_REPORT_SECTION_HEADINGS,
  formatCoachReportChat,
  formatCoachReportDraftInjection,
  formatCoachReportVoiceCue,
  looksLikeCoachReportAsk,
} from "./coachReport.ts";
import {
  chatSpecCoversPaintedFields,
  extractChatSpecFigures,
  paintChatSpecOntoRows,
} from "./chatSpecBlock.ts";
import {
  skipGeminiForResearchAsk,
  SPEC_REPORT_RESEARCH_TIMEOUT_MS,
} from "./webSearch.ts";
import {
  GEMINI_SPEC_REPORT_TIMEOUT_MS,
  geminiResearchTimeoutMs,
} from "./geminiResearch.ts";

const root = dirname(fileURLToPath(import.meta.url));

const DREAM_Q = "2021 American Coach American Dream 42Q";

const DREAM_NOTES = `
CONFIRMED: yes
The 2021 American Coach American Dream 42Q is a Class A diesel pusher — a shorter high-end option in the Dream lineup.
Chassis: Freightliner Liberty Bridge / XCM with independent front suspension and a 60-degree wheel cut.
Engine: Cummins L9 450 horsepower, 1,250 pound-feet of torque, Allison 3000 6-speed automatic.
Length 42 feet 11 inches. GVWR 47,000 pounds. 150-gallon fuel tank. Three slide-outs including a full-wall slide. Sleeps 6.
Gourmet kitchen with residential refrigerator, island cooktop, and a two-burner cooktop.
Rear suite with king bed, washer/dryer, private master bath.
Exterior: outdoor entertainment center, power awning, 12.5 kW generator.
`;

const DREAM_CATALOG = `
VERIFIED CATALOG / BROCHURE for 2021 American Coach American Dream 42Q:
- engine: Cummins L9  [catalog]
- horsepower: 450 HP  [pin]
- torque: 1,250 lb-ft  [pin]
- chassis: Spartan / Freightliner  [catalog]
- transmission: Allison 3000  [catalog]
- fuel: Diesel  [catalog]
- class / type: Class A Diesel  [catalog]
LOCKED WEIGHTS (OEM pin — speak these; never claim GAP for a VERIFIED field):
- VERIFIED GVWR 47000 from OEM pin
- UVW: GAP — no OEM pin.
`;

test("report-shape intent: YMM / full specs / CARFAX — not inventory, compare, or hi", () => {
  assert.equal(looksLikeCoachReportAsk(DREAM_Q), true);
  assert.equal(
    looksLikeCoachReportAsk("Give me the spec report on the 2021 American Dream 42Q"),
    true,
  );
  assert.equal(
    looksLikeCoachReportAsk("full specs on a 2022 Tiffin Phaeton 40IH"),
    true,
  );
  assert.equal(
    looksLikeCoachReportAsk("CARFAX-style sheet for 2019 Dutch Star 4369"),
    true,
  );
  assert.equal(
    looksLikeCoachReportAsk("What's the GVWR of a 2022 Tiffin Phaeton 40IH?"),
    true,
  );
  assert.equal(looksLikeCoachReportAsk("hi"), false);
  assert.equal(
    looksLikeCoachReportAsk("Compare the Allegro Bus to the American Dream."),
    false,
  );
  assert.equal(
    looksLikeCoachReportAsk("Do we have a Dutch Star on the lot?"),
    false,
  );
  assert.deepEqual(
    [...COACH_REPORT_SECTION_HEADINGS],
    [
      "Overview",
      "Chassis & powertrain",
      "Weights & capacity",
      "Layout & amenities",
    ],
  );
  assert.match(COACH_REPORT_CHAT_RULE, /Overview/);
  assert.match(COACH_REPORT_CHAT_RULE, /never invent/i);
  assert.match(coachReportResearchLengthRule("chat"), /Layout & amenities/);
  assert.match(coachReportResearchLengthRule("voice"), /2–4 ear-friendly|2-4 ear-friendly/);
});

test("research notes + catalog pins feed the four Dream 42Q sections — no invented UVW", () => {
  const report = buildCoachReportFromNotes({
    notes: DREAM_NOTES,
    catalogBlock: DREAM_CATALOG,
    query: DREAM_Q,
  });
  const headings = report.sections.map((s) => s.heading);
  assert.deepEqual(headings, [...COACH_REPORT_SECTION_HEADINGS]);
  assert.match(report.title, /2021/);
  assert.match(report.title, /American Dream/i);
  assert.match(report.title, /42Q/);

  const blob = formatCoachReportChat(report);
  assert.match(blob, /Overview/);
  assert.match(blob, /Chassis & powertrain/);
  assert.match(blob, /Weights & capacity/);
  assert.match(blob, /Layout & amenities/);
  assert.match(blob, /Cummins L9/i);
  assert.match(blob, /450/);
  assert.match(blob, /1,250|1250/);
  assert.match(blob, /Allison/i);
  assert.match(blob, /47,000/);
  assert.match(blob, /150/);
  assert.match(blob, /slide/i);
  assert.match(blob, /kitchen|suite|king/i);
  assert.doesNotMatch(blob, /\bUVW:/);
  assert.doesNotMatch(blob, /typical class range/i);
  assert.equal(report.figures.uvw, undefined, "catalog UVW is GAP — do not invent");
  assert.equal(coachReportHasPaintedFigures(report), true);

  const voice = formatCoachReportVoiceCue(report);
  assert.match(voice, /American Dream/i);
  assert.match(voice, /450|L9|1,250|1250/i);
  assert.doesNotMatch(voice, /Overview/);
  assert.ok(voice.split(/[.!?]/).filter((s) => s.trim()).length <= 6);
});

test("structured report text paints the desk and hides GAP lecture", () => {
  const report = buildCoachReportFromNotes({
    notes: DREAM_NOTES,
    catalogBlock: DREAM_CATALOG,
    query: DREAM_Q,
  });
  const chat = formatCoachReportChat(report);
  const figs = extractChatSpecFigures(chat);
  assert.match(figs.gvwr || "", /47,000/);
  assert.match(figs.engine || "", /Cummins L9|L9/i);
  assert.match(figs.horsepower || "", /450/);
  assert.match(figs.torque || "", /1,250|1250/);
  assert.match(figs.transmission || "", /Allison/i);
  assert.equal(chatSpecCoversPaintedFields(figs), true);

  const rows = paintChatSpecOntoRows(
    [
      { label: "Class", value: "GAP", gap: true },
      { label: "Engine", value: "GAP", gap: true },
      { label: "Horsepower", value: "GAP", gap: true },
      { label: "Torque", value: "GAP", gap: true },
      { label: "Chassis", value: "GAP", gap: true },
      { label: "Transmission", value: "GAP", gap: true },
      { label: "Fuel", value: "GAP", gap: true },
      { label: "GVWR", value: "Confirm brochure", gap: true },
      { label: "UVW", value: "GAP", gap: true },
      { label: "Fuel capacity", value: "GAP", gap: true },
    ],
    figs,
  );
  const val = (label: string) => rows.find((r) => r.label === label)?.value || "";
  const gap = (label: string) => rows.find((r) => r.label === label)?.gap;
  assert.equal(gap("GVWR"), false);
  assert.match(val("GVWR"), /47,000/);
  assert.match(val("Engine"), /L9/i);
  assert.match(val("Horsepower"), /450/);
  assert.match(val("Fuel capacity"), /150/);
  assert.equal(gap("Fuel capacity"), false);
  assert.equal(val("UVW"), "GAP", "report did not name UVW — do not invent");
  assert.equal(gap("UVW"), true);
});

test("empty / miss notes do not invent a report", () => {
  const empty = buildCoachReportFromNotes({
    notes: "",
    query: DREAM_Q,
  });
  assert.equal(formatCoachReportChat(empty), "");
  assert.equal(formatCoachReportDraftInjection(""), "");

  const miss = buildCoachReportFromNotes({
    notes: "CONFIRMED: no. Could not find a year-matched brochure.",
    query: DREAM_Q,
  });
  assert.equal(miss.figures.gvwr, undefined);
  assert.equal(miss.figures.engine, undefined);
  assert.ok(
    miss.sections.every((s) => s.heading !== "Chassis & powertrain"),
    "do not invent powertrain from the title",
  );
});

test("spec / report timeouts are chat-class 28s — not Gemini 10s / voice 4.5s", () => {
  assert.equal(SPEC_REPORT_RESEARCH_TIMEOUT_MS, 28_000);
  assert.equal(GEMINI_SPEC_REPORT_TIMEOUT_MS, 28_000);
  assert.equal(
    geminiResearchTimeoutMs("voice", "2021 American Coach American Dream 42Q spec report"),
    28_000,
  );
  assert.equal(
    geminiResearchTimeoutMs("chat", "What's the GVWR of a 2022 Tiffin Phaeton 40IH?"),
    28_000,
  );
});

test("spec / YMM report asks do not skip the Gemini Google Search sidecar", () => {
  assert.equal(skipGeminiForResearchAsk(DREAM_Q), false);
  assert.equal(
    skipGeminiForResearchAsk("What's the GVWR of a 2022 Tiffin Phaeton 40IH?"),
    false,
  );
  assert.equal(skipGeminiForResearchAsk("2026 Grand Design Lineage 31ZW"), false);
  assert.equal(
    skipGeminiForResearchAsk(
      "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
    ),
    false,
  );
});

test("prompts and research sidecars teach the four-section report", () => {
  const prompts = readFileSync(join(root, "prompts.ts"), "utf8");
  const grounding = readFileSync(join(root, "grounding.ts"), "utf8");
  const gemini = readFileSync(join(root, "geminiResearch.ts"), "utf8");
  const web = readFileSync(join(root, "webSearch.ts"), "utf8");
  const voice = readFileSync(join(root, "voice.ts"), "utf8");
  const speech = readFileSync(join(root, "speechPolicy.ts"), "utf8");
  for (const [label, text] of [
    ["prompts.ts", prompts],
    ["grounding.ts", grounding],
    ["geminiResearch.ts", gemini],
    ["webSearch.ts", web],
    ["voice.ts", voice],
    ["speechPolicy.ts", speech],
  ] as const) {
    assert.match(
      text,
      /Overview|COACH_REPORT_CHAT_RULE|coachReportResearchLengthRule|looksLikeCoachReportAsk/,
      `${label} wires the coach report shape`,
    );
  }
  assert.doesNotMatch(
    prompts,
    /Do not dump a prose spec report in chat/,
  );
  assert.doesNotMatch(
    grounding,
    /Do not dump a prose spec report in chat/,
  );
  assert.doesNotMatch(voice, /That card is the written reply/);
  assert.match(voice, /four-section report/);
});
