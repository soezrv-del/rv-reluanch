import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseLotSnapshotJson } from "../lot/ownLotPage.ts";
import {
  buildFactsShare,
  buildLotUnitShare,
  buildShareDocument,
  factsShareUrl,
  lotShareUrl,
  readFactsShareSearch,
  readLotUnitParam,
  shareScreen,
  weightShareValue,
  type SharePayload,
} from "./screenShare.ts";

const here = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(here, rel), "utf8");
}

const ORIGIN = "https://rvmax.app";

test("Facts share keeps on-screen specs and drops missing ones", () => {
  const doc = buildFactsShare({
    year: "2024",
    make: "Entegra",
    model: "Cornerstone",
    floorplan: "45W",
    className: "Class A Diesel",
    rating: "8.4",
    specsOpen: true,
    overview: [
      { label: "LENGTH", value: "should not duplicate" },
    ],
    specs: [
      { label: "LENGTH", value: "44′ 11″" },
      { label: "WIDTH", value: "—" },
      { label: "ENGINE", value: "" },
      {
        label: "GVWR",
        value: "18,000 lbs · smallest in series · confirm sticker",
      },
      { label: "TORQUE", value: "1,450 lb-ft" },
      { label: "HORSEPOWER", value: "GAP" },
      { label: "Scraped at", value: "2026-09-25" },
      { label: "Image count", value: "12" },
      { label: "Lot code", value: "PEW" },
      { label: "Id", value: "168635" },
    ],
    powerToWeight: { label: "Power to weight", value: "8.2" },
    origin: ORIGIN,
  });

  assert.equal(doc.title, "2024 Entegra Cornerstone 45W");
  assert.match(doc.text, /^2024 Entegra Cornerstone 45W\n/);
  assert.match(doc.text, /Class: Class A Diesel/);
  assert.match(doc.text, /RvFOX rating: 8\.4/);
  assert.match(doc.text, /LENGTH: 44′ 11″/);
  assert.match(
    doc.text,
    /GVWR: 18,000 lbs · smallest in series · confirm sticker/,
  );
  assert.match(doc.text, /TORQUE: 1,450 lb-ft/);
  assert.match(doc.text, /Power to weight: 8\.2/);
  assert.doesNotMatch(doc.text, /should not duplicate/);
  assert.doesNotMatch(doc.text, /WIDTH/);
  assert.doesNotMatch(doc.text, /ENGINE/);
  assert.doesNotMatch(doc.text, /HORSEPOWER/);
  assert.doesNotMatch(doc.text, /Scraped at|Image count|Lot code|\bId\b/);
  assert.doesNotMatch(doc.text, /2026-09-25|168635|\bPEW\b/);
  assert.ok(doc.text.endsWith(`\n\n${doc.url}`));
  const again = readFactsShareSearch(new URL(doc.url).search);
  assert.deepEqual(again, {
    year: "2024",
    make: "Entegra",
    model: "Cornerstone",
    floorplan: "45W",
  });
});

test("Facts share without a spec sheet uses the hero tiles only", () => {
  const doc = buildFactsShare({
    year: "2022",
    make: "Grand Design",
    model: "Reflection",
    floorplan: "",
    className: "Fifth Wheel",
    rating: "7.1",
    specsOpen: false,
    overview: [
      { label: "LENGTH", value: "33′ 2″" },
      { label: "SLIDEOUTS", value: "—" },
      { label: "SLEEPS", value: "4" },
    ],
    specs: [{ label: "GVWR", value: "16,000 lbs" }],
    powerToWeight: { label: "Power to weight", value: "GAP" },
    origin: ORIGIN,
  });
  assert.equal(doc.title, "2022 Grand Design Reflection");
  assert.match(doc.text, /LENGTH: 33′ 2″/);
  assert.match(doc.text, /SLEEPS: 4/);
  assert.doesNotMatch(doc.text, /SLIDEOUTS|GVWR|Power to weight/);
  assert.equal(readFactsShareSearch("?facts="), null);
  assert.equal(readFactsShareSearch("?facts=%7B%7D"), null);
});

