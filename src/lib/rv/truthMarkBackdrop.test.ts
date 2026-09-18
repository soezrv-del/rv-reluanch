import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = (...parts: string[]) => join(root, ...parts);

function read(rel: string) {
  return readFileSync(src(rel), "utf8");
}

test("shared prestige is the Scandinavian truth mark, not a letter R", () => {
  const prestige = read("../../assets/prestige.ts");
  const css = read("../../styles.css");
  const page = read("../../components/shell/SuitePage.tsx");
  const asset = src("../../assets/backdrops/shared-prestige.jpg");

  assert.match(prestige, /shared-prestige\.jpg/);
  assert.match(prestige, /SHARED_PRESTIGE_BACKDROP/);
  assert.match(prestige, /Scandinavian truth mark/);
  assert.match(prestige, /not a letter R/);
  assert.ok(existsSync(asset), "shared-prestige.jpg is the suite watermark");

  assert.match(page, /SHARED_PRESTIGE_BACKDROP/);
  assert.match(page, /SuiteBackdrop/);
  assert.match(page, /page-backdrop-bright/);
  assert.match(page, /page-scrim-soft/);

  assert.match(css, /\[data-readable-cards\] \.page-backdrop-bright/);
  assert.match(css, /\[data-readable-cards\] \.page-scrim-soft/);
  assert.doesNotMatch(
    css,
    /\[data-readable-cards\] \.page-backdrop-bright \{[^}]*opacity:\s*0\.03/,
    "readable-cards must not hide the truth mark at 3%",
  );
  assert.doesNotMatch(
    css,
    /\[data-readable-cards\] \.page-scrim-soft \{[^}]*background:\s*rgb\(4,\s*8,\s*16\)/,
    "readable-cards scrim must not be an opaque plate over the mark",
  );
});

test("suite tabs that should show the truth mark still mount SuiteBackdrop", () => {
  const cal = read("../../components/rvcal/RvCalApp.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const grok = read("../../components/rvgrok/RvGrokApp.tsx");
  const sold = read("../../components/rvfax/SoldBookApp.tsx");
  const detail = read("../../components/rvfax/RvDetail.tsx");

  assert.match(cal, /<SuitePage/);
  assert.doesNotMatch(cal, /backdrop=\{/);
  assert.match(more, /<SuitePage/);
  assert.doesNotMatch(more, /backdrop=\{/);
  assert.match(grok, /!embedded && <SuiteBackdrop \/>/);
  assert.match(sold, /SHARED_PRESTIGE_BACKDROP/);
  assert.match(sold, /<SuiteBackdrop src=\{PRESTIGE_BACKDROP\} \/>/);
  assert.match(detail, /SHARED_PRESTIGE_BACKDROP/);
  assert.match(detail, /<SuiteBackdrop src=\{SHARED_PRESTIGE_BACKDROP\} \/>/);
});

test("Facts and Tow keep photo landings; RV GPS stays décor-muted", () => {
  const prestige = read("../../assets/prestige.ts");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const css = read("../../styles.css");

  assert.match(prestige, /FACTS_LANDING_BACKDROP/);
  assert.match(prestige, /TOW_LANDING_BACKDROP/);
  assert.match(fax, /FACTS_LANDING_BACKDROP/);
  assert.match(fax, /data-facts-landing/);
  assert.match(tow, /TOW_LANDING_BACKDROP/);
  assert.match(tow, /landing="tow"/);
  assert.doesNotMatch(trips, /SHARED_PRESTIGE_BACKDROP/);
  assert.doesNotMatch(trips, /SuiteBackdrop/);
  assert.match(css, /\[data-trips-route-clean\]/);
  assert.match(css, /no truth-mark/);
});

test("DialaBot stays out of the suite backdrop wiring", () => {
  const prestige = read("../../assets/prestige.ts");
  const page = read("../../components/shell/SuitePage.tsx");
  assert.doesNotMatch(prestige, /[Dd]ialaBot/);
  assert.doesNotMatch(page, /[Dd]ialaBot/);
});
