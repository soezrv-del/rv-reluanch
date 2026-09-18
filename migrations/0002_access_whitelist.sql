-- Phone whitelist + access requests (RvFOX access gate).
-- Durable Postgres / PGLite schema. Seeded once with RV Country staff numbers.

create table if not exists access_whitelist (
  id           text primary key,
  phone_e164   text not null unique,
  contact_name text not null default '',
  notes        text not null default '',
  invited_at   timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists access_requests (
  id           text primary key,
  phone_e164   text not null,
  contact_name text not null default '',
  note         text not null default '',
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);

create index if not exists access_requests_phone_idx on access_requests (phone_e164);
create index if not exists access_requests_status_idx on access_requests (status);

-- Sentinel so an empty list after admin deletes is NOT re-seeded.
create table if not exists access_seed_meta (
  id         text primary key,
  seeded_at  timestamptz not null default now()
);

insert into access_whitelist (id, phone_e164, contact_name, notes, invited_at, created_at)
values
  ('f9bca54e-8fa9-47e7-b02a-b54564cf7d7b', '+15412858791', 'Mark 2', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('f85519cf-f533-4f87-a9f8-fa7212db4271', '+15415203022', 'Cheri', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('f7706bc2-defc-4c22-9787-e4f556185d95', '+18322761018', 'Shane Dillon', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('f363db1d-9833-4d4a-8863-5240de072cfd', '+17754195470', 'Josh', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('f14672b8-226c-45fa-8c64-48fbd907aab6', '+17022980488', 'Shane Dillon', 'RV Country - Work', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('eb888648-1056-49ea-a3b8-9ce3ff43adb7', '+12532172078', 'Bruce', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('e146cc35-86ad-4525-a5e2-7c2ef2ac4601', '+17753798838', 'Don Slater', '', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('e031d6d2-8529-4931-8a11-34aaa14b540b', '+15035740308', 'Shawn', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('dffdd8b0-32f9-4b2b-a2c8-126cb943d66b', '+15593211829', 'Andy', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('ddb7d383-4024-4261-aa1f-c0a1672e1f7f', '+17753435475', 'Randy', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('dcbfbeb6-57f6-41cb-9bd9-5df2a6c28274', '+17604643466', 'Donkey', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('d7be88a5-d911-44a6-a3df-3ed0396a11e0', '+17025812016', 'Kelly', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('d2bd7ecd-e26d-4d3d-851c-180d13c1a2a8', '+12818137012', 'Jacob', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('c17c54b7-80ea-4d48-847c-2989490266dd', '+17608803347', 'Kathy Underhill', '', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('bb577b73-a8eb-4485-87bc-cf9a2eaa7551', '+15592818110', 'Jorge', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('a663b94e-6aeb-41f3-8f4f-eb20342309e1', '+19516604949', 'Jacob', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('a3946bb0-f674-4d0e-9457-6f7eb89e7def', '+15202622834', 'Kim', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('9fd0f49c-cc3e-410d-b64a-0d001d20dac8', '+12072895958', 'Matt F&I', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('9f55c9b3-cbe4-4bd6-ae55-64286d8c57c5', '+19496377457', 'Justin', 'RV Country Show', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('9a27133d-de37-4036-80a0-e3efd2635525', '+17027134086', 'Nelson', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('99c7640b-e678-41dd-a9a0-eec2c4cff31c', '+17024200793', 'Brett', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('93e63a51-3279-47e6-8a99-4991c39dd31f', '+19283010981', 'Willow', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('916eb8b2-256e-4709-8ed7-f796c803c6c6', '+18583718997', 'Jordan', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('8be8b9be-0e38-4dc3-9461-b31b25a8f0b0', '+15416367878', 'Criss', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('7c47c966-8e24-42b6-baf0-d3eaa3cd2fa2', '+15209771152', 'Bill 2', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('7b732a4a-5c4f-4d4c-8227-8b1819f91a45', '+15127996797', 'Lisa', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('714c830c-46e5-430a-8f63-9627445f34ac', '+12816844257', 'Charlie Power', 'Director of Operations - HWH RV', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('6dd6acd4-f225-4c03-b4da-17534190d24f', '+15415135983', 'Dylan', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('6aa3c49f-7fe1-44dc-a46c-c776070c6655', '+15594861000', 'Samantha', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('68fdf17b-b340-4c9f-a9c4-66b3cb446d8c', '+19253548911', 'Susanne F&I', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('6480c3d6-3f0c-4833-8e2f-d5ae95f7f540', '+15208910111', 'Paul', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('4b011ac5-d941-4966-8b67-ff51a56f633f', '+12086609811', 'Bill', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('2842209a-1fa6-4847-9800-a328d52c896a', '+15596818451', 'Cindy F&I', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('252f368e-8611-4a21-a644-d8ae21bb29dc', '+18557319249', 'Roadside Assistants', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('209ecf13-cce6-454d-ac9d-bf1d5aa443b9', '+19288482454', 'Christian', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('1ef231e2-4e6e-4ed1-8d59-dc92a62e5fff', '+17603339746', 'Renne', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('18b676b1-b8c1-418c-b0ac-b7c5720d41d0', '+15595685254', 'Mike Pageot', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('08a54fd4-1e74-4fd4-bf25-63b7d274636c', '+12086135015', 'Cris', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('07de8c0a-f8d1-4a31-9ebc-b21b8d0ef480', '+15105010468', 'Bo', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('07907c2c-4019-4ce7-80c8-255bca68583f', '+15594862511', 'Samantha', 'RV Country - Other', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('001178ff-c248-4f0e-93e8-3cbd6635ca02', '+15753121921', 'Patrick', 'RV Country', '2026-01-31 22:02:51+00', '2026-01-31 22:02:51+00'),
  ('f710116f-4552-4800-875d-4a016f0f0bb2', '+17022665915', 'David Hansen', '', '2026-01-31 19:36:06+00', '2026-01-31 19:36:06+00')
on conflict (phone_e164) do nothing;

insert into access_seed_meta (id) values ('v1')
on conflict (id) do nothing;
