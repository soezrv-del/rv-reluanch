/**
 * Grok extras are prompt-gated — same quiet Yes/No pattern as
 * "Want a video?" Facts still auto-loads these on the report.
 */

import { shouldShowRvVideoPrompt } from "../rv/rvVideos.ts";

export type GrokExtraKind =
  | "ratings"
  | "video"
  | "nhtsa"
  | "market"
  | "reviews"
  | "maintenance"
  | "vin"
  | "share";

export const GROK_EXTRA_KINDS: readonly GrokExtraKind[] = [
  "ratings",
  "video",
  "nhtsa",
  "market",
  "reviews",
  "maintenance",
  "vin",
  "share",
] as const;

export type GrokExtraCoach = {
  year?: string;
  make?: string;
  model?: string;
  floorplan?: string;
  type?: string;
};

const KIND_RE: Record<GrokExtraKind, RegExp> = {
  ratings:
    /\b(ratings?|torque[-\s]?to[-\s]?weight|customer satisfaction)\b/i,
  video:
    /\b(want a video|video(?:s)?|walkthrough|walk[- ]?thru|youtube|rv video library)\b/i,
  nhtsa: /\b(recalls?|nhtsa|complaints?|defects?|safety campaign)\b/i,
  market:
    /\b(market(?: value)?|worth|price range|comps?|sold listings?|what (?:does|do) (?:it|this) (?:go|sell) for)\b/i,
  reviews: /\b(reviews?|owner (?:said|say|think|feedback)|reputation)\b/i,
  maintenance:
    /\b(maintenance|maintain|service schedule|oil change|upkeep)\b/i,
  vin: /\bvin\b/i,
  share: /\b(share(?: this)?|send (?:this|the) (?:report|coach)|export)\b/i,
};

export function hasLockedGrokCoach(coach: GrokExtraCoach | null | undefined): boolean {
  return Boolean(
    String(coach?.year || "").trim() &&
      String(coach?.make || "").trim() &&
      String(coach?.model || "").trim(),
  );
}

/** Named extras in the user's turn. Spec-report alone does not unlock these. */
export function detectGrokExtraKinds(query: string): GrokExtraKind[] {
  const t = String(query || "").trim();
  if (!t) return [];
  return GROK_EXTRA_KINDS.filter((kind) => KIND_RE[kind].test(t));
}

export function shouldShowGrokExtra(
  kind: GrokExtraKind,
  query: string,
  coach: GrokExtraCoach | null | undefined,
): boolean {
  if (!hasLockedGrokCoach(coach)) return false;
  if (!detectGrokExtraKinds(query).includes(kind)) return false;
  if (kind === "video") {
    return shouldShowRvVideoPrompt({
      year: coach?.year,
      make: coach?.make,
      model: coach?.model,
      floorplan: coach?.floorplan,
      type: coach?.type,
    });
  }
  return true;
}

export function grokExtrasForPrompt(
  query: string,
  coach: GrokExtraCoach | null | undefined,
): GrokExtraKind[] {
  return GROK_EXTRA_KINDS.filter((kind) =>
    shouldShowGrokExtra(kind, query, coach),
  );
}

/**
 * After a Live Voice overview or full report. All five at once.
 * The caller must not preload them. A pick opens only that card.
 */
export const VOICE_SPEC_EXTRA_KINDS: readonly GrokExtraKind[] = [
  "ratings",
  "market",
  "video",
  "nhtsa",
  "maintenance",
] as const;

export const VOICE_EXTRAS_OFFER_LINE =
  "I can also pull ratings, market value, a video, NHTSA safety, or maintenance. Which one do you want?";

export function voiceSpecExtraPrompts(
  coach: GrokExtraCoach | null | undefined,
): GrokExtraKind[] {
  if (!hasLockedGrokCoach(coach)) return [];
  return VOICE_SPEC_EXTRA_KINDS.filter((kind) => {
    if (kind !== "video") return true;
    return shouldShowRvVideoPrompt({
      year: coach?.year,
      make: coach?.make,
      model: coach?.model,
      floorplan: coach?.floorplan,
      type: coach?.type,
    });
  });
}

/** Named extras, plus all five voice prompts when the card asks for them. */
export function extrasToOffer(opts: {
  query: string;
  coach: GrokExtraCoach | null | undefined;
  offerVoiceExtras?: boolean;
  /** Ignored. The one-at-a-time drip is off; all five show together. */
  voiceExtraStep?: number;
  /** Salesman picked one extra. Open only that card. */
  voiceExtraPick?: GrokExtraKind;
}): GrokExtraKind[] {
  if (opts.voiceExtraPick) {
    const allowed = voiceSpecExtraPrompts(opts.coach);
    return allowed.includes(opts.voiceExtraPick) ? [opts.voiceExtraPick] : [];
  }
  const named = grokExtrasForPrompt(opts.query, opts.coach);
  if (!opts.offerVoiceExtras) return named;
  const voice = voiceSpecExtraPrompts(opts.coach);
  const seen = new Set<GrokExtraKind>();
  const out: GrokExtraKind[] = [];
  for (const kind of [...voice, ...named]) {
    if (seen.has(kind)) continue;
    seen.add(kind);
    out.push(kind);
  }
  return out;
}

export const GROK_EXTRA_PROMPTS: Record<
  GrokExtraKind,
  { title: string; body: string }
> = {
  ratings: {
    title: "Want ratings?",
    body: "Quality, reliability, and satisfaction from the catalog, plus torque-to-weight when both numbers exist. Missing stays GAP.",
  },
  video: {
    title: "Want a video?",
    body: "Would you like a video from RV Video Library?",
  },
  nhtsa: {
    title: "Want NHTSA recalls?",
    body: "Look up safety campaigns for this coach.",
  },
  market: {
    title: "Want market bands?",
    body: "Check live sold comps for this year / make / model.",
  },
  reviews: {
    title: "Want owner reviews?",
    body: "Show owner notes for this brand and series.",
  },
  maintenance: {
    title: "Want the maintenance list?",
    body: "Show the catalog service schedule for this coach.",
  },
  vin: {
    title: "Want a VIN decode?",
    body: "Paste a 17-character VIN to decode it.",
  },
  share: {
    title: "Want to share this coach?",
    body: "Copy a share line for this year / make / model.",
  },
};
