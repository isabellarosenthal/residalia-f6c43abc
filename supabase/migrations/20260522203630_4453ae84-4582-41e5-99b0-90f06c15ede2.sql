
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin','admin_condominio','junta_directiva','residente','agente_inmobiliario','gerente_crm');
CREATE TYPE public.estado_administrativo AS ENUM ('ocupada','disponible','vacia');
CREATE TYPE public.estado_comercial AS ENUM ('ocupada','disponible','en_venta','en_renta','en_venta_y_renta','reservada');
CREATE TYPE public.tipo_residente AS ENUM ('propietario','inquilino');
CREATE TYPE public.estado_cobro AS ENUM ('pendiente','pagado','parcial','vencido');
CREATE TYPE public.temperatura_prospecto AS ENUM ('frio','tibio','caliente');
CREATE TYPE public.etapa_pipeline AS ENUM ('nuevo','contactado','interesado','visita_agendada','negociacion','cierre','ganado','perdido');
CREATE TYPE public.tipo_prospecto AS ENUM ('comprador','arrendatario','vendedor','inversionista');
CREATE TYPE public.prioridad_incidencia AS ENUM ('baja','media','alta','urgente');
CREATE TYPE public.estado_incidencia AS ENUM ('nuevo','en_revision','en_proceso','resuelto','cerrado');
CREATE TYPE public.estado_orden AS ENUM ('pendiente','en_proceso','completado','cancelado');

-- ============ PROFILES & ROLES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger to auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'admin_condominio'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CONDOMINIOS ============
CREATE TABLE public.condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'edificio',
  direccion TEXT,
  ciudad TEXT,
  departamento TEXT,
  pais TEXT NOT NULL DEFAULT 'Honduras',
  total_unidades INT DEFAULT 0,
  cuota_base NUMERIC(12,2) DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'L',
  logo_url TEXT,
  admin_id UUID REFERENCES auth.users(id),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ UNIDADES ============
CREATE TABLE public.unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  piso INT,
  tipo TEXT,
  area_m2_construccion NUMERIC(8,2),
  area_m2_terreno NUMERIC(8,2),
  habitaciones INT DEFAULT 0,
  banos INT DEFAULT 0,
  banos_visita INT DEFAULT 0,
  parqueos INT DEFAULT 0,
  propietario_id UUID,
  inquilino_id UUID,
  estado_administrativo estado_administrativo NOT NULL DEFAULT 'disponible',
  estado_comercial estado_comercial NOT NULL DEFAULT 'disponible',
  precio_venta NUMERIC(14,2),
  precio_renta NUMERIC(12,2),
  deposito NUMERIC(12,2),
  mantenimiento_mensual NUMERIC(10,2),
  precio_negociable BOOLEAN DEFAULT false,
  descripcion_comercial TEXT,
  fotos_urls JSONB DEFAULT '[]'::jsonb,
  amenidades JSONB DEFAULT '[]'::jsonb,
  fecha_disponibilidad DATE,
  agente_id UUID REFERENCES auth.users(id),
  fecha_publicacion_comercial TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_unidades_condominio ON public.unidades(condominio_id);
CREATE INDEX idx_unidades_estado_comercial ON public.unidades(estado_comercial);

