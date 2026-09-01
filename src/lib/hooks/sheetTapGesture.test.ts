import assert from "node:assert/strict";
import test from "node:test";
import {
  SHEET_TAP_SLOP_PX,
  beginSheetTap,
  isSheetTap,
  noteSheetTapSample,
  shouldCommitSheetItemClick,
} from "./sheetTapGesture.ts";

test("a short press with no movement is a tap", () => {
  const g = beginSheetTap({ x: 40, y: 200, scrollTop: 0, pointerId: 1 });
  assert.equal(isSheetTap(g, { x: 42, y: 203, scrollTop: 1, pointerId: 1 }), true);
});

test("finger travel past slop is a scroll, not a tap", () => {
  const g = beginSheetTap({ x: 40, y: 200, scrollTop: 0, pointerId: 1 });
  assert.equal(
    isSheetTap(g, { x: 40, y: 200 + SHEET_TAP_SLOP_PX + 1, scrollTop: 0 }),
    false,
  );
});

test("horizontal travel past slop is also a scroll", () => {
  const g = beginSheetTap({ x: 40, y: 200, scrollTop: 0 });
  assert.equal(noteSheetTapSample(g, { x: 40 + SHEET_TAP_SLOP_PX + 2 }), true);
  assert.equal(isSheetTap(g, { x: 40, y: 200 }), false);
});

test("list scroll under a still finger is not a tap", () => {
  const g = beginSheetTap({ x: 40, y: 200, scrollTop: 80, pointerId: 1 });
  assert.equal(isSheetTap(g, { x: 41, y: 201, scrollTop: 140 }), false);
});

test("once marked moved, later pointerup on the start row still is not a tap", () => {
  const g = beginSheetTap({ x: 40, y: 200, scrollTop: 0, pointerId: 1 });
  noteSheetTapSample(g, { y: 260, scrollTop: 80 });
  assert.equal(isSheetTap(g, { x: 40, y: 200, scrollTop: 0, pointerId: 1 }), false);
});

test("a missing gesture is never a pointer tap", () => {
  assert.equal(isSheetTap(null, { x: 10, y: 10 }), false);
});

test("a different pointer id does not commit the original row", () => {
  const g = beginSheetTap({ x: 40, y: 200, pointerId: 7 });
  assert.equal(isSheetTap(g, { x: 40, y: 200, pointerId: 8 }), false);
});

test("synthesized click after a scroll must not select", () => {
  assert.equal(
    shouldCommitSheetItemClick({ detail: 1, suppressPointerClick: true }),
    false,
  );
});

test("a real pointer tap click may select", () => {
  assert.equal(
    shouldCommitSheetItemClick({ detail: 1, suppressPointerClick: false }),
    true,
  );
});

test("keyboard and assistive-tech clicks still select after a prior scroll", () => {
  assert.equal(
    shouldCommitSheetItemClick({ detail: 0, suppressPointerClick: true }),
    true,
  );
});
