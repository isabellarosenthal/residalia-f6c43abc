-- 1. Members table
CREATE TABLE IF NOT EXISTS public.condominio_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id uuid NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(condominio_id, user_id)
);
ALTER TABLE public.condominio_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_members_user ON public.condominio_members(user_id);

-- 2. Access helper (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.can_access_condominio(_condo_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _condo_id IS NOT NULL AND (
    has_role(auth.uid(), 'super_admin')
    OR EXISTS (SELECT 1 FROM public.condominios c WHERE c.id = _condo_id AND c.admin_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.condominio_members m WHERE m.condominio_id = _condo_id AND m.user_id = auth.uid())
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_condominio(_condo_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _condo_id IS NOT NULL AND (
    has_role(auth.uid(), 'super_admin')
    OR EXISTS (SELECT 1 FROM public.condominios c WHERE c.id = _condo_id AND c.admin_id = auth.uid())
  )
$$;

-- 3. Auto-assign admin_id and add owner as member
CREATE OR REPLACE FUNCTION public.handle_new_condominio()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.admin_id IS NULL THEN NEW.admin_id := auth.uid(); END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS condominios_set_admin ON public.condominios;
CREATE TRIGGER condominios_set_admin BEFORE INSERT ON public.condominios
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_condominio();

CREATE OR REPLACE FUNCTION public.handle_condominio_owner_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.admin_id IS NOT NULL THEN
    INSERT INTO public.condominio_members(condominio_id, user_id, role)
    VALUES (NEW.id, NEW.admin_id, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS condominios_add_owner_member ON public.condominios;
CREATE TRIGGER condominios_add_owner_member AFTER INSERT ON public.condominios
  FOR EACH ROW EXECUTE FUNCTION public.handle_condominio_owner_member();

-- 4. Backfill: existing condominios without admin_id - assign creator if possible (skip), and add admin_id as member
INSERT INTO public.condominio_members(condominio_id, user_id, role)
  SELECT id, admin_id, 'owner' FROM public.condominios
  WHERE admin_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. members RLS
DROP POLICY IF EXISTS "members self read" ON public.condominio_members;
DROP POLICY IF EXISTS "members owner manage" ON public.condominio_members;
CREATE POLICY "members self read" ON public.condominio_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_manage_condominio(condominio_id));
CREATE POLICY "members owner manage" ON public.condominio_members FOR ALL TO authenticated
  USING (public.can_manage_condominio(condominio_id))
  WITH CHECK (public.can_manage_condominio(condominio_id));

-- 6. Replace condominios policies
DROP POLICY IF EXISTS "condominios auth read" ON public.condominios;
DROP POLICY IF EXISTS "condominios auth write" ON public.condominios;
DROP POLICY IF EXISTS "condominios auth update" ON public.condominios;
DROP POLICY IF EXISTS "condominios auth delete" ON public.condominios;

CREATE POLICY "condominios tenant read" ON public.condominios FOR SELECT TO authenticated
  USING (public.can_access_condominio(id));
CREATE POLICY "condominios tenant insert" ON public.condominios FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid() OR admin_id IS NULL);
CREATE POLICY "condominios tenant update" ON public.condominios FOR UPDATE TO authenticated
  USING (public.can_manage_condominio(id));
CREATE POLICY "condominios tenant delete" ON public.condominios FOR DELETE TO authenticated
  USING (public.can_manage_condominio(id));

-- 7. Replace policies on all tables that have condominio_id
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['accesos','areas_comunes','cobros','comunicados','egresos','incidencias','ordenes_mantenimiento','proveedores','reservas','residentes','unidades','prospectos']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s auth read" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s auth write" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s auth update" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s auth delete" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s tenant read" ON public.%I FOR SELECT TO authenticated USING (public.can_access_condominio(condominio_id))', t, t);
    EXECUTE format('CREATE POLICY "%s tenant insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_access_condominio(condominio_id))', t, t);
    EXECUTE format('CREATE POLICY "%s tenant update" ON public.%I FOR UPDATE TO authenticated USING (public.can_access_condominio(condominio_id))', t, t);
    EXECUTE format('CREATE POLICY "%s tenant delete" ON public.%I FOR DELETE TO authenticated USING (public.can_access_condominio(condominio_id))', t, t);
  END LOOP;
END $$;

-- 8. Child tables: filter through their parent
-- actividades_crm via prospecto
DROP POLICY IF EXISTS "actividades_crm auth read" ON public.actividades_crm;
DROP POLICY IF EXISTS "actividades_crm auth write" ON public.actividades_crm;
DROP POLICY IF EXISTS "actividades_crm auth update" ON public.actividades_crm;
DROP POLICY IF EXISTS "actividades_crm auth delete" ON public.actividades_crm;
CREATE POLICY "actividades_crm tenant all" ON public.actividades_crm FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prospectos p WHERE p.id = prospecto_id AND public.can_access_condominio(p.condominio_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.prospectos p WHERE p.id = prospecto_id AND public.can_access_condominio(p.condominio_id)));

-- eventos_agenda via prospecto or unidad
DROP POLICY IF EXISTS "eventos_agenda auth read" ON public.eventos_agenda;
DROP POLICY IF EXISTS "eventos_agenda auth write" ON public.eventos_agenda;
DROP POLICY IF EXISTS "eventos_agenda auth update" ON public.eventos_agenda;
DROP POLICY IF EXISTS "eventos_agenda auth delete" ON public.eventos_agenda;
CREATE POLICY "eventos_agenda tenant all" ON public.eventos_agenda FOR ALL TO authenticated
  USING (
    (prospecto_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.prospectos p WHERE p.id = prospecto_id AND public.can_access_condominio(p.condominio_id)))
    OR (unidad_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.unidades u WHERE u.id = unidad_id AND public.can_access_condominio(u.condominio_id)))
    OR agente_id = auth.uid()
  )
  WITH CHECK (
    (prospecto_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.prospectos p WHERE p.id = prospecto_id AND public.can_access_condominio(p.condominio_id)))
    OR (unidad_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.unidades u WHERE u.id = unidad_id AND public.can_access_condominio(u.condominio_id)))
    OR agente_id = auth.uid()
  );

