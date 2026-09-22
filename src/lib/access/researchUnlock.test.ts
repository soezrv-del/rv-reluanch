import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ACCESS_PHONE_HEADER, ACCESS_REQUEST_EVENT, HARD_ADMIN } from "./constants.ts";
import { storePhone } from "./client.ts";
import {
  fetchWithResearchAccess,
  isResearchAccessBlocked,
  requestResearchUnlock,
  RESEARCH_ACCESS_BLOCKED_REASON,
  resolveResearchPhone,
  waitForAccessPhone,
} from "./researchUnlock.ts";
import { fetchVoiceWebResearchNotes, VOICE_WEB_ACCESS_BLOCKED_REASON } from "../rvgrok/voiceWeb.ts";
import { streamChat } from "../rvgrok/stream.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function installMemoryStorage() {
  const mem = new Map<string, string>();
  const store = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, String(v));
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  };
  const g = globalThis as { localStorage?: typeof store };
  const prev = g.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  return () => {
    if (prev) {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: prev,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).localStorage;
    }
  };
}

function installWindow() {
  const et = new EventTarget();
  const w = {
    addEventListener: et.addEventListener.bind(et),
    removeEventListener: et.removeEventListener.bind(et),
    dispatchEvent: et.dispatchEvent.bind(et),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };
  const g = globalThis as { window?: typeof w };
  const prev = g.window;
  g.window = w;
  return () => {
    if (prev) g.window = prev;
    else delete g.window;
  };
}

test("resolveResearchPhone prefers stored digits over a stale empty override", () => {
  const restore = installMemoryStorage();
  try {
    assert.equal(resolveResearchPhone(""), "");
    assert.equal(resolveResearchPhone("7022665918"), "7022665918");
    storePhone(HARD_ADMIN.digits);
    assert.equal(resolveResearchPhone(""), HARD_ADMIN.digits);
    assert.equal(resolveResearchPhone("5550001111"), HARD_ADMIN.digits);
  } finally {
    restore();
  }
});

