import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fuzzyMatchCatalogName,
  matchCatalogModelName,
  parseCoachFromText,
} from "./parseCoach.ts";
import {
  applyUniqueCatalogIdentity,
  askNamesCoachIdentity,
  findUniqueCatalogCoachFromModel,
  formatCatalogPresenceNote,
  inspectCatalogPresence,
  lastCompleteParseFromHistory,
  lockIdentityTuple,
  namedCoachConflictsLock,
  sanitizePresenceNote,
  resolveCatalogMake,
  resolveCatalogModel,
  resolveCoachIdentity,
} from "./coachIdentity.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(dir: string, name: string) {
  return readFileSync(join(dir, name), "utf8");
}

const LINEAGE_LOCK = {
  year: "2026",
  make: "Grand Design",
  model: "Lineage Series M",
  floorplan: "25FW",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function catalogLabel(id: {
  year: string;
  make: string;
  model: string;
  floorplan: string;
}): string {
  return [id.year, id.make, id.model, id.floorplan].filter(Boolean).join(" ");
}

test("Integra is Entegra Coach and conflicts with a Lineage lock", () => {
  assert.equal(resolveCatalogMake("Integra"), "Entegra Coach");
  assert.equal(resolveCatalogMake("Entegra"), "Entegra Coach");
  for (const q of ["27A Integra Vision", "Entegra Vision 27ASE"]) {
    const parsed = parseCoachFromText(q);
    assert.equal(askNamesCoachIdentity(parsed), true, q);
    assert.equal(namedCoachConflictsLock(parsed, LINEAGE_LOCK), true, q);
  }
  assert.equal(
    namedCoachConflictsLock(parseCoachFromText("What's the HP?"), LINEAGE_LOCK),
    false,
  );
  assert.equal(
    namedCoachConflictsLock(
      parseCoachFromText("What engine does the Lineage M have?"),
      LINEAGE_LOCK,
    ),
    false,
  );
});

test("a newly named Integra / Entegra Vision ask breaks a sticky Lineage lock", () => {
  const lineageHistory =
    "I'd like to know about the 2026 Grand Design Lineage M series.\nVERIFIED CATALOG LOCK is 2026 Grand Design Lineage Series M.";

  for (const q of ["27A Integra Vision", "Entegra Vision 27ASE"]) {
    const id = resolveCoachIdentity(q, LINEAGE_LOCK, lineageHistory);
    assert.ok(id, q);
    assert.match(id!.make, /Entegra/i, q);
    assert.match(id!.model, /vision/i, q);
    assert.doesNotMatch(id!.make, /Grand Design/i, q);
    assert.doesNotMatch(id!.model, /lineage/i, q);
    assert.equal(id!.source, "message", q);
    assert.match(id!.floorplan, /27A/i, q);
    const label = catalogLabel(id!);
    assert.match(label, /Vision/i, q);
    assert.doesNotMatch(label, /Lineage/i, q);
  }
});

test("same-coach Lineage follow-up without renaming keeps the lock", () => {
  const hp = resolveCoachIdentity("What's the HP on this coach?", LINEAGE_LOCK);
  assert.ok(hp);
  assert.equal(hp!.year, "2026");
  assert.equal(hp!.make, "Grand Design");
  assert.match(hp!.model, /lineage/i);
  assert.equal(hp!.source, "facts");
  assert.doesNotMatch(catalogLabel(hp!), /Vision/i);

  const named = resolveCoachIdentity(
    "What engine does the Lineage M have?",
    LINEAGE_LOCK,
  );
  assert.ok(named);
  assert.equal(named!.year, "2026");
  assert.equal(named!.make, "Grand Design");
  assert.match(named!.model, /lineage/i);
  assert.doesNotMatch(named!.model, /vision/i);
});

test("yearless Vision ask without a lock still resolves Vision, not null", () => {
  const id = resolveCoachIdentity("27A Integra Vision", null, "");
  assert.ok(id);
  assert.match(id!.make, /Entegra/i);
  assert.match(id!.model, /vision/i);
  assert.equal(id!.floorplan, "27A");
  assert.equal(id!.source, "message");
});

test("spoken Integras / 27A Vision inventory asks break a Lineage lock", () => {
  const lineageHistory =
    "I'd like to know about the 2026 Grand Design Lineage M series.\nVERIFIED CATALOG LOCK is 2026 Grand Design Lineage Series M.";
  for (const q of [
    "Can you look in my inventory for a 27A Vision?",
    "I need to know if we have any Integras with a E Vision 27As in our inventory.",
  ]) {
    const parsed = parseCoachFromText(q);
    assert.equal(askNamesCoachIdentity(parsed), true, q);
    assert.equal(namedCoachConflictsLock(parsed, LINEAGE_LOCK), true, q);
    const id = resolveCoachIdentity(q, LINEAGE_LOCK, lineageHistory);
    assert.ok(id, q);
    assert.match(id!.make, /Entegra/i, q);
    assert.match(id!.model, /vision/i, q);
    assert.doesNotMatch(id!.make, /Grand Design/i, q);
    assert.doesNotMatch(id!.model, /lineage/i, q);
    assert.equal(id!.source, "message", q);
  }
});

const VENTANA_LOCK = {
  year: "2018",
  make: "Newmar",
  model: "Ventana",
  floorplan: "4369",
  updatedAt: "2018-06-01T00:00:00.000Z",
};

test("4-digit Newmar floorplans parse; Dutch Star is not a year", () => {
  const q = parseCoachFromText("look up 2022 Dutch Star 4369");
  assert.equal(q.year, "2022");
  assert.equal(q.make, "Newmar");
  assert.match(q.model, /dutch star/i);
  assert.equal(q.floorplan, "4369");
  assert.equal(askNamesCoachIdentity(q), true);
  assert.doesNotMatch(q.model, /ventana/i);
});

test("2019 Grand Design Solitude 310GK parses floorplan 310GK — not a $50k leftover", () => {
  for (const q of [
    "2019 Grand Design Solitude 310GK",
    "Give me the spec report on the 2019 Grand Design Solitude 310GK. Name the year, make, model, and floorplan.",
  ]) {
    const parsed = parseCoachFromText(q);
    assert.equal(parsed.year, "2019", q);
    assert.equal(parsed.make, "Grand Design", q);
    assert.match(parsed.model, /solitude/i, q);
    assert.equal(parsed.floorplan, "310GK", q);
    const id = resolveCoachIdentity(q, null, "");
    assert.ok(id, q);
    assert.equal(id!.year, "2019", q);
    assert.equal(id!.make, "Grand Design", q);
    assert.match(id!.model, /solitude/i, q);
    assert.equal(id!.floorplan, "310GK", q);
    assert.equal(id!.source, "message", q);
  }
});

test("after a Ventana 4369 report, Dutch Star 4369 does not return Ventana", () => {
  const history =
    "Give me a report on the 2018 Newmar Ventana 4369.\nVERIFIED CATALOG LOCK is 2018 Newmar Ventana 4369.";

  for (const q of [
    "look up 2022 Dutch Star 4369",
    "2022 Newmar Dutch Star 4369",
    "Newmar Dutch Star 4369",
  ]) {
    const parsed = parseCoachFromText(q);
    assert.equal(askNamesCoachIdentity(parsed), true, q);
    assert.equal(namedCoachConflictsLock(parsed, VENTANA_LOCK), true, q);
    const id = resolveCoachIdentity(q, VENTANA_LOCK, history);
    assert.ok(id, q);
    assert.match(id!.make, /Newmar/i, q);
    assert.match(id!.model, /dutch star/i, q);
    assert.doesNotMatch(id!.model, /ventana/i, q);
    assert.equal(id!.source, "message", q);
    if (/2022/.test(q)) assert.equal(id!.year, "2022", q);
    if (/4369/.test(q)) assert.equal(id!.floorplan, "4369", q);
    assert.doesNotMatch(catalogLabel(id!), /Ventana/i, q);
  }

  const yearless = resolveCoachIdentity(
    "Newmar Dutch Star 4369",
    VENTANA_LOCK,
    "look up 2022 Dutch Star 4369",
  );
  assert.ok(yearless);
  assert.match(yearless!.model, /dutch star/i);
  assert.equal(yearless!.year, "2022");
  assert.doesNotMatch(yearless!.model, /ventana/i);
  assert.notEqual(yearless!.year, "2018");
});

test("catalog presence is honest: Dutch Star is not a missing Ventana", () => {
  const ds = inspectCatalogPresence({
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
  });
  assert.notEqual(ds.status, "missing-series");
  assert.match(ds.model, /dutch star/i);
  assert.doesNotMatch(ds.model, /ventana/i);
  const dsNote = formatCatalogPresenceNote(ds);
  assert.doesNotMatch(dsNote, /ventana/i);
  assert.doesNotMatch(dsNote, /SERIES MISSING/i);

  const yearless = inspectCatalogPresence({
    year: "",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
  });
  assert.ok(yearless.status === "series" || yearless.status === "missing-year");
  const yearlessNote = formatCatalogPresenceNote(yearless);
  assert.match(yearlessNote, /YEAR MISSING/i);
  assert.doesNotMatch(yearlessNote, /SERIES MISSING/i);
  assert.doesNotMatch(yearlessNote, /ventana/i);

  const vent = inspectCatalogPresence({
    year: "2018",
    make: "Newmar",
    model: "Ventana",
    floorplan: "4369",
  });
  assert.notEqual(vent.status, "missing-series");
  assert.match(vent.model, /ventana/i);
  assert.doesNotMatch(vent.model, /dutch star/i);
});

test("Ventana follow-up without renaming keeps the Ventana lock", () => {
  const hp = resolveCoachIdentity("What's the HP on this coach?", VENTANA_LOCK);
  assert.ok(hp);
  assert.equal(hp!.year, "2018");
  assert.match(hp!.model, /ventana/i);
  assert.equal(hp!.source, "facts");
});

test("lock-break is wired through chat, voice, and the API stream", () => {
  const identity = src(root, "coachIdentity.ts");
  const grounding = src(root, "grounding.ts");
  const app = src(join(root, "../../components/rvgrok"), "RvGrokApp.tsx");
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(identity, /namedCoachConflictsLock/);
  assert.match(identity, /queryNamesCoach/);
  assert.match(grounding, /resolveCoachIdentity/);
  assert.match(grounding, /THIS turn's lock/);
  assert.match(app, /filter\(\(m\) => m\.role === "user"\)/);
  assert.match(api, /lastNamesCoach/);
  assert.match(api, /askNamesCoachIdentity/);
  const realtime = src(root, "realtime.ts");
  assert.match(realtime, /namedCoachConflictsLock/);
  assert.match(realtime, /pushCatalogLockToSession/);
  assert.match(realtime, /flushLockBreakAnswer/);
  assert.match(realtime, /onDeskSheet/);
});

test("pheaton typo and year+model asks lock 2020 Tiffin Phaeton 40IH", () => {
  assert.equal(
    fuzzyMatchCatalogName("pheaton", ["Phaeton", "Allegro", "Zephyr"]),
    "Phaeton",
  );
  assert.equal(matchCatalogModelName("pheaton", ["Phaeton", "Allegro"]), "Phaeton");
  assert.equal(resolveCatalogModel("Tiffin", "pheaton"), "Phaeton");

  for (const q of [
    "What's the gvwr of a 2020 pheaton 40ih",
    "What's the factory GVWR of a 2020 Tiffin Phaeton 40IH?",
    "2020 pheaton 40IH",
  ]) {
    const parsed = parseCoachFromText(q);
    assert.equal(parsed.year, "2020", q);
    assert.match(parsed.make, /tiffin/i, q);
    assert.match(parsed.model, /phaeton/i, q);
    assert.doesNotMatch(parsed.model, /pheaton/i, q);
    assert.match(parsed.floorplan, /40ih/i, q);
    assert.equal(askNamesCoachIdentity(parsed), true, q);

    const id = resolveCoachIdentity(q, null, "");
    assert.ok(id, q);
    assert.equal(id!.year, "2020", q);
    assert.equal(id!.make, "Tiffin", q);
    assert.equal(id!.model, "Phaeton", q);
    assert.match(id!.floorplan, /40ih/i, q);
  }
});

test("Dutch Star is Newmar only — never Grand Design + leftover 25FW / 2020", () => {
  const typed = parseCoachFromText("2020 Grand Design Dutch Star 25fw");
  assert.equal(typed.make, "Newmar");
  assert.match(typed.model, /dutch star/i);
  assert.doesNotMatch(typed.make, /Grand Design/i);

  const locked = lockIdentityTuple({
    year: "2020",
    make: "Grand Design",
    model: "Dutch Star",
    floorplan: "25fw",
    source: "message",
  });
  assert.equal(locked.make, "Newmar");
  assert.equal(locked.model, "Dutch Star");

  const frankensteinHistory = [
    "2020 tiffin phaeton 40ih",
    "2025 grand design lineage 25fw",
    "what about the holding tanks",
  ].join("\n");
  const last = lastCompleteParseFromHistory(frankensteinHistory);
  assert.ok(last);
  assert.equal(last!.year, "2025");
  assert.equal(last!.make, "Grand Design");
  assert.match(last!.model, /lineage/i);
  assert.match(last!.floorplan, /25fw/i);
  assert.doesNotMatch(last!.model, /dutch star/i);

  const followUp = resolveCoachIdentity(
    "put the spec sheet on the desk",
    LINEAGE_LOCK,
    frankensteinHistory,
  );
  assert.ok(followUp);
  assert.equal(followUp!.year, "2025");
  assert.equal(followUp!.make, "Grand Design");
  assert.match(followUp!.model, /lineage/i);
  assert.match(followUp!.floorplan, /25fw/i);
  assert.doesNotMatch(followUp!.model, /dutch star/i);
  assert.doesNotMatch(followUp!.make + followUp!.model, /Grand DesignDutch Star|Grand Design Dutch Star/i);

  const afterDutch = resolveCoachIdentity(
    "what's the gvwr",
    LINEAGE_LOCK,
    `${frankensteinHistory}\ndutch star`,
  );
  assert.ok(afterDutch);
  assert.equal(afterDutch!.make, "Newmar");
  assert.match(afterDutch!.model, /dutch star/i);
  assert.doesNotMatch(afterDutch!.make, /Grand Design/i);
  assert.doesNotMatch(afterDutch!.floorplan, /25fw/i);
  assert.notEqual(afterDutch!.year, "2020");

  const mixedAsk = resolveCoachIdentity(
    "2020 Grand Design Dutch Star 25fw",
    LINEAGE_LOCK,
    frankensteinHistory,
  );
  assert.ok(mixedAsk);
  assert.equal(mixedAsk!.make, "Newmar");
  assert.match(mixedAsk!.model, /dutch star/i);
  assert.doesNotMatch(mixedAsk!.make, /Grand Design/i);

  const ghostNote = formatCatalogPresenceNote({
    status: "missing-series",
    make: "Grand Design",
    model: "Dutch Star",
  });
  assert.doesNotMatch(ghostNote, /Say the series is missing/i);
  assert.doesNotMatch(ghostNote, /Do not substitute another series/i);
  assert.doesNotMatch(ghostNote, /Tell the truth/i);
});

test("2026 Grand Design Lineage 31ZW keys Lineage Series F — not a family ghost", () => {
  const q = "2026 Grand Design Lineage 31ZW";
  const parsed = parseCoachFromText(q);
  assert.equal(parsed.year, "2026");
  assert.equal(parsed.make, "Grand Design");
  assert.match(parsed.model, /^lineage$/i);
  assert.equal(parsed.floorplan, "31ZW");

  assert.equal(
    resolveCatalogModel("Grand Design", "Lineage", "31ZW"),
    "Lineage Series F",
  );
  assert.equal(
    resolveCatalogModel("Grand Design", "Lineage", "31ZW5"),
    "Lineage Series F",
  );
  assert.match(
    resolveCatalogModel("Grand Design", "Lineage", "25FW"),
    /^lineage$/i,
    "25FW is not this Super C pin — do not invent Series M here",
  );
  assert.match(
    resolveCatalogModel("Grand Design", "Lineage Series M", "31ZW"),
    /lineage series m/i,
    "spoken Series M stays Series M — floorplan does not steal",
  );

  const id = resolveCoachIdentity(q, null, "");
  assert.ok(id);
  assert.equal(id!.year, "2026");
  assert.equal(id!.make, "Grand Design");
  assert.equal(id!.model, "Lineage Series F");
  assert.equal(id!.floorplan, "31ZW");
  assert.doesNotMatch(id!.make, /newmar/i);
  assert.doesNotMatch(id!.model, /dutch star/i);

  const presence = inspectCatalogPresence(id!);
  assert.notEqual(presence.status, "missing-series");
  if (presence.status === "exact" || presence.status === "year-series") {
    assert.equal(presence.model, "Lineage Series F");
    assert.equal(presence.floorplan, "31ZW");
  }
  assert.doesNotMatch(formatCatalogPresenceNote(presence), /SERIES MISSING/i);

  const dutch = resolveCoachIdentity("2022 Dutch Star 4369", null, "");
  assert.ok(dutch);
  assert.equal(dutch!.make, "Newmar");
  assert.match(dutch!.model, /dutch star/i);
  assert.doesNotMatch(dutch!.make, /Grand Design/i);
});

test("spoken 31W Z / 31WZ is the Lineage Super C 31ZW", () => {
  for (const q of [
    "2026 Grand Design Lineage 31W Z",
    "2026 Grand Design Lineage 31 WZ",
    "2026 Grand Design Lineage 31WZ",
    "2026 Lineage 31W Z",
  ]) {
    const parsed = parseCoachFromText(q);
    assert.match(parsed.floorplan.replace(/\s+/g, ""), /31w/i, q);
    const id = resolveCoachIdentity(q, null, "");
    assert.ok(id, q);
    assert.equal(id!.make, "Grand Design", q);
    assert.equal(id!.model, "Lineage Series F", q);
    assert.equal(id!.floorplan, "31ZW", q);
  }
});

test("typed 312W is the Lineage Super C 31ZW", () => {
  const q = "2026 Grand Design Lineage 312W";
  const id = resolveCoachIdentity(q, null, "");
  assert.ok(id);
  assert.equal(id!.make, "Grand Design");
  assert.equal(id!.model, "Lineage Series F");
  assert.equal(id!.floorplan, "31ZW");
});

test("Lineage is Grand Design — never blank make or SERIES MISSING", () => {
  const dutchFacts = {
    year: "2019",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
    updatedAt: "2019-06-01T00:00:00.000Z",
  };

  for (const q of ["Lineage", "Lineage 25FW", "Grand Design Lineage"]) {
    const parsed = parseCoachFromText(q);
    assert.equal(parsed.make, "Grand Design", q);
    assert.match(parsed.model, /lineage/i, q);
    const id = resolveCoachIdentity(q, dutchFacts, "2019 Newmar Dutch Star 4369");
    assert.ok(id, q);
    assert.equal(id!.make, "Grand Design", q);
    assert.match(id!.model, /lineage/i, q);
    assert.doesNotMatch(id!.make, /Newmar/i, q);
    assert.doesNotMatch(id!.model, /dutch star/i, q);
    if (!/25fw/i.test(q)) {
      assert.doesNotMatch(id!.floorplan, /4369/, q);
    }
    const presence = inspectCatalogPresence(id!);
    assert.notEqual(presence.status, "missing-series", q);
    const note = formatCatalogPresenceNote(presence);
    assert.doesNotMatch(note, /SERIES MISSING/i, q);
    assert.doesNotMatch(note, /Say the series is missing/i, q);
    assert.doesNotMatch(note, /Tell the truth/i, q);
  }

  const blankMake = inspectCatalogPresence({
    year: "",
    make: "",
    model: "Lineage",
    floorplan: "",
  });
  assert.notEqual(blankMake.status, "missing-series");
  assert.equal(blankMake.make, "Grand Design");
  assert.match(blankMake.model, /lineage/i);

  const locked = lockIdentityTuple({
    year: "",
    make: "",
    model: "Lineage Series M",
    floorplan: "25FW",
    source: "message",
  });
  assert.equal(locked.make, "Grand Design");
  assert.match(locked.model, /lineage series m/i);

  assert.doesNotMatch(
    sanitizePresenceNote(
      "SERIES MISSING — Grand Design Lineage is not in the verified catalog. Say the series is missing. Do not substitute another series. Tell the truth (do not fill in a gap).",
    ),
    /Say the series is missing|Tell the truth|Do not substitute|do not fill in a gap/i,
  );
});

test("salesman shorthand American Dream 42Q locks American Coach — not null", () => {
  const q = "American Dream 42Q";
  const parsed = parseCoachFromText(q);
  assert.equal(parsed.make, "American Coach", q);
  assert.match(parsed.model, /american dream/i, q);
  assert.equal(parsed.floorplan, "42Q", q);
  assert.equal(askNamesCoachIdentity(parsed), true, q);

  const id = resolveCoachIdentity(q, null, "");
  assert.ok(id, q);
  assert.equal(id!.make, "American Coach");
  assert.equal(id!.model, "American Dream");
  assert.equal(id!.floorplan, "42Q");
  assert.equal(id!.year, "");
  assert.doesNotMatch(id!.model, /tradition/i);
});

test("Americn Dream typo uniquely maps to American Coach American Dream", () => {
  const unique = findUniqueCatalogCoachFromModel("Americn Dream");
  assert.ok(unique);
  assert.equal(unique!.make, "American Coach");
  assert.equal(unique!.model, "American Dream");

  const parsed = applyUniqueCatalogIdentity(
    "Americn Dream 42Q",
    parseCoachFromText("Americn Dream 42Q"),
  );
  assert.equal(parsed.make, "American Coach");
  assert.match(parsed.model, /american dream/i);

  const id = resolveCoachIdentity("Americn Dream 42Q", null, "");
  assert.ok(id);
  assert.equal(id!.make, "American Coach");
  assert.equal(id!.model, "American Dream");
  assert.equal(id!.floorplan, "42Q");
});

test("yearless Phaeton 40IH / Lineage 31ZW still resolve one identity tuple", () => {
  const phaeton = resolveCoachIdentity("Phaeton 40IH", null, "");
  assert.ok(phaeton);
  assert.equal(phaeton!.make, "Tiffin");
  assert.equal(phaeton!.model, "Phaeton");
  assert.match(phaeton!.floorplan, /40ih/i);

  const lineage = resolveCoachIdentity("Lineage 31ZW", null, "");
  assert.ok(lineage);
  assert.equal(lineage!.make, "Grand Design");
  assert.equal(lineage!.model, "Lineage Series F");
  assert.equal(lineage!.floorplan, "31ZW");
});

test("unique catalog fill does not steal Dutch Star onto another make", () => {
  const dutch = resolveCoachIdentity("Dutch Star 4369", null, "");
  assert.ok(dutch);
  assert.equal(dutch!.make, "Newmar");
  assert.match(dutch!.model, /dutch star/i);
  assert.doesNotMatch(dutch!.make, /Grand Design|American Coach/i);
});