-- ============ RESIDENTES ============
CREATE TABLE public.residentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES public.unidades(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT,
  telefono TEXT,
  telefono_alt TEXT,
  email TEXT,
  tipo tipo_residente NOT NULL DEFAULT 'propietario',
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id UUID NOT NULL REFERENCES public.residentes(id) ON DELETE CASCADE,
  placa TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  color TEXT,
  ano INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.personas_autorizadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residente_id UUID NOT NULL REFERENCES public.residentes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  relacion TEXT,
  tipo_acceso TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ FINANZAS ============
CREATE TABLE public.cobros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES public.unidades(id),
  residente_id UUID REFERENCES public.residentes(id),
  concepto TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  fecha_pago DATE,
  metodo_pago TEXT,
  estado estado_cobro NOT NULL DEFAULT 'pendiente',
  recibo_numero TEXT,
  notas TEXT,
  creado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.egresos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  proveedor TEXT,
  monto NUMERIC(12,2) NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  comprobante_url TEXT,
  aprobado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ ACCESOS Y ÁREAS ============
CREATE TABLE public.accesos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES public.unidades(id),
  visitante_nombre TEXT NOT NULL,
  tipo TEXT,
  metodo TEXT,
  qr_code TEXT,
  fecha_entrada TIMESTAMPTZ,
  fecha_salida TIMESTAMPTZ,
  autorizado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.areas_comunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  capacidad INT,
  horario_inicio TIME,
  horario_fin TIME,
  activa BOOLEAN NOT NULL DEFAULT true,
  icono TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.areas_comunes(id) ON DELETE CASCADE,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES public.unidades(id),
  residente_id UUID REFERENCES public.residentes(id),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  num_personas INT,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'confirmada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ COMUNICACIONES & INCIDENCIAS ============
CREATE TABLE public.comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT,
  cuerpo TEXT,
  canal TEXT,
  destinatarios JSONB,
  programado_para TIMESTAMPTZ,
  enviado_en TIMESTAMPTZ,
  creado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.incidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES public.unidades(id),
  tipo TEXT,
  descripcion TEXT NOT NULL,
  prioridad prioridad_incidencia NOT NULL DEFAULT 'media',
  estado estado_incidencia NOT NULL DEFAULT 'nuevo',
  asignado_a UUID REFERENCES auth.users(id),
  resuelto_en TIMESTAMPTZ,
  fotos_urls JSONB DEFAULT '[]'::jsonb,
  reportado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID REFERENCES public.condominios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  servicio TEXT,
  telefono TEXT,
  email TEXT,
  calificacion NUMERIC(2,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ordenes_mantenimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  area TEXT,
  proveedor_id UUID REFERENCES public.proveedores(id),
  costo_estimado NUMERIC(12,2),
  costo_real NUMERIC(12,2),
  fecha_limite DATE,
  estado estado_orden NOT NULL DEFAULT 'pendiente',
  prioridad prioridad_incidencia DEFAULT 'media',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ CRM ============
CREATE TABLE public.prospectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT,
  whatsapp TEXT,
  email TEXT,
  dni TEXT,
  tipo tipo_prospecto NOT NULL DEFAULT 'comprador',
  origen TEXT,
  temperatura temperatura_prospecto NOT NULL DEFAULT 'tibio',
  presupuesto_min NUMERIC(14,2),
  presupuesto_max NUMERIC(14,2),
  zonas_interes JSONB DEFAULT '[]'::jsonb,
  caracteristicas_deseadas TEXT,
  etapa_pipeline etapa_pipeline NOT NULL DEFAULT 'nuevo',
  agente_id UUID REFERENCES auth.users(id),
  notas TEXT,
  unidad_id UUID REFERENCES public.unidades(id),
  condominio_id UUID REFERENCES public.condominios(id),
  ultimo_contacto TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.actividades_crm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospecto_id UUID NOT NULL REFERENCES public.prospectos(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES public.unidades(id),
  tipo TEXT NOT NULL,
  descripcion TEXT,
  resultado TEXT,
  proximo_paso TEXT,
  fecha_actividad TIMESTAMPTZ NOT NULL DEFAULT now(),
  agente_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.propiedades_interes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospecto_id UUID NOT NULL REFERENCES public.prospectos(id) ON DELETE CASCADE,
  unidad_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'interesado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(prospecto_id, unidad_id)
);

CREATE TABLE public.eventos_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  prospecto_id UUID REFERENCES public.prospectos(id) ON DELETE CASCADE,
  unidad_id UUID REFERENCES public.unidades(id),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  recordatorio_min INT DEFAULT 30,
  notas TEXT,
  agente_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ RLS ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas_autorizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas_comunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedades_interes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_agenda ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles: self select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Profiles: self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: admin all" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- User roles
CREATE POLICY "Roles: self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Roles: admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- Generic policy helper: authenticated users can do everything on operational tables
-- (refinement per role left for next iteration; super_admin always allowed)
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'condominios','unidades','residentes','vehiculos','personas_autorizadas',
    'cobros','egresos','accesos','areas_comunes','reservas','comunicados',
    'incidencias','proveedores','ordenes_mantenimiento',
    'prospectos','actividades_crm','propiedades_interes','eventos_agenda'
  ]) LOOP
    EXECUTE format('CREATE POLICY "%I auth read" ON public.%I FOR SELECT TO authenticated USING (true);', t, t);
    EXECUTE format('CREATE POLICY "%I auth write" ON public.%I FOR INSERT TO authenticated WITH CHECK (true);', t, t);
    EXECUTE format('CREATE POLICY "%I auth update" ON public.%I FOR UPDATE TO authenticated USING (true);', t, t);
    EXECUTE format('CREATE POLICY "%I auth delete" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(),''super_admin'') OR public.has_role(auth.uid(),''admin_condominio''));', t, t);
  END LOOP;
END $$;
