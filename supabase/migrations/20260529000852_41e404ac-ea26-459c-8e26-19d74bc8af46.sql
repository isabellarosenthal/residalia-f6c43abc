
-- Recargo y días de gracia a nivel condominio
ALTER TABLE public.condominios
  ADD COLUMN IF NOT EXISTS recargo_mora_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dias_gracia integer NOT NULL DEFAULT 5;

-- Tabla de pagos (abonos a cobros)
CREATE TABLE IF NOT EXISTS public.pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cobro_id uuid NOT NULL,
  monto numeric NOT NULL CHECK (monto > 0),
  metodo text NOT NULL DEFAULT 'efectivo',
  referencia text,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  comprobante_url text,
  notas text,
  registrado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagos_cobro ON public.pagos(cobro_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagos TO authenticated;
GRANT ALL ON public.pagos TO service_role;

ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos tenant read" ON public.pagos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cobros c WHERE c.id = pagos.cobro_id AND can_access_condominio(c.condominio_id)));

CREATE POLICY "pagos tenant insert" ON public.pagos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.cobros c WHERE c.id = pagos.cobro_id AND can_access_condominio(c.condominio_id)));

CREATE POLICY "pagos tenant update" ON public.pagos FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cobros c WHERE c.id = pagos.cobro_id AND can_access_condominio(c.condominio_id)));

CREATE POLICY "pagos tenant delete" ON public.pagos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cobros c WHERE c.id = pagos.cobro_id AND can_access_condominio(c.condominio_id)));

-- Trigger: recalcular estado del cobro al insertar/eliminar/actualizar pagos
CREATE OR REPLACE FUNCTION public.recalc_cobro_estado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cobro_id uuid;
  _abonado numeric;
  _monto numeric;
  _ultima_fecha date;
  _metodo text;
  _recibo text;
  _estado_actual text;
BEGIN
  _cobro_id := COALESCE(NEW.cobro_id, OLD.cobro_id);
  SELECT monto, estado, recibo_numero INTO _monto, _estado_actual, _recibo
    FROM public.cobros WHERE id = _cobro_id;
  SELECT COALESCE(SUM(monto), 0), MAX(fecha), (array_agg(metodo ORDER BY fecha DESC))[1]
    INTO _abonado, _ultima_fecha, _metodo
    FROM public.pagos WHERE cobro_id = _cobro_id;

  IF _abonado >= _monto THEN
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
    -- sin pagos: vuelve a pendiente (o vencido si ya pasó)
    UPDATE public.cobros
      SET estado = CASE WHEN fecha_vencimiento < CURRENT_DATE THEN 'vencido'::estado_cobro ELSE 'pendiente'::estado_cobro END,
          fecha_pago = NULL
      WHERE id = _cobro_id;
  END IF;

  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_pagos_recalc ON public.pagos;
CREATE TRIGGER trg_pagos_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.pagos
FOR EACH ROW EXECUTE FUNCTION public.recalc_cobro_estado();

-- Función para mover pendientes vencidos
CREATE OR REPLACE FUNCTION public.marcar_cobros_vencidos(_condo_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _n integer;
BEGIN
  IF _condo_id IS NOT NULL AND NOT can_manage_condominio(_condo_id) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF _condo_id IS NULL AND NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE public.cobros
    SET estado = 'vencido'
    WHERE estado = 'pendiente'
      AND fecha_vencimiento < CURRENT_DATE
      AND (_condo_id IS NULL OR condominio_id = _condo_id);
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END $$;
