import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import toast from "react-hot-toast";

export type Condominio = Database["public"]["Tables"]["condominios"]["Row"];
export type CondominioInsert = Database["public"]["Tables"]["condominios"]["Insert"];
export type Unidad = Database["public"]["Tables"]["unidades"]["Row"];
export type UnidadInsert = Database["public"]["Tables"]["unidades"]["Insert"];
export type Residente = Database["public"]["Tables"]["residentes"]["Row"];

// ============ EDIFICIOS ============
export function useEdificios() {
  return useQuery({
    queryKey: ["edificios"],
    queryFn: async (): Promise<Condominio[]> => {
      const { data, error } = await supabase
        .from("condominios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        // Durante onboarding (sin edificios aún) RLS puede devolver 403/permission denied.
        // Lo tratamos como lista vacía para que la UI muestre el empty-state limpio.
        const code = (error as { code?: string }).code;
        const status = (error as { status?: number }).status;
        if (status === 401 || status === 403 || code === "PGRST301" || code === "42501") {
          return [];
        }
        throw error;
      }
      return data ?? [];
    },
  });
}


export function useEdificio(id: string | undefined) {
  return useQuery({
    queryKey: ["edificio", id],
    enabled: !!id,
    queryFn: async (): Promise<Condominio | null> => {
      if (!id) return null;
      const { data, error } = await supabase.from("condominios").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveEdificio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CondominioInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("condominios").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data: userRes } = await supabase.auth.getUser();
      const admin_id = userRes.user?.id;
      if (!admin_id) throw new Error("Sesión expirada, inicia sesión nuevamente.");
      const { data, error } = await (supabase as any).rpc("crear_condominio", {
        _nombre: input.nombre,
        _tipo: input.tipo ?? "edificio",
        _direccion: input.direccion ?? null,
        _ciudad: input.ciudad ?? null,
        _departamento: input.departamento ?? null,
        _pais: input.pais ?? "Honduras",
        _total_unidades: input.total_unidades ?? 0,
        _cuota_base: input.cuota_base ?? 0,
        _moneda: input.moneda ?? "L",
        _logo_url: input.logo_url ?? null,
        _latitud: input.latitud ?? null,
        _longitud: input.longitud ?? null,
        _maps_url: input.maps_url ?? null,
        _recargo_mora_pct: input.recargo_mora_pct ?? 0,
        _dias_gracia: input.dias_gracia ?? 5,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["edificios"] });
      if (vars.id) qc.invalidateQueries({ queryKey: ["edificio", vars.id] });
      toast.success(vars.id ? "Edificio actualizado" : "Edificio creado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando edificio"),
  });
}

export function useDeleteEdificio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("condominios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["edificios"] });
      toast.success("Edificio eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

// ============ UNIDADES ============
export function useUnidades(edificioId?: string) {
  return useQuery({
    queryKey: ["unidades", edificioId ?? "all"],
    queryFn: async (): Promise<Unidad[]> => {
      let q = supabase.from("unidades").select("*").order("piso", { ascending: true }).order("numero", { ascending: true });
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useResidentes() {
  return useQuery({
    queryKey: ["residentes-list"],
    queryFn: async (): Promise<Residente[]> => {
      const { data, error } = await supabase.from("residentes").select("*").order("nombre");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePropietarios(condominioId?: string, unidadId?: string | null) {
  return useQuery({
    enabled: !!condominioId,
    queryKey: ["propietarios", condominioId, unidadId ?? null],
    queryFn: async () => {
      let q = supabase
        .from("residentes")
        .select("id,nombre,apellido,unidad_id")
        .eq("tipo", "propietario")
        .eq("condominio_id", condominioId!)
        .order("nombre");
      if (unidadId) q = q.eq("unidad_id", unidadId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useResidentesMap() {
  return useQuery({
    queryKey: ["residentes-map"],
    queryFn: async () => {
      const { data, error } = await supabase.from("residentes").select("id,nombre,apellido");
      if (error) throw error;
      const map = new Map<string, string>();
      (data ?? []).forEach((r) => map.set(r.id, `${r.nombre} ${r.apellido ?? ""}`.trim()));
      return map;
    },
  });
}

export function useSaveUnidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UnidadInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("unidades").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("unidades").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["unidades"] });
      qc.invalidateQueries({ queryKey: ["edificios"] });
      toast.success(vars.id ? "Unidad actualizada" : "Unidad creada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando unidad"),
  });
}

export function useDeleteUnidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("unidades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unidades"] });
      toast.success("Unidad eliminada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

export function useBulkCreateUnidades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: UnidadInsert[]) => {
      const { data, error } = await supabase.from("unidades").insert(rows).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["unidades"] });
      qc.invalidateQueries({ queryKey: ["edificios"] });
      toast.success(`${data?.length ?? 0} unidades creadas`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Error en generación masiva"),
  });
}

export function useBulkUpdateUnidades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: Partial<UnidadInsert> }) => {
      const { error } = await supabase.from("unidades").update(patch).in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["unidades"] });
      qc.invalidateQueries({ queryKey: ["edificios"] });
      toast.success(`${n} unidades actualizadas`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Error en actualización masiva"),
  });
}



