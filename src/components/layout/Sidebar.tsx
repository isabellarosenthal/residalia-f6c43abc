import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";
import logoUrl from "@/assets/residalia-logo.png";
import { LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin",
    admin_condominio: "Admin Condominio",
    junta_directiva: "Junta Directiva",
    residente: "Residente",
    agente_inmobiliario: "Agente",
    gerente_crm: "Gerente CRM",
    guardia: "Guardia",
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-[#4A154B] text-[#F8FAFC]">
      <div className="px-5 py-6 flex items-center gap-2.5">
        <img src={logoUrl} alt="Residalia" width={36} height={36} className="w-9 h-9 drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]" />
        <div className="font-display font-extrabold text-xl leading-none">
          <span className="text-white">Residalia</span><span className="text-[#ffea5c]"> Cloud</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        <SidebarNav path={path} role={role} />
      </nav>

      <div className="border-t border-[#F8FAFC]/15 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-[#4A154B] text-white flex items-center justify-center font-semibold text-sm shrink-0">
            {initials(profile?.full_name || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{profile?.full_name || "Usuario"}</div>
            <div className="text-[11px] text-[#F8FAFC]/60 truncate">{role ? roleLabel[role] : ""}</div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            className="p-2 rounded-lg hover:bg-white/10 text-[#F8FAFC]/80 hover:text-white transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
