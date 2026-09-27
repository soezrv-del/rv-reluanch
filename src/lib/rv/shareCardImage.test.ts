import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultShareCardContact,
  isShareAbort,
  isShareBusyError,
  resetShareSession,
  resolveFaxShareContact,
  shareCardContactForSession,
  shareOrCopy,
} from "./shareCardImage.ts";
import {
  REPORT_CONTACT_LAST,
  REPORT_CONTACT_NAME,
  REPORT_CONTACT_PHONE,
  REPORT_CONTACT_TEL,
} from "./reportContact.ts";

const here = dirname(fileURLToPath(import.meta.url));
const ui = readFileSync(
  join(here, "../../components/rvshare/RvShareKit.tsx"),
  "utf8",
);

test("on-screen signature card stays; Share kit sends the report", () => {
  assert.match(ui, /data-report-signature="1"/);
  assert.match(ui, /data-fax-share-name/);
  assert.match(ui, /data-fax-share-phone/);
  assert.match(ui, /shareReportLink/);
  assert.match(ui, /shareReportPdfFile/);
  assert.match(ui, /resolveFaxShareContact/);
});

test("shareOrCopy opens the native sheet with title and text", async () => {
  const shared: ShareData[] = [];
  const copied: string[] = [];
  const prior = globalThis.navigator;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      share: async (data: ShareData) => {
        shared.push(data);
      },
      clipboard: {
        writeText: async (text: string) => {
          copied.push(text);
        },
      },
    },
  });
  try {
    const out = await shareOrCopy({
      title: "RvFOX Pro",
      text: "suite pitch",
    });
    assert.equal(out, "shared");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.title, "RvFOX Pro");
    assert.equal(shared[0]!.text, "suite pitch");
    assert.equal(shared[0]!.files, undefined);
    assert.equal(copied.length, 0);
  } finally {
    resetShareSession();
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: prior,
    });
  }
});

test("clipboard is the fallback when navigator.share is missing", async () => {
  const copied: string[] = [];
  const prior = globalThis.navigator;
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
  try {
    const out = await shareOrCopy({ title: "RvFOX Pro", text: "suite pitch" });
    assert.equal(out, "copied");
    assert.deepEqual(copied, ["suite pitch"]);
  } finally {
    resetShareSession();
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: prior,
    });
  }
});

test("Include video never adds a video file to the suite share", () => {
  const send = ui.slice(ui.indexOf("const sendSuite"), ui.indexOf("const goCal"));
  assert.match(ui, /data-include-video=\{includeVideo/);
  assert.match(ui, /data-share-video-toggle/);
  assert.match(send, /shareOrCopy\(\{/);
  assert.match(send, /buildSuitePitch\(\)/);
  assert.doesNotMatch(send, /video\/mp4|video\/webm|\.mp4|\.webm|files:/);
});

test("isShareBusyError matches WebKit already-in-progress; cancel stays abort", () => {
  const busy = new DOMException(
    "share() is already in progress",
    "InvalidStateError",
  );
  const earlier = new Error("An earlier share has not yet completed.");
  earlier.name = "InvalidStateError";
  const abort = new DOMException(
    "Abort due to cancellation of share.",
    "AbortError",
  );
  assert.equal(isShareBusyError(busy), true);
  assert.equal(isShareBusyError(earlier), true);
  assert.equal(isShareBusyError(abort), false);
  assert.equal(isShareAbort(abort), true);
  assert.equal(isShareAbort(busy), false);
});

test("shareOrCopy can open the sheet twice in the same session", async () => {
  const shared: ShareData[] = [];
  const prior = globalThis.navigator;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      share: async (data: ShareData) => {
        shared.push(data);
      },
      clipboard: { writeText: async () => {} },
    },
  });
  try {
    assert.equal(
      await shareOrCopy({ title: "RvFOX Pro", text: "kit one" }),
      "shared",
    );
    assert.equal(
      await shareOrCopy({ title: "RvFOX Pro", text: "kit two" }),
      "shared",
    );
    assert.equal(shared.length, 2);
    assert.equal(shared[0]!.text, "kit one");
    assert.equal(shared[1]!.text, "kit two");
  } finally {
    resetShareSession();
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: prior,
    });
  }
});

test("shareOrCopy treats a cancelled sheet as ready for another share", async () => {
  const shared: ShareData[] = [];
  const prior = globalThis.navigator;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      share: async (data: ShareData) => {
        shared.push(data);
        if (shared.length === 1) {
          throw new DOMException(
            "Abort due to cancellation of share.",
            "AbortError",
          );
        }
      },
      clipboard: { writeText: async () => {} },
    },
  });
  try {
    const payload = { title: "RvFOX Pro", text: "suite pitch" };
    assert.equal(await shareOrCopy(payload), "cancelled");
    assert.equal(await shareOrCopy(payload), "shared");
    assert.equal(shared.length, 2);
  } finally {
    resetShareSession();
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: prior,
    });
  }
});

