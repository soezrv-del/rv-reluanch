/**
 * Facts-local collapse headlines — title + one value when a section is closed.
 * No catalog imports (token leash).
 */

export function factsMoneyHeadline(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function factsRecallHeadline(opts: {
  loading: boolean;
  count: number;
}): string {
  if (opts.loading) return "Checking…";
  if (opts.count <= 0) return "None found";
  return opts.count === 1 ? "1 recall" : `${opts.count} recalls`;
}

export function factsOwnerHeadline(review: {
  title?: string | null;
  rating?: number | null;
} | null): string {
  if (!review) return "—";
  const quote = String(review.title ?? "").trim();
  const rating =
    typeof review.rating === "number" && Number.isFinite(review.rating)
      ? review.rating.toFixed(1)
      : "";
  if (quote && rating) return `“${quote}” · ${rating}`;
  return quote || rating || "—";
}

export function factsInventoryHeadline(opts: {
  searched: boolean;
  count: number;
}): string {
  if (!opts.searched) return "Search nearby";
  if (opts.count <= 0) return "No listings";
  return opts.count === 1 ? "1 listing" : `${opts.count} listings`;
}

export function factsSpecsHeadline(opts: {
  length?: string | null;
  engine?: string | null;
}): string {
  const length = String(opts.length ?? "").trim();
  if (length && length !== "—") return length;
  const engine = String(opts.engine ?? "").trim();
  if (engine && engine !== "—") return engine;
  return "Specs";
}
