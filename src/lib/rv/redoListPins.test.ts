import assert from "node:assert/strict";
import test from "node:test";
import { installCatalog } from "./catalogLoad.ts";
import { buildBrochureSpecs } from "./brochureSpecs.ts";
import {
  findOemFloorplanSpec,
  findOemHoldingTanks,
} from "./floorplanSpecs.ts";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";
import { extractFloorplanToken } from "../rvgrok/parseCoach.ts";
import { resolveCatalogModel } from "../rvgrok/coachIdentity.ts";

test("redo-list floorplans parse and do not inherit the wrong series tanks", async () => {
  assert.equal(extractFloorplanToken("2018 Forest River Forester 2401R MBS"), "2401R");
  assert.equal(extractFloorplanToken("2019 Heartland Bighorn 3160 ELITE"), "3160ELITE");
  assert.equal(extractFloorplanToken("2024 Gulf Stream Conquest LE 6280LE"), "6280LE");
  assert.equal(extractFloorplanToken("2023 Forest River Sunseeker 2550DS LE"), "2550DSLE");

  const { RV_DATA, MAKES } = await loadLiveCatalog();
  installCatalog({ RV_DATA, MAKES });

  assert.equal(
    resolveCatalogModel("Gulf Stream", "Conquest", "6280LE"),
    "Conquest LE",
  );
  assert.equal(
    resolveCatalogModel("Forest River", "Forester", "2401R"),
    "Forester MBS",
  );
  assert.equal(
    resolveCatalogModel("Alliance RV", "Avenue", "298RL"),
    "Avenue Travel Trailer",
  );
  assert.equal(
    resolveCatalogModel("Forest River", "Rockwood Signature", "8339FK"),
    "Rockwood Signature Travel Trailer",
  );
  assert.equal(
    resolveCatalogModel("Forest River", "Rockwood Signature", "8291RK"),
    "Rockwood Signature",
  );
  assert.equal(
    resolveCatalogModel("Coachmen", "Freedom Express", "238BHS"),
    "Freedom Express Ultra Lite",
  );

  const conquest = RV_DATA["Gulf Stream Coach"]["Conquest LE"];
  const conquestSheet = buildBrochureSpecs(
    conquest,
    "2024",
    "Gulf Stream Coach",
    "Conquest LE",
    "6280LE",
  );
  assert.equal(conquestSheet.freshWater, "31 gal");
  assert.equal(conquestSheet.grayWater, "38 gal");
  assert.equal(conquestSheet.blackWater, "31 gal");
  assert.equal(conquestSheet.propane, "42 lb");
  assert.equal(conquestSheet.lengthFt, `30' 0"`);
  assert.equal(conquestSheet.gvwr, "Confirm brochure");
  assert.equal(conquestSheet.fuelCapacity, "Confirm brochure");
  assert.equal(
    findOemFloorplanSpec("2024", "Gulf Stream Coach", "Conquest", "6280LE"),
    null,
  );

  const nash = RV_DATA["Northwood Manufacturing"].Nash;
  const nashSheet = buildBrochureSpecs(
    nash,
    "2022",
    "Northwood Manufacturing",
    "Nash",
    "24M",
  );
  assert.equal(nashSheet.freshWater, "50 gal");
  assert.equal(nashSheet.grayWater, "42 gal");
  assert.equal(nashSheet.blackWater, "35 gal");
  assert.equal(nashSheet.uvwLbs, 6023);
  assert.equal(nashSheet.gvwrLbs, 9200);

  const hideout = RV_DATA.Keystone.Hideout;
  const hideoutSheet = buildBrochureSpecs(
    hideout,
    "2027",
    "Keystone",
    "Hideout",
    "210RL",
  );
  assert.equal(hideoutSheet.freshWater, "45 gal");
  assert.equal(hideoutSheet.grayWater, "39 gal");
  assert.equal(hideoutSheet.blackWater, "39 gal");
  assert.notEqual(hideoutSheet.freshWater, "40 gal");

  const avenueTt = RV_DATA["Alliance RV"]["Avenue Travel Trailer"];
  const avenueSheet = buildBrochureSpecs(
    avenueTt,
    "2027",
    "Alliance RV",
    "Avenue Travel Trailer",
    "298RL",
  );
  assert.equal(avenueSheet.freshWater, "71 gal");
  assert.equal(avenueSheet.grayWater, "106 gal");
  assert.equal(avenueSheet.blackWater, "53 gal");
  assert.equal(avenueSheet.gvwrLbs, 10950);
  assert.equal(
    findOemHoldingTanks("2027", "Alliance RV", "Avenue", "298RL").freshWater,
    null,
  );

  const dutch = buildBrochureSpecs(
    RV_DATA.Newmar["Dutch Star"],
    "2011",
    "Newmar",
    "Dutch Star",
    "4020",
  );
  assert.equal(dutch.freshWater, "105 gal");
  assert.equal(dutch.grayWater, "65 gal");
  assert.equal(dutch.blackWater, "45 gal");
  assert.equal(dutch.fuelCapacity, "100 gal");
  assert.equal(
    findOemFloorplanSpec("2012", "Newmar", "Dutch Star", "4020")?.freshWater,
    undefined,
  );

  const tt = buildBrochureSpecs(
    RV_DATA["Forest River"]["Rockwood Signature Travel Trailer"],
    "2025",
    "Forest River",
    "Rockwood Signature Travel Trailer",
    "8339FK",
  );
  assert.equal(tt.grayWater, "131 gal");
  assert.equal(
    findOemHoldingTanks(
      "2025",
      "Forest River",
      "Rockwood Signature",
      "8339FK",
    ).grayWater,
    null,
  );

  const hawk = buildBrochureSpecs(
    RV_DATA.Jayco["White Hawk"],
    "2020",
    "Jayco",
    "White Hawk",
    "23MRB",
  );
  assert.equal(hawk.gvwrLbs, 7250);
  assert.equal(hawk.uvw, "Confirm brochure");
  assert.equal(hawk.grayWater, "31 gal");

  assert.equal(extractFloorplanToken("2026 Forest River r-Pod RP-197"), "RP-197");
  assert.equal(
    findOemHoldingTanks("2026", "Forest River", "r-Pod", "RP-197").freshWater,
    40,
  );
  assert.equal(
    findOemHoldingTanks("2026", "Forest River", "r-Pod", "RP190").grayWater,
    30,
  );

  const xplor = RV_DATA["Grand Design"]["Transcend Xplor"];
  const mkx = buildBrochureSpecs(xplor, "2026", "Grand Design", "Transcend Xplor", "20MKX");
  assert.equal(mkx.freshWater, "56 gal");
  assert.equal(mkx.grayWater, "39 gal");
  assert.equal(mkx.blackWater, "39 gal");
  assert.equal(mkx.uvwLbs, 5397);
  const mkx2025 = buildBrochureSpecs(xplor, "2025", "Grand Design", "Transcend Xplor", "20MKX");
  assert.equal(mkx2025.grayWater, "78 gal");
  const bhx = buildBrochureSpecs(xplor, "2026", "Grand Design", "Transcend Xplor", "23BHX");
  assert.equal(bhx.blackWater, "57 gal");
  const mlx = buildBrochureSpecs(xplor, "2026", "Grand Design", "Transcend Xplor", "25MLX");
  assert.equal(mlx.grayWater, "57 gal");
  assert.equal(mlx.gvwr, "Confirm brochure");

  const le = RV_DATA["Forest River"]["Sunseeker LE"];
  const sle = buildBrochureSpecs(le, "2026", "Forest River", "Sunseeker LE", "2250SLE");
  assert.equal(sle.freshWater, "35 gal");
  assert.equal(sle.grayWater, "32 gal");
  assert.equal(sle.blackWater, "27 gal");
  assert.equal(sle.propane, "41 lb");
  assert.equal(sle.gvwr, "Confirm brochure");
  assert.equal(sle.fuelCapacity, "Confirm brochure");
  const le2024 = buildBrochureSpecs(le, "2024", "Forest River", "Sunseeker LE", "2950LE");
  assert.equal(le2024.grayWater, "32 gal");
  const le2950 = buildBrochureSpecs(le, "2026", "Forest River", "Sunseeker LE", "2950LE");
  assert.equal(le2950.grayWater, "39 gal");
  assert.equal(le2950.gvwrLbs, 14500);
  assert.equal(le2950.fuelCapacity, "Confirm brochure");

  const rpod = RV_DATA["Forest River"]["r-Pod"];
  const rp197 = buildBrochureSpecs(rpod, "2027", "Forest River", "r-Pod", "RP-197");
  assert.equal(rp197.freshWater, "40 gal");
  assert.equal(rp197.grayWater, "40 gal");
  assert.equal(rp197.blackWater, "30 gal");
  assert.equal(rp197.uvwLbs, 4054);
  const rp171 = buildBrochureSpecs(rpod, "2026", "Forest River", "r-Pod", "RP-171");
  assert.equal(rp171.uvwLbs, 2529);
  assert.equal(rp171.gvwrLbs, 4029);
  assert.equal(rp171.freshWater, "30 gal");
});
