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

test("shell shows the owner mark on every screen and Home opens the spotlight unit", () => {
  const shell = readFileSync(join(root, "../../components/shell/AppShell.tsx"), "utf8");
  const home = readFileSync(join(root, "../../components/shell/HomeScreen.tsx"), "utf8");
  const brand = readFileSync(join(root, "../../components/shell/SuiteBrand.tsx"), "utf8");
  const mark = join(root, "../../../public/assets/brand/r-mark-final-60.png");
  const retired = join(root, "../../../public/assets/brand/raidho-shell-mark.png");
  assert.ok(existsSync(mark), "owner mark asset");
  assert.equal(existsSync(retired), false, "old shell mark removed");
  assert.match(shell, /<SuiteBrand[\s\S]*onHome=/);
  assert.match(shell, /onOpenTow=\{openTowTool\}/);
  assert.match(brand, /aria-label="Home"/);
  assert.match(shell, /homeOpen/);
  assert.match(shell, /initialTab = "rvgrok"/);
  assert.match(home, /SHOWROOM_SPOTLIGHT/);
  assert.match(home, /requestLotUnit\(SHOWROOM_SPOTLIGHT\.stockNumber\)/);
  assert.doesNotMatch(home, /resolveHomeCoach|pickShowroomStage|newestLotUnit/);
  assert.match(home, /VERIFIED AND TRUE/);
  assert.doesNotMatch(home, /New arrivals/);
  assert.match(home, /onOpen\("rvlot"\)/);
  const arrivals = readFileSync(join(root, "../../components/lot/LotArrivals.tsx"), "utf8");
  assert.match(arrivals, /CoveredCoach/);
  assert.match(arrivals, /coverVariant/);
  const cover = readFileSync(join(root, "../../components/shell/CoveredCoach.tsx"), "utf8");
  assert.match(cover, /aria-label="Photo coming soon"/);
  assert.match(cover, /data-covered-coach/);
  assert.match(arrivals, /data-lot-arrivals/);
  assert.match(arrivals, /overflow-x-auto/);
  assert.match(home, /data-home-screen/);
  assert.match(home, /requestLotUnit/);
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
  assert.match(bar, /<BottomTabs/);
  assert.doesNotMatch(bar, /ROOM_CHIPS|Rv Facts|Lot Inventory|Learn more/);
});

