import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Building2, LayoutGrid, List } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui-pentos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EdificioCard } from "@/components/edificios/EdificioCard";
import { EdificiosTable } from "@/components/edificios/EdificiosTable";
import { EdificioFormDialog } from "@/components/edificios/EdificioFormDialog";
import { useEdificios, useUnidades } from "@/lib/queries";

export const Route = createFileRoute("/edificios/")({ component: EdificiosPage });

function EdificiosPage() {
  const { data: edificios = [], isLoading } = useEdificios();
  const { data: allUnidades = [] } = useUnidades();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const statsMap = useMemo(() => {
    const m = new Map<string, { total: number; ocupadas: number; disponibles: number; enVenta: number; enRenta: number }>();
    for (const u of allUnidades) {
      const s = m.get(u.condominio_id) ?? { total: 0, ocupadas: 0, disponibles: 0, enVenta: 0, enRenta: 0 };
      s.total++;
      if (u.estado_administrativo === "ocupada") s.ocupadas++;
      if (u.estado_administrativo === "disponible") s.disponibles++;
      if (u.estado_comercial === "en_venta" || u.estado_comercial === "en_venta_y_renta") s.enVenta++;
      if (u.estado_comercial === "en_renta" || u.estado_comercial === "en_venta_y_renta") s.enRenta++;
      m.set(u.condominio_id, s);
    }
    return m;
  }, [allUnidades]);

  const filtered = useMemo(() => {
    return edificios.filter((e) => {
      if (search && !e.nombre.toLowerCase().includes(search.toLowerCase())) return false;
      if (tipo !== "all" && e.tipo !== tipo) return false;
      return true;
    });
  }, [edificios, search, tipo]);


  return (
    <AppShell>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Edificios</h1>
            <p className="text-sm text-[#9a7060]">Administra todos tus condominios y residenciales desde un solo lugar</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-[#c94f0c] hover:bg-[#a33d08] text-white">
            <Plus className="w-4 h-4 mr-1" /> Nuevo edificio
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre…" className="pl-9 bg-white" />
          </div>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-[200px] bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="edificio">Edificio</SelectItem>
              <SelectItem value="torre">Torre</SelectItem>
              <SelectItem value="residencial">Residencial</SelectItem>
              <SelectItem value="condominio_horizontal">Condominio horizontal</SelectItem>
            </SelectContent>
          </Select>
          <div className="inline-flex rounded-lg border border-[#e8ddd8] bg-white overflow-hidden">
            <button type="button" onClick={() => setView("grid")} className={`px-3 py-2 text-sm flex items-center gap-1 ${view === "grid" ? "bg-[#c94f0c] text-white" : "text-[#4a2800] hover:bg-[#faf4f0]"}`}><LayoutGrid className="w-4 h-4" />Tarjetas</button>
            <button type="button" onClick={() => setView("table")} className={`px-3 py-2 text-sm flex items-center gap-1 ${view === "table" ? "bg-[#c94f0c] text-white" : "text-[#4a2800] hover:bg-[#faf4f0]"}`}><List className="w-4 h-4" />Tabla</button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-72 rounded-2xl shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-7 h-7" />}
            title={edificios.length === 0 ? "Aún no tienes edificios" : "Sin resultados"}
            hint={edificios.length === 0 ? "Crea tu primer edificio para empezar a administrar unidades, residentes y operaciones." : "Prueba con otros filtros."}
            action={edificios.length === 0 ? <Button onClick={() => setOpen(true)} className="bg-[#c94f0c] hover:bg-[#a33d08]"><Plus className="w-4 h-4 mr-1" />Crear edificio</Button> : null}
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e) => <EdificioCard key={e.id} edificio={e} stats={statsMap.get(e.id)} />)}
          </div>
        ) : (
          <EdificiosTable edificios={filtered} statsMap={statsMap} />
        )}

        <EdificioFormDialog open={open} onOpenChange={setOpen} />
      </div>
    </AppShell>
  );
}