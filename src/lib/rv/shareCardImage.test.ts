import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildShareKitPayload,
  canShareSaysYes,
  coerceShareImageType,
  defaultShareCardContact,
  elementLooksLikeShareCard,
  hardenShareImageFile,
  imageFileFromBytes,
  isShareImageFile,
  normalizeShareImageMeta,
  orderShareImageFiles,
  paintShareSignatureCard,
  shareDataAttempts,
  shareOrCopy,
  toShareData,
  SHARE_CARD_FILENAME,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_MIME,
  SHARE_CARD_WIDTH,
} from "./shareCardImage.ts";
import {
  REPORT_CONTACT_NAME,
  REPORT_CONTACT_PHONE,
} from "./reportContact.ts";

const here = dirname(fileURLToPath(import.meta.url));
const ui = readFileSync(
  join(here, "../../components/rvshare/RvShareApp.tsx"),
  "utf8",
);
const kit = readFileSync(join(here, "shareKit.ts"), "utf8");

/** 1×1 PNG — real image bytes, not a canvas URL or HTML. */
const MINI_PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
);

function cardFile(name = SHARE_CARD_FILENAME) {
  return imageFileFromBytes(MINI_PNG, name, SHARE_CARD_MIME);
}

test("share payload includes a real PNG when the card is present", () => {
  const payload = buildShareKitPayload({
    title: "2024 Newmar Essex 4551",
    text: "RvFOX · Powered by Grok\n\nSUMMARY\nFlagship diesel.",
    cardFile: cardFile("Essex-card.png"),
  });
  assert.equal(payload.files.length, 1);
  const file = payload.files[0]!;
  assert.equal(file.type, "image/png");
  assert.match(file.name, /\.png$/i);
  assert.ok(file.size >= 32);
  assert.equal(file.name.includes("blob:"), false);
  assert.doesNotMatch(file.type, /html|octet-stream/i);
  assert.match(payload.text, /SUMMARY/);
});

test("share payload omits the card file when the card is absent", () => {
  const payload = buildShareKitPayload({
    title: "2024 Newmar Essex",
    text: "kit",
    cardFile: null,
  });
  assert.equal(payload.files.length, 0);
  assert.equal(payload.text, "kit");
});

test("HTML and empty blobs are never treated as the card image", () => {
  const html = new File(["<html><body>card</body></html>"], "card.html", {
    type: "text/html",
  });
  const empty = new File([], "empty.png", { type: "image/png" });
  const payload = buildShareKitPayload({
    title: "x",
    text: "y",
    cardFile: html,
    extraFiles: [empty],
  });
  assert.equal(payload.files.length, 0);
  assert.equal(isShareImageFile(html), false);
  assert.equal(isShareImageFile(empty), false);
});

test("RV hero is first; contact card is never the preview when a hero exists", () => {
  const jpeg = new File([MINI_PNG], "coach-hero.jpg", {
    type: "image/jpeg",
  });
  const payload = buildShareKitPayload({
    title: "coach",
    text: "kit",
    heroFile: jpeg,
    cardFile: cardFile(),
  });
  assert.equal(payload.files.length, 2);
  assert.equal(payload.files[0]!.type, "image/jpeg");
  assert.match(payload.files[0]!.name, /hero/i);
  assert.equal(payload.files[1]!.type, "image/png");
  assert.equal(SHARE_CARD_WIDTH / SHARE_CARD_HEIGHT, 16 / 9);
});

test("lifestyle JPEG rides after the hero and before the card PNG", () => {
  const hero = new File([MINI_PNG], "coach-hero.jpg", {
    type: "image/jpeg",
  });
  const lifestyle = new File([new Uint8Array([...MINI_PNG, 1])], "coach-lifestyle.jpg", {
    type: "image/jpeg",
  });
  const payload = buildShareKitPayload({
    title: "coach",
    text: "kit",
    heroFile: hero,
    cardFile: cardFile(),
    extraFiles: [lifestyle],
  });
  assert.equal(payload.files.length, 3);
  assert.equal(payload.files[0]!.name, "coach-hero.jpg");
  assert.equal(payload.files[1]!.name, "coach-lifestyle.jpg");
  assert.equal(payload.files[2]!.type, "image/png");
});

