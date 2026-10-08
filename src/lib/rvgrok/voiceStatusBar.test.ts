import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  voiceBarCanInterrupt,
  voiceStatusBarView,
  voiceStatusPillLabel,
  voiceControlActive,
  type VoiceBarInput,
} from "./voiceStatusBar.ts";

const root = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const live = (
  realtimeStatus: VoiceBarInput["realtimeStatus"],
  realtimeDetail: string | null,
): VoiceBarInput => ({
  realtimeStatus,
  realtimeDetail,
  liveActive: true,
  isRecording: false,
  isLoading: false,
  streaming: false,
  speaking: false,
  continuousArmed: true,
  voiceMode: false,
  voiceName: "Eve",
});

const idle: VoiceBarInput = {
  ...live("idle", null),
  liveActive: false,
  continuousArmed: false,
};

test("mic open, waiting: Eve's listening to you", () => {
  for (const detail of [
    "Listening — speak anytime, like Grok Voice",
    "Listening continuously — your turn",
    "Interrupted — listening… speak or 📷",
    null,
  ]) {
    const v = voiceStatusBarView(live("listening", detail));
    assert.equal(v?.text, "Eve's listening to you");
    assert.equal(v?.phase, "listening");
    assert.equal(v?.canInterrupt, false);
    assert.equal(v?.endLabel, "End");
  }
});

test("speech detected: Eve hears you", () => {
  const v = voiceStatusBarView(live("listening", "Hearing you…"));
  assert.equal(v?.text, "Eve hears you");
  assert.equal(v?.phase, "hears");
  assert.equal(v?.canInterrupt, false);
});

test("waiting on the reply or tools: Eve's thinking, with a work line when there is one", () => {
  for (const generic of ["Processing…", "Grok is responding…", "Answering…"]) {
    const v = voiceStatusBarView(live("thinking", generic));
    assert.equal(v?.text, "Eve's thinking");
    assert.equal(v?.detail, null);
  }
  const lot = voiceStatusBarView(live("thinking", "Checking the lot…"));
  assert.equal(lot?.text, "Eve's thinking");
  assert.equal(lot?.detail, "Checking the lot…");
  assert.equal(voiceStatusBarView(live("thinking", "Researching…"))?.detail, "Researching…");
  assert.equal(lot?.canInterrupt, false);
});

test("TTS playing: Eve's speaking, with Interrupt and End", () => {
  for (const detail of ["RvGrok speaking…", "Finishing reply…"]) {
    const v = voiceStatusBarView(live("speaking", detail));
    assert.equal(v?.text, "Eve's speaking");
    assert.equal(v?.phase, "speaking");
    assert.equal(v?.canInterrupt, true);
    assert.equal(v?.endLabel, "End");
  }
});

test("Interrupt shows exactly when the old CUT bar did", () => {
  assert.equal(voiceBarCanInterrupt(live("speaking", null)), true);
  assert.equal(voiceBarCanInterrupt(live("thinking", "Finishing reply…")), true);
  assert.equal(voiceBarCanInterrupt(live("listening", "Hearing you…")), false);
  assert.equal(
    voiceBarCanInterrupt({ ...live("speaking", "RvGrok speaking…"), liveActive: false }),
    false,
  );
});

test("names the selected voice; Eve by default", () => {
  assert.equal(
    voiceStatusBarView({ ...live("speaking", null), voiceName: undefined })?.text,
    "Eve's speaking",
  );
  assert.equal(
    voiceStatusBarView({ ...live("listening", null), voiceName: "Ara" })?.text,
    "Ara's listening to you",
  );
});

test("hidden when the old STOP bar was hidden; still covers typed reply, push-to-talk and read-aloud", () => {
  assert.equal(voiceStatusBarView(idle), null);
  assert.deepEqual(
    [voiceStatusBarView({ ...idle, isLoading: true })?.text, voiceStatusBarView({ ...idle, isLoading: true })?.endLabel],
    ["Eve's thinking", "Cancel"],
  );
  assert.equal(voiceStatusBarView({ ...idle, streaming: true })?.endLabel, "Cancel");
  assert.equal(voiceStatusBarView({ ...idle, isRecording: true })?.text, "Eve's listening to you");
  assert.equal(voiceStatusBarView({ ...idle, isRecording: true })?.endLabel, "Stop");
  assert.equal(voiceStatusBarView({ ...idle, speaking: true })?.text, "Eve's speaking");
  for (const v of [
    voiceStatusBarView({ ...idle, isLoading: true }),
    voiceStatusBarView({ ...idle, isRecording: true }),
    voiceStatusBarView({ ...idle, speaking: true }),
  ]) {
    assert.equal(v?.canInterrupt, false);
  }
});

