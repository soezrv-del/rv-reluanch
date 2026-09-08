import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const src = readFileSync(new URL("./useSwipeTabs.ts", import.meta.url), "utf8");

test("swipe capture ignores the bottom dock", () => {
  assert.match(src, /\[data-bottom-dock\]/);
  assert.match(src, /\.bottom-tabs-nav/);
  assert.match(src, /\.bottom-tab-btn/);
  assert.match(src, /isSwipeBlockedTarget/);
});

test("swipe writes interactive --swipe-dx and peeks the next pane", () => {
  assert.match(src, /--swipe-dx/);
  assert.match(src, /data-swipe-dragging/);
  assert.match(src, /onPeek/);
  assert.match(src, /swipeFollowDx/);
  assert.match(src, /\[data-map-engine\]/);
});
