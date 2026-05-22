import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, KpiCard, Badge } from "@/components/ui-pentos";
import { useAuth } from "@/lib/auth-context";
import { Wallet, AlertTriangle, KeyRound, Wrench, Tag, UserPlus, TrendingUp, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from "recharts";
import { fmtL } from "@/lib/format";
import { OnboardingWizard, useShouldShowOnboarding } from "@/components/onboarding/OnboardingWizard";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  return <Dashboard />;
}

const recaudacion = [
  { mes: "Dic", monto: 42000, meta: 60000 },
  { mes: "Ene", monto: 51000, meta: 60000 },
  { mes: "Feb", monto: 47500, meta: 60000 },
  { mes: "Mar", monto: 55000, meta: 60000 },
  { mes: "Abr", monto: 58000, meta: 60000 },
  { mes: "May", monto: 48500, meta: 60000 },
];
const estadoPagos = [
  { name: "Al día", value: 14, color: "#2d6a2d" },
  { name: "Morosos", value: 4, color: "#c0392b" },
  { name: "Parcial", value: 2, color: "#c94f0c" },
];

function Dashboard() {
  const { profile } = useAuth();
  const hour = new Date().getHours();
  const saludo = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "Bienvenido";
  const shouldShow = useShouldShowOnboarding();
  const [wizardOpen, setWizardOpen] = useState(false);
  useEffect(() => { if (shouldShow) setWizardOpen(true); }, [shouldShow]);

  return (
    <AppShell>
      <OnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">{saludo}, {firstName} 👋</h1>
            <p className="text-sm text-[#9a7060]">Resumen de tu operación de hoy</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#e8ddd8] rounded-full p-1">
            {["Este mes", "Mes anterior", "Este año"].map((p, i) => (
              <button key={p} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${i === 0 ? "bg-[#c94f0c] text-white" : "text-[#4a2800] hover:bg-[#f5ede8]"}`}>{p}</button>
            ))}
          </div>
        </div>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#9a7060] font-semibold mb-3">Administración</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={<Wallet className="w-5 h-5" />} label="Recaudación del mes" value={fmtL(48500)} sub="L 48,500 de L 60,000 meta" accent="primary" />
            <KpiCard icon={<AlertTriangle className="w-5 h-5" />} label="Unidades morosas" value="4" sub="L 18,200 pendiente" accent="danger" />
            <KpiCard icon={<KeyRound className="w-5 h-5" />} label="Accesos hoy" value="32" sub="18 entradas · 14 salidas" accent="neutral" />
            <KpiCard icon={<Wrench className="w-5 h-5" />} label="Incidencias abiertas" value="6" sub="2 urgentes" accent="primary" />
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#9a7060] font-semibold mb-3">Comercial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={<Tag className="w-5 h-5" />} label="Unidades en venta/renta" value="5" sub="3 venta · 2 renta" accent="primary" />
            <KpiCard icon={<UserPlus className="w-5 h-5" />} label="Prospectos activos" value="8" sub="3 calientes" accent="neutral" />
            <KpiCard icon={<TrendingUp className="w-5 h-5" />} label="Valor del pipeline" value={fmtL(12400000)} accent="success" />
            <KpiCard icon={<CheckCircle2 className="w-5 h-5" />} label="Cierres este mes" value="2" sub={fmtL(4200000)} accent="success" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-display font-bold text-[#2d1200] mb-1">Recaudación (últimos 6 meses)</h3>
            <p className="text-xs text-[#9a7060] mb-4">Comparado con la meta mensual</p>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={recaudacion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd8" />
                  <XAxis dataKey="mes" stroke="#9a7060" fontSize={12} />
                  <YAxis stroke="#9a7060" fontSize={12} tickFormatter={(v) => `L${v / 1000}k`} />
                  <Tooltip contentStyle={{ background: "#2d1200", border: "none", borderRadius: 12, color: "#f5e6de" }} formatter={(v: any) => fmtL(v as number)} />
                  <ReferenceLine y={60000} stroke="#2d1200" strokeDasharray="4 4" />
                  <Bar dataKey="monto" fill="#c94f0c" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-bold text-[#2d1200] mb-1">Estado de pagos</h3>
            <p className="text-xs text-[#9a7060] mb-4">Distribución del mes actual</p>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={estadoPagos} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {estadoPagos.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#2d1200", border: "none", borderRadius: 12, color: "#f5e6de" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {estadoPagos.map((e) => (
                <div key={e.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ background: e.color }} />
                  <span className="text-[#4a2800]">{e.name}: <b>{e.value}</b></span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="p-5 border-b border-[#e8ddd8]">
            <h3 className="font-display font-bold text-[#2d1200]">Disponibilidad comercial de tus edificios</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f5ede8] text-[#2d1200]">
                <tr>
                  {["Edificio", "Total", "Ocupadas", "En venta", "En renta", "Prospectos", "Cierres mes"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold uppercase text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[#4a2800]">
                {[
                  { e: "Torres del Valle", t: 24, o: 18, v: 3, r: 2, p: 6, c: 1 },
                  { e: "Residencial La Ceiba", t: 18, o: 14, v: 2, r: 1, p: 2, c: 1 },
                ].map((r) => (
                  <tr key={r.e} className="border-b border-[#e8ddd8] hover:bg-[#faf9f7] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#2d1200]">{r.e}</td>
                    <td className="px-5 py-3">{r.t}</td>
                    <td className="px-5 py-3">{r.o}</td>
                    <td className="px-5 py-3"><Badge variant="venta">{r.v}</Badge></td>
                    <td className="px-5 py-3"><Badge variant="renta">{r.r}</Badge></td>
                    <td className="px-5 py-3">{r.p}</td>
                    <td className="px-5 py-3 text-[#2d6a2d] font-semibold">{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
