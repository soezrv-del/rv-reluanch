import assert from "node:assert/strict";
import test from "node:test";
import { formatPromptLessons } from "./promptLessons.ts";
import { VOICE_LESSON_LOT_ROW } from "./voiceLesson.ts";

/**
 * A lesson learned mid-call must reach the next voice turn as a realtime
 * session.update on the open socket. No reconnect, no new token.
 */

const LOT = [
  "OWN-LOT inventory (our lot snapshot this turn — not a website count):",
  "Lot total: 1 units.",
  "- 2022 · Tiffin · Allegro Red 360 · 33 AA · Fresno CA · stk UPF9963 · $229,995 · mileage: 6,870 mi",
].join("\n");

const ADMIN = {
  id: "admin-keep",
  text: "Keep answers to two sentences.",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

type Sent = { type?: string; session?: { instructions?: string } };

function instructionsOf(raw: string): string | null {
  const msg = JSON.parse(raw) as Sent;
  return msg.type === "session.update" ? String(msg.session?.instructions || "") : null;
}

test("a sheet-miss lesson learned mid-call is in the next voice turn's instructions, no reconnect", async () => {
  const g = globalThis as Record<string, unknown>;
  const prevWs = g.WebSocket;
  const prevFetch = g.fetch;
  let socketsOpened = 0;
  class FakeWebSocket {
    static OPEN = 1;
    static CONNECTING = 0;
    static CLOSING = 2;
    static CLOSED = 3;
    constructor() {
      socketsOpened += 1;
    }
  }
  g.WebSocket = FakeWebSocket;

  const serverBlock = formatPromptLessons([
    { id: VOICE_LESSON_LOT_ROW.id, text: VOICE_LESSON_LOT_ROW.text, updatedAt: "2026-10-03T00:00:00.000Z" },
    ADMIN,
  ]);
  const memoryCalls: Array<{ url: string; body: { source?: string } }> = [];
  let tokenCalls = 0;
  g.fetch = async (url: string, init?: { body?: string }) => {
    if (String(url).includes("/api/rvgrok/token")) tokenCalls += 1;
    memoryCalls.push({ url: String(url), body: JSON.parse(init?.body || "{}") });
    return Response.json({ ok: true, updated: true, lessons: serverBlock });
  };

  try {
    const { GrokRealtimeSession } = await import("./realtime.ts");
    const noop = () => undefined;
    const handlers = new Proxy({}, { get: () => noop });
    const session = new GrokRealtimeSession(handlers as never, "ara", {
      accessPhone: "5551234567",
    });
    const sent: string[] = [];
    let closed = 0;
    const ws = {
      readyState: 1,
      send: (m: string) => sent.push(m),
      close: () => {
        closed += 1;
      },
    };
    const s = session as unknown as Record<string, unknown> & {
      handleMessage: (evt: { data: string }) => void;
    };
    s.ws = ws;
    // Token-time block: one admin lesson, no voice lesson yet.
    s.standingLessons = formatPromptLessons([ADMIN]);
    (s.recentUserTurns as string[]).push("How many miles on UPF9963?");
    s.lastLessonLotNotes = LOT;

    // She misses the printed lot row.
    s.handleMessage({
      data: JSON.stringify({
        type: "response.output_audio_transcript.done",
        transcript: "That stock is not in any online listings.",
      }),
    });

    const local = sent.map(instructionsOf).filter((x): x is string => x != null);
    assert.ok(local.length >= 1, "session.update sent right after the miss");
    assert.ok(local.at(-1)!.includes(VOICE_LESSON_LOT_ROW.text));
    assert.ok(local.at(-1)!.includes(ADMIN.text));

    // Memory route answers with the server block; client applies it.
    await new Promise((r) => setTimeout(r, 50));
    const memory = memoryCalls.find((c) => c.url.includes("/api/rvgrok/memory"));
    assert.ok(memory, "memory route called");
    assert.equal(memory!.body.source, "voice");
    const updates = sent.map(instructionsOf).filter((x): x is string => x != null);
    assert.ok(updates.length >= 2, "server lessons pushed with a second session.update");

    // Next voice turn: the instructions in force are the last session.update.
    const beforeNext = updates.at(-1)!;
    s.handleMessage({ data: JSON.stringify({ type: "response.created" }) });
    assert.ok(beforeNext.includes(VOICE_LESSON_LOT_ROW.text));
    assert.ok(beforeNext.includes(ADMIN.text));
    assert.doesNotMatch(beforeNext, /UPF9963|6,870/);

    assert.equal(socketsOpened, 0, "no reconnect");
    assert.equal(closed, 0, "socket not closed");
    assert.equal(tokenCalls, 0, "no new token");
    assert.equal(s.ws, ws);
  } finally {
    g.WebSocket = prevWs;
    g.fetch = prevFetch;
  }
});
