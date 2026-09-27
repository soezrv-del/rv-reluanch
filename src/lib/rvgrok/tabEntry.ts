/**
 * Visible-chat rules for the Grok pane.
 *
 * The pane stays mounted after the first visit. Dock / swipe / chips / More
 * keep the open conversation — a room switch must not wipe it. History
 * storage is untouched.
 *
 * The only fresh thread is a one-shot Facts "Ask Grok" seed. Cal / Tow /
 * Trips handoffs must not write this seed.
 */

export type GrokTabEntry = {
  /** True only for a Facts Ask Grok seed. Room switches keep the thread. */
  resetVisibleChat: boolean;
  /** Trimmed Ask-Grok seed, or null when the open thread should stay. */
  seed: string | null;
};

export function planGrokTabEntry(seedPrompt?: string | null): GrokTabEntry {
  const seed = typeof seedPrompt === "string" ? seedPrompt.trim() : "";
  const hasSeed = seed.length > 0;
  return {
    resetVisibleChat: hasSeed,
    seed: hasSeed ? seed : null,
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
