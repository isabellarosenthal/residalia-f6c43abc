
CREATE OR REPLACE FUNCTION public.enforce_active_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _condo uuid;
BEGIN
  IF has_role(auth.uid(), 'super_admin') THEN RETURN COALESCE(NEW, OLD); END IF;
  _condo := COALESCE(NEW.condominio_id, OLD.condominio_id);
  IF _condo IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF NOT public.is_subscription_active(_condo) THEN
    RAISE EXCEPTION 'Tu prueba terminó. Elige un plan para seguir usando Residalia.' USING ERRCODE = 'P0001';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $function$;

CREATE OR REPLACE FUNCTION public.enforce_active_subscription_pagos()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _condo uuid;
BEGIN
  IF has_role(auth.uid(), 'super_admin') THEN RETURN COALESCE(NEW, OLD); END IF;
  SELECT condominio_id INTO _condo FROM public.cobros WHERE id = COALESCE(NEW.cobro_id, OLD.cobro_id);
  IF _condo IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF NOT public.is_subscription_active(_condo) THEN
    RAISE EXCEPTION 'Tu prueba terminó. Elige un plan para seguir usando Residalia.' USING ERRCODE = 'P0001';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $function$;
