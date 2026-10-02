import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { screenCalloutLine, screenGuideFor } from "./screenGuides.ts";
import {
  isRoutedChatScreen,
  markAskBarGrokEntry,
  onActiveScreenChange,
  onRouteChange,
  readActiveScreen,
  routeScreenChatNote,
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
  assert.ok((onFacts.catalogContext || "").includes(screenGuideFor("Facts") || ""));

  setActiveScreen("Tow");
  const onTow = {
    messages: [{ role: "user" as const, content: "what's the payment?" }],
    catalogContext: withActiveScreen(onFacts.catalogContext),
  };

  assert.equal(onTow.messages[0].content, "what's the payment?");
  assert.doesNotMatch(onTow.messages[0].content, /ACTIVE SCREEN/);
  assert.doesNotMatch(onTow.messages[0].content, /towing capacity/);
  assert.match(onTow.catalogContext || "", /ACTIVE SCREEN: Tow/);
  assert.ok((onTow.catalogContext || "").includes(screenGuideFor("Tow") || ""));
  assert.match(onTow.catalogContext || "", /PIN GVWR 39600/);
  assert.doesNotMatch(onTow.catalogContext || "", /ACTIVE SCREEN: Facts/);
  assert.ok(!(onTow.catalogContext || "").includes("DID YOU MEAN?"));
  assert.equal((onTow.catalogContext || "").match(/ACTIVE SCREEN:/g)?.length, 1);
  setActiveScreen("");
});

test("only the active screen's guide is attached", () => {
  for (const name of ["Home", "Facts", "Cal", "Tow", "Lot", "RV GPS", "Grok", "Premium", "Sold"]) {
    const guidance = screenGuideFor(name) || "";
    assert.ok(guidance.length > 80, name);
    setActiveScreen(name);
    const ctx = withActiveScreen("PIN GVWR 39600") || "";
    assert.match(ctx, new RegExp(`ACTIVE SCREEN: ${name}\\.`), name);
    assert.ok(ctx.includes(guidance), name);
    assert.equal(ctx.match(/ACTIVE SCREEN:/g)?.length, 1, name);
    assert.equal(ctx.match(/SCREEN CONTEXT START/g)?.length, 1, name);
  }
  setActiveScreen("Cal");
  const onCal = withActiveScreen("PIN") || "";
  setActiveScreen("Lot");
  const onLot = withActiveScreen(onCal) || "";
  assert.ok(onLot.includes(screenGuideFor("Lot") || ""));
  assert.ok(!onLot.includes("TARGET /MO"));
  setActiveScreen("");
});

test("home and the suite tabs map to screen names", () => {
  assert.equal(screenNameForTab("rvgrok", true), "Home");
  assert.equal(screenNameForTab("rvfax", false), "Facts");
  assert.equal(screenNameForTab("rvcal", false), "CAL");
  assert.equal(screenNameForTab("rvtow", false), "TOW");
  assert.equal(screenNameForTab("rvlot", false), "LOT");
  assert.equal(screenNameForTab("rvtrips", false), "RV GPS");
  assert.equal(screenNameForTab("rvgrok", false), "Grok");
  assert.equal(screenNameForTab("more", false), "Premium");
});

