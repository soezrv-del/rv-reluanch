import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  voiceBarCanInterrupt,
  voiceStatusBarView,
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

test("RvGrokApp renders one status bar wired to the existing handlers", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  // The three stacked bars are gone.
  assert.doesNotMatch(app, /Interrupt — stop her, keep listening/);
  assert.doesNotMatch(app, /Live continuous ·/);
  assert.doesNotMatch(app, /Live Grok Voice ·/);
  assert.doesNotMatch(app, />\s*CUT\s*</);
  assert.doesNotMatch(app, />\s*STOP\s*</);
  assert.equal(app.match(/<VoiceStatusBar\b/g)?.length, 1);
  // Same handlers as before: session.interrupt() and handleStop.
  assert.match(
    app,
    /<VoiceStatusBar[\s\S]*?onInterrupt=\{\(\) => \{\s*realtimeRef\.current\?\.interrupt\(\);\s*\}\}[\s\S]*?onEnd=\{handleStop\}/,
  );
  // The composer mic still ends Live Voice too.
  assert.match(app, /Hands-free · tap mic to end/);
});

test("status bar styling stays in the design family", () => {
  const css = read("../../styles/voiceBar.css");
  const bar = read("../../components/rvgrok/VoiceStatusBar.tsx");
  const rootRoute = read("../../routes/__root.tsx");
  assert.match(css, /border-radius:\s*var\(--btn-radius\)/);
  assert.match(css, /min-height:\s*var\(--btn-h-sm\)/);
  assert.match(css, /padding-inline:\s*var\(--btn-px-sm\)/);
  assert.match(css, /\.voice-status-interrupt \{[^}]*background:\s*#c48a5e/);
  assert.match(
    css,
    /html\[data-theme="dark"\] \.voice-status-bar \.voice-status-interrupt \{[^}]*background:\s*#c48a5e/,
  );
  // No aqua, no gold, no colored tints.
  const code = (css + bar).replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(code, /sky-|cyan|aqua|teal|gold|amber|#00[a-f0-9]{2}ff/i);
  const a = rootRoute.indexOf("cardsCss }");
  const b = rootRoute.indexOf("voiceBarCss }");
  assert.ok(a > 0 && b > a, "voiceBar.css is linked after cards.css");
});
