import assert from "node:assert/strict";
import test from "node:test";
import {
  mapAutocompleteTerms,
  mapDealer,
  mapListing,
  mapListingDetail,
} from "./map.ts";

test("mapListing reads nested build/dealer without inventing fields", () => {
  const card = mapListing({
    id: "abc-1",
    heading: "2022 Fleetwood Discovery",
    price: 189000,
    miles: 12000,
    build: { year: 2022, make: "Fleetwood", model: "Discovery" },
    dealer: { name: "Puyallup RV", city: "Puyallup", state: "WA" },
    media: { photo_links: ["https://example.com/a.jpg"] },
  });
  assert.equal(card.id, "abc-1");
  assert.equal(card.make, "Fleetwood");
  assert.equal(card.model, "Discovery");
  assert.equal(card.year, 2022);
  assert.equal(card.dealerName, "Puyallup RV");
  assert.equal(card.photoUrl, "https://example.com/a.jpg");
  assert.equal(card.price, 189000);
});

test("mapDealer keeps id/name/count from a dealers/rv stub", () => {
  const d = mapDealer({
    id: "dealer-9",
    seller_name: "Tacoma RV",
    city: "Tacoma",
    state: "WA",
    listing_count: 14,
    dist: 12.4,
  });
  assert.equal(d.id, "dealer-9");
  assert.equal(d.name, "Tacoma RV");
  assert.equal(d.listingCount, 14);
  assert.equal(d.distanceMi, 12.4);
});

test("mapListingDetail is a richer card — extra photos only when present", () => {
  const detail = mapListingDetail({
    id: "abc-1",
    heading: "2022 Fleetwood Discovery",
    price: 189000,
    vin: "1F65F5DY0N0A12345",
    seller_type: "dealer",
    build: { year: 2022, make: "Fleetwood", model: "Discovery", fuel_type: "Diesel" },
    dealer: { id: "dealer-9", name: "Puyallup RV", street: "100 Lot Rd", zip: "98374" },
    media: {
      photo_links: [
        "https://example.com/a.jpg",
        "https://example.com/b.jpg",
      ],
    },
    extra: { comments: "One-owner coach." },
  });
  assert.equal(detail.dealerId, "dealer-9");
  assert.equal(detail.fuelType, "Diesel");
  assert.equal(detail.description, "One-owner coach.");
  assert.deepEqual(detail.photoUrls, [
    "https://example.com/a.jpg",
    "https://example.com/b.jpg",
  ]);
});

test("autocomplete terms accept both MC response shapes", () => {
  assert.deepEqual(mapAutocompleteTerms(["Forest River", "Foretravel"]), [
    { term: "Forest River", count: null },
    { term: "Foretravel", count: null },
  ]);
  assert.deepEqual(
    mapAutocompleteTerms({
      terms: [{ item: "Discovery", count: 4 }],
    }),
    [{ term: "Discovery", count: 4 }],
  );
});