function iframeDocument(shareImpl: (data: ShareData) => Promise<void>) {
  return {
    body: { appendChild() {} },
    createElement: (tag: string) => {
      if (tag === "iframe") {
        return {
          setAttribute() {},
          style: { cssText: "" },
          src: "",
          contentWindow: {
            navigator: {
              share: shareImpl,
            },
          },
          remove() {},
        };
      }
      return { style: {}, setAttribute() {}, select() {}, remove() {} };
    },
  };
}

test("iframe NotAllowedError falls back to parent navigator.share", async () => {
  const parentCalls: ShareData[] = [];
  const prior = globalThis.navigator;
  const priorDoc = globalThis.document;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      share: async (data: ShareData) => {
        parentCalls.push(data);
      },
      clipboard: { writeText: async () => {} },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: iframeDocument(async () => {
      throw new DOMException(
        "The request is not allowed by the user agent",
        "NotAllowedError",
      );
    }),
  });
  try {
    const out = await shareOrCopy({ title: "RvFOX Pro", text: "suite pitch" });
    assert.equal(out, "shared");
    assert.equal(parentCalls.length, 1);
    assert.equal(parentCalls[0]!.text, "suite pitch");
    assert.equal(parentCalls[0]!.files, undefined);
  } finally {
    resetShareSession();
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

test("a hung first navigator.share does not block a second tap", async () => {
  const iframeCalls: ShareData[] = [];
  const prior = globalThis.navigator;
  const priorDoc = globalThis.document;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      share: async () => {
        throw new DOMException(
          "The request is not allowed by the user agent",
          "NotAllowedError",
        );
      },
      clipboard: { writeText: async () => {} },
    },
  });
  let iframeTries = 0;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: iframeDocument(async (data: ShareData) => {
      iframeTries += 1;
      if (iframeTries === 1) return new Promise<void>(() => {});
      iframeCalls.push(data);
    }),
  });
  try {
    const first = shareOrCopy({ title: "RvFOX Pro", text: "kit" });
    await Promise.resolve();
    const second = await shareOrCopy({ title: "RvFOX Pro", text: "kit again" });
    assert.equal(second, "shared");
    assert.equal(iframeCalls.length, 1);
    assert.equal(iframeCalls[0]!.text, "kit again");
    void first;
  } finally {
    resetShareSession();
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

test("Share kit send offers the report and never disables after one send", () => {
  const send = ui.slice(
    ui.indexOf("const shareFactsLink"),
    ui.indexOf("const shareFactsPdf"),
  );
  assert.match(send, /shareReportLink\(factsReport\)/);
  assert.match(ui, /shareReportPdfFile\(factsReport\)/);
  assert.doesNotMatch(send, /if \(sending\) return/);
  assert.doesNotMatch(ui, /disabled=\{sending/);
  assert.match(ui, /onClick=\{\(\) => void sendKit\(\)\}/);
  assert.match(ui, /if \(out === "aborted"\) return/);
});

test("signed-out dealer contact is David Hansen; session builder never is", () => {
  const fallback = defaultShareCardContact();
  assert.equal(REPORT_CONTACT_LAST, "Hansen");
  assert.equal(REPORT_CONTACT_NAME, `David ${REPORT_CONTACT_LAST}`);
  assert.equal(fallback.name, REPORT_CONTACT_NAME);
  assert.equal(fallback.phone, REPORT_CONTACT_PHONE);
  assert.equal(fallback.tel, REPORT_CONTACT_TEL);
  assert.doesNotMatch(fallback.name, /Hanson/);

  const emptySession = shareCardContactForSession("", "");
  assert.equal(emptySession.name, "");
  assert.equal(emptySession.phone, "");
  assert.notEqual(emptySession.name, REPORT_CONTACT_NAME);
  assert.notEqual(emptySession.phone, REPORT_CONTACT_PHONE);

  const vern = shareCardContactForSession("Vern", "5412858791");
  assert.equal(vern.name, "Vern");
  assert.equal(vern.phone, "541-285-8791");
  assert.equal(vern.tel, "+15412858791");
  assert.notEqual(vern.name, REPORT_CONTACT_NAME);
  assert.notEqual(vern.phone, REPORT_CONTACT_PHONE);
});

test("Facts Share kit is a hard switch on access.allowed — name, phone, card", () => {
  const shell = readFileSync(
    join(here, "../../components/shell/AppShell.tsx"),
    "utf8",
  );
  assert.match(ui, /useAccessOptional/);
  assert.match(ui, /resolveFaxShareContact\(session, storedIdentity\)/);
  assert.match(ui, /access \?\? nav\?\.accessSession/);
  assert.match(ui, /readStoredFirstName/);
  assert.match(ui, /readStoredPhone/);
  assert.match(shell, /accessSession:/);
  assert.match(shell, /allowed: access\.allowed/);
  assert.match(shell, /name: access\.name/);
  assert.match(shell, /phone: access\.phone/);
  assert.match(ui, /data-fax-share-name/);
  assert.match(ui, /data-fax-share-phone/);
  assert.match(ui, /data-share-link/);
  assert.match(ui, /data-report-signature="1"/);
  assert.match(ui, /contact\.name/);
  assert.match(ui, /contact\.phone/);
  assert.match(ui, /tel:\$\{contact\.tel\}/);
  assert.doesNotMatch(ui, /useCurrentUser/);
  assert.doesNotMatch(ui, /REPORT_CONTACT_NAME/);
  assert.doesNotMatch(ui, /REPORT_CONTACT_PHONE/);
  assert.doesNotMatch(ui, /REPORT_CONTACT_TEL/);
  assert.doesNotMatch(ui, /\bprefer\b|\btry\b|if available/i);
  assert.doesNotMatch(ui, /TowShareCard/);
});

test("resolveFaxShareContact hard-switch: Vern is not David Hansen", () => {
  const vernAccess = {
    allowed: true,
    status: "full",
    name: "Vern",
    phone: "5412858791",
  };
  const vern = resolveFaxShareContact(vernAccess);
  assert.equal(vern.name, "Vern");
  assert.equal(vern.phone, "541-285-8791");
  assert.equal(vern.tel, "+15412858791");
  assert.notEqual(vern.name, REPORT_CONTACT_NAME);
  assert.notEqual(vern.phone, REPORT_CONTACT_PHONE);
  assert.doesNotMatch(vern.name, /David Hansen/);
  assert.doesNotMatch(vern.phone, /702-266-5918/);

  const signedOut = resolveFaxShareContact(null);
  assert.equal(signedOut.name, REPORT_CONTACT_NAME);
  assert.equal(signedOut.phone, REPORT_CONTACT_PHONE);

  const browse = resolveFaxShareContact(
    { allowed: false, status: "browse", name: "", phone: "" },
    { name: "Vern", phone: "5412858791" },
  );
  assert.equal(browse.name, REPORT_CONTACT_NAME);
  assert.equal(browse.phone, REPORT_CONTACT_PHONE);

  const pendingStored = resolveFaxShareContact(
    { allowed: false, status: "checking", name: "", phone: "" },
    { name: "Vern", phone: "5412858791" },
  );
  assert.equal(pendingStored.name, "Vern");
  assert.equal(pendingStored.phone, "541-285-8791");
  assert.notEqual(pendingStored.name, REPORT_CONTACT_NAME);

  const missingContext = resolveFaxShareContact(null, {
    name: "Vern",
    phone: "5412858791",
  });
  assert.equal(missingContext.name, "Vern");
  assert.equal(missingContext.phone, "541-285-8791");
  assert.notEqual(missingContext.name, REPORT_CONTACT_NAME);
});

test("share and dealer contact surfaces lock Hansen — never Hanson", () => {
  const surfaces = [
    join(here, "reportContact.ts"),
    join(here, "shareCardImage.ts"),
    join(here, "shareKit.ts"),
    join(here, "exportReport.ts"),
    join(here, "../../components/rvshare/RvShareKit.tsx"),
    join(here, "../access/ndaText.ts"),
  ];
  for (const file of surfaces) {
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(
      src,
      /Hanson/,
      `${file} must not misspell Hansen as Hanson`,
    );
    assert.doesNotMatch(src, /David Hanson/);
  }
  const report = readFileSync(join(here, "reportContact.ts"), "utf8");
  assert.match(report, /REPORT_CONTACT_LAST = "Hansen"/);
  assert.match(report, /David \$\{REPORT_CONTACT_LAST\}/);
  assert.match(
    readFileSync(join(here, "shareCardImage.ts"), "utf8"),
    /name: REPORT_CONTACT_NAME/,
  );
  assert.match(
    readFileSync(join(here, "exportReport.ts"), "utf8"),
    /REPORT_CONTACT_NAME/,
  );
});

test("Tow no longer mounts a Share card", () => {
  const tow = readFileSync(
    join(here, "../../components/rvtow/RvTowApp.tsx"),
    "utf8",
  );
  assert.doesNotMatch(tow, /TowShareCard/);
  assert.doesNotMatch(tow, /data-tow-share/);
});
