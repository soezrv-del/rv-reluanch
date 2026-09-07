import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("cold open plays David’s whole muted book video, then the suite pages", () => {
  const launch = read("../../components/shell/Launchpad.tsx");
  const media = read("../../assets/launchMedia.ts");
  const css = read("../../styles.css");

  assert.match(media, /DAVID_BOOK_SPLASH = "\/assets\/splash\/david-book-splash\.mp4"/);
  assert.match(launch, /DAVID_BOOK_SPLASH/);
  assert.match(launch, /data-david-book-splash/);
  assert.match(launch, /muted/);
  assert.match(launch, /playsInline/);
  assert.match(launch, /autoPlay/);
  assert.match(launch, /data-launch-skip/);
  assert.match(launch, /onEnded=\{enterPages\}/);
  assert.match(launch, /export const PAGE_TURN_MS = 320/);
  assert.ok(320 < 500, "page motion stays under 500ms");

  assert.doesNotMatch(launch, /COVER_FLIP_MS/);
  assert.doesNotMatch(launch, /data-magazine-cover/);
  assert.doesNotMatch(launch, /data-book-cover/);
  assert.doesNotMatch(launch, /data-book-spine/);
  assert.doesNotMatch(launch, /data-book-page-edge/);
  assert.doesNotMatch(launch, /rvfox-cover-seal/);
  assert.doesNotMatch(launch, /rvfox-launch-seal-poster/);
  assert.doesNotMatch(launch, /RVFOX PRO/);
  assert.doesNotMatch(launch, /RATEAPI/);
  assert.doesNotMatch(launch, /from ["']@\/lib\/rv\/rvData/);
  assert.doesNotMatch(launch, /volume\s*=\s*1/);
  assert.doesNotMatch(launch, /\.muted\s*=\s*false/);

  const ids = [...launch.matchAll(/id: "(rvfax|rvgrok|rvcal|rvtow|rvtrips|rvshare|more)"/g)].map(
    (m) => m[1],
  );
  assert.deepEqual(ids, [
    "rvfax",
    "rvcal",
    "rvtow",
    "rvtrips",
    "rvshare",
    "rvgrok",
    "more",
  ]);

  assert.match(launch, /Tow match/);
  assert.match(launch, /Settings/);
  assert.match(css, /\.lp-video/);
  assert.match(css, /object-fit:\s*cover/);
  assert.doesNotMatch(css, /\.leather-cover-plate/);
  assert.doesNotMatch(css, /\.leather-emblem-stamp/);
  assert.doesNotMatch(css, /\.leather-spine/);
  assert.doesNotMatch(css, /rotateY\(-32deg\)/);
  assert.doesNotMatch(css, /--book-depth:/);
  assert.doesNotMatch(css, /\.magazine-spine/);
  assert.doesNotMatch(css, /\.magazine-edge/);
});
