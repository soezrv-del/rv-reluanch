import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  decidePublish,
  describeSnapshot,
  formatSyncLine,
  gh,
  gitBlobSha,
  MIN_UNITS,
  pickFresher,
  STALE_AFTER_MS,
  syncOwnLot,
} from "./publish-own-lot.mjs";

function snap(units, scrapedAt, extra = "") {
  const rows = Array.from({ length: units }, (_, i) => ({
    stock_number: String(i),
    scraped_at: scrapedAt,
    make: extra,
    raw: { attributes: { "Number of King Size Beds": "1" }, floorplan_feature: ["King Bed"] },
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
  const slim = describeSnapshot(
    Buffer.from(
      JSON.stringify(
        Array.from({ length: MIN_UNITS }, (_, i) => ({
          stock_number: String(i),
          scraped_at: "2026-10-03T08:00:00-07:00",
        })),
      ),
    ),
  );
  const rich = snap(1000, "2026-10-02T08:00:00-07:00");
  assert.match(decidePublish(slim, rich).reason, /refusing slim snapshot/);
  assert.equal(decidePublish(slim, rich).publish, false);
});

test("gh shells out", () => {
  assert.match(gh(["--version"]), /gh version/);
});

test("formatSyncLine stays one line", () => {
  assert.match(
    formatSyncLine({
      publish: false,
      status: "fresh",
      reason: "already current",
      units: 1466,
      scrapedAt: "2026-09-24T08:41:12-07:00",
    }),
    /already current — no changes in a fresh scrape — 1466 units/,
  );
  const staleLine = formatSyncLine({
    publish: false,
    status: "stale",
    reason: "scrape is stale (newest scrape 2026-09-30T10:06:05-07:00 is older than 24h)",
    units: 1411,
    scrapedAt: "2026-09-30T10:06:05-07:00",
  });
  assert.match(staleLine, /scrape is stale/);
  assert.doesNotMatch(staleLine, /already current/);
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

test("stale upstream is not already current", () => {
  const dir = mkdtempSync(join(tmpdir(), "own-lot-"));
  try {
    const scrapedAt = "2026-09-30T10:06:05-07:00";
    const now = Date.parse("2026-10-03T12:00:00-07:00");
    assert.ok(now - Date.parse(scrapedAt) > STALE_AFTER_MS);
    const bytes = Buffer.from(
      JSON.stringify([{ stock_number: "47492", scraped_at: scrapedAt, make: "Thor" }]),
    );
    const upstream = join(dir, "upstream.json");
    writeFileSync(upstream, bytes);
    const blob = gitBlobSha(bytes);
    const ghImpl = (args) => {
      if (args.includes("--jq")) return JSON.stringify({ sha: blob, size: bytes.length });
      return bytes.toString("utf8");
    };
    const summary = syncOwnLot({
      check: true,
      root: join(dir, "repo"),
      upstreamPath: upstream,
      ghImpl,
      now,
    });
    assert.equal(summary.publish, false);
    assert.equal(summary.status, "stale");
    assert.equal(summary.exitCode, 1);
    assert.equal(summary.scrapedAt, scrapedAt);
    assert.doesNotMatch(summary.reason, /already current/);
    assert.match(summary.reason, /older than 24h/);
    assert.doesNotMatch(formatSyncLine(summary), /already current/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("upstream older than production is not already current", () => {
  const dir = mkdtempSync(join(tmpdir(), "own-lot-"));
  try {
    const productionAt = "2026-10-02T10:00:00-07:00";
    const upstreamAt = "2026-09-30T10:06:05-07:00";
    const productionBytes = Buffer.from(
      JSON.stringify([
        {
          stock_number: "47492",
          scraped_at: productionAt,
          raw: { attributes: { "Number of King Size Beds": "1" } },
        },
      ]),
    );
    const upstreamBytes = Buffer.from(
      JSON.stringify([
        {
          stock_number: "47492",
          scraped_at: upstreamAt,
          raw: { attributes: { "Number of King Size Beds": "0" } },
        },
      ]),
    );
    const root = join(dir, "repo");
    mkdirSync(join(root, "public/inventory"), { recursive: true });
    writeFileSync(join(root, "public/inventory/own-lot-latest.json"), productionBytes);
    const upstream = join(dir, "upstream.json");
    writeFileSync(upstream, upstreamBytes);
    const blob = gitBlobSha(productionBytes);
    const ghImpl = (args) => {
      if (args.includes("--jq")) {
        return JSON.stringify({ sha: blob, size: productionBytes.length });
      }
      return productionBytes.toString("utf8");
    };
    const summary = syncOwnLot({
      check: true,
      root,
      upstreamPath: upstream,
      ghImpl,
      now: Date.parse("2026-10-03T12:00:00-07:00"),
    });
    const line = formatSyncLine(summary);
    assert.equal(summary.publish, false);
    assert.equal(summary.exitCode, 1);
    assert.equal(summary.upstreamOlder, true);
    assert.match(line, /own-lot: upstream scrape is OLDER than production \(stale\) — not published/);
    assert.match(line, new RegExp(upstreamAt));
    assert.match(line, new RegExp(productionAt));
    assert.doesNotMatch(line, /already current/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("fresh identical upstream is no change", () => {
  const dir = mkdtempSync(join(tmpdir(), "own-lot-"));
  try {
    const scrapedAt = "2026-10-03T08:00:00-07:00";
    const now = Date.parse("2026-10-03T12:00:00-07:00");
    assert.ok(now - Date.parse(scrapedAt) <= STALE_AFTER_MS);
    const bytes = Buffer.from(
      JSON.stringify([{ stock_number: "47492", scraped_at: scrapedAt, make: "Thor" }]),
    );
    const upstream = join(dir, "upstream.json");
    writeFileSync(upstream, bytes);
    const blob = gitBlobSha(bytes);
    const ghImpl = (args) => {
      if (args.includes("--jq")) return JSON.stringify({ sha: blob, size: bytes.length });
      return bytes.toString("utf8");
    };
    const summary = syncOwnLot({
      check: true,
      root: join(dir, "repo"),
      upstreamPath: upstream,
      ghImpl,
      now,
    });
    assert.equal(summary.status, "fresh");
    assert.equal(summary.exitCode, 0);
    assert.equal(summary.reason, "already current");
    assert.match(formatSyncLine(summary), /no changes in a fresh scrape/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
