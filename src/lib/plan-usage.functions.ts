import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UNLIMITED = 2147483647;

export const getMyPlanUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Fetch admin's condominios with plan info
    const { data: condos, error: condosError } = await supabase
      .from("condominios")
      .select("id, nombre")
      .eq("admin_id", userId);

    if (condosError) throw new Error(condosError.message);

    let planNombre = "Free";
    let planPrecio = 0;
    let maxEdificios = 1;
    let maxUnidades = 60;
    let maxAdmins = 2;

    if (condos && condos.length > 0) {
      const condoIds = condos.map((c: any) => c.id);
      const { data: subs } = await supabase
        .from("suscripciones")
        .select("plan_id")
        .in("condominio_id", condoIds)
        .limit(1);
      const planId = subs?.[0]?.plan_id;
      if (planId) {
        const { data: plan } = await supabase
          .from("planes")
          .select("nombre, precio_mensual, max_edificios, max_unidades, max_admins")
          .eq("id", planId)
          .maybeSingle();
        if (plan) {
          planNombre = plan.nombre ?? "Free";
          planPrecio = Number(plan.precio_mensual ?? 0);
          maxEdificios = plan.max_edificios ?? UNLIMITED;
          maxUnidades = plan.max_unidades ?? UNLIMITED;
          maxAdmins = plan.max_admins ?? UNLIMITED;
        }
      }
    }

    const edificiosUsed = condos?.length ?? 0;

    // Per-condominio counts
    const porEdificio = await Promise.all(
      (condos ?? []).map(async (c: any) => {
        const [{ count: unidadesCount }, { count: adminsCount }] = await Promise.all([
          supabase.from("unidades").select("id", { count: "exact", head: true }).eq("condominio_id", c.id),
          supabase.from("condominio_members").select("id", { count: "exact", head: true }).eq("condominio_id", c.id).in("role", ["admin", "owner"]),
        ]);
        return {
          id: c.id,
          nombre: c.nombre,
          unidades: { used: unidadesCount ?? 0, max: maxUnidades },
          admins: { used: adminsCount ?? 0, max: maxAdmins },
        };
      })
    );

    return {
      plan: { nombre: planNombre, precio: planPrecio },
      edificios: { used: edificiosUsed, max: maxEdificios },
      porEdificio,
      unlimited: UNLIMITED,
    };
  });
