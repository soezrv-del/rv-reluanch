import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lotUnitPhoto, type LotUnit } from "../lot/ownLotPage.ts";
import type { ActiveCoach } from "../rv/activeCoach.ts";
import {
  NEWEST_ARRIVALS,
  arrivalsForHome,
  coverVariant,
  newestArrivals,
  newestLotUnit,
  pickShowroomStage,
  resolveHomeCoach,
  showroomUnitLabel,
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

test("newest lot unit follows received_date, not file order", () => {
  const older = unit({
    title: "Older",
    printed: { received_date: "2026-04-30", id: "900" },
  });
  const newer = unit({
    title: "Newer",
    model: "Phaeton",
    printed: { received_date: "2026-09-16", id: "12" },
  });
  assert.equal(newestLotUnit([older, newer])?.title, "Newer");
  assert.equal(newestLotUnit([newer, older])?.title, "Newer");
});

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

test("home photo is a real lot image, or the name stands alone", () => {
  const pdf = unit({
    photo: "https://dealer.example/inventory.pdf",
    printed: { received_date: "2026-09-01", id: "1" },
  });
  assert.equal(lotUnitPhoto(pdf), null);
  const noPhoto = resolveHomeCoach(null, [pdf]);
  assert.equal(noPhoto?.photo, null);
  assert.equal(noPhoto?.name, "2026 Tiffin Allegro 33AA");

  const jpg = unit({
    photo: "https://cdn.example/coach.jpg",
    price: 229995,
    printed: { received_date: "2026-09-20", id: "2" },
  });
  const hero = resolveHomeCoach(null, [pdf, jpg]);
  assert.equal(hero?.photo, "https://cdn.example/coach.jpg");
  assert.equal(hero?.price, 229995);
});

test("last lookup wins over the newest unit, without inventing a photo", () => {
  const active: ActiveCoach = {
    year: "2024",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4081",
    price: 450000,
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
  const other = unit({
    year: "2027",
    make: "Thor",
    model: "Inception",
    title: "2027 Thor Inception",
    photo: "https://cdn.example/other.jpg",
    printed: { received_date: "2026-09-20", id: "9" },
  });
  const hero = resolveHomeCoach(active, [other]);
  assert.equal(hero?.name, "2024 Newmar Dutch Star · 4081");
  assert.equal(hero?.photo, null);
  assert.equal(hero?.price, 450000);

  const matched = unit({
    year: "2024",
    make: "Newmar",
    model: "Dutch Star",
    trim: "4081",
    photo: "https://cdn.example/dutch.jpg",
    price: 10,
    printed: { received_date: "2026-01-01", id: "3" },
  });
  const withPhoto = resolveHomeCoach(active, [other, matched]);
  assert.equal(withPhoto?.photo, "https://cdn.example/dutch.jpg");
  assert.equal(withPhoto?.price, 450000);
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
  assert.match(home, /resolveHomeCoach/);
  assert.match(home, /arrivalsForHome/);
  assert.match(home, /pickShowroomStage/);
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
  assert.doesNotMatch(home, /unsplash|placeholder|stock|allegro/i);
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
    /Rv Facts[\s\S]*Lot Inventory[\s\S]*Calculator[\s\S]*Tow Guide/,
  );
});

test("spotlight label matches the photographed unit, and that unit is not the first arrival", () => {
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
  const hero = unit({
    title: "2026 Holiday Rambler Admiral 29M",
    year: "2026",
    make: "Holiday Rambler",
    model: "Admiral",
    trim: "29M",
    photo: "https://cdn.example/admiral.webp",
    price: 164995,
    stock_number: "B",
    printed: { received_date: "2026-09-22", id: "9" },
  });
  const stage = pickShowroomStage(null, [older, hero]);
  assert.equal(stage.photo, "https://cdn.example/admiral.webp");
  assert.equal(stage.name, showroomUnitLabel(hero));
  assert.equal(stage.name, "2026 Holiday Rambler Admiral 29M");
  assert.equal(stage.price, 164995);
  const arrivals = arrivalsForHome([older, hero], stage.unit);
  assert.equal(arrivals[0]?.stock_number, "A");
  assert.ok(arrivals.every((row) => row.stock_number !== "B"));
});
