-- La mora deja de sumarse dentro de "monto" y queda como recargo aparte.
-- El saldo real de un cobro pasa a ser monto + mora_aplicada - abonado, y
-- condonar la mora ya no requiere revertir texto del concepto.

CREATE OR REPLACE FUNCTION public.recalc_cobro_estado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cobro_id uuid;
  _abonado numeric;
  _total numeric;
  _ultima_fecha date;
  _metodo text;
  _recibo text;
BEGIN
  _cobro_id := COALESCE(NEW.cobro_id, OLD.cobro_id);
  SELECT monto + mora_aplicada, recibo_numero INTO _total, _recibo
    FROM public.cobros WHERE id = _cobro_id;
  SELECT COALESCE(SUM(monto), 0), MAX(fecha), (array_agg(metodo ORDER BY fecha DESC))[1]
    INTO _abonado, _ultima_fecha, _metodo
    FROM public.pagos WHERE cobro_id = _cobro_id;

  IF _abonado >= _total THEN
    UPDATE public.cobros
      SET estado = 'pagado',
          fecha_pago = _ultima_fecha,
          metodo_pago = COALESCE(_metodo, metodo_pago),
          recibo_numero = COALESCE(_recibo, 'R-' || substring(replace(_cobro_id::text,'-','') from 1 for 8))
      WHERE id = _cobro_id;
  ELSIF _abonado > 0 THEN
    UPDATE public.cobros
      SET estado = 'parcial',
          fecha_pago = NULL,
          metodo_pago = COALESCE(_metodo, metodo_pago)
      WHERE id = _cobro_id;
  ELSE
    UPDATE public.cobros
      SET estado = CASE WHEN fecha_vencimiento < CURRENT_DATE THEN 'vencido'::estado_cobro ELSE 'pendiente'::estado_cobro END,
          fecha_pago = NULL
      WHERE id = _cobro_id;
  END IF;

  RETURN NULL;
END $$;

-- La mora automática ya no toca "monto" ni el texto del concepto: solo
-- acumula en mora_aplicada. El trigger de arriba ya considera monto+mora
-- para decidir si el cobro está pagado.
CREATE OR REPLACE FUNCTION public.aplicar_mora_automatica()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _c RECORD;
  _pct numeric;
  _abonado numeric;
  _saldo numeric;
  _mora numeric;
  _n integer := 0;
BEGIN
  FOR _c IN
    SELECT co.*, cd.dias_gracia, cd.recargo_mora_pct AS condo_pct
    FROM public.cobros co
    JOIN public.condominios cd ON cd.id = co.condominio_id
    WHERE cd.auto_aplicar_mora = true
      AND co.estado IN ('pendiente', 'vencido')
      AND co.mora_aplicada = 0
      AND co.fecha_vencimiento + cd.dias_gracia < CURRENT_DATE
  LOOP
    _pct := NULL;
    IF _c.residente_id IS NOT NULL THEN
      SELECT recargo_mora_pct INTO _pct FROM public.residentes WHERE id = _c.residente_id;
    END IF;
    IF _pct IS NULL OR _pct = 0 THEN _pct := _c.condo_pct; END IF;
    IF _pct IS NULL OR _pct <= 0 THEN CONTINUE; END IF;

    SELECT COALESCE(SUM(monto), 0) INTO _abonado FROM public.pagos WHERE cobro_id = _c.id;
    _saldo := GREATEST(0, _c.monto - _abonado);
    IF _saldo <= 0 THEN CONTINUE; END IF;

    _mora := round(_saldo * _pct) / 100;
    IF _mora <= 0 THEN CONTINUE; END IF;

    UPDATE public.cobros
      SET mora_aplicada = mora_aplicada + _mora,
          estado = 'vencido'
      WHERE id = _c.id;
    _n := _n + 1;
  END LOOP;
  RETURN _n;
END $$;
