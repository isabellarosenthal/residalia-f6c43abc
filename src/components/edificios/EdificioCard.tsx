import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Home, Tag, Building2, Pencil } from "lucide-react";
import { Card, Badge } from "@/components/ui-pentos";
import { EdificioPlaceholder } from "./EdificioPlaceholder";
import { EdificioFormDialog } from "./EdificioFormDialog";
import { useUnidades, type Condominio } from "@/lib/queries";

export function EdificioCard({ edificio }: { edificio: Condominio }) {
  const { data: unidades = [] } = useUnidades(edificio.id);
  const [editOpen, setEditOpen] = useState(false);
  const total = unidades.length;
  const ocupadas = unidades.filter((u) => u.estado_administrativo === "ocupada").length;
  const enVenta = unidades.filter((u) => u.estado_comercial === "en_venta" || u.estado_comercial === "en_venta_y_renta").length;
  const enRenta = unidades.filter((u) => u.estado_comercial === "en_renta" || u.estado_comercial === "en_venta_y_renta").length;
  const ocupacion = total > 0 ? Math.round((ocupadas / total) * 100) : 0;

  return (
    <>
      <Link
        to="/edificios/$edificioId"
        params={{ edificioId: edificio.id }}
        className="group block transition-transform hover:-translate-y-0.5"
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col relative">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditOpen(true); }}
            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-[#4a2800] hover:text-[#c94f0c] rounded-full p-2 shadow-sm border border-[#f0e6df] opacity-0 group-hover:opacity-100 transition-opacity"
            title="Editar edificio"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <EdificioPlaceholder id={edificio.id} tipo={edificio.tipo} className="h-32" />
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-bold text-lg text-[#2d1200] group-hover:text-[#c94f0c] transition-colors">{edificio.nombre}</h3>
              {edificio.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="neutral">Inactivo</Badge>}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#9a7060]">
              <MapPin className="w-3 h-3" />
              <span>{edificio.ciudad ?? "—"}{edificio.departamento ? `, ${edificio.departamento}` : ""}</span>
              <span className="mx-1">·</span>
              <span className="capitalize">{edificio.tipo}</span>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <Stat icon={<Building2 className="w-3.5 h-3.5" />} label="Unidades" value={total} />
              <Stat icon={<Home className="w-3.5 h-3.5" />} label="Ocup." value={`${ocupacion}%`} />
              <Stat icon={<Tag className="w-3.5 h-3.5" />} label="Venta" value={enVenta} accent="venta" />
              <Stat icon={<Tag className="w-3.5 h-3.5" />} label="Renta" value={enRenta} accent="renta" />
            </div>
          </div>
        </Card>
      </Link>
      <EdificioFormDialog open={editOpen} onOpenChange={setEditOpen} edificio={edificio} />
    </>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: "venta" | "renta" }) {
  const color = accent === "venta" ? "text-[#c94f0c]" : accent === "renta" ? "text-[#2d1200]" : "text-[#4a2800]";
  return (
    <div className="bg-[#faf9f7] rounded-lg py-2">
      <div className="flex items-center justify-center gap-1 text-[#9a7060]">{icon}<span className="text-[10px] uppercase tracking-wider">{label}</span></div>
      <div className={`font-display font-bold text-lg ${color}`}>{value}</div>
    </div>
  );
}
