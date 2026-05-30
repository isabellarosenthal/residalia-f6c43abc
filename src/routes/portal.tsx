import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Building, LogOut, Plus, ListChecks, Wallet, Megaphone, CalendarPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { InstallAppButton } from "@/components/portal/InstallAppButton";

export const Route = createFileRoute("/portal")({ component: PortalLayout });

function PortalLayout() {
  const { user, loading, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]"><div className="text-[#9a7060] text-sm">Cargando…</div></div>;
  }

  const linkBase = "flex flex-col items-center gap-0.5 text-[11px] py-1.5 px-2 rounded-lg flex-1 text-[#9a7060]";
  const active = { className: linkBase + " text-[#c94f0c] bg-[#fde8e2]" };

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-20">
      <header className="bg-white border-b border-[#e8ddd8] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/portal" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#c94f0c] flex items-center justify-center"><Building className="w-5 h-5 text-white" /></div>
            <div className="font-display font-extrabold text-lg"><span className="text-[#2d1200]">Portal</span><span className="text-[#c94f0c]"> residente</span></div>
          </Link>
          <div className="flex items-center gap-2">
            <InstallAppButton />
            <button onClick={() => signOut()} className="text-[#9a7060] hover:text-[#c94f0c] p-1.5" aria-label="Salir"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-2 text-xs text-[#9a7060] truncate">{profile?.full_name ?? user.email}</div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6"><Outlet /></main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8ddd8] z-10">
        <div className="max-w-3xl mx-auto px-2 py-1.5 flex gap-1">
          <Link to="/portal" activeOptions={{ exact: true }} activeProps={active} className={linkBase}><ListChecks className="w-5 h-5" />Pases</Link>
          <Link to="/portal/nuevo" activeProps={active} className={linkBase}><Plus className="w-5 h-5" />Crear</Link>
          <Link to="/portal/cuenta" activeProps={active} className={linkBase}><Wallet className="w-5 h-5" />Cuenta</Link>
          <Link to="/portal/reservar" activeProps={active} className={linkBase}><CalendarPlus className="w-5 h-5" />Reservar</Link>
          <Link to="/portal/anuncios" activeProps={active} className={linkBase}><Megaphone className="w-5 h-5" />Anuncios</Link>
        </div>
      </nav>
    </div>
  );
}