test("series confirm labels stay, and a sticker placeholder does not", () => {
  assert.equal(
    weightShareValue({
      seriesEstimate: true,
      catalogValue: "Cummins 6.7L · smallest in series · confirm",
    }),
    "Cummins 6.7L · smallest in series · confirm",
  );
  assert.equal(
    weightShareValue({
      seriesEstimate: true,
      catalogValue: "18,000 lbs · smallest in series · confirm sticker",
    }),
    "18,000 lbs · smallest in series · confirm sticker",
  );
  assert.equal(
    weightShareValue({
      seriesEstimate: true,
      catalogValue: "Sticker lbs",
    }),
    null,
  );
  assert.equal(
    weightShareValue({
      overrideLbs: 22000,
      catalogValue: "18,000 lbs · smallest in series · confirm sticker",
      seriesEstimate: true,
    }),
    "22,000 lbs · Override",
  );
});

test("lot share includes price and stock and skips gaps and back office", () => {
  const view = parseLotSnapshotJson({
    units: [
      {
        year: "2027",
        make: "Thor Motor Coach",
        model: "Inception",
        trim: "38DX",
        body_type: "Class Super C",
        price: 305995,
        stock_number: "47492",
        vin: "4UZADVFC7VCWZ8275",
        condition: "New",
        location: "Mesa AZ",
        gvwr: 0,
        engine: "",
        vehicle_body_length: 39.83,
        max_sleeping_count: 4,
        scraped_at: "2026-09-25T19:23:55-07:00",
        id: 168635,
        image_count: 14,
        lot_code: "MES",
        detail_fetched: true,
        url: "https://rvcountry.com/inventory/secret-listing",
        source: "own",
        photo: "https://cdn.example/unit.jpg",
      },
    ],
  });
  const doc = buildLotUnitShare(view.units[0]!, ORIGIN);
  assert.equal(doc.title, "2027 Thor Motor Coach Inception 38DX");
  assert.match(doc.text, /Type: Super C/);
  assert.match(doc.text, /Price: \$305,995/);
  assert.match(doc.text, /Stock: 47492/);
  assert.match(doc.text, /Location: Mesa AZ/);
  assert.match(doc.text, /Condition: New/);
  assert.match(doc.text, /VIN: 4UZADVFC7VCWZ8275/);
  assert.match(doc.text, /Length: /);
  assert.match(doc.text, /Sleeps: 4/);
  assert.doesNotMatch(doc.text, /GVWR/);
  assert.doesNotMatch(doc.text, /Engine/);
  assert.doesNotMatch(doc.text, /168635|secret-listing|image count|lot code|scraped/i);
  assert.doesNotMatch(doc.text, /\bMES\b/);
  assert.equal(doc.url, lotShareUrl("47492", ORIGIN));
  assert.equal(readLotUnitParam(new URL(doc.url).search), "47492");
});

test("lot share omits a missing price and still links the stock number", () => {
  const view = parseLotSnapshotJson({
    units: [
      {
        year: "2025",
        make: "Entegra",
        model: "Launch",
        trim: "",
        stock_number: "45282",
        price: null,
        vin: "",
        location: "",
        condition: "Used",
      },
    ],
  });
  const doc = buildLotUnitShare(view.units[0]!, ORIGIN);
  assert.equal(doc.title, "2025 Entegra Launch");
  assert.doesNotMatch(doc.text, /Price|VIN|Location|Trim/);
  assert.match(doc.text, /Stock: 45282/);
  assert.match(doc.text, /Condition: Used/);
  assert.equal(new URL(doc.url).searchParams.get("unit"), "45282");
});

test("facts and lot links round-trip names that contain reserved characters", () => {
  const facts = factsShareUrl(
    {
      year: "2023",
      make: "Newmar",
      model: "Dutch Star & Co",
      floorplan: '40" A',
    },
    ORIGIN,
  );
  assert.deepEqual(readFactsShareSearch(new URL(facts).search), {
    year: "2023",
    make: "Newmar",
    model: "Dutch Star & Co",
    floorplan: '40" A',
  });
  const lot = lotShareUrl("A/B 12", ORIGIN);
  assert.equal(readLotUnitParam(new URL(lot).search), "A/B 12");
});

