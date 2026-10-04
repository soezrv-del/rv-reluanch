/**
 * Server side of typed-chat streaming.
 *
 * 1. `createXaiStreamAccumulator` folds xAI / OpenAI `stream: true` chunks into
 *    content + tool calls (tool-call arguments arrive in pieces by index).
 * 2. `createAnswerGate` decides when model text may reach the screen. A round
 *    whose text could still be thrown away (a forced-tool round, or a lot ask
 *    before lot data is in context) is held in full. Other rounds hold a short
 *    probe so a JSON tool call written as content never flashes, then stream.
 * 3. `createChatSseSink` is the one SSE response the route returns right away:
 *    status lines, heartbeats, deltas, replace, error, then [DONE].
 */

export type StreamedToolCall = {
  id: string;
  type?: string;
  function?: { name?: string; arguments?: string };
};

type XaiChunk = {
  choices?: Array<{
    delta?: {
      content?: string | null;
      tool_calls?: Array<{
        index?: number;
        id?: string;
        type?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
    message?: { content?: string | null; tool_calls?: StreamedToolCall[] };
    finish_reason?: string | null;
  }>;
  error?: unknown;
};

export type XaiStreamAccumulator = {
  /** Feed raw bytes-as-text; returns content pieces seen in this push. */
  push: (chunk: string) => { content: string[]; sawToolCall: boolean };
  /** Flush any trailing line. */
  end: () => { content: string[]; sawToolCall: boolean };
  content: () => string;
  toolCalls: () => StreamedToolCall[];
  finishReason: () => string | null;
  /** At least one `choices[0]` chunk arrived (the old non-stream `msg` existed). */
  sawChoice: () => boolean;
};

export function createXaiStreamAccumulator(): XaiStreamAccumulator {
  let buffer = "";
  let content = "";
  let finish: string | null = null;
  let sawChoice = false;
  const calls = new Map<number, StreamedToolCall>();

  const handleLine = (line: string, out: { content: string[]; sawToolCall: boolean }) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const raw = trimmed.slice(5).trim();
    if (!raw || raw === "[DONE]") return;
    let parsed: XaiChunk;
    try {
      parsed = JSON.parse(raw) as XaiChunk;
    } catch {
      return;
    }
    const choice = parsed.choices?.[0];
    if (!choice) return;
    sawChoice = true;
    if (choice.finish_reason) finish = choice.finish_reason;
    const piece = choice.delta?.content ?? choice.message?.content ?? "";
    if (piece) {
      content += piece;
      out.content.push(piece);
    }
    const deltaCalls = choice.delta?.tool_calls ?? [];
    deltaCalls.forEach((tc, i) => {
      const idx = typeof tc.index === "number" ? tc.index : i;
      const prev = calls.get(idx) ?? {
        id: "",
        type: "function",
        function: { name: "", arguments: "" },
      };
      calls.set(idx, {
        id: tc.id || prev.id,
        type: tc.type || prev.type,
        function: {
          name: (prev.function?.name || "") + (tc.function?.name || ""),
          arguments: (prev.function?.arguments || "") + (tc.function?.arguments || ""),
        },
      });
      out.sawToolCall = true;
    });
    for (const [i, tc] of (choice.message?.tool_calls ?? []).entries()) {
      calls.set(1000 + i, tc);
      out.sawToolCall = true;
    }
  };

  return {
    push(chunk) {
      const out = { content: [] as string[], sawToolCall: false };
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) handleLine(line, out);
      return out;
    },
    end() {
      const out = { content: [] as string[], sawToolCall: false };
      if (buffer) handleLine(buffer, out);
      buffer = "";
      return out;
    },
    content: () => content,
    toolCalls: () =>
      [...calls.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([i, tc]) => ({ ...tc, id: tc.id || `call-${i}` })),
    finishReason: () => finish,
    sawChoice: () => sawChoice,
  };
}

