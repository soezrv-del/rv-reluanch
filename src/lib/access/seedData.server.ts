/**
 * Server-only seed rows (same CSV as data/phone-whitelist-seed.csv).
 * Used when access_seed_meta is missing (fresh PGLite / first admin call).
 */
export type AccessSeedRow = {
  id: string;
  phoneE164: string;
  contactName: string;
  notes: string;
  invitedAt: string;
  createdAt: string;
};

export const ACCESS_WHITELIST_SEED: AccessSeedRow[] = [
  {
    "id": "f9bca54e-8fa9-47e7-b02a-b54564cf7d7b",
    "phoneE164": "+15412858791",
    "contactName": "Mark 2",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "f85519cf-f533-4f87-a9f8-fa7212db4271",
    "phoneE164": "+15415203022",
    "contactName": "Cheri",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "f7706bc2-defc-4c22-9787-e4f556185d95",
    "phoneE164": "+18322761018",
    "contactName": "Shane Dillon",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "f363db1d-9833-4d4a-8863-5240de072cfd",
    "phoneE164": "+17754195470",
    "contactName": "Josh",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "f14672b8-226c-45fa-8c64-48fbd907aab6",
    "phoneE164": "+17022980488",
    "contactName": "Shane Dillon",
    "notes": "RV Country - Work",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "eb888648-1056-49ea-a3b8-9ce3ff43adb7",
    "phoneE164": "+12532172078",
    "contactName": "Bruce",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "e146cc35-86ad-4525-a5e2-7c2ef2ac4601",
    "phoneE164": "+17753798838",
    "contactName": "Don Slater",
    "notes": "",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "e031d6d2-8529-4931-8a11-34aaa14b540b",
    "phoneE164": "+15035740308",
    "contactName": "Shawn",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "dffdd8b0-32f9-4b2b-a2c8-126cb943d66b",
    "phoneE164": "+15593211829",
    "contactName": "Andy",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "ddb7d383-4024-4261-aa1f-c0a1672e1f7f",
    "phoneE164": "+17753435475",
    "contactName": "Randy",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "dcbfbeb6-57f6-41cb-9bd9-5df2a6c28274",
    "phoneE164": "+17604643466",
    "contactName": "Donkey",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "d7be88a5-d911-44a6-a3df-3ed0396a11e0",
    "phoneE164": "+17025812016",
    "contactName": "Kelly",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "d2bd7ecd-e26d-4d3d-851c-180d13c1a2a8",
    "phoneE164": "+12818137012",
    "contactName": "Jacob",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "c17c54b7-80ea-4d48-847c-2989490266dd",
    "phoneE164": "+17608803347",
    "contactName": "Kathy Underhill",
    "notes": "",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "bb577b73-a8eb-4485-87bc-cf9a2eaa7551",
    "phoneE164": "+15592818110",
    "contactName": "Jorge",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "a663b94e-6aeb-41f3-8f4f-eb20342309e1",
    "phoneE164": "+19516604949",
    "contactName": "Jacob",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "a3946bb0-f674-4d0e-9457-6f7eb89e7def",
    "phoneE164": "+15202622834",
    "contactName": "Kim",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "9fd0f49c-cc3e-410d-b64a-0d001d20dac8",
    "phoneE164": "+12072895958",
    "contactName": "Matt F&I",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "9f55c9b3-cbe4-4bd6-ae55-64286d8c57c5",
    "phoneE164": "+19496377457",
    "contactName": "Justin",
    "notes": "RV Country Show",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "9a27133d-de37-4036-80a0-e3efd2635525",
    "phoneE164": "+17027134086",
    "contactName": "Nelson",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "99c7640b-e678-41dd-a9a0-eec2c4cff31c",
    "phoneE164": "+17024200793",
    "contactName": "Brett",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "93e63a51-3279-47e6-8a99-4991c39dd31f",
    "phoneE164": "+19283010981",
    "contactName": "Willow",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "916eb8b2-256e-4709-8ed7-f796c803c6c6",
    "phoneE164": "+18583718997",
    "contactName": "Jordan",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "8be8b9be-0e38-4dc3-9461-b31b25a8f0b0",
    "phoneE164": "+15416367878",
    "contactName": "Criss",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "7c47c966-8e24-42b6-baf0-d3eaa3cd2fa2",
    "phoneE164": "+15209771152",
    "contactName": "Bill 2",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "7b732a4a-5c4f-4d4c-8227-8b1819f91a45",
    "phoneE164": "+15127996797",
    "contactName": "Lisa",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "714c830c-46e5-430a-8f63-9627445f34ac",
    "phoneE164": "+12816844257",
    "contactName": "Charlie Power",
    "notes": "Director of Operations - HWH RV",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "6dd6acd4-f225-4c03-b4da-17534190d24f",
    "phoneE164": "+15415135983",
    "contactName": "Dylan",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "6aa3c49f-7fe1-44dc-a46c-c776070c6655",
    "phoneE164": "+15594861000",
    "contactName": "Samantha",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "68fdf17b-b340-4c9f-a9c4-66b3cb446d8c",
    "phoneE164": "+19253548911",
    "contactName": "Susanne F&I",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "6480c3d6-3f0c-4833-8e2f-d5ae95f7f540",
    "phoneE164": "+15208910111",
    "contactName": "Paul",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "4b011ac5-d941-4966-8b67-ff51a56f633f",
    "phoneE164": "+12086609811",
    "contactName": "Bill",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "2842209a-1fa6-4847-9800-a328d52c896a",
    "phoneE164": "+15596818451",
    "contactName": "Cindy F&I",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "252f368e-8611-4a21-a644-d8ae21bb29dc",
    "phoneE164": "+18557319249",
    "contactName": "Roadside Assistants",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "209ecf13-cce6-454d-ac9d-bf1d5aa443b9",
    "phoneE164": "+19288482454",
    "contactName": "Christian",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "1ef231e2-4e6e-4ed1-8d59-dc92a62e5fff",
    "phoneE164": "+17603339746",
    "contactName": "Renne",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "18b676b1-b8c1-418c-b0ac-b7c5720d41d0",
    "phoneE164": "+15595685254",
    "contactName": "Mike Pageot",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "08a54fd4-1e74-4fd4-bf25-63b7d274636c",
    "phoneE164": "+12086135015",
    "contactName": "Cris",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "07de8c0a-f8d1-4a31-9ebc-b21b8d0ef480",
    "phoneE164": "+15105010468",
    "contactName": "Bo",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "07907c2c-4019-4ce7-80c8-255bca68583f",
    "phoneE164": "+15594862511",
    "contactName": "Samantha",
    "notes": "RV Country - Other",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "001178ff-c248-4f0e-93e8-3cbd6635ca02",
    "phoneE164": "+15753121921",
    "contactName": "Patrick",
    "notes": "RV Country",
    "invitedAt": "2026-01-31T22:02:51Z",
    "createdAt": "2026-01-31T22:02:51Z"
  },
  {
    "id": "f710116f-4552-4800-875d-4a016f0f0bb2",
    "phoneE164": "+17022665915",
    "contactName": "David Hansen",
    "notes": "",
    "invitedAt": "2026-01-31T19:36:06Z",
    "createdAt": "2026-01-31T19:36:06Z"
  }
];
