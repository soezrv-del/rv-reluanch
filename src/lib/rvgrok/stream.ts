import type { AgentStep, MessageRole } from "./types";
import type { MultimodalMessage, VisionContentPart } from "./vision";

export type StreamHandlers = {
  onDelta: (text: string) => void;
  onStep: (step: AgentStep) => void;
  onImage?: (url: string) => void;
  onModel?: (model: string) => void;
  onUpstream?: (upstream: string) => void;
  onError?: (message: string) => void;
  /** Short activity line while the server works (lot, spec sheet, web, tools). */
  onStatus?: (text: string) => void;
  /** Server swapped the whole answer text ("" clears retracted pre-tool text). */
  onReplace?: (text: string) => void;
  /** Server gave up on this turn (timeout / upstream failure). */
  onFailed?: (message: string) => void;
};

/** Thrown when the stream stalls, runs too long, or the server sends `error`. */
export class ChatStreamError extends Error {
  constructor(message: string, name: "TimeoutError" | "ChatStreamError" = "ChatStreamError") {
    super(message);
    this.name = name;
  }
}

/**
 * Parse SSE-style lines from either:
 * - OpenAI/xAI chat completions stream: { choices: [{ delta: { content } }] }
 * - Agent mode: { type: 'step' | 'delta' | 'agent_start' | 'agent_error', ... }
 */
export function processSseLine(
  line: string,
  agentMode: boolean,
  handlers: StreamHandlers,
) {
  if (!line.startsWith("data: ")) return;
  const raw = line.slice(6).trim();
  if (!raw || raw === "[DONE]") return;

  try {
    const parsed = JSON.parse(raw);

    // Agent-shaped events (always honor — workers sometimes mix formats)
    if (parsed.type === "step") {
      handlers.onStep({
        step: parsed.step,
        tool: parsed.tool,
        input: parsed.input ?? {},
        result: parsed.result,
        status: parsed.status,
      });
      return;
    }
    if (parsed.type === "delta") {
      const delta = parsed.content ?? "";
      if (delta) handlers.onDelta(delta);
      return;
    }
    if (parsed.type === "status") {
      if (typeof parsed.text === "string") handlers.onStatus?.(parsed.text);
      return;
    }
    if (parsed.type === "replace") {
      handlers.onReplace?.(typeof parsed.text === "string" ? parsed.text : "");
      return;
    }
    if (parsed.type === "upstream") {
      if (typeof parsed.upstream === "string") handlers.onUpstream?.(parsed.upstream);
      return;
    }
    if (parsed.type === "error") {
      handlers.onFailed?.(
        typeof parsed.message === "string" ? parsed.message : "Upstream error",
      );
      return;
    }
    if (parsed.type === "agent_start" && parsed.model) {
      handlers.onModel?.(parsed.model);
      return;
    }
    if (parsed.type === "agent_error") {
      handlers.onError?.(parsed.message ?? "Agent error");
      return;
    }
    if (parsed.type === "image") {
      const url =
        typeof parsed.url === "string"
          ? parsed.url
          : typeof parsed.b64 === "string"
            ? `data:${parsed.mime || "image/jpeg"};base64,${String(parsed.b64).replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "")}`
            : "";
      if (url) handlers.onImage?.(url);
      return;
    }

    // OpenAI / xAI chat completions stream chunk
    const delta =
      parsed.choices?.[0]?.delta?.content ??
      parsed.choices?.[0]?.message?.content ??
      parsed.content ??
      "";
    if (delta) handlers.onDelta(String(delta));
  } catch {
    // ignore partial JSON
  }
}

export type StreamWatchdog = {
  /** Fail when no bytes (pings included) arrive for this long. */
  idleMs?: number;
  /** Fail when the whole stream runs longer than this. */
  totalMs?: number;
  now?: () => number;
};

