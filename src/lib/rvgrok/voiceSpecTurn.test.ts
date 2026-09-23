import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCoachIdentity } from "./coachIdentity.ts";
import { resolveDeskSheet, type DeskSheetPayload } from "./deskSheet.ts";
import {
  formatVoiceSpecEngineSpeech,
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
  assert.doesNotMatch(realtime, /[Dd]ialaBot/);
  assert.doesNotMatch(readFileSync(join(root, "voiceSpecTurn.ts"), "utf8"), /[Gg]emini/);
  assert.doesNotMatch(readFileSync(join(root, "grokExtras.ts"), "utf8"), /[Gg]emini/);
});
