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

test("Trips iPhone chrome: RvFOX wordmark, island inset, profile below status bar", () => {
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const css = read("../../styles.css");
  const dock = read("../../components/shell/BottomTabs.tsx");
  const cap = read("../../../capacitor.config.ts");

  assert.doesNotMatch(trips, /icon-rvtrips|LuxTrips/);
  assert.match(trips, /RvFOX/);
  assert.match(trips, /data-trips-header/);
  assert.match(trips, /PROFILE LOCKED/);
  assert.ok(
    trips.indexOf("data-trips-header") < trips.indexOf("data-trips-tools"),
    "title + coach sit above tools / PROFILE LOCKED",
  );
  assert.match(css, /\[data-trips-header\]/);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /4\.25rem/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /2\.125rem/);
  assert.doesNotMatch(dock, /min\(10px/);
  assert.match(cap, /overlaysWebView:\s*true/);
});

test("shell swipe strip follows the finger", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const css = read("../../styles.css");
  assert.match(shell, /suite-swipe-viewport/);
  assert.match(shell, /onPeek/);
  assert.match(shell, /--pane-shift/);
  assert.match(css, /--swipe-dx/);
  assert.match(css, /cubic-bezier\(0\.32, 0\.72, 0, 1\)/);
});
