import { lazy, Suspense, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, Home, Tag, Building2, Pencil, ChevronRight } from "lucide-react";
import { Card, Badge } from "@/components/ui-pentos";
import { EdificioPlaceholder } from "./EdificioPlaceholder";
import { type Condominio } from "@/lib/queries";

const EdificioFormDialog = lazy(() =>
  import("./EdificioFormDialog").then((m) => ({ default: m.EdificioFormDialog }))
);

export type EdificioStats = { total: number; ocupadas: number; enVenta: number; enRenta: number };

export function EdificioCard({ edificio, stats }: { edificio: Condominio; stats?: EdificioStats }) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const total = stats?.total ?? 0;
  const ocupadas = stats?.ocupadas ?? 0;
  const enVenta = stats?.enVenta ?? 0;
  const enRenta = stats?.enRenta ?? 0;
  const ocupacion = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
  const openUnidades = () => navigate({ to: "/edificios/$edificioId", params: { edificioId: edificio.id } });

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openUnidades}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openUnidades();
          }
        }}
        className="group block cursor-pointer rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A154B]"
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col relative">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-[#1E293B] hover:text-[#4A154B] rounded-full p-2 shadow-sm border border-[#f0e6df] opacity-0 group-hover:opacity-100 transition-opacity"
            title="Editar edificio"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start gap-3">
              <EdificioPlaceholder id={edificio.id} tipo={edificio.tipo} className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-lg text-[#0F172A] group-hover:text-[#4A154B] transition-colors">{edificio.nombre}</h3>
                  {edificio.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="neutral">Inactivo</Badge>}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-[#64748B]">
                  <MapPin className="w-3 h-3" />
                  <span>{edificio.ciudad ?? "—"}{edificio.departamento ? `, ${edificio.departamento}` : ""}</span>
                  <span className="mx-1">·</span>
                  <span className="capitalize">{edificio.tipo}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <Stat icon={<Building2 className="w-3.5 h-3.5" />} label="Unidades" value={total} />
              <Stat icon={<Home className="w-3.5 h-3.5" />} label="Ocup." value={`${ocupacion}%`} />
              <Stat icon={<Tag className="w-3.5 h-3.5" />} label="Venta" value={enVenta} accent="venta" />
              <Stat icon={<Tag className="w-3.5 h-3.5" />} label="Renta" value={enRenta} accent="renta" />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-[#f0e6df] bg-[#fff7f2] px-3 py-2 text-sm font-semibold text-[#4A154B]">
              <span>Ver / crear unidades</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>
      {editOpen && (
        <Suspense fallback={null}>
          <EdificioFormDialog open={editOpen} onOpenChange={setEditOpen} edificio={edificio} />
        </Suspense>
      )}
    </>

  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: "venta" | "renta" }) {
  const color = accent === "venta" ? "text-[#4A154B]" : accent === "renta" ? "text-[#4A154B]" : "text-[#1E293B]";
  return (
    <div className="bg-[#ffffff] rounded-lg py-2">
      <div className="flex items-center justify-center gap-1 text-[#64748B]">{icon}<span className="text-[10px] uppercase tracking-wider">{label}</span></div>
      <div className={`font-display font-bold text-lg ${color}`}>{value}</div>
    </div>
  );
}
