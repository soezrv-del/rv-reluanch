import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  lotPriceOrGap,
  lotTextOrGap,
  parseLotSnapshotJson,
  type LotUnit,
} from "../lot/ownLotPage.ts";
import {
  NEWEST_ARRIVALS,
  SHOWROOM_SPOTLIGHT,
  arrivalsForHome,
  coverVariant,
  newestArrivals,
  spotlightLotUnit,
  spotlightSpecs,
} from "./homeCoach.ts";

const root = dirname(fileURLToPath(import.meta.url));

function unit(partial: Partial<LotUnit> & { printed?: Record<string, string> }): LotUnit {
  return {
    year: "2026",
    make: "Tiffin",
    model: "Allegro",
    trim: "33AA",
    body_type: "",
    location: "",
    stock_number: "",
    vin: "",
    source: "own",
    dealer: "",
    price: 100000,
    title: "2026 Tiffin Allegro 33AA",
    condition: "",
    url: "",
    lot_status: "",
    photo: "",
    mileage: "",
    gvwr: null,
    dry_weight: null,
    hitch_weight: null,
    payload: null,
    length_ft: null,
    height_ft: null,
    width_ft: null,
    sleeps: null,
    slides: null,
    fresh_gal: null,
    gray_gal: null,
    black_gal: null,
    propane_lbs: null,
    propane_gal: null,
    engine: "",
    chassis: "",
    fuel_type: "",
    printed: {},
    ...partial,
  };
}

test("newest arrivals follow received_date, newest first, and stop at the limit", () => {
  const early = unit({
    title: "Early",
    printed: { received_date: "2026-01-02", id: "1" },
  });
  const mid = unit({
    title: "Mid",
    printed: { received_date: "2026-06-01", id: "2" },
  });
  const midLaterId = unit({
    title: "MidLater",
    printed: { received_date: "2026-06-01", id: "9" },
  });
  const late = unit({
    title: "Late",
    printed: { received_date: "2026-09-16", id: "3" },
  });
  assert.deepEqual(
    newestArrivals([early, mid, midLaterId, late], 3).map((row) => row.title),
    ["Late", "MidLater", "Mid"],
  );
  const many = Array.from({ length: 10 }, (_, i) =>
    unit({
      title: `U${i}`,
      printed: {
        received_date: `2026-03-${String(i + 1).padStart(2, "0")}`,
        id: String(i),
      },
    }),
  );
  const capped = newestArrivals(many);
  assert.equal(NEWEST_ARRIVALS, 6);
  assert.equal(capped.length, 6);
  assert.equal(capped[0]?.title, "U9");
  assert.equal(capped[5]?.title, "U4");
});

test("covered coach variant is stable and rotates from stock, vin, and id", () => {
  const base = unit({
    stock_number: "UPO9968",
    vin: "1FDRU8PG5TKA51981",
    printed: { id: "168635" },
  });
  assert.equal(coverVariant(base), coverVariant(base));
  assert.equal(coverVariant(base), coverVariant({ ...base }));
  const seen = new Set<number>();
  for (let i = 0; i < 40; i++) {
    seen.add(
      coverVariant(
        unit({
          stock_number: `S${i}`,
          vin: `V${i}`,
          printed: { id: String(1000 + i) },
        }),
      ),
    );
  }
  assert.deepEqual([...seen].sort(), [0, 1, 2]);
  const onlyId = unit({
    stock_number: "",
    vin: "",
    printed: { id: "42" },
  });
  const otherId = unit({
    stock_number: "",
    vin: "",
    printed: { id: "43" },
  });
  assert.equal(coverVariant(onlyId), coverVariant(onlyId));
  assert.notEqual(coverVariant(onlyId), coverVariant(otherId));
});