test("share falls back to copying the summary plus the link", async () => {
  const doc = buildShareDocument({
    title: "2024 Entegra Cornerstone 45W",
    lines: [{ label: "GVWR", value: "49,000 lbs" }],
    url: "https://rvmax.app/?facts=1",
  });
  const copied: string[] = [];
  const outcome = await shareScreen(doc, {
    writeText: async (text) => {
      copied.push(text);
    },
  });
  assert.equal(outcome, "copied");
  assert.equal(copied.length, 1);
  assert.match(copied[0]!, /2024 Entegra Cornerstone 45W/);
  assert.match(copied[0]!, /GVWR: 49,000 lbs/);
  assert.match(copied[0]!, /https:\/\/rvmax\.app\/\?facts=1/);
});

test("cancelling the share sheet does not copy or throw", async () => {
  let writes = 0;
  const outcome = await shareScreen(
    {
      title: "Unit",
      text: "Unit\n\nhttps://rvmax.app/lot?unit=1",
      url: "https://rvmax.app/lot?unit=1",
    },
    {
      share: async () => {
        throw new DOMException("Share canceled", "AbortError");
      },
      writeText: async () => {
        writes += 1;
      },
    },
  );
  assert.equal(outcome, "cancelled");
  assert.equal(writes, 0);
});

test("a lot photo is attached only when canShare accepts the file", async () => {
  const seen: SharePayload[] = [];
  const doc = {
    title: "2027 Thor Motor Coach Inception 38DX",
    text: "2027 Thor Motor Coach Inception 38DX\n\nhttps://rvmax.app/lot?unit=47492",
    url: "https://rvmax.app/lot?unit=47492",
    photoUrl: "https://cdn.example/unit.jpg",
  };
  const outcome = await shareScreen(doc, {
    canShare: (data) => Boolean(data.files?.length),
    share: async (data) => {
      seen.push(data);
    },
    fetch: async () =>
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      }),
  });
  assert.equal(outcome, "shared");
  assert.equal(seen.length, 1);
  assert.equal(seen[0]?.files?.length, 1);
  assert.equal(seen[0]?.files?.[0]?.type, "image/jpeg");
  assert.equal(seen[0]?.text?.includes("https://"), false);
  assert.equal(seen[0]?.url, doc.url);
});

test("a failed or slow photo still shares the text and link", async () => {
  const seen: SharePayload[] = [];
  const doc = {
    title: "Unit",
    text: "Unit\nPrice: $1\n\nhttps://rvmax.app/lot?unit=9",
    url: "https://rvmax.app/lot?unit=9",
    photoUrl: "https://cdn.example/blocked.jpg",
  };
  const failed = await shareScreen(doc, {
    canShare: () => true,
    share: async (data) => {
      seen.push(data);
    },
    fetch: async () => {
      throw new Error("CORS");
    },
    photoTimeoutMs: 50,
  });
  assert.equal(failed, "shared");
  assert.equal(seen[0]?.files, undefined);
  assert.match(seen[0]?.text || "", /Price: \$1/);

  const started = Date.now();
  const slow = await shareScreen(doc, {
    canShare: () => true,
    share: async (data) => {
      seen.push(data);
    },
    fetch: () => new Promise(() => undefined),
    photoTimeoutMs: 40,
  });
  assert.equal(slow, "shared");
  assert.ok(Date.now() - started < 400);
  assert.equal(seen.at(-1)?.files, undefined);
  assert.equal(seen.at(-1)?.url, doc.url);
});

test("Facts and lot screens mount Share and the cold-load deep links", () => {
  const detail = read("../../components/rvfax/RvDetail.tsx");
  const lot = read("../../components/lot/LotStockApp.tsx");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  assert.match(detail, /ScreenShareButton/);
  assert.match(detail, /buildFactsShare/);
  assert.match(lot, /ScreenShareButton/);
  assert.match(lot, /buildLotUnitShare/);
  assert.match(lot, /bootSearchQuery/);
  assert.match(fax, /bootSearchQuery/);
  assert.match(fax, /readFactsShareSearch/);
  assert.match(shell, /readFactsShareSearch\(bootSearchQuery\(\)\)/);
  assert.doesNotMatch(lot, /GVWR|Length|Slides|Sleeps|RvFAX/);
});
