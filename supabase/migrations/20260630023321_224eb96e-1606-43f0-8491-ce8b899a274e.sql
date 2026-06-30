DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon', t.relname);
  END LOOP;
END $$;

-- Revoke SELECT from anon on auth-only tables (only planes needs anon read)
REVOKE SELECT ON
  public.pagos, public.incidencias, public.invitaciones_residente, public.proveedores,
  public.ordenes_mantenimiento, public.accesos, public.unidades, public.condominios,
  public.residentes, public.reservas, public.profiles, public.areas_comunes,
  public.user_roles, public.egresos, public.cobros, public.vehiculos,
  public.personas_autorizadas, public.comunicados, public.condominio_members,
  public.propiedades_interes, public.eventos_agenda, public.prospectos,
  public.suscripciones, public.actividades_crm, public.puntos_rondin,
  public.rondines_log, public.guardia_turnos
FROM anon;