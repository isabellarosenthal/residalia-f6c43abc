import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";
import { EdificioFilterSelect } from "./EdificioFilterSelect";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";
import logoUrl from "@/assets/residalia-logo.png";
import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/edificios": "Edificios y Condominios",
  "/residentes": "Residentes",
  "/finanzas": "Finanzas",
  "/accesos": "Control de Accesos",
  "/areas": "Áreas Comunes",
  "/mantenimiento": "Mantenimiento",
  "/propiedades": "Propiedades en Venta/Renta",
  "/prospectos": "Prospectos",
  "/pipeline": "Pipeline",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
  "/admin-panel": "Admin Panel",
};

export function Topbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const title = Object.entries(titles).find(([k]) => path.startsWith(k))?.[1] ?? "";

  return (
    <>
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-20">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-[#F8FAFC] text-[#1E293B]"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-[#64748B] font-semibold">Residalia</div>
          <div className="font-display font-bold text-[#0F172A] truncate">{title}</div>
        </div>

        <EdificioFilterSelect compact className="hidden sm:flex h-9 max-w-[220px]" />

        <Link to="/configuracion" className="p-2 rounded-full hover:bg-[#F8FAFC]" title="Configuración y plan">
          <Settings className="w-5 h-5 text-[#1E293B]" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-[#4A154B] text-white flex items-center justify-center font-semibold text-sm shrink-0">
          {initials(profile?.full_name || "U")}
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-[#4A154B] text-[#F8FAFC] border-none">
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <div className="px-5 py-6 flex items-center gap-2.5">
            <img src={logoUrl} alt="Residalia" width={36} height={36} className="w-9 h-9" />
            <div className="font-display font-extrabold text-xl leading-none">
              <span className="text-white">Residalia</span><span className="text-[#ffea5c]"> Cloud</span>
            </div>
          </div>
          <div className="px-4 pb-3 sm:hidden">
            <EdificioFilterSelect className="w-full bg-white/10 border-white/20 text-white" />
          </div>
          <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5 max-h-[calc(100vh-180px)]">
            <SidebarNav path={path} role={role} onNavigate={() => setMenuOpen(false)} />
          </nav>
          <div className="border-t border-[#F8FAFC]/15 p-3">
            <button
              onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#F8FAFC]/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
