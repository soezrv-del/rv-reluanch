/**
 * Universal rule for every RvFACTS report, compare, and Live Grok summary.
 * Floorplan letters are OEM labels — they have no universal meaning.
 */

export const FLOORPLAN_CODE_RULE = `NEW RULE (non-negotiable) — ALL REPORTS & COMPARISONS:
Stop decoding or assuming anything from floorplan letters (BH, K, L, J, N, FS, TS, RB, IH, OH, SH, FK, HJ, M, etc.). These codes mean different things across brands and have no universal meaning.

SOURCE RANK (layout / bunks / baths / theater / "who it's for"):
1. Official OEM brochure, manufacturer floorplan page, or chassis spec sheet for THAT year + make + model + floorplan.
2. Manufacturer blog / "floor plan spotlight" that describes THAT plan in words.
3. Dealer or marketplace copy is NOT proof. Inventory software often auto-tags "Bunkhouse" from the letters BH. RV Trader / dealer filters are labels, not brochures.
Grok may only describe a floorplan using words that actually appear in (1) or (2).
If those words are not found, you MUST say "Layout details unconfirmed" — never guess bunkhouse, bath-and-a-half, theater, sofa, bunks, front kitchen, or who the plan is for from a code or from a dealer tag.
This applies to every report, every comparison, and every Live summary.`;

export const FINDINGS_NOT_GUESSES_RULE = `Rely on what you actually find (OEM page, brochure language, spec table, listing description). If a layout fact is not in those sources, write "Layout details unconfirmed". Do not assume.`;

/** Compare feature system prompt — accuracy over confidence. */
export const COMPARE_SYSTEM_PROMPT = `You are an expert RV comparison analyst for RV Facts. Your only job is to be extremely accurate and conservative.

Core Rules:
- Never guess or decode floorplan codes (BH, K, L, J, N, 37K, etc.). These letters have no universal meaning.
- Only describe layouts using exact words found in the official brochure, manufacturer description, or verified listing for that specific model and floorplan.
- Dealer tags and marketplace filters are not brochures. "Bunkhouse" auto-tagged from BH is not confirmation.
- If you cannot find clear confirmation of bunkhouse, bath-and-a-half, theater seating, etc., you must say "Layout details unconfirmed".
- Never invent who a floorplan is 'best for' based on guessed layouts.
- Clearly separate what is confirmed from what is not.
- Prioritize accuracy over sounding confident. It is better to say something is unconfirmed than to be wrong.
- Do not pretend engines or chassis differ when the payload shows the same powertrain.
- No markdown fences.

Be precise, factual, and trustworthy. When in doubt, be conservative.`;

const LAYOUT_CLAIMS: Array<{ re: RegExp; need: RegExp; label: string }> = [
  {
    re: /\b(true\s+)?bunkhouses?\b|\bdedicated bunks\b|\bbunk room\b|\bbunkhouse floorplan\b/gi,
    need: /\bbunk/i,
    label: "bunkhouse",
  },
  {
    re: /\bbath[-\s]?and[-\s]?a[-\s]?half\b|\bhalf[-\s]?bath\b|\bbath and a half\b/gi,
    need: /\bbath|half/i,
    label: "bath-and-a-half",
  },
  {
    re: /\b(power\s+)?theater seating\b|\btheatre seating\b/gi,
    need: /\btheat(?:er|re)/i,
    label: "theater",
  },
];

const UNCONFIRMED = "Layout details unconfirmed";

/** Drop layout tropes that were not verified in brochure/catalog notes. */
export function sanitizeUnverifiedLayout(
  text: string | null | undefined,
  verifiedNotes: Array<string | null | undefined> = [],
): string {
  const raw = (text || "").trim();
  if (!raw) return "";
  const verified = verifiedNotes.filter(Boolean).join(" ");
  let out = raw;
  let hit = false;
  for (const claim of LAYOUT_CLAIMS) {
    if (claim.need.test(verified)) continue;
    if (claim.re.test(out)) {
      hit = true;
      out = out.replace(claim.re, UNCONFIRMED);
    }
  }
  if (hit && !/layout details unconfirmed/i.test(raw)) {
    out = `${out.trim()}\n\n${UNCONFIRMED} — floorplan letters are labels only; use the OEM brochure.`;
  }
  return out.replace(/(Layout details unconfirmed(?: — floorplan letters are labels only; use the OEM brochure\.)?\s*){2,}/gi, `${UNCONFIRMED}. `);
}

export function unverifiedLayoutLabel(
  verifiedNote?: string | null,
): string {
  const n = (verifiedNote || "").trim();
  return n || UNCONFIRMED;
}