// ============ RESIDENTES (CRUD) ============
export type ResidenteInsert = Database["public"]["Tables"]["residentes"]["Insert"];

export function useSaveResidente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ResidenteInsert & { id?: string }) => {
      let saved;
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("residentes").update(rest).eq("id", id).select().single();
        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await supabase.from("residentes").insert(input).select().single();
        if (error) throw error;
        saved = data;
      }
      // Sincronizar unidad: si tiene unidad asignada, marcar al residente como propietario/inquilino
      if (saved.unidad_id) {
        const patch: Database["public"]["Tables"]["unidades"]["Update"] = { estado_administrativo: "ocupada" };
        if (saved.tipo === "propietario") patch.propietario_id = saved.id;
        if (saved.tipo === "inquilino") patch.inquilino_id = saved.id;
        await supabase.from("unidades").update(patch).eq("id", saved.unidad_id);
      }
      return saved;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["residentes-list"] });
      qc.invalidateQueries({ queryKey: ["residentes-map"] });
      qc.invalidateQueries({ queryKey: ["unidades"] });
      toast.success(vars.id ? "Residente actualizado" : "Residente creado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando residente"),
  });
}

export function useDeleteResidente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("residentes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["residentes-list"] });
      qc.invalidateQueries({ queryKey: ["residentes-map"] });
      toast.success("Residente eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

export function useGenerarInvitacion() {
  return useMutation({
    mutationFn: async (residenteId: string) => {
      const { data, error } = await supabase.rpc("generar_invitacion_residente", { _residente_id: residenteId });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as { codigo: string; expira_en: string };
    },
    onError: (e: any) => toast.error(e?.message ?? "Error generando código"),
  });
}


// ============ COBROS ============
export type Cobro = Database["public"]["Tables"]["cobros"]["Row"];
export type CobroInsert = Database["public"]["Tables"]["cobros"]["Insert"];

export function useCobros(edificioId?: string) {
  return useQuery({
    queryKey: ["cobros", edificioId ?? "all"],
    queryFn: async (): Promise<Cobro[]> => {
      let q = supabase.from("cobros").select("*").order("fecha_vencimiento", { ascending: false });
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveCobro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CobroInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("cobros").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("cobros").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["cobros"] });
      toast.success(vars.id ? "Cobro actualizado" : "Cobro creado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando cobro"),
  });
}

// ============ PAGOS (abonos a cobros) ============
export type Pago = Database["public"]["Tables"]["pagos"]["Row"];
export type PagoInsert = Database["public"]["Tables"]["pagos"]["Insert"];

export function usePagosDeCobro(cobroId: string | undefined) {
  return useQuery({
    queryKey: ["pagos", cobroId],
    enabled: !!cobroId,
    queryFn: async (): Promise<Pago[]> => {
      if (!cobroId) return [];
      const { data, error } = await supabase.from("pagos").select("*").eq("cobro_id", cobroId).order("fecha", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePagosDeEdificio(edificioId?: string) {
  return useQuery({
    queryKey: ["pagos-edificio", edificioId ?? "all"],
    queryFn: async (): Promise<Pago[]> => {
      let q = supabase.from("pagos").select("*, cobro:cobros!inner(condominio_id)").order("fecha", { ascending: false });
      if (edificioId) q = q.eq("cobro.condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any;
    },
  });
}

export function useRegistrarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PagoInsert) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("pagos").insert({ ...input, registrado_por: userRes.user?.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["cobros"] });
      qc.invalidateQueries({ queryKey: ["pagos", d.cobro_id] });
      qc.invalidateQueries({ queryKey: ["pagos-edificio"] });
      toast.success("Pago registrado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error registrando pago"),
  });
}

export function useAnularPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pagoId: string) => {
      const { error } = await supabase.from("pagos").delete().eq("id", pagoId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cobros"] });
      qc.invalidateQueries({ queryKey: ["pagos"] });
      qc.invalidateQueries({ queryKey: ["pagos-edificio"] });
      toast.success("Pago anulado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error anulando pago"),
  });
}

export function useMarcarVencidos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (condoId?: string) => {
      const { data, error } = await supabase.rpc("marcar_cobros_vencidos", { _condo_id: condoId ?? undefined } as any);
      if (error) throw error;
      return data as unknown as number;
    },
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["cobros"] });
      toast.success(n > 0 ? `${n} cobro(s) marcados vencidos` : "Sin cambios");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

