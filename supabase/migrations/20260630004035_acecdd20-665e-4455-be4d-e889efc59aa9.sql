ALTER TABLE public.accesos
  ADD COLUMN IF NOT EXISTS es_permanente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dias_semana smallint[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hora_inicio time,
  ADD COLUMN IF NOT EXISTS hora_fin time;