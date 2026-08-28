import { createFileRoute } from "@tanstack/react-router";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { McListingCard, McSearchResult } from "@/lib/marketcheck/types";

/**
 * GET /api/marketcheck/search
 *   ?year=2022&make=Fleetwood&model=Discovery&zip=98374&radius=100&rows=8

 *
 * Proxies MarketCheck RV Inventory Search. API key stays server-side.
 */

const MC_BASE =
  process.env.MARKETCHECK_BASE_URL?.trim() || "https://api.marketcheck.com";

const cache = new Map<string, { at: number; data: McSearchResult }>();
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

/** Read key from process env or .env file (Vite sometimes blanks non-VITE_ secrets). */
function getKey(): string | null {
  const fromEnv = (
    process.env.MARKETCHECK_API_KEY ||
    process.env.MC_API_KEY ||
    ""
  ).trim();
  if (fromEnv) return fromEnv;

  try {
    const envPath = resolve(process.cwd(), ".env");
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const m = trimmed.match(
        /^(?:export\s+)?(?:MARKETCHECK_API_KEY|MC_API_KEY)\s*=\s*(.*)$/,
      );
      if (!m) continue;
      let v = m[1]!.trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (v) return v;
    }
  } catch {
    /* no file */
  }
  return null;
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n =
    typeof v === "number" ? v : Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function str(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function firstPhoto(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const m = media as Record<string, unknown>;
  if (typeof m.photo_url === "string" && m.photo_url) return m.photo_url;
  if (typeof m.photo_link === "string" && m.photo_link) return m.photo_link;
  const links = m.photo_links;
  if (Array.isArray(links) && typeof links[0] === "string") return links[0];
  if (links && typeof links === "object") {
    const o = links as Record<string, unknown>;
    for (const k of ["0", "1", "large", "medium", "small"]) {
      if (typeof o[k] === "string" && o[k]) return o[k] as string;
    }
  }
  return null;
}

function mapListing(raw: Record<string, unknown>): McListingCard {
  const build = (raw.build || {}) as Record<string, unknown>;
  const dealer = (raw.dealer || {}) as Record<string, unknown>;
  const media = raw.media;

  const year = num(build.year ?? raw.year);
  const make = str(build.make ?? raw.make);
  const model = str(build.model ?? raw.model);
  const trim = str(build.trim ?? build.series ?? raw.trim);
  const classLabel = str(
    build.class ?? build.category ?? raw.class ?? raw.category,
  );

  const city = str(dealer.city ?? raw.city);
  const state = str(dealer.state ?? raw.state);
  const dealerName = str(dealer.name ?? dealer.dealer_name ?? raw.seller_name);
  const dealerPhone = str(dealer.phone ?? dealer.seller_phone);

  const heading =
    str(raw.heading) ||
    [year, make, model, trim].filter(Boolean).join(" ") ||
    "RV listing";

  return {
    id: str(raw.id) || str(raw.mc_dealership_id) || heading,
    heading,
    price: num(raw.price),
    miles: num(raw.miles),
    msrp: num(raw.msrp),
    year,
    make,
    model,
    trim,
    classLabel,
    stockNo: str(raw.stock_no),
    vin: str(raw.vin),
    inventoryType: str(raw.inventory_type),
    distanceMi: num(raw.dist),
    city,
    state,
    dealerName,
    dealerPhone,
    photoUrl: firstPhoto(media),
    vdpUrl: str(raw.vdp_url) || null,
  };
}

function medianPrices(listings: McListingCard[]): number | null {
  const prices = listings
    .map((l) => l.price)
    .filter((p): p is number => p != null && p > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return null;
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2
    ? prices[mid]!
    : Math.round((prices[mid - 1]! + prices[mid]!) / 2);
}

export const Route = createFileRoute("/api/marketcheck/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const year = url.searchParams.get("year")?.trim() || "";
        const make = url.searchParams.get("make")?.trim() || "";
        const model = url.searchParams.get("model")?.trim() || "";
        const zip = (url.searchParams.get("zip") || "").replace(/\D/g, "");
        // Personal plans often cap radius at 100 mi
        const radius = Math.min(
          100,
          Math.max(10, Number(url.searchParams.get("radius") || 100) || 100),
        );

        const rows = Math.min(
          20,
          Math.max(1, Number(url.searchParams.get("rows") || 8) || 8),
        );

        if (!year || !make || !model) {
          return Response.json(
            {
              ok: false,
              error: "year, make, and model are required",
              code: "bad_request",
            },
            { status: 400 },
          );
        }
        if (zip.length !== 5) {
          return Response.json(
            {
              ok: false,
              error: "Enter a valid 5-digit ZIP for local inventory",
              code: "bad_request",
            },
            { status: 400 },
          );
        }

        const apiKey = getKey();
        if (!apiKey) {
          return Response.json(
            {
              ok: false,
              error:
                "MarketCheck not configured. Add MARKETCHECK_API_KEY on the server.",
              code: "missing_key",
            },
            { status: 503 },
          );
        }

        const cacheKey = `${year}|${make.toLowerCase()}|${model.toLowerCase()}|${zip}|${radius}|${rows}`;
        const hit = cache.get(cacheKey);
        if (hit && Date.now() - hit.at < TTL_MS) {
          return Response.json({ ...hit.data, cached: true });
        }

        const mc = new URL(`${MC_BASE}/v2/search/rv/active`);
        mc.searchParams.set("api_key", apiKey);
        mc.searchParams.set("year", year);
        mc.searchParams.set("make", make);
        mc.searchParams.set("model", model);
        mc.searchParams.set("zip", zip);
        mc.searchParams.set("radius", String(radius));
        mc.searchParams.set("rows", String(rows));
        mc.searchParams.set("start", "0");

        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15000);
        try {
          const resp = await fetch(mc.toString(), {
            headers: { Accept: "application/json" },
            signal: ctrl.signal,
          });
          const text = await resp.text();
          let json: Record<string, unknown> = {};
          try {
            json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
          } catch {
            return Response.json(
              {
                ok: false,
                error: `MarketCheck returned non-JSON (${resp.status})`,
                code: "upstream",
              },
              { status: 502 },
            );
          }

          if (!resp.ok) {
            const msg =
              str(json.message || json.error || json.msg) ||
              `MarketCheck HTTP ${resp.status}`;
            // Friendlier radius limit from plan
            const friendly = /radius limit/i.test(msg)
              ? "Your MarketCheck plan allows up to 100 miles radius. Try 100 mi or less."
              : msg;
            return Response.json(
              { ok: false, error: friendly, code: "upstream" },
              { status: 502 },
            );
          }


          const rawList = Array.isArray(json.listings) ? json.listings : [];
          const listings = rawList
            .filter(
              (x): x is Record<string, unknown> =>
                !!x && typeof x === "object",
            )
            .map(mapListing);

          const body: McSearchResult = {
            ok: true,
            numFound: num(json.num_found) ?? listings.length,
            listings,
            radius,
            zip,
            query: { year, make, model },
            cached: false,
            medianPrice: medianPrices(listings),
          };

          cache.set(cacheKey, { at: Date.now(), data: body });
          return Response.json(body, {
            headers: {
              "Cache-Control": "private, max-age=300",
            },
          });
        } catch (e) {
          const msg =
            (e as Error)?.name === "AbortError"
              ? "MarketCheck timed out"
              : e instanceof Error
                ? e.message
                : "MarketCheck request failed";
          return Response.json(
            { ok: false, error: msg, code: "upstream" },
            { status: 502 },
          );
        } finally {
          clearTimeout(t);
        }
      },
    },
  },
});
