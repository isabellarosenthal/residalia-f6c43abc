import { lazy, Suspense, useState } from "react";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wallet, Layers } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FinanzasResumen } from "@/components/finanzas/FinanzasResumen";
import { useWriteGuard } from "@/hooks/useWriteGuard";
import { CobrosTable } from "@/components/finanzas/CobrosTable";
import { EgresosTable } from "@/components/finanzas/EgresosTable";
import { EstadoCuentaUnidad } from "@/components/finanzas/EstadoCuentaUnidad";
import { ReportesFinancieros } from "@/components/finanzas/ReportesFinancieros";
import { RecordatoriosMorosos } from "@/components/finanzas/RecordatoriosMorosos";
import { useEdificios, type Cobro, type Egreso } from "@/lib/queries";

const CobroFormDialog = lazy(() => import("@/components/finanzas/CobroFormDialog").then(m => ({ default: m.CobroFormDialog })));
const EgresoFormDialog = lazy(() => import("@/components/finanzas/EgresoFormDialog").then(m => ({ default: m.EgresoFormDialog })));
const GenerarCobrosDialog = lazy(() => import("@/components/finanzas/GenerarCobrosDialog").then(m => ({ default: m.GenerarCobrosDialog })));

export const Route = createFileRoute("/finanzas")({ component: FinanzasPage });

function FinanzasPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId] = useEdificioFilter();
  const { canWrite, guard } = useWriteGuard();
  const [cobroOpen, setCobroOpen] = useState(false);
  const [cobroEdit, setCobroEdit] = useState<Cobro | null>(null);
  const [egresoOpen, setEgresoOpen] = useState(false);
  const [egresoEdit, setEgresoEdit] = useState<Egreso | null>(null);
  const [genOpen, setGenOpen] = useState(false);

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#0F172A]">Finanzas</h1>
            <p className="text-sm text-[#64748B]">Cobros, egresos y estados de cuenta</p>
          </div>
        </div>

        <Tabs defaultValue="resumen">
          <TabsList className="bg-[#F8FAFC]">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="cobros">Cobros</TabsTrigger>
            <TabsTrigger value="egresos">Egresos</TabsTrigger>
            <TabsTrigger value="estado">Estado de cuenta</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
            <TabsTrigger value="recordatorios">Recordatorios</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="pt-4">
            <FinanzasResumen edificioId={edificioId} />
          </TabsContent>

          <TabsContent value="cobros" className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" disabled={!canWrite || edificioId === "all"} onClick={() => guard(() => setGenOpen(true))}>
                <Layers className="w-4 h-4 mr-1" />Generar mensuales
              </Button>
              <Button disabled={!canWrite} onClick={() => guard(() => { setCobroEdit(null); setCobroOpen(true); })} className="bg-[#4A154B] hover:bg-[#350d36]">
                <Plus className="w-4 h-4 mr-1" />Nuevo cobro
              </Button>
            </div>
            <CobrosTable edificioId={edificioId} onEdit={(c) => { setCobroEdit(c); setCobroOpen(true); }} />
          </TabsContent>

          <TabsContent value="egresos" className="space-y-4 pt-4">
            <div className="flex justify-end">
              <Button disabled={!canWrite} onClick={() => guard(() => { setEgresoEdit(null); setEgresoOpen(true); })} className="bg-[#4A154B] hover:bg-[#350d36]">
                <Plus className="w-4 h-4 mr-1" />Nuevo egreso
              </Button>
            </div>
            <EgresosTable edificioId={edificioId} onEdit={(e) => { setEgresoEdit(e); setEgresoOpen(true); }} />
          </TabsContent>

          <TabsContent value="estado" className="pt-4">
            <EstadoCuentaUnidad edificioId={edificioId} />
          </TabsContent>

          <TabsContent value="reportes" className="pt-4">
            <ReportesFinancieros edificioId={edificioId} />
          </TabsContent>

          <TabsContent value="recordatorios" className="pt-4">
            <RecordatoriosMorosos edificioId={edificioId} />
          </TabsContent>
        </Tabs>

        {edificios.length === 0 && (
          <div className="text-center text-[#64748B] py-10"><Wallet className="w-8 h-8 mx-auto mb-2" />Crea un edificio primero para empezar a gestionar finanzas.</div>
        )}
      </div>

      <Suspense fallback={null}>
        {cobroOpen && <CobroFormDialog open={cobroOpen} onOpenChange={setCobroOpen} cobro={cobroEdit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
        {egresoOpen && <EgresoFormDialog open={egresoOpen} onOpenChange={setEgresoOpen} egreso={egresoEdit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
        {genOpen && edificioId !== "all" && <GenerarCobrosDialog open={genOpen} onOpenChange={setGenOpen} edificioId={edificioId} />}
      </Suspense>
    </AppShell>
  );
}
