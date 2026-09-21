-- Static beta allowlist seed (42 CSV contacts).
-- Does not include hard-admin David Hanson 702-266-5918.
-- On conflict, refresh name/notes only — never flip is_admin.

insert into access_whitelist (
  id, phone_digits, phone_e164, contact_name, notes, is_admin
) values
  (
    'f9bca54e-8fa9-47e7-b02a-b54564cf7d7b',
    '5412858791',
    '+15412858791',
    'Mark 2',
    'RV Country',
    false
  ),
  (
    'f85519cf-f533-4f87-a9f8-fa7212db4271',
    '5415203022',
    '+15415203022',
    'Cheri',
    'RV Country',
    false
  ),
  (
    'f7706bc2-defc-4c22-9787-e4f556185d95',
    '8322761018',
    '+18322761018',
    'Shane Dillon',
    'RV Country',
    false
  ),
  (
    'f363db1d-9833-4d4a-8863-5240de072cfd',
    '7754195470',
    '+17754195470',
    'Josh',
    'RV Country',
    false
  ),
  (
    'f14672b8-226c-45fa-8c64-48fbd907aab6',
    '7022980488',
    '+17022980488',
    'Shane Dillon',
    'RV Country - Work',
    false
  ),
  (
    'eb888648-1056-49ea-a3b8-9ce3ff43adb7',
    '2532172078',
    '+12532172078',
    'Bruce',
    'RV Country',
    false
  ),
  (
    'e146cc35-86ad-4525-a5e2-7c2ef2ac4601',
    '7753798838',
    '+17753798838',
    'Don Slater',
    '',
    false
  ),
  (
    'e031d6d2-8529-4931-8a11-34aaa14b540b',
    '5035740308',
    '+15035740308',
    'Shawn',
    'RV Country',
    false
  ),
  (
    'dffdd8b0-32f9-4b2b-a2c8-126cb943d66b',
    '5593211829',
    '+15593211829',
    'Andy',
    'RV Country',
    false
  ),
  (
    'ddb7d383-4024-4261-aa1f-c0a1672e1f7f',
    '7753435475',
    '+17753435475',
    'Randy',
    'RV Country',
    false
  ),
  (
    'dcbfbeb6-57f6-41cb-9bd9-5df2a6c28274',
    '7604643466',
    '+17604643466',
    'Donkey',
    'RV Country',
    false
  ),
  (
    'd7be88a5-d911-44a6-a3df-3ed0396a11e0',
    '7025812016',
    '+17025812016',
    'Kelly',
    'RV Country',
    false
  ),
  (
    'd2bd7ecd-e26d-4d3d-851c-180d13c1a2a8',
    '2818137012',
    '+12818137012',
    'Jacob',
    'RV Country',
    false
  ),
  (
    'c17c54b7-80ea-4d48-847c-2989490266dd',
    '7608803347',
    '+17608803347',
    'Kathy Underhill',
    '',
    false
  ),
  (
    'bb577b73-a8eb-4485-87bc-cf9a2eaa7551',
    '5592818110',
    '+15592818110',
    'Jorge',
    'RV Country',
    false
  ),
  (
    'a663b94e-6aeb-41f3-8f4f-eb20342309e1',
    '9516604949',
    '+19516604949',
    'Jacob',
    'RV Country',
    false
  ),
  (
    'a3946bb0-f674-4d0e-9457-6f7eb89e7def',
    '5202622834',
    '+15202622834',
    'Kim',
    'RV Country',
    false
  ),
  (
    '9fd0f49c-cc3e-410d-b64a-0d001d20dac8',
    '2072895958',
    '+12072895958',
    'Matt F&I',
    'RV Country',
    false
  ),
  (
    '9f55c9b3-cbe4-4bd6-ae55-64286d8c57c5',
    '9496377457',
    '+19496377457',
    'Justin',
    'RV Country Show',
    false
  ),
  (
    '9a27133d-de37-4036-80a0-e3efd2635525',
    '7027134086',
    '+17027134086',
    'Nelson',
    'RV Country',
    false
  ),
  (
    '99c7640b-e678-41dd-a9a0-eec2c4cff31c',
    '7024200793',
    '+17024200793',
    'Brett',
    'RV Country',
    false
  ),
  (
    '93e63a51-3279-47e6-8a99-4991c39dd31f',
    '9283010981',
    '+19283010981',
    'Willow',
    'RV Country',
    false
  ),
  (
    '916eb8b2-256e-4709-8ed7-f796c803c6c6',
    '8583718997',
    '+18583718997',
    'Jordan',
    'RV Country',
    false
  ),
  (
    '8be8b9be-0e38-4dc3-9461-b31b25a8f0b0',
    '5416367878',
    '+15416367878',
    'Criss',
    'RV Country',
    false
  ),
  (
    '7c47c966-8e24-42b6-baf0-d3eaa3cd2fa2',
    '5209771152',
    '+15209771152',
    'Bill 2',
    'RV Country',
    false
  ),
  (
    '7b732a4a-5c4f-4d4c-8227-8b1819f91a45',
    '5127996797',
    '+15127996797',
    'Lisa',
    'RV Country',
    false
  ),
  (
    '714c830c-46e5-430a-8f63-9627445f34ac',
    '2816844257',
    '+12816844257',
    'Charlie Power',
    'Director of Operations - HWH RV',
    false
  ),
  (
    '6dd6acd4-f225-4c03-b4da-17534190d24f',
    '5415135983',
    '+15415135983',
    'Dylan',
    'RV Country',
    false
  ),
  (
    '6aa3c49f-7fe1-44dc-a46c-c776070c6655',
    '5594861000',
    '+15594861000',
    'Samantha',
    'RV Country',
    false
  ),
  (
    '68fdf17b-b340-4c9f-a9c4-66b3cb446d8c',
    '9253548911',
    '+19253548911',
    'Susanne F&I',
    'RV Country',
    false
  ),
  (
    '6480c3d6-3f0c-4833-8e2f-d5ae95f7f540',
    '5208910111',
    '+15208910111',
    'Paul',
    'RV Country',
    false
  ),
  (
    '4b011ac5-d941-4966-8b67-ff51a56f633f',
    '2086609811',
    '+12086609811',
    'Bill',
    'RV Country',
    false
  ),
  (
    '2842209a-1fa6-4847-9800-a328d52c896a',
    '5596818451',
    '+15596818451',
    'Cindy F&I',
    'RV Country',
    false
  ),
  (
    '252f368e-8611-4a21-a644-d8ae21bb29dc',
    '8557319249',
    '+18557319249',
    'Roadside Assistants',
    'RV Country',
    false
  ),
  (
    '209ecf13-cce6-454d-ac9d-bf1d5aa443b9',
    '9288482454',
    '+19288482454',
    'Christian',
    'RV Country',
    false
  ),
  (
    '1ef231e2-4e6e-4ed1-8d59-dc92a62e5fff',
    '7603339746',
    '+17603339746',
    'Renne',
    'RV Country',
    false
  ),
  (
    '18b676b1-b8c1-418c-b0ac-b7c5720d41d0',
    '5595685254',
    '+15595685254',
    'Mike Pageot',
    'RV Country',
    false
  ),
  (
    '08a54fd4-1e74-4fd4-bf25-63b7d274636c',
    '2086135015',
    '+12086135015',
    'Cris',
    'RV Country',
    false
  ),
  (
    '07de8c0a-f8d1-4a31-9ebc-b21b8d0ef480',
    '5105010468',
    '+15105010468',
    'Bo',
    'RV Country',
    false
  ),
  (
    '07907c2c-4019-4ce7-80c8-255bca68583f',
    '5594862511',
    '+15594862511',
    'Samantha',
    'RV Country - Other',
    false
  ),
  (
    '001178ff-c248-4f0e-93e8-3cbd6635ca02',
    '5753121921',
    '+15753121921',
    'Patrick',
    'RV Country',
    false
  ),
  (
    'f710116f-4552-4800-875d-4a016f0f0bb2',
    '7022665915',
    '+17022665915',
    'David Hansen',
    '',
    false
  )
on conflict (phone_digits) do update set
  phone_e164 = excluded.phone_e164,
  contact_name = excluded.contact_name,
  notes = excluded.notes;
