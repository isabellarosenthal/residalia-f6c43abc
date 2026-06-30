
ALTER TABLE public.areas_comunes
  ADD COLUMN IF NOT EXISTS horas_incluidas numeric,
  ADD COLUMN IF NOT EXISTS costo_por_hora_extra numeric NOT NULL DEFAULT 0;

ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS horas_extra numeric NOT NULL DEFAULT 0;