test("the mic slot uses one short label from the same phase", () => {
  assert.equal(voiceStatusPillLabel("listening"), "Listening");
  assert.equal(voiceStatusPillLabel("recording"), "Listening");
  assert.equal(voiceStatusPillLabel("hears"), "Hearing");
  assert.equal(voiceStatusPillLabel("thinking"), "Thinking");
  assert.equal(voiceStatusPillLabel("connecting"), "Thinking");
  assert.equal(voiceStatusPillLabel("speaking"), "Talking");
  const speaking = voiceStatusBarView(live("speaking", "RvGrok speaking…"));
  assert.equal(voiceStatusPillLabel(speaking!.phase), "Talking");
  const hears = voiceStatusBarView(live("listening", "Hearing you…"));
  assert.equal(voiceStatusPillLabel(hears!.phase), "Hearing");
});

test("the status pill lives in the composer and the old bar is gone", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const composer = read("../../components/rvgrok/GrokComposer.tsx");
  const css = read("../../styles.css");
  const rootRoute = read("../../routes/__root.tsx");
  assert.doesNotMatch(app, /VoiceStatusBar/);
  assert.doesNotMatch(app, /data-voice-status-bar/);
  assert.doesNotMatch(rootRoute, /voiceBarCss/);
  assert.match(
    app,
    /onInterrupt=\{\(\) => \{\s*realtimeRef\.current\?\.interrupt\(\);\s*\}\}/,
  );
  assert.match(app, /voice=\{voiceBar\}/);
  assert.match(composer, /data-rvgrok-voice-pill/);
  assert.match(composer, /data-rvgrok-voice-stop/);
  assert.match(composer, /voice\.endLabel/);
  assert.match(app, /onStop=\{handleStop\}/);
  assert.match(composer, /voiceStatusPillLabel\(voice\.phase\)/);
  assert.match(composer, /data-rvgrok-mic/);
  const pillStart = composer.indexOf("grok-composer-pill");
  const sendStart = composer.indexOf("grok-send-btn");
  const slot = composer.slice(pillStart, sendStart);
  assert.match(slot, /data-rvgrok-voice-pill/);
  assert.match(slot, /data-rvgrok-mic/);
  assert.match(css, /\.grok-voice-slot \{[^}]*height:\s*var\(--btn-icon\)/);
  assert.match(css, /\.grok-voice-slot \{[^}]*width:\s*var\(--btn-icon\)/);
  assert.match(css, /\.grok-voice-slot\.is-status \{[^}]*width:\s*7\.25rem/);
  assert.match(css, /\.grok-status-pill \{[^}]*height:\s*100%/);
  assert.match(css, /html\[data-theme="light"\] \.grok-status-pill \{[^}]*background:\s*#171a20/);
  assert.doesNotMatch(css, /\.voice-status-bar \{/);
});

test("the pill still interrupts, and the adjacent stop calls handleStop", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const composer = read("../../components/rvgrok/GrokComposer.tsx");
  assert.match(
    app,
    /onInterrupt=\{\(\) => \{\s*realtimeRef\.current\?\.interrupt\(\);\s*\}\}/,
  );
  assert.match(composer, /onClick=\{onInterrupt\}/);
  assert.match(composer, /data-rvgrok-voice-stop/);
  assert.match(composer, /onClick=\{onStop\}/);
  assert.match(app, /onStop=\{handleStop\}/);
  assert.match(app, /end: \(\) => handleStopRef\.current\(\)/);
});

test("a floating control on non-chat screens uses the same labels and handlers", () => {
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const float = read("../../components/shell/SuiteVoiceFloat.tsx");
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  assert.equal(voiceControlActive(null), false);
  assert.equal(voiceControlActive(voiceStatusBarView(live("listening", null))), true);
  assert.equal(
    voiceStatusPillLabel(voiceStatusBarView(live("speaking", "RvGrok speaking…"))!.phase),
    "Talking",
  );
  assert.match(bar, /const showVoice = homeOpen \|\| tab !== "rvgrok"/);
  assert.match(bar, /\{showVoice \? <SuiteVoiceFloat \/> : null\}/);
  assert.match(float, /voiceStatusPillLabel\(voice\.phase\)/);
  assert.match(float, /Listening|voiceStatusPillLabel/);
  assert.match(float, /data-suite-voice-pill/);
  assert.match(float, /data-suite-voice-mic/);
  assert.match(float, /roomVoiceInterrupt\(\)/);
  assert.match(float, /roomVoiceEnd\(\)/);
  assert.match(float, /roomAskMic\(\)/);
  assert.match(app, /publishVoiceBar\(voiceBar\)/);
  assert.match(
    app,
    /interrupt: \(\) => \{\s*realtimeRef\.current\?\.interrupt\(\);\s*\}/,
  );
});

test("the Chat dock tab reads Chatting while voice is up", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const dock = read("../../components/shell/dock.css");
  assert.match(tabs, /voiceControlActive\(voice\)/);
  assert.match(tabs, /const chatting = id === "rvgrok" && voiceOn/);
  assert.match(tabs, /data-chatting=\{chatting \? "" : undefined\}/);
  assert.match(tabs, /chatting \? "Chatting" : short/);
  assert.match(tabs, /chatting && "is-chatting"/);
  assert.match(tabs, /short: "Chat"/);
  assert.match(dock, /\.is-chatting:not\(\.is-active\)/);
});
