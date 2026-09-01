/** Agent signature on every RvFOX report / send kit. */
export const REPORT_CONTACT_NAME = "David Hansen";
export const REPORT_CONTACT_PHONE = "702-266-5918";
export const REPORT_CONTACT_TEL = "+17022665918";
export const REPORT_CONTACT_MONOGRAM = REPORT_CONTACT_NAME.split(/\s+/)
  .map((w) => w[0])
  .join("");
export const REPORT_CONTACT_KICKER = "Prepared by";
export const REPORT_CONTACT_LINE = `${REPORT_CONTACT_NAME}\n${REPORT_CONTACT_PHONE}`;
