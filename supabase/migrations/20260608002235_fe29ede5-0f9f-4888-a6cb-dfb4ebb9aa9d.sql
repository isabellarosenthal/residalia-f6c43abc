
-- 1. profiles.plan_seleccionado
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_seleccionado text;

-- 2. handle_new_user: save plan_seleccionado from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  _code text;
  _inv record;
  _rol app_role;
  _plan_nom text;
BEGIN
  _code := NEW.raw_user_meta_data->>'invitation_code';
  _plan_nom := NEW.raw_user_meta_data->>'plan_nombre';

  INSERT INTO public.profiles (id, full_name, email, plan_seleccionado)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, _plan_nom);

  IF _code IS NOT NULL AND length(_code) > 0 THEN
    SELECT * INTO _inv FROM public.invitaciones_residente
      WHERE codigo = upper(_code) AND lower(email) = lower(NEW.email)
        AND estado = 'pendiente' AND expira_en > now() LIMIT 1;
    IF _inv IS NULL THEN RAISE EXCEPTION 'Código de invitación inválido o expirado'; END IF;
    _rol := 'residente';
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, _rol);
    UPDATE public.residentes SET user_id = NEW.id WHERE id = _inv.residente_id;
    INSERT INTO public.condominio_members(condominio_id, user_id, role)
      VALUES (_inv.condominio_id, NEW.id, 'member') ON CONFLICT DO NOTHING;
    UPDATE public.invitaciones_residente SET estado='usada', usada_en=now(), usada_por=NEW.id WHERE id=_inv.id;
  ELSE
    _rol := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'admin_condominio');
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _rol);
    UPDATE public.residentes SET user_id = NEW.id WHERE email = NEW.email AND user_id IS NULL;
  END IF;
  RETURN NEW;
END $function$;

-- 3. handle_new_condominio_subscription: use plan selected by admin
CREATE OR REPLACE FUNCTION public.handle_new_condominio_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _plan uuid; _plan_nom text;
BEGIN
  SELECT plan_seleccionado INTO _plan_nom FROM public.profiles WHERE id = NEW.admin_id;
  IF _plan_nom IS NOT NULL THEN
    SELECT id INTO _plan FROM public.planes WHERE lower(nombre) = lower(_plan_nom) LIMIT 1;
  END IF;
  IF _plan IS NULL THEN
    SELECT id INTO _plan FROM public.planes ORDER BY COALESCE(precio_mensual,0) ASC, created_at ASC LIMIT 1;
  END IF;
  IF _plan IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.suscripciones (condominio_id, plan_id, estado, trial_ends_at)
  VALUES (NEW.id, _plan, 'trial', CURRENT_DATE + INTERVAL '14 days')
  ON CONFLICT (condominio_id) DO NOTHING;
  RETURN NEW;
END $function$;

-- 4. is_subscription_active
CREATE OR REPLACE FUNCTION public.is_subscription_active(_condo_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.suscripciones s
    WHERE s.condominio_id = _condo_id
      AND (
        s.estado = 'activa'
        OR (s.estado = 'trial' AND (s.trial_ends_at IS NULL OR s.trial_ends_at >= CURRENT_DATE))
      )
  )
$function$;

-- 5. enforce_active_subscription trigger
CREATE OR REPLACE FUNCTION public.enforce_active_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _condo uuid;
BEGIN
  IF has_role(auth.uid(), 'super_admin') THEN RETURN COALESCE(NEW, OLD); END IF;
  _condo := COALESCE(NEW.condominio_id, OLD.condominio_id);
  IF _condo IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF NOT public.is_subscription_active(_condo) THEN
    RAISE EXCEPTION 'Tu prueba terminó. Elige un plan para seguir usando Altura Cloud.' USING ERRCODE = 'P0001';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $function$;

-- Attach trigger to tenant tables
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'cobros','pagos','egresos','unidades','residentes','accesos','comunicados',
    'incidencias','ordenes_mantenimiento','reservas','areas_comunes','proveedores',
    'eventos_agenda','vehiculos','personas_autorizadas','propiedades_interes',
    'prospectos','actividades_crm','condominio_members'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_enforce_active_sub ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_enforce_active_sub BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.enforce_active_subscription()', t);
  END LOOP;
END $$;

-- pagos table uses cobro_id, not condominio_id directly; handle separately
CREATE OR REPLACE FUNCTION public.enforce_active_subscription_pagos()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _condo uuid;
BEGIN
  IF has_role(auth.uid(), 'super_admin') THEN RETURN COALESCE(NEW, OLD); END IF;
  SELECT condominio_id INTO _condo FROM public.cobros WHERE id = COALESCE(NEW.cobro_id, OLD.cobro_id);
  IF _condo IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF NOT public.is_subscription_active(_condo) THEN
    RAISE EXCEPTION 'Tu prueba terminó. Elige un plan para seguir usando Altura Cloud.' USING ERRCODE = 'P0001';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $function$;
DROP TRIGGER IF EXISTS trg_enforce_active_sub ON public.pagos;
DROP TRIGGER IF EXISTS trg_enforce_active_sub_pagos ON public.pagos;
CREATE TRIGGER trg_enforce_active_sub_pagos BEFORE INSERT OR UPDATE OR DELETE ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_active_subscription_pagos();

-- 6. Backfill existing admin profiles without plan_seleccionado
UPDATE public.profiles p
SET plan_seleccionado = 'Lobby'
WHERE plan_seleccionado IS NULL
  AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin_condominio');
