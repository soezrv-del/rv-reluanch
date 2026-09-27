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

test("ask bar sits above the dock and does not repeat the dock rooms", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const tabs = read("../../components/shell/BottomTabs.tsx");

  assert.match(shell, /<RoomAskBar tab=\{tab\} onOpen=\{onTabChange\} \/>/);
  assert.match(shell, /<BottomTabs tab=\{tab\} onChange=\{onTabChange\} \/>/);
  assert.match(shell, /data-bottom-dock/);
  const askAt = shell.indexOf("<RoomAskBar");
  const dockAt = shell.indexOf("data-bottom-dock");
  assert.ok(askAt > 0 && dockAt > askAt, "ask bar is above the dock");

  assert.doesNotMatch(bar, /ROOM_CHIPS|data-room-chips|data-room-chip/);
  assert.doesNotMatch(bar, /Facts|Cal|Tow|Lot/);
  assert.match(bar, /roomAskMic\(\)/);
  assert.match(bar, /roomAskSend\(q\)/);
  assert.match(bar, /onOpen\("rvgrok"\)/);
  assert.match(bar, /aria-label="Start live voice"/);
  assert.match(bar, /placeholder="Ask about this coach"/);
  assert.match(bar, /data-quick-ask=\{q\}/);

  assert.match(tabs, /grid-cols-6/);
  assert.match(tabs, /id: "rvtrips", label: "RV GPS"/);
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
