import { useEdificioFilterContext } from "@/lib/edificio-filter-context";

/**
 * Filtro global de edificio (persistido en sesión, sincronizado en Topbar y módulos).
 */
export function useEdificioFilter() {
  const { edificioId, setEdificioId } = useEdificioFilterContext();
  return [edificioId, setEdificioId] as const;
}
