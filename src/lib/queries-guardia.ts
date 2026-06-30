import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import toast from "react-hot-toast";

export type Turno = Database["public"]["Tables"]["guardia_turnos"]["Row"];
export type TurnoInsert = Database["public"]["Tables"]["guardia_turnos"]["Insert"];
export type PuntoRondin = Database["public"]["Tables"]["puntos_rondin"]["Row"];
export type PuntoInsert = Database["public"]["Tables"]["puntos_rondin"]["Insert"];
export type RondinLog = Database["public"]["Tables"]["rondines_log"]["Row"];

// ============ TURNOS ============
export function useTurnos(condominioId?: string, desde?: string, hasta?: string) {
  return useQuery({
    queryKey: ["turnos", condominioId, desde, hasta],
    queryFn: async (): Promise<Turno[]> => {
      let q = supabase.from("guardia_turnos").select("*").order("fecha", { ascending: false }).order("hora_inicio");
      if (condominioId && condominioId !== "all") q = q.eq("condominio_id", condominioId);
      if (desde) q = q.gte("fecha", desde);
      if (hasta) q = q.lte("fecha", hasta);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMisTurnos() {
  return useQuery({
    queryKey: ["mis-turnos"],
    queryFn: async (): Promise<Turno[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("guardia_turnos")
        .select("*")
        .eq("guardia_id", u.user.id)
        .gte("fecha", new Date(Date.now() - 86400000).toISOString().slice(0, 10))
        .order("fecha")
        .order("hora_inicio");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TurnoInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("guardia_turnos").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("guardia_turnos").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turnos"] });
      qc.invalidateQueries({ queryKey: ["mis-turnos"] });
      toast.success("Turno guardado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

export function useDeleteTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("guardia_turnos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turnos"] });
      toast.success("Turno eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

export function useIniciarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("guardia_turnos")
        .update({ estado: "en_curso", inicio_real: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mis-turnos"] });
      qc.invalidateQueries({ queryKey: ["turnos"] });
      toast.success("Turno iniciado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

export function useCerrarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("guardia_turnos")
        .update({ estado: "completado", fin_real: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mis-turnos"] });
      qc.invalidateQueries({ queryKey: ["turnos"] });
      toast.success("Turno cerrado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

// ============ PUNTOS DE RONDÍN ============
export function usePuntos(condominioId?: string) {
  return useQuery({
    queryKey: ["puntos-rondin", condominioId],
    queryFn: async (): Promise<PuntoRondin[]> => {
      let q = supabase.from("puntos_rondin").select("*").order("orden").order("nombre");
      if (condominioId && condominioId !== "all") q = q.eq("condominio_id", condominioId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

const randomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `PUNTO-${s}`;
};

export function useSavePunto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PuntoInsert & { id?: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { data, error } = await supabase.from("puntos_rondin").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const payload = { ...input, qr_code: input.qr_code ?? randomCode() };
      const { data, error } = await supabase.from("puntos_rondin").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["puntos-rondin"] });
      toast.success("Punto guardado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

export function useDeletePunto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("puntos_rondin").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["puntos-rondin"] });
      toast.success("Punto eliminado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

// ============ RONDINES LOG ============
export function useRondinesLog(turnoId?: string) {
  return useQuery({
    queryKey: ["rondines-log", turnoId],
    enabled: !!turnoId,
    queryFn: async (): Promise<RondinLog[]> => {
      if (!turnoId) return [];
      const { data, error } = await supabase
        .from("rondines_log")
        .select("*")
        .eq("turno_id", turnoId)
        .order("scanned_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRegistrarPaso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { qr_code: string; turno_id: string; condominio_id: string; notas?: string }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sesión expirada");
      const { data: punto, error: pErr } = await supabase
        .from("puntos_rondin")
        .select("*")
        .eq("qr_code", input.qr_code.trim().toUpperCase())
        .eq("condominio_id", input.condominio_id)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!punto) throw new Error("QR no reconocido en este edificio");
      const { data, error } = await supabase
        .from("rondines_log")
        .insert({
          turno_id: input.turno_id,
          punto_id: punto.id,
          condominio_id: input.condominio_id,
          guardia_id: u.user.id,
          notas: input.notas ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return { log: data, punto };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["rondines-log", res.log.turno_id] });
      toast.success(`Punto registrado: ${res.punto.nombre}`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Error"),
  });
}

// ============ GUARDIAS DEL EDIFICIO ============
export function useGuardiasDeCondominio(condominioId?: string) {
  return useQuery({
    queryKey: ["guardias-condo", condominioId],
    enabled: !!condominioId && condominioId !== "all",
    queryFn: async () => {
      if (!condominioId) return [];
      const { data: members, error: mErr } = await supabase
        .from("condominio_members")
        .select("user_id")
        .eq("condominio_id", condominioId);
      if (mErr) throw mErr;
      const ids = (members ?? []).map((m) => m.user_id);
      if (ids.length === 0) return [];
      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids)
        .eq("role", "guardia");
      if (rErr) throw rErr;
      const guardiaIds = (roles ?? []).map((r) => r.user_id);
      if (guardiaIds.length === 0) return [];
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", guardiaIds);
      if (pErr) throw pErr;
      return profiles ?? [];
    },
  });
}
