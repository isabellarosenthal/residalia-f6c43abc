import { lazy, Suspense, useState } from "react";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui-pentos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResidentesTable } from "@/components/residentes/ResidentesTable";
import { useEdificios, useResidentes, type Residente } from "@/lib/queries";

const ResidenteFormDialog = lazy(() =>
  import("@/components/residentes/ResidenteFormDialog").then((m) => ({ default: m.ResidenteFormDialog }))
);
const ResidenteDetailDialog = lazy(() =>
  import("@/components/residentes/ResidenteDetailDialog").then((m) => ({ default: m.ResidenteDetailDialog }))
);

export const Route = createFileRoute("/residentes")({ component: ResidentesPage });


function ResidentesPage() {
  const { data: edificios = [] } = useEdificios();
  const { data: residentes = [] } = useResidentes();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Residente | null>(null);
  const [detail, setDetail] = useState<Residente | null>(null);
  const [search, setSearch] = useState("");
  const [edificioId, setEdificioId] = useEdificioFilter();
  const [tipo, setTipo] = useState("all");
  const [estado, setEstado] = useState("activos");


  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Residentes</h1>
            <p className="text-sm text-[#9a7060]">{residentes.length} registrados · gestiona propietarios e inquilinos</p>
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-[#c94f0c] hover:bg-[#a33d08]">
            <Plus className="w-4 h-4 mr-1" /> Nuevo residente
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, DNI, teléfono…" className="pl-9" />
          </div>
          <Select value={edificioId} onValueChange={setEdificioId}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los edificios</SelectItem>
              {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="propietario">Propietarios</SelectItem>
              <SelectItem value="inquilino">Inquilinos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {residentes.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="Aún no hay residentes"
            hint="Registra el primer propietario o inquilino de tus edificios."
            action={<Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-[#c94f0c] hover:bg-[#a33d08]"><Plus className="w-4 h-4 mr-1" />Nuevo residente</Button>}
          />
        ) : (
          <ResidentesTable
            search={search} edificioId={edificioId} tipo={tipo} estado={estado}
            onEdit={(r) => { setEditing(r); setOpen(true); }}
            onView={(r) => setDetail(r)}
          />
        )}
      </div>

      <Suspense fallback={null}>
        {open && <ResidenteFormDialog open={open} onOpenChange={setOpen} residente={editing} />}
        {detail && <ResidenteDetailDialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)} residente={detail} />}
      </Suspense>
    </AppShell>
  );
}

