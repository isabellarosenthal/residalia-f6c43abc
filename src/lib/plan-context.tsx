import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyPlanUsage } from "@/lib/plan-usage.functions";

type PlanCtx = {
  canWrite: boolean;
  isLoading: boolean;
  activa: boolean;
  diasRestantes: number | null;
  estado: string | null;
};

const PlanCtx = createContext<PlanCtx>({
  canWrite: true,
  isLoading: true,
  activa: true,
  diasRestantes: null,
  estado: null,
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const fetchUsage = useServerFn(getMyPlanUsage);
  const { data, isLoading } = useQuery({ queryKey: ["plan-usage"], queryFn: () => fetchUsage() });

  const activa = data?.activa ?? true;

  return (
    <PlanCtx.Provider
      value={{
        canWrite: isLoading ? true : activa,
        isLoading,
        activa,
        diasRestantes: data?.diasRestantes ?? null,
        estado: data?.estado ?? null,
      }}
    >
      {children}
    </PlanCtx.Provider>
  );
}

export function usePlan() {
  return useContext(PlanCtx);
}

export function useCanWrite() {
  return usePlan().canWrite;
}
