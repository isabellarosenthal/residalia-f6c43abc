import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Copy } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/portal/pase/$paseId")({ component: PaseView });

const fmtDT = (s: string | null) => s ? new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" }) : "—";

function PaseView() {
  const { paseId } = Route.useParams();
  const { data: pase, isLoading } = useQuery({
    queryKey: ["pase", paseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("accesos").select("*").eq("id", paseId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="text-sm text-[#9a7060]">Cargando…</div>;
  if (!pase) return <div className="text-sm text-[#7a2a10]">Pase no encontrado.</div>;

  const copy = () => { navigator.clipboard.writeText(pase.qr_code ?? ""); toast.success("Código copiado"); };

  return (
    <div className="space-y-4">
      <Link to="/portal" className="inline-flex items-center text-sm text-[#9a7060] hover:text-[#c94f0c]"><ArrowLeft className="w-4 h-4 mr-1" />Volver</Link>
      <div className="bg-white border border-[#e8ddd8] rounded-2xl p-6 text-center">
        <div className="text-xs text-[#9a7060] uppercase tracking-wide">Pase para</div>
        <div className="font-display font-extrabold text-2xl text-[#2d1200] mb-6">{pase.visitante_nombre}</div>
        <div className="bg-[#faf9f7] border-2 border-dashed border-[#c94f0c] rounded-2xl p-6 mb-4">
          <div className="text-xs text-[#9a7060] mb-2">Muestra este código al guardia</div>
          <div className="font-mono text-3xl font-bold tracking-widest text-[#2d1200] break-all">{pase.qr_code}</div>
        </div>
        <button onClick={copy} className="text-sm text-[#c94f0c] hover:underline inline-flex items-center gap-1"><Copy className="w-4 h-4" />Copiar código</button>
        <div className="grid grid-cols-2 gap-3 text-sm mt-6 text-left">
          <div><div className="text-xs text-[#9a7060]">Entrada</div><div>{fmtDT(pase.fecha_entrada)}</div></div>
          <div><div className="text-xs text-[#9a7060]">Salida</div><div>{fmtDT(pase.fecha_salida)}</div></div>
          <div><div className="text-xs text-[#9a7060]">Tipo</div><div className="capitalize">{pase.tipo}</div></div>
          <div><div className="text-xs text-[#9a7060]">Usos</div><div>{pase.usos_actuales ?? 0} / {pase.usos_maximos ?? 1}</div></div>
        </div>
      </div>
    </div>
  );
}
