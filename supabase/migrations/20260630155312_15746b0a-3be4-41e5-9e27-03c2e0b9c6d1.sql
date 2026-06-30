
ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS excede_capacidad boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS personas_extra integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monto_extra numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pagado_extra boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS aprobada_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS aprobada_en timestamptz,
  ADD COLUMN IF NOT EXISTS solicitud_nota text;

ALTER TABLE public.areas_comunes
  ADD COLUMN IF NOT EXISTS costo_por_persona_extra numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS permite_exceso boolean NOT NULL DEFAULT true;
