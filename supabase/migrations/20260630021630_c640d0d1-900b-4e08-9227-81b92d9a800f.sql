
-- ============ guardia_turnos ============
CREATE TABLE public.guardia_turnos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id uuid NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  guardia_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  estado text NOT NULL DEFAULT 'programado',
  inicio_real timestamptz,
  fin_real timestamptz,
  notas text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guardia_turnos_estado_chk CHECK (estado IN ('programado','en_curso','completado','ausente','cancelado'))
);
CREATE INDEX idx_guardia_turnos_condo_fecha ON public.guardia_turnos(condominio_id, fecha);
CREATE INDEX idx_guardia_turnos_guardia_fecha ON public.guardia_turnos(guardia_id, fecha);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardia_turnos TO authenticated;
GRANT ALL ON public.guardia_turnos TO service_role;

ALTER TABLE public.guardia_turnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "turnos_select" ON public.guardia_turnos FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.can_manage_condominio(condominio_id)
    OR guardia_id = auth.uid()
  );
CREATE POLICY "turnos_insert" ON public.guardia_turnos FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_condominio(condominio_id));
CREATE POLICY "turnos_update" ON public.guardia_turnos FOR UPDATE TO authenticated
  USING (
    public.can_manage_condominio(condominio_id)
    OR guardia_id = auth.uid()
  )
  WITH CHECK (
    public.can_manage_condominio(condominio_id)
    OR guardia_id = auth.uid()
  );
CREATE POLICY "turnos_delete" ON public.guardia_turnos FOR DELETE TO authenticated
  USING (public.can_manage_condominio(condominio_id));

-- ============ puntos_rondin ============
CREATE TABLE public.puntos_rondin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id uuid NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  ubicacion text,
  qr_code text NOT NULL UNIQUE,
  orden int NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_puntos_rondin_condo ON public.puntos_rondin(condominio_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.puntos_rondin TO authenticated;
GRANT ALL ON public.puntos_rondin TO service_role;

ALTER TABLE public.puntos_rondin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "puntos_select" ON public.puntos_rondin FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.can_access_condominio(condominio_id)
  );
CREATE POLICY "puntos_insert" ON public.puntos_rondin FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_condominio(condominio_id));
CREATE POLICY "puntos_update" ON public.puntos_rondin FOR UPDATE TO authenticated
  USING (public.can_manage_condominio(condominio_id))
  WITH CHECK (public.can_manage_condominio(condominio_id));
CREATE POLICY "puntos_delete" ON public.puntos_rondin FOR DELETE TO authenticated
  USING (public.can_manage_condominio(condominio_id));

-- ============ rondines_log ============
CREATE TABLE public.rondines_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id uuid NOT NULL REFERENCES public.guardia_turnos(id) ON DELETE CASCADE,
  punto_id uuid NOT NULL REFERENCES public.puntos_rondin(id) ON DELETE CASCADE,
  condominio_id uuid NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  guardia_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  foto_url text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rondines_turno ON public.rondines_log(turno_id);
CREATE INDEX idx_rondines_condo_fecha ON public.rondines_log(condominio_id, scanned_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rondines_log TO authenticated;
GRANT ALL ON public.rondines_log TO service_role;

ALTER TABLE public.rondines_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rondines_select" ON public.rondines_log FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.can_manage_condominio(condominio_id)
    OR guardia_id = auth.uid()
  );
CREATE POLICY "rondines_insert" ON public.rondines_log FOR INSERT TO authenticated
  WITH CHECK (
    guardia_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.guardia_turnos t
      WHERE t.id = turno_id AND t.guardia_id = auth.uid()
    )
  );
CREATE POLICY "rondines_delete" ON public.rondines_log FOR DELETE TO authenticated
  USING (public.can_manage_condominio(condominio_id));

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_guardia_turnos_updated BEFORE UPDATE ON public.guardia_turnos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_puntos_rondin_updated BEFORE UPDATE ON public.puntos_rondin
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
