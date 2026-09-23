import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHAT_MAY_WRITE_FACTS_CACHE } from "./grounding.ts";
import {
  extractCatalogFieldPin,
  parseResearchOrder,
  planCatalogFirstSkip,
  researchOrderStatus,
  resolveResearchOrder,
} from "./researchOrder.ts";
import { clearWebSearchCache } from "./webSearch.ts";
import { executeWebResearch } from "./webResearchTelemetry.ts";

const root = dirname(fileURLToPath(import.meta.url));
const workspace = join(root, "../../..");

function src(rel: string) {
  return readFileSync(join(workspace, rel), "utf8");
}

const PINNED = [
  "VERIFIED CATALOG / BROCHURE for 2022 Tiffin Phaeton 40IH (source: message):",
  "- engine: Cummins L9  [catalog]",
  "- horsepower: 450 HP  [catalog]",
  "- torque: 1250 lb-ft  [EST — not a single locked number]",
  "- chassis: Freightliner XC  [catalog]",
  "- fuel: Diesel  [catalog]",
  "LOCKED WEIGHTS (OEM pin — speak these; never claim GAP for a VERIFIED field):",
  "- VERIFIED GVWR 39600 from OEM pin",
  "- UVW: GAP — no OEM pin. Conversational answer may give a labeled EST.",
].join("\n");

const EST_ONLY = [
  "VERIFIED CATALOG / BROCHURE for 2023 Entegra Vision 27A:",
  "- engine: Ford 7.3L Godzilla  [EST — not a single locked number]",
  "- horsepower: 350 HP typical class range (EST)",
  "- UVW: GAP — no OEM pin",
].join("\n");

test("default research order is search-first; catalog-first is opt-in", () => {
  assert.equal(resolveResearchOrder(undefined), "search-first");
  assert.equal(resolveResearchOrder(""), "search-first");
  assert.equal(resolveResearchOrder("bogus"), "search-first");
  assert.equal(parseResearchOrder("catalog-first"), "catalog-first");
  assert.equal(parseResearchOrder("CATALOG_FIRST"), "catalog-first");
  assert.equal(parseResearchOrder("search-first"), "search-first");
  assert.equal(parseResearchOrder("claude"), null);
  const unset = researchOrderStatus({ override: null });
  assert.equal(unset.effective, "search-first");
  assert.equal(unset.override, null);
  const flipped = researchOrderStatus({ override: "catalog-first" });
  assert.equal(flipped.effective, "catalog-first");
});

test("extractCatalogFieldPin accepts real pins and rejects EST / GAP / miss", () => {
  assert.equal(extractCatalogFieldPin(PINNED, "gvwr"), "GVWR 39600");
  assert.equal(extractCatalogFieldPin(PINNED, "engine"), "Cummins L9");
  assert.equal(extractCatalogFieldPin(PINNED, "horsepower"), "450 HP");
  assert.equal(extractCatalogFieldPin(PINNED, "uvw"), null);
  assert.equal(extractCatalogFieldPin(PINNED, "torque"), null);
  assert.equal(extractCatalogFieldPin(EST_ONLY, "engine"), null);
  assert.equal(extractCatalogFieldPin(EST_ONLY, "horsepower"), null);
  assert.equal(extractCatalogFieldPin("", "gvwr"), null);
  assert.equal(extractCatalogFieldPin(PINNED, "repair"), null);
  assert.equal(extractCatalogFieldPin(PINNED, "price"), null);
  assert.equal(extractCatalogFieldPin(PINNED, "generic"), null);
});

