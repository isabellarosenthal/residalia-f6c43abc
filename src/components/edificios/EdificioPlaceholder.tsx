import { Building2, Home } from "lucide-react";

const PALETTES = [
  { bg: "#c94f0c", fg: "#fff" },
  { bg: "#2d1200", fg: "#f5ede8" },
  { bg: "#f5e6de", fg: "#c94f0c" },
  { bg: "#a33d08", fg: "#fff" },
  { bg: "#4a2800", fg: "#f5ede8" },
];

export function EdificioPlaceholder({ id, tipo, className = "" }: { id: string; tipo?: string | null; className?: string }) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const p = PALETTES[hash % PALETTES.length];
  const Icon = tipo === "residencial" ? Home : Building2;
  return (
    <div className={`relative w-full flex items-center justify-center ${className}`} style={{ background: p.bg, color: p.fg }}>
      <Icon className="w-12 h-12 opacity-90" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,.4), transparent 50%)" }} />
    </div>
  );
}
