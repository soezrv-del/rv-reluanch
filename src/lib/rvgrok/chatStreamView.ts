/**
 * Typed-chat progressive reply: the bubble state between "send" and the
 * finished answer. Pure so the ack → status → text → replace flow is unit
 * tested without React or a network.
 *
 * Phases:
 * - ack:    right after send, before the server says anything.
 * - status: the server is doing pre-text work (lot, spec sheet, web, tools).
 * - text:   real answer text is arriving.
 * - done / error: terminal.
 *
 * Status lines are short fixed phrases. Raw tool output never reaches the
 * bubble: anything that looks like JSON or is too long falls back to a
 * generic line.
 */

export const CHAT_ACK_TEXT = "I'll be just a second…";
export const CHAT_WORKING_TEXT = "Working on it…";

/** Client gives up when the stream is silent this long (server pings every few s). */
export const CHAT_STREAM_IDLE_MS = 45_000;
/** Hard cap on one typed turn, even if bytes keep arriving. */
export const CHAT_STREAM_TOTAL_MS = 180_000;

export type StreamPhase = "ack" | "status" | "text" | "done" | "error";

export type StreamView = {
  phase: StreamPhase;
  /** Activity line shown while there is no answer text yet. */
  status: string;
  /** Answer text so far (exactly the concatenated deltas, or the last replace). */
  content: string;
  error?: string;
};

export type StreamViewEvent =
  | { kind: "status"; text: string }
  | { kind: "delta"; text: string }
  | { kind: "replace"; text: string }
  | { kind: "done" }
  | { kind: "error"; message: string };

export function initialStreamView(): StreamView {
  return { phase: "ack", status: CHAT_ACK_TEXT, content: "" };
}

const TOOL_STATUS: Record<string, string> = {
  get_own_lot: "Checking the lot…",
  get_coach_facts: "Checking the spec sheet…",
  check_recalls: "Checking recalls…",
  search_listings: "Checking prices…",
  estimate_payment: "Running the numbers…",
  check_tow: "Checking tow ratings…",
  generate_image: "Drawing that up…",
};

/** Short status for a server tool. Never echoes arguments or results. */
export function toolStatusText(tool: string): string {
  return TOOL_STATUS[tool] || CHAT_WORKING_TEXT;
}

/** Clamp a server status to a short human phrase; raw / JSON-ish text is dropped. */
export function friendlyStatus(text: unknown): string {
  const t = typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";
  if (!t) return CHAT_WORKING_TEXT;
  if (t.length > 48) return CHAT_WORKING_TEXT;
  if (/[{}[\]"<>|=]|https?:|\b(?:ok|error|null|undefined|true|false)\b\s*[:,]/i.test(t)) {
    return CHAT_WORKING_TEXT;
  }
  return t;
}

export function reduceStreamView(view: StreamView, ev: StreamViewEvent): StreamView {
  if (view.phase === "done" || view.phase === "error") return view;
  switch (ev.kind) {
    case "status": {
      // Once answer text is on screen a status line never takes it over.
      if (view.phase === "text") return view;
      return { ...view, phase: "status", status: friendlyStatus(ev.text) };
    }
    case "delta": {
      if (!ev.text) return view;
      const content = view.content + ev.text;
      return {
        ...view,
        content,
        phase: content.trim() ? "text" : view.phase,
      };
    }
    case "replace": {
      const content = ev.text || "";
      if (content.trim()) return { ...view, content, phase: "text" };
      // Cleared (the server retracted pre-tool text): back to activity.
      return {
        ...view,
        content: "",
        phase: "status",
        status: view.phase === "ack" ? view.status : view.status || CHAT_WORKING_TEXT,
      };
    }
    case "done":
      return { ...view, phase: "done" };
    case "error":
      return { ...view, phase: "error", error: ev.message || "Something went wrong" };
  }
}

/** Activity line for the bubble, or null when answer text should render. */
export function streamActivityLabel(view: StreamView): string | null {
  if (view.phase === "ack" || view.phase === "status") return view.status || CHAT_ACK_TEXT;
  return null;
}

/** User-facing copy when a typed turn fails or times out. */
export function chatRetryMessage(err: unknown): string {
  const name = (err as { name?: string } | null)?.name || "";
  const msg = err instanceof Error ? err.message : String(err || "");
  if (name === "TimeoutError" || /timed? ?out/i.test(msg)) {
    return "That reply took too long and I stopped waiting. Tap Try again.";
  }
  if (/failed to fetch|network|load failed/i.test(msg)) {
    return "I lost the connection before the reply finished. Tap Try again.";
  }
  return "Something went wrong before I could finish that reply. Tap Try again.";
}
