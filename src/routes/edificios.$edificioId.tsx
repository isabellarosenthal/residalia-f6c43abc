import { lazy, Suspense, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Plus, Pencil, Trash2, MapPin, Building2, Layers, Home, Tag, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, KpiCard } from "@/components/ui-pentos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EdificioPlaceholder } from "@/components/edificios/EdificioPlaceholder";
import { UnidadesTable } from "@/components/unidades/UnidadesTable";
import { ResidentesTable } from "@/components/residentes/ResidentesTable";
import { useEdificio, useUnidades, useDeleteEdificio, type Unidad, type Residente } from "@/lib/queries";
import { fmtL } from "@/lib/format";
import { PlanLimitsBanner } from "@/components/PlanLimitsBanner";

const EdificioFormDialog = lazy(() => import("@/components/edificios/EdificioFormDialog").then(m => ({ default: m.EdificioFormDialog })));
const UnidadFormDialog = lazy(() => import("@/components/unidades/UnidadFormDialog").then(m => ({ default: m.UnidadFormDialog })));
const GenerarUnidadesDialog = lazy(() => import("@/components/unidades/GenerarUnidadesDialog").then(m => ({ default: m.GenerarUnidadesDialog })));
const ResidenteFormDialog = lazy(() => import("@/components/residentes/ResidenteFormDialog").then(m => ({ default: m.ResidenteFormDialog })));


import { EdificioDetailSkeleton } from "@/components/edificios/EdificiosSkeleton";

export const Route = createFileRoute("/edificios/$edificioId")({
  component: EdificioDetail,
  pendingComponent: EdificioDetailSkeleton,
  pendingMs: 0,
});

