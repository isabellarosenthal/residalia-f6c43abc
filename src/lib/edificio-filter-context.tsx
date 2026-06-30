import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useEdificios } from "@/lib/queries";

const STORAGE_KEY = "residalia:edificio-filter";

type Ctx = {
  edificioId: string;
  setEdificioId: (id: string) => void;
};

const EdificioFilterCtx = createContext<Ctx | null>(null);

export function EdificioFilterProvider({ children }: { children: ReactNode }) {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioIdState] = useState(() => {
    if (typeof window === "undefined") return "all";
    return sessionStorage.getItem(STORAGE_KEY) ?? "all";
  });

  const setEdificioId = (id: string) => {
    setEdificioIdState(id);
    sessionStorage.setItem(STORAGE_KEY, id);
  };

  useEffect(() => {
    if (edificios.length === 1 && edificioId === "all") {
      setEdificioId(edificios[0].id);
    } else if (edificioId !== "all" && edificios.length > 0 && !edificios.some((e) => e.id === edificioId)) {
      setEdificioId(edificios.length === 1 ? edificios[0].id : "all");
    }
  }, [edificios, edificioId]);

  return (
    <EdificioFilterCtx.Provider value={{ edificioId, setEdificioId }}>
      {children}
    </EdificioFilterCtx.Provider>
  );
}

export function useEdificioFilterContext() {
  const ctx = useContext(EdificioFilterCtx);
  if (!ctx) throw new Error("useEdificioFilterContext debe usarse dentro de EdificioFilterProvider");
  return ctx;
}