async function readWithWatchdog(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  waitMs: number | null,
): Promise<ReadableStreamReadResult<Uint8Array>> {
  if (waitMs == null) return reader.read();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new ChatStreamError("Reply timed out", "TimeoutError")),
      Math.max(0, waitMs),
    );
  });
  try {
    return await Promise.race([reader.read(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function consumeSseStream(
  response: Response,
  agentMode: boolean,
  handlers: StreamHandlers,
  signal?: AbortSignal,
  watchdog?: StreamWatchdog,
) {
  const modelUsed = response.headers.get("X-Model-Used");
  if (modelUsed) handlers.onModel?.(modelUsed);
  const upstream = response.headers.get("X-Upstream");
  if (upstream) handlers.onUpstream?.(upstream);

  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    for (const line of text.split("\n")) {
      processSseLine(line, agentMode, handlers);
    }
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  const now = watchdog?.now ?? (() => Date.now());
  const startedAt = now();

  while (true) {
    if (signal?.aborted) {
      reader.cancel().catch(() => {});
      break;
    }
    const left = watchdog?.totalMs != null ? watchdog.totalMs - (now() - startedAt) : null;
    const wait =
      watchdog?.idleMs != null || left != null
        ? Math.min(watchdog?.idleMs ?? Infinity, left ?? Infinity)
        : null;
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await readWithWatchdog(reader, wait);
    } catch (err) {
      reader.cancel().catch(() => {});
      throw err;
    }
    const { done, value } = chunk;
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      processSseLine(line, agentMode, handlers);
    }
  }
  if (buffer) processSseLine(buffer, agentMode, handlers);
}

export type HistoryMessage = {
  role: MessageRole;
  content: string | VisionContentPart[];
};

/**
 * Call the app's API proxy (which talks to Cloudflare Worker / xAI / demo).
 * Messages may include vision parts (text + image_url).
 */
export async function streamChat(opts: {
  messages: HistoryMessage[];
  agentMode: boolean;
  signal?: AbortSignal;
  handlers: StreamHandlers;
  feedbackContext?: string;
  catalogContext?: string;
  wantsWebFallback?: boolean;
  /** AccessProvider / stored whitelist phone — same credential as Live Voice. */
  accessPhone?: string;
  /** Approved first name — chat personalization only; never grants access. */
  visitorFirstName?: string;
  /** Page Ask RV Grok was opened from. Omitted for the Chat tab. */
  pageScope?: string;
  /** Stall / total-time limits for the reply stream. */
  watchdog?: StreamWatchdog;
}) {
  const { fetchWithResearchAccess, researchAccessHeaders } = await import(
    "../access/researchUnlock.ts"
  );
  const body = JSON.stringify({
    messages: opts.messages as MultimodalMessage[],
    agentMode: opts.agentMode,
    feedbackContext: opts.feedbackContext || undefined,
    catalogContext: opts.catalogContext || undefined,
    wantsWebFallback: opts.wantsWebFallback || undefined,
    visitorFirstName: opts.visitorFirstName || undefined,
    pageScope: opts.pageScope || undefined,
  });
  const response = await fetchWithResearchAccess(
    (phone) =>
      fetch("/api/rvgrok", {
        method: "POST",
        headers: researchAccessHeaders(
          { "Content-Type": "application/json" },
          phone,
        ),
        body,
        signal: opts.signal,
      }),
    { accessPhone: opts.accessPhone, signal: opts.signal },
  );

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const j = await response.json();
      detail = j.error || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  let assistantText = "";
  let failed: string | null = null;
  await consumeSseStream(
    response,
    opts.agentMode,
    {
      ...opts.handlers,
      onDelta: (text) => {
        assistantText += text;
        opts.handlers.onDelta(text);
      },
      onReplace: (text) => {
        assistantText = text;
        opts.handlers.onReplace?.(text);
      },
      onFailed: (message) => {
        failed = message;
        opts.handlers.onFailed?.(message);
      },
    },
    opts.signal,
    opts.watchdog,
  );
  if (failed != null) throw new ChatStreamError(failed);

  schedulePhoneMemoryPing({
    accessPhone: opts.accessPhone,
    messages: opts.messages,
    assistantText,
  });
}

/** Fire-and-forget — never blocks the bubble. Unlocked phone only. */
function schedulePhoneMemoryPing(opts: {
  accessPhone?: string;
  messages: HistoryMessage[];
  assistantText: string;
}) {
  const phone = (opts.accessPhone || "").trim();
  if (!phone) return;
  void import("../access/researchUnlock.ts")
    .then(({ researchAccessHeaders }) => {
      const turns = opts.messages.map((m) => ({
        role: m.role,
        content:
          typeof m.content === "string"
            ? m.content.slice(0, 800)
            : m.content
                .map((p) => ("text" in p && p.text ? p.text : ""))
                .join(" ")
                .slice(0, 800),
      }));
      if (opts.assistantText.trim()) {
        turns.push({
          role: "assistant",
          content: opts.assistantText.slice(0, 800),
        });
      }
      return fetch("/api/rvgrok/memory", {
        method: "POST",
        headers: researchAccessHeaders(
          { "Content-Type": "application/json" },
          phone,
        ),
        body: JSON.stringify({ messages: turns }),
        keepalive: true,
      });
    })
    .catch(() => undefined);
}
