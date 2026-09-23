import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COACH_KNOWLEDGE_SCHEMA_VERSION,
  PRICE_FIELD_TTL_MS,
  SPEC_FIELD_TTL_MS,
  coachKnowledgeKeyEquals,
  formatCoachKnowledgeNotes,
  gateKnowledgeFields,
  isKnowledgeFieldFresh,
  isRejectedKnowledgeValue,
  mergeConfirmedFields,
  normalizeCoachKnowledgeKey,
  parseConfirmedFieldsFromNotes,
  planCoachKnowledgeRead,
  planCoachKnowledgeWrite,
  shouldSkipLiveForAsk,
} from "./coachKnowledge.ts";
import { executeWebResearch } from "./webResearchTelemetry.ts";
import { clearWebSearchCache } from "./webSearch.ts";
import { CHAT_MAY_WRITE_FACTS_CACHE } from "./grounding.ts";

const root = dirname(fileURLToPath(import.meta.url));
const workspace = join(root, "../../..");

function src(rel: string) {
  return readFileSync(join(workspace, rel), "utf8");
}

function field(value: string, kind: "spec" | "price" = "spec", at = new Date().toISOString()) {
  return { value, kind, researchedAt: at };
}

test("normalize keys the desk tuple; Dutch Star is Newmar only", () => {
  const ds = normalizeCoachKnowledgeKey({
    year: "2022",
    make: "",
    model: "Dutch Star",
    floorplan: "4369",
  });
  assert.ok(ds);
  assert.equal(ds!.year, "2022");
  assert.equal(ds!.make, "newmar");
  assert.match(ds!.model, /dutch star/);
  assert.equal(ds!.floorplan, "4369");

  const leftover = normalizeCoachKnowledgeKey({
    year: "2022",
    make: "Grand Design",
    model: "Dutch Star",
    floorplan: "4369",
  });
  assert.ok(leftover);
  assert.equal(leftover!.make, "newmar");
  assert.doesNotMatch(leftover!.make, /grand design/);
  assert.equal(coachKnowledgeKeyEquals(ds, leftover), true);
});

test("identity tuple never merges Dutch Star 4369 with Ventana 4369", () => {
  const ds = normalizeCoachKnowledgeKey({
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
  });
  const vent = normalizeCoachKnowledgeKey({
    year: "2022",
    make: "Newmar",
    model: "Ventana",
    floorplan: "4369",
  });
  assert.ok(ds && vent);
  assert.equal(coachKnowledgeKeyEquals(ds, vent), false);
  assert.match(ds!.model, /dutch star/);
  assert.match(vent!.model, /ventana/);
});

test("incomplete identity (no year or series) cannot key the sidecar", () => {
  assert.equal(
    normalizeCoachKnowledgeKey({
      year: "",
      make: "Newmar",
      model: "Dutch Star",
      floorplan: "4369",
    }),
    null,
  );
  assert.equal(
    normalizeCoachKnowledgeKey({
      year: "2022",
      make: "",
      model: "",
      floorplan: "4369",
    }),
    null,
  );
});

test("merge keeps confirmed non-null fields and ignores empty incoming", () => {
  const existing = {
    gvwr: field("51000 lb"),
    engine: field("Cummins L9"),
  };
  const merged = mergeConfirmedFields(existing, {
    uvw: field("40700 lb"),
    engine: field(""),
    chassis: field("   "),
  });
  assert.equal(merged.gvwr?.value, "51000 lb");
  assert.equal(merged.engine?.value, "Cummins L9");
  assert.equal(merged.uvw?.value, "40700 lb");
  assert.equal(merged.chassis, undefined);
});

test("reject EST-only, UNAVAILABLE, and miss language as stored truth", () => {
  assert.equal(isRejectedKnowledgeValue("51,000 lb typical class range (EST)"), true);
  assert.equal(isRejectedKnowledgeValue("UNAVAILABLE"), true);
  assert.equal(isRejectedKnowledgeValue("WEB SEARCH NOT AVAILABLE this turn"), true);
  assert.equal(isRejectedKnowledgeValue("Could not find a published GVWR"), true);
  assert.equal(isRejectedKnowledgeValue("unknown"), true);
  assert.equal(isRejectedKnowledgeValue("51000 lb"), false);
  assert.equal(isRejectedKnowledgeValue("Cummins L9 450 HP"), false);

  const parsedEst = parseConfirmedFieldsFromNotes(
    "CONFIRMED: no. GVWR 32,000 lb typical class range (EST).",
    "what's the gvwr of a 2022 Newmar Dutch Star 4369",
  );
  assert.equal(parsedEst.gvwr, undefined);

  const parsedMiss = parseConfirmedFieldsFromNotes(
    "WEB SEARCH NOT AVAILABLE this turn. GVWR 51000 lb",
    "what's the gvwr of a 2022 Newmar Dutch Star 4369",
  );
  assert.deepEqual(parsedMiss, {});
});

