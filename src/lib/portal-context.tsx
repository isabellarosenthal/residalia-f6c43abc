import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Residencia = {
  id: string;
  condominio_id: string;
  unidad_id: string | null;
  nombre: string;
  apellido: string;
  tipo: string;
  condominio: { id: string; nombre: string; moneda: string | null } | null;
  unidad: { id: string; numero: string } | null;
};

type Ctx = {
  residencias: Residencia[];
  isLoading: boolean;
  activa: Residencia | null;
  activaId: string | null;
  setActivaId: (id: string) => void;
};

const PortalCtx = createContext<Ctx | null>(null);
const LS_KEY = "portal:residenciaId";

export function PortalResidenciaProvider({ children }: { children: ReactNode }) {
  const { data: residencias = [], isLoading } = useQuery({
    queryKey: ["mis-residencias"],
    queryFn: async (): Promise<Residencia[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("residentes")
        .select("id, condominio_id, unidad_id, nombre, apellido, tipo, condominio:condominios(id,nombre,moneda), unidad:unidades(id,numero)")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any;
    },
  });

  const [activaId, setActivaIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LS_KEY);
  });

  useEffect(() => {
    if (residencias.length === 0) return;
    if (!activaId || !residencias.find((r) => r.id === activaId)) {
      const first = residencias[0].id;
      setActivaIdState(first);
      localStorage.setItem(LS_KEY, first);
    }
  }, [residencias, activaId]);

  const setActivaId = (id: string) => {
    localStorage.setItem(LS_KEY, id);
    setActivaIdState(id);
  };

  const activa = residencias.find((r) => r.id === activaId) ?? null;

  return (
    <PortalCtx.Provider value={{ residencias, isLoading, activa, activaId, setActivaId }}>
      {children}
    </PortalCtx.Provider>
  );
}

export function useResidenciaActiva(): Ctx {
  const ctx = useContext(PortalCtx);
  if (!ctx) throw new Error("useResidenciaActiva debe usarse dentro de PortalResidenciaProvider");
  return ctx;
}