test("same-bytes lifestyle is not duplicated when the hero is already attached", () => {
  const jpeg = new File([MINI_PNG], "coach-hero.jpg", {
    type: "image/jpeg",
  });
  const files = orderShareImageFiles({
    heroFile: jpeg,
    extraFiles: [new File([MINI_PNG], "coach-lifestyle.jpg", { type: "image/jpeg" })],
    cardFile: cardFile(),
  });
  assert.equal(files.length, 2);
  assert.equal(files[0]!.type, "image/jpeg");
  assert.equal(files[1]!.type, "image/png");
});

test("share attempts always keep the image file — never text-only", () => {
  const files = [cardFile()];
  const attempts = shareDataAttempts({
    title: "2024 Newmar Essex",
    text: "long kit text",
    files,
  });
  assert.ok(attempts.length >= 2);
  for (const attempt of attempts) {
    assert.ok(attempt.files?.length);
    assert.equal(attempt.files![0]!.type, "image/png");
  }
  assert.equal(
    attempts.some((a) => a.text && !a.files?.length),
    false,
  );
});

test("text-only attempt is used only when no image file exists", () => {
  const attempts = shareDataAttempts({
    title: "RvFOX Pro",
    text: "suite pitch",
    files: [],
  });
  assert.deepEqual(attempts, [{ title: "RvFOX Pro", text: "suite pitch" }]);
});

test("hardenShareImageFile rewrites bytes into a named image File", async () => {
  const raw = new File([MINI_PNG], "card", { type: "image/png" });
  const file = await hardenShareImageFile(raw);
  assert.ok(file);
  assert.equal(file.type, "image/png");
  assert.match(file.name, /\.png$/);
  assert.ok(file.size >= 32);
  assert.equal(normalizeShareImageMeta(raw)?.type, "image/png");
});

test("hardenShareImageFile rejects HTML attachments", async () => {
  const html = new File(["<html></html>"], "report.html", {
    type: "text/html",
  });
  assert.equal(await hardenShareImageFile(html), null);
  assert.equal(normalizeShareImageMeta(html), null);
});

test("painted card matches the in-app signature (name + phone)", () => {
  const texts: string[] = [];
  const ctx = {
    save() {},
    restore() {},
    fillRect() {},
    beginPath() {},
    moveTo() {},
    arcTo() {},
    closePath() {},
    fill() {},
    fillStyle: "",
    font: "",
    textAlign: "left",
    textBaseline: "alphabetic",
    fillText(text: string) {
      texts.push(text);
    },
    measureText(text: string) {
      return { width: String(text).length * 10 };
    },
  };
  paintShareSignatureCard(
    ctx as unknown as CanvasRenderingContext2D,
    SHARE_CARD_WIDTH,
    SHARE_CARD_HEIGHT,
    defaultShareCardContact(),
  );
  const joined = texts.join("");
  assert.match(joined, new RegExp(REPORT_CONTACT_NAME));
  assert.match(joined, new RegExp(REPORT_CONTACT_PHONE.replace(/-/g, "\\-")));
  assert.match(joined, /FOX/);
  assert.match(joined.replace(/\s+/g, ""), /KNOWBEFOREYOUBUY/);
  assert.match(joined, /RvFOX · Powered by Grok/);
});

test("live card node is the capture target — same preview, real file on send", () => {
  assert.match(ui, /data-report-signature="1"/);
  assert.match(ui, /shareCardRef/);
  assert.match(ui, /captureShareCardFile/);
  assert.match(ui, /buildShareKitPayload/);
  assert.match(ui, /cardFile/);
  assert.doesNotMatch(
    ui.slice(ui.indexOf("const sendKit"), ui.indexOf("const copyOnly")),
    /files: files\.length \? files : undefined/,
  );
});