function EdificioDetail() {
  const { edificioId } = Route.useParams();
  const navigate = useNavigate();
  const { data: edificio, isLoading } = useEdificio(edificioId);
  const { data: unidades = [] } = useUnidades(edificioId);
  const delMut = useDeleteEdificio();
  const [editOpen, setEditOpen] = useState(false);
  const [unidadOpen, setUnidadOpen] = useState(false);
  const [unidadEdit, setUnidadEdit] = useState<Unidad | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [residenteOpen, setResidenteOpen] = useState(false);
  const [residenteEdit, setResidenteEdit] = useState<Residente | null>(null);

  if (isLoading) {
    return <AppShell><div className="h-72 shimmer rounded-2xl" /></AppShell>;
  }
  if (!edificio) {
    return <AppShell><div className="text-center text-[#64748B] py-20">Edificio no encontrado.</div></AppShell>;
  }

  const total = unidades.length;
  const ocupadas = unidades.filter((u) => u.estado_administrativo === "ocupada").length;
  const disponibles = unidades.filter((u) => u.estado_administrativo === "disponible").length;
  const enVenta = unidades.filter((u) => u.estado_comercial === "en_venta" || u.estado_comercial === "en_venta_y_renta").length;
  const enRenta = unidades.filter((u) => u.estado_comercial === "en_renta" || u.estado_comercial === "en_venta_y_renta").length;
  const valorPortafolio = unidades.reduce((acc, u) => acc + (u.precio_venta ?? 0), 0);
  const ingresoMantenimiento = unidades.reduce((acc, u) => acc + (u.mantenimiento_mensual ?? 0), 0);
  const ocupacion = total > 0 ? Math.round((ocupadas / total) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <Link to="/edificios" className="inline-flex items-center text-sm text-[#64748B] hover:text-[#374151]">
          <ChevronLeft className="w-4 h-4" /> Volver a edificios
        </Link>

        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <EdificioPlaceholder id={edificio.id} tipo={edificio.tipo} className="md:w-56 h-32 md:h-auto" />
            <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-[#374151]">{edificio.nombre}</h1>
                <div className="text-sm text-[#64748B] flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {edificio.direccion ?? "—"}{edificio.ciudad ? ` · ${edificio.ciudad}` : ""}{edificio.departamento ? `, ${edificio.departamento}` : ""}
                </div>
                <div className="text-xs text-[#64748B] mt-1 capitalize">{edificio.tipo} · Moneda: {edificio.moneda}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="w-4 h-4 mr-1" />Editar</Button>
                <Button variant="outline" className="text-[#be185d] hover:text-[#be185d]" onClick={() => {
                  if (confirm(`¿Eliminar ${edificio.nombre}? Esta acción es permanente.`)) {
                    delMut.mutate(edificio.id, { onSuccess: () => navigate({ to: "/edificios" }) });
                  }
                }}><Trash2 className="w-4 h-4 mr-1" />Eliminar</Button>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="unidades">
          <TabsList className="bg-[#F8FAFC]">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="unidades">Unidades ({total})</TabsTrigger>
            <TabsTrigger value="residentes">Residentes</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={<Building2 className="w-5 h-5" />} label="Total unidades" value={total} accent="neutral" />
              <KpiCard icon={<Home className="w-5 h-5" />} label="Ocupación" value={`${ocupacion}%`} sub={`${ocupadas} ocupadas · ${disponibles} disponibles`} accent="success" />
              <KpiCard icon={<Tag className="w-5 h-5" />} label="En venta / renta" value={`${enVenta} / ${enRenta}`} accent="primary" />
              <KpiCard icon={<Layers className="w-5 h-5" />} label="Mantenim. mensual" value={fmtL(ingresoMantenimiento)} sub={`Portafolio: ${fmtL(valorPortafolio)}`} accent="primary" />
            </div>

            <Card className="p-5">
              <h3 className="font-display font-bold text-[#374151] mb-3">Datos generales</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                <Info label="Nombre" value={edificio.nombre} />
                <Info label="Tipo" value={<span className="capitalize">{edificio.tipo}</span>} />
                <Info label="Moneda" value={edificio.moneda} />
                <Info label="País" value={edificio.pais} />
                <Info label="Ciudad" value={edificio.ciudad ?? "—"} />
                <Info label="Departamento" value={edificio.departamento ?? "—"} />
                <Info label="Dirección" value={edificio.direccion ?? "—"} />
                <Info label="Cuota base" value={fmtL(edificio.cuota_base)} />
                <Info label="Estado" value={edificio.activo ? "Activo" : "Inactivo"} />
              </dl>
            </Card>
          </TabsContent>

          <TabsContent value="unidades" className="space-y-4 pt-4">
            <PlanLimitsBanner focus="unidades" />
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={() => setBulkOpen(true)}><Layers className="w-4 h-4 mr-1" />Generar en bloque</Button>
              <Button onClick={() => { setUnidadEdit(null); setUnidadOpen(true); }} className="bg-[#374151] hover:bg-[#1F2937]">
                <Plus className="w-4 h-4 mr-1" />Nueva unidad
              </Button>
            </div>
            <UnidadesTable edificioId={edificio.id} onEdit={(u) => { setUnidadEdit(u); setUnidadOpen(true); }} />
          </TabsContent>

          <TabsContent value="residentes" className="space-y-4 pt-4">
            <div className="flex justify-end">
              <Button onClick={() => { setResidenteEdit(null); setResidenteOpen(true); }} className="bg-[#374151] hover:bg-[#1F2937]"><Plus className="w-4 h-4 mr-1" />Nuevo residente</Button>
            </div>
            <ResidentesTable search="" edificioId={edificio.id} tipo="all" estado="all" onEdit={(r) => { setResidenteEdit(r); setResidenteOpen(true); }} />
          </TabsContent>


          <TabsContent value="config" className="space-y-4 pt-4">
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-[#374151] flex items-center gap-2"><FileText className="w-5 h-5 text-[#374151]" /> Editar datos del edificio</h3>
                  <p className="text-sm text-[#64748B]">Modifica nombre, dirección, cuota y otros datos.</p>
                </div>
                <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="w-4 h-4 mr-1" />Editar</Button>
              </div>
            </Card>
            <Card className="p-5 border-[#fce7f3]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-[#be185d]">Zona peligrosa</h3>
                  <p className="text-sm text-[#64748B]">Eliminar el edificio borrará permanentemente sus datos.</p>
                </div>
                <Button variant="outline" className="text-[#be185d] border-[#be185d]/30 hover:bg-[#fce7f3] hover:text-[#be185d]" onClick={() => {
                  if (confirm(`¿Eliminar ${edificio.nombre}?`)) {
                    delMut.mutate(edificio.id, { onSuccess: () => navigate({ to: "/edificios" }) });
                  }
                }}><Trash2 className="w-4 h-4 mr-1" />Eliminar edificio</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Suspense fallback={null}>
        {editOpen && <EdificioFormDialog open={editOpen} onOpenChange={setEditOpen} edificio={edificio} />}
        {unidadOpen && <UnidadFormDialog open={unidadOpen} onOpenChange={setUnidadOpen} edificioId={edificio.id} unidad={unidadEdit} />}
        {bulkOpen && <GenerarUnidadesDialog open={bulkOpen} onOpenChange={setBulkOpen} edificioId={edificio.id} />}
        {residenteOpen && <ResidenteFormDialog open={residenteOpen} onOpenChange={setResidenteOpen} residente={residenteEdit} defaultCondominioId={edificio.id} />}
      </Suspense>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[#64748B]">{label}</dt>
      <dd className="text-[#374151] font-medium mt-0.5">{value}</dd>
    </div>
  );
}
