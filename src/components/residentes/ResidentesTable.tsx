import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-pentos";
import { Pencil, Trash2, Mail, Phone, Eye, KeyRound } from "lucide-react";
import { fmtDate } from "@/lib/format";
import { useResidentes, useDeleteResidente, useEdificios, useUnidades, type Residente } from "@/lib/queries";
import { GenerarAccesoDialog } from "./GenerarAccesoDialog";


export function ResidentesTable({
  search, edificioId, tipo, estado, onEdit, onView,
}: {
  search: string; edificioId: string; tipo: string; estado: string;
  onEdit: (r: Residente) => void;
  onView?: (r: Residente) => void;
}) {
  const { data: residentes = [], isLoading } = useResidentes();
  const { data: edificios = [] } = useEdificios();
  const { data: unidades = [] } = useUnidades();
  const del = useDeleteResidente();
  const [accesoFor, setAccesoFor] = useState<Residente | null>(null);


  const edifMap = useMemo(() => new Map(edificios.map((e) => [e.id, e.nombre])), [edificios]);
  const uniMap = useMemo(() => new Map(unidades.map((u) => [u.id, u.numero])), [unidades]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return residentes.filter((r) => {
      if (edificioId !== "all" && r.condominio_id !== edificioId) return false;
      if (tipo !== "all" && r.tipo !== tipo) return false;
      if (estado === "activos" && !r.activo) return false;
      if (estado === "inactivos" && r.activo) return false;
      if (s) {
        const hay = `${r.nombre} ${r.apellido ?? ""} ${r.dni ?? ""} ${r.telefono ?? ""} ${r.email ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [residentes, search, edificioId, tipo, estado]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
            <TableHead className="text-[#374151] font-semibold">Residente</TableHead>
            <TableHead className="text-[#374151] font-semibold">Tipo</TableHead>
            <TableHead className="text-[#374151] font-semibold">Edificio · Unidad</TableHead>
            <TableHead className="text-[#374151] font-semibold">Contacto</TableHead>
            <TableHead className="text-[#374151] font-semibold">Ingreso</TableHead>
            <TableHead className="text-[#374151] font-semibold">Estado</TableHead>
            <TableHead className="text-[#374151] font-semibold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#64748B]">Cargando…</TableCell></TableRow>}
          {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#64748B]">Sin residentes para los filtros.</TableCell></TableRow>}
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="font-semibold text-[#374151]">{r.nombre} {r.apellido}</div>
                {r.dni && <div className="text-xs text-[#64748B]">DNI {r.dni}</div>}
              </TableCell>
              <TableCell>
                <Badge variant={r.tipo === "propietario" ? "venta" : "renta"}>{r.tipo}</Badge>
              </TableCell>
              <TableCell className="text-sm">
                <div className="text-[#374151]">{edifMap.get(r.condominio_id) ?? "—"}</div>
                <div className="text-xs text-[#64748B]">{r.unidad_id ? `Unidad #${uniMap.get(r.unidad_id) ?? "—"}` : "Sin unidad"}</div>
              </TableCell>
              <TableCell className="text-sm">
                {r.telefono && <div className="flex items-center gap-1 text-[#1E293B]"><Phone className="w-3 h-3" />{r.telefono}</div>}
                {r.email && <div className="flex items-center gap-1 text-xs text-[#64748B]"><Mail className="w-3 h-3" />{r.email}</div>}
                {!r.telefono && !r.email && <span className="text-[#64748B]">—</span>}
              </TableCell>
              <TableCell className="text-sm text-[#1E293B]">{fmtDate(r.fecha_ingreso)}</TableCell>
              <TableCell>{r.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="neutral">Inactivo</Badge>}</TableCell>
              <TableCell className="text-right">
                {onView && <Button size="sm" variant="ghost" onClick={() => onView(r)} className="h-8 w-8 p-0" title="Ver detalle"><Eye className="w-4 h-4" /></Button>}
                <Button size="sm" variant="ghost" onClick={() => setAccesoFor(r)} className="h-8 w-8 p-0" title="Generar acceso al portal"><KeyRound className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(r)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm(`¿Eliminar ${r.nombre} ${r.apellido}?`)) del.mutate(r.id); }} className="h-8 w-8 p-0 text-[#be185d] hover:text-[#be185d]"><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <GenerarAccesoDialog residente={accesoFor} open={!!accesoFor} onOpenChange={(v) => !v && setAccesoFor(null)} />

    </div>
  );
}