test("parse confirmed OEM notes into storeable fields", () => {
  const notes =
    "CONFIRMED: yes. Newmar Corp brochure for the 2022 Dutch Star 4369 lists GVWR 51,000 lb, engine: Cummins L9, horsepower: 450 HP, GCWR 67,000 lb.";
  const parsed = parseConfirmedFieldsFromNotes(
    notes,
    "what's the gvwr of a 2022 Newmar Dutch Star 4369",
  );
  assert.equal(parsed.gvwr?.value.includes("51,000") || parsed.gvwr?.value.includes("51000"), true);
  assert.match(parsed.engine?.value || "", /Cummins L9/i);
  assert.match(parsed.horsepower?.value || "", /450/);
  assert.equal(parsed.gvwr?.kind, "spec");
});

test("price fields are short TTL; spec fields last until 90d or schema bump", () => {
  const now = Date.parse("2026-09-23T00:00:00.000Z");
  const price = field(
    "Low / Average / High $180k / $210k / $240k",
    "price",
    "2026-09-20T00:00:00.000Z",
  );
  const spec = field("51000 lb", "spec", "2026-08-01T00:00:00.000Z");
  assert.equal(isKnowledgeFieldFresh(price, now), true);
  assert.equal(
    isKnowledgeFieldFresh(
      field(price.value, "price", "2026-09-01T00:00:00.000Z"),
      now,
    ),
    false,
  );
  assert.equal(isKnowledgeFieldFresh(spec, now), true);
  assert.equal(
    isKnowledgeFieldFresh(field(spec.value, "spec", "2026-06-01T00:00:00.000Z"), now),
    false,
  );
  assert.equal(PRICE_FIELD_TTL_MS, 7 * 24 * 60 * 60 * 1000);
  assert.equal(SPEC_FIELD_TTL_MS, 90 * 24 * 60 * 60 * 1000);

  const staleSchema = field("51000 lb", "spec", "2026-09-22T00:00:00.000Z");
  assert.equal(
    isKnowledgeFieldFresh(staleSchema, now, COACH_KNOWLEDGE_SCHEMA_VERSION + 1),
    false,
  );
});

test("read plan skips live only for a fresh queried field", () => {
  const key = normalizeCoachKnowledgeKey({
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
  })!;
  const record = {
    key,
    fields: { gvwr: field("51000 lb") },
    sources: ["oem brochure"],
    researchedAt: new Date().toISOString(),
    confidence: "high" as const,
    schemaVersion: COACH_KNOWLEDGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };
  const skip = planCoachKnowledgeRead({
    identity: key,
    query: "what's the gvwr of a 2022 Newmar Dutch Star 4369",
    record,
  });
  assert.ok(skip);
  assert.equal(skip!.skipLive, true);
  assert.match(skip!.notes, /51000 lb/);
  assert.equal(shouldSkipLiveForAsk("full spec report for 2022 Dutch Star 4369", skip!.fresh), false);

  const otherKey = normalizeCoachKnowledgeKey({
    year: "2022",
    make: "Newmar",
    model: "Ventana",
    floorplan: "4369",
  })!;
  const stolen = planCoachKnowledgeRead({
    identity: otherKey,
    query: "what's the gvwr of a 2022 Newmar Ventana 4369",
    record,
  });
  assert.ok(stolen);
  assert.equal(stolen!.skipLive, false);
  assert.equal(stolen!.notes, "");
});

test("write plan rejects EST, catalog-pin salvage, and unconfirmed notes", () => {
  const identity = {
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
    source: "message" as const,
  };
  assert.equal(
    planCoachKnowledgeWrite({
      identity,
      query: "what's the gvwr of a 2022 Newmar Dutch Star 4369",
      result: {
        ok: true,
        notes: "GVWR 32,000 lb typical class range (EST)",
        model: "grok-4.7",
      },
    }),
    null,
  );
  assert.equal(
    planCoachKnowledgeWrite({
      identity,
      query: "what's the gvwr of a 2022 Newmar Dutch Star 4369",
      result: {
        ok: true,
        notes: "VERIFIED GVWR 47000 from OEM pin",
        model: "catalog-pin",
      },
    }),
    null,
  );
  assert.equal(
    planCoachKnowledgeWrite({
      identity,
      query: "what's the gvwr of a 2022 Newmar Dutch Star 4369",
      result: { ok: false, reason: "no XAI_API_KEY on the server" },
    }),
    null,
  );

  const ok = planCoachKnowledgeWrite({
    identity,
    query: "what's the gvwr of a 2022 Newmar Dutch Star 4369",
    result: {
      ok: true,
      notes:
        "CONFIRMED: yes. OEM brochure lists GVWR 51,000 lb, engine: Cummins L9, horsepower: 450 HP.",
      model: "grok-4.7",
      confirmed: true,
    },
  });
  assert.ok(ok);
  assert.equal(ok!.key.make, "newmar");
  assert.match(ok!.fields.gvwr?.value || "", /51,000|51000/);
});

