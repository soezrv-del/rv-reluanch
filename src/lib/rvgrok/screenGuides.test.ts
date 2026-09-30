import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { screenNameForTab } from "./screenContext.ts";
import {
  GUIDE_SCREEN_IDS,
  SCREEN_CALLOUT,
  SCREEN_CALLOUT_DEBOUNCE_MS,
  SCREEN_GUIDE_PREAMBLE,
  SCREEN_SHARED,
  asksAboutOpenScreen,
  initialScreenCalloutState,
  planCalloutDelivery,
  reduceScreenCallout,
  canonicalScreenId,
  screenCalloutLine,
  screenGuideFor,
  spokenScreenName,
  type ScreenCalloutState,
} from "./screenGuides.ts";

const root = dirname(fileURLToPath(import.meta.url));

const ROUTES: Array<[string, boolean, string]> = [
  ["rvgrok", true, "Home"],
  ["rvfax", false, "Facts"],
  ["rvcal", false, "CAL"],
  ["rvtow", false, "TOW"],
  ["rvlot", false, "LOT"],
  ["rvtrips", false, "RV GPS"],
  ["rvgrok", false, "Grok"],
  ["more", false, "Premium"],
  ["rvsold", false, "Sold"],
];

test("every suite route and the VIN Decoder have a guide and a one-line callout", () => {
  assert.equal(SCREEN_CALLOUT_DEBOUNCE_MS, 1500);
  const covered = new Set<string>(GUIDE_SCREEN_IDS);
  for (const [tab, home, expected] of ROUTES) {
    assert.equal(screenNameForTab(tab, home), expected);
    assert.ok(covered.has(canonicalScreenId(expected)), expected);
  }
  assert.ok(covered.has("VIN Decoder"));
  for (const id of GUIDE_SCREEN_IDS) {
    const guide = screenGuideFor(id);
    const line = screenCalloutLine(id);
    assert.ok(guide && guide.length > 80, id);
    assert.ok(line && line.length > 10, id);
    assert.equal(line.includes("\n"), false, id);
    assert.ok(spokenScreenName(id).length > 0, id);
    assert.equal(SCREEN_CALLOUT[id], line, id);
  }
  assert.equal(screenGuideFor("Share"), null);
  assert.equal(screenNameForTab("rvshare", false), "Share");
});

