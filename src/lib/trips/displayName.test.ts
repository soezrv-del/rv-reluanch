import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

const UI_FILES = [
  "../../components/shell/BottomTabs.tsx",
  "../../components/shell/shellConstants.ts",
  "../../components/shell/AppShell.tsx",
  "../../components/rvtrips/RvTripsApp.tsx",
  "../../components/more/MoreApp.tsx",
  "../../components/rvtow/RvTowApp.tsx",
  "../rvgrok/prompts.ts",
  "../rvgrok/originStory.ts",
  "../og/site.json",
] as const;

test("dock, titles, and in-app copy name the GPS tab RV GPS", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  const shell = read("../../components/shell/AppShell.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const prompts = read("../rvgrok/prompts.ts");
  const origin = read("../rvgrok/originStory.ts");
  const og = read("../og/site.json");
  const plist = read("../../../ios/App/App/Info.plist");

  assert.match(
    tabs,
    /\{ id: "rvtrips", label: "RV GPS", short: "RV GPS" \}/,
  );
  assert.doesNotMatch(tabs, /short: "Trips"/);
  assert.doesNotMatch(tabs, /label: "RvTRIPS"/);

  assert.match(constants, /title:\s*"RV GPS"/);
  assert.doesNotMatch(constants, /title:\s*"RvTRIPS"/);

  assert.match(shell, /\? "RV GPS"/);
  assert.doesNotMatch(shell, /"RvTRIPS"/);

  assert.match(trips, />\s*RV GPS\s*</);
  assert.match(trips, /Release to refresh RV GPS/);
  assert.doesNotMatch(trips, /Release to refresh Trips/);
  assert.doesNotMatch(trips, />\s*RvTrips\s*</);

  assert.match(more, /label="RV GPS"/);
  assert.match(more, /"RV GPS — Lock your coach profile/);
  assert.doesNotMatch(more, /label="Trips"/);
  assert.doesNotMatch(more, /sub="RvTrips"/);
  assert.doesNotMatch(more, /RvTrips —/);

  assert.match(tow, /Opens RV GPS Profile/);
  assert.doesNotMatch(tow, /Opens Trips Profile/);

  assert.match(prompts, /RV GPS for the map/);
  assert.doesNotMatch(prompts, /RvTrips for the map/);

  assert.match(origin, /Tow match, RV GPS, and Grok/);
  assert.match(origin, /^RV GPS\. Destination plus an RV profile/m);
  assert.doesNotMatch(origin, /Trips\/GPS/);
  assert.doesNotMatch(origin, /Rv GPS \(Trips\)/);

  assert.match(og, /tow, RV GPS, and Grok/);
  assert.doesNotMatch(og, /tow, trips, and Grok/);

  assert.match(plist, /RV GPS uses your location/);
  assert.doesNotMatch(plist, /RV Trips uses/);
});

test("user-facing GPS copy is exactly RV GPS, never RVGPS or Trips", () => {
  const leftover: string[] = [];
  for (const rel of UI_FILES) {
    const src = read(rel);
    if (/RVGPS/.test(src)) {
      leftover.push(`${rel}: contains one-word RVGPS`);
    }
    const quoted = src.match(/(["'`])(?:(?!\1)[\s\S])*?\1/g) ?? [];
    for (const q of quoted) {
      if (
        /@\/lib\/trips|@\/components\/rvtrips|RvTripsApp|data-trips|rvtrips/.test(
          q,
        )
      ) {
        continue;
      }
      if (/\b(Trips|RvTrips|RvTRIPS)\b/.test(q)) {
        leftover.push(`${rel}: ${q.slice(0, 96)}`);
      }
    }
  }
  assert.deepEqual(leftover, [], leftover.join("\n"));
});
