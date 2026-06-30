
CREATE OR REPLACE FUNCTION public.is_subscription_active(_condo_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _admin uuid;
  _signup timestamptz;
  _has_sub boolean;
  _sub_ok boolean;
BEGIN
  SELECT admin_id INTO _admin FROM public.condominios WHERE id = _condo_id;

  -- Trial siempre de 14 días desde el registro del admin
  IF _admin IS NOT NULL THEN
    SELECT COALESCE(p.created_at, u.created_at)
      INTO _signup
      FROM auth.users u
      LEFT JOIN public.profiles p ON p.id = u.id
      WHERE u.id = _admin;
    IF _signup IS NOT NULL AND _signup + INTERVAL '14 days' >= now() THEN
      RETURN true;
    END IF;
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.suscripciones s WHERE s.condominio_id = _condo_id) INTO _has_sub;
  IF NOT _has_sub THEN RETURN true; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.suscripciones s
    WHERE s.condominio_id = _condo_id
      AND (
        s.estado = 'activa'
        OR (s.estado = 'trial' AND (s.trial_ends_at IS NULL OR s.trial_ends_at >= CURRENT_DATE))
      )
  ) INTO _sub_ok;
  RETURN _sub_ok;
END $function$;
