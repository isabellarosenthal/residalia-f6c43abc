CREATE OR REPLACE FUNCTION public.generar_invitacion_residente(_residente_id uuid)
RETURNS TABLE(codigo text, expira_en timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _codigo text;
  _email text;
  _condo_id uuid;
  _unidad_id uuid;
  _expira_en timestamptz := now() + interval '30 days';
  _chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  _i int;
  _intentos int := 0;
BEGIN
  SELECT r.email, r.condominio_id, r.unidad_id
    INTO _email, _condo_id, _unidad_id
    FROM public.residentes r WHERE r.id = _residente_id;

  IF _email IS NULL THEN
    RAISE EXCEPTION 'El residente no tiene email registrado';
  END IF;

  IF NOT can_manage_condominio(_condo_id) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  UPDATE public.invitaciones_residente
    SET estado = 'revocada'
    WHERE residente_id = _residente_id AND estado = 'pendiente';

  LOOP
    _codigo := '';
    FOR _i IN 1..6 LOOP
      _codigo := _codigo || substr(_chars, floor(random() * length(_chars) + 1)::int, 1);
    END LOOP;

    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.invitaciones_residente WHERE invitaciones_residente.codigo = _codigo);
    _intentos := _intentos + 1;
    IF _intentos > 20 THEN
      RAISE EXCEPTION 'No se pudo generar código único';
    END IF;
  END LOOP;

  INSERT INTO public.invitaciones_residente(codigo, email, residente_id, unidad_id, condominio_id, generado_por, expira_en)
    VALUES (_codigo, _email, _residente_id, _unidad_id, _condo_id, auth.uid(), _expira_en);

  RETURN QUERY SELECT _codigo, _expira_en;
END
$function$;