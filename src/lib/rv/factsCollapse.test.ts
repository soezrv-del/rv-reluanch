import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  factsInventoryHeadline,
  factsMoneyHeadline,
  factsOwnerHeadline,
  factsRecallHeadline,
  factsSpecsHeadline,
} from "./factsCollapse.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("facts headlines: money, recalls, owner quote+rating, inventory, specs", () => {
  assert.equal(factsMoneyHeadline(0), "—");
  assert.equal(factsMoneyHeadline(379000), "$379,000");
  assert.equal(factsRecallHeadline({ loading: true, count: 3 }), "Checking…");
  assert.equal(factsRecallHeadline({ loading: false, count: 0 }), "None found");
  assert.equal(factsRecallHeadline({ loading: false, count: 1 }), "1 recall");
  assert.equal(factsRecallHeadline({ loading: false, count: 4 }), "4 recalls");
  assert.equal(
    factsOwnerHeadline({ title: "Solid coach", rating: 4.6 }),
    "“Solid coach” · 4.6",
  );
  assert.equal(factsOwnerHeadline(null), "—");
  assert.equal(factsInventoryHeadline({ searched: false, count: 0 }), "Search nearby");
  assert.equal(factsInventoryHeadline({ searched: true, count: 0 }), "No listings");
  assert.equal(factsInventoryHeadline({ searched: true, count: 2 }), "2 listings");
  assert.equal(factsSpecsHeadline({ length: "42 ft", engine: "ISL" }), "42 ft");
  assert.equal(factsSpecsHeadline({ length: "—", engine: "Cummins ISL" }), "Cummins ISL");
});

test("Facts report sections collapse by default with title+headline", () => {
  const collapse = readFileSync(
    join(root, "../../components/rvfax/FactsCollapse.tsx"),
    "utf8",
  );
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(collapse, /aria-expanded=\{open\}/);
  assert.match(collapse, /defaultOpen = false/);
  assert.match(detail, /FactsCollapse/);
  assert.match(detail, /title="Market value"/);
  assert.match(detail, /title="Local inventory"/);
  assert.match(detail, /title="Vehicle specifications"/);
  assert.match(detail, /title="Sample owner notes"/);
  assert.match(detail, /title="NHTSA safety"/);
  assert.match(detail, /title="Share kit"/);
  assert.doesNotMatch(detail, /defaultOpen/);
});

test("Facts landing + detail strip inline disclaimers; RV Search name-only options", () => {
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(fax, /RV Search/);
  assert.doesNotMatch(fax, /Catalog [Ss]earch/);
  assert.doesNotMatch(fax, /catalogModelTotal/);
  assert.doesNotMatch(fax, /countModelsForClass/);
  assert.doesNotMatch(fax, /modelPickerMeta/);
  assert.doesNotMatch(fax, /Type your make/);
  assert.doesNotMatch(fax, /models ·/);
  assert.doesNotMatch(detail, /Nearby listings only/);
  assert.doesNotMatch(detail, /not used for the market-value/);
  assert.doesNotMatch(detail, /Illustrative copy/);
  assert.doesNotMatch(detail, /layouts unconfirmed/i);
  assert.doesNotMatch(detail, /Public listing asks in the year window/);
  assert.doesNotMatch(detail, /Catalog estimate from a segment/);
  assert.doesNotMatch(detail, /overviewText/);
  assert.doesNotMatch(detail, /label="TYPE"/);
  assert.doesNotMatch(detail, /label="YEAR"/);
});
