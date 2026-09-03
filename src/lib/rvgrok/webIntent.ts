/**
 * When chat should fire the xAI web_search sidecar.
 * Kept catalog-free so tests and the sidecar prompt can import it.
 */

export type WebFallbackSpecs = {
  missingHard: boolean;
} | null;

export type WebFallbackOpts = {
  /** Agent mode may browse a bit more often — still skips hi / lifestyle / payment. */
  agentMode?: boolean;
};

const SPEC_QUESTION_RE =
  /\b(hp|horsepower|engine|chassis|torque|transmission|fuel|gvwr|gcwr|uvw|ccc|tow|hitch|mpg|length|weight|spec|brochure|powertrain|godzilla|cummins|f-?53)\b/i;

const LIVE_RESEARCH_RE =
  /\b(troubleshoot(?:ing)?|diagnos(?:e|is|ing)|problems?|issues?|errors?|codes?|alarm|fault|dtc|check[- ]engine|tsb|bulletins?|won'?t\s+start|will\s+not\s+start|doesn'?t\s+start|leaking|leaks?|repair|fix(?:es|ing)?|how\s+do\s+i|how\s+to|why\s+is|why\s+won'?t|why\s+does(?:n'?t)?|what\s+should\s+i\s+(?:check|do|try|inspect)|what(?:'s|\s+is)\s+wrong|manual|owners?\s+manual|service\s+manual|recall|nhtsa|install(?:ing|ation)?|wiring|wires?|fuse|breaker|batter(?:y|ies)|propane|lp\s?gas|lpg|slides?|slide[- ]out|jacks?|level(?:ing|ers?)|generator|genset|inverter|converter|starlink|awning|water\s+heater|furnace|air\s+cond(?:itioner)?|refrigerator|fridge|toilet|black\s+tank|gray\s+tank|fresh\s+water|water\s+pump|short(?:ed|ing)?|overheat(?:ing)?|not\s+working|stopped\s+working|won'?t\s+(?:retract|extend|open|close|work|reset)|will\s+not\s+(?:retract|extend|open|close|work)|stuck|jammed|look(?:\s+(?:this|it))?\s+up|look\s+up|search(?:\s+(?:the\s+)?(?:web|online|forums?))|web\s+search|research|owners?\s+forums?|what\s+do\s+owners|irv2|reddit|common\s+(?:fix|cause|issue|problem)|known\s+(?:issue|problem|recall)|latest\s+(?:tsb|bulletin|recall|fix|firmware))\b/i;

const STRONG_FAULT_RE =
  /\b(troubleshoot|diagnos|error|code|alarm|leak|repair|fix|won'?t|will\s+not|slide|fuse|batter(?:y|ies)|propane|generator|inverter|wiring|tsb|recall|manual|retract|extend)\b/i;

const LIFESTYLE_PITCH_RE =
  /\b(full[- ]?tim(?:e|ing)|snowbird|lifestyle|worth\s+it|vs\.?\s+hotels?|van\s+life|why\s+rv|weekend\s+warrior|retiring\s+on\s+the\s+road|second\s+home)\b/i;

const PAYMENT_MATH_RE =
  /\b(monthly\s+payment|loan\s+payment|apr\b|interest\s+rate|amortiz|out[- ]the[- ]door|\botd\b|financing|payment\s+on\s+\$)\b/i;

const CASUAL_CHAT_RE =
  /^(hi|hey|hello|thanks|thank you|ok|okay|yo|sup|morning|cool|nice|got it|sounds good|good (morning|evening|afternoon))[\s!.]*$/i;

const AGENT_EXTRA_LOOKUP_RE =
  /\b(look(?:\s+(?:this|it))?\s+up|search|research|forum|owners?\s+say|latest|current|compare reviews|what(?:'s|\s+is) the (?:latest|current|word))\b/i;

/** Curly quotes in “won’t” / “how do I” from phones. */
export function normalizeAskText(text: string): string {
  return (text || "").replace(/[\u2018\u2019\u201B\u2032]/g, "'");
}

export function looksLikeSpecQuestion(text: string): boolean {
  return SPEC_QUESTION_RE.test(normalizeAskText(text));
}

/** Lifestyle sell or payment math with no hardware/fault cue. */
export function looksLikePureLifestyleOrPayment(text: string): boolean {
  const t = normalizeAskText(text);
  if (!LIFESTYLE_PITCH_RE.test(t) && !PAYMENT_MATH_RE.test(t)) return false;
  return !STRONG_FAULT_RE.test(t);
}

/** Greetings, thanks, and pitch/payment asks that should not burn a web call. */
export function looksLikeCasualNonResearch(text: string): boolean {
  const t = normalizeAskText(text).trim();
  if (!t) return true;
  if (t.length < 24 && CASUAL_CHAT_RE.test(t)) return true;
  return looksLikePureLifestyleOrPayment(t);
}

/**
 * Troubleshooting, how-to, error codes, TSB/recall research, OEM/forum
 * lookup — anything that needs live web beyond a locked catalog row.
 */
export function looksLikeLiveResearchQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  if (!LIVE_RESEARCH_RE.test(t)) return false;
  if (looksLikePureLifestyleOrPayment(t)) return false;
  return true;
}

/**
 * Web sidecar when the turn needs live OEM / forum / manual notes.
 * Spec questions still browse only when hard fields are missing.
 */
export function needsWebFallback(
  specs: WebFallbackSpecs,
  userText: string,
  opts?: WebFallbackOpts,
): boolean {
  if (looksLikeLiveResearchQuestion(userText)) return true;
  if (looksLikeSpecQuestion(userText)) {
    if (!specs) return true;
    if (specs.missingHard) return true;
  }
  if (
    opts?.agentMode &&
    AGENT_EXTRA_LOOKUP_RE.test(normalizeAskText(userText)) &&
    !looksLikeCasualNonResearch(userText)
  ) {
    return true;
  }
  return false;
}
