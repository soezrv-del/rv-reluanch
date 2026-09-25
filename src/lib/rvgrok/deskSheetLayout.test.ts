import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  deskRevealAfterIndex,
  latestDeskMessageIndex,
  shouldShowPendingLiveDesk,
} from "./deskSheetLayout.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

const sheet = { title: "2022 Tiffin Phaeton 40IH" };

test("desk follows the latest relevant reply, not the top of the thread", () => {
  assert.equal(latestDeskMessageIndex([]), -1);
  assert.equal(deskRevealAfterIndex([]), -1);

  const midThread = [
    { role: "user", deskSheet: undefined },
    { role: "assistant", deskSheet: sheet, streaming: false },
    { role: "user" },
    { role: "assistant", streaming: false },
  ];
  assert.equal(latestDeskMessageIndex(midThread), 1);
  assert.equal(deskRevealAfterIndex(midThread), 1);

  const updated = [
    ...midThread,
    { role: "user" },
    { role: "assistant", deskSheet: { title: "2025 Aspire 44R" }, streaming: false },
  ];
  assert.equal(latestDeskMessageIndex(updated), 5);
  assert.equal(deskRevealAfterIndex(updated), 5);
});

test("desk waits until the assistant reply is finished streaming", () => {
  const streaming = [
    { role: "user" },
    { role: "assistant", deskSheet: sheet, streaming: true },
  ];
  assert.equal(latestDeskMessageIndex(streaming), 1);
  assert.equal(deskRevealAfterIndex(streaming), -1);
  assert.equal(
    deskRevealAfterIndex([
      { role: "user" },
      { role: "assistant", deskSheet: sheet, streaming: false },
    ]),
    1,
  );
});

test("pending Live Voice desk sits after the thread, never as a header", () => {
  assert.equal(shouldShowPendingLiveDesk([], null), false);
  assert.equal(shouldShowPendingLiveDesk([], sheet), false);
  assert.equal(shouldShowPendingLiveDesk([{ role: "user" }], sheet), false);
  assert.equal(
    shouldShowPendingLiveDesk(
      [{ role: "user" }, { role: "assistant", streaming: true }],
      sheet,
    ),
    false,
  );
  assert.equal(
    shouldShowPendingLiveDesk(
      [{ role: "user" }, { role: "assistant", streaming: false }],
      sheet,
    ),
    true,
  );
  assert.equal(
    shouldShowPendingLiveDesk(
      [{ role: "assistant", deskSheet: sheet, streaming: false }],
      sheet,
    ),
    false,
  );
});

test("a full report stays on its reply, never as a thread footer", () => {
  const app = src("../../components/rvgrok/RvGrokApp.tsx");
  const bubble = src("../../components/rvgrok/MessageBubble.tsx");

  assert.match(app, /deskRevealAfterIndex/);
  assert.match(app, /data-rvgrok-desk-after-reply/);
  assert.match(app, /DeskSpecSheet/);
  assert.doesNotMatch(app, /pendingLiveSheet/);
  assert.doesNotMatch(
    app,
    /CARFAX desk is the written reply/,
    "assistant prose stays in the thread; desk is not a substitute header",
  );
  assert.doesNotMatch(app, /if \(reportSheet && m\.deskSheet\) return null/);

  const threadStart = app.indexOf("const thread =");
  const mapIdx = app.indexOf("messages.map", threadStart);
  const afterReplyIdx = app.indexOf("deskAfterReply", mapIdx);
  assert.ok(threadStart > 0 && mapIdx > threadStart, "thread still maps messages");
  assert.ok(
    afterReplyIdx > mapIdx,
    "desk card must render after the reply that asked, not as a thread header or footer",
  );
  assert.match(
    app.slice(mapIdx, afterReplyIdx),
    /i === deskAfterIdx && m\.deskSheet/,
  );

  const contentIdx = bubble.indexOf("renderContent(displayContent)");
  const deskIdx = bubble.indexOf("<DeskSpecSheet");
  assert.ok(contentIdx > 0 && deskIdx > contentIdx);
  assert.match(bubble, /data-rvgrok-desk-after-reply/);
});
