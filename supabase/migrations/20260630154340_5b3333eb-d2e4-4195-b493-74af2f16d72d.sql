CREATE OR REPLACE FUNCTION public.aplicar_mora_masiva(_condo_id uuid, _pct numeric, _solo_vacios boolean DEFAULT false)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _n integer;
BEGIN
  IF NOT can_manage_condominio(_condo_id) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF _pct IS NULL OR _pct < 0 THEN
    RAISE EXCEPTION 'Porcentaje inválido';
  END IF;
  UPDATE public.residentes
    SET recargo_mora_pct = _pct
    WHERE condominio_id = _condo_id
      AND (NOT _solo_vacios OR recargo_mora_pct IS NULL OR recargo_mora_pct = 0);
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END $$;

GRANT EXECUTE ON FUNCTION public.aplicar_mora_masiva(uuid, numeric, boolean) TO authenticated;