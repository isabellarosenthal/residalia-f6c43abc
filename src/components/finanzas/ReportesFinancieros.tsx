import { useMemo, useState } from "react";
import { Card } from "@/components/ui-pentos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { fmtL, fmtDate } from "@/lib/format";
import { useCobros, useEgresos, useResidentesMap, useUnidades } from "@/lib/queries";

const COLORS = ["#4F46E5", "#166534", "#1f6f8b", "#a55b00", "#7d3c98", "#be185d", "#1abc9c", "#f1c40f"];

function toCSV(rows: (string | number)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}
function downloadCSV(name: string, rows: (string | number)[][]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export function ReportesFinancieros({ edificioId }: { edificioId: string }) {
  const filter = edificioId === "all" ? undefined : edificioId;
  const { data: cobros = [] } = useCobros(filter);
  const { data: egresos = [] } = useEgresos(filter);
  const { data: unidades = [] } = useUnidades(filter);
  const { data: residentes } = useResidentesMap();

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [desde, setDesde] = useState(firstOfMonth);
  const [hasta, setHasta] = useState(lastOfMonth);

  const inRange = (d: string | null | undefined) => !!d && d >= desde && d <= hasta;
  const unidadMap = useMemo(() => new Map(unidades.map((u) => [u.id, u])), [unidades]);

  // P&L
  const ingresosPagados = cobros.filter((c) => c.estado === "pagado" && inRange(c.fecha_pago));
  const egresosRango = egresos.filter((e) => inRange(e.fecha));
  const totalIngresos = ingresosPagados.reduce((a, c) => a + Number(c.monto), 0);
  const totalEgresos = egresosRango.reduce((a, e) => a + Number(e.monto), 0);

  const ingresosPorConcepto = useMemo(() => {
    const m = new Map<string, number>();
    ingresosPagados.forEach((c) => m.set(c.concepto, (m.get(c.concepto) ?? 0) + Number(c.monto)));
    return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [ingresosPagados]);

  const egresosPorCategoria = useMemo(() => {
    const m = new Map<string, number>();
    egresosRango.forEach((e) => m.set(e.categoria, (m.get(e.categoria) ?? 0) + Number(e.monto)));
    return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [egresosRango]);

  // Top morosos
  const topMorosos = useMemo(() => {
    const m = new Map<string, { unidad: string; residente: string; monto: number; cobros: number; dias: number }>();
    cobros.filter((c) => c.estado !== "pagado").forEach((c) => {
      const key = c.unidad_id ?? c.residente_id ?? "sin";
      const u = c.unidad_id ? unidadMap.get(c.unidad_id) : null;
      const unidad = u ? `${u.piso ? `P${u.piso}-` : ""}${u.numero}` : "—";
      const residente = c.residente_id ? (residentes?.get(c.residente_id) ?? "—") : "—";
      const dias = Math.floor((today.getTime() - new Date(c.fecha_vencimiento).getTime()) / 86400000);
      const cur = m.get(key) ?? { unidad, residente, monto: 0, cobros: 0, dias: 0 };
      cur.monto += Number(c.monto);
      cur.cobros += 1;
      cur.dias = Math.max(cur.dias, dias);
      m.set(key, cur);
    });
    return Array.from(m.values()).sort((a, b) => b.monto - a.monto).slice(0, 10);
  }, [cobros, unidadMap, residentes, today]);

  // Flujo de caja
  const flujo = useMemo(() => {
    type Mov = { fecha: string; descripcion: string; ingreso: number; egreso: number };
    const movs: Mov[] = [];
    ingresosPagados.forEach((c) => movs.push({ fecha: c.fecha_pago!, descripcion: `Cobro: ${c.concepto}`, ingreso: Number(c.monto), egreso: 0 }));
    egresosRango.forEach((e) => movs.push({ fecha: e.fecha, descripcion: `${e.categoria}${e.proveedor ? ` · ${e.proveedor}` : ""}`, ingreso: 0, egreso: Number(e.monto) }));
    movs.sort((a, b) => a.fecha.localeCompare(b.fecha));
    let saldo = 0;
    return movs.map((m) => { saldo += m.ingreso - m.egreso; return { ...m, saldo }; });
  }, [ingresosPagados, egresosRango]);

  const exportPL = () => {
    const rows: (string | number)[][] = [["Estado de resultados", `${desde} a ${hasta}`], [], ["INGRESOS POR CONCEPTO", "Monto"]];
    ingresosPorConcepto.forEach((r) => rows.push([r.name, r.value]));
    rows.push(["Total ingresos", totalIngresos], [], ["EGRESOS POR CATEGORÍA", "Monto"]);
    egresosPorCategoria.forEach((r) => rows.push([r.name, r.value]));
    rows.push(["Total egresos", totalEgresos], [], ["UTILIDAD", totalIngresos - totalEgresos]);
    downloadCSV(`reporte-pyl-${desde}-${hasta}.csv`, rows);
  };
  const exportFlujo = () => {
    const rows: (string | number)[][] = [["Fecha", "Descripción", "Ingreso", "Egreso", "Saldo"]];
    flujo.forEach((m) => rows.push([m.fecha, m.descripcion, m.ingreso, m.egreso, m.saldo]));
    downloadCSV(`flujo-caja-${desde}-${hasta}.csv`, rows);
  };
  const exportMorosos = () => {
    const rows: (string | number)[][] = [["Unidad", "Residente", "Cobros pendientes", "Días vencido (máx)", "Monto"]];
    topMorosos.forEach((m) => rows.push([m.unidad, m.residente, m.cobros, m.dias, m.monto]));
    downloadCSV(`top-morosos-${desde}-${hasta}.csv`, rows);
  };

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-[160px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-[160px]" />
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Imprimir</Button>
          </div>
        </div>
      </Card>

      {/* P&L */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#4F46E5]">Estado de resultados</h3>
          <Button size="sm" variant="outline" onClick={exportPL}><Download className="w-4 h-4 mr-1" />CSV</Button>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="text-sm text-[#64748B] mb-2">Ingresos por concepto</div>
            <table className="w-full text-sm">
              <tbody>
                {ingresosPorConcepto.map((r) => (
                  <tr key={r.name} className="border-b border-[#f0e6e0]"><td className="py-1.5">{r.name}</td><td className="py-1.5 text-right tabular-nums">{fmtL(r.value)}</td></tr>
                ))}
                <tr className="font-bold text-[#166534]"><td className="py-2">Total</td><td className="py-2 text-right tabular-nums">{fmtL(totalIngresos)}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="text-sm text-[#64748B] mb-2">Egresos por categoría</div>
            <table className="w-full text-sm">
              <tbody>
                {egresosPorCategoria.map((r) => (
                  <tr key={r.name} className="border-b border-[#f0e6e0]"><td className="py-1.5">{r.name}</td><td className="py-1.5 text-right tabular-nums">{fmtL(r.value)}</td></tr>
                ))}
                <tr className="font-bold text-[#be185d]"><td className="py-2">Total</td><td className="py-2 text-right tabular-nums">{fmtL(totalEgresos)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="font-display font-bold text-[#4F46E5]">Utilidad del periodo</span>
          <span className={`font-display font-extrabold text-2xl ${totalIngresos - totalEgresos >= 0 ? "text-[#166534]" : "text-[#be185d]"}`}>{fmtL(totalIngresos - totalEgresos)}</span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-display font-bold text-[#4F46E5] mb-3">Ingresos por concepto</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ingresosPorConcepto} dataKey="value" nameKey="name" outerRadius={90} label={(d: any) => d.name}>
                  {ingresosPorConcepto.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => fmtL(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-bold text-[#4F46E5] mb-3">Egresos por categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={egresosPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" />
                <Tooltip formatter={(v: any) => fmtL(Number(v))} />
                <Legend />
                <Bar dataKey="value" name="Egresos" fill="#be185d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top morosos */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#4F46E5]">Top 10 morosos</h3>
          <Button size="sm" variant="outline" onClick={exportMorosos}><Download className="w-4 h-4 mr-1" />CSV</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-[#64748B]">
              <tr><th className="text-left p-2">Unidad</th><th className="text-left p-2">Residente</th><th className="text-right p-2">Cobros</th><th className="text-right p-2">Días</th><th className="text-right p-2">Monto</th></tr>
            </thead>
            <tbody>
              {topMorosos.length === 0 && <tr><td colSpan={5} className="text-center text-[#64748B] py-6">Sin morosos 🎉</td></tr>}
              {topMorosos.map((m, i) => (
                <tr key={i} className="border-b border-[#f0e6e0]">
                  <td className="p-2 font-medium">{m.unidad}</td>
                  <td className="p-2">{m.residente}</td>
                  <td className="p-2 text-right tabular-nums">{m.cobros}</td>
                  <td className="p-2 text-right tabular-nums">{m.dias > 0 ? m.dias : 0}</td>
                  <td className="p-2 text-right tabular-nums font-semibold text-[#be185d]">{fmtL(m.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Flujo de caja */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#4F46E5]">Flujo de caja</h3>
          <Button size="sm" variant="outline" onClick={exportFlujo}><Download className="w-4 h-4 mr-1" />CSV</Button>
        </div>
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-[#64748B] sticky top-0">
              <tr><th className="text-left p-2">Fecha</th><th className="text-left p-2">Descripción</th><th className="text-right p-2">Ingreso</th><th className="text-right p-2">Egreso</th><th className="text-right p-2">Saldo</th></tr>
            </thead>
            <tbody>
              {flujo.length === 0 && <tr><td colSpan={5} className="text-center text-[#64748B] py-6">Sin movimientos en el periodo</td></tr>}
              {flujo.map((m, i) => (
                <tr key={i} className="border-b border-[#f0e6e0]">
                  <td className="p-2 whitespace-nowrap">{fmtDate(m.fecha)}</td>
                  <td className="p-2">{m.descripcion}</td>
                  <td className="p-2 text-right tabular-nums text-[#166534]">{m.ingreso ? fmtL(m.ingreso) : "—"}</td>
                  <td className="p-2 text-right tabular-nums text-[#be185d]">{m.egreso ? fmtL(m.egreso) : "—"}</td>
                  <td className="p-2 text-right tabular-nums font-semibold">{fmtL(m.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
