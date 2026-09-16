import type {
  McDealerCard,
  McListingCard,
  McListingDetail,
  McAutocompleteTerm,
} from "./types";

export function mcNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n =
    typeof v === "number" ? v : Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function mcStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

export function firstPhoto(media: unknown): string | null {
  const urls = photoUrls(media, 1);
  return urls[0] ?? null;
}

export function photoUrls(media: unknown, max = 6): string[] {
  if (!media || typeof media !== "object") return [];
  const m = media as Record<string, unknown>;
  const out: string[] = [];
  const push = (u: unknown) => {
    const s = mcStr(u);
    if (s && /^https?:\/\//i.test(s) && !out.includes(s) && out.length < max) {
      out.push(s);
    }
  };
  push(m.photo_url);
  push(m.photo_link);
  const links = m.photo_links;
  if (Array.isArray(links)) {
    for (const item of links) push(item);
  } else if (links && typeof links === "object") {
    const o = links as Record<string, unknown>;
    for (const k of ["0", "1", "2", "3", "4", "5", "large", "medium", "small"]) {
      push(o[k]);
    }
  }
  return out;
}

export function mapListing(raw: Record<string, unknown>): McListingCard {
  const build = (raw.build || {}) as Record<string, unknown>;
  const dealer = (raw.dealer || {}) as Record<string, unknown>;
  const media = raw.media;

  const year = mcNum(build.year ?? raw.year);
  const make = mcStr(build.make ?? raw.make);
  const model = mcStr(build.model ?? raw.model);
  const trim = mcStr(build.trim ?? build.series ?? raw.trim);
  const classLabel = mcStr(
    build.class ?? build.category ?? raw.class ?? raw.category,
  );

  const city = mcStr(dealer.city ?? raw.city);
  const state = mcStr(dealer.state ?? raw.state);
  const dealerName = mcStr(dealer.name ?? dealer.dealer_name ?? raw.seller_name);
  const dealerPhone = mcStr(dealer.phone ?? dealer.seller_phone);

  const heading =
    mcStr(raw.heading) ||
    [year, make, model, trim].filter(Boolean).join(" ") ||
    "RV listing";

  return {
    id: mcStr(raw.id) || mcStr(raw.mc_dealership_id) || heading,
    heading,
    price: mcNum(raw.price),
    miles: mcNum(raw.miles),
    msrp: mcNum(raw.msrp),
    year,
    make,
    model,
    trim,
    classLabel,
    stockNo: mcStr(raw.stock_no),
    vin: mcStr(raw.vin),
    inventoryType: mcStr(raw.inventory_type),
    distanceMi: mcNum(raw.dist),
    city,
    state,
    dealerName,
    dealerPhone,
    photoUrl: firstPhoto(media),
    vdpUrl: mcStr(raw.vdp_url) || null,
  };
}

export function mapListingDetail(raw: Record<string, unknown>): McListingDetail {
  const card = mapListing(raw);
  const build = (raw.build || {}) as Record<string, unknown>;
  const dealer = (raw.dealer || {}) as Record<string, unknown>;
  const extra = (raw.extra || {}) as Record<string, unknown>;
  const photos = photoUrls(raw.media, 6);
  const comments = mcStr(
    extra.comments ?? extra.seller_comments ?? raw.seller_comments ?? raw.desc,
  );
  return {
    ...card,
    dealerId: mcStr(dealer.id ?? dealer.dealer_id ?? raw.dealer_id),
    dealerStreet: mcStr(dealer.street ?? dealer.address),
    dealerZip: mcStr(dealer.zip ?? dealer.postal_code),
    sellerType: mcStr(raw.seller_type),
    exteriorColor: mcStr(raw.exterior_color ?? raw.base_ext_color ?? build.exterior_color),
    interiorColor: mcStr(raw.interior_color ?? raw.base_int_color ?? build.interior_color),
    fuelType: mcStr(build.fuel_type ?? raw.fuel_type),
    transmission: mcStr(build.transmission ?? raw.transmission),
    photoUrls: photos.length ? photos : card.photoUrl ? [card.photoUrl] : [],
    description: comments.slice(0, 600),
  };
}

export function mapDealer(raw: Record<string, unknown>): McDealerCard {
  const id = mcStr(raw.id ?? raw.dealer_id ?? raw.mc_dealership_id);
  const name = mcStr(
    raw.seller_name ?? raw.name ?? raw.dealer_name ?? "RV dealer",
  );
  return {
    id,
    name,
    street: mcStr(raw.street ?? raw.address),
    city: mcStr(raw.city),
    state: mcStr(raw.state),
    zip: mcStr(raw.zip),
    phone: mcStr(raw.seller_phone ?? raw.phone),
    listingCount: mcNum(raw.listing_count),
    distanceMi: mcNum(raw.dist ?? raw.distance),
    inventoryUrl: mcStr(raw.inventory_url) || null,
  };
}

/** Honest parse of MarketCheck autocomplete `terms` — string[] or {item,count}[]. */
export function mapAutocompleteTerms(raw: unknown): McAutocompleteTerm[] {
  if (!raw) return [];
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "object" && raw && "terms" in raw
      ? (raw as { terms: unknown }).terms
      : [];
  if (!Array.isArray(list)) return [];
  const out: McAutocompleteTerm[] = [];
  for (const item of list) {
    if (typeof item === "string") {
      const term = item.trim();
      if (term) out.push({ term, count: null });
    } else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const term = mcStr(o.item ?? o.term ?? o.value ?? o.name);
      if (term) out.push({ term, count: mcNum(o.count) });
    }
    if (out.length >= 12) break;
  }
  return out;
}
