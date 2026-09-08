import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { isFiniteCoord } from "./planTrip.ts";
import {
  featuredRvDestinations,
  filterRvDestinations,
  mergeDestSuggestions,
  RV_DESTINATIONS,
  rvDestinationKindLabel,
} from "./rvDestinations.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("RV destination list is ~100 unique geocodable places", () => {
  assert.ok(
    RV_DESTINATIONS.length >= 95 && RV_DESTINATIONS.length <= 110,
    `expected ~100 destinations, got ${RV_DESTINATIONS.length}`,
  );
  const labels = RV_DESTINATIONS.map((d) => d.label);
  assert.equal(new Set(labels).size, labels.length, "labels must be unique");
  for (const dest of RV_DESTINATIONS) {
    assert.ok(dest.label.length > 3, dest.label);
    assert.ok(dest.label.includes(","), dest.label);
    assert.ok(isFiniteCoord(dest.lat, dest.lng), dest.label);
    assert.ok(["city", "park", "rv"].includes(dest.kind), dest.label);
  }
  for (const label of [
    "Seattle, WA",
    "Portland, OR",
    "Glacier National Park, MT",
    "Yellowstone National Park, WY",
    "Quartzsite, AZ",
    "Elkhart, IN",
    "Banff, AB",
  ]) {
    assert.ok(
      RV_DESTINATIONS.some((d) => d.label === label),
      `missing ${label}`,
    );
  }
});

test("featured dests stay the classic five planner chips", () => {
  const featured = featuredRvDestinations();
  assert.equal(featured.length, 5);
  assert.equal(featured[0]?.label, "Seattle, WA");
  assert.equal(featured[4]?.label, "Quartzsite, AZ");
});

test("filterRvDestinations matches city and park names", () => {
  assert.equal(filterRvDestinations("").length, RV_DESTINATIONS.length);
  assert.equal(filterRvDestinations("   ").length, RV_DESTINATIONS.length);
  const yellow = filterRvDestinations("yellow");
  assert.ok(yellow.some((d) => d.label.startsWith("Yellowstone")));
  assert.ok(filterRvDestinations("quartz").some((d) => d.label.startsWith("Quartzsite")));
  assert.ok(filterRvDestinations("BANFF").some((d) => d.label.startsWith("Banff")));
  assert.equal(filterRvDestinations("zzzz-not-a-place").length, 0);
});

test("mergeDestSuggestions puts live geocode hits first without dup labels", () => {
  const browse = mergeDestSuggestions("", [
    { label: "Seaside, OR", lat: 45.99, lng: -123.92, kind: "city" },
  ]);
  assert.equal(browse.length, RV_DESTINATIONS.length);
  assert.equal(browse[0]?.label, "Seattle, WA");

  const merged = mergeDestSuggestions("sea", [
    { label: "Seaside, OR", lat: 45.99, lng: -123.92, kind: "city" },
    { label: "Seattle, WA", lat: 47.6062, lng: -122.3321, kind: "city" },
  ]);
  assert.equal(merged[0]?.label, "Seaside, OR");
  assert.equal(merged.filter((d) => d.label === "Seattle, WA").length, 1);
  assert.ok(merged.some((d) => d.label === "Seattle, WA"));
});

test("kind labels stay short for the dropdown", () => {
  assert.equal(rvDestinationKindLabel("park"), "Park");
  assert.equal(rvDestinationKindLabel("rv"), "RV hub");
  assert.equal(rvDestinationKindLabel("city"), "Town");
});

test("Where to? uses a rolling dest dropdown, not five dest pills", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(ui, /mergeDestSuggestions/);
  assert.match(ui, /data-dest-suggest/);
  assert.match(ui, /max-h-60/);
  assert.match(ui, /overflow-y-auto/);
  assert.match(ui, /placeholder="Where to\?"/);
  assert.match(ui, /PLAN_VIA_CHIPS/);
  assert.doesNotMatch(ui, /PLAN_DEST_CHIPS/);
});