test("catalog-first skipLive only on a real asked-field pin", () => {
  const gvwr = planCatalogFirstSkip({
    order: "catalog-first",
    query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
    catalogBlock: PINNED,
  });
  assert.equal(gvwr.skipLive, true);
  assert.equal(gvwr.field, "gvwr");
  assert.match(gvwr.notes, /39600/);

  const uvwMiss = planCatalogFirstSkip({
    order: "catalog-first",
    query: "What's the UVW of a 2022 Tiffin Phaeton 40IH?",
    catalogBlock: PINNED,
  });
  assert.equal(uvwMiss.skipLive, false);

  const estEngine = planCatalogFirstSkip({
    order: "catalog-first",
    query: "What engine does a 2023 Entegra Vision have?",
    catalogBlock: EST_ONLY,
  });
  assert.equal(estEngine.skipLive, false);

  const report = planCatalogFirstSkip({
    order: "catalog-first",
    query: "full spec report for 2022 Tiffin Phaeton 40IH",
    catalogBlock: PINNED,
  });
  assert.equal(report.skipLive, false, "generic / full report still browses");

  const repair = planCatalogFirstSkip({
    order: "catalog-first",
    query: "slide won't retract on a 2022 Tiffin Phaeton 40IH",
    catalogBlock: PINNED,
  });
  assert.equal(repair.skipLive, false);

  const price = planCatalogFirstSkip({
    order: "catalog-first",
    query: "what's a 2022 Tiffin Phaeton 40IH going for",
    catalogBlock: PINNED,
  });
  assert.equal(price.skipLive, false);
});

test("search-first never skips live on a brochure pin", () => {
  const search = planCatalogFirstSkip({
    order: "search-first",
    query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
    catalogBlock: PINNED,
  });
  assert.equal(search.skipLive, false);
  assert.equal(
    planCatalogFirstSkip({
      query: "What's the GVWR of a 2022 Tiffin Phaeton 40IH?",
      catalogBlock: PINNED,
    }).skipLive,
    false,
    "unset order stays search-first",
  );
});

test("executeWebResearch: catalog-first pin skips live; search-first and miss browse", async () => {
  assert.equal(CHAT_MAY_WRITE_FACTS_CACHE, false);
  const query = "What's the GVWR of a 2022 Tiffin Phaeton 40IH?";
  const missQuery = "What's the UVW of a 2022 Tiffin Phaeton 40IH?";
  const prior = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("live research should be skipped for a real pin");
  }) as typeof fetch;
  try {
    clearWebSearchCache();
    const catalogHit = await executeWebResearch({
      query,
      catalogBlock: PINNED,
      apiKey: "test-key",
      timeoutMs: 80,
      profile: "chat",
      skipGate: true,
      researchProvider: "xai",
      researchOrder: "catalog-first",
    });
    assert.equal(catalogHit.ok, true);
    assert.equal(catalogHit.kind, "catalog_hit");
    if (catalogHit.ok) {
      assert.match(catalogHit.notes, /39600|GVWR/i);
      assert.equal(catalogHit.model, "catalog-pin");
    }
    assert.equal(fetchCalls, 0, "real pin must not browse under catalog-first");

    fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      throw Object.assign(new Error("The operation was aborted due to timeout"), {
        name: "TimeoutError",
      });
    }) as typeof fetch;

    const searchFirst = await executeWebResearch({
      query,
      catalogBlock: PINNED,
      apiKey: "test-key",
      timeoutMs: 80,
      profile: "chat",
      skipGate: true,
      researchProvider: "xai",
      researchOrder: "search-first",
    });
    assert.ok(fetchCalls > 0, "search-first still browses a locked spec ask");
    assert.notEqual(searchFirst.kind, "catalog_hit");

    fetchCalls = 0;
    const miss = await executeWebResearch({
      query: missQuery,
      catalogBlock: PINNED,
      apiKey: "test-key",
      timeoutMs: 80,
      profile: "chat",
      skipGate: true,
      researchProvider: "xai",
      researchOrder: "catalog-first",
    });
    assert.ok(fetchCalls > 0, "catalog-first miss still browses");
    assert.notEqual(miss.kind, "catalog_hit");
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("catalog-first knowledge_hit still short-circuits a fresh Neon field", async () => {
  const prior = globalThis.fetch;
  let fetchCalled = false;
  globalThis.fetch = (async () => {
    fetchCalled = true;
    throw new Error("knowledge_hit should win in both modes");
  }) as typeof fetch;
  try {
    clearWebSearchCache();
    const body = await executeWebResearch({
      query: "what's the gvwr of a 2022 Newmar Dutch Star 4369",
      catalogBlock: PINNED,
      apiKey: "test-key",
      timeoutMs: 80,
      profile: "chat",
      skipGate: true,
      researchProvider: "xai",
      researchOrder: "search-first",
      identity: {
        year: "2022",
        make: "Newmar",
        model: "Dutch Star",
        floorplan: "4369",
        source: "message",
      },
      knowledge: {
        load: () => ({
          key: {
            year: "2022",
            make: "newmar",
            model: "dutch star",
            floorplan: "4369",
          },
          fields: {
            gvwr: {
              value: "51000 lb",
              kind: "spec",
              researchedAt: new Date().toISOString(),
            },
          },
          sources: ["oem brochure"],
          researchedAt: new Date().toISOString(),
          confidence: "high",
          schemaVersion: 1,
          updatedAt: new Date().toISOString(),
        }),
      },
    });
    assert.equal(body.kind, "knowledge_hit");
    assert.equal(fetchCalled, false);

    const catalogFirst = await executeWebResearch({
      query: "what's the gvwr of a 2022 Newmar Dutch Star 4369",
      catalogBlock: PINNED,
      apiKey: "test-key",
      timeoutMs: 80,
      profile: "chat",
      skipGate: true,
      researchProvider: "xai",
      researchOrder: "catalog-first",
      identity: {
        year: "2022",
        make: "Newmar",
        model: "Dutch Star",
        floorplan: "4369",
        source: "message",
      },
      knowledge: {
        load: () => ({
          key: {
            year: "2022",
            make: "newmar",
            model: "dutch star",
            floorplan: "4369",
          },
          fields: {
            gvwr: {
              value: "51000 lb",
              kind: "spec",
              researchedAt: new Date().toISOString(),
            },
          },
          sources: ["oem brochure"],
          researchedAt: new Date().toISOString(),
          confidence: "high",
          schemaVersion: 1,
          updatedAt: new Date().toISOString(),
        }),
      },
    });
    assert.equal(catalogFirst.kind, "knowledge_hit");
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = prior;
    clearWebSearchCache();
  }
});

