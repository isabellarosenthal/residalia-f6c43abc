-- Tabla planes
CREATE TABLE public.planes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  precio_mensual numeric NOT NULL DEFAULT 0,
  max_unidades integer,
  max_residentes integer,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  activo boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.planes TO anon, authenticated;
GRANT ALL ON public.planes TO service_role;

ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planes lectura publica" ON public.planes FOR SELECT USING (true);
CREATE POLICY "planes admin manage" ON public.planes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Tabla suscripciones
CREATE TABLE public.suscripciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id uuid NOT NULL UNIQUE,
  plan_id uuid NOT NULL REFERENCES public.planes(id),
  estado text NOT NULL DEFAULT 'activa',
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suscripciones TO authenticated;
GRANT ALL ON public.suscripciones TO service_role;

ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suscripciones tenant read" ON public.suscripciones FOR SELECT TO authenticated
  USING (can_access_condominio(condominio_id));
CREATE POLICY "suscripciones admin manage" ON public.suscripciones FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Seed planes
INSERT INTO public.planes (nombre, precio_mensual, max_unidades, max_residentes, features, orden) VALUES
  ('Free', 0, 20, 50, '["Gestión básica", "Hasta 20 unidades", "Soporte por email"]'::jsonb, 1),
  ('Pro', 49, 100, 300, '["Todas las del Free", "CRM inmobiliario", "Comunicaciones masivas", "Reportes avanzados", "Soporte prioritario"]'::jsonb, 2),
  ('Enterprise', 149, NULL, NULL, '["Todas las del Pro", "Unidades ilimitadas", "Multi-edificio", "API access", "Soporte dedicado 24/7"]'::jsonb, 3);

-- Asignar plan Free a todos los condominios existentes
INSERT INTO public.suscripciones (condominio_id, plan_id)
SELECT c.id, (SELECT id FROM public.planes WHERE nombre = 'Free')
FROM public.condominios c
WHERE NOT EXISTS (SELECT 1 FROM public.suscripciones s WHERE s.condominio_id = c.id);

-- Trigger: auto crear suscripción Free al crear condominio
CREATE OR REPLACE FUNCTION public.handle_new_condominio_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.suscripciones (condominio_id, plan_id)
  VALUES (NEW.id, (SELECT id FROM public.planes WHERE nombre = 'Free' LIMIT 1))
  ON CONFLICT (condominio_id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_condominio_subscription
AFTER INSERT ON public.condominios
FOR EACH ROW EXECUTE FUNCTION public.handle_new_condominio_subscription();