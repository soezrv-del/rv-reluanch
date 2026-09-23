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
  REPORT_CONTACT_TEL,
} from "../rv/reportContact.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("signed-out dealer contact is David Hansen; session builder never is", () => {
  const fallback = defaultShareCardContact();
  assert.equal(fallback.name, REPORT_CONTACT_NAME);
  assert.equal(fallback.phone, REPORT_CONTACT_PHONE);
  assert.equal(fallback.tel, REPORT_CONTACT_TEL);
  assert.equal(fallback.kicker, REPORT_CONTACT_KICKER);

  const emptySession = shareCardContactForSession("", "");
  assert.equal(emptySession.name, "");
  assert.equal(emptySession.phone, "");
  assert.equal(emptySession.tel, "");
  assert.notEqual(emptySession.name, REPORT_CONTACT_NAME);
  assert.notEqual(emptySession.phone, REPORT_CONTACT_PHONE);

  const vern = shareCardContactForSession("Vern", "5412858791");
  assert.equal(vern.name, "Vern");
  assert.equal(vern.monogram, "V");
  assert.equal(vern.phone, "541-285-8791");
  assert.equal(vern.tel, "+15412858791");
  assert.equal(vern.kicker, REPORT_CONTACT_KICKER);
  assert.notEqual(vern.name, REPORT_CONTACT_NAME);
  assert.notEqual(vern.phone, REPORT_CONTACT_PHONE);
  assert.notEqual(vern.tel, REPORT_CONTACT_TEL);

  const two = shareCardContactForSession("Charlie Power", "+15412858791");
  assert.equal(two.name, "Charlie Power");
  assert.equal(two.monogram, "CP");
  assert.equal(two.phone, "541-285-8791");
  assert.equal(two.tel, "+15412858791");
});

test("Tow Share is a hard switch on access.allowed — name, phone, card", () => {
  const card = read("../../components/rvtow/TowShareCard.tsx");
  const app = read("../../components/rvtow/RvTowApp.tsx");
  assert.match(app, /<TowShareCard/);
  assert.match(app, /from "@\/components\/rvtow\/TowShareCard"/);
  assert.match(card, /useAccessOptional/);
  assert.match(card, /access\?\.allowed/);
  assert.match(
    card,
    /shareCardContactForSession\(access\.name,\s*access\.phone\)/,
  );
  assert.match(card, /defaultShareCardContact\(\)/);
  assert.match(card, /data-tow-share/);
  assert.match(card, /data-tow-share-name/);
  assert.match(card, /data-tow-share-phone/);
  assert.match(card, /data-report-signature="1"/);
  assert.match(card, /captureShareCardFile\(/);
  assert.match(card, /contact,/);
  assert.match(card, /contact\.name/);
  assert.match(card, /contact\.phone/);
  assert.match(card, /tel:\$\{contact\.tel\}/);
  assert.doesNotMatch(card, /useCurrentUser/);
  assert.doesNotMatch(app, /useCurrentUser/);
  assert.doesNotMatch(card, /REPORT_CONTACT_NAME/);
  assert.doesNotMatch(card, /REPORT_CONTACT_PHONE/);
  assert.doesNotMatch(card, /REPORT_CONTACT_TEL/);
  assert.doesNotMatch(card, /\bprefer\b|\btry\b|if available/i);
});

test("Tow Share sits after More details and before the suite disclaimer", () => {
  const src = read("../../components/rvtow/RvTowApp.tsx");
  const details = src.indexOf(">More details<");
  const share = src.indexOf("<TowShareCard");
  const disclaimer = src.indexOf("<SuiteDisclaimer");
  assert.ok(details >= 0 && share > details, "Share is below More details");
  assert.ok(share < disclaimer, "Share is above SuiteDisclaimer");
});
