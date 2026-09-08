import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  EMPTY_COACH_PROFILE,
  resolveTripsProfileSeed,
  type SuggestCoachFn,
} from "./coachProfile.ts";

const root = dirname(fileURLToPath(import.meta.url));

const stubSuggest: SuggestCoachFn = (opts) => ({
  ...EMPTY_COACH_PROFILE,
  year: opts.year,
  make: opts.make,
  model: opts.model,
  floorplan: opts.floorplan,
});

const FACTS_SESSION_KEY = "rvfax.activeCoach.v1";
const TOW_SESSION_KEY = "rvfax_trips_tow_handoff_v1";
const CAL_SEED_LEAK = "calSeed";

function tripsRuntimeFiles(): string[] {
  const names = readdirSync(root).filter(
    (n) => n.endsWith(".ts") && !n.endsWith(".test.ts"),
  );
  return [
    ...names.map((n) => join(root, n)),
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    join(root, "../../components/rvtrips/RouteBasemap.tsx"),
    join(root, "../../components/rvtrips/RouteMapboxGl.tsx"),
  ];
}

test("GPS seed ignores Facts session and saved-unit coaches", () => {
  const facts = {
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    gvwrLbs: 52000,
  };
  assert.equal(
    resolveTripsProfileSeed({ activeCoach: facts }, stubSuggest),
    null,
  );
  assert.equal(
    resolveTripsProfileSeed(
      {
        savedCoach: {
          year: "2022",
          make: "Keystone",
          model: "Montana",
          floorplan: "3855BR",
        },
      },
      stubSuggest,
    ),
    null,
  );
});

test("Trips runtime never reads Facts / Tow / Cal / Grok session stores", () => {
  const files = tripsRuntimeFiles();
  assert.ok(files.some((f) => f.endsWith("RvTripsApp.tsx")));

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(
      src,
      /readActiveCoach|writeActiveCoach|loadLatestSavedUnit/,
      `${file} must not import Facts session helpers`,
    );
    assert.doesNotMatch(
      src,
      new RegExp(FACTS_SESSION_KEY.replace(/\./g, "\\.")),
      `${file} must not read ${FACTS_SESSION_KEY}`,
    );
    assert.doesNotMatch(
      src,
      /@\/lib\/rv\/savedUnits/,
      `${file} must not read Facts saved units`,
    );
    assert.doesNotMatch(
      src,
      new RegExp(TOW_SESSION_KEY),
      `${file} must not persist/read a Tow session key`,
    );
    if (file.endsWith("RvTripsApp.tsx")) {
      assert.doesNotMatch(
        src,
        /shellNav\?\.activeCoach|nav\?\.activeCoach/,
        "Trips must not subscribe to the suite Facts coach",
      );
      assert.doesNotMatch(src, /FROM FACTS|FROM SAVED/);
      assert.doesNotMatch(
        src,
        new RegExp(`\\b${CAL_SEED_LEAK}\\b`),
        "Trips must not read Cal seed",
      );
      assert.doesNotMatch(src, /readActiveCoach|loadLatestSavedUnit/);
      assert.match(src, /tripsHandoff/, "one-shot Tow→Trips param stays");
      assert.match(src, /decideTowHandoff/);
      assert.match(src, /loadLockedProfile/);
      assert.doesNotMatch(src, /loadTowHandoffOffer|saveTowHandoffOffer/);
    }
  }
});

test("Tow handoff module is one-shot only — no shared session key", () => {
  const src = readFileSync(join(root, "towHandoff.ts"), "utf8");
  assert.doesNotMatch(src, /TOW_HANDOFF_KEY/);
  assert.doesNotMatch(src, /localStorage/);
  assert.doesNotMatch(src, /sessionStorage/);
  assert.doesNotMatch(src, /readActiveCoach|loadLatestSavedUnit/);
  assert.match(src, /decideTowHandoff/);
});
