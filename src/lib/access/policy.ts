/**
 * Browse vs functional line for the phone whitelist gate.
 *
 * Anyone may look around. Only E.164 numbers on `access_whitelist`
 * may mutate or spend paid / pro tools. Separate from professional tier
 * (`proEntitlement.ts`) and from Stripe / IAP.
 */
export const ACCESS_POLICY = {
  browse: [
    "Facts catalog search, reports, and landing",
    "Cal payment math and lender list (local calculator — no submit gate)",
    "Tow catalog browse and local match",
    "RV GPS map browse",
    "More / Premium, help, legal, NHTSA recall lookup",
    "Read Grok history already on this device",
  ],
  functional: [
    "Save / unsave RVs (manual heart)",
    "Compare add / run",
    "Sold book (tab, sell, delete) — still also requires professional tier",
    "Grok send (chat stream, live-voice token, web research)",
    "VIN decode (NHTSA proxy)",
  ],
  skippedWhenDenied: [
    "Motorhome auto-save on Facts report open (silent — browse stays browse)",
  ],
} as const;
