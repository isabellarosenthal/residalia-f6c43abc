import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldCheck, LogOut, ListChecks, ScanLine } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/guardia")({ component: GuardiaLayout });

function GuardiaLayout() {
  const { user, loading, role, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1a0f08]"><div className="text-[#EBC988] text-sm">Cargando…</div></div>;
  }

  const allowed = role === "guardia" || role === "admin_condominio" || role === "super_admin";
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ffffff] px-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 max-w-md text-center">
          <ShieldCheck className="w-10 h-10 mx-auto text-[#4F46E5] mb-2" />
          <div className="font-semibold text-[#4F46E5] mb-1">Acceso restringido</div>
          <p className="text-sm text-[#64748B]">Esta vista es solo para personal de seguridad.</p>
          <Link to="/" className="text-sm text-[#4F46E5] hover:underline mt-3 inline-block">Ir al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0f08] text-white">
      <header className="bg-[#4F46E5] border-b border-[#4338CA] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/guardia" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#4F46E5] flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-white" /></div>
            <div className="font-display font-extrabold text-lg">Vigilancia</div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#EBC988] hidden sm:inline">{profile?.full_name ?? user.email}</span>
            <button onClick={() => signOut()} className="text-sm text-[#EBC988] hover:text-white inline-flex items-center gap-1"><LogOut className="w-4 h-4" />Salir</button>
          </div>
        </div>
        <nav className="max-w-3xl mx-auto px-4 pb-2 flex gap-4 text-sm">
          <Link to="/guardia" activeOptions={{ exact: true }} activeProps={{ className: "text-white font-semibold" }} className="text-[#EBC988] hover:text-white inline-flex items-center gap-1"><ScanLine className="w-4 h-4" />Validar</Link>
          <Link to="/guardia/pases" activeProps={{ className: "text-white font-semibold" }} className="text-[#EBC988] hover:text-white inline-flex items-center gap-1"><ListChecks className="w-4 h-4" />Pases del día</Link>
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6"><Outlet /></main>
    </div>
  );
}
