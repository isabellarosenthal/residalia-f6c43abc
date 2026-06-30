
-- Treat missing subscription as active trial (grace) so new accounts can operate during 14-day trial
CREATE OR REPLACE FUNCTION public.is_subscription_active(_condo_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM public.suscripciones s WHERE s.condominio_id = _condo_id) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.suscripciones s
      WHERE s.condominio_id = _condo_id
        AND (
          s.estado = 'activa'
          OR (s.estado = 'trial' AND (s.trial_ends_at IS NULL OR s.trial_ends_at >= CURRENT_DATE))
        )
    )
  END;
$function$;

-- Backfill: any condo without a subscription gets a 14-day trial from its creation date
INSERT INTO public.suscripciones (condominio_id, plan_id, estado, trial_ends_at)
SELECT c.id,
       (SELECT id FROM public.planes ORDER BY COALESCE(precio_mensual,0) ASC, created_at ASC LIMIT 1),
       'trial',
       GREATEST(CURRENT_DATE, (c.created_at::date + INTERVAL '14 days')::date)
FROM public.condominios c
LEFT JOIN public.suscripciones s ON s.condominio_id = c.id
WHERE s.id IS NULL
  AND EXISTS (SELECT 1 FROM public.planes);
