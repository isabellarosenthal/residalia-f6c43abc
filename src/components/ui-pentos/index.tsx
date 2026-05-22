import { type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-[#e8ddd8] rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

export function KpiCard({
  icon, label, value, sub, accent = "primary",
}: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode; accent?: "primary" | "danger" | "success" | "neutral" }) {
  const accentMap = {
    primary: "text-[#c94f0c]",
    danger: "text-[#c0392b]",
    success: "text-[#2d6a2d]",
    neutral: "text-[#2d1200]",
  } as const;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-sm text-[#9a7060] font-medium">{label}</div>
        <div className={`w-9 h-9 rounded-xl bg-[#f5ede8] flex items-center justify-center ${accentMap[accent]}`}>{icon}</div>
      </div>
      <div className={`mt-3 font-display font-extrabold text-3xl ${accentMap[accent]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-[#9a7060]">{sub}</div>}
    </Card>
  );
}

export function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: "success" | "danger" | "warning" | "neutral" | "venta" | "renta" | "reservada" }) {
  const map = {
    success: "bg-[#e8f5e8] text-[#2d6a2d]",
    danger: "bg-[#fdecea] text-[#c0392b]",
    warning: "bg-[#f5e6de] text-[#c94f0c]",
    neutral: "bg-[#ede8e5] text-[#9a7060]",
    venta: "bg-[#c94f0c] text-white",
    renta: "bg-[#2d1200] text-[#f5ede8]",
    reservada: "bg-[#f5ede8] text-[#4a2800] border border-[#c9b8b0]",
  } as const;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[variant]}`}>{children}</span>;
}

export function EmptyState({ icon, title, hint, action }: { icon: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <Card className="p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#f5e6de] text-[#c94f0c] flex items-center justify-center mx-auto mb-4">{icon}</div>
      <div className="font-display font-bold text-lg text-[#2d1200]">{title}</div>
      {hint && <div className="text-sm text-[#9a7060] mt-1">{hint}</div>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
