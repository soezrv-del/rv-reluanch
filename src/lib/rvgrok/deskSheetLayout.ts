/**
 * Where the CARFAX desk card sits in the chat thread.
 * Content of the sheet is unchanged — this is order / timing only.
 */

export type DeskLayoutMessage = {
  deskSheet?: unknown;
  streaming?: boolean;
  role?: string;
};

/** Latest turn that owns a desk sheet. Mid-thread updates move the card here. */
export function latestDeskMessageIndex(
  messages: readonly DeskLayoutMessage[],
): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.deskSheet) return i;
  }
  return -1;
}

/**
 * Index of the message the desk card should follow.
 * `-1` means wait (reply still streaming) or no sheet on the thread yet.
 */
export function deskRevealAfterIndex(
  messages: readonly DeskLayoutMessage[],
): number {
  const i = latestDeskMessageIndex(messages);
  if (i < 0) return -1;
  if (messages[i].streaming) return -1;
  return i;
}

/**
 * Live Voice may resolve a sheet before it is attached to a bubble.
 * Show it after the thread — never as a header — once no assistant is streaming.
 */
export function shouldShowPendingLiveDesk(
  messages: readonly DeskLayoutMessage[],
  liveDeskSheet: unknown,
): boolean {
  if (!liveDeskSheet) return false;
  if (latestDeskMessageIndex(messages) >= 0) return false;
  if (messages.some((m) => m.role === "assistant" && m.streaming)) return false;
  return true;
}