test("shareOrCopy prefers the native sheet and does not gate on canShare", () => {
  const card = readFileSync(join(here, "shareCardImage.ts"), "utf8");
  assert.match(kit, /shareOrCopy/);
  assert.match(kit, /buildShareKitPayload/);
  assert.match(card, /shareDataAttempts/);
  assert.match(card, /hardenShareImageFileSync/);
  assert.match(card, /canShareSaysYes/);
  assert.match(card, /downloadShareFile/);
  assert.match(card, /return "downloaded"/);
  assert.doesNotMatch(card, /if \(!canShareData\(nav\.canShare, data\)\) continue/);
  assert.doesNotMatch(
    card,
    /if \(hardened\.length && !attempt\.text\) \{\s*await copyKit/,
  );
});

test("share path prefers navigator.share with files when canShare is true", async () => {
  const shared: ShareData[] = [];
  const copied: string[] = [];
  const prior = globalThis.navigator;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      share: async (data: ShareData) => {
        shared.push(data);
      },
      canShare: () => true,
      clipboard: {
        writeText: async (text: string) => {
          copied.push(text);
        },
      },
    },
  });
  try {
    const payload = buildShareKitPayload({
      title: "2024 Newmar Essex",
      text: "RvFOX · Powered by Grok\nSUMMARY",
      cardFile: cardFile("Essex-card.png"),
    });
    const out = await shareOrCopy(payload);
    assert.equal(out, "shared");
    assert.equal(shared.length, 1);
    const files = shared[0]!.files as File[] | undefined;
    assert.ok(files?.length);
    assert.equal(files![0]!.type, "image/png");
    assert.match(files![0]!.name, /\.png$/);
    assert.ok(files![0]!.size >= 32);
    assert.equal(copied.length, 0);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: prior,
    });
  }
});

test("shareOrCopy still opens the sheet with files when canShare({files}) is false", async () => {
  const shared: ShareData[] = [];
  const copied: string[] = [];
  const prior = globalThis.navigator;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      share: async (data: ShareData) => {
        shared.push(data);
      },
      canShare: (data?: ShareData) => !data?.files?.length,
      clipboard: {
        writeText: async (text: string) => {
          copied.push(text);
        },
      },
    },
  });
  try {
    const jpeg = new File([MINI_PNG], "coach-hero.jpg", {
      type: "image/jpeg",
    });
    const payload = buildShareKitPayload({
      title: "Essex",
      text: "kit",
      heroFile: jpeg,
      cardFile: cardFile(),
    });
    const out = await shareOrCopy(payload);
    assert.equal(out, "shared");
    assert.equal(shared.length, 1);
    const files = shared[0]!.files as File[] | undefined;
    assert.equal(files?.length, 2);
    assert.equal(files![0]!.type, "image/jpeg");
    assert.equal(files![1]!.type, "image/png");
    assert.equal(copied.length, 0);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: prior,
    });
  }
});

test("shareOrCopy still shares when canShare throws", async () => {
  const shared: ShareData[] = [];
  const prior = globalThis.navigator;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      share: async (data: ShareData) => {
        shared.push(data);
      },
      canShare: () => {
        throw new Error("canShare exploded");
      },
      clipboard: { writeText: async () => {} },
    },
  });
  try {
    const out = await shareOrCopy({
      title: "Essex",
      text: "kit",
      files: [cardFile()],
    });
    assert.equal(out, "shared");
    assert.ok((shared[0]!.files as File[])?.length);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: prior,
    });
  }
});

