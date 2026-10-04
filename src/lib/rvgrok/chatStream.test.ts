import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  ANSWER_PROBE_CHARS,
  chunkForTyping,
  createAnswerGate,
  createChatSseSink,
  createXaiStreamAccumulator,
  looksLikeToolJsonStart,
  sseLineText,
} from "./chatStreamGate.ts";
import {
  CHAT_ACK_TEXT,
  CHAT_WORKING_TEXT,
  chatRetryMessage,
  friendlyStatus,
  initialStreamView,
  reduceStreamView,
  streamActivityLabel,
  toolStatusText,
  type StreamView,
  type StreamViewEvent,
} from "./chatStreamView.ts";
import { ChatStreamError, consumeSseStream, processSseLine } from "./stream.ts";

const enc = new TextEncoder();

function sseBody(chunks: string[], gapMs = 0): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      async start(c) {
        for (const ch of chunks) {
          c.enqueue(enc.encode(ch));
          if (gapMs) await new Promise((r) => setTimeout(r, gapMs));
        }
        c.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
}

const xai = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`;

// ── xAI stream accumulator ────────────────────────────────────────────────

test("accumulator joins content split across byte chunks and lines", () => {
  const acc = createXaiStreamAccumulator();
  const line = xai({ choices: [{ delta: { content: "Hello there" } }] });
  const seen: string[] = [];
  seen.push(...acc.push(line.slice(0, 17)).content);
  seen.push(...acc.push(line.slice(17)).content);
  seen.push(...acc.push(xai({ choices: [{ delta: { content: ", friend." } }] })).content);
  seen.push(...acc.push("data: [DONE]\n\n").content);
  seen.push(...acc.end().content);
  assert.deepEqual(seen, ["Hello there", ", friend."]);
  assert.equal(acc.content(), "Hello there, friend.");
  assert.equal(acc.toolCalls().length, 0);
  assert.equal(acc.sawChoice(), true);
});

test("accumulator rebuilds a tool call whose arguments arrive in pieces", () => {
  const acc = createXaiStreamAccumulator();
  const a = acc.push(
    xai({
      choices: [
        {
          delta: {
            tool_calls: [
              {
                index: 0,
                id: "call_1",
                type: "function",
                function: { name: "get_own_lot", arguments: '{"que' },
              },
            ],
          },
        },
      ],
    }),
  );
  assert.equal(a.sawToolCall, true);
  acc.push(
    xai({
      choices: [
        { delta: { tool_calls: [{ index: 0, function: { arguments: 'ry":"Lineage"}' } }] } },
      ],
    }),
  );
  acc.push(xai({ choices: [{ delta: {}, finish_reason: "tool_calls" }] }));
  const calls = acc.toolCalls();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].id, "call_1");
  assert.equal(calls[0].function?.name, "get_own_lot");
  assert.deepEqual(JSON.parse(calls[0].function?.arguments || ""), { query: "Lineage" });
  assert.equal(acc.finishReason(), "tool_calls");
});

test("accumulator with no choices reports sawChoice false (old `!msg` path)", () => {
  const acc = createXaiStreamAccumulator();
  acc.push(xai({ error: "bad" }));
  acc.end();
  assert.equal(acc.sawChoice(), false);
});

// ── answer gate ───────────────────────────────────────────────────────────

test("gate holds a short probe, then streams every later piece as it comes", () => {
  const out: string[] = [];
  const gate = createAnswerGate({ hold: false, emit: (t) => out.push(t) });
  gate.push("Sure — ");
  gate.push("the 2024 ");
  assert.equal(out.length, 0, "under the probe size nothing is shown");
  gate.push("Lineage 25MS has a Mercedes chassis");
  assert.equal(out.length, 1);
  assert.ok(out[0].replace(/\s/g, "").length >= ANSWER_PROBE_CHARS);
  gate.push(" and a 3.0L diesel.");
  assert.deepEqual(out.slice(1), [" and a 3.0L diesel."]);
  assert.equal(gate.release(), "");
  assert.equal(
    out.join(""),
    "Sure — the 2024 Lineage 25MS has a Mercedes chassis and a 3.0L diesel.",
  );
});

test("gate never shows text that starts like a tool call written as content", () => {
  const out: string[] = [];
  const gate = createAnswerGate({ hold: false, emit: (t) => out.push(t) });
  gate.push('{"name":"generate_image","arguments":{"prompt":"a coach at sunset, golden light"}}');
  assert.deepEqual(out, []);
  assert.ok(looksLikeToolJsonStart("```json\n{"));
  assert.ok(!looksLikeToolJsonStart("We have 12 used Super Cs."));
});

