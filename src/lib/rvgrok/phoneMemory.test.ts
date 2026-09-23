import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ACCESS_PHONE_HEADER } from "../access/constants.ts";
import {
  adminMayClearPhoneMemory,
  authorizeAccessAdmin,
} from "../access/adminAuth.ts";
import { RV_GROK_LEAN_CORE, visitorPersonalizationBlock } from "./speechPolicy.ts";
import { RV_GROK_SESSION_INTRO } from "./speechPolicy.ts";
import {
  MEMORY_DIGEST_KEEP,
  MEMORY_DIGEST_MAX,
  MEMORY_INJECT_MAX,
  MEMORY_PROFILE_MAX,
  capDigestText,
  capProfileSummary,
  emptyPhoneMemory,
  fallbackDigestFromTurns,
  formatVisitorMemoryBlock,
  isMeaningfulMemoryTurn,
  memoryPhoneKey,
  mergeDigests,
  mergeProfileSummary,
  parseDigests,
  parseExtractedMemory,
  shouldWriteMemory,
} from "./phoneMemory.ts";

const root = dirname(fileURLToPath(import.meta.url));
const workspace = join(root, "../../..");

function src(rel: string) {
  return readFileSync(join(workspace, rel), "utf8");
}

function adminReq(phone?: string): Request {
  const headers = new Headers();
  if (phone) headers.set(ACCESS_PHONE_HEADER, phone);
  return new Request("https://www.rvmax.app/api/access/admin", { headers });
}

test("memory keys by normalized phone digits and never aliases phones", () => {
  assert.equal(memoryPhoneKey("702-266-5918"), "7022665918");
  assert.equal(memoryPhoneKey("+1 (702) 266-5918"), "7022665918");
  assert.equal(memoryPhoneKey("17022665918"), "7022665918");
  assert.equal(memoryPhoneKey("541-285-8791"), "5412858791");
  assert.notEqual(memoryPhoneKey("702-266-5918"), memoryPhoneKey("541-285-8791"));
  assert.equal(memoryPhoneKey(""), null);
  assert.equal(memoryPhoneKey("hi"), null);
  assert.equal(memoryPhoneKey("123"), null);
});

test("no phone key means no server write", () => {
  assert.equal(
    shouldWriteMemory({
      phoneKey: null,
      turns: [{ role: "user", text: "I prefer compact answers about Newmar." }],
    }),
    false,
  );
  assert.equal(
    shouldWriteMemory({
      phoneKey: "7022665918",
      turns: [{ role: "user", text: "hi" }],
    }),
    false,
  );
  assert.equal(
    shouldWriteMemory({
      phoneKey: "7022665918",
      turns: [{ role: "user", text: "I prefer compact answers and I like Newmar." }],
    }),
    true,
  );
  assert.equal(
    shouldWriteMemory({
      phoneKey: "7022665918",
      turns: [{ role: "user", text: "I prefer compact answers." }],
      lastWriteAt: 1_000,
      now: 1_000 + 5_000,
    }),
    false,
  );
});

test("trivial greetings do not count as meaningful turns", () => {
  assert.equal(isMeaningfulMemoryTurn([{ role: "user", text: "hey" }]), false);
  assert.equal(isMeaningfulMemoryTurn([{ role: "user", text: "thanks" }]), false);
  assert.equal(isMeaningfulMemoryTurn([{ role: "user", text: "" }]), false);
  assert.equal(
    isMeaningfulMemoryTurn([
      { role: "user", text: "I own a Tiffin and want short answers." },
    ]),
    true,
  );
});

test("digest merge drops oldest and caps each entry", () => {
  const first = mergeDigests(
    [],
    { at: "2026-01-01T00:00:00.000Z", text: "Asked about Newmar." },
  );
  assert.equal(first.length, 1);
  const filled = mergeDigests(
    Array.from({ length: MEMORY_DIGEST_KEEP }, (_, i) => ({
      at: `2026-01-0${i + 1}T00:00:00.000Z`,
      text: `Digest ${i + 1}`,
    })),
    { at: "2026-02-01T00:00:00.000Z", text: "Newest digest" },
  );
  assert.equal(filled.length, MEMORY_DIGEST_KEEP);
  assert.equal(filled[0]?.text, "Digest 2");
  assert.equal(filled[filled.length - 1]?.text, "Newest digest");
  const long = capDigestText("x".repeat(MEMORY_DIGEST_MAX + 80));
  assert.ok(long.length <= MEMORY_DIGEST_MAX);
  assert.match(long, /…$/);
  assert.deepEqual(
    mergeDigests(first, { at: "2026-01-02T00:00:00.000Z", text: first[0]!.text }),
    first,
  );
});

test("profile merge keeps the previous summary when the extract is empty", () => {
  assert.equal(
    mergeProfileSummary("Prefers compact answers. Watching Entegra.", ""),
    "Prefers compact answers. Watching Entegra.",
  );
  assert.equal(
    mergeProfileSummary("old", "Prefers detailed coach reports. Likes Tiffin."),
    "Prefers detailed coach reports. Likes Tiffin.",
  );
  assert.ok(capProfileSummary("y".repeat(MEMORY_PROFILE_MAX + 40)).length <= MEMORY_PROFILE_MAX);
});