test("theme switch sits on the shell rail, wired to setTheme", () => {
  const brand = readFileSync(join(root, "../../components/shell/SuiteBrand.tsx"), "utf8");
  assert.match(brand, /data-tool-rail="theme"/);
  assert.match(brand, /Switch to light mode/);
  assert.match(brand, /Switch to dark mode/);
  assert.match(brand, /setTheme\(/);
  assert.ok(brand.indexOf('data-tool-rail="theme"') < brand.indexOf('data-tool-rail="settings"'));
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
  assert.equal(specs.price, "$1,124,963");
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
  const homeCss = readFileSync(join(root, "../../components/shell/home-showroom.css"), "utf8");
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  const shell = readFileSync(join(root, "../../components/shell/AppShell.tsx"), "utf8");
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  assert.doesNotMatch(
    coach,
    /pickShowroomStage|resolveHomeCoach|newestLotUnit|sameLotUnit|ShowroomStage|arrivalLabel/,
  );
  assert.doesNotMatch(coach, /spotlightJpegPath|2026-entegra-cornerstone\.jpg/);
  const arrivalRail = readFileSync(join(root, "../../components/lot/LotArrivals.tsx"), "utf8");
  assert.match(arrivalRail, /Newest arrivals/);
  // Arrival cards wear the lot list card face (title, meta, photo well).
  assert.match(arrivalRail, /lot-unit-title is-rail/);
  assert.match(arrivalRail, /lot-unit-meta/);
  assert.match(arrivalRail, /lot-well relative overflow-hidden is-rail/);
  assert.doesNotMatch(fax, /takePendingSpotlightFacts|SPOTLIGHT_FACTS/);
  assert.doesNotMatch(shell, /openSpotlightFacts|onOpenFacts/);
  assert.doesNotMatch(coach, /spotlightFactsTarget|requestSpotlightFacts/);
  assert.match(
    css,
    /\.showroom-header \{[^}]*env\(safe-area-inset-top, 0px\)/,
  );

  // Home is the approved showroom mockup: one committed plate (wall, floor,
  // coach, reflection) with the mockup's copy and controls as live HTML.
  const plate = join(root, "../../../public/assets/showroom/home-showroom-wide.webp");
  assert.ok(existsSync(plate), "showroom plate");
  assert.ok(statSync(plate).size < 200 * 1024, "showroom plate stays under 200KB");
  assert.match(home, /\/assets\/showroom\/home-showroom-wide\.webp/);
  assert.equal(
    existsSync(join(root, "../../../public/assets/showroom/home-showroom.webp")),
    false,
    "narrow plate replaced by the wide plate",
  );
  // The plate fills wide screens by being wider, never by stretching: it is
  // scaled uniformly (height: auto) with its 1008px core at the stage scale.
  assert.match(home, /const PLATE_WIDTH = 3208;/);
  assert.match(homeCss, /width: calc\(var\(--pw\) \* 3208 \/ 1008\);/);
  assert.doesNotMatch(homeCss, /object-fit:\s*fill|background-size:\s*100% 100%/);
  assert.equal(
    existsSync(join(root, "../../../public/assets/showroom/cornerstone-hero.jpg")),
    false,
    "retired dark Home photo removed",
  );
  for (const line of [
    "2026 Entegra Coach",
    "Cornerstone 45D",
    "\\$1,124,963",
    "1,420 in stock",
    "Stock \\{SHOWROOM_SPOTLIGHT\\.stockNumber\\}",
    "• Fresno CA",
    "Open coach",
    "VERIFIED AND TRUE",
    "Ask RV Grok",
  ]) {
    assert.match(home, new RegExp(line));
  }
  assert.doesNotMatch(home, /dark-home|showroom-hero|showroom-placard|showroom-floor|MetalVerifiedTrue|readTheme/);
  assert.doesNotMatch(home, /Learn more|home-jump|data-arrival-set="duplicate"|unsplash|placeholder/);
  assert.doesNotMatch(css, /\.dark-home \{|\.showroom-hero \{|\.showroom-placard \{|\.home-jump \{/);
  assert.match(homeCss, /--u: calc\(var\(--W\) \/ 1008\)/);
  assert.match(homeCss, /\.home-showroom__tabs \{/);
});

test("Home tints Safari's bars dark from the server HTML, other screens keep theirs", () => {
  const read = (p: string) => readFileSync(join(root, p), "utf8");
  const rootDoc = read("../../routes/__root.tsx");
  const indexRoute = read("../../routes/index.tsx");
  const theme = read("../theme.ts");
  const home = read("../../components/shell/HomeScreen.tsx");
  const css = read("../../styles.css");
  // Server HTML on "/" marks <html> and carries the dark theme-color.
  assert.match(theme, /HOME_SHOWROOM_ATTR = "data-home-showroom"/);
  assert.match(theme, /HOME_THEME_COLOR = "#0d1218"/);
  assert.match(rootDoc, /s\.location\.pathname === "\/"/);
  assert.match(rootDoc, /\[HOME_SHOWROOM_ATTR\]: onHome \? "" : undefined/);
  assert.match(indexRoute, /name: "theme-color", content: HOME_THEME_COLOR/);
  // The boot script and setTheme do not paint the light color over Home.
  assert.match(theme, /r\.hasAttribute\("\$\{HOME_SHOWROOM_ATTR\}"\)\?"\$\{HOME_THEME_COLOR\}"/);
  assert.match(theme, /hasAttribute\(HOME_SHOWROOM_ATTR\)\s*\?\s*HOME_THEME_COLOR/);
  // Home on screen <-> mark on <html>.
  assert.match(home, /root\.setAttribute\(HOME_SHOWROOM_ATTR, ""\)/);
  assert.match(home, /root\.removeAttribute\(HOME_SHOWROOM_ATTR\)/);
  // Page background + NDA loading frame in the wall tone, only under the mark.
  assert.match(css, /html\[data-home-showroom\],\s*html\[data-home-showroom\] body \{\s*background: #0d1218 !important;/);
  assert.match(css, /html\[data-home-showroom\] \[data-nda-state="loading"\]/);
});
