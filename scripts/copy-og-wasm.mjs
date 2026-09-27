/**
 * The OG renderer resolves @resvg/resvg-wasm at runtime.
 * Nitro does not trace that wasm file, so copy the package into the function.
 */
import { cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const dest = join(
  ".vercel/output/functions/__server.func/node_modules/@resvg/resvg-wasm",
);
mkdirSync(dest, { recursive: true });
for (const file of ["package.json", "index.mjs", "index.js", "index_bg.wasm"]) {
  cpSync(join("node_modules/@resvg/resvg-wasm", file), join(dest, file));
}
