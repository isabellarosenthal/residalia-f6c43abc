ALTER TABLE public.accesos
  ADD COLUMN IF NOT EXISTS usos_maximos integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS usos_actuales integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS minutos_max_estadia integer;