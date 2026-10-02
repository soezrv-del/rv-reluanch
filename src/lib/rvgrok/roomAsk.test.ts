import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  planGrokTabVoice,
  publishRoomVoice,
  registerRoomAsk,
  roomAskMic,
  roomAskSend,
  roomVoicePhaseFromStatus,
  subscribeRoomVoice,
} from "./roomAsk.ts";
import { readActiveScreen, setActiveScreen } from "./screenContext.ts";

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

  assert.match(bar, /Ask RV Grok/);
  assert.match(bar, /<BottomTabs/);
  assert.match(bar, /onChange=\{\(id\) => onOpen\(id\)\}/);
  assert.doesNotMatch(bar, /ROOM_CHIPS|Rv Facts|Lot Inventory|showroom-pills/);
  const askAt = bar.indexOf("data-room-ask-bar");
  const dockAt = bar.indexOf("<BottomTabs");
  assert.ok(askAt !== -1 && dockAt > askAt, "ask bar sits above the icon dock");
  const tabs = read("../../components/shell/BottomTabs.tsx");
  assert.match(tabs, /id: "rvfax"/);
  assert.match(tabs, /id: "rvcal"/);
  assert.match(tabs, /id: "rvgrok"/);
  assert.match(tabs, /id: "rvtow"/);
  assert.match(tabs, /id: "rvtrips"/);
  assert.match(tabs, /id: "rvlot"/);
  assert.match(tabs, /data-dock-icons="gold"/);
  assert.doesNotMatch(tabs, /icon-rvgrok|bottom-tab-einstein|Einstein/);
  const grok = read("../../components/rvgrok/RvGrokApp.tsx");
  const landing = read("../../components/rvgrok/GrokLanding.tsx");
  assert.match(grok, /starters=\{\[\]\}/);
  assert.doesNotMatch(grok, /starters=\{GROK_STARTERS\}/);
  assert.match(landing, /starters\.length > 0/);
  assert.match(bar, /roomAskMic\(\)/);
  assert.match(bar, /roomAskSend\(q\)/);
  assert.match(bar, /onOpen\("rvgrok", \{ skipVoice: true \}\)/);
  assert.match(bar, /"Start live voice"/);
  assert.match(bar, /const hidePinnedAsk = !homeOpen && tab === "rvgrok"/);
  assert.match(bar, /hidePinnedAsk \? null/);
  assert.match(more, /label="RV GPS"/);
  assert.doesNotMatch(more, /title="RV GPS"/);
  assert.match(more, /title="VIN Decoder"/);
  assert.match(bar, /onOpen\("rvgrok", \{ skipVoice: true \}\)/);
  assert.doesNotMatch(bar, /requestAnimationFrame|nextPillScroll|shouldLoopPills|PILL_LOOP/);
  assert.doesNotMatch(bar, /aria-hidden="true"/);
  const ask = read("./roomAsk.ts");
  assert.doesNotMatch(ask, /nextPillScroll|shouldLoopPills|PILL_LOOP|nextSeamlessScroll/);
});

