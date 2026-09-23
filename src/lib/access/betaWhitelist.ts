import { normalizePhone } from "./phone.ts";

/**
 * Static beta allowlist seed from David's CSV (42 contacts).
 * Normalized to NANP digits + E.164. Does not include hard-admin
 * David Hansen 702-266-5918 — that stays HARD_ADMIN in constants.
 * David Hansen 702-266-5915 is a normal (non-admin) entry.
 */
export type BetaSeedEntry = {
  id: string;
  digits: string;
  e164: string;
  contactName: string;
  notes: string;
};

export const BETA_WHITELIST_SEED: readonly BetaSeedEntry[] = [
  {
    id: "f9bca54e-8fa9-47e7-b02a-b54564cf7d7b",
    digits: "5412858791",
    e164: "+15412858791",
    contactName: "Mark 2",
    notes: "RV Country",
  },
  {
    id: "f85519cf-f533-4f87-a9f8-fa7212db4271",
    digits: "5415203022",
    e164: "+15415203022",
    contactName: "Cheri",
    notes: "RV Country",
  },
  {
    id: "f7706bc2-defc-4c22-9787-e4f556185d95",
    digits: "8322761018",
    e164: "+18322761018",
    contactName: "Shane Dillon",
    notes: "RV Country",
  },
  {
    id: "f363db1d-9833-4d4a-8863-5240de072cfd",
    digits: "7754195470",
    e164: "+17754195470",
    contactName: "Josh",
    notes: "RV Country",
  },
  {
    id: "f14672b8-226c-45fa-8c64-48fbd907aab6",
    digits: "7022980488",
    e164: "+17022980488",
    contactName: "Shane Dillon",
    notes: "RV Country - Work",
  },
  {
    id: "eb888648-1056-49ea-a3b8-9ce3ff43adb7",
    digits: "2532172078",
    e164: "+12532172078",
    contactName: "Bruce",
    notes: "RV Country",
  },
  {
    id: "e146cc35-86ad-4525-a5e2-7c2ef2ac4601",
    digits: "7753798838",
    e164: "+17753798838",
    contactName: "Don Slater",
    notes: "",
  },
  {
    id: "e031d6d2-8529-4931-8a11-34aaa14b540b",
    digits: "5035740308",
    e164: "+15035740308",
    contactName: "Shawn",
    notes: "RV Country",
  },
  {
    id: "dffdd8b0-32f9-4b2b-a2c8-126cb943d66b",
    digits: "5593211829",
    e164: "+15593211829",
    contactName: "Andy",
    notes: "RV Country",
  },
  {
    id: "ddb7d383-4024-4261-aa1f-c0a1672e1f7f",
    digits: "7753435475",
    e164: "+17753435475",
    contactName: "Randy",
    notes: "RV Country",
  },
  {
    id: "dcbfbeb6-57f6-41cb-9bd9-5df2a6c28274",
    digits: "7604643466",
    e164: "+17604643466",
    contactName: "Donkey",
    notes: "RV Country",
  },
  {
    id: "d7be88a5-d911-44a6-a3df-3ed0396a11e0",
    digits: "7025812016",
    e164: "+17025812016",
    contactName: "Kelly",
    notes: "RV Country",
  },
  {
    id: "d2bd7ecd-e26d-4d3d-851c-180d13c1a2a8",
    digits: "2818137012",
    e164: "+12818137012",
    contactName: "Jacob",
    notes: "RV Country",
  },
  {
    id: "c17c54b7-80ea-4d48-847c-2989490266dd",
    digits: "7608803347",
    e164: "+17608803347",
    contactName: "Kathy Underhill",
    notes: "",
  },
  {
    id: "bb577b73-a8eb-4485-87bc-cf9a2eaa7551",
    digits: "5592818110",
    e164: "+15592818110",
    contactName: "Jorge",
    notes: "RV Country",
  },
  {
    id: "a663b94e-6aeb-41f3-8f4f-eb20342309e1",
    digits: "9516604949",
    e164: "+19516604949",
    contactName: "Jacob",
    notes: "RV Country",
  },
  {
    id: "a3946bb0-f674-4d0e-9457-6f7eb89e7def",
    digits: "5202622834",
    e164: "+15202622834",
    contactName: "Kim",
    notes: "RV Country",
  },
  {
    id: "9fd0f49c-cc3e-410d-b64a-0d001d20dac8",
    digits: "2072895958",
    e164: "+12072895958",
    contactName: "Matt F&I",
    notes: "RV Country",
  },
  {
    id: "9f55c9b3-cbe4-4bd6-ae55-64286d8c57c5",
    digits: "9496377457",
    e164: "+19496377457",
    contactName: "Justin",
    notes: "RV Country Show",
  },
  {
    id: "9a27133d-de37-4036-80a0-e3efd2635525",
    digits: "7027134086",
    e164: "+17027134086",
    contactName: "Nelson",
    notes: "RV Country",
  },
  {
    id: "99c7640b-e678-41dd-a9a0-eec2c4cff31c",
    digits: "7024200793",
    e164: "+17024200793",
    contactName: "Brett",
    notes: "RV Country",
  },
  {
    id: "93e63a51-3279-47e6-8a99-4991c39dd31f",
    digits: "9283010981",
    e164: "+19283010981",
    contactName: "Willow",
    notes: "RV Country",
  },
  {
    id: "916eb8b2-256e-4709-8ed7-f796c803c6c6",
    digits: "8583718997",
    e164: "+18583718997",
    contactName: "Jordan",
    notes: "RV Country",
  },
  {
    id: "8be8b9be-0e38-4dc3-9461-b31b25a8f0b0",
    digits: "5416367878",
    e164: "+15416367878",
    contactName: "Criss",
    notes: "RV Country",
  },
  {
    id: "7c47c966-8e24-42b6-baf0-d3eaa3cd2fa2",
    digits: "5209771152",
    e164: "+15209771152",
    contactName: "Bill 2",
    notes: "RV Country",
  },
  {
    id: "7b732a4a-5c4f-4d4c-8227-8b1819f91a45",
    digits: "5127996797",
    e164: "+15127996797",
    contactName: "Lisa",
    notes: "RV Country",
  },
  {
    id: "714c830c-46e5-430a-8f63-9627445f34ac",
    digits: "2816844257",
    e164: "+12816844257",
    contactName: "Charlie Power",
    notes: "Director of Operations - HWH RV",
  },
  {
    id: "6dd6acd4-f225-4c03-b4da-17534190d24f",
    digits: "5415135983",
    e164: "+15415135983",
    contactName: "Dylan",
    notes: "RV Country",
  },
  {
    id: "6aa3c49f-7fe1-44dc-a46c-c776070c6655",
    digits: "5594861000",
    e164: "+15594861000",
    contactName: "Samantha",
    notes: "RV Country",
  },
  {
    id: "68fdf17b-b340-4c9f-a9c4-66b3cb446d8c",
    digits: "9253548911",
    e164: "+19253548911",
    contactName: "Susanne F&I",
    notes: "RV Country",
  },
  {
    id: "6480c3d6-3f0c-4833-8e2f-d5ae95f7f540",
    digits: "5208910111",
    e164: "+15208910111",
    contactName: "Paul",
    notes: "RV Country",
  },
  {
    id: "4b011ac5-d941-4966-8b67-ff51a56f633f",
    digits: "2086609811",
    e164: "+12086609811",
    contactName: "Bill",
    notes: "RV Country",
  },
  {
    id: "2842209a-1fa6-4847-9800-a328d52c896a",
    digits: "5596818451",
    e164: "+15596818451",
    contactName: "Cindy F&I",
    notes: "RV Country",
  },
  {
    id: "252f368e-8611-4a21-a644-d8ae21bb29dc",
    digits: "8557319249",
    e164: "+18557319249",
    contactName: "Roadside Assistants",
    notes: "RV Country",
  },
  {
    id: "209ecf13-cce6-454d-ac9d-bf1d5aa443b9",
    digits: "9288482454",
    e164: "+19288482454",
    contactName: "Christian",
    notes: "RV Country",
  },
  {
    id: "1ef231e2-4e6e-4ed1-8d59-dc92a62e5fff",
    digits: "7603339746",
    e164: "+17603339746",
    contactName: "Renne",
    notes: "RV Country",
  },
  {
    id: "18b676b1-b8c1-418c-b0ac-b7c5720d41d0",
    digits: "5595685254",
    e164: "+15595685254",
    contactName: "Mike Pageot",
    notes: "RV Country",
  },
  {
    id: "08a54fd4-1e74-4fd4-bf25-63b7d274636c",
    digits: "2086135015",
    e164: "+12086135015",
    contactName: "Cris",
    notes: "RV Country",
  },
  {
    id: "07de8c0a-f8d1-4a31-9ebc-b21b8d0ef480",
    digits: "5105010468",
    e164: "+15105010468",
    contactName: "Bo",
    notes: "RV Country",
  },
  {
    id: "07907c2c-4019-4ce7-80c8-255bca68583f",
    digits: "5594862511",
    e164: "+15594862511",
    contactName: "Samantha",
    notes: "RV Country - Other",
  },
  {
    id: "001178ff-c248-4f0e-93e8-3cbd6635ca02",
    digits: "5753121921",
    e164: "+15753121921",
    contactName: "Patrick",
    notes: "RV Country",
  },
  {
    id: "f710116f-4552-4800-875d-4a016f0f0bb2",
    digits: "7022665915",
    e164: "+17022665915",
    contactName: "David Hansen",
    notes: "",
  },
];

const byDigits = new Map(
  BETA_WHITELIST_SEED.map((entry) => [entry.digits, entry]),
);
const byE164 = new Map(
  BETA_WHITELIST_SEED.map((entry) => [entry.e164, entry]),
);

/** Look up a seeded beta tester by any common US phone form. */
export function findBetaSeed(raw: string): BetaSeedEntry | null {
  const n = normalizePhone(raw);
  if (!n) return null;
  return byDigits.get(n.digits) ?? byE164.get(n.e164) ?? null;
}

export function isBetaSeedPhone(raw: string): boolean {
  return findBetaSeed(raw) != null;
}
