import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  lotLbsOrGap,
  lotLengthOrGap,
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
  spotlightJpegPath,
  spotlightLabel,
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
  const mark = join(root, "../../../public/assets/brand/raidho-shell-mark.png");
  assert.ok(existsSync(mark), "owner mark asset");
  assert.match(shell, /<SuiteBrand onHome=\{\(\) => setHomeOpen\(true\)\} showMenu=\{homeOpen\} \/>/);
  assert.match(brand, /aria-label="Home"/);
  assert.match(shell, /homeOpen/);
  assert.match(shell, /initialTab = "rvgrok"/);
  assert.match(home, /SHOWROOM_SPOTLIGHT/);
  assert.match(home, /spotlightLabel\(\)/);
  assert.match(home, /arrivalsForHome\(listed\)/);
  assert.doesNotMatch(home, /resolveHomeCoach|pickShowroomStage|newestLotUnit/);
  assert.match(home, /CoveredCoach/);
  assert.match(home, /coverVariant/);
  const cover = readFileSync(join(root, "../../components/shell/CoveredCoach.tsx"), "utf8");
  assert.match(cover, /aria-label="Photo coming soon"/);
  assert.match(cover, /data-covered-coach/);
  assert.match(home, /data-home-arrivals/);
  assert.match(home, /overflow-x-auto/);
  assert.match(home, /overflow-y-auto/);
  assert.match(home, /requestLotUnit/);
  assert.match(home, /fetchLotSnapshot/);
  const lot = readFileSync(join(root, "../../components/lot/LotStockApp.tsx"), "utf8");
  assert.match(lot, /takePendingLotQuery/);
  assert.match(home, /prefers-reduced-motion/);
  assert.match(brand, /\/assets\/brand\/raidho-shell-mark\.png/);
  assert.match(brand, /RvFOX/);
  assert.doesNotMatch(home, /unsplash|placeholder|allegro/i);
  assert.doesNotMatch(shell, /RvFaxApp\.tsx|LotStockApp\.tsx|RvCalApp\.tsx|RvTowApp\.tsx/);

  const suite = readFileSync(join(root, "../../components/shell/SuitePage.tsx"), "utf8");
  const bar = readFileSync(join(root, "../../components/shell/RoomAskBar.tsx"), "utf8");
  assert.match(suite, /data-showroom-plain/);
  assert.doesNotMatch(suite, /RAIDHO_R_MARK/);
  assert.doesNotMatch(suite, /suite-raidho-bleed/);
  assert.doesNotMatch(suite, /raidho-r-mark/);
  assert.match(bar, /What's up\?/);
  assert.match(bar, /roomAskMic\(\)/);
  const chips = bar.match(/const ROOM_CHIPS[\s\S]*?\];/)?.[0] ?? "";
  assert.match(
    chips,
    /Rv Facts[\s\S]*Lot Inventory[\s\S]*Calculator[\s\S]*RV Grok[\s\S]*Tow Guide/,
  );
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
      image: "/assets/showroom/2026-entegra-cornerstone.webp",
      alt: "2026 Entegra Cornerstone",
    },
  );
  assert.equal(spotlightLabel(), "2026 Entegra Cornerstone");
  assert.equal(
    spotlightJpegPath(),
    "/assets/showroom/2026-entegra-cornerstone.jpg",
  );
  assert.ok(
    existsSync(join(root, "../../../public/assets/showroom/2026-entegra-cornerstone.webp")),
  );
  assert.ok(
    existsSync(join(root, "../../../public/assets/showroom/2026-entegra-cornerstone.jpg")),
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
  assert.equal(specs.title, "2026 Entegra Cornerstone 45D");
  assert.equal(specs.price, lotPriceOrGap(stocked.price));
  assert.equal(specs.stock, lotTextOrGap(stocked.stock_number));
  assert.equal(specs.location, lotTextOrGap(stocked.location));
  assert.equal(specs.condition, lotTextOrGap(stocked.condition));
  assert.equal(specs.length, lotLengthOrGap(stocked.length_ft));
  assert.equal(specs.gvwr, lotLbsOrGap(stocked.gvwr));
  assert.equal(specs.measure, `${specs.length} · GVWR ${specs.gvwr}`);
  assert.equal(specs.price, "$729,995");
  assert.equal(specs.location, "Fresno CA");
  assert.equal(specs.condition, "New");
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
  assert.equal(emptySpecs.title, "2026 Entegra Cornerstone");
  assert.equal(emptySpecs.price, "");
  assert.equal(emptySpecs.location, "");
  assert.equal(emptySpecs.measure, "");

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
  assert.equal(spotlightLabel(), "2026 Entegra Cornerstone");

  const coach = readFileSync(join(root, "./homeCoach.ts"), "utf8");
  const home = readFileSync(join(root, "../../components/shell/HomeScreen.tsx"), "utf8");
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  const shell = readFileSync(join(root, "../../components/shell/AppShell.tsx"), "utf8");
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  assert.doesNotMatch(
    coach,
    /pickShowroomStage|resolveHomeCoach|newestLotUnit|sameLotUnit|ShowroomStage|arrivalLabel/,
  );
  assert.doesNotMatch(css, /showroom-coach-fallback/);
  assert.match(home, /SHOWROOM_SPOTLIGHT\.alt/);
  assert.match(home, /SHOWROOM_SPOTLIGHT\.image/);
  assert.match(home, /type="image\/webp"/);
  assert.match(home, /spotlightJpegPath\(\)/);
  assert.match(home, /spotlightLotUnit\(listed\)/);
  assert.match(home, /spotlightSpecs\(spotUnit\)/);
  assert.match(home, /requestLotUnit\(lotArrivalQuery\(spotUnit\)\)/);
  assert.match(home, /data-home-spotlight-specs/);
  assert.match(home, /Newest arrivals/);
  assert.doesNotMatch(home, /requestSpotlightFacts|onOpenFacts|729995|54000|44\.92/);
  assert.doesNotMatch(home, /horsepower|engine/i);
  assert.doesNotMatch(fax, /takePendingSpotlightFacts|SPOTLIGHT_FACTS/);
  assert.doesNotMatch(shell, /openSpotlightFacts|onOpenFacts/);
  assert.doesNotMatch(coach, /spotlightFactsTarget|requestSpotlightFacts/);
  assert.match(css, /\.showroom-hero \{[^}]*margin:\s*0\.75rem auto 0;/);
  assert.match(
    css,
    /\.showroom-header \{[^}]*env\(safe-area-inset-top, 0px\)/,
  );
  const heroPhoto = home.slice(home.indexOf("function SpotlightPhoto"), home.indexOf("export function HomeScreen"));
  assert.doesNotMatch(heroPhoto, /lotUnitPhoto|unit\.photo/);
});
