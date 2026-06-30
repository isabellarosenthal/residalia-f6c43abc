import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { usePlan } from "@/lib/plan-context";

export function ReadOnlyBanner() {
  const { canWrite, isLoading } = usePlan();
  if (isLoading || canWrite) return null;

  return (
    <div className="bg-[#FEF2F2] border-b border-[#FCA5A5] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm text-[#7F1D1D]">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          <b>Modo solo lectura.</b> Tu prueba terminó — podés consultar datos pero no crear ni editar.
        </span>
      </div>
      <Link
        to="/planes"
        className="text-xs font-semibold bg-[#DC2626] text-white px-3 py-1.5 rounded-full hover:bg-[#B91C1C] shrink-0"
      >
        Activar plan
      </Link>
    </div>
  );
}