/** Text a model writes when it means a tool call ({"name":…}, ```json …). */
export function looksLikeToolJsonStart(text: string): boolean {
  const t = text.trimStart();
  return /^(?:[{[]|```|<tool|<function|generate_image\b)/i.test(t);
}

/** Non-space characters held before a round is allowed on screen. */
export const ANSWER_PROBE_CHARS = 24;

export type AnswerGate = {
  push: (text: string) => void;
  /** Round ended as the final answer: release anything still held. */
  release: () => string;
  /** Round turned into a tool round: drop what is held. True if text was already shown. */
  retract: () => boolean;
  shown: () => string;
  held: () => string;
};

export function createAnswerGate(opts: {
  /** Hold the whole round (its text may still be discarded). */
  hold: boolean;
  emit: (text: string) => void;
  probeChars?: number;
}): AnswerGate {
  const probe = opts.probeChars ?? ANSWER_PROBE_CHARS;
  let mode: "probe" | "live" | "held" = opts.hold ? "held" : "probe";
  let pending = "";
  let shown = "";

  const show = (text: string) => {
    if (!text) return;
    shown += text;
    opts.emit(text);
  };

  return {
    push(text) {
      if (!text) return;
      if (mode === "live") {
        show(text);
        return;
      }
      pending += text;
      if (mode === "held") return;
      if (looksLikeToolJsonStart(pending)) {
        mode = "held";
        return;
      }
      if (pending.replace(/\s/g, "").length >= probe) {
        mode = "live";
        const out = pending;
        pending = "";
        show(out);
      }
    },
    release() {
      const out = pending;
      pending = "";
      return out;
    },
    retract() {
      pending = "";
      mode = "held";
      return shown.length > 0;
    },
    shown: () => shown,
    held: () => pending,
  };
}

/** Split held text into small pieces so a released answer still types in. */
export function chunkForTyping(text: string, size = 12): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

function encodeSse(obj: unknown) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export type ChatSseSink = {
  response: Response;
  status: (text: string) => void;
  meta: (model: string | null, upstream: string | null) => void;
  delta: (text: string) => void;
  event: (obj: unknown) => void;
  /** Swap the whole bubble text. `text` (not `content`) so older clients ignore it. */
  replace: (text: string) => void;
  error: (message: string) => void;
  /** Forward an inner SSE body verbatim (worker / deterministic replies). */
  pipe: (inner: Response) => Promise<void>;
  close: () => void;
  closed: () => boolean;
  /** Answer text the client holds right now (deltas + replaces). */
  visibleText: () => string;
};

export function createChatSseSink(opts: {
  agentMode: boolean;
  heartbeatMs?: number;
  headers?: Record<string, string>;
}): ChatSseSink {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let isClosed = false;
  let visible = "";
  let beat: ReturnType<typeof setInterval> | null = null;

  const write = (s: string) => {
    if (isClosed) return;
    try {
      controller.enqueue(encoder.encode(s));
    } catch {
      isClosed = true;
    }
  };
  const send = (obj: unknown) => write(encodeSse(obj));

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
      // A comment first so proxies flush headers and the client knows we're alive.
      c.enqueue(encoder.encode(": open\n\n"));
      beat = setInterval(() => write(": ping\n\n"), opts.heartbeatMs ?? 4000);
    },
    cancel() {
      isClosed = true;
      if (beat) clearInterval(beat);
    },
  });

  const close = () => {
    if (beat) clearInterval(beat);
    beat = null;
    if (isClosed) return;
    write("data: [DONE]\n\n");
    isClosed = true;
    try {
      controller.close();
    } catch {
      /* already closed */
    }
  };

  return {
    response: new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        ...(opts.headers || {}),
      },
    }),
    status: (text) => send({ type: "status", text }),
    meta: (model, upstream) => {
      if (model) send({ type: "agent_start", model });
      if (upstream) send({ type: "upstream", upstream });
    },
    delta: (text) => {
      if (!text) return;
      visible += text;
      send(
        opts.agentMode
          ? { type: "delta", content: text }
          : { choices: [{ delta: { content: text } }] },
      );
    },
    event: (obj) => send(obj),
    replace: (text) => {
      visible = text;
      send({ type: "replace", text });
    },
    error: (message) => send({ type: "error", message }),
    async pipe(inner) {
      if (!inner.body) return;
      const reader = inner.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          buf += text;
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (line.startsWith("data: [DONE]")) continue;
            write(`${line}\n`);
            visible += sseLineText(line);
          }
        }
        if (buf && !buf.startsWith("data: [DONE]")) {
          write(`${buf}\n\n`);
          visible += sseLineText(buf);
        }
      } finally {
        reader.releaseLock();
      }
    },
    close,
    closed: () => isClosed,
    visibleText: () => visible,
  };
}

/** Delta text in one SSE line (same shapes the memory tap reads). */
export function sseLineText(line: string): string {
  if (!line.startsWith("data: ")) return "";
  const raw = line.slice(6).trim();
  if (!raw || raw === "[DONE]") return "";
  try {
    const obj = JSON.parse(raw) as {
      type?: string;
      content?: string;
      choices?: Array<{ delta?: { content?: string } }>;
    };
    if (typeof obj.choices?.[0]?.delta?.content === "string") return obj.choices[0].delta.content;
    if (obj.type === "delta" && typeof obj.content === "string") return obj.content;
  } catch {
    /* partial */
  }
  return "";
}
