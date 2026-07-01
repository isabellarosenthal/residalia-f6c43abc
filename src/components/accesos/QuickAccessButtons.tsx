import { ShoppingBag, UtensilsCrossed, Bike, Car, Pill, Package, Flame, type LucideIcon } from "lucide-react";

export type QuickService = {
  key: string;
  label: string;
  tipo: "delivery" | "transporte";
  minutos: number;
  icon: LucideIcon;
  color: string; // text/icon color
  bg: string;    // tile bg
  border: string;
};

export const QUICK_SERVICES: QuickService[] = [
  { key: "rappi",     label: "Rappi",     tipo: "delivery",   minutos: 15, icon: ShoppingBag,     color: "#ff6b35", bg: "#fff1ea", border: "#ffc7a8" },
  { key: "ubereats",  label: "Uber Eats", tipo: "delivery",   minutos: 15, icon: UtensilsCrossed, color: "#0a9d57", bg: "#e6f7ee", border: "#a8e6c5" },
  { key: "pedidosya", label: "PedidosYa", tipo: "delivery",   minutos: 15, icon: Bike,            color: "#e11d48", bg: "#ffe9ee", border: "#ffb8c8" },
  { key: "uber",      label: "Uber",      tipo: "transporte", minutos: 20, icon: Car,             color: "#0f172a", bg: "#e8eef7", border: "#b8c8e6" },
  { key: "didi",      label: "DiDi",      tipo: "transporte", minutos: 20, icon: Car,             color: "#f59e0b", bg: "#fff6e0", border: "#ffd980" },
  { key: "indriver",  label: "InDriver",  tipo: "transporte", minutos: 20, icon: Car,             color: "#16a34a", bg: "#e8f7ee", border: "#a8e6c5" },
];

// Usado solo en Control de Accesos (admin) — no afecta el portal del residente.
export const ADMIN_QUICK_SERVICES: QuickService[] = [
  { key: "pedidosya",     label: "PedidosYa",      tipo: "delivery",   minutos: 15, icon: Bike,    color: "#e11d48", bg: "#ffe9ee", border: "#ffb8c8" },
  { key: "uber",          label: "Uber",           tipo: "transporte", minutos: 20, icon: Car,     color: "#0f172a", bg: "#e8eef7", border: "#b8c8e6" },
  { key: "indriver",      label: "InDriver",       tipo: "transporte", minutos: 20, icon: Car,     color: "#16a34a", bg: "#e8f7ee", border: "#a8e6c5" },
  { key: "farmaciakielsa", label: "Farmacia Kielsa", tipo: "delivery", minutos: 15, icon: Pill,     color: "#0369a1", bg: "#e0f2fe", border: "#93c5fd" },
  { key: "mensajeria",    label: "Mensajería",      tipo: "delivery", minutos: 15, icon: Package,  color: "#7c3aed", bg: "#f3e8ff", border: "#d8b4fe" },
  { key: "gas",           label: "Gas",             tipo: "delivery", minutos: 20, icon: Flame,    color: "#ea580c", bg: "#fff0e5", border: "#ffc79e" },
];

export function QuickAccessGrid({
  services = QUICK_SERVICES,
  onPick,
  disabled,
  columns = 4,
}: {
  services?: QuickService[];
  onPick: (s: QuickService) => void;
  disabled?: boolean;
  columns?: 3 | 4 | 6;
}) {
  const cols = columns === 3 ? "grid-cols-3" : columns === 6 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-4";
  return (
    <div className={`grid ${cols} gap-2`}>
      {services.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.key}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl border transition active:scale-95 disabled:opacity-50 hover:shadow-sm"
            style={{ backgroundColor: s.bg, borderColor: s.border }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/70">
              <Icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <span className="text-[11px] font-semibold text-[#0F172A] leading-tight">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
