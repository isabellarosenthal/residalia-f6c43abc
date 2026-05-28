import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fmtL, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/recibo/$cobroId")({ component: ReciboPage });

function ReciboPage() {
  const { cobroId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["recibo", cobroId],
    queryFn: async () => {
      const { data: cobro, error } = await supabase.from("cobros").select("*").eq("id", cobroId).maybeSingle();
      if (error) throw error;
      if (!cobro) return null;
      const [edif, uni, res] = await Promise.all([
        supabase.from("condominios").select("nombre, direccion, ciudad, logo_url, moneda").eq("id", cobro.condominio_id).maybeSingle(),
        cobro.unidad_id ? supabase.from("unidades").select("numero, piso").eq("id", cobro.unidad_id).maybeSingle() : Promise.resolve({ data: null }),
        cobro.residente_id ? supabase.from("residentes").select("nombre, apellido, dni, email, telefono").eq("id", cobro.residente_id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      return { cobro, edificio: edif.data, unidad: uni.data, residente: res.data };
    },
  });

  useEffect(() => { document.title = data?.cobro?.recibo_numero ? `Recibo ${data.cobro.recibo_numero}` : "Recibo"; }, [data]);

  if (isLoading) return <div className="p-10 text-center text-[#9a7060]">Cargando recibo…</div>;
  if (!data?.cobro) return <div className="p-10 text-center text-[#9a7060]">Recibo no encontrado.</div>;
  const { cobro, edificio, unidad, residente } = data;

  return (
    <div className="min-h-screen bg-[#f5ede8] py-8 print:bg-white print:py-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 16mm; }
        }
      `}</style>

      <div className="max-w-[720px] mx-auto mb-4 flex justify-between items-center no-print">
        <div className="text-sm text-[#9a7060]">Recibo oficial de pago</div>
        <Button onClick={() => window.print()} className="bg-[#c94f0c] hover:bg-[#a33d08]"><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
      </div>

      <div className="max-w-[720px] mx-auto bg-white border border-[#e8ddd8] rounded-2xl print:border-0 print:rounded-none shadow-sm p-10">
        <header className="flex items-start justify-between pb-6 border-b border-[#e8ddd8]">
          <div className="flex items-center gap-4">
            {edificio?.logo_url
              ? <img src={edificio.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
              : <div className="w-14 h-14 rounded-xl bg-[#c94f0c] text-white flex items-center justify-center font-display font-extrabold text-lg">{edificio?.nombre?.[0] ?? "C"}</div>}
            <div>
              <div className="font-display font-extrabold text-xl text-[#2d1200]">{edificio?.nombre ?? "—"}</div>
              <div className="text-xs text-[#9a7060]">{[edificio?.direccion, edificio?.ciudad].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#9a7060] uppercase tracking-wider">Recibo Nº</div>
            <div className="font-display font-bold text-lg text-[#2d1200]">{cobro.recibo_numero ?? "—"}</div>
            <div className="text-xs text-[#9a7060] mt-1">Emitido: {fmtDate(cobro.fecha_pago ?? cobro.created_at)}</div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-6 text-sm">
          <div>
            <div className="text-xs text-[#9a7060] uppercase tracking-wider mb-1">Pagado por</div>
            <div className="font-medium text-[#2d1200]">{residente ? `${residente.nombre} ${residente.apellido ?? ""}`.trim() : "—"}</div>
            {residente?.dni && <div className="text-xs text-[#9a7060]">DNI: {residente.dni}</div>}
            {residente?.email && <div className="text-xs text-[#9a7060]">{residente.email}</div>}
            {residente?.telefono && <div className="text-xs text-[#9a7060]">{residente.telefono}</div>}
          </div>
          <div>
            <div className="text-xs text-[#9a7060] uppercase tracking-wider mb-1">Unidad</div>
            <div className="font-medium text-[#2d1200]">{unidad ? `#${unidad.numero}${unidad.piso != null ? ` · piso ${unidad.piso}` : ""}` : "—"}</div>
            <div className="text-xs text-[#9a7060] mt-2 uppercase tracking-wider">Método de pago</div>
            <div className="font-medium text-[#2d1200] capitalize">{cobro.metodo_pago ?? "—"}</div>
          </div>
        </section>

        <section className="border border-[#e8ddd8] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f5ede8]">
              <tr>
                <th className="text-left p-3 font-semibold text-[#2d1200]">Concepto</th>
                <th className="text-right p-3 font-semibold text-[#2d1200]">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 text-[#2d1200]">{cobro.concepto}<div className="text-xs text-[#9a7060]">Vencía: {fmtDate(cobro.fecha_vencimiento)}</div></td>
                <td className="p-3 text-right font-semibold text-[#2d1200]">{fmtL(Number(cobro.monto))}</td>
              </tr>
            </tbody>
            <tfoot className="bg-[#fbf6f3]">
              <tr>
                <td className="p-3 text-right font-semibold text-[#2d1200]">Total pagado</td>
                <td className="p-3 text-right font-display font-extrabold text-xl text-[#c94f0c]">{fmtL(Number(cobro.monto))}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        {cobro.notas && (
          <section className="mt-5 text-xs text-[#9a7060]">
            <div className="uppercase tracking-wider mb-1">Notas</div>
            <div>{cobro.notas}</div>
          </section>
        )}

        <footer className="mt-8 pt-6 border-t border-[#e8ddd8] text-center text-xs text-[#9a7060]">
          Este recibo es comprobante de pago. Conserve este documento para sus registros.
        </footer>
      </div>
    </div>
  );
}
