/**
 * Visible-chat isolation for the Grok dock tab.
 *
 * The Grok pane stays mounted after the first visit. Dock / swipe / More
 * entry must wipe the *active* composer + message list so a leftover chat
 * never reappears. History storage is untouched.
 *
 * The only allowed prefill is a one-shot Facts "Ask Grok" seed. Cal / Tow /
 * Trips handoffs must not write this seed.
 */

export type GrokTabEntry = {
  /** Always clear the in-memory composer + message list on tab entry. */
  resetVisibleChat: true;
  /** Trimmed Ask-Grok seed, or null for the empty starters surface. */
  seed: string | null;
};

export function planGrokTabEntry(seedPrompt?: string | null): GrokTabEntry {
  const seed = typeof seedPrompt === "string" ? seedPrompt.trim() : "";
  return {
    resetVisibleChat: true,
    seed: seed.length > 0 ? seed : null,
  };
}

/** Dock tap, swipe, or More → Grok never carries a leftover seed. */
export function clearGrokSeedOnDockTap(): undefined {
  return undefined;
}

/** Facts Ask Grok is the only path that may set a seed. */
export function grokSeedFromAskHandoff(
  prompt?: string | null,
): string | undefined {
  const seed = typeof prompt === "string" ? prompt.trim() : "";
  return seed.length > 0 ? seed : undefined;
}
