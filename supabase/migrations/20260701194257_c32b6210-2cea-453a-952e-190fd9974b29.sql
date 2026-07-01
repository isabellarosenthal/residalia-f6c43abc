-- Deleting a condominio cascades to its unidades. These FKs to condominios/unidades
-- were missing an ON DELETE rule (defaulting to RESTRICT), which blocked that cascade.
-- Preserve the CRM records and just unlink them, matching residentes.unidad_id's existing behavior.
ALTER TABLE public.prospectos
  DROP CONSTRAINT prospectos_condominio_id_fkey,
  ADD CONSTRAINT prospectos_condominio_id_fkey
    FOREIGN KEY (condominio_id) REFERENCES public.condominios(id) ON DELETE SET NULL;

ALTER TABLE public.prospectos
  DROP CONSTRAINT prospectos_unidad_id_fkey,
  ADD CONSTRAINT prospectos_unidad_id_fkey
    FOREIGN KEY (unidad_id) REFERENCES public.unidades(id) ON DELETE SET NULL;

ALTER TABLE public.actividades_crm
  DROP CONSTRAINT actividades_crm_unidad_id_fkey,
  ADD CONSTRAINT actividades_crm_unidad_id_fkey
    FOREIGN KEY (unidad_id) REFERENCES public.unidades(id) ON DELETE SET NULL;

ALTER TABLE public.eventos_agenda
  DROP CONSTRAINT eventos_agenda_unidad_id_fkey,
  ADD CONSTRAINT eventos_agenda_unidad_id_fkey
    FOREIGN KEY (unidad_id) REFERENCES public.unidades(id) ON DELETE SET NULL;
