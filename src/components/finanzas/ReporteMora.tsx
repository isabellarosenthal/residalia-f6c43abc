import { useMemo, useState } from "react";
import { Card } from "@/components/ui-pentos";
import { Button } from "@/components/ui/button";
import { Download, Percent } from "lucide-react";
import { fmtL } from "@/lib/format";
import { useCobros, useResidentes, useUnidades, usePagosDeEdificio, useCondonarMora, diasMora } from "@/lib/queries";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function toCSV(rows: (string | number)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}
function downloadCSV(name: string, rows: (string | number)[][]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export function ReporteMora({ edificioId }: { edificioId: string }) {
  const filter = edificioId === "all" ? undefined : edificioId;
  const { data: cobros = [] } = useCobros(filter);
  const { data: residentes = [] } = useResidentes();
  const { data: unidades = [] } = useUnidades(filter);
  const { data: pagos = [] } = usePagosDeEdificio(filter);
  const condonar = useCondonarMora();

  const resMap = useMemo(() => new Map(residentes.map((r) => [r.id, `${r.nombre} ${r.apellido ?? ""}`.trim()])), [residentes]);
  const uniMap = useMemo(() => new Map(unidades.map((u) => [u.id, u])), [unidades]);
  const abonadoMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pagos) m.set(p.cobro_id, (m.get(p.cobro_id) ?? 0) + Number(p.monto));
    return m;
  }, [pagos]);

  const meses = useMemo(() => {
    const set = new Set(cobros.map((c) => c.fecha_vencimiento.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [cobros]);

  const now = new Date();
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [mes, setMes] = useState(mesActual);

  const mesEfectivo = meses.includes(mes) ? mes : (meses[0] ?? mesActual);

  const labelMes = (m: string) => {
    const [y, mm] = m.split("-").map(Number);
    return `${MESES[mm - 1] ?? m} ${y}`;
  };

  const rows = useMemo(() => {
    return cobros
      .filter((c) => c.fecha_vencimiento.slice(0, 7) === mesEfectivo && c.estado !== "pagado")
      .map((c) => {
        const abonado = abonadoMap.get(c.id) ?? 0;
        const mora = Number((c as any).mora_aplicada ?? 0);
        const saldo = Math.max(0, Number(c.monto) + mora - abonado);
        const u = c.unidad_id ? uniMap.get(c.unidad_id) : null;
        return {
          cobro: c,
          unidad: u ? `#${u.numero}` : "—",
          residente: c.residente_id ? (resMap.get(c.residente_id) ?? "—") : "—",
          saldo,
          mora,
          dias: diasMora(c.fecha_vencimiento, c.estado),
        };
      })
      .sort((a, b) => b.saldo - a.saldo);
  }, [cobros, mesEfectivo, abonadoMap, uniMap, resMap]);

  const totalSaldo = rows.reduce((a, r) => a + r.saldo, 0);
  const totalMora = rows.reduce((a, r) => a + r.mora, 0);

  const exportCSV = () => {
    const data: (string | number)[][] = [["Unidad", "Residente", "Concepto", "Monto", "Abonado", "Saldo", "Mora aplicada", "Días vencido"]];
    rows.forEach((r) => data.push([r.unidad, r.residente, r.cobro.concepto, Number(r.cobro.monto), abonadoMap.get(r.cobro.id) ?? 0, r.saldo, r.mora, r.dias > 0 ? r.dias : 0]));
    downloadCSV(`mora-${mesEfectivo}.csv`, data);
  };

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div className="space-y-1.5">
            <label className="text-xs text-[#64748B]">Mes</label>
            <div className="flex flex-wrap gap-2">
              {(meses.length === 0 ? [mesActual] : meses).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMes(m)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition capitalize ${
                    mesEfectivo === m ? "bg-[#4A154B] text-white border-[#4A154B]" : "bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {labelMes(m)}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-xs text-[#64748B]">Total adeudado en {labelMes(mesEfectivo)}</div>
          <div className="font-display font-extrabold text-2xl text-[#be185d]">{fmtL(totalSaldo)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-[#64748B]">Mora aplicada total</div>
          <div className="font-display font-extrabold text-2xl text-[#f59e0b]">{fmtL(totalMora)}</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#0F172A]">{rows.length} cobro{rows.length === 1 ? "" : "s"} con saldo en {labelMes(mesEfectivo)}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-[#64748B]">
              <tr>
                <th className="text-left p-2">Unidad</th>
                <th className="text-left p-2">Residente</th>
                <th className="text-left p-2">Concepto</th>
                <th className="text-right p-2">Saldo</th>
                <th className="text-right p-2">Mora</th>
                <th className="text-right p-2">Días</th>
                <th className="text-right p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={7} className="text-center text-[#64748B] py-8">Sin saldos pendientes en {labelMes(mesEfectivo)} 🎉</td></tr>}
              {rows.map((r) => (
                <tr key={r.cobro.id} className="border-b border-[#f0e6e0]">
                  <td className="p-2 font-medium">{r.unidad}</td>
                  <td className="p-2">{r.residente}</td>
                  <td className="p-2 text-[#64748B]">{r.cobro.concepto}</td>
                  <td className="p-2 text-right tabular-nums font-semibold text-[#be185d]">{fmtL(r.saldo)}</td>
                  <td className="p-2 text-right tabular-nums text-[#f59e0b]">{r.mora > 0 ? fmtL(r.mora) : "—"}</td>
                  <td className="p-2 text-right tabular-nums">{r.dias > 0 ? r.dias : 0}</td>
                  <td className="p-2 text-right">
                    {r.mora > 0 && (
                      <Button
                        size="sm" variant="ghost" className="h-8 px-2 text-[#166534]" title="Condonar mora"
                        disabled={condonar.isPending}
                        onClick={() => { if (confirm(`¿Condonar ${fmtL(r.mora)} de mora a ${r.residente}?`)) condonar.mutate(r.cobro.id); }}
                      >
                        <Percent className="w-4 h-4 mr-1" />Condonar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
