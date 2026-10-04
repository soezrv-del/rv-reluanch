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
  memoryRowForSave,
  mergeDigests,
  mergeProfileSlots,
  mergeProfileSummary,
  parseDigests,
  parseExtractedMemory,
  parseProfileSlots,
  planPhoneMemoryWrite,
  shouldWriteMemory,
  type PhoneMemory,
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
      // Letters, not digits: a digest never keeps a number.
      text: `Digest ${String.fromCharCode(65 + i)}`,
    })),
    { at: "2026-02-01T00:00:00.000Z", text: "Newest digest" },
  );
  assert.equal(filled.length, MEMORY_DIGEST_KEEP);
  assert.equal(filled[0]?.text, "Digest B");
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
    slots: { style: "", coaches: [], openThread: null },
    profileSummary: "",
    digest: "",
  });
  // No extract: a topic digest, never the raw quote.
  assert.equal(
    fallbackDigestFromTurns([{ role: "user", text: "Looking at a 2022 Entegra." }]),
    "Talked about Entegra.",
  );
  assert.equal(
    fallbackDigestFromTurns([
      { role: "user", text: "What's the GVWR on stock UPF9963, is it 37,320 lbs for $229,995?" },
    ]),
    "Talked about gvwr.",
  );
  assert.equal(fallbackDigestFromTurns([{ role: "user", text: "hi" }]), "");
});

/** Price, GVWR-style figure, stock number, VIN, or count anywhere in the text. */
const NUMBER_LEAK =
  /\$|\d|\bstk\b|\b(?:forty|thirty|twelve|three|five)\b[\s-]+(?:gallons?|units?|coaches|in stock|lbs|pounds|thousand)/i;

const NUMBER_EXTRACT = JSON.stringify({
  style: "Likes short answers. He has a budget of $150,000.",
  coaches: [
    "2022 Entegra Aspire 44R",
    "Newmar Dutch Star",
    "stk UPF9963",
    "Tiffin Allegro Red 360",
    "Grand Design Solitude",
    "Jayco Seneca",
    "Thor Tuscany",
  ],
  open_thread: {
    coach: "Newmar Dutch Star 4369",
    asked: "Asked if the GVWR is 37,320 lbs. Wants to know about towing his Jeep.",
  },
  digest: "Compared three coaches in stock. Asked about towing.",
});

const SPOKEN_SPEC_TURNS = [
  { role: "user", text: "Does the Dutch Star 4369 have 450 hp and a 100 gallon fresh tank? VIN 1GBHG39KX81120399." },
  { role: "assistant", text: "It shows 450 horsepower, 100 gallons fresh, GVWR 44,600 lbs, priced at $389,000." },
];

function stored(profileSummary = "", digests: PhoneMemory["digests"] = []): PhoneMemory {
  return { phoneDigits: "7022665918", profileSummary, digests, updatedAt: "" };
}

test("extract slots are names and words only; no number survives save or inject", () => {
  const parsed = parseExtractedMemory(NUMBER_EXTRACT);
  assert.equal(parsed.slots.style, "Likes short answers.");
  assert.ok(parsed.slots.coaches.length <= 5);
  assert.deepEqual(parsed.slots.coaches, [
    "Entegra Aspire",
    "Newmar Dutch Star",
    "Tiffin Allegro Red",
    "Grand Design Solitude",
    "Jayco Seneca",
  ]);
  assert.deepEqual(parsed.slots.openThread, {
    coach: "Newmar Dutch Star",
    asked: "Wants to know about towing his Jeep.",
  });
  assert.equal(parsed.digest, "Asked about towing.");

  const plan = planPhoneMemoryWrite({
    existing: stored("Style: Plain words | Coaches: Winnebago View"),
    extracted: parsed,
    turns: SPOKEN_SPEC_TURNS,
    now: "2026-10-03T00:00:00.000Z",
  });
  assert.ok(plan);
  const saved = memoryRowForSave(plan);
  const block = formatVisitorMemoryBlock({ ...stored(), ...saved });
  for (const text of [saved.profileSummary, ...saved.digests.map((d) => d.text), block]) {
    assert.doesNotMatch(text, NUMBER_LEAK, text);
    assert.doesNotMatch(text, /GVWR is|gallon|horsepower|VIN|UPF9963|budget/i, text);
  }
  assert.match(saved.profileSummary, /^Style: Likes short answers\./);
  assert.match(saved.profileSummary, /Open thread: Newmar Dutch Star — Wants to know about towing/);
  assert.ok(saved.profileSummary.length <= MEMORY_PROFILE_MAX);
  assert.ok(block.length <= MEMORY_INJECT_MAX);
});

