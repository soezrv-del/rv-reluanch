import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("cold open skips splash and lands on Facts", () => {
  const launch = read("../../components/shell/Launchpad.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const css = read("../../styles.css");
  const mediaPath = join(root, "../../assets/launchMedia.ts");

  assert.equal(
    existsSync(mediaPath),
    false,
    "launchMedia splash URLs removed",
  );
  assert.equal(
    existsSync(join(root, "../../../public/assets/splash/david-book-splash.mp4")),
    false,
    "David-book splash video removed",
  );
  assert.equal(
    existsSync(
      join(root, "../../../public/assets/splash/david-book-splash-poster.jpg"),
    ),
    false,
    "David-book splash poster removed",
  );
  assert.equal(
    existsSync(join(root, "../../../public/assets/splash/rvfox-launch-seal.mp4")),
    false,
    "old seal splash removed",
  );
  assert.equal(
    existsSync(join(root, "../../../public/assets/splash/rvfox-cover-seal.jpg")),
    false,
    "old cover seal removed",
  );

  assert.doesNotMatch(launch, /export function Launchpad/);
  assert.doesNotMatch(launch, /DAVID_BOOK_SPLASH/);
  assert.doesNotMatch(launch, /data-david-book-splash/);
  assert.doesNotMatch(launch, /data-launch-skip/);
  assert.doesNotMatch(launch, /data-splash-phase/);
  assert.doesNotMatch(launch, /lp-video/);
  assert.match(launch, /export function MetalVerifiedTrue/);
  assert.match(launch, /metal-hammered-face/);

  assert.doesNotMatch(shell, /<Launchpad/);
  assert.doesNotMatch(shell, /from "\.\/Launchpad"/);
  assert.doesNotMatch(shell, /finishLaunch/);
  assert.doesNotMatch(shell, /onSkip=\{\(\) => finishLaunch\("rvfax"\)\}/);
  assert.match(shell, /useState<AppTab>\("rvfax"\)/);
  assert.match(shell, /new Set<AppTab>\(\["rvfax"\]\)/);
  assert.match(shell, /const suiteReady = true/);
  assert.match(shell, /const launchOpen = false/);

  assert.doesNotMatch(launch, /LAUNCH_PAGES/);
  assert.doesNotMatch(launch, /enterPages/);
  assert.doesNotMatch(launch, /data-launch-deck/);
  assert.doesNotMatch(launch, /data-magazine-page/);
  assert.doesNotMatch(launch, /data-magazine-open/);
  assert.doesNotMatch(launch, /data-launch-tool/);
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

  assert.doesNotMatch(css, /\.lp-launch/);
  assert.doesNotMatch(css, /\.lp-video/);
  assert.doesNotMatch(css, /\.lp-video-skip/);
  assert.doesNotMatch(css, /\.lp-deck/);
  assert.doesNotMatch(css, /\.lp-page\b/);
  assert.doesNotMatch(css, /\.leather-cover-plate/);
  assert.doesNotMatch(css, /\.leather-emblem-stamp/);
  assert.doesNotMatch(css, /\.leather-spine/);
  assert.doesNotMatch(css, /rotateY\(-32deg\)/);
  assert.doesNotMatch(css, /--book-depth:/);
  assert.doesNotMatch(css, /\.magazine-spine/);
  assert.doesNotMatch(css, /\.magazine-edge/);
});
