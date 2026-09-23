import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultShareCardContact,
  shareCardContactForSession,
} from "../rv/shareCardImage.ts";
import {
  REPORT_CONTACT_KICKER,
  REPORT_CONTACT_NAME,
  REPORT_CONTACT_PHONE,
} from "../rv/reportContact.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("shareCardContactForSession uses signed-in access name; empty keeps dealer", () => {
  const fallback = defaultShareCardContact();
  assert.deepEqual(shareCardContactForSession(""), fallback);
  assert.deepEqual(shareCardContactForSession("   "), fallback);
  assert.deepEqual(shareCardContactForSession(null), fallback);
  assert.deepEqual(shareCardContactForSession(undefined), fallback);
  assert.equal(fallback.name, REPORT_CONTACT_NAME);
  assert.equal(fallback.phone, REPORT_CONTACT_PHONE);
  assert.equal(fallback.kicker, REPORT_CONTACT_KICKER);

  const signed = shareCardContactForSession("Cheri");
  assert.equal(signed.name, "Cheri");
  assert.equal(signed.monogram, "C");
  assert.equal(signed.kicker, REPORT_CONTACT_KICKER);
  assert.equal(signed.phone, REPORT_CONTACT_PHONE);

  const two = shareCardContactForSession("Charlie Power");
  assert.equal(two.name, "Charlie Power");
  assert.equal(two.monogram, "CP");
});

test("Tow Share card reads phone-access session name — not Better Auth", () => {
  const card = read("../../components/rvtow/TowShareCard.tsx");
  const app = read("../../components/rvtow/RvTowApp.tsx");
  assert.match(app, /<TowShareCard/);
  assert.match(app, /from "@\/components\/rvtow\/TowShareCard"/);
  assert.match(card, /useAccessOptional/);
  assert.match(card, /access\?\.allowed && access\.name/);
  assert.match(card, /shareCardContactForSession/);
  assert.match(card, /data-tow-share/);
  assert.match(card, /data-tow-share-name/);
  assert.match(card, /data-report-signature="1"/);
  assert.match(card, /captureShareCardFile\(/);
  assert.match(card, /contact,/);
  assert.doesNotMatch(card, /useCurrentUser/);
  assert.doesNotMatch(app, /useCurrentUser/);
  assert.doesNotMatch(card, /REPORT_CONTACT_NAME/);
});

test("Tow Share sits after More details and before the suite disclaimer", () => {
  const src = read("../../components/rvtow/RvTowApp.tsx");
  const details = src.indexOf(">More details<");
  const share = src.indexOf("<TowShareCard");
  const disclaimer = src.indexOf("<SuiteDisclaimer");
  assert.ok(details >= 0 && share > details, "Share is below More details");
  assert.ok(share < disclaimer, "Share is above SuiteDisclaimer");
});
