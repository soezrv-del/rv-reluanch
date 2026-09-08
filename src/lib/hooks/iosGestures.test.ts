import assert from "node:assert/strict";
import test from "node:test";
import {
  pullProgress,
  rubberband,
  shouldArmPull,
  shouldCommitSwipe,
  shouldFirePull,
  swipeAxisLock,
  swipeFollowDx,
  swipeStep,
} from "./iosGestures.ts";

test("rubberband never exceeds the limit and grows slower than input", () => {
  assert.equal(rubberband(-10), 0);
  assert.ok(rubberband(40, 120) < 40);
  assert.ok(rubberband(400, 120) < 120);
  assert.ok(rubberband(80, 120) > rubberband(40, 120));
});

test("pull progress and fire thresholds", () => {
  assert.equal(pullProgress(36, 72), 0.5);
  assert.equal(pullProgress(80, 72), 1);
  assert.equal(shouldArmPull(54, 54), true);
  assert.equal(shouldArmPull(53, 54), false);
  assert.equal(shouldFirePull(80, 72, 0), true);
  assert.equal(shouldFirePull(80, 72, 8), false);
  assert.equal(shouldFirePull(70, 72, 0), false);
});

test("swipe axis lock is horizontal-biased after a small deadzone", () => {
  assert.equal(swipeAxisLock(3, 2), null);
  assert.equal(swipeAxisLock(20, 10), "h");
  assert.equal(swipeAxisLock(8, 20), "v");
});

test("swipe commit accepts a flick or a longer drag", () => {
  const flick = shouldCommitSwipe({
    dx: -22,
    dy: 4,
    dt: 30,
    threshold: 28,
    locked: "h",
    width: 390,
  });
  const slowShort = shouldCommitSwipe({
    dx: -16,
    dy: 2,
    dt: 800,
    threshold: 28,
    locked: "h",
    width: 390,
  });
  const midPage = shouldCommitSwipe({
    dx: -160,
    dy: 20,
    dt: 400,
    threshold: 28,
    locked: "h",
    width: 390,
  });
  assert.equal(flick, true);
  assert.equal(slowShort, false);
  assert.equal(midPage, true);
});

test("swipe step stays on the dock edges", () => {
  assert.equal(swipeStep(-40, 0, 5), 1);
  assert.equal(swipeStep(40, 0, 5), 0);
  assert.equal(swipeStep(-40, 4, 5), 0);
  assert.equal(swipeStep(40, 4, 5), -1);
});

test("swipe follow rubber-bands at the first and last tab", () => {
  const mid = swipeFollowDx(-80, 2, 5, 390);
  const start = swipeFollowDx(80, 0, 5, 390);
  const end = swipeFollowDx(-80, 4, 5, 390);
  assert.equal(mid, -80);
  assert.ok(start > 0 && start < 80);
  assert.ok(end < 0 && end > -80);
});
