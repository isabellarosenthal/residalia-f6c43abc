import { useRouterState } from "@tanstack/react-router";
import { Bell, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/edificios": "Edificios y Condominios",
  "/residentes": "Residentes",
  "/finanzas": "Finanzas",
  "/accesos": "Control de Accesos",
  "/areas": "Áreas Comunes",
  "/comunicaciones": "Comunicaciones",
  "/mantenimiento": "Mantenimiento",
  "/propiedades": "Propiedades en Venta/Renta",
  "/prospectos": "Prospectos",
  "/pipeline": "Pipeline",
  "/agenda": "Agenda",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
};

export function Topbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useAuth();
  const title = Object.entries(titles).find(([k]) => path.startsWith(k))?.[1] ?? "";

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-widest text-[#64748B] font-semibold">Residalia</div>
        <div className="font-display font-bold text-[#0F172A] truncate">{title}</div>
      </div>
      <button className="hidden md:flex items-center gap-2 text-sm text-[#1E293B] px-3 py-1.5 rounded-full border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
        <Building2 className="w-4 h-4" />
        Todos los condominios
      </button>
      <button className="relative p-2 rounded-full hover:bg-[#F8FAFC]">
        <Bell className="w-5 h-5 text-[#1E293B]" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-[#be185d] rounded-full" />
      </button>
      <div className="w-9 h-9 rounded-full bg-[#4A154B] text-white flex items-center justify-center font-semibold text-sm">
        {initials(profile?.full_name || "U")}
      </div>
    </header>
  );
}
