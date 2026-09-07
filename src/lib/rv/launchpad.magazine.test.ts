import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("bright seal book cover opens Image-1 suite pages", () => {
  const launch = read("../../components/shell/Launchpad.tsx");
  const css = read("../../styles.css");

  assert.match(launch, /export const COVER_FLIP_MS = 380/);
  assert.match(launch, /export const PAGE_TURN_MS = 320/);
  assert.ok(380 < 500 && 320 < 500, "page motion stays under 500ms");

  assert.match(launch, /data-magazine-cover/);
  assert.match(launch, /data-book-cover/);
  assert.match(launch, /data-book-spine/);
  assert.match(launch, /data-book-page-edge/);
  assert.match(launch, /RVFOX PRO/);
  assert.match(launch, /leather-wordmark-rv/);
  assert.match(launch, /leather-wordmark-fox/);
  assert.match(launch, /Verified and True/);
  assert.match(launch, /Know before you buy\./);
  assert.match(launch, /rvfox-launch-seal-poster/);
  assert.doesNotMatch(launch, /RvFOX — Verified and True/);
  assert.doesNotMatch(launch, /RATEAPI/);
  assert.doesNotMatch(launch, /from ["']@\/lib\/rv\/rvData/);

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

  assert.match(css, /\.leather-cover-plate/);
  assert.match(css, /\.leather-emblem-stamp/);
  assert.match(css, /\.leather-cover-grain/);
  assert.match(css, /\.leather-spine/);
  assert.match(css, /\.leather-page-edge/);
  assert.match(css, /\.leather-kicker/);
  assert.match(css, /\.leather-wordmark-fox/);
  assert.match(css, /--leather-hide:\s*#000000/);
  assert.match(css, /--leather-foil:\s*var\(--color-sapphire-glow\)/);
  assert.match(css, /--leather-ink:\s*var\(--color-fg\)/);
  assert.match(css, /\.leather-launch[\s\S]*background:\s*#000000/);
  assert.match(css, /\.leather-cover-plate[\s\S]*background-color:\s*#000000/);
  assert.match(css, /\.leather-emblem-stamp[\s\S]*?filter:\s*none/);
  assert.match(css, /object-fit:\s*contain/);
  assert.doesNotMatch(css, /--leather-hide:\s*#0b0a0c/);
  assert.doesNotMatch(css, /--leather-board:\s*#8a6348/);
  assert.doesNotMatch(css, /--leather-foil:\s*var\(--color-gold-bright\)/);
  assert.doesNotMatch(css, /\.leather-cover-frame/);
  assert.doesNotMatch(css, /brightness\(0\.7\)/);
  assert.doesNotMatch(css, /mix-blend-mode:\s*overlay/);
  assert.doesNotMatch(css, /\.magazine-spine/);
  assert.doesNotMatch(css, /\.magazine-edge/);
});
