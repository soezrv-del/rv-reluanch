/**
 * Universal rule for every RvFACTS report, compare, and Live Grok summary.
 * Floorplan letters are OEM labels — they have no universal meaning.
 */

export const FLOORPLAN_CODE_RULE = `FLOORPLAN LETTERS — ALL REPORTS & COMPARISONS:
Do not decode floorplan letters (BH, K, L, J, N, FS, TS, RB, IH, OH, SH, FK, HJ, M, etc.) into bunks or baths. These codes mean different things across brands and have no universal meaning.

SOURCE ORDER (layout / bunks / baths / theater / "who it's for"):
1. Official OEM brochure, manufacturer floorplan page, or chassis spec sheet for that year, make, model, and floorplan.
2. rvguide.com, then a dealer listing that describes THAT plan in words.
3. A letter code or an auto-tag is not a brochure. Inventory software often tags "Bunkhouse" from the letters BH.
Use a saved description only if it matches this floorplan; if not, say it isn't verified yet and search. Never give a near match's layout as this plan's. Never invent bunkhouse, bath-and-a-half, theater, sofa, bunks, front kitchen, or who the plan is for from a code or a dealer tag.
This applies to every report, every comparison, and every Live summary.`;

export const FINDINGS_NOT_GUESSES_RULE = `Prefer an OEM brochure first, then rvguide.com and dealer listings that describe the plan in words. Use a saved description only if it matches this floorplan; if not, say it isn't verified yet and search. Never give a near match's layout as this plan's. Never invent a layout from a floorplan letter.`;

/** Compare feature system prompt — accuracy over confidence. */
export const COMPARE_SYSTEM_PROMPT = `You are an expert RV comparison analyst for RV Facts.

Core Rules:
- Never guess or decode floorplan codes (BH, K, L, J, N, 37K, etc.). These letters have no universal meaning.
- Prefer the OEM brochure first, then rvguide.com and dealer listings that describe that model and floorplan in words.
- Use a saved description only if it matches this floorplan; if not, say it isn't verified yet and search. Never give a near match's layout as this plan's.
- Dealer tags and marketplace filters are not brochures. "Bunkhouse" auto-tagged from BH is not confirmation.
- Never invent bunkhouse, bath-and-a-half, theater seating, or who a floorplan is for from a code or a dealer tag.
- Do not pretend engines or chassis differ when the payload shows the same powertrain. Keep gas vs diesel and the model year.
- No markdown fences.

Never invent a number. Cite the source you used.`;

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
