import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function callbackBody(src: string, name: string): string {
  const start = src.indexOf(`const ${name} = useCallback(`);
  assert.ok(start >= 0, `${name} callback`);
  const next = src.indexOf("\n  const ", start + 10);
  assert.ok(next > start, `${name} end`);
  return src.slice(start, next);
}

test("voice list scrolls inside a capped sheet", () => {
  const panel = read("../../components/rvgrok/VoicePanel.tsx");
  assert.match(
    panel,
    /data-voice-scroll=""[\s\S]*?rv-scroll min-h-0 flex-1 space-y-3 overflow-y-auto/,
  );
  assert.match(panel, /maxHeight: `min\(\$\{sheetCap\}, 100%\)`/);
  assert.match(panel, /min\(88dvh, var\(--vv-height, 88dvh\)\)/);
  assert.match(panel, /WebkitOverflowScrolling: "touch"/);
  assert.match(panel, /overscrollBehavior: "contain"/);
  assert.match(panel, /e\.target !== e\.currentTarget/);
  assert.match(panel, /sheetGesture\.current/);
});

test("arming Live Voice or Voice mode leaves the picker open", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const live = callbackBody(app, "setLiveVoiceArmed");
  const mode = callbackBody(app, "setVoiceModeArmed");
  assert.doesNotMatch(live, /setVoicePanelOpen\(false\)/);
  assert.doesNotMatch(mode, /setVoicePanelOpen\(false\)/);
  assert.match(live, /pendingVoiceStartRef\.current = "live"/);
  assert.match(mode, /pendingVoiceStartRef\.current = "mode"/);
  assert.match(app, /persistVoice\(id\)/);
  assert.match(app, /finishVoicePanel\(\)/);
  assert.match(app, /selectedVoiceRef\.current = id/);
  assert.match(app, /VOICE_STORAGE_KEY/);
});

test("light voice sheet uses one shadow and no gradient", () => {
  const css = read("../../styles.css");
  const marker = "html[data-theme=\"light\"] [data-voice-panel] [data-voice-sheet]";
  const start = css.indexOf(marker);
  assert.ok(start >= 0);
  const block = css.slice(start, css.indexOf("}", start));
  assert.match(
    block,
    /box-shadow:\s*0 12px 40px rgba\(0, 0, 0, 0\.10\), 0 1px 3px rgba\(0, 0, 0, 0\.04\)/,
  );
  assert.equal((block.match(/box-shadow:/g) || []).length, 1);
  assert.doesNotMatch(block, /gradient/i);
  const light = css
    .split("}")
    .filter((rule) => rule.includes("[data-voice-panel]"))
    .join("}");
  assert.doesNotMatch(light, /\bgradient\b|\bgold\b|\baqua\b/i);
});
