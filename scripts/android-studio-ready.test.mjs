import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const ROOT = join(import.meta.dirname, "..");

test("AndroidManifest declares camera, mic, location, and internet", () => {
  const manifest = readFileSync(
    join(ROOT, "android/app/src/main/AndroidManifest.xml"),
    "utf8",
  );
  for (const permission of [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO",
    "android.permission.MODIFY_AUDIO_SETTINGS",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_FINE_LOCATION",
  ]) {
    assert.match(manifest, new RegExp(permission.replace(/\./g, "\\.")));
  }
  assert.match(manifest, /android\.hardware\.camera"/);
  assert.match(manifest, /android\.hardware\.microphone"/);
  assert.match(manifest, /android\.hardware\.location\.gps"/);
  assert.match(manifest, /android:required="false"/);
});

test("Gradle settings point at @capacitor/android and package is declared", () => {
  const settings = readFileSync(
    join(ROOT, "android/capacitor.settings.gradle"),
    "utf8",
  );
  assert.match(settings, /node_modules\/@capacitor\/android\/capacitor/);
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.ok(pkg.dependencies["@capacitor/android"]);
  assert.ok(pkg.scripts["cap:sync:android"]);
  assert.ok(pkg.scripts["cap:open:android"]);
});

test(".env.example exists, is safe, and is not gitignored", () => {
  const example = readFileSync(join(ROOT, ".env.example"), "utf8");
  assert.match(example, /CAP_SERVER_URL=/);
  assert.doesNotMatch(example, /sk-|xai-|Bearer |password\s*=\s*\S+/i);
  const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
  assert.match(gitignore, /!\.env\.example/);
});

test("ANDROID.md uses the real repo folder name", () => {
  const doc = readFileSync(join(ROOT, "ANDROID.md"), "utf8");
  assert.match(doc, /cd rv-reluanch/);
  assert.doesNotMatch(doc, /rvfax-android-export/);
  assert.match(doc, /CAP_SERVER_URL/);
  assert.match(doc, /cap:sync:android/);
  assert.match(doc, /cap:open:android/);
});

test("@capacitor/android resolves after npm install when node_modules is present", () => {
  const capAndroid = join(
    ROOT,
    "node_modules/@capacitor/android/capacitor/build.gradle",
  );
  if (!existsSync(join(ROOT, "node_modules/@capacitor/android"))) {
    return;
  }
  assert.equal(existsSync(capAndroid), true);
});
