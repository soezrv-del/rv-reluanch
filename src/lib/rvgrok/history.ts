import type { ChatSession, Message } from "./types";
import { HISTORY_KEY } from "./types";

/** Drop heavy base64 so localStorage stays under quota */
function slimMessages(messages: Message[]): Message[] {
  return messages.map((m) => {
    if (!m.imageDataUrl) return m;
    const { imageDataUrl: _, ...rest } = m;
    return {
      ...rest,
      content: m.content?.includes("[Photo]")
        ? m.content
        : m.content
          ? `${m.content}\n[Photo was attached]`
          : "[Photo was attached]",
    };
  });
}

function reviveMessages(messages: Message[]): Message[] {
  return messages.map((m) => ({
    ...m,
    timestamp:
      m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
  }));
}

export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    return parsed.map((s) => ({
      ...s,
      messages: reviveMessages(s.messages ?? []),
    }));
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    const slim = sessions.slice(0, 40).map((s) => ({
      ...s,
      messages: slimMessages(s.messages ?? []),
    }));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(slim));
  } catch {
    // Quota — drop oldest
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(sessions.slice(0, 10).map((s) => ({
          ...s,
          messages: slimMessages(s.messages ?? []).slice(-12),
        }))),
      );
    } catch {
      /* give up */
    }
  }
}

export function upsertSession(
  sessions: ChatSession[],
  messages: Message[],
  sessionId: string | null,
): { sessions: ChatSession[]; id: string } {
  const now = new Date().toISOString();
  const firstUser = messages.find((m) => m.role === "user");
  const title =
    firstUser?.content?.slice(0, 60) ||
    (firstUser?.imageDataUrl ? "Photo question" : "New chat");

  if (sessionId) {
    const next = sessions.map((s) =>
      s.id === sessionId
        ? { ...s, title, updated_at: now, messages: slimMessages(messages) }
        : s,
    );
    saveSessions(next);
    return { sessions: next, id: sessionId };
  }

  const id = `s-${Date.now()}`;
  const created: ChatSession = {
    id,
    title,
    created_at: now,
    updated_at: now,
    messages: slimMessages(messages),
  };
  const next = [created, ...sessions];
  saveSessions(next);
  return { sessions: next, id };
}

export function deleteSession(sessions: ChatSession[], id: string) {
  const next = sessions.filter((s) => s.id !== id);
  saveSessions(next);
  return next;
}
