import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("No autorizado");
}

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    await assertSuperAdmin(userId);

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

    const distPlanes = (planes.data ?? []).map((p) => ({
      plan: p.nombre,
      precio: Number(p.precio_mensual),
      count: (suscripciones.data ?? []).filter((s) => s.plan_id === p.id && s.estado === "activa").length,
    }));

    const unidadesPorCondo = new Map<string, number>();
    (unidades.data ?? []).forEach((u) => unidadesPorCondo.set(u.condominio_id, (unidadesPorCondo.get(u.condominio_id) ?? 0) + 1));
    const residentesPorCondo = new Map<string, number>();
    (residentes.data ?? []).forEach((r) => residentesPorCondo.set(r.condominio_id, (residentesPorCondo.get(r.condominio_id) ?? 0) + 1));

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

    const hoy = new Date();
    const dias: { fecha: string; signups: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      dias.push({ fecha: d.toISOString().slice(0, 10), signups: 0 });
    }
    const diasMap = new Map(dias.map((d) => [d.fecha, d]));
    (usuarios.data ?? []).forEach((u) => {
      const key = (u.created_at as string).slice(0, 10);
      const entry = diasMap.get(key);
      if (entry) entry.signups++;
    });

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
    const pagosMes = (pagos.data ?? []).filter((p) => (p.fecha as string) >= inicioMes);
    const ingresosMes = pagosMes.reduce((acc, p) => acc + Number(p.monto), 0);

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

export const listSuscripciones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);

    const [condos, subs, planes, unidades, residentes, profiles] = await Promise.all([
      supabaseAdmin.from("condominios").select("id, nombre, ciudad, activo, created_at, admin_id").order("created_at", { ascending: false }),
      supabaseAdmin.from("suscripciones").select("id, condominio_id, plan_id, estado, fecha_inicio"),
      supabaseAdmin.from("planes").select("id, nombre, precio_mensual").order("orden"),
      supabaseAdmin.from("unidades").select("condominio_id"),
      supabaseAdmin.from("residentes").select("condominio_id"),
      supabaseAdmin.from("profiles").select("id, email, full_name"),
    ]);

    const subMap = new Map((subs.data ?? []).map((s) => [s.condominio_id, s]));
    const profMap = new Map((profiles.data ?? []).map((p) => [p.id, p]));
    const uCount = new Map<string, number>();
    (unidades.data ?? []).forEach((u) => uCount.set(u.condominio_id, (uCount.get(u.condominio_id) ?? 0) + 1));
    const rCount = new Map<string, number>();
    (residentes.data ?? []).forEach((r) => rCount.set(r.condominio_id, (rCount.get(r.condominio_id) ?? 0) + 1));

    const rows = (condos.data ?? []).map((c) => {
      const sub = subMap.get(c.id);
      const prof = c.admin_id ? profMap.get(c.admin_id) : null;
      return {
        condominio_id: c.id,
        nombre: c.nombre,
        ciudad: c.ciudad,
        activo: c.activo,
        created_at: c.created_at,
        admin_email: prof?.email ?? "—",
        admin_nombre: prof?.full_name ?? "—",
        plan_id: sub?.plan_id ?? null,
        estado: sub?.estado ?? "sin_suscripcion",
        unidades: uCount.get(c.id) ?? 0,
        residentes: rCount.get(c.id) ?? 0,
      };
    });

    return { rows, planes: planes.data ?? [] };
  });

export const updateSuscripcionPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { condominio_id: string; plan_id: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { data: existing } = await supabaseAdmin.from("suscripciones").select("id").eq("condominio_id", data.condominio_id).maybeSingle();
    if (existing) {
      const { error } = await supabaseAdmin.from("suscripciones").update({ plan_id: data.plan_id, updated_at: new Date().toISOString() }).eq("condominio_id", data.condominio_id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("suscripciones").insert({ condominio_id: data.condominio_id, plan_id: data.plan_id, estado: "activa" });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const updateSuscripcionEstado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { condominio_id: string; estado: string }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await supabaseAdmin.from("suscripciones").update({ estado: data.estado, updated_at: new Date().toISOString() }).eq("condominio_id", data.condominio_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleCondominioActivo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { condominio_id: string; activo: boolean }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await supabaseAdmin.from("condominios").update({ activo: data.activo }).eq("id", data.condominio_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listPlanes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin.from("planes").select("*").order("orden");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; precio_mensual?: number; max_unidades?: number | null; max_edificios?: number | null; max_admins?: number | null; activo?: boolean }) => d)
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("planes").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listUsuarios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const [profiles, roles, condos, members] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, email, full_name, created_at, plan_seleccionado").order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("condominios").select("id, nombre, admin_id"),
      supabaseAdmin.from("condominio_members").select("user_id, condominio_id"),
    ]);
    const roleMap = new Map((roles.data ?? []).map((r) => [r.user_id, r.role]));
    const condoByAdmin = new Map<string, string[]>();
    (condos.data ?? []).forEach((c) => {
      if (!c.admin_id) return;
      const list = condoByAdmin.get(c.admin_id) ?? [];
      list.push(c.nombre);
      condoByAdmin.set(c.admin_id, list);
    });
    const condoNameMap = new Map((condos.data ?? []).map((c) => [c.id, c.nombre]));
    const condoByMember = new Map<string, string[]>();
    (members.data ?? []).forEach((m) => {
      const name = condoNameMap.get(m.condominio_id);
      if (!name) return;
      const list = condoByMember.get(m.user_id) ?? [];
      if (!list.includes(name)) list.push(name);
      condoByMember.set(m.user_id, list);
    });
    return (profiles.data ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      created_at: p.created_at,
      plan_seleccionado: p.plan_seleccionado,
      role: roleMap.get(p.id) ?? null,
      edificios: condoByAdmin.get(p.id) ?? condoByMember.get(p.id) ?? [],
    }));
  });
