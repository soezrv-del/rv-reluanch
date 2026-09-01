import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = join(import.meta.dirname, "..");
const SCRIPT = join(ROOT, "scripts/prepare-capacitor.mjs");
const INDEX = join(ROOT, "cap-www/index.html");

function envWithoutCapUrl() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key !== "CAP_SERVER_URL"),
  );
}

async function prepare(env) {
  const { stdout } = await execFileAsync(process.execPath, [SCRIPT], {
    cwd: ROOT,
    env,
  });
  return stdout;
}

test("prepare-capacitor writes cap-www and honors CAP_SERVER_URL", async () => {
  const placeholderOut = await prepare(envWithoutCapUrl());
  assert.match(placeholderOut, /local shell/i);
  assert.equal(existsSync(INDEX), true);
  const placeholder = readFileSync(INDEX, "utf8");
  assert.match(placeholder, /<title>RVFAX<\/title>/);
  assert.match(placeholder, /export CAP_SERVER_URL=/);
  assert.doesNotMatch(placeholder, /location\.replace/);

  const liveUrl = "https://rvfax-live.example.test";
  const liveOut = await prepare({ ...envWithoutCapUrl(), CAP_SERVER_URL: liveUrl });
  assert.match(liveOut, /server https:\/\/rvfax-live\.example\.test/);
  const live = readFileSync(INDEX, "utf8");
  assert.match(live, /Connecting to live suite/);
  assert.match(live, /location\.replace\("https:\/\/rvfax-live\.example\.test"\)/);

  // Leave the committed placeholder shell in place.
  await prepare(envWithoutCapUrl());
});
