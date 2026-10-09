import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  askPillFace,
  chatTabFace,
  planAskPillTap,
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

test("section row replaced the dock; Ask pill is not a second composer", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const more = read("../../components/more/MoreApp.tsx");

  assert.match(shell, /<RoomAskBar\s+tab=\{tab\}\s+homeOpen=\{homeOpen\}\s+onOpen=\{onTabChange\}/);
  assert.doesNotMatch(shell, /<BottomTabs/);
  assert.doesNotMatch(shell, /data-bottom-dock/);

  assert.doesNotMatch(bar, /data-room-ask-bar|data-room-ask-input|roomAskSend|placeholder="Ask"/);
  assert.doesNotMatch(bar, /<BottomTabs/);
  assert.doesNotMatch(bar, /<MoreSheet/);
  assert.doesNotMatch(bar, /ROOM_CHIPS|Rv Facts|Lot Inventory|showroom-pills/);
  const tabs = read("../../components/shell/BottomTabs.tsx");
  assert.match(tabs, /DOCK_ROOM_IDS = \["rvfax", "rvlot", "rvgrok", "more"\]/);
  assert.match(tabs, /id: "rvfax"/);
  assert.match(tabs, /id: "rvlot"/);
  assert.match(tabs, /id: "rvgrok"/);
  assert.match(tabs, /id: "more"/);
  assert.doesNotMatch(tabs, /id: "home"/);
  assert.doesNotMatch(tabs, /id: "rvcal"|id: "rvtow"|id: "rvtrips"/);
  const sheet = read("../../components/shell/MoreSheet.tsx");
  assert.match(sheet, /id: "rvtow"/);
  assert.match(sheet, /id: "rvcal"/);
  assert.match(sheet, /id: "rvtrips"/);
  assert.match(tabs, /data-dock-icons="platinum"/);
  assert.doesNotMatch(tabs, /icon-rvgrok|bottom-tab-einstein|Einstein/);
  assert.match(more, /label="RV GPS"/);
  assert.doesNotMatch(more, /title="RV GPS"/);
  assert.match(more, /title="VIN Decoder"/);
  assert.doesNotMatch(bar, /requestAnimationFrame|nextPillScroll|shouldLoopPills|PILL_LOOP/);
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

test("no pinned Ask mic on Tow; Grok room keeps voice when hidden", () => {
  const bar = read("../../components/shell/RoomAskBar.tsx");
  assert.doesNotMatch(bar, /data-room-ask-mic|roomAskMic|markAskBarGrokEntry/);

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

test("opening the chat screen does not start the assistant", () => {
  assert.equal(
    planGrokTabVoice({ alreadyOnGrok: false, voiceOpen: false }),
    "keep",
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
  assert.doesNotMatch(shell, /greetRoomVoice\(/);
  assert.match(shell, /if \(voicePlan === "stop"\) stopRoomVoice\(\)/);
  assert.match(shell, /startAssistant: true/);
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  assert.match(app, /takeChatHistory\(/);
  assert.match(app, /CHAT_IDLE_MS/);
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

test("Home's Ask RV Grok pill sits above the dock on every other screen, not Home or Chat", () => {
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const pill = read("../../components/shell/AskGrokPill.tsx");
  const css = read("../../components/shell/home-truth.css");
  // Same classes as Home's pill: copper fill in both themes.
  assert.match(pill, /theme === "dark" \? "dark-home-ask" : "light-home-ask"/);
  assert.match(pill, /data-ask-grok/);
  assert.match(pill, /Ask RV Grok/);
  assert.match(bar, /const showAsk = !homeOpen && \(tab !== "rvgrok" \|\| live\)/);
  assert.match(bar, /<AskGrokPill onOpen=\{\(\) => onOpen\("rvgrok", \{ pageScope: true, startAssistant: true \}\)\} \/>/);
  assert.doesNotMatch(bar, /<BottomTabs/);
  assert.match(css, /\.shell-ask-wrap/);
  assert.match(css, /\.light-home-ask \{[\s\S]*?background: var\(--copper-metal\)/);
  const askRule = css.match(/\.light-home-ask \{[\s\S]*?\}/)[0];
  const shadow = askRule.match(/box-shadow:[\s\S]*?!important/)[0];
  assert.match(shadow, /var\(--copper-glow\)/);
  assert.match(shadow, /var\(--copper-inset\)/);
});

test("Chat tab and Ask pill show Live while voice is on away from Chat", () => {
  assert.deepEqual(askPillFace(false), { label: "Ask RV Grok", aria: "Ask RV Grok" });
  assert.equal(askPillFace(true).label, "Live chat");
  assert.match(askPillFace(true).aria, /Tap to turn it off/);
  assert.equal(planAskPillTap(false), "open");
  assert.equal(planAskPillTap(true), "stop");
  assert.equal(chatTabFace(false, false).label, "Chat");
  assert.equal(chatTabFace(true, false).label, "Live");
  assert.match(chatTabFace(true, false).aria, /tap again to turn it off/);
  assert.equal(chatTabFace(true, true).label, "End");
  assert.match(chatTabFace(true, true).aria, /Tap to turn it off/);

  const pill = read("../../components/shell/AskGrokPill.tsx");
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const home = read("../../components/shell/HomeScreen.tsx");
  for (const src of [pill, tabs, home]) {
    assert.match(src, /useRoomVoiceOpen/);
    assert.match(src, /data-live-chat/);
  }
  assert.match(pill, /askPillFace/);
  assert.match(pill, /live-chat-dot/);
  assert.match(pill, /planAskPillTap/);
  assert.match(pill, /stopRoomVoice/);
  assert.match(pill, /Tap to turn off/);
  assert.match(tabs, /chatTabFace/);
  assert.match(tabs, /bottom-tab-live-dot/);
  assert.match(tabs, /tab === "rvgrok" && !homeOpen/);
  assert.match(home, /askPillFace/);
  assert.match(home, /AskPillLiveLabel/);
  assert.match(home, /planAskPillTap/);
  assert.match(home, /stopRoomVoice/);
  assert.match(home, /data-open-sections/);
  assert.doesNotMatch(home, /dark-home-nav/);
});
