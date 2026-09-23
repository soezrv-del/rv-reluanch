-- Shared RV Grok compounding coach knowledge (everyone, not per-phone).
-- Key is the same desk lock tuple: year + make + model + floorplan.
-- Server-side research path only. Unowned shared rows.
-- Brochure SoT remains rvData / catalog load. This is a research sidecar.

create table if not exists rvgrok_coach_knowledge (
  year            text not null,
  make            text not null,
  model           text not null,
  floorplan       text not null default '',
  fields          jsonb not null default '{}'::jsonb,
  sources         jsonb not null default '[]'::jsonb,
  researched_at   timestamptz not null default now(),
  confidence      text not null default 'medium',
  schema_version  integer not null default 1,
  updated_at      timestamptz not null default now(),
  primary key (year, make, model, floorplan)
);
