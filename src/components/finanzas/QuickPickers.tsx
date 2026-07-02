import { Banknote, Landmark, CreditCard, FileText, Wallet, MoreHorizontal, type LucideIcon } from "lucide-react";

export const CONCEPTOS_RAPIDOS = ["Mantenimiento", "Agua", "Luz", "Cable/Internet", "Multa", "Otro"];

export function ConceptoRapidoButtons({ value, onPick }: { value?: string; onPick: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONCEPTOS_RAPIDOS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${
            value === c ? "bg-[#4A154B] text-white border-[#4A154B]" : "bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
          }`}
        >
          {c}
        </button>
      ))}
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
