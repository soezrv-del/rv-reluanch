/**
 * Official CARFAX vs RvFOX standing — source: David Hansen.
 * Complements, not substitutes. Never invent a CARFAX-scale ledger.
 * Never say RvFOX replaces CARFAX.
 */

export const CARFAX_PRODUCT = "CARFAX";
export const CARFAX_PROOF_CAMPAIGN = "07V031000";
export const CARFAX_PROOF_COMPONENT = "Dometic two-door fridge boiler-tube fire";
export const CARFAX_PROOF_UNITS = "~2406 Country Coach";

/**
 * Compact standing facts — always in chat / agent / voice system prompts
 * so "Carfax for Motorhomes" cannot become a 40-year-ledger overclaim.
 */
export const CARFAX_VS_RVFOX = `CARFAX VS RVFOX (standing knowledge — never overclaim):
${CARFAX_PRODUCT} is a great chassis / title / wreck ledger and a lousy motorhome buying tool.
A motorhome is two-stage: chassis (Ford / Freightliner / Spartan) vs coach (Winnebago / Tiffin / Newmar). CARFAX was built for the first half. The money and the grief live in the second.
RvFOX answers: should I buy this coach at this price with this truck in this state — specs, NHTSA recalls/complaints, equipment campaigns a chassis VIN misses, asking prices, 50-state payment, tow, Grok.
Complements, not substitutes. Honest stack: (1) CARFAX / RVchex for title + wrecks (2) RvFOX for coach / price / payment / tow (3) a paid inspection for water / structure.
Proof: NHTSA ${CARFAX_PROOF_CAMPAIGN} ${CARFAX_PROOF_COMPONENT} (${CARFAX_PROOF_UNITS}) — a chassis VIN can show 0 recalls with an open fire risk.
"Carfax for Motorhomes" is a good metaphor. It is an OVERCLAIM if it implies a 40-year event ledger. Never invent CARFAX-scale history. Never say RvFOX replaces CARFAX.
When they ask CARFAX / Carfax for motorhomes / vs CARFAX: tell this. Do not volunteer a CARFAX lecture on a spec, payment, or tow ask.`;

/**
 * Full positioning — inject when the ask mentions CARFAX / Carfax for
 * motorhomes / vs CARFAX. Source of truth this turn. No web search.
 */
export const CARFAX_POSITIONING = `A motorhome is two machines bolted together.

CARFAX is a great chassis / title / wreck ledger and a lousy motorhome buying tool.

The chassis is a Ford, a Freightliner, a Spartan. Title. Wrecks. Odometer. That is a car problem. CARFAX is great at car problems.

The coach is a Winnebago, a Tiffin, a Newmar. Water. Structure. Equipment campaigns. Asking price. Payment in this state. Whether the truck can tow it. That is where the money and the grief live. CARFAX was not built for that half.

RvFOX answers the buy question: should I buy this coach at this price with this truck in this state. Specs. NHTSA recalls and complaints. Equipment campaigns a chassis VIN misses. Asking prices. 50-state payment. Tow. Grok.

They complement. They do not substitute. Complements, not substitutes.

Honest stack:
1) CARFAX or RVchex for title and wrecks
2) RvFOX for coach, price, payment, and tow
3) A paid inspection for water and structure

Proof: NHTSA ${CARFAX_PROOF_CAMPAIGN} — ${CARFAX_PROOF_COMPONENT}. ${CARFAX_PROOF_UNITS} units. A chassis VIN can show zero recalls and still have an open fire risk in the coach.

"Carfax for Motorhomes" is a good metaphor. It is an OVERCLAIM if it implies a 40-year event ledger. Never invent CARFAX-scale history. Never say RvFOX replaces CARFAX.`;

export const CARFAX_POSITIONING_BLOCK = `OFFICIAL CARFAX VS RVFOX (source of truth this turn — you KNOW this):
${CARFAX_VS_RVFOX}

${CARFAX_POSITIONING}

Answer from this block — no web search, no stall. Complements, not substitutes. Never invent CARFAX-scale history. Never say RvFOX replaces CARFAX.`;

const CARFAX_ASK_RE = /\bcar[\s-]?fax\b/i;

function normCarfaxAsk(text: string): string {
  return (text || "").replace(/[\u2018\u2019\u201B\u2032]/g, "'");
}

/** CARFAX / Carfax for motorhomes / vs CARFAX — standing answer, never a catalog miss. */
export function looksLikeCarfaxQuestion(text: string): boolean {
  const t = normCarfaxAsk(text).trim();
  if (!t) return false;
  return CARFAX_ASK_RE.test(t);
}

export function formatCarfaxGroundingBlock(): string {
  return CARFAX_POSITIONING_BLOCK;
}