test("a held round shows nothing until release, and retract drops it", () => {
  const out: string[] = [];
  const gate = createAnswerGate({ hold: true, emit: (t) => out.push(t) });
  gate.push("We have 99 Lineage coaches on the lot right now, all new.");
  assert.deepEqual(out, []);
  assert.equal(gate.retract(), false, "nothing was on screen");
  assert.equal(gate.release(), "");
});

test("retract after live text reports it so the route sends replace('')", () => {
  const out: string[] = [];
  const gate = createAnswerGate({ hold: false, emit: (t) => out.push(t) });
  gate.push("Let me pull that up for you real quick, one moment.");
  assert.equal(out.length, 1);
  assert.equal(gate.retract(), true);
});

test("chunkForTyping keeps every character in order", () => {
  const text = "Twelve used Super Cs, stock 46573 first.";
  assert.equal(chunkForTyping(text).join(""), text);
  assert.ok(chunkForTyping(text).every((p) => p.length <= 12));
});

// ── SSE sink (server response) ────────────────────────────────────────────

async function readAll(res: Response): Promise<string> {
  return await res.text();
}

test("sink sends status, deltas, replace, error and ends with [DONE]", async () => {
  const sink = createChatSseSink({ agentMode: false, heartbeatMs: 10_000 });
  sink.status("Checking the lot…");
  sink.meta("grok-4.7", "xai-direct");
  sink.delta("Twelve ");
  sink.delta("used.");
  assert.equal(sink.visibleText(), "Twelve used.");
  sink.replace("");
  assert.equal(sink.visibleText(), "");
  sink.delta("12 used Super Cs.");
  sink.error("The reply timed out");
  sink.close();
  const body = await readAll(sink.response);
  assert.match(body, /"type":"error","message":"The reply timed out"/);
  assert.match(body, /^: open/);
  assert.match(body, /"type":"status","text":"Checking the lot…"/);
  assert.match(body, /"type":"agent_start","model":"grok-4.7"/);
  assert.match(body, /"type":"upstream","upstream":"xai-direct"/);
  assert.match(body, /"type":"replace","text":""/);
  assert.ok(body.trimEnd().endsWith("data: [DONE]"));
  // replace carries `text`, never `content`: an older cached client cannot
  // mistake it for a delta and double the answer.
  assert.doesNotMatch(body, /"type":"replace","content"/);
  assert.equal(sink.response.headers.get("content-type"), "text/event-stream; charset=utf-8");
});

test("agent-mode sink deltas keep the agent shape", async () => {
  const sink = createChatSseSink({ agentMode: true, heartbeatMs: 10_000 });
  sink.delta("hi");
  sink.close();
  assert.match(await readAll(sink.response), /"type":"delta","content":"hi"/);
});

test("sink.pipe forwards an inner reply verbatim and tracks its text", async () => {
  const sink = createChatSseSink({ agentMode: false, heartbeatMs: 10_000 });
  const inner = sseBody([
    xai({ type: "step", step: 1, tool: "get_coach_facts", status: "done" }),
    xai({ choices: [{ delta: { content: "GVWR is " } }] }),
    xai({ choices: [{ delta: { content: "26,000 lb." } }] }),
    "data: [DONE]\n\n",
  ]);
  await sink.pipe(inner);
  sink.close();
  assert.equal(sink.visibleText(), "GVWR is 26,000 lb.");
  const body = await readAll(sink.response);
  assert.equal(body.match(/data: \[DONE\]/g)?.length, 1, "only the outer [DONE]");
  assert.match(body, /"type":"step"/);
});

test("memory-style collectors read only deltas, never status / replace", () => {
  assert.equal(sseLineText('data: {"type":"status","text":"Checking the lot…"}'), "");
  assert.equal(sseLineText('data: {"type":"replace","text":"whole answer"}'), "");
  assert.equal(sseLineText('data: {"choices":[{"delta":{"content":"ok"}}]}'), "ok");
});

// ── client parser ─────────────────────────────────────────────────────────

