ALTER TABLE public.condominios
  ADD COLUMN IF NOT EXISTS cuota_modo text NOT NULL DEFAULT 'fijo',
  ADD COLUMN IF NOT EXISTS cuota_por_m2 numeric NOT NULL DEFAULT 0;