import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("AppPlugin patch unwraps preferredLocalizations.first", () => {
  const patch = readFileSync("patches/@capacitor+app+8.1.1.patch", "utf8");
  assert.match(patch, /preferredLocalizations\.first \?\? ""/);
});

test("Keyboard patch ignores CAPBridgedPlugin property synthesis", () => {
  const patch = readFileSync("patches/@capacitor+keyboard+8.0.5.patch", "utf8");
  assert.match(patch, /-Wobjc-protocol-property-synthesis/);
  assert.match(patch, /#pragma clang diagnostic ignored "-Wprotocol"/);
});

test("patches apply to installed Capacitor iOS sources when present", () => {
  const app = "node_modules/@capacitor/app/ios/Sources/AppPlugin/AppPlugin.swift";
  const kb = "node_modules/@capacitor/keyboard/ios/Sources/KeyboardPlugin/Keyboard.m";
  if (!existsSync(app) || !existsSync(kb)) return;
  assert.match(readFileSync(app, "utf8"), /preferredLocalizations\.first \?\? ""/);
  assert.match(readFileSync(kb, "utf8"), /-Wobjc-protocol-property-synthesis/);
});
