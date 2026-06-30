ALTER TABLE public.residentes ADD COLUMN IF NOT EXISTS recargo_mora_pct numeric NOT NULL DEFAULT 0;
ALTER TABLE public.cobros ADD COLUMN IF NOT EXISTS mora_aplicada numeric NOT NULL DEFAULT 0;