import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wrench, AlertTriangle, ClipboardCheck, Users, Search, Pencil, Trash2, Phone, Mail, Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, KpiCard, Badge } from "@/components/ui-pentos";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import {
  useEdificios, useIncidencias, useDeleteIncidencia, useOrdenes, useDeleteOrden,
  useProveedores, useDeleteProveedor, type Incidencia, type OrdenMantenimiento, type Proveedor,
} from "@/lib/queries";
import { IncidenciaFormDialog } from "@/components/mantenimiento/IncidenciaFormDialog";
import { OrdenFormDialog } from "@/components/mantenimiento/OrdenFormDialog";
import { ProveedorFormDialog } from "@/components/mantenimiento/ProveedorFormDialog";
import { fmtL, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/mantenimiento")({ component: MantenimientoPage });

const prioBadge: Record<string, "success" | "danger" | "warning" | "neutral"> = { baja: "neutral", media: "warning", alta: "danger", urgente: "danger" };
const estadoIncBadge: Record<string, "success" | "danger" | "warning" | "neutral"> = { nuevo: "warning", en_revision: "warning", en_proceso: "neutral", resuelto: "success", cerrado: "neutral" };
const estadoOrdBadge: Record<string, "success" | "danger" | "warning" | "neutral"> = { pendiente: "warning", en_proceso: "neutral", completado: "success", cancelado: "neutral" };

function MantenimientoPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useEdificioFilter();
  const filter = edificioId === "all" ? undefined : edificioId;
  const { data: incidencias = [] } = useIncidencias(filter);
  const { data: ordenes = [] } = useOrdenes(filter);
  const { data: proveedores = [] } = useProveedores(filter);

  const [incOpen, setIncOpen] = useState(false);
  const [incEdit, setIncEdit] = useState<Incidencia | null>(null);
  const [ordOpen, setOrdOpen] = useState(false);
  const [ordEdit, setOrdEdit] = useState<OrdenMantenimiento | null>(null);
  const [provOpen, setProvOpen] = useState(false);
  const [provEdit, setProvEdit] = useState<Proveedor | null>(null);

  const [qInc, setQInc] = useState(""); const [fIncEstado, setFIncEstado] = useState("all"); const [fIncPrio, setFIncPrio] = useState("all");
  const [qOrd, setQOrd] = useState(""); const [fOrdEstado, setFOrdEstado] = useState("all");
  const [qProv, setQProv] = useState("");

  const delInc = useDeleteIncidencia(); const delOrd = useDeleteOrden(); const delProv = useDeleteProveedor();

  const stats = useMemo(() => {
    const incAbiertas = incidencias.filter((i) => i.estado !== "resuelto" && i.estado !== "cerrado").length;
    const incUrgentes = incidencias.filter((i) => (i.prioridad === "urgente" || i.prioridad === "alta") && i.estado !== "resuelto" && i.estado !== "cerrado").length;
    const ordPendientes = ordenes.filter((o) => o.estado === "pendiente" || o.estado === "en_proceso").length;
    const costoMes = ordenes
      .filter((o) => o.costo_real && new Date(o.created_at).getMonth() === new Date().getMonth())
      .reduce((a, o) => a + Number(o.costo_real ?? 0), 0);
    return { incAbiertas, incUrgentes, ordPendientes, costoMes };
  }, [incidencias, ordenes]);

  const incFiltered = useMemo(() => incidencias.filter((i) =>
    (fIncEstado === "all" || i.estado === fIncEstado) &&
    (fIncPrio === "all" || i.prioridad === fIncPrio) &&
    (!qInc || i.descripcion.toLowerCase().includes(qInc.toLowerCase()) || (i.tipo ?? "").toLowerCase().includes(qInc.toLowerCase()))
  ), [incidencias, qInc, fIncEstado, fIncPrio]);

  const ordFiltered = useMemo(() => ordenes.filter((o) =>
    (fOrdEstado === "all" || o.estado === fOrdEstado) &&
    (!qOrd || o.titulo.toLowerCase().includes(qOrd.toLowerCase()) || (o.area ?? "").toLowerCase().includes(qOrd.toLowerCase()))
  ), [ordenes, qOrd, fOrdEstado]);

  const provFiltered = useMemo(() => proveedores.filter((p) =>
    !qProv || p.nombre.toLowerCase().includes(qProv.toLowerCase()) || (p.servicio ?? "").toLowerCase().includes(qProv.toLowerCase())
  ), [proveedores, qProv]);

  const provMap = useMemo(() => new Map(proveedores.map((p) => [p.id, p.nombre])), [proveedores]);

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Mantenimiento</h1>
            <p className="text-sm text-[#9a7060]">Incidencias, órdenes de trabajo y proveedores</p>
          </div>
          <Select value={edificioId} onValueChange={setEdificioId}>
            <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los edificios</SelectItem>
              {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={<AlertTriangle className="w-5 h-5" />} label="Incidencias abiertas" value={stats.incAbiertas} accent="danger" />
          <KpiCard icon={<AlertTriangle className="w-5 h-5" />} label="Prioridad alta/urgente" value={stats.incUrgentes} accent="danger" />
          <KpiCard icon={<ClipboardCheck className="w-5 h-5" />} label="Órdenes en curso" value={stats.ordPendientes} accent="primary" />
          <KpiCard icon={<Wrench className="w-5 h-5" />} label="Costo del mes" value={fmtL(stats.costoMes)} accent="neutral" />
        </div>

        <Tabs defaultValue="incidencias">
          <TabsList className="bg-[#f5ede8]">
            <TabsTrigger value="incidencias">Incidencias</TabsTrigger>
            <TabsTrigger value="ordenes">Órdenes</TabsTrigger>
            <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
          </TabsList>

          {/* INCIDENCIAS */}
          <TabsContent value="incidencias" className="space-y-3 pt-4">
            <Card className="p-3 flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
                <Input placeholder="Buscar..." value={qInc} onChange={(e) => setQInc(e.target.value)} className="pl-9" />
              </div>
              <Select value={fIncEstado} onValueChange={setFIncEstado}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {["nuevo","en_proceso","resuelto","cancelado"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={fIncPrio} onValueChange={setFIncPrio}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda prioridad</SelectItem>
                  {["baja","media","alta","urgente"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => { setIncEdit(null); setIncOpen(true); }} disabled={edificioId === "all"} className="bg-[#c94f0c] hover:bg-[#a33d08]">
                <Plus className="w-4 h-4 mr-1" />Reportar
              </Button>
            </Card>
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5ede8] text-[#9a7060]">
                  <tr><th className="text-left p-3">Fecha</th><th className="text-left p-3">Tipo</th><th className="text-left p-3">Descripción</th><th className="text-left p-3">Prioridad</th><th className="text-left p-3">Estado</th><th className="p-3"></th></tr>
                </thead>
                <tbody>
                  {incFiltered.length === 0 && <tr><td colSpan={6} className="text-center text-[#9a7060] py-8">Sin incidencias</td></tr>}
                  {incFiltered.map((i) => (
                    <tr key={i.id} className="border-t border-[#f0e6e0]">
                      <td className="p-3 whitespace-nowrap">{fmtDate(i.created_at)}</td>
                      <td className="p-3 capitalize">{i.tipo ?? "—"}</td>
                      <td className="p-3 max-w-[400px]">{i.descripcion}</td>
                      <td className="p-3"><Badge variant={prioBadge[i.prioridad]}>{i.prioridad}</Badge></td>
                      <td className="p-3"><Badge variant={estadoIncBadge[i.estado]}>{i.estado}</Badge></td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Button size="icon" variant="ghost" onClick={() => { setIncEdit(i); setIncOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => confirm("¿Eliminar?") && delInc.mutate(i.id)}><Trash2 className="w-4 h-4 text-[#c0392b]" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* ORDENES */}
          <TabsContent value="ordenes" className="space-y-3 pt-4">
            <Card className="p-3 flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
                <Input placeholder="Buscar..." value={qOrd} onChange={(e) => setQOrd(e.target.value)} className="pl-9" />
              </div>
              <Select value={fOrdEstado} onValueChange={setFOrdEstado}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {["pendiente","en_proceso","completada","cancelada"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => { setOrdEdit(null); setOrdOpen(true); }} disabled={edificioId === "all"} className="bg-[#c94f0c] hover:bg-[#a33d08]">
                <Plus className="w-4 h-4 mr-1" />Nueva orden
              </Button>
            </Card>
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5ede8] text-[#9a7060]">
                  <tr><th className="text-left p-3">Título</th><th className="text-left p-3">Área</th><th className="text-left p-3">Proveedor</th><th className="text-left p-3">Límite</th><th className="text-right p-3">Costo</th><th className="text-left p-3">Estado</th><th className="p-3"></th></tr>
                </thead>
                <tbody>
                  {ordFiltered.length === 0 && <tr><td colSpan={7} className="text-center text-[#9a7060] py-8">Sin órdenes</td></tr>}
                  {ordFiltered.map((o) => (
                    <tr key={o.id} className="border-t border-[#f0e6e0]">
                      <td className="p-3 font-medium">{o.titulo}</td>
                      <td className="p-3">{o.area ?? "—"}</td>
                      <td className="p-3">{o.proveedor_id ? provMap.get(o.proveedor_id) ?? "—" : "—"}</td>
                      <td className="p-3 whitespace-nowrap">{fmtDate(o.fecha_limite)}</td>
                      <td className="p-3 text-right tabular-nums">{o.costo_real != null ? fmtL(Number(o.costo_real)) : o.costo_estimado != null ? `~${fmtL(Number(o.costo_estimado))}` : "—"}</td>
                      <td className="p-3"><Badge variant={estadoOrdBadge[o.estado]}>{o.estado}</Badge></td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Button size="icon" variant="ghost" onClick={() => { setOrdEdit(o); setOrdOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => confirm("¿Eliminar?") && delOrd.mutate(o.id)}><Trash2 className="w-4 h-4 text-[#c0392b]" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* PROVEEDORES */}
          <TabsContent value="proveedores" className="space-y-3 pt-4">
            <Card className="p-3 flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
                <Input placeholder="Buscar proveedor..." value={qProv} onChange={(e) => setQProv(e.target.value)} className="pl-9" />
              </div>
              <Button onClick={() => { setProvEdit(null); setProvOpen(true); }} className="bg-[#c94f0c] hover:bg-[#a33d08]">
                <Plus className="w-4 h-4 mr-1" />Nuevo proveedor
              </Button>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {provFiltered.length === 0 && <div className="col-span-full text-center text-[#9a7060] py-8"><Users className="w-8 h-8 mx-auto mb-2" />Sin proveedores</div>}
              {provFiltered.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[#2d1200]">{p.nombre}</div>
                      <div className="text-xs text-[#9a7060]">{p.servicio ?? "—"}</div>
                    </div>
                    {p.calificacion && <div className="flex items-center gap-1 text-sm text-[#c94f0c]"><Star className="w-4 h-4 fill-current" />{Number(p.calificacion).toFixed(1)}</div>}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-[#5a3520]">
                    {p.telefono && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{p.telefono}</div>}
                    {p.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{p.email}</div>}
                  </div>
                  <div className="mt-3 flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => { setProvEdit(p); setProvOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => confirm("¿Eliminar?") && delProv.mutate(p.id)}><Trash2 className="w-4 h-4 text-[#c0392b]" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {incOpen && <IncidenciaFormDialog open={incOpen} onOpenChange={setIncOpen} incidencia={incEdit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
      {ordOpen && <OrdenFormDialog open={ordOpen} onOpenChange={setOrdOpen} orden={ordEdit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
      {provOpen && <ProveedorFormDialog open={provOpen} onOpenChange={setProvOpen} proveedor={provEdit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
    </AppShell>
  );
}
