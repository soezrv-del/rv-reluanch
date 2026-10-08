import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { centerTabInStrip } from "./centerTab.ts";

const root = dirname(fileURLToPath(import.meta.url));

function fakeStrip(scrollWidth: number, clientWidth: number) {
  const calls: number[] = [];
  const strip = {
    scrollWidth,
    clientWidth,
    scrollLeft: 0,
    scrollTo(opts: { left: number }) {
      calls.push(opts.left);
      this.scrollLeft = opts.left;
    },
  };
  return { strip: strip as unknown as HTMLElement, calls };
}

test("selecting a tab centers it in the strip and clamps the ends", () => {
  const { strip, calls } = fakeStrip(400, 100);
  centerTabInStrip(strip, { offsetLeft: 250, offsetWidth: 40 } as HTMLElement, "auto");
  assert.equal(calls[0], 220);

  centerTabInStrip(strip, { offsetLeft: 0, offsetWidth: 40 } as HTMLElement, "auto");
  assert.equal(calls[1], 0);

  centerTabInStrip(strip, { offsetLeft: 360, offsetWidth: 40 } as HTMLElement, "auto");
  assert.equal(calls[2], 300);
});

test("lot chips and the dock call the shared centering helper", () => {
  const lot = readFileSync(join(root, "../../components/lot/LotStockApp.tsx"), "utf8");
  const tabs = readFileSync(join(root, "../../components/shell/BottomTabs.tsx"), "utf8");
  const trips = readFileSync(join(root, "../../components/rvtrips/RvTripsApp.tsx"), "utf8");
  assert.match(lot, /useCenterSelectedTab/);
  assert.match(tabs, /placeDock/);
  assert.match(trips, /useCenterSelectedTab/);
  assert.doesNotMatch(tabs, /const PINNED/);
});

test("light selected chips are copper; the dock stays graphite", () => {
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  const dock = readFileSync(join(root, "../../components/shell/dock.css"), "utf8");
  const lightLot = css
    .split("}")
    .filter((rule) => rule.includes('html[data-theme="light"]') && rule.includes(".lot-chip.is-on"))
    .join("}");
  assert.match(lightLot, /var\(--copper-metal-sm\)/);
  assert.doesNotMatch(lightLot, /#171a20/);
  // Active dock is a copper tick, not a graphite or copper pill.
  const lightDock = dock
    .split("}")
    .filter((rule) => rule.includes('html[data-theme="light"]') && rule.includes(".is-active"))
    .join("}");
  assert.doesNotMatch(lightDock, /#171a20/);
  assert.match(lightDock, /background:\s*transparent !important/);
  assert.match(dock, /#8b5e3c/);
  assert.match(dock, /#d4a06a/);
  assert.match(dock, /::after/);
  assert.doesNotMatch(dock, /rgba\(255, 255, 255, 0\.14\)/);
});
