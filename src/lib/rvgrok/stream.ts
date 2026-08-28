import type { AgentStep, MessageRole } from "./types";
import type { MultimodalMessage, VisionContentPart } from "./vision";

export type StreamHandlers = {
  onDelta: (text: string) => void;
  onStep: (step: AgentStep) => void;
  onModel?: (model: string) => void;
  onUpstream?: (upstream: string) => void;
  onError?: (message: string) => void;
};

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
    if (parsed.type === "agent_start" && parsed.model) {
      handlers.onModel?.(parsed.model);
      return;
    }
    if (parsed.type === "agent_error") {
      handlers.onError?.(parsed.message ?? "Agent error");
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

export async function consumeSseStream(
  response: Response,
  agentMode: boolean,
  handlers: StreamHandlers,
  signal?: AbortSignal,
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

  while (true) {
    if (signal?.aborted) {
      reader.cancel().catch(() => {});
      break;
    }
    const { done, value } = await reader.read();
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
}) {
  const response = await fetch("/api/rvgrok", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: opts.messages as MultimodalMessage[],
      agentMode: opts.agentMode,
      feedbackContext: opts.feedbackContext || undefined,
    }),
    signal: opts.signal,
  });

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

  await consumeSseStream(
    response,
    opts.agentMode,
    opts.handlers,
    opts.signal,
  );
}
