import { Card } from "@/components/ui-pentos";
import { Badge } from "@/components/ui-pentos";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users, Clock, Sparkles } from "lucide-react";
import { useAreas, useDeleteArea, type AreaComun } from "@/lib/queries";

export function AreasGrid({ edificioId, onEdit }: { edificioId: string; onEdit: (a: AreaComun) => void }) {
  const { data: areas = [], isLoading } = useAreas(edificioId === "all" ? undefined : edificioId);
  const del = useDeleteArea();

  if (isLoading) return <div className="text-center text-[#64748B] py-10">Cargando…</div>;
  if (areas.length === 0) return <div className="text-center text-[#64748B] py-10">Sin áreas comunes. Crea la primera.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {areas.map((a) => (
        <Card key={a.id} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#FAF1DC] text-[#173B7A] flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
              <div className="min-w-0">
                <div className="font-display font-bold text-lg text-[#173B7A] truncate">{a.nombre}</div>
                {a.activa ? <Badge variant="success">Activa</Badge> : <Badge variant="neutral">Inactiva</Badge>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit(a)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar área?")) del.mutate(a.id); }} className="h-8 w-8 p-0 text-[#be185d]"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 text-sm text-[#5a3a25]">
            {a.capacidad ? <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#64748B]" />Capacidad: {a.capacidad}</div> : null}
            {(a.horario_inicio || a.horario_fin) && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#64748B]" />{a.horario_inicio?.slice(0,5) ?? "—"} – {a.horario_fin?.slice(0,5) ?? "—"}</div>}
          </div>
        </Card>
      ))}
    </div>
  );
}
