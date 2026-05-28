import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Building, LogOut, Plus, ListChecks } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="bg-white border-b border-[#e8ddd8] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/portal" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#c94f0c] flex items-center justify-center"><Building className="w-5 h-5 text-white" /></div>
            <div className="font-display font-extrabold text-lg"><span className="text-[#2d1200]">Portal</span><span className="text-[#c94f0c]"> residente</span></div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#9a7060] hidden sm:inline">{profile?.full_name ?? user.email}</span>
            <button onClick={() => signOut()} className="text-sm text-[#9a7060] hover:text-[#c94f0c] inline-flex items-center gap-1"><LogOut className="w-4 h-4" />Salir</button>
          </div>
        </div>
        <nav className="max-w-3xl mx-auto px-4 pb-2 flex gap-4 text-sm">
          <Link to="/portal" activeOptions={{ exact: true }} activeProps={{ className: "text-[#c94f0c] font-semibold" }} className="text-[#9a7060] hover:text-[#c94f0c] inline-flex items-center gap-1"><ListChecks className="w-4 h-4" />Mis pases</Link>
          <Link to="/portal/nuevo" activeProps={{ className: "text-[#c94f0c] font-semibold" }} className="text-[#9a7060] hover:text-[#c94f0c] inline-flex items-center gap-1"><Plus className="w-4 h-4" />Crear pase</Link>
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6"><Outlet /></main>
    </div>
  );
}
