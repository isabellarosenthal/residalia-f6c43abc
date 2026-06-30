ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS referido_renta_nombre text,
  ADD COLUMN IF NOT EXISTS referido_renta_agencia text,
  ADD COLUMN IF NOT EXISTS referido_renta_url text,
  ADD COLUMN IF NOT EXISTS referido_venta_nombre text,
  ADD COLUMN IF NOT EXISTS referido_venta_agencia text,
  ADD COLUMN IF NOT EXISTS referido_venta_url text;