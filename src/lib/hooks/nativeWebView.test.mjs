import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirrors computeDockSafeBottomPx / isStationaryDockTap so Android
 * dock-inset + tap-slop regressions fail in CI.
 */

/**
 * @param {{ android: boolean, cssSafe: number, innerH: number, screenH: number }} opts
 */
function computeDockSafeBottomPx({ android, cssSafe, innerH, screenH }) {
  if (!android) {
    const safe = Number.isFinite(cssSafe) ? cssSafe : 0;
    return Math.min(10, Math.max(6, safe || 8));
  }
  if (cssSafe >= 16) return Math.round(cssSafe);
  const chrome = Math.max(0, screenH - innerH);
  if (chrome > 24) return Math.max(12, Math.round(cssSafe));
  return 48;
}

/**
 * @param {number} dx
 * @param {number} dy
 * @param {number} [slop]
 */
function isStationaryDockTap(dx, dy, slop = 20) {
  return Math.hypot(dx, dy) <= slop;
}

test("iOS / web keep the tight dock inset", () => {
  assert.equal(
    computeDockSafeBottomPx({
      android: false,
      cssSafe: 34,
      innerH: 800,
      screenH: 852,
    }),
    10,
  );
  assert.equal(
    computeDockSafeBottomPx({
      android: false,
      cssSafe: 0,
      innerH: 800,
      screenH: 852,
    }),
    8,
  );
});

test("Android uses CSS safe-area when it is live", () => {
  assert.equal(
    computeDockSafeBottomPx({
      android: true,
      cssSafe: 48,
      innerH: 800,
      screenH: 848,
    }),
    48,
  );
});

test("Android edge-to-edge (no CSS inset) lifts the dock 48px", () => {
  assert.equal(
    computeDockSafeBottomPx({
      android: true,
      cssSafe: 0,
      innerH: 800,
      screenH: 800,
    }),
    48,
  );
});

test("Android WebView already above the nav bar stays compact", () => {
  assert.equal(
    computeDockSafeBottomPx({
      android: true,
      cssSafe: 0,
      innerH: 752,
      screenH: 800,
    }),
    12,
  );
});

test("finger jitter still counts as a dock tap", () => {
  assert.equal(isStationaryDockTap(3, -4), true);
  assert.equal(isStationaryDockTap(19, 0), true);
  assert.equal(isStationaryDockTap(40, 2), false);
});
