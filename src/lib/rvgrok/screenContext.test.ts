import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
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

  setActiveScreen("Tow");
  const onTow = {
    messages: [{ role: "user" as const, content: "what's the payment?" }],
    catalogContext: withActiveScreen(onFacts.catalogContext),
  };

  assert.equal(onTow.messages[0].content, "what's the payment?");
  assert.doesNotMatch(onTow.messages[0].content, /ACTIVE SCREEN/);
  assert.match(onTow.catalogContext || "", /ACTIVE SCREEN: Tow/);
  assert.match(onTow.catalogContext || "", /PIN GVWR 39600/);
  assert.doesNotMatch(onTow.catalogContext || "", /ACTIVE SCREEN: Facts/);
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
  assert.match(app, /catalogContext: withActiveScreen\(grounded\.block \|\| undefined\)/);
  assert.match(app, /content: messageText \|\| \(image \? "Analyze this RV photo" : ""\)/);
  assert.match(voice, /withActiveScreen\(catalogContext \?\? this\.catalogContext\)/);
  setActiveScreen("");
});
