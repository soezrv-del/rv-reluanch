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

  assert.match(fax, /usePullToReset\(scrollRef, pullResetFax\)/);
  assert.doesNotMatch(fax, /usePullToReset\(scrollRef, refreshFax\)/);
  assert.doesNotMatch(fax, /enabled:\s*false/);
  assert.match(fax, /loadSavedUnits\(\)/);
  assert.match(grok, /usePullToReset\(listRef, startNewChat/);
  assert.match(sold, /onPullReset=\{\(\) => setDeals\(loadSoldDeals\(\)\)\}/);
  assert.match(trips, /usePullToReset\(scrollRef, refreshTrips\)/);
  assert.match(more, /onPullReset=\{\(\) => setRefreshTick/);
  assert.match(cal, /onPullReset=\{resetCal\}/);
  assert.match(tow, /onPullReset=\{clearVehicle\}/);
});

test("RV fax Back and pull reset to clean home (no coach re-open)", () => {
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const detail = read("../../components/rvfax/RvDetail.tsx");

  // Report Back clears picker + detail via pullResetFax → resetFax
  assert.match(fax, /onBack=\{pullResetFax\}/);
  assert.doesNotMatch(fax, /onBack=\{\(\) => setDetail\(null\)\}/);

  // pullResetFax reloads saved/deals then resetFax — never re-hydrates the open report
  const pullResetBlock = fax.match(
    /const pullResetFax = useCallback\(\(\) => \{[\s\S]*?\}, \[resetFax\]\);/,
  );
  assert.ok(pullResetBlock, "pullResetFax callback missing");
  assert.match(pullResetBlock[0], /setSaved\(loadSavedUnits\(\)\)/);
  assert.match(pullResetBlock[0], /setDeals\(loadSoldDeals\(\)\)/);
  assert.match(pullResetBlock[0], /resetFax\(\)/);
  assert.doesNotMatch(pullResetBlock[0], /hydrateShareCoachResult/);

  // resetFax clears selections + hasSearched + detail so cascade reveal / single-hit reopen cannot fire
  assert.match(
    fax,
    /const resetFax = useCallback\(\(\) => \{[\s\S]*?setHasSearched\(false\);[\s\S]*?setDetail\(null\);/,
  );

  // Report pull-to-refresh still goes through onBack (now pullResetFax)
  assert.match(detail, /usePullToReset\(scrollRef, onBack\)/);
  assert.match(detail, /Release to go back/);
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
  assert.match(css, /\[data-trips-header\] \{[^}]*padding-top:\s*0\.75rem/);
  assert.doesNotMatch(css, /\[data-trips-header\] \{[^}]*safe-area-inset-top/);
  assert.doesNotMatch(css, /\[data-trips-header\] \{[^}]*4\.25rem/);
  assert.match(css, /\.showroom-header \{[\s\S]*?safe-area-inset-top/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /2\.125rem/);
  assert.doesNotMatch(dock, /min\(10px/);
  assert.match(cap, /overlaysWebView:\s*true/);
});

test("shell no longer arms swipe-between-tabs", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  assert.match(shell, /suite-swipe-viewport/);
  assert.doesNotMatch(shell, /useSwipeTabs|onPeek|swipeArmed|SWIPE_ORDER/);
  assert.doesNotMatch(shell, /\bDockTab\b/);
  assert.match(shell, /data-pane-active/);
});
