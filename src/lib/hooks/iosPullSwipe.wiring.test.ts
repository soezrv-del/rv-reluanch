import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (rel: string) =>
  readFileSync(new URL(rel, import.meta.url), "utf8");

test("Facts / Grok / Sold / Trips / More wire a real pull handler", () => {
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const grok = read("../../components/rvgrok/RvGrokApp.tsx");
  const sold = read("../../components/rvfax/SoldBookApp.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const cal = read("../../components/rvcal/RvCalApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");

  assert.match(fax, /usePullToReset\(scrollRef, refreshFax\)/);
  assert.doesNotMatch(fax, /enabled:\s*false/);
  assert.match(fax, /loadSavedUnits\(\)/);
  assert.match(grok, /usePullToReset\(listRef, startNewChat\)/);
  assert.match(sold, /usePullToReset\(scrollRef, refreshSold\)/);
  assert.match(trips, /usePullToReset\(scrollRef, refreshTrips\)/);
  assert.match(more, /onPullReset=\{\(\) => setRefreshTick/);
  assert.match(cal, /onPullReset=\{resetCal\}/);
  assert.match(tow, /onPullReset=\{clearVehicle\}/);
});

test("Tow and Trips no longer block the whole page from tab swipe", () => {
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  assert.doesNotMatch(tow, /noSwipeScroll/);
  assert.doesNotMatch(trips, /data-no-swipe-scroll/);
});

test("shell swipe strip follows the finger", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const css = read("../../styles.css");
  assert.match(shell, /suite-swipe-viewport/);
  assert.match(shell, /onPeek/);
  assert.match(shell, /--swipe-i/);
  assert.match(css, /--swipe-dx/);
  assert.match(css, /cubic-bezier\(0\.32, 0\.72, 0, 1\)/);
});
