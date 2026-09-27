import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerRoomAsk, roomAskMic, roomAskSend } from "./roomAsk.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("room ask bridge calls the registered Grok handlers", () => {
  const sent: string[] = [];
  let mics = 0;
  registerRoomAsk({
    send: (text) => sent.push(text),
    mic: () => {
      mics += 1;
    },
  });
  assert.equal(roomAskSend("  hello  "), true);
  assert.deepEqual(sent, ["hello"]);
  assert.equal(roomAskSend("   "), false);
  assert.equal(roomAskMic(), true);
  assert.equal(mics, 1);
  registerRoomAsk(null);
  assert.equal(roomAskSend("later"), false);
  assert.equal(roomAskMic(), false);
});

test("room tabs sit above the ask bar and the old dock is not mounted", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const more = read("../../components/more/MoreApp.tsx");

  assert.match(
    shell,
    /<RoomAskBar tab=\{tab\} homeOpen=\{homeOpen\} onOpen=\{onTabChange\} \/>/,
  );
  assert.doesNotMatch(shell, /<BottomTabs/);
  assert.doesNotMatch(shell, /data-bottom-dock/);

  const chips = bar.match(/const ROOM_CHIPS[\s\S]*?\];/)?.[0] ?? "";
  assert.match(
    chips,
    /id: "rvfax", label: "Rv Facts"[\s\S]*id: "rvcal", label: "Calculator"[\s\S]*id: "rvtow", label: "Tow Guide"[\s\S]*id: "rvlot", label: "Lot Inventory"/,
  );
  assert.equal((chips.match(/id: "/g) || []).length, 4);
  assert.doesNotMatch(chips, /rvtrips|RV GPS|Tanks|Payment|Diesels|36-foot/);
  const grok = read("../../components/rvgrok/RvGrokApp.tsx");
  const landing = read("../../components/rvgrok/GrokLanding.tsx");
  assert.match(grok, /starters=\{\[\]\}/);
  assert.doesNotMatch(grok, /starters=\{GROK_STARTERS\}/);
  assert.match(landing, /starters\.length > 0/);
  assert.match(bar, /!homeOpen && tab === chip\.id/);
  assert.match(bar, /min-h-11/);
  assert.match(bar, /onOpen\("rvfax"\)/);
  assert.match(bar, /onOpen\("rvcal"\)/);
  assert.match(bar, /onOpen\("rvtow"\)/);
  assert.match(bar, /onOpen\("rvlot"\)/);
  assert.match(bar, /openRoom\(chip\.id\)/);
  assert.match(bar, /roomAskMic\(\)/);
  assert.match(bar, /roomAskSend\(q\)/);
  assert.match(bar, /onOpen\("rvgrok"\)/);
  assert.match(bar, /aria-label="Start live voice"/);
  assert.match(more, /title="RV GPS"/);
});

test("typed asks and the mic use the mounted RV Grok chat", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  assert.match(app, /registerRoomAsk\(\{/);
  assert.match(app, /sendMessageRef\.current\(text\)/);
  assert.match(app, /roomMicRef\.current\(\)/);
  assert.match(app, /if \(!active\) return/);
  assert.doesNotMatch(app, /if \(!active\) \{\s*startNewChat\(\)/);
  assert.match(app, /if \(plan\.resetVisibleChat\) startNewChat\(\)/);
  assert.match(app, /sendMessageRef\.current\(seed\)/);
});

test("Premium menu lists RV GPS with the other suite tools", () => {
  const more = read("../../components/more/MoreApp.tsx");
  assert.match(more, /title="RV GPS"/);
  assert.match(more, /onClick=\{\(\) => onNavigate\?\.\("rvtrips"\)\}/);
  assert.match(more, /title="RvGrok Voice Settings"/);
  assert.doesNotMatch(more, /onNavigate\?\.\("rvlot"\)/);
});