test("top-of-page Live chip is gone; in-content Ask Grok stays", () => {
  const constants = read("../../components/shell/shellConstants.ts");
  const brand = read("../../components/shell/SuiteBrand.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const detail = read("../../components/rvfax/RvDetail.tsx");
  const header = read("../../components/shell/SapphireHeader.tsx");

  assert.doesNotMatch(constants, /badge:\s*"LIVE"/);
  assert.doesNotMatch(brand, /Grok|Live Voice/);
  assert.doesNotMatch(shell, /Live Voice|Ask Grok button|>Grok</);
  assert.doesNotMatch(header, /Live Voice|Ask Grok|>Grok</);
  const factsTop = fax.slice(
    fax.indexOf("data-facts-landing"),
    fax.indexOf("Know before you buy"),
  );
  assert.ok(factsTop.length > 0, "facts landing header slice");
  assert.doesNotMatch(factsTop, /Grok|Live Voice|Ask Grok|>LIVE</);
  assert.match(detail, /Ask Grok/);
  assert.match(fax, />\s*RvGrok\s*</);
});

test("mic press on Tow does not open Grok and does call the bridge mic", () => {
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const mic = bar.match(/data-room-ask-mic[\s\S]*?<\/button>/)?.[0] ?? "";
  assert.match(mic, /roomAskMic\(\)/);
  assert.doesNotMatch(mic, /onOpen\(/);
  assert.doesNotMatch(mic, /markAskBarGrokEntry/);
  assert.match(bar, /markAskBarGrokEntry\(\);\s*onOpen\("rvgrok", \{ skipVoice: true \}\)/);

  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const hidden = app.match(/if \(!active\) return;[\s\S]{0,500}/)?.[0] ?? "";
  assert.match(hidden, /if \(!active\) return;/);
  assert.doesNotMatch(hidden, /stopLiveSession/);
  assert.match(app, /publishRoomVoice\(roomVoicePhaseFromStatus\(realtimeStatus\)\)/);

  setActiveScreen("Tow");
  let mics = 0;
  registerRoomAsk({
    send: () => {
      throw new Error("send");
    },
    mic: () => {
      mics += 1;
    },
  });
  assert.equal(roomAskMic(), true);
  assert.equal(mics, 1);
  assert.equal(readActiveScreen(), "Tow");
  registerRoomAsk(null);
  setActiveScreen("");
});

test("opening RV Grok says hello only when she is not already on", () => {
  assert.equal(
    planGrokTabVoice({ alreadyOnGrok: false, voiceOpen: false }),
    "greet",
  );
  assert.equal(
    planGrokTabVoice({ alreadyOnGrok: false, voiceOpen: true }),
    "keep",
  );
  assert.equal(
    planGrokTabVoice({ alreadyOnGrok: true, voiceOpen: true }),
    "stop",
  );
  assert.equal(
    planGrokTabVoice({ alreadyOnGrok: true, voiceOpen: false }),
    "keep",
  );
  assert.equal(
    planGrokTabVoice({
      alreadyOnGrok: false,
      voiceOpen: false,
      skipVoice: true,
    }),
    "keep",
  );
  const shell = read("../../components/shell/AppShell.tsx");
  assert.match(shell, /planGrokTabVoice\(/);
  assert.match(shell, /greetRoomVoice\(beginLiveVoiceFromUserGesture\(\)\)/);
  assert.match(shell, /if \(voicePlan === "stop"\) stopRoomVoice\(\)/);
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  assert.match(app, /takePendingGrokGreeting\(\)/);
  assert.match(app, /stop: \(\) => stopLiveFromTabRef\.current\(\)/);
});

test("ask bar voice phase follows the live session", () => {
  assert.equal(roomVoicePhaseFromStatus("connecting"), "listening");
  assert.equal(roomVoicePhaseFromStatus("listening"), "listening");
  assert.equal(roomVoicePhaseFromStatus("thinking"), "listening");
  assert.equal(roomVoicePhaseFromStatus("speaking"), "speaking");
  assert.equal(roomVoicePhaseFromStatus("idle"), "idle");
  const seen: string[] = [];
  const off = subscribeRoomVoice((phase) => seen.push(phase));
  publishRoomVoice("listening");
  publishRoomVoice("speaking");
  off();
  publishRoomVoice("idle");
  assert.deepEqual(seen, ["idle", "listening", "speaking"]);
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

test("Premium menu reaches RV GPS once, from the activity tile", () => {
  const more = read("../../components/more/MoreApp.tsx");
  const trips = more.match(/onNavigate\?\.\("rvtrips"\)/g) || [];
  assert.equal(trips.length, 1);
  assert.match(
    more,
    /label="RV GPS"[\s\S]*?onClick=\{\(\) => onNavigate\?\.\("rvtrips"\)\}/,
  );
  assert.doesNotMatch(more, /title="RV GPS"/);
  assert.match(more, /title="VIN Decoder"/);
  assert.match(more, /title="RvGrok Voice Settings"/);
  assert.doesNotMatch(more, /onNavigate\?\.\("rvlot"\)/);
});
