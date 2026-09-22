import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  grokComposerKeyboardLift,
  grokScrollKeyboardPad,
} from "./keyboardSafe.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Capacitor resize:none lifts the thread composer by the keyboard inset", () => {
  assert.equal(
    grokComposerKeyboardLift({
      open: true,
      inset: 336,
      vvHeight: 844,
      vvOffsetTop: 0,
      layoutHeight: 844,
    }),
    336,
  );
});

test("Safari visualViewport shrink is already consumed by the shell — no double pad", () => {
  assert.equal(
    grokComposerKeyboardLift({
      open: true,
      inset: 336,
      vvHeight: 508,
      vvOffsetTop: 0,
      layoutHeight: 844,
    }),
    0,
  );
});

test("closed keyboard and desktop never lift", () => {
  assert.equal(
    grokComposerKeyboardLift({
      open: false,
      inset: 0,
      vvHeight: 900,
      vvOffsetTop: 0,
      layoutHeight: 900,
    }),
    0,
  );
  assert.equal(grokScrollKeyboardPad(false), 0);
  assert.equal(grokScrollKeyboardPad(true), 88);
});

test("Grok composer and thread chrome wire keyboard-safe inset + scroll-into-view", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const composer = read("../../components/rvgrok/GrokComposer.tsx");
  const css = read("../../styles.css");

  assert.match(app, /grokComposerKeyboardLift/);
  assert.match(app, /grokScrollKeyboardPad/);
  assert.match(app, /data-rvgrok-composer-dock/);
  assert.match(app, /scrollFieldIntoVisibleArea/);
  assert.doesNotMatch(app, /paddingBottom: kb\.open \? 12/);

  assert.match(composer, /scrollFieldIntoVisibleArea/);
  assert.match(composer, /onFocus=/);
  assert.match(composer, /data-rvgrok-composer/);

  assert.match(css, /html\.kb-open \[data-rvgrok-composer\]/);
  assert.match(css, /html\.kb-open \[data-rvgrok-composer-dock\]/);
  assert.doesNotMatch(css, /DialaBot|dialabot/i);
});
