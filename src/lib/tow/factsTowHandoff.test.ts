import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  decideFactsTowHandoff,
  normalizeFactsTowOffer,
  offerFromFactsReport,
  towFormPatchFromPrefill,
  towPrefillFromOffer,
} from "./factsTowHandoff.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

const montana = {
  year: "2022",
  make: "Keystone",
  model: "Montana",
  floorplan: "3855BR",
  rvType: "Fifth Wheel",
  gvwrLbs: 16500,
};

const dream = {
  year: "2023",
  make: "American Coach",
  model: "American Dream",
  floorplan: "45A",
  rvType: "Class A Diesel",
  gvwrLbs: 52000,
  towingCapacityLbs: 15000,
};

test("narrow offer drops price / UVW / session extras", () => {
  const offer = normalizeFactsTowOffer({
    ...montana,
    towingCapacityLbs: 0,
    price: 379000,
    uvwLbs: 12000,
    updatedAt: "2026-09-01",
  } as typeof montana & {
    price: number;
    uvwLbs: number;
    updatedAt: string;
  });
  assert.ok(offer);
  assert.equal(offer.make, "Keystone");
  assert.equal(offer.gvwrLbs, 16500);
  assert.equal("price" in offer, false);
  assert.equal("uvwLbs" in offer, false);
  assert.equal("updatedAt" in offer, false);
  assert.equal(offer.towingCapacityLbs, undefined);
});

test("offerFromFactsReport is Facts-owned — GVWR from brochure string, no price", () => {
  const offer = offerFromFactsReport({
    year: "2022",
    make: "Keystone",
    model: "Montana",
    floorplan: "3855BR",
    rvType: "Fifth Wheel",
    gvwr: "16,500 lbs",
    towingCapacityLbs: null,
  });
  assert.ok(offer);
  assert.equal(offer.gvwrLbs, 16500);
  assert.equal("price" in offer, false);
  assert.equal(offerFromFactsReport({ year: "2024", make: "Ford", model: "" }), null);
});

test("decideFactsTowHandoff: towable patches RV type + GVWR, reverse shop", () => {
  const { prefill, patch } = decideFactsTowHandoff(montana);
  assert.equal(prefill.kind, "towable");
  assert.equal(patch.kind, "towable");
  if (patch.kind !== "towable") return;
  assert.equal(patch.rvType, "Fifth Wheel");
  assert.equal(patch.gvwr, "16500");
  assert.equal(patch.shopMode, "reverse");
});

test("decideFactsTowHandoff: motorhome is honest toad — never Fifth Wheel + 0 lbs", () => {
  const { prefill, patch } = decideFactsTowHandoff(dream);
  assert.equal(prefill.kind, "motorhome");
  assert.equal(patch.kind, "motorhome");
  if (prefill.kind === "motorhome") {
    assert.equal(prefill.offer.towingCapacityLbs, 15000);
  }
  if (patch.kind !== "motorhome") return;
  assert.equal(patch.shopMode, "match");
  assert.equal(patch.year, "");
  assert.equal(patch.make, "");
  assert.equal(patch.model, "");
  assert.equal(patch.trim, "");
  assert.equal(patch.rvType, "Travel Trailer");
  assert.equal(patch.gvwr, "");
  assert.equal(patch.pin, "");
});

test("decideFactsTowHandoff: missing coach is a no-op — no invented truck or trailer", () => {
  const { prefill, patch } = decideFactsTowHandoff(null);
  assert.equal(prefill.kind, "none");
  assert.equal(patch.kind, "none");
  assert.equal(normalizeFactsTowOffer({ make: "Ford", model: "F-350" }), null);
  assert.equal(towPrefillFromOffer(null).kind, "none");
  assert.equal(towFormPatchFromPrefill({ kind: "none" }).kind, "none");
});

test("RvTowApp: dock is clean; only the narrow Facts handoff prefills", () => {
  const ui = src("../../components/rvtow/RvTowApp.tsx");
  assert.match(ui, /towHandoff/);
  assert.match(ui, /clearTowHandoff/);
  assert.match(ui, /normalizeFactsTowOffer/);
  assert.match(ui, /towFormPatchFromPrefill/);
  assert.match(ui, /lastHandoffToken/);
  assert.match(ui, /setAppliedOffer/);
  assert.match(ui, /arrivedStandalone/);
  assert.match(ui, /restoreStandaloneTruck/);
  assert.match(ui, /if \(appliedOffer\) return/);
  assert.match(ui, /bootTowVehicle/);
  assert.match(ui, /loadLastTowVehicle/);
  assert.doesNotMatch(ui, /nav\?\.activeCoach/);
  assert.doesNotMatch(ui, /nav\.activeCoach/);
  assert.doesNotMatch(ui, /readActiveCoach/);
  assert.doesNotMatch(ui, /towPrefillFromCoach/);
  assert.doesNotMatch(ui, /calSeed/);
  assert.doesNotMatch(ui, /tripsHandoff/);
  assert.doesNotMatch(ui, /factsShareToken/);
  assert.doesNotMatch(ui, /openCalWithPrice/);
});

test("AppShell Check-tow handoff is one-shot; dock tab does not set it", () => {
  const shell = src("../../components/shell/AppShell.tsx");
  const nav = src("../../components/shell/ShellNavContext.ts");
  const tabs = src("../../components/shell/BottomTabs.tsx");

  assert.match(nav, /openTowWithCoach/);
  assert.match(nav, /towHandoff/);
  assert.match(nav, /clearTowHandoff/);
  assert.match(nav, /FactsTowHandoff/);
  assert.match(nav, /FactsTowHandoffOffer/);
  assert.doesNotMatch(nav, /openTowWithCoach: \(offer\?: ActiveCoachInput/);

  assert.match(shell, /openTowWithCoach/);
  assert.match(shell, /setTowHandoff/);
  assert.match(shell, /normalizeFactsTowOffer/);
  assert.match(shell, /setTab\("rvtow"\)/);

  const onTab = shell.match(
    /const onTabChange = useCallback\(\s*\(next: AppTab\) => \{[\s\S]*?\}, \[/,
  );
  assert.ok(onTab, "onTabChange present");
  assert.doesNotMatch(onTab[0], /openTowWithCoach/);
  assert.doesNotMatch(onTab[0], /setTowHandoff/);

  assert.match(tabs, /onChange\(id\)/);
  assert.doesNotMatch(tabs, /openTowWithCoach/);
  assert.doesNotMatch(tabs, /towHandoff/);
});

test("Facts owns Check tow and sends the narrow payload — not ActiveCoach", () => {
  const detail = src("../../components/rvfax/RvDetail.tsx");
  assert.match(detail, /openTowWithCoach/);
  assert.match(detail, /Check tow/);
  assert.match(detail, /data-facts-check-tow/);
  assert.match(detail, /offerFromFactsReport/);
  assert.match(detail, /factsTowOffer/);
  assert.doesNotMatch(detail, /setTab\("rvtow"\)/);
  assert.doesNotMatch(detail, /openTowWithCoach\(snapshotActiveCoach/);
  assert.doesNotMatch(detail, /openTowWithCoach\(shellNav\.activeCoach/);
});

test("Tow header does not inherit the persistent Facts coach chip", () => {
  const page = src("../../components/shell/SuitePage.tsx");
  assert.match(page, /tab === "rvcal" \? <ActiveCoachChip/);
  assert.doesNotMatch(page, /tab === "rvcal" \|\| tab === "rvtow"/);
});
