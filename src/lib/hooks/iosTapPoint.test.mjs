import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirrors iosSheetTapBiasFrom() / hitSheetItemAt() / resolveSheetTapY()
 * so a native-iOS coordinate regression cannot land without this file failing.
 */

/**
 * @param {{ nativeIos: boolean, sat: number, screenLong: number, visualOffsetTop?: number }} opts
 */
function iosSheetTapBiasFrom({ nativeIos, sat, screenLong, visualOffsetTop = 0 }) {
  if (!nativeIos) return 0;
  if (sat >= 20) return 0;
  if (visualOffsetTop >= 20) return 0;
  if (screenLong >= 812) return 54;
  return 20;
}

/**
 * @param {number} clientY
 * @param {{ nativeIos?: boolean, visualOffsetTop?: number, bias?: number }} [opts]
 */
function resolveSheetTapY(clientY, opts = {}) {
  if (!opts.nativeIos) return clientY;
  const vvTop = opts.visualOffsetTop ?? 0;
  const bias = opts.bias ?? 0;
  if (vvTop >= 20 && bias >= 20) return clientY + vvTop;
  return clientY + vvTop - bias;
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

const YEARS_DESC = ["2027", "2026", "2025", "2024", "2023", "2022"];

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

test("visualViewport.offsetTop already measures chrome: no extra heuristic", () => {
  assert.equal(
    iosSheetTapBiasFrom({
      nativeIos: true,
      sat: 0,
      screenLong: 852,
      visualOffsetTop: 54,
    }),
    0,
  );
  assert.equal(
    iosSheetTapBiasFrom({
      nativeIos: true,
      sat: 0,
      screenLong: 852,
      visualOffsetTop: 47,
    }),
    0,
  );
});

test("inflated clientY (iPhone automatic inset) selects the painted year, not the one below", () => {
  const ROW = 52;
  const origin = 200;
  const boxes = yearBoxes(YEARS_DESC, ROW, origin);
  const idx2024 = 3;
  const visualY = origin + idx2024 * ROW + ROW / 2;
  const inflatedY = visualY + 54;

  assert.equal(hitSheetItemAt(100, visualY, boxes), "2024");
  // Uncorrected iPhone clientY lands on the row below — the original bug.
  assert.equal(hitSheetItemAt(100, inflatedY, boxes), "2023");
  // Subtract the notch-sized bias → painted row.
  assert.equal(hitSheetItemAt(100, inflatedY - 54, boxes), "2024");
  assert.equal(
    hitSheetItemAt(
      100,
      resolveSheetTapY(inflatedY, {
        nativeIos: true,
        bias: 54,
        visualOffsetTop: 0,
      }),
      boxes,
    ),
    "2024",
  );
});

test("tap near the top of the first row still selects it after bias", () => {
  const boxes = yearBoxes(["2027", "2026", "2025"], 52, 180);
  assert.equal(
    hitSheetItemAt(40, 180 - 10, boxes, { first: 54 }),
    "2027",
  );
});

test("matching clientY minus a row of bias selects the year above (the live bug)", () => {
  const ROW = 52;
  const origin = 200;
  const boxes = yearBoxes(YEARS_DESC, ROW, origin);
  const idx2025 = 2;
  const paintedY = origin + idx2025 * ROW + ROW / 2;

  assert.equal(hitSheetItemAt(100, paintedY, boxes), "2025");
  // Heuristic applied when coordinates already match → row above.
  assert.equal(hitSheetItemAt(100, paintedY - 54, boxes), "2026");
});

test("web / desktop resolver keeps matching clientY on the painted year", () => {
  const ROW = 52;
  const origin = 200;
  const boxes = yearBoxes(YEARS_DESC, ROW, origin);
  const paintedY = origin + 2 * ROW + ROW / 2; // 2025

  assert.equal(resolveSheetTapY(paintedY, { nativeIos: false, bias: 54 }), paintedY);
  assert.equal(resolveSheetTapY(paintedY, { nativeIos: false, visualOffsetTop: 54 }), paintedY);
  assert.equal(hitSheetItemAt(100, resolveSheetTapY(paintedY, { nativeIos: false }), boxes), "2025");
});

test("contentInset never (live sat / bias 0) does not shift a matching tap", () => {
  const ROW = 52;
  const origin = 200;
  const boxes = yearBoxes(YEARS_DESC, ROW, origin);
  const paintedY = origin + 2 * ROW + ROW / 2; // 2025

  assert.equal(
    hitSheetItemAt(
      100,
      resolveSheetTapY(paintedY, {
        nativeIos: true,
        bias: 0,
        visualOffsetTop: 0,
      }),
      boxes,
    ),
    "2025",
  );
});

test("visualViewport.offsetTop plus notch bias is double-count (row above)", () => {
  const ROW = 52;
  const origin = 200;
  const boxes = yearBoxes(YEARS_DESC, ROW, origin);
  const paintedY = origin + 2 * ROW + ROW / 2; // 2025
  const vvTop = 54;
  // Finger in visual space; boxes already in layout space.
  const clientY = paintedY - vvTop;

  assert.equal(hitSheetItemAt(100, clientY + vvTop, boxes), "2025");
  // Add offsetTop AND subtract 54 → one row too high.
  assert.equal(hitSheetItemAt(100, clientY + vvTop - 54, boxes), "2026");
  assert.equal(
    hitSheetItemAt(
      100,
      resolveSheetTapY(clientY, {
        nativeIos: true,
        bias: 54,
        visualOffsetTop: vvTop,
      }),
      boxes,
    ),
    "2025",
  );
});
