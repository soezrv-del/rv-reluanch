import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("client exposes autocomplete, dealers, shortlist listing — search stays", () => {
  const client = read("client.ts");
  assert.match(client, /fetchLocalInventory/);
  assert.match(client, /fetchAutocomplete/);
  assert.match(client, /fetchNearbyDealers/);
  assert.match(client, /fetchListingDetail/);
  assert.match(client, /dealer_id/);
  assert.match(client, /\/api\/marketcheck\/autocomplete/);
  assert.match(client, /\/api\/marketcheck\/dealers/);
  assert.match(client, /\/api\/marketcheck\/listing/);
  assert.match(client, /shouldFetchAutocomplete/);
  assert.match(client, /acCache/);
  assert.match(client, /listingCache/);
  assert.match(client, /ONLY when the user opens a shortlisted card/);
});

test("Facts Local inventory uses debounce + shortlist-only detail", () => {
  const ui = read("../../components/rvfax/RvDetail.tsx");
  assert.match(ui, /AUTOCOMPLETE_DEBOUNCE_MS/);
  assert.match(ui, /fetchAutocomplete/);
  assert.match(ui, /fetchNearbyDealers/);
  assert.match(ui, /openShortlistCard/);
  assert.match(ui, /fetchListingDetail\(\{ listingId: card\.id \}\)/);
  assert.doesNotMatch(ui, /invListings\.map\([\s\S]{0,80}fetchListingDetail/);
  assert.match(ui, /yearPad: invYearPad/);
  assert.match(ui, /Years \{invYearWindow\.min\}–\{invYearWindow\.max\}/);
});

test("three free-tier proxies keep the API key server-side", () => {
  const ac = read("../../routes/api/marketcheck.autocomplete.ts");
  const dealers = read("../../routes/api/marketcheck.dealers.ts");
  const listing = read("../../routes/api/marketcheck.listing.ts");
  const search = read("../../routes/api/marketcheck.search.ts");
  for (const src of [ac, dealers, listing, search]) {
    assert.match(src, /getMarketcheckKey/);
    assert.match(src, /api_key/);
    assert.doesNotMatch(src, /VITE_MARKETCHECK/);
  }
  assert.match(ac, /\/v2\/search\/rv\/auto-complete/);
  assert.match(dealers, /\/v2\/dealers\/rv/);
  assert.match(dealers, /clampRadius/);
  assert.match(listing, /\/v2\/listing\/rv\//);
  assert.match(search, /dealer_id/);
  assert.match(search, /\/v2\/search\/rv\/active/);
});
