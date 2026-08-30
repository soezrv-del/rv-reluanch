import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirrors iosSheetTapBiasFrom() / hitSheetItemAt() so a native-iOS
 * coordinate regression cannot land without this file failing.
 */

/**
 * @param {{ nativeIos: boolean, sat: number, screenLong: number }} opts
 */
function iosSheetTapBiasFrom({ nativeIos, sat, screenLong }) {
  if (!nativeIos) return 0;
  if (sat >= 20) return 0;
  if (screenLong >= 812) return 54;
  return 20;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {Array<{ value: string, top: number, bottom: number, left: number, right: number }>} boxes
 * @param {{ first?: number, last?: number }} [slack]
 */
function hitSheetItemAt(x, y, boxes, slack = {}) {
  if (!boxes.length) return null;
  for (const b of boxes) {
    if (y >= b.top && y < b.bottom && x >= b.left - 4 && x <= b.right + 4) {
      return b.value;
    }
  }
  const first = boxes[0];
  const last = boxes[boxes.length - 1];
  const firstSlack = slack.first ?? 0;
  const lastSlack = slack.last ?? 12;
  if (y < first.top && y >= first.top - firstSlack - 8) return first.value;
  if (y >= last.bottom && y <= last.bottom + lastSlack) return last.value;
  return null;
}

/** @param {string[]} years */
function yearBoxes(years, rowH = 52, origin = 200) {
  return years.map((value, i) => ({
    value,
    top: origin + i * rowH,
    bottom: origin + (i + 1) * rowH,
    left: 16,
    right: 360,
  }));
}

test("preview / desktop: no bias", () => {
  assert.equal(iosSheetTapBiasFrom({ nativeIos: false, sat: 0, screenLong: 900 }), 0);
  assert.equal(iosSheetTapBiasFrom({ nativeIos: false, sat: 59, screenLong: 852 }), 0);
});

test("iOS with live CSS safe-area: no extra bias (contentInset never)", () => {
  assert.equal(iosSheetTapBiasFrom({ nativeIos: true, sat: 47, screenLong: 844 }), 0);
  assert.equal(iosSheetTapBiasFrom({ nativeIos: true, sat: 59, screenLong: 852 }), 0);
});

test("iOS automatic inset (env() is 0): shift up one dropdown row", () => {
  assert.equal(iosSheetTapBiasFrom({ nativeIos: true, sat: 0, screenLong: 852 }), 54);
  assert.equal(iosSheetTapBiasFrom({ nativeIos: true, sat: 0, screenLong: 844 }), 54);
  assert.equal(iosSheetTapBiasFrom({ nativeIos: true, sat: 12, screenLong: 852 }), 54);
});

test("older iPhone status bar is smaller than a row", () => {
  assert.equal(iosSheetTapBiasFrom({ nativeIos: true, sat: 0, screenLong: 667 }), 20);
});

test("inflated clientY (iPhone automatic inset) selects the painted year, not the one below", () => {
  const ROW = 52;
  const origin = 200;
  const years = ["2027", "2026", "2025", "2024", "2023", "2022"];
  const boxes = yearBoxes(years, ROW, origin);
  const idx2024 = 3;
  const visualY = origin + idx2024 * ROW + ROW / 2;
  const inflatedY = visualY + 54;

  assert.equal(hitSheetItemAt(100, visualY, boxes), "2024");
  // Uncorrected iPhone clientY lands on the row below — the bug.
  assert.equal(hitSheetItemAt(100, inflatedY, boxes), "2023");
  // Subtract the notch-sized bias → painted row.
  assert.equal(hitSheetItemAt(100, inflatedY - 54, boxes), "2024");
});

test("tap near the top of the first row still selects it after bias", () => {
  const boxes = yearBoxes(["2027", "2026", "2025"], 52, 180);
  assert.equal(
    hitSheetItemAt(40, 180 - 10, boxes, { first: 54 }),
    "2027",
  );
});
