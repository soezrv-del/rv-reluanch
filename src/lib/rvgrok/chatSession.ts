/** Messages sent to the chat assistant. Older turns stay on screen. */
export const CHAT_HISTORY_WINDOW = 10;

/** No user input for this long closes the chat session. */
export const CHAT_IDLE_MS = 4 * 60 * 1000;

export function takeChatHistory<T>(messages: T[]): T[] {
  if (messages.length <= CHAT_HISTORY_WINDOW) return messages;
  return messages.slice(-CHAT_HISTORY_WINDOW);
}

export function chatIdleDue(lastInputAt: number, now: number): boolean {
  return now - lastInputAt >= CHAT_IDLE_MS;
}
