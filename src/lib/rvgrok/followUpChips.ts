/**
 * Client-side follow-up chips for typed chat.
 * Cheap heuristics + short templates — no second Grok call.
 * Chips are UI only (never spoken). Never invent OEM numbers.
 * Never use "I'm RvGrok" as a label.
 */

import { parseCoachFromText } from "./parseCoach.ts";

export type FollowUpChip = {
  id: string;
  /** Visible chip line — also the string sent on tap. */
  label: string;
};

const MIN = 2;
const MAX = 4;

const FORBIDDEN_LABEL =
  /i'?m\s*rv\s*grok|tell me more|ask me anything|want me to|would you like/i;

/** Spec-shaped figures we must not invent into a chip. */
const INVENTED_NUMBER =
  /\b\d{2,4}\s*(?:hp|lb(?:s|[- ]?ft)?|gal(?:lons?)?)\b|\b\d{4,6}\s*(?:gvwr|uvw|gcwr|ncc)\b/i;

export function coachPhrase(text: string): string {
  const c = parseCoachFromText(text || "");
  return [c.year, c.make, c.model, c.floorplan].filter(Boolean).join(" ").trim();
}

export function latestFinishedAssistantIndex(
  messages: Array<{
    role: string;
    streaming?: boolean;
    content?: string;
  }>,
): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    if (m.streaming) return -1;
    const content = (m.content || "").trim();
    if (!content || content.startsWith("Error:")) return -1;
    return i;
  }
  return -1;
}

function priorUserText(
  messages: Array<{ role: string; content?: string }>,
  assistantIndex: number,
): string {
  for (let i = assistantIndex - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content || "";
  }
  return "";
}

type Topic =
  | "chassis"
  | "tanks"
  | "weights"
  | "engine"
  | "compare"
  | "report"
  | "market"
  | "tow"
  | "layout"
  | "recall"
  | "lot"
  | "repair"
  | "match"
  | "video"
  | "reviews"
  | "maintenance"
  | "vin"
  | "share";

