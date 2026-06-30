import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-pentos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Check, DollarSign, AlertTriangle } from "lucide-react";
import { useReservas, useAreas, useUnidades, useResidentes, useDeleteReserva, useSaveReserva, type Reserva } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


const fmtDT = (s: string) => new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" });

export function ReservasTable({ edificioId, onEdit }: { edificioId: string; onEdit: (r: Reserva) => void }) {
  const { data: reservas = [], isLoading } = useReservas(edificioId === "all" ? undefined : edificioId);
  const { data: areas = [] } = useAreas();
  const { data: unidades = [] } = useUnidades();
  const { data: residentes = [] } = useResidentes();
  const del = useDeleteReserva();
  const save = useSaveReserva();
  const [estado, setEstado] = useState("all");

  const aprobar = async (r: Reserva) => {
    const { data: u } = await supabase.auth.getUser();
    await save.mutateAsync({
      id: r.id,
      condominio_id: r.condominio_id,
      area_id: r.area_id,
      fecha_inicio: r.fecha_inicio,
      fecha_fin: r.fecha_fin,
      estado: "confirmada",
      aprobada_por: u.user?.id ?? null,
      aprobada_en: new Date().toISOString(),
    } as any);
    toast.success("Reserva autorizada");
  };
  const marcarPagado = async (r: Reserva) => {
    await save.mutateAsync({
      id: r.id,
      condominio_id: r.condominio_id,
      area_id: r.area_id,
      fecha_inicio: r.fecha_inicio,
      fecha_fin: r.fecha_fin,
      pagado_extra: true,
    } as any);
    toast.success("Pago extra registrado");
  };


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
              <TableHead className="text-[#4A154B] font-semibold">Área</TableHead>
              <TableHead className="text-[#4A154B] font-semibold">Unidad · Residente</TableHead>
              <TableHead className="text-[#4A154B] font-semibold">Inicio</TableHead>
              <TableHead className="text-[#4A154B] font-semibold">Fin</TableHead>
              <TableHead className="text-[#4A154B] font-semibold">Personas</TableHead>
              <TableHead className="text-[#4A154B] font-semibold">Estado</TableHead>
              <TableHead className="text-[#4A154B] font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#64748B]">Cargando…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#64748B]">Sin reservas.</TableCell></TableRow>}
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-[#4A154B]">{areaMap.get(r.area_id) ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  <div className="text-[#4A154B]">{r.unidad_id ? `#${uniMap.get(r.unidad_id) ?? "—"}` : "—"}</div>
                  <div className="text-xs text-[#64748B]">{r.residente_id ? resMap.get(r.residente_id) ?? "—" : "—"}</div>
                </TableCell>
                <TableCell className="text-sm">{fmtDT(r.fecha_inicio)}</TableCell>
                <TableCell className="text-sm">{fmtDT(r.fecha_fin)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{r.num_personas ?? "—"}</span>
                    {(r as any).excede_capacidad && (
                      <span title={`+${(r as any).personas_extra} extra · ${(r as any).solicitud_nota ?? ""}`} className="inline-flex items-center gap-1 text-[10px] bg-[#FEF3C7] text-[#78350F] border border-[#FCD34D] rounded-full px-1.5 py-0.5">
                        <AlertTriangle className="w-3 h-3" />+{(r as any).personas_extra}
                      </span>
                    )}
                  </div>
                  {Number((r as any).monto_extra) > 0 && (
                    <div className={`text-[10px] mt-0.5 ${(r as any).pagado_extra ? "text-[#15803d]" : "text-[#be185d]"}`}>
                      Extra: L {Number((r as any).monto_extra).toFixed(2)} {(r as any).pagado_extra ? "✓ pagado" : "pendiente"}
                    </div>
                  )}
                </TableCell>
                <TableCell>{badge(r.estado)}</TableCell>
                <TableCell className="text-right">
                  {r.estado === "pendiente" && (
                    <Button size="sm" variant="ghost" onClick={() => aprobar(r)} title="Autorizar" className="h-8 w-8 p-0 text-[#15803d]"><Check className="w-4 h-4" /></Button>
                  )}
                  {Number((r as any).monto_extra) > 0 && !(r as any).pagado_extra && (
                    <Button size="sm" variant="ghost" onClick={() => marcarPagado(r)} title="Marcar pago extra" className="h-8 w-8 p-0 text-[#15803d]"><DollarSign className="w-4 h-4" /></Button>
                  )}
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
