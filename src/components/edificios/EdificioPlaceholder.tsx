import { Building2, Home } from "lucide-react";

const PALETTES = [
  { bg: "linear-gradient(135deg,#EBC988,#ffea5c)", fg: "#fff" },
  { bg: "linear-gradient(135deg,#FAF1DC,#D9A441)", fg: "#fff" },
  { bg: "linear-gradient(135deg,#F8FAFC,#EBC988)", fg: "#0f2659" },
  { bg: "linear-gradient(135deg,#ffea5c,#e6c200)", fg: "#fff" },
  { bg: "linear-gradient(135deg,#fbcfe8,#EBC988)", fg: "#0f2659" },
];

export function EdificioPlaceholder({ id, tipo, className = "" }: { id: string; tipo?: string | null; className?: string }) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const p = PALETTES[hash % PALETTES.length];
  const Icon = tipo === "residencial" ? Home : Building2;
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ background: p.bg, color: p.fg }}>
      <Icon className="w-5 h-5 opacity-90" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,.5), transparent 50%)" }} />
    </div>
  );
}
