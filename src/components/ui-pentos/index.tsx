import { type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-[#e0e7ff] rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

export function KpiCard({
  icon, label, value, sub, accent = "primary",
}: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode; accent?: "primary" | "danger" | "success" | "neutral" }) {
  const accentMap = {
    primary: "text-[#818cf8]",
    danger: "text-[#be185d]",
    success: "text-[#166534]",
    neutral: "text-[#1e1b4b]",
  } as const;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-sm text-[#8b8bb5] font-medium">{label}</div>
        <div className={`w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center ${accentMap[accent]}`}>{icon}</div>
      </div>
      <div className={`mt-3 font-display font-extrabold text-3xl ${accentMap[accent]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-[#8b8bb5]">{sub}</div>}
    </Card>
  );
}

export function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: "success" | "danger" | "warning" | "neutral" | "venta" | "renta" | "reservada" }) {
  const map = {
    success: "bg-[#dcfce7] text-[#166534]",
    danger: "bg-[#fce7f3] text-[#be185d]",
    warning: "bg-[#ddd6fe] text-[#818cf8]",
    neutral: "bg-[#ede8e5] text-[#8b8bb5]",
    venta: "bg-[#818cf8] text-white",
    renta: "bg-[#1e1b4b] text-[#eef2ff]",
    reservada: "bg-[#eef2ff] text-[#312e81] border border-[#c7d2fe]",
  } as const;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[variant]}`}>{children}</span>;
}

export function EmptyState({ icon, title, hint, action }: { icon: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <Card className="p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#ddd6fe] text-[#818cf8] flex items-center justify-center mx-auto mb-4">{icon}</div>
      <div className="font-display font-bold text-lg text-[#1e1b4b]">{title}</div>
      {hint && <div className="text-sm text-[#8b8bb5] mt-1">{hint}</div>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
