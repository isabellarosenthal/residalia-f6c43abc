import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Building, LogOut, Plus, ListChecks, Wallet, Megaphone, CalendarPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { InstallAppButton } from "@/components/portal/InstallAppButton";
import { PortalResidenciaProvider, useResidenciaActiva } from "@/lib/portal-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/portal")({ component: PortalLayout });

function PortalLayout() {
  const { user, loading, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { as: "residente" } });
      return;
    }
    if (role && role !== "residente" && role !== "super_admin") {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, role, navigate]);

  if (loading || !user || (role && role !== "residente" && role !== "super_admin")) {
    return <div className="min-h-screen flex items-center justify-center bg-[#ffffff]"><div className="text-[#64748B] text-sm">Cargando…</div></div>;
  }

  const linkBase = "flex flex-col items-center gap-0.5 text-[11px] py-1.5 px-2 rounded-lg flex-1 text-[#64748B]";
  const active = { className: linkBase + " text-[#4A154B] bg-[#fde8e2]" };

  return (
    <PortalResidenciaProvider>
      <div className="min-h-screen bg-[#ffffff] pb-20">
        <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <Link to="/portal" className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#4A154B] flex items-center justify-center shrink-0"><Building className="w-5 h-5 text-white" /></div>
              <div className="font-display font-extrabold text-lg truncate"><span className="text-[#4A154B]">Portal</span><span className="text-[#4A154B]"> residente</span></div>
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <InstallAppButton />
              <button onClick={() => signOut()} className="text-[#64748B] hover:text-[#4A154B] p-1.5" aria-label="Salir"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-4 pb-2 flex items-center justify-between gap-2">
            <div className="text-xs text-[#64748B] truncate">{profile?.full_name ?? user.email}</div>
            <EdificioSwitcher />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6"><Outlet /></main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-10">
          <div className="max-w-3xl mx-auto px-2 py-1.5 flex gap-1">
            <Link to="/portal" activeOptions={{ exact: true }} activeProps={active} className={linkBase}><ListChecks className="w-5 h-5" />Pases</Link>
            <Link to="/portal/nuevo" activeProps={active} className={linkBase}><Plus className="w-5 h-5" />Crear</Link>
            <Link to="/portal/cuenta" activeProps={active} className={linkBase}><Wallet className="w-5 h-5" />Cuenta</Link>
            <Link to="/portal/reservar" activeProps={active} className={linkBase}><CalendarPlus className="w-5 h-5" />Reservar</Link>
            <Link to="/portal/anuncios" activeProps={active} className={linkBase}><Megaphone className="w-5 h-5" />Anuncios</Link>
          </div>
        </nav>
      </div>
    </PortalResidenciaProvider>
  );
}

function EdificioSwitcher() {
  const { residencias, activaId, setActivaId } = useResidenciaActiva();
  if (residencias.length <= 1) return null;
  return (
    <Select value={activaId ?? undefined} onValueChange={setActivaId}>
      <SelectTrigger className="h-7 text-xs w-auto min-w-[160px] border-[#E2E8F0]">
        <SelectValue placeholder="Edificio" />
      </SelectTrigger>
      <SelectContent>
        {residencias.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {r.condominio?.nombre ?? "—"}{r.unidad ? ` · #${r.unidad.numero}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
