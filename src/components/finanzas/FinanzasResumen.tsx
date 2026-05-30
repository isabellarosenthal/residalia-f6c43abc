import { useMemo } from "react";
import { Card, KpiCard } from "@/components/ui-pentos";
import { Wallet, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fmtL } from "@/lib/format";
import { useCobros, useEgresos } from "@/lib/queries";

export function FinanzasResumen({ edificioId }: { edificioId: string }) {
  const filter = edificioId === "all" ? undefined : edificioId;
  const { data: cobros = [] } = useCobros(filter);
  const { data: egresos = [] } = useEgresos(filter);

  const now = new Date();
  const mesActual = now.getMonth();
  const anioActual = now.getFullYear();

  const stats = useMemo(() => {
    const ingresosMes = cobros
      .filter((c) => c.estado === "pagado" && c.fecha_pago && new Date(c.fecha_pago).getMonth() === mesActual && new Date(c.fecha_pago).getFullYear() === anioActual)
      .reduce((a, c) => a + Number(c.monto), 0);
    const egresosMes = egresos
      .filter((e) => new Date(e.fecha).getMonth() === mesActual && new Date(e.fecha).getFullYear() === anioActual)
      .reduce((a, e) => a + Number(e.monto), 0);
    const pendientes = cobros.filter((c) => c.estado === "pendiente" || c.estado === "vencido" || c.estado === "parcial");
    const totalPendiente = pendientes.reduce((a, c) => a + Number(c.monto), 0);
    const vencidos = cobros.filter((c) => c.estado === "vencido" || (c.estado === "pendiente" && new Date(c.fecha_vencimiento) < now));
    const totalVencido = vencidos.reduce((a, c) => a + Number(c.monto), 0);
    const morosidad = cobros.length > 0 ? Math.round((vencidos.length / cobros.length) * 100) : 0;
    return { ingresosMes, egresosMes, saldo: ingresosMes - egresosMes, pendientes: pendientes.length, totalPendiente, totalVencido, morosidad };
  }, [cobros, egresos, mesActual, anioActual, now]);

  const chartData = useMemo(() => {
    const months: { key: string; label: string; ingresos: number; egresos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anioActual, mesActual - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("es-HN", { month: "short" }), ingresos: 0, egresos: 0 });
    }
    const idx = new Map(months.map((m, i) => [m.key, i]));
    cobros.filter((c) => c.estado === "pagado" && c.fecha_pago).forEach((c) => {
      const d = new Date(c.fecha_pago!);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const i = idx.get(k); if (i != null) months[i].ingresos += Number(c.monto);
    });
    egresos.forEach((e) => {
      const d = new Date(e.fecha);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const i = idx.get(k); if (i != null) months[i].egresos += Number(e.monto);
    });
    return months;
  }, [cobros, egresos, mesActual, anioActual]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<TrendingUp className="w-5 h-5" />} label="Ingresos del mes" value={fmtL(stats.ingresosMes)} accent="success" />
        <KpiCard icon={<TrendingDown className="w-5 h-5" />} label="Egresos del mes" value={fmtL(stats.egresosMes)} accent="danger" />
        <KpiCard icon={<Wallet className="w-5 h-5" />} label="Saldo neto" value={fmtL(stats.saldo)} accent={stats.saldo >= 0 ? "primary" : "danger"} />
        <KpiCard icon={<AlertTriangle className="w-5 h-5" />} label="Morosidad" value={`${stats.morosidad}%`} sub={`${fmtL(stats.totalVencido)} vencido · ${stats.pendientes} pendientes`} accent="danger" />
      </div>

      <Card className="p-5">
        <h3 className="font-display font-bold text-[#374151] mb-3">Ingresos vs Egresos · últimos 6 meses</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip formatter={(v: any) => fmtL(Number(v))} />
              <Legend />
              <Bar dataKey="ingresos" fill="#166534" name="Ingresos" radius={[6, 6, 0, 0]} />
              <Bar dataKey="egresos" fill="#be185d" name="Egresos" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
