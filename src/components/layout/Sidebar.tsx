import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";
import {
  LayoutDashboard, Building2, Users, Wallet, KeyRound, CalendarRange,
  Megaphone, Wrench, Tag, UserPlus, Kanban, CalendarDays,
  BarChart3, Settings, LogOut, Building,
} from "lucide-react";

const sections = [
  {
    label: "Administración",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/edificios", icon: Building2, label: "Edificios y Condominios" },
      { to: "/residentes", icon: Users, label: "Residentes" },
      { to: "/finanzas", icon: Wallet, label: "Finanzas" },
      { to: "/accesos", icon: KeyRound, label: "Control de Accesos" },
      { to: "/areas", icon: CalendarRange, label: "Áreas Comunes" },
      { to: "/comunicaciones", icon: Megaphone, label: "Comunicaciones" },
      { to: "/mantenimiento", icon: Wrench, label: "Mantenimiento" },
    ],
  },
  {
    label: "Comercial",
    items: [
      { to: "/propiedades", icon: Tag, label: "Propiedades en Venta/Renta" },
      { to: "/prospectos", icon: UserPlus, label: "Prospectos" },
      { to: "/pipeline", icon: Kanban, label: "Pipeline" },
      { to: "/agenda", icon: CalendarDays, label: "Agenda" },
    ],
  },
  {
    label: "General",
    items: [
      { to: "/reportes", icon: BarChart3, label: "Reportes" },
      { to: "/configuracion", icon: Settings, label: "Configuración" },
    ],
  },
];

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
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-[#2d1200] text-[#f5ede8]">
      <div className="px-5 py-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-[#c94f0c] flex items-center justify-center">
          <Building className="w-5 h-5 text-white" />
        </div>
        <div className="font-display font-extrabold text-xl leading-none">
          <span className="text-white">Habita</span><span className="text-[#c94f0c]">Cloud</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {sections.map((sec) => (
          <div key={sec.label}>
            <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-[#f5ede8]/50 font-semibold">
              {sec.label}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((it) => {
                const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
                const Icon = it.icon;
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active ? "bg-[#c94f0c] text-white font-semibold" : "text-[#f5ede8] hover:bg-[#c94f0c]/15"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#f5ede8]/15 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-[#c94f0c] text-white flex items-center justify-center font-semibold text-sm shrink-0">
            {initials(profile?.full_name || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{profile?.full_name || "Usuario"}</div>
            <div className="text-[11px] text-[#f5ede8]/60 truncate">{role ? roleLabel[role] : ""}</div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            className="p-2 rounded-lg hover:bg-[#c94f0c]/20 text-[#f5ede8]/80 hover:text-white transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