-- propiedades_interes via unidad
DROP POLICY IF EXISTS "propiedades_interes auth read" ON public.propiedades_interes;
DROP POLICY IF EXISTS "propiedades_interes auth write" ON public.propiedades_interes;
DROP POLICY IF EXISTS "propiedades_interes auth update" ON public.propiedades_interes;
DROP POLICY IF EXISTS "propiedades_interes auth delete" ON public.propiedades_interes;
CREATE POLICY "propiedades_interes tenant all" ON public.propiedades_interes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.unidades u WHERE u.id = unidad_id AND public.can_access_condominio(u.condominio_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.unidades u WHERE u.id = unidad_id AND public.can_access_condominio(u.condominio_id)));

-- personas_autorizadas via residente
DROP POLICY IF EXISTS "personas_autorizadas auth read" ON public.personas_autorizadas;
DROP POLICY IF EXISTS "personas_autorizadas auth write" ON public.personas_autorizadas;
DROP POLICY IF EXISTS "personas_autorizadas auth update" ON public.personas_autorizadas;
DROP POLICY IF EXISTS "personas_autorizadas auth delete" ON public.personas_autorizadas;
CREATE POLICY "personas_autorizadas tenant all" ON public.personas_autorizadas FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.residentes r WHERE r.id = residente_id AND public.can_access_condominio(r.condominio_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.residentes r WHERE r.id = residente_id AND public.can_access_condominio(r.condominio_id)));

-- vehiculos via residente
DROP POLICY IF EXISTS "vehiculos auth read" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos auth write" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos auth update" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos auth delete" ON public.vehiculos;
CREATE POLICY "vehiculos tenant all" ON public.vehiculos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.residentes r WHERE r.id = residente_id AND public.can_access_condominio(r.condominio_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.residentes r WHERE r.id = residente_id AND public.can_access_condominio(r.condominio_id)));