import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEAMLESS_LOOP_PX_PER_SEC,
  SEAMLESS_LOOP_RESUME_MS,
  nextSeamlessScroll,
  shouldSeamlessLoop,
} from "./seamlessLoop.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("seamless loop runs only when the strip overflows and motion is allowed", () => {
  assert.equal(
    shouldSeamlessLoop({ reducedMotion: true, overflows: true }),
    false,
  );
  assert.equal(
    shouldSeamlessLoop({ reducedMotion: false, overflows: false }),
    false,
  );
  assert.equal(
    shouldSeamlessLoop({ reducedMotion: true, overflows: false }),
    false,
  );
  assert.equal(
    shouldSeamlessLoop({ reducedMotion: false, overflows: true }),
    true,
  );
  assert.ok(SEAMLESS_LOOP_PX_PER_SEC >= 30 && SEAMLESS_LOOP_PX_PER_SEC <= 40);
  assert.equal(SEAMLESS_LOOP_RESUME_MS, 3000);
  assert.equal(nextSeamlessScroll(80, 100, 30), 10);
  assert.equal(nextSeamlessScroll(0, 100, 100), 0);
  assert.equal(nextSeamlessScroll(10, 0, 5), 10);
  assert.equal(nextSeamlessScroll(40, 100, 250), 90);
});

test("the arrivals strip owns the loop and the pill row does not", () => {
  const home = readFileSync(
    join(root, "../../components/shell/HomeScreen.tsx"),
    "utf8",
  );
  const bar = readFileSync(
    join(root, "../../components/shell/RoomAskBar.tsx"),
    "utf8",
  );
  const ask = readFileSync(join(root, "../rvgrok/roomAsk.ts"), "utf8");
  const css = readFileSync(join(root, "../../styles.css"), "utf8");

  assert.match(home, /shouldSeamlessLoop/);
  assert.match(home, /nextSeamlessScroll/);
  assert.match(home, /SEAMLESS_LOOP_RESUME_MS/);
  assert.match(home, /prefers-reduced-motion: reduce/);
  assert.match(home, /data-arrival-set="duplicate"/);
  assert.match(home, /aria-hidden="true"/);
  assert.match(home, /tabIndex=\{mirror \? -1 : undefined\}/);
  assert.match(home, /requestLotUnit/);
  assert.match(home, /Newest arrivals/);

  assert.doesNotMatch(bar, /nextPillScroll|nextSeamlessScroll|shouldLoopPills|shouldSeamlessLoop/);
  assert.doesNotMatch(bar, /data-pill-loop|data-room-chip-set|showroom-pill-set/);
  assert.doesNotMatch(bar, /requestAnimationFrame/);
  assert.doesNotMatch(bar, /PILL_LOOP/);
  assert.equal((bar.match(/ROOM_CHIPS\.map/g) || []).length, 1);

  assert.doesNotMatch(ask, /nextPillScroll|shouldLoopPills|PILL_LOOP|nextSeamlessScroll/);
  assert.doesNotMatch(css, /\.showroom-pill-set/);
  assert.match(css, /\.showroom-arrival-set/);
});
