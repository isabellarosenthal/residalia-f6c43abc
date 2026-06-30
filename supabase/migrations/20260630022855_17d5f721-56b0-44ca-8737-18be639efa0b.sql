ALTER TABLE public.pagos
  ADD CONSTRAINT pagos_cobro_id_fkey
  FOREIGN KEY (cobro_id) REFERENCES public.cobros(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS pagos_cobro_id_idx ON public.pagos(cobro_id);