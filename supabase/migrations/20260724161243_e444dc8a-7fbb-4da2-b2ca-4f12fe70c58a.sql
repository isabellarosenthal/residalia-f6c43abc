
ALTER TABLE public.prospectos ALTER COLUMN condominio_id SET NOT NULL;

DROP POLICY IF EXISTS "eventos_agenda tenant all" ON public.eventos_agenda;
CREATE POLICY "eventos_agenda tenant all" ON public.eventos_agenda
FOR ALL
USING (
  ((prospecto_id IS NOT NULL) AND EXISTS (
    SELECT 1 FROM prospectos p WHERE p.id = eventos_agenda.prospecto_id AND can_access_condominio(p.condominio_id)
  ))
  OR ((unidad_id IS NOT NULL) AND EXISTS (
    SELECT 1 FROM unidades u WHERE u.id = eventos_agenda.unidad_id AND can_access_condominio(u.condominio_id)
  ))
)
WITH CHECK (
  ((prospecto_id IS NOT NULL) AND EXISTS (
    SELECT 1 FROM prospectos p WHERE p.id = eventos_agenda.prospecto_id AND can_access_condominio(p.condominio_id)
  ))
  OR ((unidad_id IS NOT NULL) AND EXISTS (
    SELECT 1 FROM unidades u WHERE u.id = eventos_agenda.unidad_id AND can_access_condominio(u.condominio_id)
  ))
);
