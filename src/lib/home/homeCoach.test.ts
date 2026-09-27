import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lotUnitPhoto, type LotUnit } from "../lot/ownLotPage.ts";
import type { ActiveCoach } from "../rv/activeCoach.ts";
import { newestLotUnit, resolveHomeCoach } from "./homeCoach.ts";

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
  assert.match(shell, /<SuiteBrand \/>/);
  assert.match(shell, /homeOpen/);
  assert.match(shell, /initialTab = "rvgrok"/);
  assert.match(home, /resolveHomeCoach/);
  assert.match(home, /fetchLotSnapshot/);
  assert.match(home, /prefers-reduced-motion/);
  assert.match(brand, /\/assets\/brand\/raidho-shell-mark\.png/);
  assert.match(brand, /RvFOX/);
  assert.doesNotMatch(home, /unsplash|placeholder|stock|allegro/i);
  assert.doesNotMatch(shell, /RvFaxApp\.tsx|LotStockApp\.tsx|RvCalApp\.tsx|RvTowApp\.tsx/);
});