function detectTopics(text: string): Set<Topic> {
  const t = text || "";
  const topics = new Set<Topic>();
  if (
    /\b(chassis|diesel pusher|freightliner|spartan|ford f-?53|workhorse|xc-?r|tag axle)\b/i.test(
      t,
    )
  ) {
    topics.add("chassis");
  }
  if (/\b(tank|fresh|gray|grey|black water|holding)\b/i.test(t)) {
    topics.add("tanks");
  }
  if (/\b(gvwr|gcwr|uvw|ncc|payload|hitch weight|wet weight)\b/i.test(t)) {
    topics.add("weights");
  }
  if (
    /\b(engine|cummins|power stroke|horsepower|\bhp\b|torque|isl|l9|x15)\b/i.test(
      t,
    )
  ) {
    topics.add("engine");
  }
  if (
    /\b(compare|comparison|comparing|vs\.?|versus|side[- ]by[- ]side|difference(?:s)?\s+between)\b/i.test(
      t,
    )
  ) {
    topics.add("compare");
  }
  if (/\b(spec report|spec sheet|desk|brochure report)\b/i.test(t)) {
    topics.add("report");
  }
  if (/\b(market|worth|asking|comps?|listing prices?)\b/i.test(t)) {
    topics.add("market");
  }
  if (/\b(tow|dinghy|toad|hitch)\b/i.test(t)) topics.add("tow");
  if (/\b(floorplan|layout|slide|bunk|king bed|bath)\b/i.test(t)) {
    topics.add("layout");
  }
  if (/\brecall|nhtsa\b/i.test(t)) topics.add("recall");
  if (/\b(video|youtube|walkthrough|want a video)\b/i.test(t)) {
    topics.add("video");
  }
  if (/\b(owner reviews?|what owners say)\b/i.test(t)) topics.add("reviews");
  if (/\b(maintenance schedule|service interval)\b/i.test(t)) {
    topics.add("maintenance");
  }
  if (/\bvin\s*(decode|decoder|check)?\b/i.test(t)) topics.add("vin");
  if (/\bshare kit\b/i.test(t)) topics.add("share");
  if (/\b(on the lot|in stock|inventory|do we have)\b/i.test(t)) {
    topics.add("lot");
  }
  if (
    /\b(troubleshoot|repair|leak|won'?t start|error code|diagnose)\b/i.test(t)
  ) {
    topics.add("repair");
  }
  if (/\b(match me|recommend a|which class|budget)\b/i.test(t)) {
    topics.add("match");
  }
  return topics;
}

function canUse(label: string): boolean {
  const t = (label || "").trim();
  if (t.length < 8 || t.length > 90) return false;
  if (FORBIDDEN_LABEL.test(t)) return false;
  if (INVENTED_NUMBER.test(t)) return false;
  return true;
}

function pushUnique(out: FollowUpChip[], id: string, label: string) {
  const line = label.replace(/\s+/g, " ").trim();
  if (!canUse(line)) return;
  const key = line.toLowerCase();
  if (out.some((c) => c.label.toLowerCase() === key || c.id === id)) return;
  out.push({ id, label: line });
}

/**
 * 2–4 contextual next-asks from the last user + assistant turn.
 * Templates only — no OEM figures, no greeting replay.
 */
export function buildFollowUpChips(opts: {
  userText?: string;
  assistantText?: string;
}): FollowUpChip[] {
  const user = (opts.userText || "").trim();
  const asst = (opts.assistantText || "").trim();
  if (!asst || asst.startsWith("Error:")) return [];

  const blob = `${user}\n${asst}`;
  const named = coachPhrase(blob);
  const year = parseCoachFromText(blob).year;
  const topics = detectTopics(blob);
  const out: FollowUpChip[] = [];

  // Facts extras — one opt-in chip on spec-report turns (Want a video? pattern).
  if (
    named &&
    topics.has("report") &&
    !topics.has("recall") &&
    !topics.has("video")
  ) {
    pushUnique(
      out,
      "extras-offer",
      "Want NHTSA recalls, market value, or a video?",
    );
  }

  if (topics.has("chassis") || /\bdiesel pusher\b/i.test(blob)) {
    pushUnique(
      out,
      "chassis-explain",
      "Explain how diesel pusher chassis specs work",
    );
    pushUnique(
      out,
      "chassis-compare",
      "Compare Freightliner vs Spartan RV chassis",
    );
  }

  if (
    year &&
    (topics.has("report") ||
      topics.has("chassis") ||
      /\b(spec|report)\b/i.test(user))
  ) {
    pushUnique(
      out,
      "drop-year",
      `Remove the specific ${year} model report details`,
    );
  }

  if (named && !topics.has("tanks") && !topics.has("weights")) {
    pushUnique(
      out,
      "tanks-payload",
      named.length <= 40
        ? `Walk through tanks and payload on the ${named}`
        : "Walk through tanks and payload on this coach",
    );
  } else if (topics.has("tanks") || topics.has("weights")) {
    pushUnique(out, "weights-dig", "Dig into GVWR, UVW, and real payload");
  }

  if (named && !topics.has("compare")) {
    pushUnique(out, "compare-class", "Compare this to a similar class option");
  } else if (topics.has("compare")) {
    pushUnique(
      out,
      "compare-fulltime",
      "Which differences matter for full-time use",
    );
  }

  if (topics.has("engine")) {
    pushUnique(out, "power-weight", "Explain power-to-weight on this coach");
  }

  if (topics.has("market")) {
    pushUnique(
      out,
      "market-check",
      "What to check before trusting those listing prices",
    );
  }

  if (topics.has("tow")) {
    pushUnique(
      out,
      "tow-check",
      "What to verify before towing with this coach",
    );
  }

  if (topics.has("layout")) {
    pushUnique(out, "layout", "How the floorplan lives on a long trip");
  }

  if (topics.has("repair")) {
    pushUnique(
      out,
      "repair-next",
      "What's the safe next check if that doesn't fix it",
    );
  }

  if (topics.has("lot")) {
    pushUnique(out, "lot-next", "Any similar coaches on our lot snapshot");
  }

  if (topics.has("match")) {
    pushUnique(out, "match-narrow", "Narrow that to two classes I can look up");
  }

  if (topics.has("recall")) {
    pushUnique(out, "recall-next", "Which recalls matter on this chassis");
  }
  if (named && topics.has("recall") && !topics.has("reviews")) {
    pushUnique(out, "extras-reviews", "Want owner reviews for this coach?");
  }
  if (named && topics.has("video") && !topics.has("share")) {
    pushUnique(out, "extras-share", "Want a share kit for this coach?");
  }

  if (out.length < MIN) {
    if (named) {
      pushUnique(
        out,
        "chassis-fallback",
        "Explain the chassis and powertrain on this coach",
      );
      pushUnique(
        out,
        "tanks-fallback",
        "Walk through tanks and weights on this coach",
      );
      pushUnique(
        out,
        "compare-fallback",
        "Compare this to one cross-shop option",
      );
    } else {
      pushUnique(
        out,
        "chassis-generic",
        "Explain how diesel pusher chassis specs work",
      );
      pushUnique(
        out,
        "compare-generic",
        "Compare Freightliner vs Spartan RV chassis",
      );
      pushUnique(
        out,
        "tanks-generic",
        "How holding tanks and payload actually work",
      );
    }
  }

  return out.slice(0, MAX);
}

/** Chips for the last finished assistant reply, or empty. */
export function followUpChipsForThread(
  messages: Array<{
    role: string;
    streaming?: boolean;
    content?: string;
  }>,
): { index: number; chips: FollowUpChip[] } {
  const index = latestFinishedAssistantIndex(messages);
  if (index < 0) return { index: -1, chips: [] };
  return {
    index,
    chips: buildFollowUpChips({
      userText: priorUserText(messages, index),
      assistantText: messages[index].content,
    }),
  };
}