test("guides match the current showroom, pills, and labels", () => {
  const home = screenGuideFor("Home") || "";
  const shared = SCREEN_SHARED;
  const all = GUIDE_SCREEN_IDS.map((id) => screenGuideFor(id) || "").join("\n");
  assert.match(home, /2026 Entegra Cornerstone/);
  assert.match(home, /45282/);
  assert.match(home, /45D/);
  assert.match(home, /Newest arrivals/);
  assert.match(home, /does not auto-loop/);
  assert.match(home, /Lot Inventory/);
  assert.doesNotMatch(home, /last looked-up|newest lot unit|isn't a button/);
  assert.match(shared, /Ask RV Grok/);
  assert.match(shared, /does not slide and does not auto-scroll/);
  assert.match(shared, /Rv Facts, Calculator, RV Grok, Tow Guide, RV GPS, Lot Inventory/);
  assert.match(screenGuideFor("Facts") || "", /Power to weight/);
  assert.match(screenGuideFor("Facts") || "", /smallest in series/);
  assert.match(screenGuideFor("Facts") || "", /Share kit/);
  assert.doesNotMatch(all, /Send kit/);
  assert.doesNotMatch(all, /series range/);
  assert.doesNotMatch(all, /Ask about this coach/);
  assert.match(screenGuideFor("Premium") || "", /NHTSA\.gov — Official Recalls/);
  assert.match(screenGuideFor("VIN Decoder") || "", /Decode the chassis VIN on motorhomes/);
  assert.match(SCREEN_GUIDE_PREAMBLE, /Never say you can't see his screen/);
  assert.match(SCREEN_GUIDE_PREAMBLE, /Do not describe this screen/);
  assert.match(SCREEN_GUIDE_PREAMBLE, /Recommendations/);
  assert.doesNotMatch(SCREEN_GUIDE_PREAMBLE, /You cannot see the screen/);
  assert.doesNotMatch(all, /You cannot see the screen|I can't see the screen/);
});

test("where did I open you asks about the screen; Recommendations does not", () => {
  assert.equal(asksAboutOpenScreen("where did I open you at? Right here."), true);
  assert.equal(asksAboutOpenScreen("what screen am I on"), true);
  assert.equal(asksAboutOpenScreen("how do I use this"), true);
  assert.equal(asksAboutOpenScreen("Recommendations."), false);
  assert.equal(asksAboutOpenScreen("Recommendations"), false);
  assert.equal(asksAboutOpenScreen(""), false);
});

test("VIN Decoder is its own screen while Premium is open", () => {
  const more = readFileSync(
    join(root, "../../components/more/MoreApp.tsx"),
    "utf8",
  );
  assert.match(
    more,
    /setActiveScreen\(vinOpen \? VIN_DECODER_SCREEN : "Premium"\)/,
  );
});

function step(
  state: ScreenCalloutState,
  event: Parameters<typeof reduceScreenCallout>[1],
): ReturnType<typeof reduceScreenCallout> {
  return reduceScreenCallout(state, event);
}

test("rapid tab switches speak only the final screen", () => {
  let state = initialScreenCalloutState();
  state = step(state, { type: "navigate", screen: "Facts", now: 0 }).state;
  state = step(state, { type: "navigate", screen: "Tow", now: 400 }).state;
  state = step(state, { type: "navigate", screen: "Lot", now: 800 }).state;
  const early = step(state, { type: "tick", now: 2299 });
  assert.equal(early.speak, null);
  const landed = step(early.state, { type: "tick", now: 2300 });
  assert.match(landed.speak || "", /^Lot Inventory\./);
  assert.doesNotMatch(landed.speak || "", /Rv Facts|Tow Guide/);
});

test("the same screen is not called out twice in a row", () => {
  let state = initialScreenCalloutState();
  state = step(state, { type: "navigate", screen: "Lot", now: 0 }).state;
  const first = step(state, { type: "tick", now: 1500 });
  assert.match(first.speak || "", /Lot Inventory/);
  const again = step(
    step(first.state, { type: "navigate", screen: "Lot", now: 1600 }).state,
    { type: "tick", now: 3100 },
  );
  assert.equal(again.speak, null);
  state = step(again.state, { type: "navigate", screen: "Tow", now: 3200 }).state;
  state = step(state, { type: "navigate", screen: "Lot", now: 3400 }).state;
  const back = step(state, { type: "tick", now: 4900 });
  assert.equal(back.speak, null);
  state = step(back.state, { type: "navigate", screen: "Facts", now: 5000 }).state;
  const next = step(state, { type: "tick", now: 6500 });
  assert.match(next.speak || "", /^Rv Facts\./);
});

test("navigate during an assistant reply does not cancel; callout speaks after reply-done", () => {
  let state = initialScreenCalloutState();
  let queued: string | null = null;
  const spoken: string[] = [];

  const deliver = (line: string | null, assistantSpeaking: boolean) => {
    if (!line) return;
    const plan = planCalloutDelivery(line, assistantSpeaking);
    assert.equal(plan.cancel, false);
    queued = plan.queued;
    if (plan.speakNow) spoken.push(plan.speakNow);
  };

  state = step(state, { type: "navigate", screen: "Cal", now: 0 }).state;
  state = step(state, { type: "navigate", screen: "Tow", now: 400 }).state;
  const ready = step(state, { type: "tick", now: 1900 });
  deliver(ready.speak, true);
  assert.deepEqual(spoken, []);
  assert.match(queued || "", /^Tow Guide\./);
  assert.doesNotMatch(queued || "", /Calculator/);

  const stillPlaying = step(ready.state, { type: "tick", now: 2000 });
  deliver(stillPlaying.speak, true);
  assert.deepEqual(spoken, []);

  const settled = step(stillPlaying.state, { type: "reply-done", now: 2100 });
  assert.equal(settled.speak, null);
  const flushed = planCalloutDelivery(queued || "", false);
  assert.equal(flushed.cancel, false);
  assert.equal(flushed.queued, null);
  assert.match(flushed.speakNow || "", /^Tow Guide\./);
  queued = null;
  if (flushed.speakNow) spoken.push(flushed.speakNow);
  assert.deepEqual(spoken, [flushed.speakNow]);

  const repeat = planCalloutDelivery("Tow Guide. Pick the truck, then replace the default RV GVWR with the real sticker.", false);
  const again = step(settled.state, { type: "navigate", screen: "Tow", now: 2200 }).state;
  const second = step(again, { type: "tick", now: 3700 });
  assert.equal(second.speak, null);
  assert.equal(repeat.cancel, false);
});

test("speakScreenCallout queues through the reply and never cancels it", () => {
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  const speak = realtime.slice(
    realtime.indexOf("private speakScreenCallout"),
    realtime.indexOf("private flushQueuedCallout"),
  );
  assert.ok(speak.includes("planCalloutDelivery"));
  assert.match(speak, /this\.suppressMic/);
  assert.doesNotMatch(speak, /response\.cancel/);
  assert.doesNotMatch(speak, /interruptPlayback/);
  assert.doesNotMatch(realtime, /calloutOwnsCancel/);
  assert.match(realtime, /this\.flushQueuedCallout\(\)/);
});

test("a callout waits out the user's speech and the reply to it", () => {
  let state = initialScreenCalloutState();
  state = step(state, { type: "navigate", screen: "Home", now: 0 }).state;
  state = step(state, { type: "user-start" }).state;
  const during = step(state, { type: "tick", now: 2000 });
  assert.equal(during.speak, null);
  const stopped = step(during.state, { type: "user-stop" });
  assert.equal(stopped.speak, null);
  const stillTalking = step(stopped.state, { type: "user-start" });
  const interrupted = step(stillTalking.state, {
    type: "reply-done",
    now: 2500,
  });
  assert.equal(interrupted.speak, null);
  const quiet = step(interrupted.state, { type: "user-stop" });
  const after = step(quiet.state, { type: "reply-done", now: 3000 });
  assert.match(after.speak || "", /^Home\./);
  const again = step(after.state, { type: "reply-done", now: 4000 });
  assert.equal(again.speak, null);
});
