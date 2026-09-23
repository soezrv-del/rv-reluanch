-- Phone whitelist access gate. Seed is admin-only (David Hansen).
-- Self-service requests live in access_requests and never unlock anyone.

create table if not exists access_whitelist (
  id            text primary key,
  phone_digits  text not null unique,
  phone_e164    text not null unique,
  contact_name  text not null default '',
  notes         text not null default '',
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists access_requests (
  id            text primary key,
  name          text not null default '',
  phone_digits  text not null unique,
  phone_e164    text not null,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

create index if not exists access_whitelist_admin_idx
  on access_whitelist (is_admin);

create index if not exists access_requests_status_idx
  on access_requests (status, created_at desc);

-- Hard admin. Founder KB + report contact + this row are all David Hansen.
insert into access_whitelist (
  id, phone_digits, phone_e164, contact_name, notes, is_admin
) values (
  'admin-david-hansen',
  '7022665918',
  '+17022665918',
  'David Hansen',
  'Hard admin seed — full access, can manage the list',
  true
)
on conflict (phone_digits) do update set
  id = excluded.id,
  phone_e164 = excluded.phone_e164,
  contact_name = excluded.contact_name,
  notes = excluded.notes,
  is_admin = true;
