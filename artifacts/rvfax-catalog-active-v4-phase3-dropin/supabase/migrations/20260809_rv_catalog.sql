-- RVFAX Catalog tables for daily active updates
-- Run this once on the Supabase / OnSpace project.

CREATE TABLE IF NOT EXISTS public.rv_catalog (
  id            bigserial PRIMARY KEY,
  make          text NOT NULL,
  model         text NOT NULL,
  year_start    integer,
  year_end      integer,
  type          text,
  floorplans    jsonb DEFAULT '[]'::jsonb,
  length_range  integer[],
  weight_range  integer[],
  msrp_range    integer[],
  engine        text,
  chassis       text,
  fuel_type     text,
  description   text,
  source        text DEFAULT 'manual',
  data          jsonb,
  updated_at    timestamptz DEFAULT now(),
  last_synced_at timestamptz,
  UNIQUE (make, model)
);

CREATE INDEX IF NOT EXISTS idx_rv_catalog_make ON public.rv_catalog (make);
CREATE INDEX IF NOT EXISTS idx_rv_catalog_year ON public.rv_catalog (year_start);

CREATE TABLE IF NOT EXISTS public.catalog_sync_logs (
  id        bigserial PRIMARY KEY,
  ran_at    timestamptz DEFAULT now(),
  summary   jsonb
);

-- Optional helper RPC (call from the Edge Function)
CREATE OR REPLACE FUNCTION public.ensure_rv_catalog_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Table already created by migration; this is a no-op safety check
  PERFORM 1 FROM public.rv_catalog LIMIT 1;
END;
$$;

-- Example cron (pg_cron extension, if available on the host):
-- SELECT cron.schedule(
--   'rvfax-catalog-daily',
--   '0 6 * * *',   -- 06:00 UTC daily
--   $$
--   SELECT net.http_post(
--     url := 'https://rtlqkunyokumxrdwrtlq.backend.onspace.ai/functions/v1/catalog-sync',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );
