import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Evaluate live rvData.ts in Node (rvTypes re-exports, with or without .ts, are stripped). */
export async function loadLiveCatalog() {
  const src = resolve(root, "src/lib/rv/rvData.ts");
  const raw = readFileSync(src, "utf8")
    .replace(/export \{[\s\S]*?\} from "\.\/rvTypes(?:\.ts)?";\n/, "")
    .replace(/export type \{[\s\S]*?\} from "\.\/rvTypes(?:\.ts)?";\n/, "")
    .replace(
      /import \{ RV_CARD_IMAGE, type RVSpec \} from "\.\/rvTypes(?:\.ts)?";/,
      "const RV_CARD_IMAGE = \"\";",
    )
    .replace(": Record<string, Record<string, RVSpec>>", "");

  const tmp = join(mkdtempSync(join(tmpdir(), "rv-index-")), "rvData.mjs");
  writeFileSync(tmp, raw);
  return import(pathToFileURL(tmp).href);
}
