CREATE OR REPLACE FUNCTION public.crear_condominio(
  _nombre text,
  _tipo text DEFAULT 'edificio',
  _direccion text DEFAULT NULL,
  _ciudad text DEFAULT NULL,
  _departamento text DEFAULT NULL,
  _pais text DEFAULT 'Honduras',
  _total_unidades integer DEFAULT 0,
  _cuota_base numeric DEFAULT 0,
  _moneda text DEFAULT 'L',
  _logo_url text DEFAULT NULL,
  _latitud numeric DEFAULT NULL,
  _longitud numeric DEFAULT NULL,
  _maps_url text DEFAULT NULL,
  _recargo_mora_pct numeric DEFAULT 0,
  _dias_gracia integer DEFAULT 5
)
RETURNS public.condominios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _created public.condominios;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para crear un edificio.' USING ERRCODE = '28000';
  END IF;

  INSERT INTO public.condominios (
    nombre,
    tipo,
    direccion,
    ciudad,
    departamento,
    pais,
    total_unidades,
    cuota_base,
    moneda,
    logo_url,
    admin_id,
    latitud,
    longitud,
    maps_url,
    recargo_mora_pct,
    dias_gracia
  ) VALUES (
    NULLIF(trim(_nombre), ''),
    COALESCE(NULLIF(trim(_tipo), ''), 'edificio'),
    NULLIF(trim(_direccion), ''),
    NULLIF(trim(_ciudad), ''),
    NULLIF(trim(_departamento), ''),
    COALESCE(NULLIF(trim(_pais), ''), 'Honduras'),
    COALESCE(_total_unidades, 0),
    COALESCE(_cuota_base, 0),
    COALESCE(NULLIF(trim(_moneda), ''), 'L'),
    NULLIF(trim(_logo_url), ''),
    _user_id,
    _latitud,
    _longitud,
    NULLIF(trim(_maps_url), ''),
    COALESCE(_recargo_mora_pct, 0),
    COALESCE(_dias_gracia, 5)
  )
  RETURNING * INTO _created;

  RETURN _created;
END;
$$;

REVOKE ALL ON FUNCTION public.crear_condominio(text, text, text, text, text, text, integer, numeric, text, text, numeric, numeric, text, numeric, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crear_condominio(text, text, text, text, text, text, integer, numeric, text, text, numeric, numeric, text, numeric, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_condominio(text, text, text, text, text, text, integer, numeric, text, text, numeric, numeric, text, numeric, integer) TO service_role;