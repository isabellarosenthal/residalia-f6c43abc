import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UNLIMITED = 2147483647;

export const getMyPlanUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: condos, error: condosError } = await supabase
      .from("condominios")
      .select("id, nombre")
      .eq("admin_id", userId);

    if (condosError) throw new Error(condosError.message);

    let planNombre = "Lobby";
    let planPrecio = 0;
    let maxEdificios = 1;
    let maxUnidades = 60;
    let maxAdmins = 2;
    let estado: string | null = null;
    let trialEndsAt: string | null = null;
    let diasRestantes: number | null = null;
    let activa = true;

    if (condos && condos.length > 0) {
      const condoIds = condos.map((c: any) => c.id);
      const { data: subs } = await supabase
        .from("suscripciones")
        .select("plan_id, estado, trial_ends_at")
        .in("condominio_id", condoIds)
        .limit(1);
      const sub = subs?.[0];
      const planId = sub?.plan_id;
      estado = (sub?.estado as string) ?? null;
      trialEndsAt = (sub?.trial_ends_at as string) ?? null;
      if (trialEndsAt) {
        const ms = new Date(trialEndsAt).getTime() - Date.now();
        diasRestantes = Math.max(0, Math.ceil(ms / 86400000));
      }
      activa = estado === "activa" || (estado === "trial" && (!trialEndsAt || (diasRestantes ?? 0) > 0));
      if (planId) {
        const { data: plan } = await supabase
          .from("planes")
          .select("nombre, precio_mensual, max_edificios, max_unidades, max_admins")
          .eq("id", planId)
          .maybeSingle();
        if (plan) {
          planNombre = plan.nombre ?? "Lobby";
          planPrecio = Number(plan.precio_mensual ?? 0);
          maxEdificios = plan.max_edificios ?? UNLIMITED;
          maxUnidades = plan.max_unidades ?? UNLIMITED;
          maxAdmins = plan.max_admins ?? UNLIMITED;
        }
      }
    } else {
      // No condos yet: read plan from profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("plan_seleccionado")
        .eq("id", userId)
        .maybeSingle();
      const planNom = prof?.plan_seleccionado;
      if (planNom) {
        const { data: plan } = await supabase
          .from("planes")
          .select("nombre, precio_mensual, max_edificios, max_unidades, max_admins")
          .ilike("nombre", planNom)
          .maybeSingle();
        if (plan) {
          planNombre = plan.nombre ?? planNom;
          planPrecio = Number(plan.precio_mensual ?? 0);
          maxEdificios = plan.max_edificios ?? UNLIMITED;
          maxUnidades = plan.max_unidades ?? UNLIMITED;
          maxAdmins = plan.max_admins ?? UNLIMITED;
        }
      }
    }

    const edificiosUsed = condos?.length ?? 0;
    const condoIds = (condos ?? []).map((c: any) => c.id);

    let adminsUsed = 0;
    if (condoIds.length > 0) {
      const { data: members } = await supabase
        .from("condominio_members")
        .select("user_id")
        .in("condominio_id", condoIds)
        .in("role", ["admin", "owner"]);
      adminsUsed = new Set((members ?? []).map((m: any) => m.user_id)).size;
    }

    const porEdificio = await Promise.all(
      (condos ?? []).map(async (c: any) => {
        const { count: unidadesCount } = await supabase
          .from("unidades").select("id", { count: "exact", head: true }).eq("condominio_id", c.id);
        return {
          id: c.id,
          nombre: c.nombre,
          unidades: { used: unidadesCount ?? 0, max: maxUnidades },
        };
      })
    );

    return {
      plan: { nombre: planNombre, precio: planPrecio },
      edificios: { used: edificiosUsed, max: maxEdificios },
      admins: { used: adminsUsed, max: maxAdmins },
      porEdificio,
      unlimited: UNLIMITED,
      estado,
      trialEndsAt,
      diasRestantes,
      activa,
    };
  });
