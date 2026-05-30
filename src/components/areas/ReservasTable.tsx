import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-pentos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { useReservas, useAreas, useUnidades, useResidentes, useDeleteReserva, type Reserva } from "@/lib/queries";

const fmtDT = (s: string) => new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" });

export function ReservasTable({ edificioId, onEdit }: { edificioId: string; onEdit: (r: Reserva) => void }) {
  const { data: reservas = [], isLoading } = useReservas(edificioId === "all" ? undefined : edificioId);
  const { data: areas = [] } = useAreas();
  const { data: unidades = [] } = useUnidades();
  const { data: residentes = [] } = useResidentes();
  const del = useDeleteReserva();
  const [estado, setEstado] = useState("all");

  const areaMap = useMemo(() => new Map(areas.map((a) => [a.id, a.nombre])), [areas]);
  const uniMap = useMemo(() => new Map(unidades.map((u) => [u.id, u.numero])), [unidades]);
  const resMap = useMemo(() => new Map(residentes.map((r) => [r.id, `${r.nombre} ${r.apellido}`])), [residentes]);

  const filtered = useMemo(() => reservas.filter((r) => estado === "all" || r.estado === estado), [reservas, estado]);

  const badge = (e: string) => {
    if (e === "confirmada") return <Badge variant="success">Confirmada</Badge>;
    if (e === "pendiente") return <Badge variant="warning">Pendiente</Badge>;
    if (e === "cancelada") return <Badge variant="danger">Cancelada</Badge>;
    return <Badge variant="neutral">{e}</Badge>;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="confirmada">Confirmadas</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              <TableHead className="text-[#374151] font-semibold">Área</TableHead>
              <TableHead className="text-[#374151] font-semibold">Unidad · Residente</TableHead>
              <TableHead className="text-[#374151] font-semibold">Inicio</TableHead>
              <TableHead className="text-[#374151] font-semibold">Fin</TableHead>
              <TableHead className="text-[#374151] font-semibold">Personas</TableHead>
              <TableHead className="text-[#374151] font-semibold">Estado</TableHead>
              <TableHead className="text-[#374151] font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#64748B]">Cargando…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#64748B]">Sin reservas.</TableCell></TableRow>}
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-[#374151]">{areaMap.get(r.area_id) ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  <div className="text-[#374151]">{r.unidad_id ? `#${uniMap.get(r.unidad_id) ?? "—"}` : "—"}</div>
                  <div className="text-xs text-[#64748B]">{r.residente_id ? resMap.get(r.residente_id) ?? "—" : "—"}</div>
                </TableCell>
                <TableCell className="text-sm">{fmtDT(r.fecha_inicio)}</TableCell>
                <TableCell className="text-sm">{fmtDT(r.fecha_fin)}</TableCell>
                <TableCell>{r.num_personas ?? "—"}</TableCell>
                <TableCell>{badge(r.estado)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(r)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar reserva?")) del.mutate(r.id); }} className="h-8 w-8 p-0 text-[#be185d]"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
