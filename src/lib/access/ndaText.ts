/**
 * NDA body David edits later.
 *
 * Path: `src/lib/access/ndaText.ts`
 * After changing the legal text in a way that must be re-accepted,
 * increment `NDA_VERSION` so existing devices see the prompt again.
 */
export const NDA_VERSION = 1;

export const NDA_TITLE = "RvFOX Non-Disclosure Agreement";

export const NDA_TEXT = `PLACEHOLDER — replace this text before production use.

This Non-Disclosure Agreement covers confidential information you see in RvFOX, including dealer data, pricing, inventory, prompts, and any materials shown in the suite.

By checking the box and continuing, you agree that:

1. You will not copy, share, publish, or use confidential information outside authorized RvFOX use.
2. Accepting this NDA does not grant access to restricted tools. Grok, save, share, and VIN decode stay locked unless your phone is on the approved list.
3. A request for access never auto-approves. Only an administrator can add a number.
4. David Hansen (or his designee) may update this agreement. A new version may ask you to accept again.

This placeholder is not legal advice. Counsel should replace NDA_TEXT in src/lib/access/ndaText.ts.`;
