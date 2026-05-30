import { createFileRoute } from "@tanstack/react-router";
import { useAccesos } from "@/lib/queries";

export const Route = createFileRoute("/guardia/pases")({ component: PasesHoy });

const fmtDT = (s: string | null) => s ? new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" }) : "—";

function PasesHoy() {
  const { data: pases = [], isLoading } = useAccesos();
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const delDia = pases.filter((p) => p.fecha_entrada && new Date(p.fecha_entrada) >= hoy);

  if (isLoading) return <div className="text-sm text-[#EBC988]">Cargando…</div>;

  return (
    <div className="space-y-2">
      <h2 className="font-display font-extrabold text-lg mb-2">Pases del día ({delDia.length})</h2>
      {delDia.length === 0 ? (
        <div className="bg-[#374151] border border-[#1F2937] rounded-2xl p-6 text-center text-[#EBC988]">Sin pases hoy.</div>
      ) : delDia.map((p) => {
        const usados = p.usos_actuales ?? 0; const max = p.usos_maximos ?? 1;
        const tone = p.fecha_salida ? "neutral" : usados >= max ? "danger" : "success";
        return (
          <div key={p.id} className="bg-[#374151] border border-[#1F2937] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white">{p.visitante_nombre}</div>
              <div className="text-xs text-[#EBC988] font-mono">{p.qr_code}</div>
              <div className="text-xs text-[#EBC988] mt-1">{fmtDT(p.fecha_entrada)}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone === "success" ? "bg-green-100 text-green-800" : tone === "danger" ? "bg-red-100 text-red-800" : "bg-gray-200 text-gray-700"}`}>
              {p.fecha_salida ? "Salió" : `${usados}/${max}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
