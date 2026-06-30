import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Users, Home, DollarSign, TrendingUp, Shield, Ban, Play, Pause, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import {
  getPlatformStats,
  listSuscripciones,
  listPlanes,
  listUsuarios,
  updateSuscripcionPlan,
  updateSuscripcionEstado,
  toggleCondominioActivo,
} from "@/lib/admin-stats.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-panel")({
  head: () => ({ meta: [{ title: "Admin Panel — Altura Cloud" }] }),
  component: AdminPanel,
});

function AdminPanel() {
  const { role, loading, user } = useAuth();
  const navigate = useNavigate();
  const fetchStats = useServerFn(getPlatformStats);
  const fetchSubs = useServerFn(listSuscripciones);
  const fetchPlanes = useServerFn(listPlanes);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (role && role !== "super_admin") navigate({ to: "/dashboard" });
  }, [loading, user, role, navigate]);

  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => fetchStats(),
    enabled: role === "super_admin",
  });

  const { data: subsData } = useQuery({
    queryKey: ["admin-suscripciones"],
    queryFn: () => fetchSubs(),
    enabled: role === "super_admin",
  });

  const { data: planesData } = useQuery({
    queryKey: ["admin-planes"],
    queryFn: () => fetchPlanes(),
    enabled: role === "super_admin",
  });

  if (loading || role !== "super_admin") return null;

  const fmt = (n: number) => new Intl.NumberFormat("es-HN").format(n);
  const money = (n: number) => `L ${new Intl.NumberFormat("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Super Admin</div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
        </div>

        {stats && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard icon={<Building2 className="w-5 h-5" />} label="Edificios" value={fmt(stats.totales.condominios)} sub={`${stats.totales.condominios_activos} activos`} />
              <StatCard icon={<Home className="w-5 h-5" />} label="Unidades" value={fmt(stats.totales.unidades)} />
              <StatCard icon={<Users className="w-5 h-5" />} label="Residentes" value={fmt(stats.totales.residentes)} />
              <StatCard icon={<Users className="w-5 h-5" />} label="Usuarios" value={fmt(stats.totales.usuarios)} sub="cuentas registradas" />
              <StatCard icon={<DollarSign className="w-5 h-5" />} label="MRR estimado" value={money(stats.totales.mrr)} sub={`${money(stats.totales.ingresos_mes)} este mes`} accent />
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                <TrendingUp className="w-4 h-4 text-primary" /> Distribución por plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.distribucion_planes.map((p) => (
                  <div key={p.plan} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">{p.plan}</div>
                      <div className="text-xs text-muted-foreground">{money(p.precio)}/mes</div>
                    </div>
                    <div className="text-3xl font-bold mt-2 text-foreground">{p.count}</div>
                    <div className="text-xs text-muted-foreground mt-1">suscripciones activas</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3 text-foreground">Signups últimos 30 días</h2>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <SignupsChart data={stats.signups_30d} />
                <div className="text-xs text-muted-foreground mt-2">
                  Total: {fmt(stats.signups_30d.reduce((a, d) => a + d.signups, 0))} nuevos usuarios
                </div>
              </div>
            </section>
          </>
        )}

        {subsData && (
          <SuscripcionesSection rows={subsData.rows} planes={subsData.planes} />
        )}

        {planesData && <PlanesSection planes={planesData} />}
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border shadow-sm ${accent ? "bg-primary/5 border-primary/30" : "bg-card border-border"}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">{icon}{label}</div>
      <div className="text-2xl font-bold mt-2 text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function SignupsChart({ data }: { data: { fecha: string; signups: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.signups));
  const fmtLabel = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString("es-HN", { day: "numeric", month: "short" });
  };
  return (
    <div>
      <div className="flex items-end gap-1 h-32 border-b border-border">
        {data.map((d) => (
          <div key={d.fecha} className="flex-1 group relative flex flex-col justify-end h-full">
            <div
              className={`rounded-t transition-colors ${d.signups > 0 ? "bg-primary hover:bg-primary/80" : "bg-muted"}`}
              style={{ height: `${Math.max((d.signups / max) * 100, 4)}%` }}
              title={`${d.fecha}: ${d.signups} signup${d.signups === 1 ? "" : "s"}`}
            />
            {d.signups > 0 && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-primary">
                {d.signups}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span>{fmtLabel(data[0].fecha)}</span>
        <span>{fmtLabel(data[Math.floor(data.length / 2)].fecha)}</span>
        <span>{fmtLabel(data[data.length - 1].fecha)}</span>
      </div>
    </div>
  );
}

type SubRow = {
  condominio_id: string;
  nombre: string;
  ciudad: string | null;
  activo: boolean;
  created_at: string;
  admin_email: string;
  admin_nombre: string;
  plan_id: string | null;
  estado: string;
  unidades: number;
  residentes: number;
};
type Plan = { id: string; nombre: string; precio_mensual: number };

function SuscripcionesSection({ rows, planes }: { rows: SubRow[]; planes: Plan[] }) {
  const qc = useQueryClient();
  const updatePlanFn = useServerFn(updateSuscripcionPlan);
  const updateEstadoFn = useServerFn(updateSuscripcionEstado);
  const toggleActivoFn = useServerFn(toggleCondominioActivo);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-suscripciones"] });
    qc.invalidateQueries({ queryKey: ["platform-stats"] });
  };

  const mPlan = useMutation({
    mutationFn: (d: { condominio_id: string; plan_id: string }) => updatePlanFn({ data: d }),
    onSuccess: () => { toast.success("Plan actualizado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const mEstado = useMutation({
    mutationFn: (d: { condominio_id: string; estado: string }) => updateEstadoFn({ data: d }),
    onSuccess: () => { toast.success("Suscripción actualizada"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const mActivo = useMutation({
    mutationFn: (d: { condominio_id: string; activo: boolean }) => toggleActivoFn({ data: d }),
    onSuccess: () => { toast.success("Acceso actualizado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section>
      <h2 className="text-base font-semibold mb-3 text-foreground">Gestión de suscripciones</h2>
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Edificio</th>
                <th className="text-left px-4 py-3">Admin</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Suscripción</th>
                <th className="text-left px-4 py-3">Acceso</th>
                <th className="text-right px-4 py-3">Uds / Res</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.condominio_id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.nombre}</div>
                    <div className="text-xs text-muted-foreground">{r.ciudad ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{r.admin_nombre}</div>
                    <div className="text-xs text-muted-foreground">{r.admin_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.plan_id ?? ""}
                      onChange={(e) => mPlan.mutate({ condominio_id: r.condominio_id, plan_id: e.target.value })}
                      className="bg-background border border-border rounded-lg px-2 py-1 text-sm text-foreground"
                    >
                      <option value="" disabled>Sin plan</option>
                      {planes.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre} — L{p.precio_mensual}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={r.estado} />
                  </td>
                  <td className="px-4 py-3">
                    {r.activo
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Activo</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"><Ban className="w-3 h-3" /> Suspendido</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">{r.unidades} / {r.residentes}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {r.estado === "activa" ? (
                        <button onClick={() => mEstado.mutate({ condominio_id: r.condominio_id, estado: "pausada" })} title="Pausar" className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Pause className="w-4 h-4" /></button>
                      ) : (
                        <button onClick={() => mEstado.mutate({ condominio_id: r.condominio_id, estado: "activa" })} title="Activar" className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Play className="w-4 h-4" /></button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(r.activo ? `¿Revocar acceso a ${r.nombre}?` : `¿Restaurar acceso a ${r.nombre}?`)) {
                            mActivo.mutate({ condominio_id: r.condominio_id, activo: !r.activo });
                          }
                        }}
                        title={r.activo ? "Revocar acceso" : "Restaurar acceso"}
                        className={`p-1.5 rounded hover:bg-muted ${r.activo ? "text-red-600" : "text-green-600"}`}
                      >
                        {r.activo ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Sin edificios todavía</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    activa: "bg-green-50 text-green-700 border-green-200",
    pausada: "bg-amber-50 text-amber-700 border-amber-200",
    cancelada: "bg-red-50 text-red-700 border-red-200",
    sin_suscripcion: "bg-muted text-muted-foreground border-border",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[estado] ?? map.sin_suscripcion}`}>{estado}</span>;
}

type FullPlan = { id: string; nombre: string; precio_mensual: number; max_edificios: number | null; max_unidades: number | null; max_admins: number | null; activo: boolean };
function PlanesSection({ planes }: { planes: FullPlan[] }) {
  const money = (n: number) => `L ${new Intl.NumberFormat("es-HN").format(n)}`;
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Planes disponibles</h2>
        <span className="text-xs text-muted-foreground">Definidos en la landing page</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planes.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-foreground text-lg">{p.nombre}</div>
              {!p.activo && <span className="text-xs text-muted-foreground">inactivo</span>}
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">{money(p.precio_mensual)}</span>
              <span className="text-xs text-muted-foreground"> /mes</span>
            </div>
            <div className="text-xs text-muted-foreground mt-3 space-y-0.5">
              <div>Edificios: {p.max_edificios ?? "ilimitados"}</div>
              <div>Unidades por edificio: {p.max_unidades ?? "ilimitadas"}</div>
              <div>Admins: {p.max_admins ?? "ilimitados"}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
