-- Agregar valor 'residente' al enum app_role si no existe
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'residente' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'residente';
  END IF;
END $$;

-- Tabla de invitaciones
CREATE TABLE IF NOT EXISTS public.invitaciones_residente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  email text NOT NULL,
  residente_id uuid REFERENCES public.residentes(id) ON DELETE CASCADE,
  unidad_id uuid REFERENCES public.unidades(id) ON DELETE SET NULL,
  condominio_id uuid NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','usada','expirada','revocada')),
  expira_en timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  usada_en timestamptz,
  usada_por uuid,
  generado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitaciones_email ON public.invitaciones_residente(lower(email));
CREATE INDEX IF NOT EXISTS idx_invitaciones_codigo ON public.invitaciones_residente(codigo);
CREATE INDEX IF NOT EXISTS idx_invitaciones_condo ON public.invitaciones_residente(condominio_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitaciones_residente TO authenticated;
GRANT ALL ON public.invitaciones_residente TO service_role;

ALTER TABLE public.invitaciones_residente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitaciones admin manage"
ON public.invitaciones_residente FOR ALL TO authenticated
USING (can_manage_condominio(condominio_id))
WITH CHECK (can_manage_condominio(condominio_id));

CREATE POLICY "invitaciones self read"
ON public.invitaciones_residente FOR SELECT TO authenticated
USING (lower(email) = lower(coalesce((auth.jwt() ->> 'email'),'')));

-- Función: generar código único de 6 caracteres
CREATE OR REPLACE FUNCTION public.generar_invitacion_residente(_residente_id uuid)
RETURNS TABLE(codigo text, expira_en timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _codigo text;
  _email text;
  _condo_id uuid;
  _unidad_id uuid;
  _intentos int := 0;
BEGIN
  SELECT r.email, r.condominio_id, r.unidad_id
    INTO _email, _condo_id, _unidad_id
    FROM public.residentes r WHERE r.id = _residente_id;

  IF _email IS NULL THEN
    RAISE EXCEPTION 'El residente no tiene email registrado';
  END IF;

  IF NOT can_manage_condominio(_condo_id) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- Revocar invitaciones pendientes previas para este residente
  UPDATE public.invitaciones_residente
    SET estado = 'revocada'
    WHERE residente_id = _residente_id AND estado = 'pendiente';

  -- Generar código único
  LOOP
    _codigo := upper(substring(translate(encode(gen_random_bytes(6),'base64'), '+/=OIl01', 'ABCDEFGH') from 1 for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.invitaciones_residente WHERE codigo = _codigo);
    _intentos := _intentos + 1;
    IF _intentos > 10 THEN RAISE EXCEPTION 'No se pudo generar código único'; END IF;
  END LOOP;

  INSERT INTO public.invitaciones_residente(codigo, email, residente_id, unidad_id, condominio_id, generado_por)
    VALUES (_codigo, _email, _residente_id, _unidad_id, _condo_id, auth.uid());

  RETURN QUERY SELECT _codigo, (now() + interval '30 days')::timestamptz;
END $$;

-- Función: validar invitación (lectura pública por código + email)
CREATE OR REPLACE FUNCTION public.validar_invitacion(_codigo text, _email text)
RETURNS TABLE(valida boolean, mensaje text, residente_id uuid, condominio_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _inv record;
BEGIN
  SELECT * INTO _inv FROM public.invitaciones_residente
    WHERE codigo = upper(_codigo) LIMIT 1;
  IF _inv IS NULL THEN
    RETURN QUERY SELECT false, 'Código inválido'::text, NULL::uuid, NULL::uuid; RETURN;
  END IF;
  IF lower(_inv.email) <> lower(_email) THEN
    RETURN QUERY SELECT false, 'El email no coincide con la invitación'::text, NULL::uuid, NULL::uuid; RETURN;
  END IF;
  IF _inv.estado <> 'pendiente' THEN
    RETURN QUERY SELECT false, ('Código '||_inv.estado)::text, NULL::uuid, NULL::uuid; RETURN;
  END IF;
  IF _inv.expira_en < now() THEN
    UPDATE public.invitaciones_residente SET estado='expirada' WHERE id=_inv.id;
    RETURN QUERY SELECT false, 'Código expirado'::text, NULL::uuid, NULL::uuid; RETURN;
  END IF;
  RETURN QUERY SELECT true, 'OK'::text, _inv.residente_id, _inv.condominio_id;
END $$;

GRANT EXECUTE ON FUNCTION public.validar_invitacion(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generar_invitacion_residente(uuid) TO authenticated;

-- Actualizar handle_new_user: si viene invitation_code en metadata, asignar rol residente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code text;
  _inv record;
  _rol app_role;
BEGIN
  _code := NEW.raw_user_meta_data->>'invitation_code';

  INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);

  IF _code IS NOT NULL AND length(_code) > 0 THEN
    SELECT * INTO _inv FROM public.invitaciones_residente
      WHERE codigo = upper(_code) AND lower(email) = lower(NEW.email)
        AND estado = 'pendiente' AND expira_en > now() LIMIT 1;

    IF _inv IS NULL THEN
      RAISE EXCEPTION 'Código de invitación inválido o expirado';
    END IF;

    _rol := 'residente';
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, _rol);

    -- Vincular residente
    UPDATE public.residentes SET user_id = NEW.id
      WHERE id = _inv.residente_id;

    -- Agregar a members del condominio
    INSERT INTO public.condominio_members(condominio_id, user_id, role)
      VALUES (_inv.condominio_id, NEW.id, 'member')
      ON CONFLICT DO NOTHING;

    -- Marcar invitación como usada
    UPDATE public.invitaciones_residente
      SET estado='usada', usada_en=now(), usada_por=NEW.id
      WHERE id=_inv.id;
  ELSE
    -- Flujo admin (sin código)
    _rol := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'admin_condominio');
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _rol);
    UPDATE public.residentes SET user_id = NEW.id
      WHERE email = NEW.email AND user_id IS NULL;
  END IF;

  RETURN NEW;
END $$;