test("shell shows the owner mark on every screen and Home uses lot data", () => {
  const shell = readFileSync(join(root, "../../components/shell/AppShell.tsx"), "utf8");
  const home = readFileSync(join(root, "../../components/shell/HomeScreen.tsx"), "utf8");
  const brand = readFileSync(join(root, "../../components/shell/SuiteBrand.tsx"), "utf8");
  const mark = join(root, "../../../public/assets/brand/r-mark-final-60.png");
  const retired = join(root, "../../../public/assets/brand/raidho-shell-mark.png");
  assert.ok(existsSync(mark), "owner mark asset");
  assert.equal(existsSync(retired), false, "old shell mark removed");
  assert.match(shell, /<SuiteBrand[\s\S]*onHome=/);
  assert.match(shell, /SECTION_ROW\.map/);
  assert.match(brand, /aria-label="Home"/);
  assert.match(shell, /homeOpen/);
  assert.match(shell, /initialTab = "rvgrok"/);
  assert.match(home, /SHOWROOM_SPOTLIGHT/);
  assert.match(home, /SHOWROOM_SPOTLIGHT\.series/);
  assert.doesNotMatch(home, /resolveHomeCoach|pickShowroomStage|newestLotUnit/);
  assert.match(home, /MetalVerifiedTrue/);
  assert.doesNotMatch(home, /New arrivals/);
  assert.doesNotMatch(home, /showroom-lotcount|showroom-spotstock-dark|showroom-verified/);
  assert.equal(home.match(/className="showroom-spotstock"/g)?.length, 1);
  assert.match(home, /onOpen\("rvlot"\)/);
  const arrivals = readFileSync(join(root, "../../components/lot/LotArrivals.tsx"), "utf8");
  assert.match(arrivals, /CoveredCoach/);
  assert.match(arrivals, /coverVariant/);
  const cover = readFileSync(join(root, "../../components/shell/CoveredCoach.tsx"), "utf8");
  assert.match(cover, /aria-label="Photo coming soon"/);
  assert.match(cover, /data-covered-coach/);
  assert.match(arrivals, /data-lot-arrivals/);
  assert.match(arrivals, /overflow-x-auto/);
  assert.match(home, /overflow-y-auto/);
  assert.match(home, /requestLotUnit/);
  assert.match(home, /fetchLotSnapshot/);
  const lot = readFileSync(join(root, "../../components/lot/LotStockApp.tsx"), "utf8");
  assert.match(lot, /takePendingLotQuery/);
  assert.match(lot, /LotArrivals/);
  assert.match(brand, /\/assets\/brand\/r-mark-final-60\.png/);
  assert.doesNotMatch(brand, /raidho-shell-mark/);
  assert.match(brand, /RvFOX/);
  assert.doesNotMatch(home, /unsplash|placeholder|allegro/i);
  assert.doesNotMatch(shell, /RvFaxApp\.tsx|LotStockApp\.tsx|RvCalApp\.tsx|RvTowApp\.tsx/);

  const suite = readFileSync(join(root, "../../components/shell/SuitePage.tsx"), "utf8");
  const bar = readFileSync(join(root, "../../components/shell/RoomAskBar.tsx"), "utf8");
  assert.match(suite, /data-showroom-plain/);
  assert.doesNotMatch(suite, /RAIDHO_R_MARK/);
  assert.doesNotMatch(suite, /suite-raidho-bleed/);
  assert.doesNotMatch(suite, /raidho-r-mark/);
  assert.doesNotMatch(bar, /placeholder="Ask"|roomAskMic/);
  assert.doesNotMatch(bar, /<BottomTabs/);
  assert.doesNotMatch(bar, /ROOM_CHIPS|Rv Facts|Lot Inventory|Learn more/);
});