test("gate drops sibling-series diesel theft on Entegra Vision", () => {
  const key = normalizeCoachKnowledgeKey({
    year: "2023",
    make: "Entegra Coach",
    model: "Vision",
    floorplan: "27A",
  });
  assert.ok(key);
  const gated = gateKnowledgeFields(key!, {
    engine: field("Cummins L9 diesel pusher"),
    horsepower: field("450 HP"),
    gvwr: field("22000 lb"),
  });
  assert.equal(gated.engine, undefined);
  assert.equal(gated.horsepower, undefined);
  assert.ok(gated.gvwr);
});

test("fresh sidecar field skips live research; Facts cache flag stays false", async () => {
  assert.equal(CHAT_MAY_WRITE_FACTS_CACHE, false);
  const key = normalizeCoachKnowledgeKey({
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
  })!;
  const record = {
    key,
    fields: { gvwr: field("51000 lb") },
    sources: ["oem brochure"],
    researchedAt: new Date().toISOString(),
    confidence: "high" as const,
    schemaVersion: COACH_KNOWLEDGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };
  let fetchCalled = false;
  let wrote = false;
  const prior = globalThis.fetch;
  clearWebSearchCache();
  globalThis.fetch = (async () => {
    fetchCalled = true;
    throw new Error("live research should be skipped");
  }) as typeof fetch;
  try {
    const body = await executeWebResearch({
      query: "what's the gvwr of a 2022 Newmar Dutch Star 4369",
      apiKey: "test-key",
      timeoutMs: 100,
      profile: "chat",
      skipGate: true,
      researchProvider: "xai",
      identity: {
        year: "2022",
        make: "Newmar",
        model: "Dutch Star",
        floorplan: "4369",
        source: "message",
      },
      knowledge: {
        load: () => record,
        upsert: () => {
          wrote = true;
        },
      },
    });
    assert.equal(body.ok, true);
    assert.equal(body.kind, "knowledge_hit");
    if (body.ok) {
      assert.match(body.notes, /51000 lb/);
      assert.equal(body.model, "coach-knowledge");
    }
    assert.equal(fetchCalled, false);
    assert.equal(wrote, false);
  } finally {
    globalThis.fetch = prior;
  }
});

test("shared sidecar is Neon research-only; Facts cache and DialaBot stay out", () => {
  const knowledge = src("src/lib/rvgrok/coachKnowledge.ts");
  const store = src("src/lib/rvgrok/coachKnowledgeStore.ts");
  const telemetry = src("src/lib/rvgrok/webResearchTelemetry.ts");
  const grounding = src("src/lib/rvgrok/grounding.ts");
  const cache = src("src/lib/rv/verifiedCatalogCache.ts");
  const migration = src("migrations/0006_rvgrok_coach_knowledge.sql");

  assert.match(grounding, /CHAT_MAY_WRITE_FACTS_CACHE = false/);
  assert.match(knowledge, /CHAT_MAY_WRITE_FACTS_CACHE stays false/);
  assert.match(store, /rvgrok_coach_knowledge/);
  assert.match(store, /getSql/);
  assert.doesNotMatch(store, /requireUserId/);
  assert.doesNotMatch(store, /authMiddleware/);
  assert.doesNotMatch(store, /verifiedCatalogCache|saveVerifiedDossier/);
  assert.doesNotMatch(store, /dial_phonebook|bland/i);
  assert.match(telemetry, /planCoachKnowledgeRead/);
  assert.match(telemetry, /planCoachKnowledgeWrite/);
  assert.match(telemetry, /knowledge_hit/);
  assert.doesNotMatch(telemetry, /CHAT_MAY_WRITE_FACTS_CACHE = true/);
  assert.match(cache, /Chat answers must never call saveVerifiedDossier/);
  assert.match(migration, /rvgrok_coach_knowledge/);
  assert.match(migration, /primary key \(year, make, model, floorplan\)/);
  assert.doesNotMatch(migration, /^\s*user_id\b/m);

  const chat = src("src/routes/api/rvgrok.ts");
  const voice = src("src/routes/api/rvgrok.web-research.ts");
  assert.match(chat, /executeWebResearch/);
  assert.match(chat, /identity: serverGrounded.identity/);
  assert.match(voice, /executeWebResearch/);
  assert.match(voice, /identity: grounded.identity/);
  assert.doesNotMatch(chat, /DialaBot/);
  assert.doesNotMatch(voice, /DialaBot/);
  assert.doesNotMatch(knowledge, /DialaBot/);

  const notes = formatCoachKnowledgeNotes(keyFixture(), { gvwr: field("51000 lb") });
  assert.match(notes, /SHARED COACH KNOWLEDGE/);
  assert.doesNotMatch(notes, /Facts cache/);
});

function keyFixture() {
  return normalizeCoachKnowledgeKey({
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
  })!;
}
