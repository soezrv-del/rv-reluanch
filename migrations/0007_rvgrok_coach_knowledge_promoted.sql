-- Promote flag: admin can mark a saved coach as official catalog data
-- without rewriting brochure source files.

alter table rvgrok_coach_knowledge
  add column if not exists promoted boolean not null default false;