test("injected VISITOR MEMORY is capped and never rewrites I'm RvGrok", () => {
  const block = formatVisitorMemoryBlock({
    phoneDigits: "7022665918",
    profileSummary: "Prefers compact answers. Interested in Newmar Dutch Star.",
    digests: [
      { at: "2026-01-01T00:00:00.000Z", text: "Compared Dutch Star vs Ventana." },
      { at: "2026-01-02T00:00:00.000Z", text: "Asked for short answers." },
    ],
    updatedAt: "2026-01-02T00:00:00.000Z",
  });
  assert.match(block, /VISITOR MEMORY/);
  assert.match(block, /Prefers compact answers/);
  assert.match(block, /Compared Dutch Star vs Ventana/);
  assert.match(block, /I'm RvGrok/);
  assert.match(block, /Never dump it in the greeting/);
  assert.match(block, /Do not invent OEM catalog numbers/);
  assert.doesNotMatch(block, /I'm RvGrok, David/);
  assert.ok(block.length <= MEMORY_INJECT_MAX);

  const huge = formatVisitorMemoryBlock({
    phoneDigits: "5412858791",
    profileSummary: "P".repeat(2000),
    digests: Array.from({ length: 8 }, (_, i) => ({
      at: `2026-03-0${i + 1}T00:00:00.000Z`,
      text: "D".repeat(300),
    })),
    updatedAt: "",
  });
  assert.ok(huge.length <= MEMORY_INJECT_MAX);
  assert.equal(formatVisitorMemoryBlock(emptyPhoneMemory()), "");
  assert.equal(formatVisitorMemoryBlock(null), "");
});

test("extract parse is conservative and redacts secrets", () => {
  const parsed = parseExtractedMemory(
    '```json\n{"profile_summary":"Prefers compact. sk-abcdefghijklmnopqrstuv","digest":"Talked Newmar."}\n```',
  );
  assert.match(parsed.profileSummary, /Prefers compact/);
  assert.match(parsed.profileSummary, /\[redacted\]/);
  assert.doesNotMatch(parsed.profileSummary, /sk-abcdefghijklmnopqrstuv/);
  assert.equal(parsed.digest, "Talked Newmar.");
  assert.deepEqual(parseExtractedMemory("not json"), {
    profileSummary: "",
    digest: "",
  });
  assert.equal(
    fallbackDigestFromTurns([{ role: "user", text: "Looking at a 2022 Entegra." }]),
    "Talked about: Looking at a 2022 Entegra.",
  );
  assert.equal(fallbackDigestFromTurns([{ role: "user", text: "hi" }]), "");
});

test("parseDigests accepts JSON text or arrays", () => {
  const fromJson = parseDigests(
    '[{"at":"2026-01-01T00:00:00.000Z","text":"Asked about Tiffin."}]',
  );
  assert.equal(fromJson.length, 1);
  assert.equal(fromJson[0]?.text, "Asked about Tiffin.");
  assert.deepEqual(parseDigests("nope"), []);
  assert.deepEqual(parseDigests(null), []);
});

test("admin clear is gated; visitors cannot self-clear via the admin action", () => {
  const visitor = authorizeAccessAdmin(adminReq("555-000-1111"), {
    tokenValid: false,
    databaseUrl: true,
    passwordConfigured: false,
  });
  assert.equal(adminMayClearPhoneMemory(visitor), false);

  const hard = authorizeAccessAdmin(adminReq("702-266-5918"), {
    tokenValid: false,
    databaseUrl: true,
    passwordConfigured: false,
  });
  assert.equal(adminMayClearPhoneMemory(hard), true);

  const jwt = authorizeAccessAdmin(adminReq("555-000-1111"), {
    tokenValid: true,
    databaseUrl: true,
    passwordConfigured: true,
  });
  assert.equal(adminMayClearPhoneMemory(jwt), true);

  const adminApi = src("src/routes/api/access.admin.ts");
  const postStart = adminApi.indexOf("POST:");
  const denyAt = adminApi.indexOf(
    "const blocked = denyAccessAdmin(request);",
    postStart,
  );
  const clearAt = adminApi.indexOf('action === "clear_memory"');
  assert.ok(denyAt >= 0 && clearAt > denyAt, "clear_memory runs after admin deny");
  assert.match(adminApi, /clearPhoneMemory/);
  assert.match(adminApi, /setResearchProviderOverride/);
});

test("lean core and first-name hook stay intact; memory is additive", () => {
  assert.equal(RV_GROK_SESSION_INTRO, "I'm RvGrok");
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /VISITOR MEMORY/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /profile_summary/);
  assert.doesNotMatch(visitorPersonalizationBlock("David"), /VISITOR MEMORY/);
  assert.match(visitorPersonalizationBlock("David"), /Their first name is David/);

  const api = src("src/routes/api/rvgrok.ts");
  assert.match(api, /loadVisitorMemoryBlockFromRequest/);
  assert.match(api, /rememberAfterSseResponse/);
  assert.match(api, /visitorPersonalizationBlock/);
  assert.match(src("src/routes/api/rvgrok.memory.ts"), /denyUnlessWhitelisted/);
  assert.match(src("src/routes/api/rvgrok.memory.ts"), /applyMemoryUpdate/);
  assert.match(src("src/lib/rvgrok/stream.ts"), /\/api\/rvgrok\/memory/);
  assert.match(api, /denyUnlessWhitelisted/);
  assert.doesNotMatch(api, /DialaBot/);

  const speech = src("src/lib/rvgrok/speechPolicy.ts");
  assert.match(speech, /RV_GROK_SESSION_INTRO = "I'm RvGrok"/);
  assert.doesNotMatch(speech, /VISITOR MEMORY/);

  const schema = src("migrations/0005_rvgrok_phone_memory.sql");
  assert.match(schema, /rvgrok_phone_memory/);
  assert.match(schema, /phone_digits/);
  assert.match(schema, /profile_summary/);
  assert.match(schema, /digests/);
  assert.match(schema, /updated_at/);
});
