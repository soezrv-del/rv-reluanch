-- Admin-only RV Grok browse/research provider override.
-- Missing row = no override (RVGROK_RESEARCH_PROVIDER env, default auto).
-- auto is stored as "no row" so Production stays Gemini when GEMINI_API_KEY is set.

create table if not exists rvgrok_ops_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);
