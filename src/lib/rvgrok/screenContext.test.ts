import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SCREEN_GUIDANCE,
  readActiveScreen,
  screenNameForTab,
  setActiveScreen,
  withActiveScreen,
} from "./screenContext.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("a screen switch is attached to the next ask, not the visible message", () => {
  setActiveScreen("Facts");
  const onFacts = {
    messages: [{ role: "user" as const, content: "what's the payment?" }],
    catalogContext: withActiveScreen("PIN GVWR 39600"),
  };
  assert.match(onFacts.catalogContext || "", /ACTIVE SCREEN: Facts/);
  assert.ok((onFacts.catalogContext || "").includes(SCREEN_GUIDANCE.Facts));

  setActiveScreen("Tow");
  const onTow = {
    messages: [{ role: "user" as const, content: "what's the payment?" }],
    catalogContext: withActiveScreen(onFacts.catalogContext),
  };

  assert.equal(onTow.messages[0].content, "what's the payment?");
  assert.doesNotMatch(onTow.messages[0].content, /ACTIVE SCREEN/);
  assert.doesNotMatch(onTow.messages[0].content, /towing capacity/);
  assert.match(onTow.catalogContext || "", /ACTIVE SCREEN: Tow/);
  assert.ok((onTow.catalogContext || "").includes(SCREEN_GUIDANCE.Tow));
  assert.match(onTow.catalogContext || "", /PIN GVWR 39600/);
  assert.doesNotMatch(onTow.catalogContext || "", /ACTIVE SCREEN: Facts/);
  assert.ok(!(onTow.catalogContext || "").includes(SCREEN_GUIDANCE.Facts));
  assert.equal((onTow.catalogContext || "").match(/ACTIVE SCREEN:/g)?.length, 1);
  setActiveScreen("");
});

test("only the active screen's guidance is attached, and each line stays short", () => {
  for (const [name, guidance] of Object.entries(SCREEN_GUIDANCE)) {
    assert.ok(guidance.length > 0 && guidance.length <= 200, name);
    assert.equal(guidance.includes("\n"), false, name);
    setActiveScreen(name);
    const ctx = withActiveScreen("PIN GVWR 39600") || "";
    assert.ok(ctx.includes(`ACTIVE SCREEN: ${name}. ${guidance}`), name);
    assert.equal(ctx.match(/ACTIVE SCREEN:/g)?.length, 1, name);
  }
  setActiveScreen("Cal");
  const onCal = withActiveScreen("PIN") || "";
  setActiveScreen("Lot");
  const onLot = withActiveScreen(onCal) || "";
  assert.ok(onLot.includes(SCREEN_GUIDANCE.Lot));
  assert.ok(!onLot.includes(SCREEN_GUIDANCE.Cal));
  setActiveScreen("");
});

test("home and the suite tabs map to screen names", () => {
  assert.equal(screenNameForTab("rvgrok", true), "Home");
  assert.equal(screenNameForTab("rvfax", false), "Facts");
  assert.equal(screenNameForTab("rvcal", false), "Cal");
  assert.equal(screenNameForTab("rvtow", false), "Tow");
  assert.equal(screenNameForTab("rvlot", false), "Lot");
  assert.equal(screenNameForTab("rvtrips", false), "RV GPS");
  assert.equal(screenNameForTab("rvgrok", false), "Grok");
  assert.equal(screenNameForTab("more", false), "Premium");
});

test("shell records the screen and chat plus Live Voice attach it", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const voice = read("./realtime.ts");

  assert.match(shell, /setActiveScreen\(screenNameForTab\(tab, homeOpen\)\)/);
  assert.doesNotMatch(
    shell.match(/setActiveScreen\(screenNameForTab\(tab, homeOpen\)\)/)?.[0] || "",
    /roomAskSend|sendMessage/,
  );
  assert.match(
    app,
    /catalogContext: withActiveScreen\(grounded\.block \|\| undefined, askedFromScreen\)/,
  );
  assert.match(app, /const askedFromScreen = readActiveScreen\(\)/);
  const mic = app.slice(app.indexOf("const handleMicPress"));
  const snap = mic.indexOf("askedFromScreenRef.current = readActiveScreen()");
  const arm = mic.indexOf("setLiveVoiceArmed(true)");
  assert.ok(snap >= 0 && arm > snap, "mic press snapshots the screen before Live Voice");
  assert.match(app, /content: messageText \|\| \(image \? "Analyze this RV photo" : ""\)/);
  assert.match(voice, /this\.screenAtAsk \|\| undefined/);
  setActiveScreen("");
});

test("a coach ask keeps the screen from before the catalog await", async () => {
  setActiveScreen("Tow");
  const askedFrom = readActiveScreen();
  await Promise.resolve();
  setActiveScreen("Grok");
  const typed = withActiveScreen("2026 Holiday Rambler Admiral 29M", askedFrom) || "";
  assert.match(typed, /ACTIVE SCREEN: Tow/);
  assert.match(typed, /towing capacity/);
  assert.doesNotMatch(typed, /ACTIVE SCREEN: Grok/);
  assert.equal(typed.match(/ACTIVE SCREEN:/g)?.length, 1);

  setActiveScreen("Tow");
  const voiceFrom = readActiveScreen();
  await Promise.resolve();
  setActiveScreen("Grok");
  const voice = withActiveScreen("PIN GVWR 39600", voiceFrom) || "";
  assert.match(voice, /ACTIVE SCREEN: Tow/);
  assert.doesNotMatch(voice, /ACTIVE SCREEN: Grok/);
  assert.equal(voice.match(/ACTIVE SCREEN:/g)?.length, 1);
  setActiveScreen("");
});
