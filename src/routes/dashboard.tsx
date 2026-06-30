import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, KpiCard, Badge } from "@/components/ui-pentos";
import { useAuth } from "@/lib/auth-context";
import { Wallet, AlertTriangle, KeyRound, Wrench, Tag, UserPlus, TrendingUp, CheckCircle2, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fmtL } from "@/lib/format";
import { OnboardingWizard, useShouldShowOnboarding } from "@/components/onboarding/OnboardingWizard";
import { useEdificios, useUnidades, useCobros, usePagosDeEdificio, useAccesos, useIncidencias, useProspectos } from "@/lib/queries";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { profile } = useAuth();
  const hour = new Date().getHours();
  const saludo = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "Bienvenido";
  const shouldShow = useShouldShowOnboarding();
  const [wizardOpen, setWizardOpen] = useState(false);
  useEffect(() => { if (shouldShow) setWizardOpen(true); }, [shouldShow]);

  const [edificioId, setEdificioId] = useEdificioFilter("all");
  const edificioFilter = edificioId === "all" ? undefined : edificioId;

  const { data: edificios = [] } = useEdificios();
  const { data: unidades = [] } = useUnidades(edificioFilter);
  const { data: cobros = [] } = useCobros(edificioFilter);
  const { data: pagos = [] } = usePagosDeEdificio(edificioFilter);
  const { data: accesos = [] } = useAccesos(edificioFilter);
  const { data: incidencias = [] } = useIncidencias(edificioFilter);
  const { data: prospectos = [] } = useProspectos(edificioFilter);

  const now = new Date();
  const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = ym(now);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // KPIs Administración
  const recaudacionMes = pagos
    .filter((p) => p.fecha && ym(new Date(p.fecha)) === thisMonth)
    .reduce((s, p) => s + Number(p.monto ?? 0), 0);

  const metaMes = unidades.reduce((s, u) => s + Number(u.mantenimiento_mensual ?? 0), 0);

  const morososUnidades = new Set(
    cobros.filter((c) => c.estado === "vencido" || c.estado === "parcial").map((c) => c.unidad_id),
  );
  const morososMonto = cobros
    .filter((c) => c.estado === "vencido" || c.estado === "parcial")
    .reduce((s, c) => s + (Number(c.monto ?? 0) - 0), 0);

  const accesosHoy = accesos.filter((a) => new Date(a.created_at).getTime() >= startOfDay);
  const entradas = accesosHoy.filter((a) => a.fecha_entrada).length;
  const salidas = accesosHoy.filter((a) => a.fecha_salida).length;

  const incidenciasAbiertas = incidencias.filter((i) => i.estado !== "resuelto" && i.estado !== "cerrado");
  const urgentes = incidenciasAbiertas.filter((i) => i.prioridad === "urgente").length;

  // KPIs Comercial
  const enVenta = unidades.filter((u) => u.estado_comercial === "en_venta" || u.estado_comercial === "en_venta_y_renta").length;
  const enRenta = unidades.filter((u) => u.estado_comercial === "en_renta" || u.estado_comercial === "en_venta_y_renta").length;
  const prospectosActivos = prospectos.filter((p) => p.etapa_pipeline !== "ganado" && p.etapa_pipeline !== "perdido");
  const calientes = prospectosActivos.filter((p) => p.temperatura === "caliente").length;
  const ganadosMes = prospectos.filter((p) => p.etapa_pipeline === "ganado");
  const valorPipeline = prospectosActivos.reduce((s, p) => s + Number(p.presupuesto_max ?? p.presupuesto_min ?? 0), 0);

  // Recaudación 6 meses
  const recaudacion = useMemo(() => {
    const months: { mes: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ mes: d.toLocaleString("es", { month: "short" }), key: ym(d) });
    }
    return months.map((m) => ({
      mes: m.mes.charAt(0).toUpperCase() + m.mes.slice(1, 3),
      monto: pagos.filter((p) => p.fecha && ym(new Date(p.fecha)) === m.key).reduce((s, p) => s + Number(p.monto ?? 0), 0),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagos]);

  // Estado pagos
  const estadoPagos = [
    { name: "Al día", value: cobros.filter((c) => c.estado === "pagado").length, color: "#166534" },
    { name: "Pendientes", value: cobros.filter((c) => c.estado === "pendiente").length, color: "#4A154B" },
    { name: "Morosos", value: cobros.filter((c) => c.estado === "vencido").length, color: "#be185d" },
    { name: "Parcial", value: cobros.filter((c) => c.estado === "parcial").length, color: "#4A154B" },
  ].filter((e) => e.value > 0);

  // Tabla por edificio
  const tabla = edificios.map((e) => {
    const us = unidades.filter((u) => u.condominio_id === e.id);
    const ps = prospectos.filter((p) => p.condominio_id === e.id);
    return {
      e: e.nombre,
      t: us.length,
      o: us.filter((u) => u.estado_administrativo === "ocupada").length,
      v: us.filter((u) => u.estado_comercial === "en_venta" || u.estado_comercial === "en_venta_y_renta").length,
      r: us.filter((u) => u.estado_comercial === "en_renta" || u.estado_comercial === "en_venta_y_renta").length,
      p: ps.filter((p) => p.etapa_pipeline !== "ganado" && p.etapa_pipeline !== "perdido").length,
      c: ps.filter((p) => p.etapa_pipeline === "ganado").length,
    };
  });

  return (
    <AppShell>
      <OnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#0F172A]">{saludo}, {firstName} 👋</h1>
            <p className="text-sm text-[#64748B]">Resumen de tu operación de hoy</p>
          </div>
          {edificios.length > 1 && (
            <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-full p-1">
              <button
                onClick={() => setEdificioId("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${edificioId === "all" ? "bg-[#4A154B] text-white" : "text-[#1E293B] hover:bg-[#F8FAFC]"}`}
              >
                Todos
              </button>
              {edificios.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEdificioId(e.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${edificioId === e.id ? "bg-[#4A154B] text-white" : "text-[#1E293B] hover:bg-[#F8FAFC]"}`}
                >
                  {e.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        {edificios.length === 0 ? (
          <Card className="p-10 text-center">
            <Building2 className="w-12 h-12 text-[#4A154B] mx-auto mb-3" />
            <h3 className="font-display font-bold text-[#0F172A] text-lg">Aún no tenés edificios</h3>
            <p className="text-sm text-[#64748B] mt-1 mb-4">Creá tu primer edificio para ver el resumen aquí.</p>
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A154B] text-white text-sm font-semibold hover:opacity-90 transition"
            >
              <Building2 className="w-4 h-4" /> Crear mi primer edificio
            </button>
          </Card>
        ) : (
          <>
            <section>
              <h2 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold mb-3">Administración</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<Wallet className="w-5 h-5" />} label="Recaudación del mes" value={fmtL(recaudacionMes)} sub={metaMes > 0 ? `${fmtL(recaudacionMes)} de ${fmtL(metaMes)} meta` : "Sin meta configurada"} accent="primary" />
                <KpiCard icon={<AlertTriangle className="w-5 h-5" />} label="Unidades morosas" value={String(morososUnidades.size)} sub={`${fmtL(morososMonto)} pendiente`} accent="danger" />
                <KpiCard icon={<KeyRound className="w-5 h-5" />} label="Accesos hoy" value={String(accesosHoy.length)} sub={`${entradas} entradas · ${salidas} salidas`} accent="neutral" />
                <KpiCard icon={<Wrench className="w-5 h-5" />} label="Incidencias abiertas" value={String(incidenciasAbiertas.length)} sub={urgentes > 0 ? `${urgentes} urgentes` : "Sin urgentes"} accent="primary" />
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold mb-3">Comercial</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<Tag className="w-5 h-5" />} label="Unidades en venta/renta" value={String(enVenta + enRenta)} sub={`${enVenta} venta · ${enRenta} renta`} accent="primary" />
                <KpiCard icon={<UserPlus className="w-5 h-5" />} label="Prospectos activos" value={String(prospectosActivos.length)} sub={`${calientes} calientes`} accent="neutral" />
                <KpiCard icon={<TrendingUp className="w-5 h-5" />} label="Valor del pipeline" value={fmtL(valorPipeline)} accent="success" />
                <KpiCard icon={<CheckCircle2 className="w-5 h-5" />} label="Cierres ganados" value={String(ganadosMes.length)} accent="success" />
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5">
                <h3 className="font-display font-bold text-[#0F172A] mb-1">Recaudación (últimos 6 meses)</h3>
                <p className="text-xs text-[#64748B] mb-4">Pagos registrados por mes</p>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={recaudacion}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="mes" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `L${v / 1000}k`} />
                      <Tooltip contentStyle={{ background: "#4A154B", border: "none", borderRadius: 12, color: "#F1F5F9" }} formatter={(v: any) => fmtL(v as number)} />
                      <Bar dataKey="monto" fill="#4A154B" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-display font-bold text-[#0F172A] mb-1">Estado de cobros</h3>
                <p className="text-xs text-[#64748B] mb-4">Distribución actual</p>
                {estadoPagos.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-[#64748B]">Sin cobros registrados</div>
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={estadoPagos} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                            {estadoPagos.map((e) => <Cell key={e.name} fill={e.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#4A154B", border: "none", borderRadius: 12, color: "#F1F5F9" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {estadoPagos.map((e) => (
                        <div key={e.name} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full" style={{ background: e.color }} />
                          <span className="text-[#1E293B]">{e.name}: <b>{e.value}</b></span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>

            {tabla.length > 0 && (
              <Card className="overflow-hidden">
                <div className="p-5 border-b border-[#E2E8F0]">
                  <h3 className="font-display font-bold text-[#0F172A]">Disponibilidad comercial de tus edificios</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F8FAFC] text-[#4A154B]">
                      <tr>
                        {["Edificio", "Total", "Ocupadas", "En venta", "En renta", "Prospectos", "Cierres"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 font-semibold uppercase text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-[#1E293B]">
                      {tabla.map((r) => (
                        <tr key={r.e} className="border-b border-[#E2E8F0] hover:bg-[#ffffff] transition-colors">
                          <td className="px-5 py-3 font-medium text-[#4A154B]">{r.e}</td>
                          <td className="px-5 py-3">{r.t}</td>
                          <td className="px-5 py-3">{r.o}</td>
                          <td className="px-5 py-3"><Badge variant="venta">{r.v}</Badge></td>
                          <td className="px-5 py-3"><Badge variant="renta">{r.r}</Badge></td>
                          <td className="px-5 py-3">{r.p}</td>
                          <td className="px-5 py-3 text-[#166534] font-semibold">{r.c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
