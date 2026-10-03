import { readFileSync } from "node:fs";
import bundledPins from "../../../public/inventory/garage-pins.json";
import type { GaragePinBook } from "./garagePins.ts";

/**
 * Server only. The browser lot page fetches /inventory/garage-pins.json.
 *
 * The pins are bundled with the function. On Vercel, public/ is not on disk
 * inside the function, so a bare readFileSync threw on every lot question.
 * A path is only read when one is passed (scripts, tests), and any failure
 * falls back to the bundled pins, then to an empty book, so the lot answer
 * still runs on the spec-sheet garage path.
 */
export function loadGaragePinBook(path?: string): GaragePinBook {
  if (path) {
    try {
      return JSON.parse(readFileSync(path, "utf8")) as GaragePinBook;
    } catch (err) {
      console.warn("garage pins: could not read", path, String(err));
    }
  }
  const book = bundledPins as unknown;
  return book && typeof book === "object" ? (book as GaragePinBook) : {};
}