test("processSseLine routes status, replace, upstream and error", () => {
  const got: string[] = [];
  const handlers = {
    onDelta: (t: string) => got.push(`delta:${t}`),
    onStep: () => got.push("step"),
    onStatus: (t: string) => got.push(`status:${t}`),
    onReplace: (t: string) => got.push(`replace:${t}`),
    onUpstream: (u: string) => got.push(`upstream:${u}`),
    onFailed: (m: string) => got.push(`failed:${m}`),
  };
  processSseLine('data: {"type":"status","text":"Checking the lot…"}', false, handlers);
  processSseLine('data: {"type":"replace","text":""}', false, handlers);
  processSseLine('data: {"type":"upstream","upstream":"xai-direct"}', false, handlers);
  processSseLine('data: {"choices":[{"delta":{"content":"Hi"}}]}', false, handlers);
  processSseLine('data: {"type":"error","message":"The reply timed out"}', false, handlers);
  processSseLine(": ping", false, handlers);
  assert.deepEqual(got, [
    "status:Checking the lot…",
    "replace:",
    "upstream:xai-direct",
    "delta:Hi",
    "failed:The reply timed out",
  ]);
});

test("consumeSseStream reassembles events split mid-line across chunks", async () => {
  const deltas: string[] = [];
  const statuses: string[] = [];
  const all =
    ": open\n\n" +
    'data: {"type":"status","text":"Checking the lot…"}\n\n' +
    xai({ choices: [{ delta: { content: "Twelve used " } }] }) +
    xai({ choices: [{ delta: { content: "Super Cs." } }] }) +
    "data: [DONE]\n\n";
  const pieces: string[] = [];
  for (let i = 0; i < all.length; i += 7) pieces.push(all.slice(i, i + 7));
  await consumeSseStream(sseBody(pieces), false, {
    onDelta: (t) => deltas.push(t),
    onStep: () => {},
    onStatus: (t) => statuses.push(t),
  });
  assert.deepEqual(statuses, ["Checking the lot…"]);
  assert.equal(deltas.join(""), "Twelve used Super Cs.");
});

test("a silent stream trips the idle watchdog instead of hanging", async () => {
  const stalled = new Response(
    new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(enc.encode(": open\n\n"));
        // never closes, never sends again
      },
    }),
  );
  await assert.rejects(
    consumeSseStream(stalled, false, { onDelta: () => {}, onStep: () => {} }, undefined, {
      idleMs: 40,
    }),
    (err: unknown) => err instanceof ChatStreamError && err.name === "TimeoutError",
  );
});

test("pings keep the idle watchdog fed; the total cap still ends it", async () => {
  const pinging = new Response(
    new ReadableStream<Uint8Array>({
      async pull(c) {
        await new Promise((r) => setTimeout(r, 15));
        c.enqueue(enc.encode(": ping\n\n"));
      },
    }),
  );
  const started = Date.now();
  await assert.rejects(
    consumeSseStream(pinging, false, { onDelta: () => {}, onStep: () => {} }, undefined, {
      idleMs: 60,
      totalMs: 200,
    }),
    (err: unknown) => (err as Error).name === "TimeoutError",
  );
  assert.ok(Date.now() - started >= 150, "pings held it open past the idle limit");
});

// ── ack → status → text → replace (bubble view) ───────────────────────────

function run(events: StreamViewEvent[]): StreamView[] {
  const views: StreamView[] = [initialStreamView()];
  for (const ev of events) views.push(reduceStreamView(views[views.length - 1], ev));
  return views;
}

test("the bubble opens on the ack with no answer text", () => {
  const v = initialStreamView();
  assert.equal(v.phase, "ack");
  assert.equal(v.content, "");
  assert.equal(streamActivityLabel(v), CHAT_ACK_TEXT);
});

test("a status line replaces the ack; the first real text replaces both", () => {
  const views = run([
    { kind: "status", text: "Checking the lot…" },
    { kind: "delta", text: "Twelve used " },
    { kind: "status", text: "Writing that up…" },
    { kind: "delta", text: "Super Cs." },
    { kind: "done" },
  ]);
  assert.equal(streamActivityLabel(views[1]), "Checking the lot…");
  assert.equal(views[2].phase, "text");
  assert.equal(streamActivityLabel(views[2]), null);
  assert.equal(views[3].phase, "text", "status never takes over text on screen");
  assert.equal(views[4].content, "Twelve used Super Cs.");
  assert.equal(views[5].phase, "done");
});

test("whitespace-only deltas keep the ack up", () => {
  const views = run([{ kind: "delta", text: "\n " }]);
  assert.equal(streamActivityLabel(views[1]), CHAT_ACK_TEXT);
});