test("shell records the screen and chat plus Live Voice attach it", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const voice = read("./realtime.ts");

  assert.match(shell, /onRouteChange\(tab, homeOpen\)/);
  assert.match(
    read("./screenContext.ts"),
    /setActiveScreen\(screenNameForTab\(tab, homeOpen\)\)/,
  );
  assert.doesNotMatch(
    shell.match(/onRouteChange\(tab, homeOpen\)/)?.[0] || "",
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
  assert.match(typed, /RV GVWR \(lbs\)/);
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

test("a chip change during Live Voice updates the screen, and the ask bar opening Grok does not", () => {
  const seen: string[] = [];
  const off = onActiveScreenChange((name) => seen.push(name));
  setActiveScreen("Tow");
  assert.deepEqual(seen, ["Tow"]);

  markAskBarGrokEntry();
  setActiveScreen("Grok");
  assert.equal(readActiveScreen(), "Grok");
  assert.deepEqual(seen, ["Tow"]);

  setActiveScreen("Cal");
  assert.deepEqual(seen, ["Tow", "Cal"]);
  const ctx = withActiveScreen(withActiveScreen("PIN", "Tow"), "Cal") || "";
  assert.match(ctx, /ACTIVE SCREEN: Cal/);
  assert.match(ctx, /TARGET \/MO/);
  assert.doesNotMatch(ctx, /ACTIVE SCREEN: Tow/);
  assert.doesNotMatch(ctx, /ACTIVE SCREEN: Grok/);
  assert.equal(ctx.match(/ACTIVE SCREEN:/g)?.length, 1);

  const voice = read("./realtime.ts");
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const listener = voice.slice(
    voice.indexOf("onActiveScreenChange((name) => {"),
    voice.indexOf("this.facts = opts?.facts"),
  );
  assert.match(voice, /onActiveScreenChange\(\(name\) => \{/);
  assert.equal((voice.match(/onActiveScreenChange\(/g) || []).length, 1);
  assert.match(voice, /this\.screenAtAsk = name/);
  assert.match(listener, /sendRouteScreenItem\(name\)/);
  assert.ok(
    listener.indexOf("sendRouteScreenItem(name)") <
      listener.indexOf("this.sendSessionUpdate()"),
    "screen name is in the thread before the session update",
  );
  assert.ok(
    listener.indexOf("this.sendSessionUpdate()") <
      listener.indexOf('type: "navigate"'),
    "session update is queued before the spoken callout",
  );
  const start = voice.slice(voice.indexOf("ws.binaryType"), voice.indexOf("if (this.catalogContext)"));
  assert.ok(
    start.indexOf("sendRouteScreenItem") < start.indexOf("sendSessionUpdate"),
    "opening a session pushes the screen before the intro reply",
  );
  assert.match(voice, /type: "navigate"/);
  assert.match(voice, /type: "user-start"/);
  assert.match(voice, /type: "reply-done"/);
  assert.match(bar, /markAskBarGrokEntry\(\);\s*onOpen\("rvgrok", \{ skipVoice: true \}\)/);
  off();
  setActiveScreen("");
});

test("route changes to Facts, CAL, TOW, and LOT push that name before the next reply", () => {
  const seen: string[] = [];
  const off = onActiveScreenChange((name) => seen.push(name));

  onRouteChange("rvfax", false);
  onRouteChange("rvcal", false);
  onRouteChange("rvtow", false);
  onRouteChange("rvlot", false);
  assert.deepEqual(seen, ["Facts", "CAL", "TOW", "LOT"]);

  const rooms: Array<[string, string, RegExp]> = [
    ["rvfax", "Facts", /DID YOU MEAN\?/],
    ["rvcal", "Cal", /TARGET \/MO/],
    ["rvtow", "Tow", /RV GVWR \(lbs\)/],
    ["rvlot", "Lot", /FEATURED REPORT/],
  ];
  for (const [tab, guide, cue] of rooms) {
    onRouteChange(tab, false);
    const name = readActiveScreen();
    assert.equal(isRoutedChatScreen(name), true, name);
    const ctx = withActiveScreen("PIN GVWR 39600") || "";
    assert.match(ctx, new RegExp(`ACTIVE SCREEN: ${name}\\.`), name);
    assert.match(ctx, new RegExp(`Spoken name: ${screenGuideSpoken(guide)}`), name);
    assert.ok(ctx.includes(screenGuideFor(guide) || ""), name);
    assert.match(ctx, cue, name);
    assert.equal(ctx.match(/ACTIVE SCREEN:/g)?.length, 1, name);
    const note = routeScreenChatNote(name);
    assert.match(note, new RegExp(`ACTIVE SCREEN: ${name}\\.`));
    assert.match(note, /Do not answer this note/);
    assert.doesNotMatch(note, /What's up\?/);
    const spoken = screenCalloutLine(name) || "";
    assert.match(spoken, new RegExp(`^${screenGuideSpoken(guide).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.`));
  }

  onRouteChange("rvgrok", true);
  assert.equal(readActiveScreen(), "Home");
  assert.equal(isRoutedChatScreen("Home"), false);
  assert.equal(isRoutedChatScreen("Grok"), false);

  const bar = read("../../components/shell/RoomAskBar.tsx");
  const chips = bar.match(/const ROOM_CHIPS[\s\S]*?\];/)?.[0] ?? "";
  assert.match(chips, /label: "Rv Facts"/);
  assert.match(chips, /label: "Calculator"/);
  assert.match(chips, /label: "Tow Guide"/);
  assert.match(chips, /label: "Lot Inventory"/);
  assert.doesNotMatch(chips, /label: "CAL"|label: "TOW"|label: "LOT"|label: "facts"/);

  off();
  setActiveScreen("");
});

function screenGuideSpoken(guide: string): string {
  if (guide === "Facts") return "Rv Facts";
  if (guide === "Cal") return "Calculator";
  if (guide === "Tow") return "Tow Guide";
  if (guide === "Lot") return "Lot Inventory";
  return guide;
}