test("an empty slot never wipes the stored one; coaches merge newest first, max 5", () => {
  const prev =
    "Style: Short answers | Coaches: Tiffin Allegro, Newmar Ventana | Open thread: Newmar Ventana — Asked about towing";
  assert.equal(
    mergeProfileSlots(prev, { style: "", coaches: [], openThread: null }),
    prev,
  );
  const next = mergeProfileSlots(prev, {
    style: "",
    coaches: ["Entegra Anthem", "tiffin allegro"],
    openThread: { coach: "Entegra Anthem", asked: "Wants the price." },
  });
  const slots = parseProfileSlots(next)!;
  assert.equal(slots.style, "Short answers");
  assert.deepEqual(slots.coaches, ["Entegra Anthem", "tiffin allegro", "Newmar Ventana"]);
  assert.deepEqual(slots.openThread, { coach: "Entegra Anthem", asked: "Wants the price." });
  // A number-only incoming slot scrubs to empty, so it keeps the stored one too.
  const kept = parseProfileSlots(
    mergeProfileSlots(prev, {
      style: "Budget is $90k.",
      coaches: ["stk 47407"],
      openThread: { coach: "", asked: "Is it 37,320 lbs?" },
    }),
  )!;
  assert.equal(kept.style, "Short answers");
  assert.deepEqual(kept.coaches, ["Tiffin Allegro", "Newmar Ventana"]);
  assert.equal(kept.openThread?.asked, "Asked about towing");
});

test("no key or a failed extract keeps the old profile and stores a scrubbed digest", () => {
  const prev = "Style: Short answers | Coaches: Newmar Dutch Star";
  const plan = planPhoneMemoryWrite({
    existing: stored(prev),
    extracted: null,
    turns: SPOKEN_SPEC_TURNS,
    now: "2026-10-03T00:00:00.000Z",
  });
  assert.ok(plan);
  assert.equal(plan.profileSummary, prev);
  assert.equal(plan.digests.length, 1);
  const digest = plan.digests[0]!.text;
  assert.doesNotMatch(digest, NUMBER_LEAK);
  assert.doesNotMatch(digest, /Dutch Star|Does the|have/i, "never a raw quote");
  assert.equal(
    planPhoneMemoryWrite({
      existing: stored(prev),
      extracted: null,
      turns: [{ role: "user", text: "Is it really 450 hp?" }],
    }),
    null,
    "nothing recognizable → no write",
  );
});

test("an older stored profile with numbers is scrubbed on save and on inject", () => {
  const legacy =
    "Prefers compact answers. Owns a 2019 Tiffin with 37,320 lbs GVWR. Has forty gallons fresh. Watching Entegra.";
  const legacyDigests = [
    { at: "2026-01-01T00:00:00.000Z", text: "Talked about: price of stk UPF9963 at $229,995" },
    { at: "2026-01-02T00:00:00.000Z", text: "We have twelve units in stock. Asked about towing." },
  ];
  const block = formatVisitorMemoryBlock(stored(legacy, legacyDigests));
  assert.doesNotMatch(block, NUMBER_LEAK);
  assert.match(block, /Prefers compact answers\. Watching Entegra\./);
  assert.match(block, /Asked about towing\./);
  const saved = memoryRowForSave({ profileSummary: legacy, digests: legacyDigests });
  assert.doesNotMatch(saved.profileSummary, NUMBER_LEAK);
  for (const d of saved.digests) assert.doesNotMatch(d.text, NUMBER_LEAK);
  assert.equal(saved.digests.length, 1, "an all-number digest is dropped, not stored");
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
  assert.match(visitorPersonalizationBlock("David"), /address them by David/);
  assert.doesNotMatch(visitorPersonalizationBlock("David"), /not every turn/);

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
