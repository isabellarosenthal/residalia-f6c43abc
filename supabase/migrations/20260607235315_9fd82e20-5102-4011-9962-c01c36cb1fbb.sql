CREATE OR REPLACE FUNCTION public.handle_new_condominio_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _plan uuid;
BEGIN
  SELECT id INTO _plan FROM public.planes
  ORDER BY COALESCE(precio_mensual, 0) ASC, created_at ASC
  LIMIT 1;
  IF _plan IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.suscripciones (condominio_id, plan_id)
  VALUES (NEW.id, _plan)
  ON CONFLICT (condominio_id) DO NOTHING;
  RETURN NEW;
END $function$;