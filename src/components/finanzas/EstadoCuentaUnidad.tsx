import { useMemo, useState } from "react";
import { Card } from "@/components/ui-pentos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui-pentos";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { fmtL, fmtDate } from "@/lib/format";
import { useUnidades, useCobros, useResidentes, diasMora } from "@/lib/queries";

function downloadCSV(name: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

export function EstadoCuentaUnidad({ edificioId }: { edificioId: string }) {
  const { data: unidades = [] } = useUnidades(edificioId === "all" ? undefined : edificioId);
  const { data: cobros = [] } = useCobros(edificioId === "all" ? undefined : edificioId);
  const { data: residentes = [] } = useResidentes();
  const [unidadId, setUnidadId] = useState<string>("");

  const unidad = useMemo(() => unidades.find((u) => u.id === unidadId), [unidades, unidadId]);
  const residente = useMemo(() => residentes.find((r) => r.id === (unidad?.inquilino_id ?? unidad?.propietario_id)), [residentes, unidad]);
  const movimientos = useMemo(() => cobros.filter((c) => c.unidad_id === unidadId), [cobros, unidadId]);
  const totalPendiente = movimientos.filter((c) => c.estado !== "pagado").reduce((a, c) => a + Number(c.monto), 0);
  const totalPagado = movimientos.filter((c) => c.estado === "pagado").reduce((a, c) => a + Number(c.monto), 0);
  const totalVencido = movimientos.filter((c) => diasMora(c.fecha_vencimiento, c.estado) > 0).reduce((a, c) => a + Number(c.monto), 0);

  const estadoBadge = (c: any) => {
    if (c.estado === "pagado") return <Badge variant="success">Pagado</Badge>;
    const d = diasMora(c.fecha_vencimiento, c.estado);
    if (d > 0) return <Badge variant="danger">Vencido · {d}d</Badge>;
    if (c.estado === "parcial") return <Badge variant="warning">Parcial</Badge>;
    return <Badge variant="neutral">Pendiente</Badge>;
  };

  const exportCSV = () => {
    if (!unidad) return;
    downloadCSV(
      `estado-cuenta-${unidad.numero}.csv`,
      movimientos.map((c) => ({
        concepto: c.concepto,
        vence: c.fecha_vencimiento,
        pagado: c.fecha_pago ?? "",
        monto: c.monto,
        estado: c.estado,
        dias_mora: diasMora(c.fecha_vencimiento, c.estado),
        recibo: c.recibo_numero ?? "",
        metodo_pago: c.metodo_pago ?? "",
      })),
    );
  };

  return (
    <Card className="p-5 space-y-4">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          @page { margin: 14mm; }
        }
      `}</style>

      <div className="flex flex-wrap items-end justify-between gap-3 no-print">
        <div className="flex-1 min-w-[260px]">
          <label className="text-xs uppercase tracking-wider text-[#64748B]">Unidad</label>
          <Select value={unidadId} onValueChange={setUnidadId}>
            <SelectTrigger><SelectValue placeholder={edificioId === "all" ? "Selecciona edificio arriba" : "Selecciona una unidad"} /></SelectTrigger>
            <SelectContent className="max-h-72">
              {unidades.map((u) => <SelectItem key={u.id} value={u.id}>#{u.numero}{u.piso != null ? ` · piso ${u.piso}` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {unidadId && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Imprimir</Button>
          </div>
        )}
      </div>

      {unidadId && (
        <>
          <div className="print:block hidden mb-4">
            <h2 className="font-display font-extrabold text-2xl text-[#374151]">Estado de cuenta</h2>
            <div className="text-sm text-[#64748B]">Unidad #{unidad?.numero} · {residente ? `${residente.nombre} ${residente.apellido}` : "Sin residente"}</div>
            <div className="text-xs text-[#64748B]">Generado: {fmtDate(new Date())}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#F8FAFC]"><div className="text-xs text-[#64748B]">Pagado</div><div className="font-display font-bold text-[#166534] text-lg">{fmtL(totalPagado)}</div></div>
            <div className="p-3 rounded-xl bg-[#F8FAFC]"><div className="text-xs text-[#64748B]">Pendiente</div><div className="font-display font-bold text-[#374151] text-lg">{fmtL(totalPendiente)}</div></div>
            <div className="p-3 rounded-xl bg-[#F8FAFC]"><div className="text-xs text-[#64748B]">Vencido</div><div className="font-display font-bold text-[#be185d] text-lg">{fmtL(totalVencido)}</div></div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                  <TableHead>Concepto</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-[#64748B]">Sin movimientos.</TableCell></TableRow>}
                {movimientos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">{c.concepto}</TableCell>
                    <TableCell className="text-sm">{fmtDate(c.fecha_vencimiento)}</TableCell>
                    <TableCell className="text-sm">{fmtDate(c.fecha_pago)}</TableCell>
                    <TableCell className="text-right font-semibold">{fmtL(c.monto)}</TableCell>
                    <TableCell>{estadoBadge(c)}</TableCell>
                    <TableCell className="text-xs text-[#64748B]">{c.recibo_numero ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </Card>
  );
}
