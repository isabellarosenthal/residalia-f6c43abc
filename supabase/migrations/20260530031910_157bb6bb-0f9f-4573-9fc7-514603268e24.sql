
-- Helper: obtener límites del plan vigente del admin/condominio
CREATE OR REPLACE FUNCTION public.get_admin_plan_limits(_admin_id uuid)
RETURNS TABLE(max_edificios int, max_unidades int, max_admins int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE(MAX(CASE WHEN p.max_edificios IS NULL THEN 2147483647 ELSE p.max_edificios END), 1) AS max_edificios,
    COALESCE(MAX(CASE WHEN p.max_unidades IS NULL THEN 2147483647 ELSE p.max_unidades END), 60) AS max_unidades,
    COALESCE(MAX(CASE WHEN p.max_admins IS NULL THEN 2147483647 ELSE p.max_admins END), 2) AS max_admins
  FROM public.condominios c
  JOIN public.suscripciones s ON s.condominio_id = c.id
  JOIN public.planes p ON p.id = s.plan_id
  WHERE c.admin_id = _admin_id;
$$;

CREATE OR REPLACE FUNCTION public.get_condominio_plan_limits(_condo_id uuid)
RETURNS TABLE(max_unidades int, max_admins int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE(CASE WHEN p.max_unidades IS NULL THEN 2147483647 ELSE p.max_unidades END, 60),
    COALESCE(CASE WHEN p.max_admins IS NULL THEN 2147483647 ELSE p.max_admins END, 2)
  FROM public.suscripciones s
  JOIN public.planes p ON p.id = s.plan_id
  WHERE s.condominio_id = _condo_id
  LIMIT 1;
$$;

-- Trigger: límite de edificios por admin
CREATE OR REPLACE FUNCTION public.enforce_edificios_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _limit int; _count int; _admin uuid;
BEGIN
  _admin := COALESCE(NEW.admin_id, auth.uid());
  IF _admin IS NULL OR has_role(_admin, 'super_admin') THEN RETURN NEW; END IF;
  SELECT max_edificios INTO _limit FROM public.get_admin_plan_limits(_admin);
  SELECT COUNT(*) INTO _count FROM public.condominios WHERE admin_id = _admin;
  IF _count >= COALESCE(_limit, 1) THEN
    RAISE EXCEPTION 'Has alcanzado el límite de edificios de tu plan (%). Actualiza tu plan para agregar más.', _limit;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_edificios_limit ON public.condominios;
CREATE TRIGGER trg_enforce_edificios_limit
  BEFORE INSERT ON public.condominios
  FOR EACH ROW EXECUTE FUNCTION public.enforce_edificios_limit();

-- Trigger: límite de unidades por edificio
CREATE OR REPLACE FUNCTION public.enforce_unidades_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _limit int; _count int;
BEGIN
  IF has_role(auth.uid(), 'super_admin') THEN RETURN NEW; END IF;
  SELECT max_unidades INTO _limit FROM public.get_condominio_plan_limits(NEW.condominio_id);
  SELECT COUNT(*) INTO _count FROM public.unidades WHERE condominio_id = NEW.condominio_id;
  IF _count >= COALESCE(_limit, 60) THEN
    RAISE EXCEPTION 'Este edificio alcanzó el límite de unidades de su plan (%). Actualiza el plan para agregar más.', _limit;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_unidades_limit ON public.unidades;
CREATE TRIGGER trg_enforce_unidades_limit
  BEFORE INSERT ON public.unidades
  FOR EACH ROW EXECUTE FUNCTION public.enforce_unidades_limit();

-- Trigger: límite de admins por edificio (miembros con rol admin/owner)
CREATE OR REPLACE FUNCTION public.enforce_admins_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _limit int; _count int;
BEGIN
  IF has_role(auth.uid(), 'super_admin') THEN RETURN NEW; END IF;
  IF NEW.role NOT IN ('admin', 'owner') THEN RETURN NEW; END IF;
  SELECT max_admins INTO _limit FROM public.get_condominio_plan_limits(NEW.condominio_id);
  SELECT COUNT(*) INTO _count FROM public.condominio_members
    WHERE condominio_id = NEW.condominio_id AND role IN ('admin','owner');
  IF _count >= COALESCE(_limit, 2) THEN
    RAISE EXCEPTION 'Este edificio alcanzó el límite de administradores de su plan (%). Actualiza el plan para agregar más.', _limit;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_admins_limit ON public.condominio_members;
CREATE TRIGGER trg_enforce_admins_limit
  BEFORE INSERT ON public.condominio_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_admins_limit();
