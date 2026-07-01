-- Prospectos referenced condominios without ON DELETE behavior, blocking edificio deletion
-- (e.g. deleting "Villa Roma 2" failed with FK violation 23503 while prospectos rows existed).
ALTER TABLE public.prospectos
  DROP CONSTRAINT prospectos_condominio_id_fkey,
  ADD CONSTRAINT prospectos_condominio_id_fkey
    FOREIGN KEY (condominio_id) REFERENCES public.condominios(id) ON DELETE SET NULL;
