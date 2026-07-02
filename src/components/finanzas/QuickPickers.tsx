import { Banknote, Landmark, CreditCard, FileText, Wallet, MoreHorizontal, Wrench, Droplet, Zap, Wifi, TriangleAlert, type LucideIcon } from "lucide-react";

type ConceptoRapido = { label: string; icon: LucideIcon; color: string; bg: string; border: string };

const CONCEPTOS: ConceptoRapido[] = [
  { label: "Mantenimiento", icon: Wrench, color: "#4A154B", bg: "#f3e8ff", border: "#d8b4fe" },
  { label: "Agua", icon: Droplet, color: "#0369a1", bg: "#e0f2fe", border: "#93c5fd" },
  { label: "Luz", icon: Zap, color: "#b45309", bg: "#fff6e0", border: "#ffd980" },
  { label: "Cable/Internet", icon: Wifi, color: "#0a9d57", bg: "#e6f7ee", border: "#a8e6c5" },
  { label: "Multa", icon: TriangleAlert, color: "#be185d", bg: "#ffe9ee", border: "#ffb8c8" },
  { label: "Otro", icon: MoreHorizontal, color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
];

export const CONCEPTOS_RAPIDOS = CONCEPTOS.map((c) => c.label);

export function ConceptoRapidoButtons({ value, onPick }: { value?: string; onPick: (c: string) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {CONCEPTOS.map((c) => {
        const Icon = c.icon;
        const active = value === c.label;
        return (
          <button
            key={c.label}
            type="button"
            onClick={() => onPick(c.label)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition active:scale-95 hover:shadow-sm ${active ? "ring-2 ring-offset-1 ring-[#4A154B]" : ""}`}
            style={{ backgroundColor: c.bg, borderColor: c.border }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/70">
              <Icon className="w-4.5 h-4.5" style={{ color: c.color }} />
            </div>
            <span className="text-[11px] font-semibold text-[#0F172A] leading-tight text-center">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const METODOS_PAGO: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "efectivo", label: "Efectivo", icon: Banknote },
  { value: "transferencia", label: "Transferencia", icon: Landmark },
  { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { value: "cheque", label: "Cheque", icon: FileText },
  { value: "depósito", label: "Depósito", icon: Wallet },
  { value: "otro", label: "Otro", icon: MoreHorizontal },
];

export function MetodoPagoButtons({
  value, onChange, allowNone,
}: { value: string; onChange: (v: string) => void; allowNone?: boolean }) {
  const opts = allowNone ? [{ value: "", label: "—", icon: MoreHorizontal }, ...METODOS_PAGO] : METODOS_PAGO;
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((m) => {
        const Icon = m.icon;
        const active = value === m.value;
        return (
          <button
            key={m.value || "none"}
            type="button"
            onClick={() => onChange(m.value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition ${
              active ? "bg-[#4A154B] text-white border-[#4A154B]" : "bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function MesPicker({
  year, month, onChange,
}: { year: number; month: number; onChange: (year: number, month: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-2">
        <button type="button" onClick={() => onChange(year - 1, month)} className="w-7 h-7 rounded-md hover:bg-[#F8FAFC] text-[#4A154B] font-bold">‹</button>
        <div className="font-semibold text-[#0F172A] w-14 text-center">{year}</div>
        <button type="button" onClick={() => onChange(year + 1, month)} className="w-7 h-7 rounded-md hover:bg-[#F8FAFC] text-[#4A154B] font-bold">›</button>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {MESES_CORTOS.map((m, i) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(year, i)}
            className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition ${
              month === i ? "bg-[#4A154B] text-white border-[#4A154B]" : "bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
