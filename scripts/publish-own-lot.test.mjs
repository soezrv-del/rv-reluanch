import assert from "node:assert/strict";
import test from "node:test";
import {
  decidePublish,
  describeSnapshot,
  formatSyncLine,
  MIN_UNITS,
  pickFresher,
} from "./publish-own-lot.mjs";

function snap(units, scrapedAt, extra = "") {
  const rows = Array.from({ length: units }, (_, i) => ({
    stock_number: String(i),
    scraped_at: scrapedAt,
    make: extra,
  }));
  return describeSnapshot(Buffer.from(JSON.stringify(rows)));
}

test("describeSnapshot rejects junk and mixed scrape times", () => {
  assert.equal(describeSnapshot("{").ok, false);
  assert.equal(describeSnapshot("{}").reason, "not an array");
  const mixed = describeSnapshot(
    Buffer.from(
      JSON.stringify([
        { scraped_at: "2026-09-17T19:05:26-07:00" },
        { scraped_at: "2026-09-24T08:41:12-07:00" },
      ]),
    ),
  );
  assert.equal(mixed.ok, false);
});

test("pickFresher keeps the newer scrape, not the bigger stale file", () => {
  const older = { ...snap(1018, "2026-09-17T19:05:26-07:00"), path: "old" };
  const newer = { ...snap(1466, "2026-09-24T08:41:12-07:00"), path: "new" };
  assert.equal(pickFresher(older, newer).path, "new");
  assert.equal(pickFresher(newer, older).path, "new");
  assert.equal(pickFresher({ ok: false }, newer).path, "new");
});

test("decidePublish skips identical and older, publishes newer, blocks a collapse", () => {
  const prod = snap(1466, "2026-09-24T08:41:12-07:00");
  assert.equal(decidePublish(prod, prod).reason, "already current");
  const stale = snap(1018, "2026-09-17T19:05:26-07:00");
  assert.match(decidePublish(stale, prod).reason, /older than production/);
  const next = snap(1500, "2026-09-25T08:40:00-07:00");
  assert.equal(decidePublish(next, prod).publish, true);
  const collapsed = snap(400, "2026-09-25T08:40:00-07:00");
  assert.match(decidePublish(collapsed, prod).reason, /need/);
  assert.ok(MIN_UNITS > 400);
  const halved = snap(1000, "2026-09-25T08:40:00-07:00");
  const big = snap(2000, "2026-09-24T08:41:12-07:00");
  assert.match(decidePublish(halved, big).reason, /refusing shrink/);
});

test("formatSyncLine stays one line", () => {
  assert.match(
    formatSyncLine({
      publish: false,
      reason: "already current",
      units: 1466,
      scrapedAt: "2026-09-24T08:41:12-07:00",
    }),
    /already current — 1466 units/,
  );
  assert.match(
    formatSyncLine({
      publish: true,
      units: 1500,
      scrapedAt: "2026-09-25T08:40:00-07:00",
      commit: "abcdef1234567890",
    }),
    /published 1500 units.*abcdef1/,
  );
});
