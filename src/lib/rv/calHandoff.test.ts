import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decideCalOpen, normalizeCalHandoff } from "./calHandoff.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("normalizeCalHandoff keeps a narrow price + label and refuses empty/GAP", () => {
  assert.deepEqual(normalizeCalHandoff({ price: 379000, label: "  2023 Dream · 45A  " }), {
    price: 379000,
    label: "2023 Dream · 45A",
  });
  assert.deepEqual(normalizeCalHandoff({ price: 199000.4 }), { price: 199000 });
  assert.equal(normalizeCalHandoff({ price: 0, label: "2023 Dream" }), null);
  assert.equal(normalizeCalHandoff({ price: -12, label: "nope" }), null);
  assert.equal(normalizeCalHandoff({ price: Number.NaN }), null);
  assert.equal(normalizeCalHandoff(null), null);
  assert.equal(normalizeCalHandoff({}), null);
});

test("plain Cal open resets — leftover seed does not pre-fill", () => {
  assert.deepEqual(
    decideCalOpen({
      seed: { token: 4, price: 412000, label: "leftover unit" },
      lastSeedToken: 3,
      cleanToken: 2,
      lastCleanToken: 1,
    }),
    { action: "reset" },
  );
  assert.deepEqual(
    decideCalOpen({
      seed: null,
      lastSeedToken: 4,
      cleanToken: 3,
      lastCleanToken: 2,
    }),
    { action: "reset" },
  );
});

test("Facts Check payment handoff applies once, then later clean tap resets", () => {
  const first = decideCalOpen({
    seed: { token: 1, price: 379000, label: "2023 Dream · 45A" },
    lastSeedToken: 0,
    cleanToken: 0,
    lastCleanToken: 0,
  });
  assert.deepEqual(first, {
    action: "apply",
    payload: { price: 379000, label: "2023 Dream · 45A" },
  });

  const alreadyConsumed = decideCalOpen({
    seed: { token: 1, price: 379000, label: "2023 Dream · 45A" },
    lastSeedToken: 1,
    cleanToken: 0,
    lastCleanToken: 0,
  });
  assert.deepEqual(alreadyConsumed, { action: "noop" });

  const laterTabTap = decideCalOpen({
    seed: { token: 1, price: 379000, label: "2023 Dream · 45A" },
    lastSeedToken: 1,
    cleanToken: 1,
    lastCleanToken: 0,
  });
  assert.deepEqual(laterTabTap, { action: "reset" });
});

test("zero-price handoff does not invent a unit", () => {
  assert.deepEqual(
    decideCalOpen({
      seed: { token: 2, price: 0, label: "2023 Dream" },
      lastSeedToken: 0,
      cleanToken: 0,
      lastCleanToken: 0,
    }),
    { action: "noop" },
  );
});

test("Cal ignores shared activeCoach and only consumes explicit calSeed", () => {
  const cal = read("../../components/rvcal/RvCalApp.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const nav = read("../../components/shell/ShellNavContext.ts");
  const facts = read("../../components/rvfax/RvDetail.tsx");
  const share = read("../../components/rvshare/RvShareKit.tsx");

  assert.match(cal, /decideCalOpen/);
  assert.match(cal, /normalizeCalHandoff|decideCalOpen/);
  assert.doesNotMatch(cal, /bestCalPrice\(/);
  assert.doesNotMatch(cal, /activeCoachKey\(/);
  assert.doesNotMatch(cal, /formatActiveCoachChip\(/);
  assert.doesNotMatch(cal, /nav\?\.activeCoach/);

  assert.match(shell, /requestCleanCal/);
  assert.match(shell, /if \(next === "rvcal"\) requestCleanCal\(\)/);
  assert.match(shell, /normalizeCalHandoff/);
  assert.match(shell, /setCalSeed\(\{[\s\S]*token: calTokenRef/);

  assert.match(nav, /calCleanToken/);
  assert.match(nav, /One-shot Facts Check payment seed/);

  assert.match(facts, /label="Check payment"/);
  assert.match(facts, /data-facts-check-payment/);
  assert.match(facts, /const openCheckPayment/);
  assert.match(facts, /openCalWithPrice\(price, label\)/);

  assert.match(share, /nav\?\.setTab\("rvcal"\)/);
  assert.doesNotMatch(share, /openCalWithPrice/);
});