// Compat: usado en CobrosTable existente — abre un pago por el saldo completo
export function useMarcarPagado() {
  const reg = useRegistrarPago();
  return {
    ...reg,
    mutate: ({ id, metodo, monto }: { id: string; metodo: string; monto: number }) =>
      reg.mutate({ cobro_id: id, monto, metodo, fecha: new Date().toISOString().slice(0, 10) } as PagoInsert),
  };
}

export function useDeleteCobro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cobros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cobros"] });
      toast.success("Cobro eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

export type PreviewCobroRow = {
  unidad_id: string;
  unidad_numero: string;
  residente_id: string | null;
  monto: number;
  duplicado: boolean;
};

export function usePreviewCobrosMensuales(args: { edificioId: string; mes: string; concepto: string } | null) {
  return useQuery({
    queryKey: ["cobros-preview", args?.edificioId, args?.mes, args?.concepto],
    enabled: !!args && !!args.edificioId,
    queryFn: async (): Promise<PreviewCobroRow[]> => {
      if (!args) return [];
      const { edificioId, mes, concepto } = args;
      const [{ data: unidades, error: e1 }, { data: edif }, { data: existentes }] = await Promise.all([
        supabase.from("unidades").select("id, numero, mantenimiento_mensual, propietario_id, inquilino_id").eq("condominio_id", edificioId).order("numero"),
        supabase.from("condominios").select("cuota_base").eq("id", edificioId).maybeSingle(),
        supabase.from("cobros").select("unidad_id, concepto").eq("condominio_id", edificioId).ilike("concepto", `%${mes}%`),
      ]);
      if (e1) throw e1;
      const baseCuota = Number(edif?.cuota_base ?? 0);
      const dupSet = new Set((existentes ?? []).filter((c) => c.concepto?.toLowerCase().includes(concepto.toLowerCase())).map((c) => c.unidad_id ?? ""));
      return (unidades ?? []).map((u) => ({
        unidad_id: u.id,
        unidad_numero: u.numero,
        residente_id: u.inquilino_id ?? u.propietario_id ?? null,
        monto: Number(u.mantenimiento_mensual ?? baseCuota ?? 0),
        duplicado: dupSet.has(u.id),
      }));
    },
  });
}

export function useGenerarCobrosMensuales() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ edificioId, mes, concepto, vencimiento, unidadIds }: { edificioId: string; mes: string; concepto: string; vencimiento: string; unidadIds: string[] }) => {
      if (unidadIds.length === 0) return [];
      const { data: unidades, error: e1 } = await supabase
        .from("unidades")
        .select("id, numero, mantenimiento_mensual, propietario_id, inquilino_id, condominio_id")
        .eq("condominio_id", edificioId)
        .in("id", unidadIds);
      if (e1) throw e1;
      const { data: edif } = await supabase.from("condominios").select("cuota_base").eq("id", edificioId).single();
      const baseCuota = edif?.cuota_base ?? 0;
      const rows: CobroInsert[] = (unidades ?? []).map((u) => ({
        condominio_id: u.condominio_id,
        unidad_id: u.id,
        residente_id: u.inquilino_id ?? u.propietario_id ?? null,
        concepto: `${concepto} ${mes} · Unidad ${u.numero}`,
        monto: Number(u.mantenimiento_mensual ?? baseCuota ?? 0),
        fecha_vencimiento: vencimiento,
        estado: "pendiente" as const,
      }));
      if (rows.length === 0) return [];
      const { data, error } = await supabase.from("cobros").insert(rows).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["cobros"] });
      qc.invalidateQueries({ queryKey: ["cobros-preview"] });
      toast.success(`${d?.length ?? 0} cobros generados`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Error generando cobros"),
  });
}