test("missing phone → access_required path opens unlock / stores phone / retries", async () => {
  const restoreStorage = installMemoryStorage();
  const restoreWindow = installWindow();
  const prior = globalThis.fetch;
  const phones: string[] = [];
  let unlocked = false;
  globalThis.window.addEventListener(ACCESS_REQUEST_EVENT, () => {
    unlocked = true;
    storePhone(HARD_ADMIN.digits);
  });
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    phones.push(headers.get(ACCESS_PHONE_HEADER) || "");
    if (!headers.get(ACCESS_PHONE_HEADER)) {
      return new Response(
        JSON.stringify({ error: "access_required", browseOnly: true }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({ ok: true, notes: "brochure UVW 22000", model: "grok-4.7" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const result = await fetchVoiceWebResearchNotes({
      query: "2022 American Coach American Dream 42Q",
    });
    assert.equal(unlocked, true);
    assert.equal(phones[0], "");
    assert.equal(phones[1], HARD_ADMIN.digits);
    assert.equal(result.ok, true);
    assert.equal(isResearchAccessBlocked(VOICE_WEB_ACCESS_BLOCKED_REASON), true);
  } finally {
    globalThis.fetch = prior;
    restoreWindow();
    restoreStorage();
  }
});

test("with stored hard-admin phone research is not reported as access-blocked", async () => {
  const restoreStorage = installMemoryStorage();
  storePhone(HARD_ADMIN.digits);
  const prior = globalThis.fetch;
  const phones: string[] = [];
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    phones.push(headers.get(ACCESS_PHONE_HEADER) || "");
    return new Response(
      JSON.stringify({ ok: true, notes: "OEM GVWR 47000", model: "grok-4.7" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const result = await fetchVoiceWebResearchNotes({
      query: "2022 American Coach American Dream 42Q GVWR",
      accessPhone: "",
    });
    assert.deepEqual(phones, [HARD_ADMIN.digits]);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.doesNotMatch(result.notes || "", /access required|research blocked/i);
    }
  } finally {
    globalThis.fetch = prior;
    restoreStorage();
  }
});

test("Live Voice session picks up phone if it arrives after session start", async () => {
  const restoreStorage = installMemoryStorage();
  const prior = globalThis.fetch;
  const phones: string[] = [];
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    phones.push(headers.get(ACCESS_PHONE_HEADER) || "");
    if (!headers.get(ACCESS_PHONE_HEADER)) {
      return new Response(
        JSON.stringify({ error: "access_required", browseOnly: true }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({ ok: true, notes: "live brochure", model: "grok-4.7" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const emptySessionPhone = "";
    assert.equal(resolveResearchPhone(emptySessionPhone), "");
    storePhone(HARD_ADMIN.digits);
    const result = await fetchVoiceWebResearchNotes({
      query: "2022 American Dream 42Q",
      accessPhone: emptySessionPhone,
    });
    assert.equal(result.ok, true);
    assert.deepEqual(phones, [HARD_ADMIN.digits]);

    const realtime = src("../rvgrok/realtime.ts");
    assert.match(realtime, /setAccessPhone\(/);
    assert.match(realtime, /accessPhone: this\.accessPhone/);
    const app = src("../../components/rvgrok/RvGrokApp.tsx");
    assert.match(app, /setAccessPhone\(access\?\.phone\)/);
  } finally {
    globalThis.fetch = prior;
    restoreStorage();
  }
});

test("chat access_required opens unlock, stores phone, retries", async () => {
  const restoreStorage = installMemoryStorage();
  const restoreWindow = installWindow();
  const prior = globalThis.fetch;
  const phones: string[] = [];
  globalThis.window.addEventListener(ACCESS_REQUEST_EVENT, () => {
    storePhone(HARD_ADMIN.digits);
  });
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    phones.push(headers.get(ACCESS_PHONE_HEADER) || "");
    if (!headers.get(ACCESS_PHONE_HEADER)) {
      return new Response(
        JSON.stringify({ error: "access_required", browseOnly: true }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response('data: {"choices":[{"delta":{"content":"GVWR 47000"}}]}\n\n', {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }) as typeof fetch;
  try {
    let text = "";
    await streamChat({
      messages: [{ role: "user", content: "2022 American Dream 42Q GVWR" }],
      agentMode: false,
      handlers: {
        onDelta: (d) => {
          text += d;
        },
        onStep: () => {},
      },
    });
    assert.deepEqual(phones, ["", HARD_ADMIN.digits]);
    assert.match(text, /GVWR 47000/);
  } finally {
    globalThis.fetch = prior;
    restoreWindow();
    restoreStorage();
  }
});

test("fetchWithResearchAccess retries the same stored phone once without opening unlock", async () => {
  const restoreStorage = installMemoryStorage();
  storePhone(HARD_ADMIN.digits);
  let calls = 0;
  const res = await fetchWithResearchAccess(async (phone) => {
    calls += 1;
    if (calls === 1) {
      assert.equal(phone, HARD_ADMIN.digits);
      return new Response(
        JSON.stringify({ error: "access_required", browseOnly: true }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  restoreStorage();
  assert.equal(calls, 2);
  assert.equal(res.status, 200);
});

test("waitForAccessPhone returns immediately without a window", async () => {
  const restore = installMemoryStorage();
  try {
    assert.equal(await waitForAccessPhone({ timeoutMs: 20 }), "");
    storePhone(HARD_ADMIN.digits);
    assert.equal(await waitForAccessPhone({ timeoutMs: 20 }), HARD_ADMIN.digits);
  } finally {
    restore();
  }
});

test("requestResearchUnlock is a no-op without window and does not grant access", () => {
  requestResearchUnlock();
  assert.equal(isResearchAccessBlocked(RESEARCH_ACCESS_BLOCKED_REASON), true);
  assert.equal(isResearchAccessBlocked("web search timed out"), false);
});
