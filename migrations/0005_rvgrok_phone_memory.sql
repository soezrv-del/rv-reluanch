-- Per-unlocked-phone RV Grok memory. Key is the same digits as the whitelist.
-- Never share rows across phones. Visitors without unlock never write here.

create table if not exists rvgrok_phone_memory (
  phone_digits     text primary key,
  profile_summary  text not null default '',
  digests          jsonb not null default '[]'::jsonb,
  updated_at       timestamptz not null default now()
);
