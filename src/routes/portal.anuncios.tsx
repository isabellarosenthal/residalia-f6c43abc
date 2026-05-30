import { createFileRoute } from "@tanstack/react-router";
import { useComunicadosResidente } from "@/lib/queries";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/portal/anuncios")({ component: Anuncios });

const fmtDT = (s: string) => new Date(s).toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "short" });

function Anuncios() {
  const { data: items = [], isLoading } = useComunicadosResidente();
  if (isLoading) return <div className="text-sm text-[#64748B]">Cargando…</div>;

  return (
    <div className="space-y-3">
      <h1 className="font-display font-extrabold text-xl text-[#4F46E5]">Anuncios del edificio</h1>
      {items.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center text-[#64748B]">
          <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No hay anuncios por ahora.
        </div>
      ) : items.map((a) => (
        <article key={a.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            {a.tipo && <span className="text-[10px] uppercase tracking-wide bg-[#fde8e2] text-[#4F46E5] px-2 py-0.5 rounded-full">{a.tipo}</span>}
            <span className="text-xs text-[#64748B]">{fmtDT(a.created_at)}</span>
          </div>
          <h2 className="font-display font-bold text-lg text-[#4F46E5]">{a.titulo}</h2>
          {a.cuerpo && <p className="text-sm text-[#4F46E5] mt-1 whitespace-pre-wrap">{a.cuerpo}</p>}
        </article>
      ))}
    </div>
  );
}
