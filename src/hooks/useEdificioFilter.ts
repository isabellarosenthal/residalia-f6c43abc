import { useEffect, useState } from "react";
import { useEdificios } from "@/lib/queries";

/**
 * Filtro de edificio con auto-selección: si el tenant solo tiene un edificio,
 * lo selecciona por defecto en vez de "all".
 */
export function useEdificioFilter(initial: string = "all") {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useState(initial);
  useEffect(() => {
    if (edificios.length === 1 && edificioId === "all") {
      setEdificioId(edificios[0].id);
    }
  }, [edificios, edificioId]);
  return [edificioId, setEdificioId] as const;
}
