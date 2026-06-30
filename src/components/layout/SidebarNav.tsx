import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Building2, Users, Wallet, KeyRound, CalendarRange,
  Wrench, Tag, UserPlus, Kanban, BarChart3, Shield, Settings,
} from "lucide-react";
import type { AppRole } from "@/lib/auth-context";

export type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  roles?: AppRole[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
  roles?: AppRole[];
};

const ADMIN_ROLES: AppRole[] = ["super_admin", "admin_condominio", "junta_directiva"];
const CRM_ROLES: AppRole[] = ["super_admin", "admin_condominio", "agente_inmobiliario", "gerente_crm"];

export const navSections: NavSection[] = [
  {
    label: "Administración",
    roles: [...ADMIN_ROLES, "agente_inmobiliario", "gerente_crm"],
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: [...ADMIN_ROLES, "agente_inmobiliario", "gerente_crm"] },
      { to: "/edificios", icon: Building2, label: "Edificios y Condominios", roles: [...ADMIN_ROLES, "agente_inmobiliario", "gerente_crm"] },
      { to: "/residentes", icon: Users, label: "Residentes", roles: ADMIN_ROLES },
      { to: "/finanzas", icon: Wallet, label: "Finanzas", roles: ADMIN_ROLES },
      { to: "/accesos", icon: KeyRound, label: "Control de Accesos", roles: ADMIN_ROLES },
      { to: "/areas", icon: CalendarRange, label: "Áreas Comunes", roles: ADMIN_ROLES },
      { to: "/mantenimiento", icon: Wrench, label: "Mantenimiento", roles: ADMIN_ROLES },
    ],
  },
  {
    label: "Comercial",
    roles: CRM_ROLES,
    items: [
      { to: "/propiedades", icon: Tag, label: "Propiedades" },
      { to: "/prospectos", icon: UserPlus, label: "Prospectos" },
      { to: "/pipeline", icon: Kanban, label: "Pipeline" },
    ],
  },
  {
    label: "General",
    roles: [...ADMIN_ROLES, "agente_inmobiliario", "gerente_crm"],
    items: [
      { to: "/reportes", icon: BarChart3, label: "Reportes" },
      { to: "/configuracion", icon: Settings, label: "Configuración", roles: [...ADMIN_ROLES, "agente_inmobiliario", "gerente_crm"] },
    ],
  },
];

function itemVisible(item: NavItem, role: AppRole | null) {
  if (!role) return false;
  if (!item.roles) return true;
  return item.roles.includes(role);
}

function sectionVisible(section: NavSection, role: AppRole | null) {
  if (!role) return false;
  if (section.roles && !section.roles.includes(role)) return false;
  return section.items.some((it) => itemVisible(it, role));
}

export function getVisibleSections(role: AppRole | null) {
  return navSections
    .filter((sec) => sectionVisible(sec, role))
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((it) => itemVisible(it, role)),
    }))
    .filter((sec) => sec.items.length > 0);
}

type SidebarNavProps = {
  path: string;
  role: AppRole | null;
  onNavigate?: () => void;
};

export function SidebarNav({ path, role, onNavigate }: SidebarNavProps) {
  const sections = getVisibleSections(role);

  return (
    <>
      {role === "super_admin" && (
        <div>
          <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-[#F8FAFC]/50 font-semibold">
            Plataforma
          </div>
          <div className="space-y-0.5">
            <Link
              to="/admin-panel"
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                path.startsWith("/admin-panel")
                  ? "bg-[#611f69] text-white font-semibold"
                  : "text-[#F8FAFC] hover:bg-white/10"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span className="truncate">Admin Panel</span>
            </Link>
          </div>
        </div>
      )}
      {sections.map((sec) => (
        <div key={sec.label}>
          <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-[#F8FAFC]/50 font-semibold">
            {sec.label}
          </div>
          <div className="space-y-0.5">
            {sec.items.map((it) => {
              const active = path.startsWith(it.to);
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? "bg-[#611f69] text-white font-semibold" : "text-[#F8FAFC] hover:bg-white/10"
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
    </>
  );
}
