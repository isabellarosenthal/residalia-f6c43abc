ALTER TABLE public.planes
  ADD COLUMN IF NOT EXISTS max_edificios integer,
  ADD COLUMN IF NOT EXISTS max_admins integer;

ALTER TABLE public.planes DROP COLUMN IF EXISTS max_residentes;