#!/usr/bin/env node
/**
 * Regenerate optimized iOS launch + app icon assets.
 * Run: node scripts/optimize-ios-launch.mjs
 *
 * Requires: sharp (optional) — falls back to pure note if missing.
 * Primary generator is scripts/optimize-ios-launch.py (Pillow).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const py = join(root, "scripts/optimize-ios-launch.py");
const r = spawnSync("python3", [py], { cwd: root, stdio: "inherit" });
process.exit(r.status ?? 1);
