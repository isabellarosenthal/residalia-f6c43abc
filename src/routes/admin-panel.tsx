import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, Home, DollarSign, TrendingUp, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getPlatformStats } from "@/lib/admin-stats.functions";

export const Route = createFileRoute("/admin-panel")({
  head: () => ({ meta: [{ title: "Admin Panel — PropCloud" }] }),
  component: AdminPanel,
});

function AdminPanel() {
  const { role, loading, user } = useAuth();
  const navigate = useNavigate();
  const fetchStats = useServerFn(getPlatformStats);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (role && role !== "super_admin") navigate({ to: "/" });
  }, [loading, user, role, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => fetchStats(),
    enabled: role === "super_admin",
  });

  if (loading || role !== "super_admin") {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a14]"><div className="text-white/60">Verificando acceso…</div></div>;
  }

  const fmt = (n: number) => new Intl.NumberFormat("es-HN").format(n);
  const money = (n: number) => `L ${new Intl.NumberFormat("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#141425] to-[#0a0a14] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c94f0c] to-[#7a2e0a] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/50">Super Admin</div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </div>
          <button onClick={() => navigate({ to: "/" })} className="flex items-center gap-2 text-sm text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" /> Volver al sistema
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {isLoading && <div className="text-white/60">Cargando estadísticas…</div>}
        {error && <div className="text-red-400">Error: {(error as Error).message}</div>}
        {data && (
          <>
            {/* Totales */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Building2 className="w-5 h-5" />} label="Edificios / Condominios" value={fmt(data.totales.condominios)} sub={`${data.totales.condominios_activos} activos`} />
              <StatCard icon={<Home className="w-5 h-5" />} label="Unidades" value={fmt(data.totales.unidades)} />
              <StatCard icon={<Users className="w-5 h-5" />} label="Residentes" value={fmt(data.totales.residentes)} sub={`${fmt(data.totales.usuarios)} usuarios totales`} />
              <StatCard icon={<DollarSign className="w-5 h-5" />} label="MRR estimado" value={money(data.totales.mrr)} sub={`${money(data.totales.ingresos_mes)} cobrado este mes`} accent />
            </section>

            {/* Distribución por plan */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#c94f0c]" /> Distribución por plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.distribucion_planes.map((p) => (
                  <div key={p.plan} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/60">{p.plan}</div>
                      <div className="text-xs text-white/40">{money(p.precio)}/mes</div>
                    </div>
                    <div className="text-3xl font-bold mt-2">{p.count}</div>
                    <div className="text-xs text-white/50 mt-1">suscripciones activas</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Signups 30 días */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Signups últimos 30 días</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <SignupsChart data={data.signups_30d} />
                <div className="text-xs text-white/50 mt-2">
                  Total: {fmt(data.signups_30d.reduce((a, d) => a + d.signups, 0))} nuevos usuarios
                </div>
              </div>
            </section>

            {/* Condominios recientes */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Empresas / Condominios recientes</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3">Nombre</th>
                      <th className="text-left px-4 py-3">Ciudad</th>
                      <th className="text-left px-4 py-3">Admin</th>
                      <th className="text-left px-4 py-3">Plan</th>
                      <th className="text-right px-4 py-3">Unidades</th>
                      <th className="text-right px-4 py-3">Residentes</th>
                      <th className="text-left px-4 py-3">Alta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.condominios_recientes.map((c) => (
                      <tr key={c.id} className="border-t border-white/5">
                        <td className="px-4 py-3 font-medium">{c.nombre}</td>
                        <td className="px-4 py-3 text-white/70">{c.ciudad ?? "—"}</td>
                        <td className="px-4 py-3 text-white/70">{c.admin}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#c94f0c]/20 text-[#ff9568]">{c.plan}</span>
                        </td>
                        <td className="px-4 py-3 text-right">{c.unidades}</td>
                        <td className="px-4 py-3 text-right">{c.residentes}</td>
                        <td className="px-4 py-3 text-white/50 text-xs">{new Date(c.created_at).toLocaleDateString("es-HN")}</td>
                      </tr>
                    ))}
                    {data.condominios_recientes.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-white/50">Sin condominios todavía</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? "bg-gradient-to-br from-[#c94f0c]/20 to-[#7a2e0a]/10 border-[#c94f0c]/30" : "bg-white/5 border-white/10"}`}>
      <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider">{icon}{label}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {sub && <div className="text-xs text-white/50 mt-1">{sub}</div>}
    </div>
  );
}

function SignupsChart({ data }: { data: { fecha: string; signups: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.signups));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.fecha} className="flex-1 group relative">
          <div
            className="bg-gradient-to-t from-[#c94f0c] to-[#ff9568] rounded-t hover:opacity-80 transition-opacity"
            style={{ height: `${(d.signups / max) * 100}%`, minHeight: d.signups > 0 ? "2px" : "0" }}
            title={`${d.fecha}: ${d.signups}`}
          />
        </div>
      ))}
    </div>
  );
}
