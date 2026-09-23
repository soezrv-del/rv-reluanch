import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCESS_NAME_STORAGE_KEY,
  ACCESS_WELCOME_SESSION_KEY,
  HARD_ADMIN,
} from "./constants.ts";
import {
  readStoredFirstName,
  storeApprovedIdentity,
  storeFirstName,
} from "./client.ts";
import {
  normalizeFirstName,
  resolvePersonalFirstName,
  takeSessionWelcome,
  welcomeBackLine,
} from "./identity.ts";

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
  const g = globalThis as { localStorage?: typeof store; sessionStorage?: typeof store };
  const prevLocal = g.localStorage;
  const prevSession = g.sessionStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: store,
  });
  return () => {
    if (prevLocal) {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: prevLocal,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).localStorage;
    }
    if (prevSession) {
      Object.defineProperty(globalThis, "sessionStorage", {
        configurable: true,
        value: prevSession,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).sessionStorage;
    }
  };
}

test("normalizeFirstName takes the first token and title-cases it", () => {
  assert.equal(normalizeFirstName("David Hansen"), "David");
  assert.equal(normalizeFirstName("  mark 2 "), "Mark");
  assert.equal(normalizeFirstName("charlie"), "Charlie");
  assert.equal(normalizeFirstName(""), "");
  assert.equal(normalizeFirstName("   "), "");
  assert.equal(normalizeFirstName("Mary-Jane Watson"), "Mary-Jane");
});

test("typed first name wins over whitelist contact name", () => {
  assert.equal(resolvePersonalFirstName("Dave", "David Hansen"), "Dave");
  assert.equal(resolvePersonalFirstName("", "David Hansen"), "David");
  assert.equal(resolvePersonalFirstName("  ", "Kathy Underhill"), "Kathy");
  assert.equal(resolvePersonalFirstName("", ""), "");
  assert.equal(HARD_ADMIN.name, "David Hansen");
  assert.equal(resolvePersonalFirstName("", HARD_ADMIN.name), "David");
});

test("welcome-back line is empty without a first name", () => {
  assert.equal(welcomeBackLine("David Hansen"), "Welcome back, David");
  assert.equal(welcomeBackLine(""), "");
});

test("approved identity persists first name locally without rewriting the list", () => {
  const restore = installMemoryStorage();
  try {
    storeApprovedIdentity("7022665915", "David Hansen");
    assert.equal(readStoredFirstName(), "David");
    storeFirstName("Dave");
    assert.equal(readStoredFirstName(), "Dave");
    storeFirstName("");
    assert.equal(readStoredFirstName(), "");
    assert.equal(
      globalThis.localStorage.getItem(ACCESS_NAME_STORAGE_KEY),
      null,
    );
  } finally {
    restore();
  }
});

test("Grok welcome chip is one-shot per session", () => {
  const restore = installMemoryStorage();
  try {
    assert.equal(takeSessionWelcome("David"), true);
    assert.equal(takeSessionWelcome("David"), false);
    assert.equal(
      globalThis.sessionStorage.getItem(ACCESS_WELCOME_SESSION_KEY),
      "David",
    );
    assert.equal(takeSessionWelcome(""), false);
  } finally {
    restore();
  }
});