test("theme switch sits on the shell rail and in the dark Home header, wired to setTheme", () => {
  const home = readFileSync(join(root, "../../components/shell/HomeScreen.tsx"), "utf8");
  const brand = readFileSync(join(root, "../../components/shell/SuiteBrand.tsx"), "utf8");
  assert.match(brand, /data-tool-rail="theme"/);
  assert.match(brand, /Switch to light mode/);
  assert.match(brand, /Switch to dark mode/);
  assert.match(brand, /setTheme\(/);
  assert.doesNotMatch(brand, /data-tool-rail="settings"/);
  const darkBar = home.slice(home.indexOf('className="dark-home-bar"'), home.indexOf("</header>"));
  assert.match(darkBar, /className="dark-home-tool"[\s\S]*data-tool-rail="theme"/);
  assert.match(darkBar, /setTheme\("light"\)/);
});

test("spotlight is the fixed 2026 Entegra Cornerstone and arrivals stay newest-first", () => {
  assert.deepEqual(
    {
      year: SHOWROOM_SPOTLIGHT.year,
      make: SHOWROOM_SPOTLIGHT.make,
      series: SHOWROOM_SPOTLIGHT.series,
      image: SHOWROOM_SPOTLIGHT.image,
      alt: SHOWROOM_SPOTLIGHT.alt,
    },
    {
      year: "2026",
      make: "Entegra",
      series: "Cornerstone",
      image: "/assets/showroom/2026-entegra-cornerstone-cutout.webp",
      alt: "2026 Entegra Cornerstone",
    },
  );
  const cutout = join(
    root,
    "../../../public/assets/showroom/2026-entegra-cornerstone-cutout.webp",
  );
  assert.ok(existsSync(cutout));
  assert.ok(statSync(cutout).size < 200 * 1024, "cutout webp stays under 200KB");
  assert.equal(
    existsSync(join(root, "../../../public/assets/showroom/2026-entegra-cornerstone.webp")),
    false,
  );
  assert.equal(
    existsSync(join(root, "../../../public/assets/showroom/2026-entegra-cornerstone.jpg")),
    false,
  );
  assert.equal(SHOWROOM_SPOTLIGHT.stockNumber, "45282");
  assert.equal(SHOWROOM_SPOTLIGHT.vin, "4UZFCTFG3TCWE7168");
  const snap = parseLotSnapshotJson(
    JSON.parse(
      readFileSync(join(root, "../../../public/inventory/own-lot-latest.json"), "utf8"),
    ),
  );
  const stocked = spotlightLotUnit(snap.units);
  assert.ok(stocked, "spotlight stock number is in the lot snapshot");
  assert.equal(stocked.stock_number, "45282");
  assert.equal(stocked.vin, "4UZFCTFG3TCWE7168");
  const specs = spotlightSpecs(stocked);
  assert.deepEqual(Object.keys(specs).sort(), ["model", "price", "stock"]);
  assert.equal(specs.model, "Cornerstone 45D");
  assert.equal(specs.price, lotPriceOrGap(stocked.price));
  assert.equal(specs.stock, lotTextOrGap(stocked.stock_number));
  assert.equal(specs.price, "$729,995");
  assert.equal(specs.stock, "45282");
  assert.equal(specs.model.includes(stocked.year), false);
  assert.equal(/\bEntegra\b/.test(specs.model), false);
  assert.notEqual(stocked.photo, SHOWROOM_SPOTLIGHT.image);

  const byVin = spotlightLotUnit(
    [unit({ stock_number: "nope", vin: "4uzfctfg3tcwe7168", make: "Entegra Coach", model: "Cornerstone", trim: "45D" })],
    { ...SHOWROOM_SPOTLIGHT, stockNumber: "missing" },
  );
  assert.equal(byVin?.trim, "45D");
  const byStock = spotlightLotUnit([
    unit({ stock_number: "other", vin: SHOWROOM_SPOTLIGHT.vin, trim: "VIN" }),
    unit({ stock_number: "45282", vin: "DIFFERENT", trim: "STOCK" }),
  ]);
  assert.equal(byStock?.trim, "STOCK");
  assert.equal(spotlightLotUnit([unit({ stock_number: "1", vin: "X" })]), null);
  const blank = unit({
    stock_number: "45282",
    price: null,
    location: "",
    condition: "",
    length_ft: null,
    gvwr: null,
    trim: "",
    make: "Entegra Coach",
    model: "Cornerstone",
  });
  const emptySpecs = spotlightSpecs(blank);
  assert.equal(emptySpecs.model, "Cornerstone");
  assert.equal(emptySpecs.price, "");
  assert.equal(emptySpecs.stock, "45282");
  const noPriceOrStock = spotlightSpecs(
    unit({
      year: "2026",
      make: "Entegra Coach",
      model: "Cornerstone 45D",
      trim: "45D",
      price: null,
      stock_number: "",
    }),
  );
  assert.equal(noPriceOrStock.model, "Cornerstone 45D");
  assert.equal(noPriceOrStock.price, "");
  assert.equal(noPriceOrStock.stock, "");

  const older = unit({
    title: "Older",
    year: "2024",
    make: "Thor",
    model: "Compass",
    trim: "23TW",
    photo: "https://cdn.example/compass.jpg",
    price: 119995,
    stock_number: "A",
    printed: { received_date: "2026-09-01", id: "1" },
  });
  const newest = unit({
    title: "Newest arrival",
    year: "2027",
    make: "Thor",
    model: "Inception",
    trim: "",
    photo: "https://cdn.example/newest.jpg",
    price: 189995,
    stock_number: "B",
    printed: { received_date: "2026-09-22", id: "9" },
  });
  const arrivals = arrivalsForHome([older, newest]);
  assert.equal(arrivals[0]?.stock_number, "B");
  assert.equal(arrivals[1]?.stock_number, "A");
  assert.equal(SHOWROOM_SPOTLIGHT.series, "Cornerstone");

  const coach = readFileSync(join(root, "./homeCoach.ts"), "utf8");
  const home = readFileSync(join(root, "../../components/shell/HomeScreen.tsx"), "utf8");
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  const shell = readFileSync(join(root, "../../components/shell/AppShell.tsx"), "utf8");
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  assert.doesNotMatch(
    coach,
    /pickShowroomStage|resolveHomeCoach|newestLotUnit|sameLotUnit|ShowroomStage|arrivalLabel/,
  );
  assert.doesNotMatch(css, /showroom-coach-fallback|showroom-reflect|showroom-contact|showroom-hero picture|showroom-hero-wash|showroom-hero-glint/);
  assert.doesNotMatch(home, /showroom-hero-wash|showroom-hero-glint|showroom-roof-glint|feMorphology|feFlood|preserveAspectRatio/);
  assert.match(css, /\.showroom-hero-pool,/);
  assert.match(css, /\.showroom-floor \{/);
  assert.doesNotMatch(css, /\.showroom-ambient \{/);
  assert.doesNotMatch(css, /\.showroom-grain \{/);
  assert.doesNotMatch(
    css,
    /\.showroom-count|\.showroom-onlot|\.showroom-coachline|\.showroom-spotfacts|\.showroom-spotmeta/,
  );
  assert.match(css, /\.showroom-spotmodel \{/);
  assert.match(css, /\.showroom-spotprice \{/);
  assert.match(css, /\.showroom-spotstock \{/);
  assert.match(home, /SHOWROOM_SPOTLIGHT\.alt/);
  assert.match(home, /SHOWROOM_SPOTLIGHT\.image/);
  assert.doesNotMatch(home, /showroom-hero-beam/);
  assert.match(home, /showroom-floor/);
  assert.doesNotMatch(home, /showroom-hero-pool/);
  assert.doesNotMatch(home, /spotlightJpegPath|showroom-reflect|showroom-contact/);
  assert.doesNotMatch(coach, /spotlightJpegPath|2026-entegra-cornerstone\.jpg/);
  assert.match(home, /spotlightLotUnit\(listed\)/);
  assert.match(home, /spotlightSpecs\(spotUnit\)/);
  assert.match(home, /requestLotUnit\(lotArrivalQuery\(spotUnit\)\)/);
  assert.match(home, /showroom-spotmodel/);
  assert.match(home, /Stock \{specs\.stock\}/);
  assert.doesNotMatch(home, /Stock #|showroom-count|showroom-onlot|showroom-coachline|showroom-spotfacts|showroom-spotmeta|useCountUp|spotlightLabel|data-home-count|data-home-spotlight-specs/);
  const arrivalRail = readFileSync(join(root, "../../components/lot/LotArrivals.tsx"), "utf8");
  assert.match(arrivalRail, /Newest arrivals/);
  // Arrival cards wear the lot list card face (title, meta, photo well).
  assert.match(arrivalRail, /lot-unit-title is-rail/);
  assert.match(arrivalRail, /lot-unit-meta/);
  assert.match(arrivalRail, /lot-well relative overflow-hidden is-rail/);
  assert.doesNotMatch(home, /requestSpotlightFacts|onOpenFacts|729995|54000|44\.92/);
  assert.doesNotMatch(home, /horsepower|engine/i);
  assert.doesNotMatch(fax, /takePendingSpotlightFacts|SPOTLIGHT_FACTS/);
  assert.doesNotMatch(shell, /openSpotlightFacts|onOpenFacts/);
  assert.doesNotMatch(coach, /spotlightFactsTarget|requestSpotlightFacts/);
  assert.match(css, /\.showroom-hero \{[^}]*margin:\s*0;/);
  assert.match(
    css,
    /\.showroom-header \{[^}]*env\(safe-area-inset-top, 0px\)/,
  );
  assert.match(home, /readTheme/);
  assert.match(home, /const heroSrc = SHOWROOM_SPOTLIGHT\.image/);
  assert.doesNotMatch(home, /spotlight-lot\.jpg/);
  assert.match(home, /Open coach/);
  assert.doesNotMatch(home, /data-lot-whisper|showroom-lot-whisper/);
  assert.match(home, /showroom-lotcount/);
  assert.match(home, /in stock/);
  assert.doesNotMatch(home, /home-jump/);
  assert.doesNotMatch(home, /Learn more|showroom-coach-lot|data-arrival-set="duplicate"/);
  assert.doesNotMatch(css, /showroom-coach-lot/);
});