test("replace('') retracts text back to an activity line; replace(final) sets it", () => {
  const views = run([
    { kind: "status", text: "Checking the spec sheet…" },
    { kind: "delta", text: "Let me look that up for you…" },
    { kind: "replace", text: "" },
    { kind: "status", text: "Checking the lot…" },
    { kind: "replace", text: "12 used Super Cs." },
  ]);
  assert.equal(views[3].content, "");
  assert.notEqual(streamActivityLabel(views[3]), null);
  assert.equal(streamActivityLabel(views[4]), "Checking the lot…");
  assert.equal(views[5].content, "12 used Super Cs.");
});

test("raw tool output never becomes a status line", () => {
  assert.equal(friendlyStatus('{"ok":true,"matched":12}'), CHAT_WORKING_TEXT);
  assert.equal(friendlyStatus("ok: true · source: own"), CHAT_WORKING_TEXT);
  assert.equal(friendlyStatus("x".repeat(80)), CHAT_WORKING_TEXT);
  assert.equal(friendlyStatus(""), CHAT_WORKING_TEXT);
  assert.equal(friendlyStatus("Checking the lot…"), "Checking the lot…");
  assert.equal(toolStatusText("get_own_lot"), "Checking the lot…");
  assert.equal(toolStatusText("mystery_tool"), CHAT_WORKING_TEXT);
});

test("errors end the view and the copy says to retry", () => {
  const views = run([
    { kind: "delta", text: "partial" },
    { kind: "error", message: "boom" },
  ]);
  assert.equal(views[2].phase, "error");
  assert.equal(reduceStreamView(views[2], { kind: "delta", text: "late" }).content, "partial");
  assert.match(
    chatRetryMessage(new ChatStreamError("Reply timed out", "TimeoutError")),
    /took too long.*Try again/,
  );
  assert.match(chatRetryMessage(new TypeError("Failed to fetch")), /connection.*Try again/);
  assert.match(chatRetryMessage(new Error("HTTP 500")), /Try again/);
});

// ── end to end: a lot ask never flashes a wrong count ─────────────────────

test("simulated lot ask: the forced round's guessed count never reaches the bubble", async () => {
  // Mirrors runXaiWithTools: round 0 is forced to get_own_lot, so the gate
  // holds it; the model's guess is thrown away; round 1 has the lot rows.
  const sink = createChatSseSink({ agentMode: false, heartbeatMs: 10_000 });
  sink.status(toolStatusText("get_own_lot"));
  const round0 = createAnswerGate({ hold: true, emit: (t) => sink.delta(t) });
  round0.push("We have 99 used Super Cs on the lot!");
  if (round0.retract()) sink.replace("");
  sink.status("Writing that up…");
  const round1 = createAnswerGate({ hold: false, emit: (t) => sink.delta(t) });
  for (const piece of ["RV Country has ", "12 used Super Cs ", "right now."]) round1.push(piece);
  for (const piece of chunkForTyping(round1.release())) sink.delta(piece);
  sink.close();

  const views: StreamView[] = [initialStreamView()];
  await consumeSseStream(sink.response, false, {
    onDelta: (t) =>
      views.push(reduceStreamView(views[views.length - 1], { kind: "delta", text: t })),
    onStep: () => {},
    onStatus: (t) =>
      views.push(reduceStreamView(views[views.length - 1], { kind: "status", text: t })),
    onReplace: (t) =>
      views.push(reduceStreamView(views[views.length - 1], { kind: "replace", text: t })),
  });
  assert.ok(
    views.every((v) => !v.content.includes("99")),
    "the guess never painted",
  );
  assert.equal(views[views.length - 1].content, "RV Country has 12 used Super Cs right now.");
  assert.ok(views.some((v) => streamActivityLabel(v) === "Checking the lot…"));
});

// ── route wiring ──────────────────────────────────────────────────────────

test("route streams xAI, gates lot asks, and keeps the memory tap on final text", () => {
  const src = readFileSync(new URL("../../routes/api/rvgrok.ts", import.meta.url), "utf8");
  assert.match(src, /stream: true,/);
  assert.match(src, /hold: forced != null \|\| \(opts\.lotSensitive && !lotSeen\)/);
  assert.match(src, /if \(name === "get_own_lot"\) lotSeen = true;/);
  assert.match(src, /rememberAfterSseResponse\(\s*jsonToSseStream\(\{\s*content: fromXai/);
  assert.match(src, /return sink\.response;/);
  // Client: memory ping (and #633 typed lesson queueing) uses the final text.
  const client = readFileSync(new URL("./stream.ts", import.meta.url), "utf8");
  assert.match(client, /onReplace: \(text\) => \{\s*assistantText = text;/);
  assert.match(client, /schedulePhoneMemoryPing\(\{/);
});