test("clipboard-only / download is last-resort when navigator.share is missing", async () => {
  const downloaded: string[] = [];
  const copied: string[] = [];
  const prior = globalThis.navigator;
  const priorDoc = globalThis.document;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (text: string) => {
          copied.push(text);
        },
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: (tag: string) => {
        if (tag === "a") {
          return {
            href: "",
            download: "",
            rel: "",
            style: { display: "" },
            click() {
              downloaded.push(this.download || "file");
            },
          };
        }
        return { style: {}, setAttribute() {}, select() {}, remove() {} };
      },
      body: { appendChild() {} },
    },
  });
  try {
    const out = await shareOrCopy({
      title: "Essex",
      text: "kit",
      files: [cardFile()],
    });
    assert.equal(out, "downloaded");
    assert.ok(downloaded.length >= 1);
    assert.match(downloaded[0]!, /\.png$/);
    assert.deepEqual(copied, ["kit"]);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: prior,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: priorDoc,
    });
  }
});

test("lifestyle JPEG is in files[] when the lifestyle section is on", () => {
  const jpeg = new File([new Uint8Array([...MINI_PNG, 2])], "coach-lifestyle.jpg", {
    type: "image/jpeg",
  });
  const hero = new File([MINI_PNG], "coach-hero.jpg", {
    type: "image/jpeg",
  });
  const on = buildShareKitPayload({
    title: "coach",
    text: "kit",
    heroFile: hero,
    cardFile: cardFile(),
    extraFiles: [jpeg],
  });
  const off = buildShareKitPayload({
    title: "coach",
    text: "kit",
    heroFile: hero,
    cardFile: cardFile(),
    extraFiles: [],
  });
  assert.equal(on.files.length, 3);
  assert.equal(on.files[0]!.name, "coach-hero.jpg");
  assert.equal(on.files[1]!.name, "coach-lifestyle.jpg");
  assert.equal(off.files.length, 2);
  assert.equal(off.files[0]!.type, "image/jpeg");
  assert.equal(off.files[1]!.type, "image/png");
  assert.match(ui, /include\.lifestyle/);
  assert.match(ui, /peekCachedShareImage/);
  assert.match(ui, /prefetchShareImages/);
  assert.match(ui, /heroFile/);
  assert.match(
    ui.slice(ui.indexOf("const sendKit"), ui.indexOf("const copyOnly")),
    /heroFile/,
  );
});

test("octet-stream lifestyle JPEG is still a shareable image file", () => {
  const raw = new File([MINI_PNG], "fifth-wheel-lifestyle.jpg", {
    type: "application/octet-stream",
  });
  assert.equal(coerceShareImageType(raw.type, raw.name), "image/jpeg");
  assert.equal(isShareImageFile(raw), true);
  const payload = buildShareKitPayload({
    title: "coach",
    text: "kit",
    extraFiles: [raw],
  });
  assert.equal(payload.files.length, 1);
  assert.match(payload.files[0]!.name, /\.jpe?g$/i);
});

test("canShareSaysYes is a hint — missing or throw is not a no", () => {
  const data: ShareData = { title: "x", text: "y", files: [cardFile()] };
  assert.equal(canShareSaysYes(undefined, data), true);
  assert.equal(canShareSaysYes(() => true, data), true);
  assert.equal(canShareSaysYes(() => false, data), false);
  assert.equal(
    canShareSaysYes(() => {
      throw new Error("nope");
    }, data),
    false,
  );
  assert.ok(toShareData({ title: "t", files: [cardFile()] }).files?.length);
});

test("elementLooksLikeShareCard requires the on-screen signature card", () => {
  const el = {
    getAttribute: (name: string) =>
      name === "data-report-signature" ? "1" : null,
    textContent: `Prepared by ${REPORT_CONTACT_NAME} ${REPORT_CONTACT_PHONE}`,
  };
  assert.equal(elementLooksLikeShareCard(el as unknown as Element), true);
  assert.equal(elementLooksLikeShareCard(null), false);
  assert.equal(
    elementLooksLikeShareCard({
      getAttribute: () => "1",
      textContent: "empty",
    } as unknown as Element),
    false,
  );
});
