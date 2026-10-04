import assert from "node:assert/strict";
import { test } from "node:test";
import { ACCESS_PHONE_HEADER, HARD_ADMIN } from "../access/constants.ts";

/**
 * David, typed chat: "Do we have any Winnebago Views on the lot?" → yes →
 * "do we have anything like the Winnebago View in stock?" went quiet. These
 * replay that exchange through the real /api/rvgrok streaming handler with
 * xAI stubbed, and assert a non-empty answer naming the Navion in time.
 */

const THREAD = [
  { role: "user", content: "Do we have any Winnebago Views on the lot?" },
  {
    role: "assistant",
    content: "Yes — we have 2 Winnebago View on the lot right now.",
  },
  { role: "user", content: "do we have anything like the Winnebago View in stock?" },
];

type XaiStub = (body: Record<string, unknown>, signal: AbortSignal | undefined, call: number) => Promise<Response>;

const enc = new TextEncoder();
const sse = (events: unknown[]) =>
  new Response(
    new ReadableStream<Uint8Array>({
      start(c) {
        for (const e of events) c.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
        c.enqueue(enc.encode("data: [DONE]\n\n"));
        c.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );

async function replay(stub: XaiStub, budgetMs = 1500) {
  const realFetch = globalThis.fetch;
  process.env.XAI_API_KEY = "test-key";
  process.env.RVGROK_LOT_TURN_BUDGET_MS = String(budgetMs);
  let calls = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("https://api.x.ai/v1/chat/completions")) {
      calls += 1;
      const body = JSON.parse(String(init?.body || "{}")) as Record<string, unknown>;
      return stub(body, init?.signal ?? undefined, calls);
    }
    // Memory, lessons, worker: nothing else should be needed for this turn.
    return new Response("{}", { status: 404 });
  }) as typeof fetch;
  try {
    const { Route } = await import("../../routes/api/rvgrok.ts");
    const post = (Route as unknown as {
      options: { server: { handlers: { POST: (a: { request: Request }) => Promise<Response> } } };
    }).options.server.handlers.POST;
    const started = Date.now();
    const res = await post({
      request: new Request("http://localhost/api/rvgrok", {
        method: "POST",
        headers: { "Content-Type": "application/json", [ACCESS_PHONE_HEADER]: HARD_ADMIN.e164 },
        body: JSON.stringify({ messages: THREAD }),
      }),
    });
    const raw = await res.text();
    const elapsedMs = Date.now() - started;
    let text = "";
    const statuses: string[] = [];
    for (const line of raw.split("\n")) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      const evt = JSON.parse(line.slice(6)) as {
        choices?: { delta?: { content?: string } }[];
        type?: string;
        text?: string;
      };
      const delta = evt.choices?.[0]?.delta?.content;
      if (typeof delta === "string") text += delta;
      if (evt.type === "replace" && typeof evt.text === "string") text = evt.text;
      if (evt.type === "status" && typeof evt.text === "string") statuses.push(evt.text);
    }
    return { text: text.trim(), raw, elapsedMs, calls, statuses };
  } finally {
    globalThis.fetch = realFetch;
  }
}

const hang: XaiStub = (_body, signal) =>
  new Promise<Response>((_resolve, reject) => {
    signal?.addEventListener("abort", () => reject(signal.reason ?? new Error("aborted")));
  });

test("a hung model on 'anything like the Winnebago View' still answers with the Navion, in time", async () => {
  const out = await replay(hang, 1500);
  assert.ok(out.text.length > 0, `empty bubble: ${out.raw.slice(0, 400)}`);
  assert.match(out.text, /Navion/);
  assert.doesNotMatch(out.text, /No response content/);
  assert.doesNotMatch(out.text, /·|stk |\{/); // no raw rows or JSON
  assert.ok(out.elapsedMs < 6000, `took ${out.elapsedMs}ms`);
  // The budget ends the turn; it does not walk every model in turn.
  assert.equal(out.calls, 1);
});

test("a tool loop that never writes words ends on the lot answer, not an empty bubble", async () => {
  let n = 0;
  const loop: XaiStub = async () => {
    n += 1;
    return sse([
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: `call-${n}`,
                  type: "function",
                  function: {
                    name: "get_own_lot",
                    arguments: JSON.stringify({ query: "anything like the Winnebago View" }),
                  },
                },
              ],
            },
          },
        ],
      },
    ]);
  };
  const out = await replay(loop, 10_000);
  assert.ok(out.text.length > 0);
  assert.match(out.text, /Navion/);
  assert.doesNotMatch(out.text, /No response content/);
});

test("her round-0 answer with the lot rows in context stands; no second forced lot round", async () => {
  const answer: XaiStub = async () =>
    sse([
      {
        choices: [
          {
            delta: {
              content:
                "Beyond the 2 Views, the closest match is the 2 Itasca Navion, same Winnebago family, plus other Sprinter coaches.",
            },
          },
        ],
      },
    ]);
  const out = await replay(answer, 10_000);
  assert.match(out.text, /Itasca Navion/);
  assert.equal(out.calls, 1);
  assert.ok(out.elapsedMs < 6000, `took ${out.elapsedMs}ms`);
});
