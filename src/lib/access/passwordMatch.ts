import { timingSafeEqual } from "node:crypto";

function passwordBytes(value: string): Buffer {
  return Buffer.from(value, "utf8");
}

/** Timing-safe compare for the admin password. */
export function passwordsMatch(given: string, expected: string): boolean {
  const a = passwordBytes(given);
  const b = passwordBytes(expected);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
