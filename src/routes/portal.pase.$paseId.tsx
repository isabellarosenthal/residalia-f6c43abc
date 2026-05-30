import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Copy, MessageCircle, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { QRCanvas } from "@/components/portal/QRCanvas";

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

  if (isLoading) return <div className="text-sm text-[#64748B]">Cargando…</div>;
  if (!pase) return <div className="text-sm text-[#7a2a10]">Pase no encontrado.</div>;

  const code = pase.qr_code ?? "";
  const validar = typeof window !== "undefined" ? `${window.location.origin}/accesos/validar?c=${encodeURIComponent(code)}` : code;

  const copy = () => { navigator.clipboard.writeText(code); toast.success("Código copiado"); };

  const msg =
`Hola ${pase.visitante_nombre}, tu pase de acceso:
Código: ${code}
Entrada: ${fmtDT(pase.fecha_entrada)}
Muestra este código (o QR) al guardia.
${validar}`;

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Pase de acceso", text: msg, url: validar }); } catch {}
    } else {
      navigator.clipboard.writeText(msg); toast.success("Pase copiado");
    }
  };

  return (
    <div className="space-y-4">
      <Link to="/portal" className="inline-flex items-center text-sm text-[#64748B] hover:text-[#374151]"><ArrowLeft className="w-4 h-4 mr-1" />Volver</Link>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center">
        <div className="text-xs text-[#64748B] uppercase tracking-wide">Pase para</div>
        <div className="font-display font-extrabold text-2xl text-[#374151] mb-5">{pase.visitante_nombre}</div>

        <div className="flex justify-center mb-4"><QRCanvas value={validar} size={240} /></div>

        <div className="bg-[#ffffff] border border-dashed border-[#D97757] rounded-xl p-3 mb-4">
          <div className="text-[11px] text-[#64748B] mb-1">Código</div>
          <div className="font-mono text-lg font-bold tracking-widest text-[#374151] break-all">{code}</div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <a href={whatsapp} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm py-2.5 rounded-xl">
            <MessageCircle className="w-4 h-4" />WhatsApp
          </a>
          <button onClick={share} className="flex items-center justify-center gap-1.5 bg-[#374151] hover:bg-[#1F2937] text-white text-sm py-2.5 rounded-xl">
            <Share2 className="w-4 h-4" />Compartir
          </button>
          <button onClick={copy} className="flex items-center justify-center gap-1.5 border border-[#EBC988] text-[#374151] text-sm py-2.5 rounded-xl">
            <Copy className="w-4 h-4" />Copiar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-left">
          <div><div className="text-xs text-[#64748B]">Entrada</div><div>{fmtDT(pase.fecha_entrada)}</div></div>
          <div><div className="text-xs text-[#64748B]">Salida</div><div>{fmtDT(pase.fecha_salida)}</div></div>
          <div><div className="text-xs text-[#64748B]">Tipo</div><div className="capitalize">{pase.tipo}</div></div>
          <div><div className="text-xs text-[#64748B]">Usos</div><div>{pase.usos_actuales ?? 0} / {pase.usos_maximos ?? 1}</div></div>
        </div>
      </div>
    </div>
  );
}
