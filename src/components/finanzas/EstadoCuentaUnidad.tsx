import { useMemo, useState } from "react";
import { Card } from "@/components/ui-pentos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui-pentos";
import { fmtL, fmtDate } from "@/lib/format";
import { useUnidades, useCobros } from "@/lib/queries";

export function EstadoCuentaUnidad({ edificioId }: { edificioId: string }) {
  const { data: unidades = [] } = useUnidades(edificioId === "all" ? undefined : edificioId);
  const { data: cobros = [] } = useCobros(edificioId === "all" ? undefined : edificioId);
  const [unidadId, setUnidadId] = useState<string>("");

  const movimientos = useMemo(() => cobros.filter((c) => c.unidad_id === unidadId), [cobros, unidadId]);
  const totalPendiente = movimientos.filter((c) => c.estado !== "pagado").reduce((a, c) => a + Number(c.monto), 0);
  const totalPagado = movimientos.filter((c) => c.estado === "pagado").reduce((a, c) => a + Number(c.monto), 0);

  const estadoBadge = (e: string) => {
    if (e === "pagado") return <Badge variant="success">Pagado</Badge>;
    if (e === "vencido") return <Badge variant="danger">Vencido</Badge>;
    if (e === "parcial") return <Badge variant="warning">Parcial</Badge>;
    return <Badge variant="neutral">Pendiente</Badge>;
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex-1 min-w-[260px]">
          <label className="text-xs uppercase tracking-wider text-[#9a7060]">Unidad</label>
          <Select value={unidadId} onValueChange={setUnidadId}>
            <SelectTrigger><SelectValue placeholder={edificioId === "all" ? "Selecciona edificio primero arriba" : "Selecciona una unidad"} /></SelectTrigger>
            <SelectContent className="max-h-72">
              {unidades.map((u) => <SelectItem key={u.id} value={u.id}>#{u.numero}{u.piso != null ? ` · piso ${u.piso}` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {unidadId && (
          <div className="flex gap-6 text-sm">
            <div><div className="text-xs text-[#9a7060]">Pagado total</div><div className="font-display font-bold text-[#2d6a2d] text-lg">{fmtL(totalPagado)}</div></div>
            <div><div className="text-xs text-[#9a7060]">Saldo pendiente</div><div className="font-display font-bold text-[#c0392b] text-lg">{fmtL(totalPendiente)}</div></div>
          </div>
        )}
      </div>
      {unidadId && (
        <div className="bg-white border border-[#e8ddd8] rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f5ede8] hover:bg-[#f5ede8]">
                <TableHead>Concepto</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Recibo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-[#9a7060]">Sin movimientos.</TableCell></TableRow>}
              {movimientos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm">{c.concepto}</TableCell>
                  <TableCell className="text-sm">{fmtDate(c.fecha_vencimiento)}</TableCell>
                  <TableCell className="text-sm">{fmtDate(c.fecha_pago)}</TableCell>
                  <TableCell className="text-right font-semibold">{fmtL(c.monto)}</TableCell>
                  <TableCell>{estadoBadge(c.estado)}</TableCell>
                  <TableCell className="text-xs text-[#9a7060]">{c.recibo_numero ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
