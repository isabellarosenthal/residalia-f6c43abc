-- Facturación mensual y mora automáticas, configurables por edificio.

ALTER TABLE public.condominios
  ADD COLUMN IF NOT EXISTS dia_emision_cobros integer NOT NULL DEFAULT 1 CHECK (dia_emision_cobros BETWEEN 1 AND 28),
  ADD COLUMN IF NOT EXISTS dias_plazo_pago integer NOT NULL DEFAULT 5 CHECK (dias_plazo_pago >= 0),
  ADD COLUMN IF NOT EXISTS concepto_mensual text NOT NULL DEFAULT 'Cuota de mantenimiento',
  ADD COLUMN IF NOT EXISTS auto_generar_cobros boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_aplicar_mora boolean NOT NULL DEFAULT false;

-- Mes que factura un cobro (para deduplicar la emisión automática, independiente
-- del texto libre del concepto que usa el flujo manual "Generar mensuales").
ALTER TABLE public.cobros ADD COLUMN IF NOT EXISTS periodo date;
CREATE INDEX IF NOT EXISTS idx_cobros_periodo ON public.cobros(condominio_id, unidad_id, periodo);

-- Genera los cobros del mes para los edificios con auto_generar_cobros = true,
-- el día del mes que cada uno configuró en dia_emision_cobros.
CREATE OR REPLACE FUNCTION public.generar_cobros_automaticos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _condo RECORD;
  _unidad RECORD;
  _monto numeric;
  _periodo date := date_trunc('month', CURRENT_DATE)::date;
  _mes_label text := initcap(to_char(CURRENT_DATE, 'TMMonth')) || ' ' || to_char(CURRENT_DATE, 'YYYY');
  _n integer := 0;
BEGIN
  FOR _condo IN
    SELECT * FROM public.condominios
    WHERE auto_generar_cobros = true
      AND dia_emision_cobros = EXTRACT(day FROM CURRENT_DATE)::int
  LOOP
    FOR _unidad IN
      SELECT * FROM public.unidades WHERE condominio_id = _condo.id
    LOOP
      IF EXISTS (
        SELECT 1 FROM public.cobros
        WHERE condominio_id = _condo.id AND unidad_id = _unidad.id AND periodo = _periodo
      ) THEN
        CONTINUE;
      END IF;

      _monto := CASE
        WHEN COALESCE(_unidad.mantenimiento_mensual, 0) > 0 THEN _unidad.mantenimiento_mensual
        WHEN _condo.cuota_modo = 'por_m2' THEN COALESCE(_unidad.area_m2_construccion, 0) * COALESCE(_condo.cuota_por_m2, 0)
        ELSE COALESCE(_condo.cuota_base, 0)
      END;

      IF _monto <= 0 THEN CONTINUE; END IF;

      INSERT INTO public.cobros (condominio_id, unidad_id, residente_id, concepto, monto, fecha_vencimiento, periodo, estado)
      VALUES (
        _condo.id,
        _unidad.id,
        COALESCE(_unidad.inquilino_id, _unidad.propietario_id),
        _condo.concepto_mensual || ' ' || _mes_label || ' · Unidad ' || _unidad.numero,
        _monto,
        CURRENT_DATE + _condo.dias_plazo_pago,
        _periodo,
        'pendiente'
      );
      _n := _n + 1;
    END LOOP;
  END LOOP;
  RETURN _n;
END $$;

-- Aplica mora una sola vez por cobro, cuando pasó la fecha de vencimiento +
-- los días de gracia del edificio, para edificios con auto_aplicar_mora = true.
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
      SET monto = monto + _mora,
          mora_aplicada = mora_aplicada + _mora,
          concepto = CASE WHEN concepto ~* '\+ mora' THEN concepto ELSE concepto || ' + mora ' || _pct || '%' END,
          estado = 'vencido'
      WHERE id = _c.id;
    _n := _n + 1;
  END LOOP;
  RETURN _n;
END $$;

REVOKE ALL ON FUNCTION public.generar_cobros_automaticos() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.aplicar_mora_automatica() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generar_cobros_automaticos() TO service_role;
GRANT EXECUTE ON FUNCTION public.aplicar_mora_automatica() TO service_role;

-- Programación diaria vía pg_cron (requiere habilitar la extensión).
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
DECLARE _jobid bigint;
BEGIN
  SELECT jobid INTO _jobid FROM cron.job WHERE jobname = 'generar-cobros-diario';
  IF _jobid IS NOT NULL THEN PERFORM cron.unschedule(_jobid); END IF;

  SELECT jobid INTO _jobid FROM cron.job WHERE jobname = 'aplicar-mora-diario';
  IF _jobid IS NOT NULL THEN PERFORM cron.unschedule(_jobid); END IF;
END $$;

SELECT cron.schedule('generar-cobros-diario', '0 6 * * *', 'SELECT public.generar_cobros_automaticos();');
SELECT cron.schedule('aplicar-mora-diario', '30 6 * * *', 'SELECT public.aplicar_mora_automatica();');
