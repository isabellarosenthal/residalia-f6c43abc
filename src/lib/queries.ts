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
      if (error) throw error;
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
      const { data, error } = await supabase.from("condominios").insert(input).select().single();
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
