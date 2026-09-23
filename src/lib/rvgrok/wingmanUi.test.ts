import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Grok tab landing is Lot wingman on Raidho — no family camping plate", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const landing = read("../../components/rvgrok/GrokLanding.tsx");
  const composer = read("../../components/rvgrok/GrokComposer.tsx");
  const avatar = read("../../components/rvgrok/GrokAvatar.tsx");
  const css = read("../../styles.css");
  const suite = read("../../components/shell/SuitePage.tsx");

  assert.match(app, /data-rvgrok-wingman=""/);
  assert.match(app, /<SuiteRaidhoBackdrop className="grok-raidho-field" \/>/);
  assert.doesNotMatch(app, /SuiteRaidhoBackdrop bleed/);
  assert.doesNotMatch(app, /ScrollSuiteHeader/);
  assert.doesNotMatch(app, /SuiteBackdrop/);
  assert.doesNotMatch(app, /SHARED_PRESTIGE_BACKDROP|shared-prestige|hero-camp|family camping/i);
  assert.match(suite, /export function SuiteRaidhoBackdrop/);

  assert.match(landing, /I'm RvGrok/);
  assert.match(landing, /data-rvgrok-welcome/);
  assert.match(app, /welcomeBackLine/);
  assert.match(app, /visitorFirstName/);
  assert.doesNotMatch(landing, /ask me anything/);
  assert.doesNotMatch(landing, /Name the year, make, and model/);
  assert.match(landing, /READY/);
  assert.match(landing, /data-rvgrok-landing/);
  assert.match(landing, /data-rvgrok-status/);
  assert.match(landing, /ON THE LOT/);
  assert.match(composer, /data-rvgrok-mic/);
  assert.match(composer, /Start live voice/);
  assert.match(avatar, /icon-rvgrok\.png/);

  assert.match(css, /\[data-rvgrok-wingman\]/);
  assert.match(css, /\[data-rvgrok-wingman\] \.suite-raidho-mark/);
  assert.match(css, /\[data-rvgrok-wingman\] \.suite-raidho-field/);
  assert.match(css, /BACKGROUND field behind frost/);
  assert.match(css, /\[data-rvgrok-wingman\] \.sapphire-header \{[\s\S]*?display:\s*none/);
  assert.match(
    css,
    /\[data-rvgrok-landing\] \{[\s\S]*?padding-top:\s*max\(0\.5rem,\s*env\(safe-area-inset-top/,
  );
  assert.match(
    css,
    /@media \(max-width: 639px\) \{[\s\S]*?\[data-rvgrok-landing\] \{[\s\S]*?padding-top:\s*max\(3\.25rem,\s*env\(safe-area-inset-top/,
  );
  assert.match(css, /\.grok-frost \{[\s\S]*?blur\(28px\)/);
  assert.match(css, /--color-grok-mic:\s*#e8893a/);
  assert.match(css, /--font-display:\s*"Fraunces"/);
  assert.match(css, /html\.kb-open \[data-rvgrok-composer\]/);
  assert.doesNotMatch(css, /hero-camp|family camping|campfire photo/i);
});

test("Live Voice entry and catalog desk resolve stay wired", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const sheet = read("../../components/rvgrok/DeskSpecSheet.tsx");

  assert.match(app, /handleMicPress/);
  assert.match(app, /setLiveVoiceArmed\(true\)/);
  assert.match(app, /beginLiveVoiceFromUserGesture/);
  assert.match(app, /GrokRealtimeSession/);
  assert.match(app, /buildChatGrounding/);
  assert.match(app, /buildVoiceGrounding/);
  assert.match(app, /resolveDeskSheet/);
  assert.match(app, /onDeskSheet/);
  assert.match(app, /liveDeskSheet/);
  assert.match(sheet, /data-rvgrok-desk-sheet/);
  assert.match(sheet, /Spec report/);
  assert.match(app, /GROK_STARTERS/);
  assert.match(app, /Match me to a coach/);
  assert.match(app, /Troubleshoot my RV/);
  assert.doesNotMatch(
    app,
    /2019 Grand Design Solitude 310GK/,
    "cold-open chips must not promo a specific coach",
  );
  assert.match(app, /lotChip=\{null\}/);
  assert.match(app, /deskRevealAfterIndex/);
  assert.match(app, /data-rvgrok-desk-after-reply/);
  assert.doesNotMatch(app, /reportSheet && m\.deskSheet/);
});

test("Grok wingman does not touch DialaBot, Facts, Tow, or Lot stock", () => {
  const dir = join(root, "../../components/rvgrok");
  for (const name of readdirSync(dir)) {
    const src = readFileSync(join(dir, name), "utf8");
    assert.doesNotMatch(src, /DialaBot|dialabot/i, `${name} must not mention DialaBot`);
    assert.doesNotMatch(src, /LotStockApp|fetchLotSnapshot/);
  }
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const lot = read("../../components/lot/LotStockApp.tsx");
  assert.match(fax, /SuiteRaidhoBackdrop/);
  assert.match(tow, /raidhoOnly/);
  assert.match(lot, /lot-stock-screen/);
});
