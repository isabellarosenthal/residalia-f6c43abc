-- Storage bucket para comprobantes de egresos (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', false)
ON CONFLICT (id) DO NOTHING;

-- Estructura de path: {condominio_id}/{egreso_id_o_uuid}.{ext}
-- La primera carpeta es el condominio_id, usado para autorización

CREATE POLICY "comprobantes tenant read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'comprobantes'
  AND public.can_access_condominio(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "comprobantes tenant insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprobantes'
  AND public.can_access_condominio(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "comprobantes tenant update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'comprobantes'
  AND public.can_access_condominio(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "comprobantes tenant delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprobantes'
  AND public.can_access_condominio(((storage.foldername(name))[1])::uuid)
);