test("research order reuses ops settings; DialaBot and Facts cache stay out", () => {
  assert.equal(CHAT_MAY_WRITE_FACTS_CACHE, false);
  const order = src("src/lib/rvgrok/researchOrder.ts");
  const store = src("src/lib/rvgrok/researchOrderStore.ts");
  const telemetry = src("src/lib/rvgrok/webResearchTelemetry.ts");
  const admin = src("src/routes/api/access.admin.ts");
  const chat = src("src/routes/api/rvgrok.ts");
  const voice = src("src/routes/api/rvgrok.web-research.ts");
  const card = src("src/components/access/ResearchOrderCard.tsx");

  assert.match(store, /rvgrok_ops_settings/);
  assert.match(store, /research_order/);
  assert.match(store, /RESEARCH_ORDER_OVERRIDE_CACHE_TTL_MS/);
  assert.doesNotMatch(store, /authMiddleware|requireUserId|localStorage/);
  assert.doesNotMatch(store, /dial_phonebook|bland|DialaBot/i);
  assert.match(telemetry, /planCatalogFirstSkip/);
  assert.match(telemetry, /catalog_hit/);
  assert.match(admin, /setResearchOrderOverride/);
  assert.match(admin, /getResearchOrderOverride/);
  assert.match(admin, /action === "research-order"/);
  assert.match(chat, /getResearchOrderOverride|readEffectiveResearchOrder/);
  assert.match(voice, /getResearchOrderOverride|readEffectiveResearchOrder/);
  assert.doesNotMatch(chat, /body\.researchOrder|x-research-order/);
  assert.doesNotMatch(voice, /body\.researchOrder|x-research-order/);
  assert.match(card, /data-research-order/);
  assert.match(card, /Effective now/);
  assert.doesNotMatch(card, /localStorage/);
  assert.match(order, /search-first/);
  assert.doesNotMatch(order, /CHAT_MAY_WRITE_FACTS_CACHE = true/);
});
