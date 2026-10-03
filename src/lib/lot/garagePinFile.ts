import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GaragePinBook } from "./garagePins.ts";

/** Server only. The browser lot page fetches /inventory/garage-pins.json. */
export function loadGaragePinBook(
  path = join(process.cwd(), "public/inventory/garage-pins.json"),
): GaragePinBook {
  return JSON.parse(readFileSync(path, "utf8")) as GaragePinBook;
}
