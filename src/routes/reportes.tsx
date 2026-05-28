import { useMemo, useState } from "react";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import { createFileRoute } from "@tanstack/react-router";
import { Download, TrendingUp, Users, Home, DollarSign, AlertCircle, Wallet } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, KpiCard } from "@/components/ui-pentos";
import {
  useEdificios, useUnidades, useCobros, useEgresos, useProspectos, useResidentes,
} from "@/lib/queries";

export const Route = createFileRoute("/reportes")({ component: ReportesPage });

const COLORS = ["#c94f0c", "#e8a87c", "#9b72cf", "#2d8a9e", "#2d6a2d", "#c0392b", "#3b82f6", "#ec4899"];
const fmtL = (n: number) => `L ${n.toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}
function downloadCSV(filename: string, rows: Record<string, any>[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function ReportesPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useEdificioFilter();
  const filterId = edificioId === "all" ? undefined : edificioId;

  const { data: unidades = [] } = useUnidades(filterId);
  const { data: cobros = [] } = useCobros(filterId);
  const { data: egresos = [] } = useEgresos(filterId);
  const { data: prospectos = [] } = useProspectos(filterId);
  const { data: residentes = [] } = useResidentes();

  const kpis = useMemo(() => {
    const ingresos = cobros.filter(c => c.estado === "pagado").reduce((s, c) => s + Number(c.monto), 0);
    const pendiente = cobros.filter(c => c.estado !== "pagado").reduce((s, c) => s + Number(c.monto), 0);
    const gastos = egresos.reduce((s, e) => s + Number(e.monto), 0);
    const ocupadas = unidades.filter(u => u.estado_administrativo === "ocupada").length;
    return {
      ingresos, pendiente, gastos, balance: ingresos - gastos,
      ocupacion: unidades.length ? Math.round((ocupadas / unidades.length) * 100) : 0,
      totalUnidades: unidades.length,
      residentes: residentes.length,
      prospectosActivos: prospectos.filter(p => !["ganado", "perdido"].includes(p.etapa_pipeline)).length,
    };
  }, [cobros, egresos, unidades, residentes, prospectos]);

  // Ingresos vs egresos por mes (últimos 6)
  const flujoMensual = useMemo(() => {
    const months: { key: string; label: string; ingresos: number; egresos: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: d.toLocaleDateString("es", { month: "short" }), ingresos: 0, egresos: 0 });
    }
    cobros.filter(c => c.estado === "pagado" && c.fecha_pago).forEach(c => {
      const key = c.fecha_pago!.slice(0, 7);
      const m = months.find(x => x.key === key);
      if (m) m.ingresos += Number(c.monto);
    });
    egresos.forEach(e => {
      const key = e.fecha.slice(0, 7);
      const m = months.find(x => x.key === key);
      if (m) m.egresos += Number(e.monto);
    });
    return months;
  }, [cobros, egresos]);

  const ocupacionPorEdificio = useMemo(() => {
    return edificios.map(ed => {
      const us = unidades.filter(u => u.condominio_id === ed.id);
      const ocup = us.filter(u => u.estado_administrativo === "ocupada").length;
      return { nombre: ed.nombre, ocupadas: ocup, disponibles: us.length - ocup };
    }).filter(x => x.ocupadas + x.disponibles > 0);
  }, [edificios, unidades]);

  const egresosPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    egresos.forEach(e => map.set(e.categoria, (map.get(e.categoria) ?? 0) + Number(e.monto)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [egresos]);

  const pipeline = useMemo(() => {
    const etapas = ["nuevo", "contactado", "calificado", "visita", "propuesta", "negociacion", "ganado", "perdido"];
    return etapas.map(e => ({ etapa: e, total: prospectos.filter(p => p.etapa_pipeline === e).length }));
  }, [prospectos]);

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Reportes</h1>
            <p className="text-sm text-[#9a7060]">Análisis financiero, ocupación y CRM</p>
          </div>
          <Select value={edificioId} onValueChange={setEdificioId}>
            <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los edificios</SelectItem>
              {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={<DollarSign className="w-4 h-4" />} label="Ingresos cobrados" value={fmtL(kpis.ingresos)} accent="success" />
          <KpiCard icon={<AlertCircle className="w-4 h-4" />} label="Pendiente de cobro" value={fmtL(kpis.pendiente)} accent="danger" />
          <KpiCard icon={<Wallet className="w-4 h-4" />} label="Egresos" value={fmtL(kpis.gastos)} accent="neutral" />
          <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Balance" value={fmtL(kpis.balance)} accent={kpis.balance >= 0 ? "success" : "danger"} />
          <KpiCard icon={<Home className="w-4 h-4" />} label="Ocupación" value={`${kpis.ocupacion}%`} sub={`${kpis.totalUnidades} unidades`} accent="primary" />
          <KpiCard icon={<Users className="w-4 h-4" />} label="Residentes" value={kpis.residentes} accent="neutral" />
          <KpiCard icon={<Users className="w-4 h-4" />} label="Prospectos activos" value={kpis.prospectosActivos} accent="primary" />
          <KpiCard icon={<Home className="w-4 h-4" />} label="Edificios" value={edificios.length} accent="neutral" />
        </div>

        <Tabs defaultValue="financiero">
          <TabsList className="bg-[#f5ede8]">
            <TabsTrigger value="financiero">Financiero</TabsTrigger>
            <TabsTrigger value="ocupacion">Ocupación</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="exportar">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="financiero" className="pt-4 space-y-4">
            <Card className="p-5">
              <h3 className="font-display font-bold text-lg text-[#2d1200] mb-4">Ingresos vs Egresos (6 meses)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={flujoMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e0" />
                  <XAxis dataKey="label" stroke="#9a7060" />
                  <YAxis stroke="#9a7060" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmtL(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" stroke="#2d6a2d" strokeWidth={2} name="Ingresos" />
                  <Line type="monotone" dataKey="egresos" stroke="#c0392b" strokeWidth={2} name="Egresos" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-display font-bold text-lg text-[#2d1200] mb-4">Egresos por categoría</h3>
              {egresosPorCategoria.length === 0 ? (
                <p className="text-sm text-[#9a7060]">Sin egresos registrados</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={egresosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {egresosPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtL(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="ocupacion" className="pt-4 space-y-4">
            <Card className="p-5">
              <h3 className="font-display font-bold text-lg text-[#2d1200] mb-4">Ocupación por edificio</h3>
              {ocupacionPorEdificio.length === 0 ? (
                <p className="text-sm text-[#9a7060]">Sin unidades registradas</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={ocupacionPorEdificio}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e0" />
                    <XAxis dataKey="nombre" stroke="#9a7060" />
                    <YAxis stroke="#9a7060" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ocupadas" stackId="a" fill="#2d6a2d" name="Ocupadas" />
                    <Bar dataKey="disponibles" stackId="a" fill="#e8a87c" name="Disponibles" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="crm" className="pt-4 space-y-4">
            <Card className="p-5">
              <h3 className="font-display font-bold text-lg text-[#2d1200] mb-4">Prospectos por etapa</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pipeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e0" />
                  <XAxis dataKey="etapa" stroke="#9a7060" />
                  <YAxis stroke="#9a7060" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#9b72cf" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="exportar" className="pt-4">
            <Card className="p-5 space-y-3">
              <h3 className="font-display font-bold text-lg text-[#2d1200]">Exportar a CSV</h3>
              <p className="text-sm text-[#9a7060]">Descarga los datos filtrados por edificio</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button variant="outline" onClick={() => downloadCSV("unidades.csv", unidades)}>
                  <Download className="w-4 h-4 mr-2" />Unidades ({unidades.length})
                </Button>
                <Button variant="outline" onClick={() => downloadCSV("cobros.csv", cobros)}>
                  <Download className="w-4 h-4 mr-2" />Cobros ({cobros.length})
                </Button>
                <Button variant="outline" onClick={() => downloadCSV("egresos.csv", egresos)}>
                  <Download className="w-4 h-4 mr-2" />Egresos ({egresos.length})
                </Button>
                <Button variant="outline" onClick={() => downloadCSV("residentes.csv", residentes)}>
                  <Download className="w-4 h-4 mr-2" />Residentes ({residentes.length})
                </Button>
                <Button variant="outline" onClick={() => downloadCSV("prospectos.csv", prospectos)}>
                  <Download className="w-4 h-4 mr-2" />Prospectos ({prospectos.length})
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
