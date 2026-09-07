import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("leather cover opens a book of real suite destinations", () => {
  const launch = read("../../components/shell/Launchpad.tsx");
  const css = read("../../styles.css");

  assert.match(launch, /export const COVER_FLIP_MS = 380/);
  assert.match(launch, /export const PAGE_TURN_MS = 320/);
  assert.ok(380 < 500 && 320 < 500, "page motion stays under 500ms");

  assert.match(launch, /data-magazine-cover/);
  assert.match(launch, /data-book-cover/);
  assert.match(launch, /RvFOX — Verified and True/);
  assert.match(launch, /Know before you buy\./);
  assert.match(launch, /rvfox-launch-seal-poster/);
  assert.doesNotMatch(launch, /RATEAPI/);
  assert.doesNotMatch(launch, /from ["']@\/lib\/rv\/rvData/);

  const ids = [...launch.matchAll(/id: "(rvfax|rvgrok|rvcal|rvtow|rvtrips|rvshare|more)"/g)].map(
    (m) => m[1],
  );
  assert.deepEqual(ids, [
    "rvfax",
    "rvgrok",
    "rvcal",
    "rvtow",
    "rvtrips",
    "rvshare",
    "more",
  ]);

  assert.match(css, /\.leather-cover-plate/);
  assert.match(css, /\.leather-emblem-stamp/);
  assert.match(css, /\.leather-cover-grain/);
  assert.doesNotMatch(css, /\.magazine-spine/);
  assert.doesNotMatch(css, /\.magazine-edge/);
});
