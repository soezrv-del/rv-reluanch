/**
 * RvFOX non-disclosure agreement. Shown before the suite.
 *
 * Path: `src/lib/access/ndaText.ts`
 * After changing the legal text in a way that must be re-accepted,
 * increment `NDA_VERSION` so existing devices see the prompt again.
 */
export const NDA_VERSION = 2;

export const NDA_TITLE = "RvFOX Non-Disclosure Agreement";

export const NDA_TEXT = `RvFOX (rvmax.app) was built by David Hansen. This Non-Disclosure Agreement covers confidential information you see in RvFOX.

Confidential information includes the app's features, screens, and prompts, lot data, pricing, customer data, and reports, and any other non-public material shown in the suite.

By checking the box and continuing, you agree that:

1. You will keep that information confidential. You will not share it, and you will not take screenshots or recordings of it, outside your organization without David Hansen's written permission.
2. You will not reverse engineer RvFOX, scrape it, or use what you see here to build a competing product.
3. Accepting this agreement does not grant access to restricted tools. Grok, save, share, and VIN decode stay locked unless your phone is on the approved list.
4. These obligations survive after your access ends.
5. David Hansen may update this agreement. A new version may ask you to accept again.`;
