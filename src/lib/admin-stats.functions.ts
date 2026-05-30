import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleRow) throw new Error("No autorizado");

    const [
      condos,
      unidades,
      residentes,
      usuarios,
      suscripciones,
      planes,
      pagos,
      condosRecientes,
    ] = await Promise.all([
      supabaseAdmin.from("condominios").select("id, nombre, tipo, ciudad, activo, created_at, admin_id"),
      supabaseAdmin.from("unidades").select("id, condominio_id"),
      supabaseAdmin.from("residentes").select("id, condominio_id, user_id"),
      supabaseAdmin.from("profiles").select("id, email, created_at"),
      supabaseAdmin.from("suscripciones").select("condominio_id, plan_id, estado, fecha_inicio"),
      supabaseAdmin.from("planes").select("id, nombre, precio_mensual, orden").order("orden"),
      supabaseAdmin.from("pagos").select("monto, fecha, created_at"),
      supabaseAdmin.from("condominios").select("id, nombre, ciudad, created_at, admin_id").order("created_at", { ascending: false }).limit(10),
    ]);

    const planMap = new Map((planes.data ?? []).map((p) => [p.id, p]));
    const subByCondo = new Map((suscripciones.data ?? []).map((s) => [s.condominio_id, s]));

    // Distribución por plan
    const distPlanes = (planes.data ?? []).map((p) => ({
      plan: p.nombre,
      precio: Number(p.precio_mensual),
      count: (suscripciones.data ?? []).filter((s) => s.plan_id === p.id && s.estado === "activa").length,
    }));

    // Conteos por condominio
    const unidadesPorCondo = new Map<string, number>();
    (unidades.data ?? []).forEach((u) => unidadesPorCondo.set(u.condominio_id, (unidadesPorCondo.get(u.condominio_id) ?? 0) + 1));
    const residentesPorCondo = new Map<string, number>();
    (residentes.data ?? []).forEach((r) => residentesPorCondo.set(r.condominio_id, (residentesPorCondo.get(r.condominio_id) ?? 0) + 1));

    // Admin email lookup
    const adminIds = Array.from(new Set((condosRecientes.data ?? []).map((c) => c.admin_id).filter(Boolean) as string[]));
    let adminEmails = new Map<string, string>();
    if (adminIds.length) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id, email, full_name").in("id", adminIds);
      adminEmails = new Map((profs ?? []).map((p) => [p.id, p.full_name || p.email]));
    }

    const recientes = (condosRecientes.data ?? []).map((c) => {
      const sub = subByCondo.get(c.id);
      const plan = sub ? planMap.get(sub.plan_id) : null;
      return {
        id: c.id,
        nombre: c.nombre,
        ciudad: c.ciudad,
        admin: c.admin_id ? adminEmails.get(c.admin_id) ?? "—" : "—",
        plan: plan?.nombre ?? "—",
        unidades: unidadesPorCondo.get(c.id) ?? 0,
        residentes: residentesPorCondo.get(c.id) ?? 0,
        created_at: c.created_at,
      };
    });

    // Signups últimos 30 días por día
    const hoy = new Date();
    const dias: { fecha: string; signups: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dias.push({ fecha: key, signups: 0 });
    }
    const diasMap = new Map(dias.map((d) => [d.fecha, d]));
    (usuarios.data ?? []).forEach((u) => {
      const key = (u.created_at as string).slice(0, 10);
      const entry = diasMap.get(key);
      if (entry) entry.signups++;
    });

    // Ingresos del mes (suma de pagos del mes actual)
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
    const pagosMes = (pagos.data ?? []).filter((p) => (p.fecha as string) >= inicioMes);
    const ingresosMes = pagosMes.reduce((acc, p) => acc + Number(p.monto), 0);

    // MRR estimado por suscripciones activas
    const mrr = (suscripciones.data ?? [])
      .filter((s) => s.estado === "activa")
      .reduce((acc, s) => acc + Number(planMap.get(s.plan_id)?.precio_mensual ?? 0), 0);

    return {
      totales: {
        condominios: condos.data?.length ?? 0,
        condominios_activos: (condos.data ?? []).filter((c) => c.activo).length,
        unidades: unidades.data?.length ?? 0,
        residentes: residentes.data?.length ?? 0,
        usuarios: usuarios.data?.length ?? 0,
        ingresos_mes: ingresosMes,
        mrr,
      },
      distribucion_planes: distPlanes,
      condominios_recientes: recientes,
      signups_30d: dias,
    };
  });
