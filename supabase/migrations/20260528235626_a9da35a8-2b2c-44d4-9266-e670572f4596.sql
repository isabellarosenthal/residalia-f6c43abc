
-- Helper: caller shares a managed condominio with target user
CREATE OR REPLACE FUNCTION public.shares_managed_condominio_with(_target uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.condominio_members m
    JOIN public.condominios c ON c.id = m.condominio_id
    WHERE m.user_id = _target
      AND (c.admin_id = auth.uid() OR has_role(auth.uid(), 'super_admin'))
  )
$$;

-- Allow tenant admins to read profiles of users in their condos
DROP POLICY IF EXISTS "Profiles: tenant admin read" ON public.profiles;
CREATE POLICY "Profiles: tenant admin read" ON public.profiles
FOR SELECT TO authenticated
USING (public.shares_managed_condominio_with(id));

-- Allow tenant admins to read user_roles for users in their condos
DROP POLICY IF EXISTS "Roles: tenant admin read" ON public.user_roles;
CREATE POLICY "Roles: tenant admin read" ON public.user_roles
FOR SELECT TO authenticated
USING (public.shares_managed_condominio_with(user_id));

-- RPC: assign role + add as member to a condominio
CREATE OR REPLACE FUNCTION public.assign_user_to_condominio(
  _email text, _role app_role, _condo_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _uid uuid;
BEGIN
  IF NOT can_manage_condominio(_condo_id) THEN
    RAISE EXCEPTION 'No autorizado para este edificio';
  END IF;
  IF _role = 'super_admin' THEN
    RAISE EXCEPTION 'No puedes asignar super_admin';
  END IF;
  SELECT id INTO _uid FROM public.profiles WHERE lower(email) = lower(_email) LIMIT 1;
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado. Debe registrarse en /login primero.';
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (_uid, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  -- Replace previous role for this user (single role model in this app)
  DELETE FROM public.user_roles WHERE user_id = _uid AND role <> _role;
  INSERT INTO public.condominio_members(condominio_id, user_id, role)
    VALUES (_condo_id, _uid, 'member') ON CONFLICT DO NOTHING;
  RETURN _uid;
END $$;

-- RPC: remove member from condominio
CREATE OR REPLACE FUNCTION public.remove_user_from_condominio(
  _user_id uuid, _condo_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT can_manage_condominio(_condo_id) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  DELETE FROM public.condominio_members
    WHERE user_id = _user_id AND condominio_id = _condo_id;
END $$;

GRANT EXECUTE ON FUNCTION public.assign_user_to_condominio(text, app_role, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_from_condominio(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_managed_condominio_with(uuid) TO authenticated;