// Días de mora (>0 = vencido)
export function diasMora(fechaVencimiento: string, estado: string): number {
  if (estado === "pagado") return 0;
  const v = new Date(fechaVencimiento + "T00:00:00");
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return Math.floor((hoy.getTime() - v.getTime()) / 86400000);
}

export function useCobro(id: string | undefined) {
  return useQuery({
    queryKey: ["cobro", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("cobros").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// ============ EGRESOS ============
export type Egreso = Database["public"]["Tables"]["egresos"]["Row"];
export type EgresoInsert = Database["public"]["Tables"]["egresos"]["Insert"];

export function useEgresos(edificioId?: string) {
  return useQuery({
    queryKey: ["egresos", edificioId ?? "all"],
    queryFn: async (): Promise<Egreso[]> => {
      let q = supabase.from("egresos").select("*").order("fecha", { ascending: false });
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveEgreso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EgresoInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("egresos").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("egresos").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["egresos"] });
      toast.success(vars.id ? "Egreso actualizado" : "Egreso registrado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando egreso"),
  });
}

export function useDeleteEgreso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("egresos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["egresos"] });
      toast.success("Egreso eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

// ============ ACCESOS ============
export type Acceso = Database["public"]["Tables"]["accesos"]["Row"];
export type AccesoInsert = Database["public"]["Tables"]["accesos"]["Insert"];

export function useAccesos(edificioId?: string) {
  return useQuery({
    queryKey: ["accesos", edificioId ?? "all"],
    queryFn: async (): Promise<Acceso[]> => {
      let q = supabase.from("accesos").select("*").order("fecha_entrada", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(500);
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveAcceso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AccesoInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("accesos").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("accesos").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["accesos"] });
      toast.success(vars.id ? "Acceso actualizado" : "Acceso registrado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando acceso"),
  });
}

export function useMarcarSalida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("accesos").update({ fecha_salida: new Date().toISOString() }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accesos"] });
      toast.success("Salida registrada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error registrando salida"),
  });
}

export function useDeleteAcceso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accesos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accesos"] });
      toast.success("Acceso eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

export function useValidarPase() {
  return useMutation({
    mutationFn: async (codigo: string): Promise<Acceso | null> => {
      const c = codigo.trim();
      if (!c) return null;
      const { data, error } = await supabase
        .from("accesos")
        .select("*")
        .ilike("qr_code", c)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useRegistrarUso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (acceso: Acceso) => {
      const usados = (acceso.usos_actuales ?? 0) + 1;
      const max = acceso.usos_maximos ?? 1;
      if (usados > max) throw new Error("Pase agotado");
      const patch: any = { usos_actuales: usados };
      if (!acceso.fecha_entrada) patch.fecha_entrada = new Date().toISOString();
      const { data, error } = await supabase.from("accesos").update(patch).eq("id", acceso.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accesos"] });
      toast.success("Acceso autorizado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error registrando uso"),
  });
}

// ============ MI RESIDENTE (portal) — usa contexto de residencia activa ============
import { useResidenciaActiva } from "@/lib/portal-context";

export function useMiResidente() {
  const { activa, isLoading } = useResidenciaActiva();
  return { data: activa, isLoading } as const;
}

export function useMisPases() {
  const { activa } = useResidenciaActiva();
  const condoId = activa?.condominio_id;
  return useQuery({
    queryKey: ["mis-pases", condoId ?? "none"],
    enabled: !!condoId,
    queryFn: async (): Promise<Acceso[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || !condoId) return [];
      const { data, error } = await supabase
        .from("accesos")
        .select("*")
        .eq("autorizado_por", u.user.id)
        .eq("condominio_id", condoId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMisCobros() {
  const { activa } = useResidenciaActiva();
  return useQuery({
    queryKey: ["mis-cobros", activa?.id ?? "none"],
    enabled: !!activa?.id,
    queryFn: async (): Promise<Cobro[]> => {
      if (!activa?.id) return [];
      const { data, error } = await supabase.from("cobros").select("*").eq("residente_id", activa.id).order("fecha_vencimiento", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useComunicadosResidente() {
  const { activa } = useResidenciaActiva();
  const condoId = activa?.condominio_id;
  return useQuery({
    queryKey: ["mis-comunicados", condoId ?? "none"],
    enabled: !!condoId,
    queryFn: async () => {
      if (!condoId) return [];
      const { data, error } = await supabase.from("comunicados").select("*").eq("condominio_id", condoId).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}








// ============ ÁREAS COMUNES ============
export type AreaComun = Database["public"]["Tables"]["areas_comunes"]["Row"];
export type AreaComunInsert = Database["public"]["Tables"]["areas_comunes"]["Insert"];

export function useAreas(edificioId?: string) {
  return useQuery({
    queryKey: ["areas", edificioId ?? "all"],
    queryFn: async (): Promise<AreaComun[]> => {
      let q = supabase.from("areas_comunes").select("*").order("nombre");
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AreaComunInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("areas_comunes").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("areas_comunes").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["areas"] });
      toast.success(vars.id ? "Área actualizada" : "Área creada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando área"),
  });
}

export function useDeleteArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("areas_comunes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área eliminada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

// ============ RESERVAS ============
export type Reserva = Database["public"]["Tables"]["reservas"]["Row"];
export type ReservaInsert = Database["public"]["Tables"]["reservas"]["Insert"];

export function useReservas(edificioId?: string) {
  return useQuery({
    queryKey: ["reservas", edificioId ?? "all"],
    queryFn: async (): Promise<Reserva[]> => {
      let q = supabase.from("reservas").select("*").order("fecha_inicio", { ascending: false }).limit(500);
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReservaInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("reservas").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("reservas").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["reservas"] });
      toast.success(vars.id ? "Reserva actualizada" : "Reserva creada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando reserva"),
  });
}

export function useDeleteReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reservas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservas"] });
      toast.success("Reserva eliminada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

// ============ PROSPECTOS (CRM) ============
export type Prospecto = Database["public"]["Tables"]["prospectos"]["Row"];
export type ProspectoInsert = Database["public"]["Tables"]["prospectos"]["Insert"];
export type EtapaPipeline = Database["public"]["Enums"]["etapa_pipeline"];
export type TemperaturaProspecto = Database["public"]["Enums"]["temperatura_prospecto"];
export type TipoProspecto = Database["public"]["Enums"]["tipo_prospecto"];

export const ETAPAS_PIPELINE: EtapaPipeline[] = [
  "nuevo", "contactado", "interesado", "visita_agendada", "negociacion", "cierre", "ganado", "perdido",
];

export function useProspectos(edificioId?: string) {
  return useQuery({
    queryKey: ["prospectos", edificioId ?? "all"],
    queryFn: async (): Promise<Prospecto[]> => {
      let q = supabase.from("prospectos").select("*").order("created_at", { ascending: false });
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveProspecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProspectoInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("prospectos").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("prospectos").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["prospectos"] });
      toast.success(vars.id ? "Prospecto actualizado" : "Prospecto creado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando prospecto"),
  });
}

export function useUpdateEtapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, etapa }: { id: string; etapa: EtapaPipeline }) => {
      const { error } = await supabase.from("prospectos").update({ etapa_pipeline: etapa, ultimo_contacto: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospectos"] }),
    onError: (e: any) => toast.error(e?.message ?? "Error moviendo prospecto"),
  });
}

export function useDeleteProspecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prospectos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospectos"] });
      toast.success("Prospecto eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

// ============ ACTIVIDADES CRM ============
export type Actividad = Database["public"]["Tables"]["actividades_crm"]["Row"];
export type ActividadInsert = Database["public"]["Tables"]["actividades_crm"]["Insert"];

export function useActividades(prospectoId?: string) {
  return useQuery({
    queryKey: ["actividades", prospectoId ?? "none"],
    enabled: !!prospectoId,
    queryFn: async (): Promise<Actividad[]> => {
      if (!prospectoId) return [];
      const { data, error } = await supabase.from("actividades_crm").select("*").eq("prospecto_id", prospectoId).order("fecha_actividad", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ActividadInsert) => {
      const { data, error } = await supabase.from("actividades_crm").insert(input).select().single();
      if (error) throw error;
      await supabase.from("prospectos").update({ ultimo_contacto: new Date().toISOString() }).eq("id", input.prospecto_id);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["actividades", vars.prospecto_id] });
      qc.invalidateQueries({ queryKey: ["prospectos"] });
      toast.success("Actividad registrada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando actividad"),
  });
}

export function useDeleteActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; prospectoId: string }) => {
      const { error } = await supabase.from("actividades_crm").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["actividades", vars.prospectoId] });
      toast.success("Actividad eliminada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

// ============ PERSONAS AUTORIZADAS ============
export type PersonaAutorizada = Database["public"]["Tables"]["personas_autorizadas"]["Row"];
export type PersonaAutorizadaInsert = Database["public"]["Tables"]["personas_autorizadas"]["Insert"];

export function usePersonasAutorizadas(residenteId?: string) {
  return useQuery({
    queryKey: ["personas-autorizadas", residenteId],
    enabled: !!residenteId,
    queryFn: async (): Promise<PersonaAutorizada[]> => {
      const { data, error } = await supabase
        .from("personas_autorizadas")
        .select("*")
        .eq("residente_id", residenteId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSavePersonaAutorizada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PersonaAutorizadaInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("personas_autorizadas").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("personas_autorizadas").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["personas-autorizadas", vars.residente_id] });
      toast.success(vars.id ? "Persona actualizada" : "Persona agregada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando"),
  });
}

export function useDeletePersonaAutorizada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; residenteId: string }) => {
      const { error } = await supabase.from("personas_autorizadas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["personas-autorizadas", vars.residenteId] });
      toast.success("Persona eliminada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

// ============ VEHÍCULOS ============
export type Vehiculo = Database["public"]["Tables"]["vehiculos"]["Row"];
export type VehiculoInsert = Database["public"]["Tables"]["vehiculos"]["Insert"];

export function useVehiculos(residenteId?: string) {
  return useQuery({
    queryKey: ["vehiculos", residenteId],
    enabled: !!residenteId,
    queryFn: async (): Promise<Vehiculo[]> => {
      const { data, error } = await supabase
        .from("vehiculos")
        .select("*")
        .eq("residente_id", residenteId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: VehiculoInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("vehiculos").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("vehiculos").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["vehiculos", vars.residente_id] });
      toast.success(vars.id ? "Vehículo actualizado" : "Vehículo agregado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error guardando vehículo"),
  });
}

export function useDeleteVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; residenteId: string }) => {
      const { error } = await supabase.from("vehiculos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["vehiculos", vars.residenteId] });
      toast.success("Vehículo eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error eliminando"),
  });
}

export function useCobrosDeResidente(residenteId?: string) {
  return useQuery({
    queryKey: ["cobros-residente", residenteId],
    enabled: !!residenteId,
    queryFn: async (): Promise<Cobro[]> => {
      const { data, error } = await supabase
        .from("cobros")
        .select("*")
        .eq("residente_id", residenteId!)
        .order("fecha_vencimiento", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}


// ============ MANTENIMIENTO ============
export type Incidencia = Database["public"]["Tables"]["incidencias"]["Row"];
export type IncidenciaInsert = Database["public"]["Tables"]["incidencias"]["Insert"];
export type OrdenMantenimiento = Database["public"]["Tables"]["ordenes_mantenimiento"]["Row"];
export type OrdenMantenimientoInsert = Database["public"]["Tables"]["ordenes_mantenimiento"]["Insert"];
export type Proveedor = Database["public"]["Tables"]["proveedores"]["Row"];
export type ProveedorInsert = Database["public"]["Tables"]["proveedores"]["Insert"];

export function useIncidencias(edificioId?: string) {
  return useQuery({
    queryKey: ["incidencias", edificioId ?? "all"],
    queryFn: async (): Promise<Incidencia[]> => {
      let q = supabase.from("incidencias").select("*").order("created_at", { ascending: false });
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useSaveIncidencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: IncidenciaInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("incidencias").update(rest).eq("id", id).select().single();
        if (error) throw error; return data;
      }
      const { data, error } = await supabase.from("incidencias").insert(input).select().single();
      if (error) throw error; return data;
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["incidencias"] }); toast.success(v.id ? "Incidencia actualizada" : "Incidencia reportada"); },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}
export function useDeleteIncidencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("incidencias").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incidencias"] }); toast.success("Incidencia eliminada"); },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

export function useOrdenes(edificioId?: string) {
  return useQuery({
    queryKey: ["ordenes", edificioId ?? "all"],
    queryFn: async (): Promise<OrdenMantenimiento[]> => {
      let q = supabase.from("ordenes_mantenimiento").select("*").order("created_at", { ascending: false });
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useSaveOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: OrdenMantenimientoInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("ordenes_mantenimiento").update(rest).eq("id", id).select().single();
        if (error) throw error; return data;
      }
      const { data, error } = await supabase.from("ordenes_mantenimiento").insert(input).select().single();
      if (error) throw error; return data;
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["ordenes"] }); toast.success(v.id ? "Orden actualizada" : "Orden creada"); },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}
export function useDeleteOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("ordenes_mantenimiento").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ordenes"] }); toast.success("Orden eliminada"); },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

export function useProveedores(edificioId?: string) {
  return useQuery({
    queryKey: ["proveedores", edificioId ?? "all"],
    queryFn: async (): Promise<Proveedor[]> => {
      let q = supabase.from("proveedores").select("*").order("nombre");
      if (edificioId) q = q.eq("condominio_id", edificioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useSaveProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProveedorInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("proveedores").update(rest).eq("id", id).select().single();
        if (error) throw error; return data;
      }
      const { data, error } = await supabase.from("proveedores").insert(input).select().single();
      if (error) throw error; return data;
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["proveedores"] }); toast.success(v.id ? "Proveedor actualizado" : "Proveedor creado"); },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}
export function useDeleteProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("proveedores").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["proveedores"] }); toast.success("Proveedor eliminado"); },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}
