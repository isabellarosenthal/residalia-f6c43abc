import { lazy, Suspense, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, CalendarRange } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreasGrid } from "@/components/areas/AreasGrid";
import { ReservasTable } from "@/components/areas/ReservasTable";
import { useEdificios, type AreaComun, type Reserva } from "@/lib/queries";

const loadAreaDialog = () => import("@/components/areas/AreaFormDialog");
const loadResDialog = () => import("@/components/areas/ReservaFormDialog");
const AreaFormDialog = lazy(() => loadAreaDialog().then(m => ({ default: m.AreaFormDialog })));
const ReservaFormDialog = lazy(() => loadResDialog().then(m => ({ default: m.ReservaFormDialog })));

export const Route = createFileRoute("/areas")({ component: AreasPage });

function AreasPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useState("all");
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaEdit, setAreaEdit] = useState<AreaComun | null>(null);
  const [resOpen, setResOpen] = useState(false);
  const [resEdit, setResEdit] = useState<Reserva | null>(null);
  const [areaLoading, setAreaLoading] = useState(false);
  const [resLoading, setResLoading] = useState(false);

  useEffect(() => { loadAreaDialog(); loadResDialog(); }, []);

  const openArea = async (a: AreaComun | null) => {
    setAreaEdit(a);
    setAreaLoading(true);
    await loadAreaDialog();
    setAreaLoading(false);
    setAreaOpen(true);
  };
  const openRes = async (r: Reserva | null) => {
    setResEdit(r);
    setResLoading(true);
    await loadResDialog();
    setResLoading(false);
    setResOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Áreas Comunes</h1>
            <p className="text-sm text-[#9a7060]">Gestión de áreas y reservas</p>
          </div>
          <Select value={edificioId} onValueChange={setEdificioId}>
            <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los edificios</SelectItem>
              {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {edificios.length === 0 ? (
          <div className="text-center text-[#9a7060] py-10"><CalendarRange className="w-8 h-8 mx-auto mb-2" />Crea un edificio primero.</div>
        ) : (
          <Tabs defaultValue="areas">
            <TabsList className="bg-[#f5ede8]">
              <TabsTrigger value="areas">Áreas</TabsTrigger>
              <TabsTrigger value="reservas">Reservas</TabsTrigger>
            </TabsList>
            <TabsContent value="areas" className="space-y-4 pt-4">
              <div className="flex justify-end">
                <Button onClick={() => openArea(null)} disabled={areaLoading} className="bg-[#c94f0c] hover:bg-[#a33d08]">
                  <Plus className="w-4 h-4 mr-1" />{areaLoading ? "Cargando..." : "Nueva área"}
                </Button>
              </div>
              <AreasGrid edificioId={edificioId} onEdit={(a) => openArea(a)} />
            </TabsContent>
            <TabsContent value="reservas" className="space-y-4 pt-4">
              <div className="flex justify-end">
                <Button onClick={() => openRes(null)} disabled={resLoading} className="bg-[#c94f0c] hover:bg-[#a33d08]">
                  <Plus className="w-4 h-4 mr-1" />{resLoading ? "Cargando..." : "Nueva reserva"}
                </Button>
              </div>
              <ReservasTable edificioId={edificioId} onEdit={(r) => openRes(r)} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Suspense fallback={null}>
        {areaOpen && <AreaFormDialog open={areaOpen} onOpenChange={setAreaOpen} area={areaEdit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
        {resOpen && <ReservaFormDialog open={resOpen} onOpenChange={setResOpen} reserva={resEdit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
      </Suspense>
    </AppShell>
  );
}
