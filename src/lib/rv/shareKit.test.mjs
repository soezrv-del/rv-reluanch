import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "shareKit.ts"),
  "utf8",
);

test("brochure summary and notes stay gated — never a catalog ledger", () => {
  assert.match(src, /resolveShareSummary/);
  assert.match(src, /resolveShareNotes/);
  assert.doesNotMatch(src, /catalogPitch \|\| \(r\.data\.type/);
  assert.doesNotMatch(src, /\["Catalog", notesPitch/);
  assert.equal(src.includes("SpaceX"), false);
});

/** `export { foo } from "./mod"` does not bind `foo` in this module. */
function namedSpecifiers(src, kind, modulePath) {
  const escaped = modulePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = src.match(
    new RegExp(`${kind} \\{([^}]*)\\} from "${escaped}"`),
  )?.[1];
  assert.ok(block, `expected ${kind} from ${modulePath}`);
  return {
    block,
    names: new Set(
      [...block.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g)]
        .map((m) => m[1])
        .filter((n) => n !== "type"),
    ),
  };
}

test("shareCardPolicy symbols used locally are imported, not only re-exported", () => {
  const imported = namedSpecifiers(src, "import", "./shareCardPolicy");
  const reexported = namedSpecifiers(src, "export", "./shareCardPolicy");
  const rest = src
    .replace(imported.block, "")
    .replace(reexported.block, "");
  for (const name of reexported.names) {
    if (!new RegExp(`\\b${name}\\b`).test(rest)) continue;
    assert.ok(
      imported.names.has(name),
      `${name} is used in shareKit but only re-exported (Safari: Can't find variable)`,
    );
  }
});

test("STRENGTHS stay product-only", () => {
  assert.match(src, /Finance talking points belong in PAYMENT/);
  assert.match(src, /export function lifestylePitch/);
  assert.doesNotMatch(src, /Financed \$\{formatMoney/);
});

test("STRENGTHS never carry rating breakdown, summary, or disclaimer notes", () => {
  assert.doesNotMatch(src, /getRatingMetadata/);
  assert.doesNotMatch(src, /tierLabel/);
  assert.doesNotMatch(src, /yearNote/);
  assert.doesNotMatch(src, /RvFOX model:/);
  assert.doesNotMatch(src, /Brand\/tier tables are editorial/);
});

test("share kit strips Confirm brochure placeholders instead of printing them", () => {
  assert.match(src, /brochureSummary/);
  assert.match(src, /isShareableValue/);
  const policy = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCardPolicy.ts"),
    "utf8",
  );
  assert.match(policy, /confirm brochure/i);
});

test("market picks stay explicit — the stack is not dumped", () => {
  const policy = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCardPolicy.ts"),
    "utf8",
  );
  const ui = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../components/rvshare/RvShareKit.tsx",
    ),
    "utf8",
  );
  assert.match(policy, /hasSelectedMarketLines/);
  assert.match(ui, /marketNeedsPick/);
  assert.doesNotMatch(
    src,
    /Trade-in est\. \$\{formatMoney\(market\.tradeIn\)\} · Retail/,
  );
});

test("customer-facing MSRP is a single label — not low/high", () => {
  const policy = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCardPolicy.ts"),
    "utf8",
  );
  const ui = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../components/rvshare/RvShareKit.tsx",
    ),
    "utf8",
  );
  assert.match(policy, /shareLabel: "MSRP"/);
  assert.doesNotMatch(policy, /shareLabel: "MSRP (low|high)"/);
  assert.doesNotMatch(policy, /fieldLabel: "MSRP LOW"/);
  assert.doesNotMatch(policy, /id: "msrpLo"/);
  assert.match(policy, /SHARE_MSRP_LINE_ID = "msrpHi"/);
  assert.match(policy, /sharePaymentPricePills/);
  assert.match(policy, /rate updated/i);
  assert.doesNotMatch(ui, /MSRP LOW/);
  assert.doesNotMatch(ui, /MSRP HIGH/);
});

test("share kit rehydrates saved coaches from live catalog SoT", () => {
  assert.match(src, /hydrateShareCoachResult/);
  assert.match(src, /lookup: ShareCatalogLookup = getSpec/);
  const hydrate = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCoachHydrate.ts"),
    "utf8",
  );
  assert.match(hydrate, /if \(!live\) return result/);
  assert.match(hydrate, /lookup: ShareCatalogLookup/);
});
